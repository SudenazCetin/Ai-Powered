import { useAnalysis } from './hooks/useAnalysis.js';
import InputSection from './components/InputSection.jsx';
import SummaryCard from './components/SummaryCard.jsx';
import ConceptsCard from './components/ConceptsCard.jsx';
import QuizCard from './components/QuizCard.jsx';
import StudyPlanCard from './components/StudyPlanCard.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import Spinner from './components/Spinner.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';

const STEP_LABELS = {
  analyzing: 'Analyzing your content...',
  planning: 'Building your study plan...',
};

export default function App() {
  const { analysis, plan, loading, planning, error, step, runText, runPDF, reset, loadSession } = useAnalysis();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Learning Assistant</h1>
            <p className="text-xs text-gray-500">AI summaries, quizzes and study plans</p>
          </div>
          <HistoryPanel onLoad={loadSession} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <InputSection onText={runText} onPDF={runPDF} loading={loading} />
        <ErrorBanner message={error} onDismiss={reset} />

        {loading && (
          <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
            <Spinner label={STEP_LABELS[step] || 'Working...'} />
          </div>
        )}

        {analysis && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Your Results</h2>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition">
                Clear
              </button>
            </div>

            {planning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Analysis is ready. Building your study plan in the background...
              </div>
            )}

            <SummaryCard summary={analysis.summary} />
            <div className="grid gap-5 md:grid-cols-2">
              <ConceptsCard keyConcepts={analysis.keyConcepts} />
              <QuizCard quiz={analysis.quiz} />
            </div>
            {plan && <StudyPlanCard plan={plan} />}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Built with React + Express + Ollama
      </footer>
    </div>
  );
}
