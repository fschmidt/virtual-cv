import { memo, useState, useEffect, useRef, useMemo } from 'react';
import SectionIcon from './SectionIcon';
import DialogOverlay from './DialogOverlay';
import { CvNodeDtoType } from '../api/generated';
import type { CVData, CVNode, CV_SECTIONS } from '../types';
import { categoryAttrs } from '../types';
import type { ContentMap } from '../services';
import './SearchDialog.css';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nodeId: string) => void;
  cvData: CVData;
  contentMap: ContentMap;
  sections: typeof CV_SECTIONS;
}

interface SearchResult {
  node: CVNode;
  matchType: 'label' | 'content';
  icon?: string;
}

function getNodeIcon(node: CVNode, sections: typeof CV_SECTIONS): string | undefined {
  if (node.type === CvNodeDtoType.CATEGORY) {
    const c = categoryAttrs(node);
    const section = sections.find((s) => s.id === c.sectionId);
    return section?.icon;
  }
  return undefined;
}

function getNodeTypeLabel(node: CVNode): string {
  switch (node.type) {
    case CvNodeDtoType.PROFILE:
      return 'Profile';
    case CvNodeDtoType.CATEGORY:
      return 'Category';
    case CvNodeDtoType.ITEM:
      return 'Experience';
    case CvNodeDtoType.SKILL_GROUP:
      return 'Skill Group';
    case CvNodeDtoType.SKILL:
      return 'Skill';
    default:
      return '';
  }
}

function SearchDialog({
  isOpen,
  onClose,
  onSelect,
  cvData,
  contentMap,
  sections,
}: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const matches: SearchResult[] = [];

    for (const node of cvData.nodes) {
      if (node.type === CvNodeDtoType.PROFILE) continue;

      const labelMatch = node.label.toLowerCase().includes(lowerQuery);
      const content = contentMap[node.id] || '';
      const contentMatch = content.toLowerCase().includes(lowerQuery);

      if (labelMatch) {
        matches.push({
          node,
          matchType: 'label',
          icon: getNodeIcon(node, sections),
        });
      } else if (contentMatch) {
        matches.push({
          node,
          matchType: 'content',
          icon: getNodeIcon(node, sections),
        });
      }
    }

    return matches.slice(0, 10);
  }, [query, cvData.nodes, contentMap, sections]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resetting form state when dialog opens is a controlled transition, not a cascading render
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, results.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex].node.id);
          onClose();
        }
        break;
    }
  };

  return (
    <DialogOverlay
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName="search-overlay"
      dialogClassName="search-dialog"
    >
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search nodes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <kbd className="search-shortcut">ESC</kbd>
      </div>

      {query.trim() && (
        <div className="search-results" ref={listRef}>
          {results.length === 0 ? (
            <div className="search-no-results">No results found</div>
          ) : (
            results.map((result, index) => (
              <div
                key={result.node.id}
                className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(result.node.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="search-result-icon">
                  {result.icon ? (
                    <SectionIcon icon={result.icon} size={18} />
                  ) : (
                    <span className="search-result-type-dot" />
                  )}
                </div>
                <div className="search-result-content">
                  <span className="search-result-label">
                    {result.node.label.replace('\n', ' ')}
                  </span>
                  <span className="search-result-type">{getNodeTypeLabel(result.node)}</span>
                </div>
                {result.matchType === 'content' && (
                  <span className="search-result-match">in content</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="search-hints">
          <span>Type to search</span>
          <span className="search-hint-keys">
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
            <kbd>↵</kbd> select
          </span>
        </div>
      )}
    </DialogOverlay>
  );
}

export default memo(SearchDialog);
