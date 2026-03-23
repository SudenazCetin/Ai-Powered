import { Router } from 'express';
import dayjs from 'dayjs';
import { z } from 'zod';
import { chat } from '../openaiClient.js';
import { parseModelJson } from '../utils/aiJson.js';

const router = Router();

const planSchema = z.object({
  topic: z.string().min(3).max(200),
  keyConcepts: z.array(z.string()).min(1).max(20),
  durationDays: z.number().int().min(1).max(30).default(5),
  dailyHours: z.number().min(0.5).max(12).default(2),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
});

const studyPlanResultSchema = z.object({
  title: z.string().min(3),
  overview: z.string().min(10),
  days: z.array(
    z.object({
      day: z.number().int().min(1),
      date: z.string().min(8),
      theme: z.string().min(2),
      goals: z.array(z.string().min(2)).min(1),
      tasks: z.array(
        z.object({
          time: z.string().min(1),
          activity: z.string().min(2),
          resource: z.string().optional(),
        }),
      ).min(1),
      duration: z.string().min(1),
    }),
  ).min(1),
  tips: z.array(z.string().min(2)).min(1),
});

const SYSTEM_PROMPT = `You are an expert learning coach and curriculum designer.
Respond ONLY with valid JSON — no markdown, no extra text.`;

function buildPlanPrompt({ topic, keyConcepts, durationDays, dailyHours, level }) {
  const startDate = dayjs().format('YYYY-MM-DD');
  return `Create a ${durationDays}-day personalized study plan for the topic below.
Respond ONLY with a JSON object in this exact shape:
{
  "title": "Study Plan: <topic>",
  "overview": "2-3 sentence summary of the learning journey",
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "theme": "Short theme name",
      "goals": ["Goal 1", "Goal 2"],
      "tasks": [
        { "time": "09:00–10:00", "activity": "Description", "resource": "Optional resource hint" }
      ],
      "duration": "${dailyHours}h"
    }
  ],
  "tips": ["Motivational / practical tip 1", "tip 2", "tip 3"]
}

Rules:
- Produce exactly ${durationDays} day objects, dates starting from ${startDate}
- Each day has 2-3 tasks fitting within ${dailyHours} hours
- Tailor difficulty to a ${level} learner
- Distribute the key concepts across the days logically
- tips: 3 actionable study tips

Topic: ${topic}
Key concepts to cover: ${keyConcepts.join(', ')}
Learner level: ${level}`;
}

// ── POST /api/plan ────────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  const requestStart = Date.now();
  try {
    const params = planSchema.parse({
      ...req.body,
      durationDays: Number(req.body.durationDays ?? 5),
      dailyHours: Number(req.body.dailyHours ?? 2),
    });
    console.log(
      `[plan] start topic=${params.topic.slice(0, 60)} concepts=${params.keyConcepts.length} days=${params.durationDays} hours=${params.dailyHours}`,
    );

    const llmStart = Date.now();
    const raw = await chat(SYSTEM_PROMPT, buildPlanPrompt(params), 'gpt-4o-mini', {
      temperature: 0.2,
      num_predict: 650,
    });
    const llmMs = Date.now() - llmStart;

    const parseStart = Date.now();
    const plan = studyPlanResultSchema.parse(parseModelJson(raw, 'study plan'));
    const parseMs = Date.now() - parseStart;
    const totalMs = Date.now() - requestStart;

    console.log(`[plan] ok llmMs=${llmMs} parseMs=${parseMs} totalMs=${totalMs}`);
    res.json({ success: true, data: plan });
  } catch (err) {
    const totalMs = Date.now() - requestStart;
    console.error(`[plan] failed totalMs=${totalMs} error=${err.message}`);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message || 'Invalid study plan request.' });
    }
    next(err);
  }
});

export default router;
