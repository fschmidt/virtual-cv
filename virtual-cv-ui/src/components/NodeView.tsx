import Markdown from 'react-markdown';
import { Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import SectionIcon from './SectionIcon';
import type { CVNode } from '../types';

interface NodeViewProps {
  node: CVNode;
  selectedId: string;
  content: string | undefined;
  parentChain: CVNode[];
  sectionIcon: string | null;
  editModeEnabled: boolean;
  hasChildren: boolean;
  canDelete: boolean;
  canHaveChildren: boolean;
  showEdit: boolean;
  showPublish: boolean;
  showDelete: boolean;
  showCreateChild: boolean;
  isPublishing: boolean;
  onStartEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
  onCreateChild: () => void;
}

function NodeView({
  node,
  selectedId,
  content,
  parentChain,
  sectionIcon,
  editModeEnabled,
  canDelete,
  canHaveChildren,
  showEdit,
  showPublish,
  showDelete,
  showCreateChild,
  isPublishing,
  onStartEdit,
  onPublish,
  onDelete,
  onCreateChild,
}: NodeViewProps) {
  return (
    <>
      {editModeEnabled && (showEdit || showDelete || showPublish) && (
        <div className="inspector-action-buttons">
          {showEdit && (
            <button className="inspector-edit-btn" onClick={onStartEdit} title="Edit">
              <Pencil size={18} strokeWidth={2} color="#a78bfa" />
            </button>
          )}
          {showPublish && (
            <button
              className={`inspector-publish-btn ${(node.isDraft ?? false) ? 'draft' : 'published'}`}
              onClick={onPublish}
              title={(node.isDraft ?? false) ? 'Publish' : 'Unpublish'}
              disabled={isPublishing}
            >
              {(node.isDraft ?? false) ? <Eye size={18} strokeWidth={2} /> : <EyeOff size={18} strokeWidth={2} />}
            </button>
          )}
          {showDelete && canDelete && (
            <button className="inspector-delete-btn" onClick={onDelete} title="Delete">
              <Trash2 size={18} strokeWidth={2} color="#f87171" />
            </button>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="inspector-breadcrumb">
        {parentChain.map((n, i) => (
          <span key={n.id}>
            {i > 0 && <span className="breadcrumb-separator">/</span>}
            <span className={n.id === selectedId ? 'breadcrumb-current' : 'breadcrumb-item'}>
              {n.label.split('\n')[0]}
            </span>
          </span>
        ))}
      </div>

      {/* Header with icon */}
      <div className="inspector-header">
        {sectionIcon && <SectionIcon icon={sectionIcon} size={28} className="inspector-icon" />}
        <h1 className="inspector-title">{node.label.replace(/\n/g, ' ')}</h1>
      </div>

      {/* Meta info for items */}
      {'company' in node && node.company && <p className="inspector-company">{node.company}</p>}
      {'dateRange' in node && node.dateRange && <p className="inspector-date">{node.dateRange}</p>}

      {/* Proficiency for skills */}
      {'proficiencyLevel' in node && node.proficiencyLevel && (
        <div className="inspector-proficiency">
          <span className={`proficiency-badge ${node.proficiencyLevel}`}>{node.proficiencyLevel}</span>
        </div>
      )}

      {/* Markdown content */}
      {content && (
        <div className="inspector-content markdown-content">
          <Markdown>{content}</Markdown>
        </div>
      )}

      {/* Fallback for nodes without content */}
      {!content && node.description && <p className="inspector-description">{node.description}</p>}

      {/* Add child button */}
      {editModeEnabled && showCreateChild && canHaveChildren && (
        <button
          className="inspector-add-child-btn"
          onClick={onCreateChild}
        >
          <Plus size={18} strokeWidth={2} />
          Add Child Node
        </button>
      )}
    </>
  );
}

export default NodeView;
