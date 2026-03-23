import { useState, useRef } from 'react';

export default function InputSection({ onText, onPDF, loading }) {
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const fileRef = useRef(null);

  function handleTextSubmit(e) {
    e.preventDefault();
    if (text.trim().length >= 50) onText(text.trim());
  }

  function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setFileName(file.name);
    onPDF(file);
  }

  return (
    <section className="space-y-6">
      {/* Text input */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">📝 Paste Your Text</h2>
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            rows={7}
            placeholder="Paste your study material here (minimum 50 characters)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length} chars</span>
            <button
              type="submit"
              disabled={loading || text.trim().length < 50}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition"
            >
              {loading ? 'Analyzing…' : 'Analyze Text →'}
            </button>
          </div>
        </form>
      </div>

      {/* PDF drop zone */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">📄 Upload PDF</h2>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => !loading && fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition
            ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
            ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <p className="text-3xl">📂</p>
          <p className="mt-2 text-sm text-gray-500">
            {fileName ? `✅ ${fileName}` : 'Drag & drop a PDF or click to browse'}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      </div>
    </section>
  );
}
