# AI-Powered Smart Learning & Productivity Assistant

A full-stack AI app that turns text or PDF content into summaries, key concepts, quiz questions, and a personalized study plan using a local Ollama model.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Node.js 20 + Express 5 |
| AI | Ollama |
| Validation | Zod |
| PDF Parsing | pdf-parse |
| Dev runner | concurrently |

## Project Structure

```text
Aı-Powered/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   └── index.js
├── package.json
└── README.md
```

## Quick Start

### 1. Install dependencies

```bash
npm install
npm run install:all
```

### 2. Install Ollama and pull a model

Install Ollama from https://ollama.com/download, then pull the recommended model:

```bash
ollama pull qwen2.5:1.5b
```

`qwen2.5:1.5b` is the recommended default for lower-end machines because it responds much faster than `qwen2.5:7b`.

### 3. Create the server environment file

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

On macOS or Linux:

```bash
cp server/.env.example server/.env
```

### 4. Start the app

```bash
npm run dev
```

Expected local URLs:

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

If port `5173` is busy, Vite may choose `5174`, `5175`, or another nearby port.

## Features

- Analyze pasted text
- Upload and analyze PDF files
- Generate a short summary
- Extract key concepts
- Generate quiz questions
- Create a multi-day study plan
- Keep recent results in the frontend session history

## Environment Variables

The backend reads `server/.env` using an absolute path, so it works even when the process is started from a different working directory.

| Variable | Description |
|----------|-------------|
| `OLLAMA_BASE_URL` | Ollama API URL, usually `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Installed local model name, recommended: `qwen2.5:1.5b` |
| `OLLAMA_TIMEOUT_MS` | Timeout for Ollama requests |
| `OLLAMA_NUM_PREDICT` | Maximum generated tokens |
| `OLLAMA_NUM_CTX` | Context window passed to Ollama |
| `OLLAMA_KEEP_ALIVE` | Keeps the model warm between requests |
| `PORT` | Express server port |
| `MAX_FILE_SIZE_MB` | Maximum PDF upload size |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info and available endpoints |
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | Analyze text and return summary, concepts, and quiz |
| POST | `/api/analyze/pdf` | Analyze uploaded PDF content |
| POST | `/api/plan` | Generate a study plan |

## Current Behavior Notes

- Analysis results appear before the study plan is finished generating.
- Planning runs as a separate phase in the UI.
- Smaller Ollama models may return fewer quiz items or concepts than requested, and the backend now accepts partial valid results instead of failing the whole request.

## Troubleshooting

### Model not found

```bash
ollama list
ollama pull qwen2.5:1.5b
```

If you change the model name in `server/.env`, restart the backend.

### Backend works but the browser shows `Cannot GET /`

Open the frontend URL, not the backend root URL. The backend root returns API metadata as JSON, while the React app runs through Vite on port `5173` or another Vite port.

### Requests are too slow

- Prefer `qwen2.5:1.5b` over `qwen2.5:7b` on CPU-only machines.
- Keep `OLLAMA_TIMEOUT_MS` high enough for your hardware.
- Close other heavy apps if Ollama responses are taking several minutes.
