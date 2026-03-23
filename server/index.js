import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import analyzeRouter from './src/routes/analyze.js';
import planRouter from './src/routes/plan.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Smart Learning Assistant API',
    status: 'ok',
    endpoints: ['/api/health', '/api/analyze', '/api/analyze/pdf', '/api/plan'],
  });
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/analyze', analyzeRouter);
app.use('/api/plan', planRouter);

app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: ['GET /', 'GET /api/health', 'POST /api/analyze', 'POST /api/analyze/pdf', 'POST /api/plan'],
  });
});

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `[config] OLLAMA_MODEL=${process.env.OLLAMA_MODEL || 'qwen2.5:7b'} OLLAMA_TIMEOUT_MS=${process.env.OLLAMA_TIMEOUT_MS || '600000'}`,
  );
});
