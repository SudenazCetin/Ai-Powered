// Centralized API helpers — all calls go through Vite's proxy (/api → :5000)

const BASE = '/api';
const REQUEST_TIMEOUT_MS = 600000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. The model may be busy; please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const raw = await res.text();

  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      if (!res.ok) {
        throw new Error(raw.slice(0, 200) || `Request failed: ${res.status}`);
      }
      throw new Error('Server returned an invalid JSON response.');
    }
  }

  if (!res.ok) {
    throw new Error(payload?.error || `Request failed: ${res.status}`);
  }

  if (!payload) {
    throw new Error('Server returned an empty response.');
  }

  return payload.data;
}

/** Analyze plain text */
export async function analyzeText(text) {
  return request('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

/** Analyze a PDF file (File object) */
export async function analyzePDF(file) {
  const formData = new FormData();
  formData.append('pdf', file);
  return request('/analyze/pdf', { method: 'POST', body: formData });
}

/** Generate a personalized study plan */
export async function generatePlan({ topic, keyConcepts, durationDays = 7, dailyHours = 2, level = 'intermediate' }) {
  return request('/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, keyConcepts, durationDays, dailyHours, level }),
  });
}
