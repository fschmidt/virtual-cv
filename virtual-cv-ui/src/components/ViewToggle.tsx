import { memo, useState, useEffect, useCallback } from 'react';
import { Network, FileText, Menu, X, Pencil } from 'lucide-react';
import './ViewToggle.css';

export type ViewMode = 'graph' | 'cv';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  showEditToggle?: boolean;
  editMode?: boolean;
  onEditModeChange?: (editMode: boolean) => void;
}

function ViewToggle({ view, onChange, showEditToggle, editMode, onEditModeChange }: ViewToggleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.floating-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const handleViewChange = useCallback(
    (newView: ViewMode) => {
      onChange(newView);
      setIsMenuOpen(false);
    },
    [onChange]
  );

  // Desktop: show buttons directly
  // Mobile: show hamburger that expands to buttons
  return (
    <div className={`floating-menu ${isMenuOpen ? 'open' : ''}`}>
      {isMobile && (
        <button
          className="floating-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <div className={`floating-menu-items ${isMobile && !isMenuOpen ? 'hidden' : ''}`}>
        <button
          className={`floating-menu-btn ${view === 'graph' ? 'active' : ''}`}
          onClick={() => handleViewChange('graph')}
          title="Graph View"
        >
          <Network size={18} />
          {isMobile && <span>Graph</span>}
        </button>
        <button
          className={`floating-menu-btn ${view === 'cv' ? 'active' : ''}`}
          onClick={() => handleViewChange('cv')}
          title="CV View"
        >
          <FileText size={18} />
          {isMobile && <span>CV</span>}
        </button>
        {showEditToggle && (
          <>
            <div className="floating-menu-divider" />
            <button
              className={`floating-menu-btn edit-toggle ${editMode ? 'active' : ''}`}
              onClick={() => onEditModeChange?.(!editMode)}
              title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            >
              <Pencil size={18} />
              {isMobile && <span>Edit</span>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(ViewToggle);
