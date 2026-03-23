export default function SummaryCard({ summary }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-blue-800">
        <span>📋</span> Summary
      </h3>
      <p className="text-sm leading-relaxed text-blue-900">{summary}</p>
    </div>
  );
}
