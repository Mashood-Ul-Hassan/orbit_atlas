export function SkeletonGrid({ count = 12 }) {
  return (
    <div role="status">
      <span className="sr-only">Loading countries</span>
      <div className="grid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div className="card skeleton" key={i}>
            <div className="card-flag" />
            <div className="card-body">
              <div className="sk-line sk-wide" />
              <div className="sk-line sk-narrow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorPanel({ title, message, onRetry, children }) {
  return (
    <div className="panel notice notice-error" role="alert">
      <h2 className="notice-title">{title}</h2>
      <p>{message}</p>
      {children}
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, children }) {
  return (
    <div className="panel notice">
      <h2 className="notice-title">{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
