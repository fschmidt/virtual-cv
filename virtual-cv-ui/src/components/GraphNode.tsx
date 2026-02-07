import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import Markdown from 'react-markdown';
import { Plus } from 'lucide-react';
import SectionIcon from './SectionIcon';
import type { NodeState, CVNodeType, GraphNodeData } from '../types';

// Re-export types for backward compatibility
export type { NodeState };
export type NodeType = CVNodeType;

interface GraphNodeProps {
  id: string;
  data: GraphNodeData;
}

// Add child button component
function AddChildButton({ nodeId, onAddChild }: { nodeId: string; onAddChild?: (parentId: string) => void }) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent node selection
      onAddChild?.(nodeId);
    },
    [nodeId, onAddChild]
  );

  if (!onAddChild) return null;

  return (
    <button className="add-child-btn" onClick={handleClick} title="Add child node">
      <Plus size={14} />
    </button>
  );
}

function GraphNode({ id, data }: GraphNodeProps) {
  const { label, nodeType, state, content, selected, isDraft, editMode, onAddChild } = data;
  const selectedClass = selected ? 'selected' : '';
  const draftClass = isDraft ? 'draft' : '';
  const editModeClass = editMode ? 'edit-mode' : '';

  // Show add button on quickview nodes in edit mode (leaf types can't have children)
  const showAddButton = editMode && state === 'quickview' && nodeType !== 'skill' && nodeType !== 'item';

  // Dormant state - just a dot (can still be selected when navigating back)
  if (state === 'dormant') {
    return (
      <div className={`graph-node dormant ${selectedClass} ${draftClass} ${editModeClass}`}>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Profile node - special handling for business card
  if (nodeType === 'profile') {
    if (state === 'detailed') {
      return (
        <div className={`graph-node profile detailed ${selectedClass} ${draftClass} ${editModeClass}`}>
          <div className="business-card">
            <div className="business-card-photo">
              <img src={data.photoUrl} alt={data.name} />
            </div>
            <div className="business-card-content">
              <h1 className="business-card-name">{data.name}</h1>
              <h2 className="business-card-title">{data.title}</h2>
              <p className="business-card-subtitle">{data.subtitle}</p>
              <div className="business-card-details">
                <span className="business-card-experience">{data.experience}</span>
                <span className="business-card-location">{data.location}</span>
                <span className="business-card-email">{data.email}</span>
              </div>
              {content && (
                <div className="business-card-about markdown-content">
                  <Markdown>{content}</Markdown>
                </div>
              )}
            </div>
          </div>
          <Handle type="source" position={Position.Right} />
          <Handle type="target" position={Position.Left} />
        </div>
      );
    }
    // Quickview - circular photo
    return (
      <div className={`graph-node profile quickview ${selectedClass} ${draftClass} ${editModeClass}`}>
        <img src={data.photoUrl} alt={data.name} className="profile-photo" />
        {showAddButton && <AddChildButton nodeId={id} onAddChild={onAddChild} />}
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Category node with icon
  if (nodeType === 'category' && data.icon) {
    return (
      <div className={`graph-node ${nodeType} ${state} ${selectedClass} ${draftClass} ${editModeClass}`}>
        <SectionIcon icon={data.icon} size={state === 'detailed' ? 24 : 20} className="category-icon" />
        <span className="node-label">{label}</span>
        {showAddButton && <AddChildButton nodeId={id} onAddChild={onAddChild} />}
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Detailed state with markdown content
  if (state === 'detailed' && content) {
    return (
      <div className={`graph-node ${nodeType} ${state} ${selectedClass} ${draftClass} ${editModeClass}`}>
        <div className="markdown-content">
          <Markdown>{content}</Markdown>
        </div>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Quickview and fallback for detailed without content
  return (
    <div className={`graph-node ${nodeType} ${state} ${selectedClass} ${draftClass} ${editModeClass}`}>
      <span className="node-label">{label}</span>
      {showAddButton && <AddChildButton nodeId={id} onAddChild={onAddChild} />}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

// Custom comparison to prevent re-renders during drag
// Only re-render if visual properties change, not function references
function arePropsEqual(prev: GraphNodeProps, next: GraphNodeProps): boolean {
  return (
    prev.id === next.id &&
    prev.data.label === next.data.label &&
    prev.data.nodeType === next.data.nodeType &&
    prev.data.state === next.data.state &&
    prev.data.content === next.data.content &&
    prev.data.selected === next.data.selected &&
    prev.data.isDraft === next.data.isDraft &&
    prev.data.editMode === next.data.editMode &&
    prev.data.icon === next.data.icon &&
    prev.data.name === next.data.name &&
    prev.data.title === next.data.title &&
    prev.data.photoUrl === next.data.photoUrl
  );
}

export default memo(GraphNode, arePropsEqual);
