import { useState } from 'react';

function DayCard({ day }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-xs">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <span className="text-xs font-bold text-amber-600">Day {day.day} · {day.date}</span>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{day.theme}</p>
        </div>
        <span className="text-amber-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">🎯 Goals</p>
            <ul className="list-disc list-inside space-y-0.5">
              {day.goals.map((g, i) => (
                <li key={i} className="text-xs text-gray-700">{g}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">📅 Schedule</p>
            <div className="space-y-2">
              {day.tasks.map((t, i) => (
                <div key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-xs">
                  <span className="font-mono text-amber-700">{t.time}</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-gray-700">{t.activity}</span>
                  {t.resource && (
                    <span className="ml-2 text-indigo-500 italic">({t.resource})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400">⏱ Total: {day.duration}</p>
        </div>
      )}
    </div>
  );
}

export default function StudyPlanCard({ plan }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
      <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-amber-800">
        <span>📅</span> {plan.title}
      </h3>
      <p className="mb-4 text-xs text-amber-700 leading-relaxed">{plan.overview}</p>

      <div className="space-y-3 mb-5">
        {plan.days.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </div>

      {plan.tips?.length > 0 && (
        <div className="rounded-xl bg-white border border-amber-100 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">💡 Study Tips</p>
          <ul className="space-y-1">
            {plan.tips.map((tip, i) => (
              <li key={i} className="text-xs text-gray-600">• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
