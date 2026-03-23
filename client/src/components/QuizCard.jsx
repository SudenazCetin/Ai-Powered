import { useState } from 'react';

function QuizQuestion({ question, options, answer, index }) {
  const [selected, setSelected] = useState(null);

  const isCorrect = selected === answer;

  return (
    <div className="rounded-xl bg-white border border-green-100 p-4 shadow-xs space-y-3">
      <p className="text-sm font-medium text-gray-800">
        <span className="text-green-600 font-bold">Q{index + 1}.</span> {question}
      </p>
      <ul className="space-y-2">
        {options.map((opt) => {
          let cls = 'cursor-pointer rounded-lg border px-3 py-2 text-xs transition ';
          if (selected) {
            if (opt === answer) cls += 'border-green-400 bg-green-50 text-green-800 font-semibold';
            else if (opt === selected) cls += 'border-red-300 bg-red-50 text-red-700';
            else cls += 'border-gray-100 text-gray-500';
          } else {
            cls += 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700';
          }
          return (
            <li key={opt} className={cls} onClick={() => !selected && setSelected(opt)}>
              {opt}
            </li>
          );
        })}
      </ul>
      {selected && (
        <p className={`text-xs font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? '✅ Correct!' : `❌ Correct answer: ${answer}`}
        </p>
      )}
    </div>
  );
}

export default function QuizCard({ quiz }) {
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-green-800">
          <span>🧠</span> Quiz ({quiz.length} questions)
        </h3>
        <button
          onClick={() => setShow((v) => !v)}
          className="text-xs text-green-700 underline hover:no-underline"
        >
          {show ? 'Hide' : 'Start Quiz'}
        </button>
      </div>
      {show && (
        <div className="space-y-4">
          {quiz.map((q, i) => (
            <QuizQuestion key={i} {...q} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
