function getOllamaConfig() {
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 600000);
  const numPredict = Number(process.env.OLLAMA_NUM_PREDICT || 700);
  const numCtx = Number(process.env.OLLAMA_NUM_CTX || 2048);
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 600000,
    keepAlive: process.env.OLLAMA_KEEP_ALIVE || '20m',
    numPredict: Number.isFinite(numPredict) && numPredict > 0 ? numPredict : 700,
    numCtx: Number.isFinite(numCtx) && numCtx > 0 ? numCtx : 2048,
  };
}

async function listInstalledModels(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const models = payload?.models;
    if (!Array.isArray(models)) {
      return [];
    }

    return models
      .map((item) => item?.name)
      .filter((name) => typeof name === 'string' && name.trim().length > 0);
  } catch {
    return [];
  }
}

/**
 * Send a chat completion request and return the text content.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {string} [model]
 * @param {{ temperature?: number, num_predict?: number, num_ctx?: number }} [generationOptions]
 * @returns {Promise<string>}
 */
export async function chat(systemPrompt, userPrompt, model = 'gpt-4o-mini', generationOptions = {}) {
  const { baseUrl, model: envModel, timeoutMs, keepAlive, numPredict, numCtx } = getOllamaConfig();
  const selectedModel = model === 'gpt-4o-mini' ? envModel : model;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const options = {
    temperature: 0.2,
    num_predict: numPredict,
    num_ctx: numCtx,
    ...generationOptions,
  };

  let response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        format: 'json',
        keep_alive: keepAlive,
        options,
      }),
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(
        `Ollama request timed out after ${timeoutMs}ms. Try again, reduce input size, or increase OLLAMA_TIMEOUT_MS in server/.env.`,
      );
    }
    throw new Error(
      `Cannot connect to Ollama at ${baseUrl}. Install/start Ollama and ensure the service is running. Original error: ${err.message}`,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text();

    if (response.status === 404 && body.toLowerCase().includes('model')) {
      const installedModels = await listInstalledModels(baseUrl);
      const installedText = installedModels.length
        ? installedModels.join(', ')
        : '(could not detect installed models)';

      throw new Error(
        `Ollama model not found: "${selectedModel}". Installed models: ${installedText}. ` +
          `Run "ollama pull ${selectedModel}" or update OLLAMA_MODEL in server/.env.`,
      );
    }

    throw new Error(`Ollama request failed (${response.status}): ${body || 'Unknown error'}`);
  }

  const payload = await response.json();
  const content = payload?.message?.content;

  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  throw new Error('Ollama returned an empty response. Is the model installed?');
}
