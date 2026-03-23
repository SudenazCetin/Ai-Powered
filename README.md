# AI-Powered Smart Learning & Productivity Assistant

A full-stack AI app that turns any text or PDF into summaries, key concepts, quiz questions, and a personalized daily study plan — all in one clean, modern interface.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js 20 + Express 5 |
| AI | Ollama (local model, no paid API required) |
| PDF Parsing | `pdf-parse` |
| Dev runner | `concurrently` |

---

## Folder Structure

```
ai-smart-learning/
├── client/                 ← React frontend
│   ├── src/
│   │   ├── api/            ← Axios API helpers
│   │   ├── components/     ← All UI components
│   │   ├── hooks/          ← Custom React hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js      ← Proxy → Express :5000
├── server/                 ← Express backend
│   ├── src/
│   │   ├── routes/         ← /api/analyze, /api/plan, /api/history
│   │   └── middleware/     ← Upload + error handlers
│   └── index.js
└── package.json            ← Root scripts (concurrently)
```

---

## Quick Start

### 1. Clone & install
```bash
git clone <repo-url> ai-smart-learning
cd ai-smart-learning
npm install          # installs root devDeps (concurrently)
npm run install:all  # installs client + server deps
```

### 2. Install and run Ollama (one-time)
```bash
# Install from https://ollama.com/download
ollama pull qwen2.5:7b
```

### 3. Configure environment
```bash
cp server/.env.example server/.env
# Optional: change OLLAMA_MODEL if you pulled a different model
```

### 4. Run in development
```bash
npm run dev
# Client → http://localhost:5173
# Server → http://localhost:5000
```

---

## Features

- **Text Input** — paste any text directly
- **PDF Upload** — drag-and-drop or click to upload a PDF
- **AI Summary** — concise 3–5 sentence overview
- **Key Concepts** — bullet list of core ideas
- **Quiz Questions** — 5 multiple-choice questions with answers
- **Study Plan** — personalized daily schedule
- **History** — saved sessions stored in localStorage

---

## Environment Variables (`server/.env`)

| Variable | Description |
|----------|-------------|
| `OLLAMA_BASE_URL` | Ollama API URL (default: `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | Local model name (example: `qwen2.5:7b`) |
| `OLLAMA_TIMEOUT_MS` | Request timeout for Ollama calls in milliseconds (default: `600000`) |
| `OLLAMA_NUM_PREDICT` | Max generated tokens per request (default: `650`) |
| `OLLAMA_NUM_CTX` | Context window size sent to Ollama (default: `2048`) |
| `OLLAMA_KEEP_ALIVE` | Keep model loaded in memory between requests (default: `30m`) |
| `PORT` | Server port (default: 5000) |
| `MAX_FILE_SIZE_MB` | Max PDF upload size in MB (default: 10) |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Analyze text — returns summary, concepts, quiz |
| POST | `/api/plan` | Generate personalized study plan |
| GET | `/api/history` | (Optional) Retrieve history from server |

---

## Advanced Ideas (Bonus)
- Add user authentication (JWT)
- Swap localStorage for MongoDB
- Add speech-to-text input
- Export study plan as PDF
- Add a progress tracker / streak counter

---

## Troubleshooting

### Ollama request failed (404): model not found

1. Verify Ollama is installed and available in terminal:
```bash
ollama --version
```

2. List installed models:
```bash
ollama list
```

3. Pull the configured model (default):
```bash
ollama pull qwen2.5:7b
```

4. If you want to use a different model, update `server/.env`:
```env
OLLAMA_MODEL=<your-installed-model>
```

5. Restart the backend server after changing `.env`.
