import type { CVNode, NodePosition, NodeState } from '../types';

// Node sizes by type and state
const NODE_SIZES: Record<string, Record<NodeState, { width: number; height: number }>> = {
  profile: {
    dormant: { width: 10, height: 10 },
    quickview: { width: 80, height: 80 },
    detailed: { width: 360, height: 420 },
  },
  category: {
    dormant: { width: 10, height: 10 },
    quickview: { width: 80, height: 80 },
    detailed: { width: 150, height: 80 },
  },
  item: {
    dormant: { width: 10, height: 10 },
    quickview: { width: 80, height: 80 },
    detailed: { width: 420, height: 300 },
  },
  'skill-group': {
    dormant: { width: 10, height: 10 },
    quickview: { width: 80, height: 80 },
    detailed: { width: 160, height: 80 },
  },
  skill: {
    dormant: { width: 10, height: 10 },
    quickview: { width: 80, height: 80 },
    detailed: { width: 200, height: 120 },
  },
};

// Minimum gap between nodes
const MIN_GAP = 40;

// Get node size based on type and state
function getNodeSize(node: CVNode, state: NodeState): { width: number; height: number } {
  const typeSizes = NODE_SIZES[node.type];
  if (typeSizes) {
    return typeSizes[state] || typeSizes.dormant;
  }
  return { width: 80, height: 80 };
}

// Calculate horizontal distance needed between two nodes (center to center)
function calcHorizontalDistance(
  parentNode: CVNode,
  parentState: NodeState,
  childNode: CVNode,
  childState: NodeState
): number {
  const parentSize = getNodeSize(parentNode, parentState);
  const childSize = getNodeSize(childNode, childState);
  // Distance = half of parent width + gap + half of child width
  return parentSize.width / 2 + MIN_GAP + childSize.width / 2;
}

// Calculate vertical spacing needed
function calcVerticalSpacing(nodes: CVNode[], states: Map<string, NodeState>): number {
  let maxHeight = 0;
  for (const node of nodes) {
    const state = states.get(node.id) || 'dormant';
    const size = getNodeSize(node, state);
    maxHeight = Math.max(maxHeight, size.height);
  }
  return maxHeight + MIN_GAP * 0.5;
}

// Build adjacency map: parentId -> children
function buildChildrenMap(nodes: CVNode[]): Map<string | null, CVNode[]> {
  const map = new Map<string | null, CVNode[]>();
  for (const node of nodes) {
    const children = map.get(node.parentId) || [];
    children.push(node);
    map.set(node.parentId, children);
  }
  return map;
}

// Get all ancestor IDs
function getAncestorIds(nodeId: string, nodes: CVNode[]): string[] {
  const ancestors: string[] = [];
  let currentId: string | null = nodeId;
  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (node?.parentId) {
      ancestors.push(node.parentId);
      currentId = node.parentId;
    } else {
      currentId = null;
    }
  }
  return ancestors;
}

// Compute node state based on selection
function computeNodeState(nodeId: string, selectedId: string | null, nodes: CVNode[]): NodeState {
  if (!selectedId) {
    if (nodeId === 'profile') return 'detailed';
    const node = nodes.find((n) => n.id === nodeId);
    if (node?.parentId === 'profile') return 'quickview';
    return 'dormant';
  }

  if (nodeId === selectedId) return 'detailed';

  const node = nodes.find((n) => n.id === nodeId);
  if (node?.parentId === selectedId) return 'quickview';

  const ancestors = getAncestorIds(selectedId, nodes);
  if (ancestors.includes(nodeId)) return 'quickview';

  return 'dormant';
}

// Simple hash for deterministic variation
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get small deterministic offset
function jitter(nodeId: string, scale: number = 20): number {
  return ((simpleHash(nodeId) % 100) / 100 - 0.5) * scale;
}

/**
 * Size-aware layout that calculates distances based on actual node dimensions:
 * - Profile at center
 * - Categories positioned around profile with size-aware spacing
 * - Children extend outward with spacing based on their actual sizes
 */
