import { memo } from 'react';

export type ViewMode = 'graph' | 'cv';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn ${view === 'graph' ? 'active' : ''}`}
        onClick={() => onChange('graph')}
        title="Graph View"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="18" r="3" />
          <line x1="9" y1="6" x2="15" y2="6" />
          <line x1="6" y1="9" x2="6" y2="15" />
          <line x1="18" y1="9" x2="18" y2="15" />
          <line x1="9" y1="18" x2="15" y2="18" />
        </svg>
      </button>
      <button
        className={`view-toggle-btn ${view === 'cv' ? 'active' : ''}`}
        onClick={() => onChange('cv')}
        title="Standard CV View"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </button>
    </div>
  );
}

export default memo(ViewToggle);
