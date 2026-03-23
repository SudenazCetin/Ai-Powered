function stripCodeFences(text) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

export function parseModelJson(raw, label = 'response') {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(`AI returned an empty ${label}.`);
  }

  const cleaned = stripCodeFences(raw);

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }

    throw new Error(`AI returned invalid JSON for ${label}.`);
  }
}