import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Markdown from 'react-markdown';
import SectionIcon from './SectionIcon';
import type { NodeState, CVNodeType, GraphNodeData } from '../types';

// Re-export types for backward compatibility
export type { NodeState };
export type NodeType = CVNodeType;

interface GraphNodeProps {
  data: GraphNodeData;
}

function GraphNode({ data }: GraphNodeProps) {
  const { label, nodeType, state, content, selected } = data;
  const selectedClass = selected ? 'selected' : '';

  // Dormant state - just a dot (can still be selected when navigating back)
  if (state === 'dormant') {
    return (
      <div className={`graph-node dormant ${selectedClass}`}>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Profile node - special handling for business card
  if (nodeType === 'profile') {
    if (state === 'detailed') {
      return (
        <div className={`graph-node profile detailed ${selectedClass}`}>
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
      <div className={`graph-node profile quickview ${selectedClass}`}>
        <img src={data.photoUrl} alt={data.name} className="profile-photo" />
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Category node with icon
  if (nodeType === 'category' && data.icon) {
    return (
      <div className={`graph-node ${nodeType} ${state} ${selectedClass}`}>
        <SectionIcon icon={data.icon} size={state === 'detailed' ? 24 : 20} className="category-icon" />
        <span className="node-label">{label}</span>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Detailed state with markdown content
  if (state === 'detailed' && content) {
    return (
      <div className={`graph-node ${nodeType} ${state} ${selectedClass}`}>
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
    <div className={`graph-node ${nodeType} ${state} ${selectedClass}`}>
      <span className="node-label">{label}</span>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default memo(GraphNode);
