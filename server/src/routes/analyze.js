import { Router } from 'express';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { z } from 'zod';
import { upload } from '../middleware/upload.js';
import { chat } from '../openaiClient.js';
import { parseModelJson } from '../utils/aiJson.js';

const router = Router();

// ── Input validation ────────────────────────────────────────────────────────
const textSchema = z.object({
  text: z.string().min(50, 'Please provide at least 50 characters of text.').max(15000),
});

const analyzeResultSchema = z.object({
  summary: z.string().min(20),
  keyConcepts: z.array(
    z.object({
      term: z.string().min(1),
      definition: z.string().min(1),
    }),
  ).min(1),
  quiz: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(z.string().min(1)).min(2),
      answer: z.string().min(1),
    }),
  ).min(1),
});

// ── Prompt builders ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert educational AI assistant.
Your responses are always structured as valid JSON — no markdown fences, no extra commentary.`;

function buildAnalyzePrompt(text) {
  return `Analyze the following learning material and respond ONLY with a JSON object in this exact shape:
{
  "summary": "2-4 sentence overview of the main topic",
  "keyConcepts": [
    { "term": "Concept Name", "definition": "Clear, concise definition" }
  ],
  "quiz": [
    {
      "question": "Question text?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A) ..."
    }
  ]
}

Rules:
- summary: 2-4 informative sentences, no fluff
- keyConcepts: 3-5 most important terms with clear definitions
- quiz: exactly 3 multiple-choice questions covering key ideas
- answer must match one of the options exactly

Learning material:
"""
${text.substring(0, 4000)}
"""`;
}

// ── POST /api/analyze  (text body) ───────────────────────────────────────────
router.post('/', async (req, res, next) => {
  const requestStart = Date.now();
  try {
    const { text } = textSchema.parse(req.body);
    console.log(`[analyze:text] start len=${text.length}`);

    const llmStart = Date.now();
    const raw = await chat(SYSTEM_PROMPT, buildAnalyzePrompt(text), 'gpt-4o-mini', {
      temperature: 0.2,
      num_predict: 520,
    });
    const llmMs = Date.now() - llmStart;

    const parseStart = Date.now();
    const result = analyzeResultSchema.parse(parseModelJson(raw, 'analysis result'));
    const parseMs = Date.now() - parseStart;
    const totalMs = Date.now() - requestStart;

    console.log(`[analyze:text] ok llmMs=${llmMs} parseMs=${parseMs} totalMs=${totalMs}`);
    res.json({ success: true, data: result });
  } catch (err) {
    const totalMs = Date.now() - requestStart;
    console.error(`[analyze:text] failed totalMs=${totalMs} error=${err.message}`);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message || 'Invalid analyze request.' });
    }
    next(err);
  }
});

// ── POST /api/analyze/pdf  (multipart/form-data) ─────────────────────────────
router.post('/pdf', upload.single('pdf'), async (req, res, next) => {
  const requestStart = Date.now();
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file received.' });
  }

  try {
    console.log(`[analyze:pdf] start file=${req.file.originalname} size=${req.file.size}`);

    const pdfStart = Date.now();
    const buffer = fs.readFileSync(req.file.path);
    const { text } = await pdfParse(buffer);
    const pdfMs = Date.now() - pdfStart;

    // Clean up uploaded file after parsing
    fs.unlink(req.file.path, () => {});

    if (!text || text.trim().length < 50) {
      return res.status(422).json({ error: 'PDF appears to have no extractable text (possibly scanned). Try copy-pasting the text instead.' });
    }

    const llmStart = Date.now();
    const raw = await chat(SYSTEM_PROMPT, buildAnalyzePrompt(text), 'gpt-4o-mini', {
      temperature: 0.2,
      num_predict: 520,
    });
    const llmMs = Date.now() - llmStart;

    const parseStart = Date.now();
    const result = analyzeResultSchema.parse(parseModelJson(raw, 'analysis result'));
    const parseMs = Date.now() - parseStart;
    const totalMs = Date.now() - requestStart;

    console.log(`[analyze:pdf] ok pdfMs=${pdfMs} llmMs=${llmMs} parseMs=${parseMs} totalMs=${totalMs}`);
    res.json({ success: true, data: result });
  } catch (err) {
    const totalMs = Date.now() - requestStart;
    console.error(`[analyze:pdf] failed totalMs=${totalMs} error=${err.message}`);
    // Make sure we clean up even on error
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(err);
  }
});

export default router;
