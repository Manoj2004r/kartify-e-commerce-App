export default function StarRating({ value = 0, count, size = 'sm' }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === 'lg' ? 'text-lg' : 'text-xs';

  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sizeClass} text-sunburst`} aria-label={`${value} out of 5 stars`}>
        {stars.map((s) => (
          <span key={s} aria-hidden="true">
            {value >= s ? '★' : value >= s - 0.5 ? '⯪' : '☆'}
          </span>
        ))}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-ink/50">({count.toLocaleString('en-IN')})</span>
      )}
    </div>
  );
}
