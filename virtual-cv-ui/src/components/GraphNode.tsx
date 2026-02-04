import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export type NodeState = 'detailed' | 'quickview' | 'dormant';
export type NodeType = 'profile' | 'category' | 'item' | 'skill-group' | 'skill';

interface GraphNodeProps {
  data: {
    label: string;
    nodeType: NodeType;
    state: NodeState;
    // Profile-specific data
    name?: string;
    title?: string;
    subtitle?: string;
    experience?: string;
    email?: string;
    location?: string;
    photoUrl?: string;
  };
}

function GraphNode({ data }: GraphNodeProps) {
  const { label, nodeType, state } = data;

  // Dormant state - just a dot
  if (state === 'dormant') {
    return (
      <div className="graph-node dormant">
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // Profile node - special handling for business card
  if (nodeType === 'profile') {
    if (state === 'detailed') {
      return (
        <div className="graph-node profile detailed">
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
            </div>
          </div>
          <Handle type="source" position={Position.Right} />
          <Handle type="target" position={Position.Left} />
        </div>
      );
    }
    // Quickview - circular photo
    return (
      <div className="graph-node profile quickview">
        <img src={data.photoUrl} alt={data.name} className="profile-photo" />
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
  }

  // All other nodes
  return (
    <div className={`graph-node ${nodeType} ${state}`}>
      <span className="node-label">{label}</span>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default memo(GraphNode);
