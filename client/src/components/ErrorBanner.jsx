export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <span className="text-xl">⚠️</span>
      <p className="flex-1 text-sm">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 text-lg leading-none"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}
