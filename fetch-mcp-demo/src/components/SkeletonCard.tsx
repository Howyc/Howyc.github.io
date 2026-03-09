export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton skeleton-name" />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
      </div>
    </div>
  );
}
