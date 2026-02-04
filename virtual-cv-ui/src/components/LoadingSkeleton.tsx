import { memo } from 'react';

/**
 * Loading skeleton that mimics the graph layout
 * Shows placeholder shapes while data is loading
 */
function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      {/* Center profile placeholder */}
      <div className="skeleton-profile">
        <div className="skeleton-avatar" />
        <div className="skeleton-text skeleton-name" />
        <div className="skeleton-text skeleton-title" />
      </div>

      {/* Category placeholders around profile */}
      <div className="skeleton-nodes">
        <div className="skeleton-node skeleton-left-top" />
        <div className="skeleton-node skeleton-right-top" />
        <div className="skeleton-node skeleton-left-bottom" />
        <div className="skeleton-node skeleton-right-bottom" />
      </div>

      {/* Connecting lines */}
      <svg className="skeleton-lines" viewBox="0 0 400 300">
        <line x1="200" y1="150" x2="80" y2="80" />
        <line x1="200" y1="150" x2="320" y2="80" />
        <line x1="200" y1="150" x2="80" y2="220" />
        <line x1="200" y1="150" x2="320" y2="220" />
      </svg>
    </div>
  );
}

export default memo(LoadingSkeleton);