export function computeLayout(
  nodes: CVNode[],
  selectedId: string | null
): NodePosition[] {
  const positions: NodePosition[] = [];
  const childrenMap = buildChildrenMap(nodes);

  // Pre-compute all node states
  const nodeStates = new Map<string, NodeState>();
  for (const node of nodes) {
    nodeStates.set(node.id, computeNodeState(node.id, selectedId, nodes));
  }

  const profile = nodes.find((n) => n.type === 'profile');
  if (!profile) return positions;

  const profileState = nodeStates.get(profile.id) || 'detailed';

  // Center position
  const centerX = 400;
  const centerY = 300;
  positions.push({ nodeId: profile.id, x: centerX, y: centerY });

  const categories = childrenMap.get(profile.id) || [];

  // Category layout config: direction and vertical offset
  const categoryConfig: Record<string, { dirX: number; offsetY: number }> = {
    work: { dirX: -1, offsetY: -100 },
    skills: { dirX: 1, offsetY: -150 },
    education: { dirX: 1, offsetY: 200 },
    languages: { dirX: -1, offsetY: 200 },
  };

  categories.forEach((category) => {
    const cfg = categoryConfig[category.id];
    if (!cfg) return;

    const categoryState = nodeStates.get(category.id) || 'dormant';

    // Calculate distance from profile center to category center
    const categoryDistance = calcHorizontalDistance(profile, profileState, category, categoryState);

    const catJitterX = jitter(category.id, 8);
    const catJitterY = jitter(category.id + 'y', 15);

    const catX = centerX + cfg.dirX * categoryDistance + catJitterX;
    const catY = centerY + cfg.offsetY + catJitterY;

    positions.push({ nodeId: category.id, x: catX, y: catY });

    // Get children (items or skill-groups)
    const items = childrenMap.get(category.id) || [];
    if (items.length === 0) return;

    // Calculate vertical spacing based on item sizes
    const itemVerticalSpacing = calcVerticalSpacing(items, nodeStates);

    // Calculate total height and center vertically
    const totalHeight = (items.length - 1) * itemVerticalSpacing;
    const startY = catY - totalHeight / 2;

    items.forEach((item, itemIndex) => {
      const itemState = nodeStates.get(item.id) || 'dormant';

      // Calculate horizontal distance from category to item
      const itemDistance = calcHorizontalDistance(category, categoryState, item, itemState);

      const itemJitterX = jitter(item.id, 10);
      const itemJitterY = jitter(item.id + 'y', 8);

      const itemX = catX + cfg.dirX * itemDistance + itemJitterX;
      const itemY = startY + itemIndex * itemVerticalSpacing + itemJitterY;

      positions.push({ nodeId: item.id, x: itemX, y: itemY });

      // Get grandchildren (skills)
      const grandchildren = childrenMap.get(item.id) || [];
      if (grandchildren.length === 0) return;

      // Calculate spacing for grandchildren
      const gcVerticalSpacing = calcVerticalSpacing(grandchildren, nodeStates) * 0.7;
      const gcTotalHeight = (grandchildren.length - 1) * gcVerticalSpacing;
      const gcStartY = itemY - gcTotalHeight / 2;

      grandchildren.forEach((gc, gcIndex) => {
        const gcState = nodeStates.get(gc.id) || 'dormant';

        // Calculate horizontal distance from item to grandchild
        const gcDistance = calcHorizontalDistance(item, itemState, gc, gcState);

        const gcJitterX = jitter(gc.id, 6);
        const gcJitterY = jitter(gc.id + 'y', 5);

        const gcX = itemX + cfg.dirX * gcDistance + gcJitterX;
        const gcY = gcStartY + gcIndex * gcVerticalSpacing + gcJitterY;

        positions.push({ nodeId: gc.id, x: gcX, y: gcY });
      });
    });
  });

  return positions;
}

export { getNodeSize };
