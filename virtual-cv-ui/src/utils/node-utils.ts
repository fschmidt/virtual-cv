import type { CVNode, CVNodeType, CVSection } from '../types';

/** Human-readable label for a node type */
export function getNodeTypeLabel(type: CVNodeType): string {
  switch (type) {
    case 'profile':
      return 'Profile';
    case 'category':
      return 'Category';
    case 'item':
      return 'Item';
    case 'skill-group':
      return 'Skill Group';
    case 'skill':
      return 'Skill';
  }
}

/** Get parent chain for breadcrumb navigation */
export function getParentChain(nodeId: string, nodes: CVNode[]): CVNode[] {
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

/** Get section icon for a node by walking up to its category ancestor */
export function getSectionIcon(node: CVNode, nodes: CVNode[], sections: CVSection[]): string | null {
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
