import { useState, useEffect } from 'react';
import { getHistory, deleteSession, clearHistory } from '../api/history.js';

export default function HistoryPanel({ onLoad }) {
  const [sessions, setSessions] = useState([]);
  const [open, setOpen] = useState(false);

  function refresh() {
    setSessions(getHistory());
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  function handleDelete(id) {
    deleteSession(id);
    refresh();
  }

  function handleClear() {
    if (window.confirm('Clear all history?')) {
      clearHistory();
      refresh();
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition"
      >
        🕑 History {sessions.length > 0 && !open ? `(${sessions.length})` : ''}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Sessions</h3>
            {sessions.length > 0 && (
              <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-600">
                Clear all
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No history yet.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs"
                >
                  <button
                    className="flex-1 text-left text-gray-700 hover:text-indigo-600 truncate"
                    onClick={() => { onLoad(s); setOpen(false); }}
                  >
                    <span className="font-medium">{s.type === 'pdf' ? '📄' : '📝'} </span>
                    {s.preview}
                    <span className="ml-2 text-gray-400">{new Date(s.savedAt).toLocaleDateString()}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="ml-3 text-gray-300 hover:text-red-400"
                    aria-label="Delete session"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
