// localStorage helpers for session history

const KEY = 'slpa_history';

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSession(session) {
  const history = getHistory();
  history.unshift({ ...session, id: Date.now(), savedAt: new Date().toISOString() });
  // Keep only last 20 sessions
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 20)));
}

export function deleteSession(id) {
  const updated = getHistory().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
