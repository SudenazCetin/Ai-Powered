export default function ConceptsCard({ keyConcepts }) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-purple-800">
        <span>🔑</span> Key Concepts
      </h3>
      <ul className="space-y-3">
        {keyConcepts.map((concept, i) => (
          <li key={i} className="rounded-xl bg-white p-3 shadow-xs border border-purple-100">
            <span className="font-semibold text-purple-700 text-sm">{concept.term}</span>
            <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">{concept.definition}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
