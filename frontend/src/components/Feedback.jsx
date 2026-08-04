export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/50">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-brand-500"
        role="status"
        aria-label={label}
      />
      <p className="text-sm">{label}…</p>
    </div>
  );
}

export function EmptyState({ icon = '📦', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <div className="text-4xl" aria-hidden="true">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {subtitle && <p className="max-w-sm text-sm text-ink/50">{subtitle}</p>}
      {action}
    </div>
  );
}

export function Banner({ type = 'error', children }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-brand-50 text-brand-700 border-brand-200',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`} role="status">
      {children}
    </div>
  );
}
