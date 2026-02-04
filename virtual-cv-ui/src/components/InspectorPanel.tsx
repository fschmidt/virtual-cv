import { memo } from 'react';
import Markdown from 'react-markdown';
import SectionIcon from './SectionIcon';
import type { CVNode, CVProfileNode, CVData, CVSection } from '../types';
import type { ContentMap } from '../services';

interface InspectorPanelProps {
  selectedId: string | null;
  cvData: CVData;
  contentMap: ContentMap;
  sections: CVSection[];
}

// Type guards
function isProfileNode(node: CVNode): node is CVProfileNode {
  return node.type === 'profile';
}

// Get parent chain for breadcrumb
function getParentChain(nodeId: string, nodes: CVNode[]): CVNode[] {
  const chain: CVNode[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (node) {
      chain.unshift(node);
      currentId = node.parentId;
    } else {
      break;
    }
  }

  return chain;
}

// Get section icon for a node
function getSectionIcon(node: CVNode, nodes: CVNode[], sections: CVSection[]): string | null {
  // Walk up to find category
  let current: CVNode | undefined = node;
  while (current && current.type !== 'category') {
    current = nodes.find((n) => n.id === current?.parentId);
  }

  if (current?.type === 'category' && 'sectionId' in current) {
    const section = sections.find((s) => s.id === current.sectionId);
    return section?.icon || null;
  }

  return null;
}

function InspectorPanel({ selectedId, cvData, contentMap, sections }: InspectorPanelProps) {
  if (!selectedId) return null;

  const node = cvData.nodes.find((n) => n.id === selectedId);
  if (!node) return null;

  const content = contentMap[selectedId];
  const parentChain = getParentChain(selectedId, cvData.nodes);
  const sectionIcon = getSectionIcon(node, cvData.nodes, sections);

  // Profile node - special rendering
  if (isProfileNode(node)) {
    return (
      <div className="inspector-panel">
        <div className="inspector-profile">
          <div className="inspector-profile-photo">
            <img src={node.photoUrl} alt={node.name} />
          </div>
          <h1 className="inspector-profile-name">{node.name}</h1>
          <h2 className="inspector-profile-title">{node.title}</h2>
          <p className="inspector-profile-subtitle">{node.subtitle}</p>
          <div className="inspector-profile-details">
            <span className="inspector-experience">{node.experience}</span>
            <span className="inspector-location">{node.location}</span>
            <span className="inspector-email">{node.email}</span>
          </div>
          {content && (
            <div className="inspector-content markdown-content">
              <Markdown>{content}</Markdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Other nodes
  return (
    <div className="inspector-panel">
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
        {sectionIcon && (
          <SectionIcon icon={sectionIcon} size={28} className="inspector-icon" />
        )}
        <h1 className="inspector-title">{node.label.replace(/\n/g, ' ')}</h1>
      </div>

      {/* Meta info for items */}
      {'company' in node && node.company && (
        <p className="inspector-company">{node.company}</p>
      )}
      {'dateRange' in node && node.dateRange && (
        <p className="inspector-date">{node.dateRange}</p>
      )}

      {/* Proficiency for skills */}
      {'proficiencyLevel' in node && node.proficiencyLevel && (
        <div className="inspector-proficiency">
          <span className={`proficiency-badge ${node.proficiencyLevel}`}>
            {node.proficiencyLevel}
          </span>
        </div>
      )}

      {/* Markdown content */}
      {content && (
        <div className="inspector-content markdown-content">
          <Markdown>{content}</Markdown>
        </div>
      )}

      {/* Fallback for nodes without content */}
      {!content && node.description && (
        <p className="inspector-description">{node.description}</p>
      )}
    </div>
  );
}

export default memo(InspectorPanel);
