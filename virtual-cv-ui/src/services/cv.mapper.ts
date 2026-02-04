import type { Node, Edge } from '@xyflow/react';
import type { CVData, CVNode, CVProfileNode, CVCategoryNode, NodeState, GraphNodeData } from '../types';
import { CV_SECTIONS } from '../types';
import type { ContentMap } from './content.service';
import { computeLayout } from './layout.service';

// Get all ancestor IDs for a given node
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
// When inspectorMode is true, selected nodes stay as quickview (content shown in panel)
export function computeNodeState(
  nodeId: string,
  selectedId: string | null,
  nodes: CVNode[],
  inspectorMode: boolean = false
): NodeState {
  if (!selectedId) {
    if (nodeId === 'profile') return inspectorMode ? 'quickview' : 'detailed';
    const node = nodes.find((n) => n.id === nodeId);
    if (node?.parentId === 'profile') return 'quickview';
    return 'dormant';
  }

  if (nodeId === selectedId) {
    // In inspector mode, selected nodes stay as quickview
    return inspectorMode ? 'quickview' : 'detailed';
  }

  const node = nodes.find((n) => n.id === nodeId);
  if (node?.parentId === selectedId) return 'quickview';

  const ancestors = getAncestorIds(selectedId, nodes);
  if (ancestors.includes(nodeId)) return 'quickview';

  return 'dormant';
}

// Type guard for profile node
function isProfileNode(node: CVNode): node is CVProfileNode {
  return node.type === 'profile';
}

// Type guard for category node
function isCategoryNode(node: CVNode): node is CVCategoryNode {
  return node.type === 'category';
}

// Map CV node to React Flow node data
function mapNodeToGraphData(
  node: CVNode,
  state: NodeState,
  content?: string
): GraphNodeData {
  const base: GraphNodeData = {
    label: node.label,
    nodeType: node.type,
    state,
    content,
  };

  if (isProfileNode(node)) {
    return {
      ...base,
      name: node.name,
      title: node.title,
      subtitle: node.subtitle,
      experience: node.experience,
      email: node.email,
      location: node.location,
      photoUrl: node.photoUrl,
    };
  }

  // Add icon for category nodes
  if (isCategoryNode(node)) {
    const section = CV_SECTIONS.find((s) => s.id === node.sectionId);
    if (section) {
      base.icon = section.icon;
    }
  }

  // Add other type-specific fields as needed
  if ('description' in node && node.description) {
    base.description = node.description;
  }
  if ('company' in node && node.company) {
    base.company = node.company;
  }
  if ('dateRange' in node && node.dateRange) {
    base.dateRange = node.dateRange;
  }

  return base;
}

// Build React Flow nodes from CV data
export function buildNodes(
  cvData: CVData,
  selectedId: string | null,
  contentMap?: ContentMap,
  useAutoLayout: boolean = true,
  inspectorMode: boolean = false
): Node<GraphNodeData>[] {
  // Use auto-layout or static positions
  const positions = useAutoLayout
    ? computeLayout(cvData.nodes, selectedId, inspectorMode)
    : cvData.positions;

  const positionMap = new Map(positions.map((p) => [p.nodeId, { x: p.x, y: p.y }]));

  return cvData.nodes.map((node) => {
    const state = computeNodeState(node.id, selectedId, cvData.nodes, inspectorMode);
    const position = positionMap.get(node.id) ?? { x: 0, y: 0 };
    // Don't pass content to nodes in inspector mode (shown in panel instead)
    const content = inspectorMode ? undefined : contentMap?.[node.id];
    const isSelected = node.id === selectedId;

    return {
      id: node.id,
      type: 'graphNode',
      position,
      data: {
        ...mapNodeToGraphData(node, state, content),
        selected: isSelected,
      },
    };
  });
}

// Generate edges from parent-child relationships
export function buildEdges(cvData: CVData, selectedId: string | null): Edge[] {
  const edges: Edge[] = [];

  for (const node of cvData.nodes) {
    if (node.parentId) {
      const sourceState = computeNodeState(node.parentId, selectedId, cvData.nodes);
      const targetState = computeNodeState(node.id, selectedId, cvData.nodes);

      const bothVisible = sourceState !== 'dormant' && targetState !== 'dormant';
      const oneVisible = sourceState !== 'dormant' || targetState !== 'dormant';

      let edgeClass = 'edge-dormant';
      if (bothVisible) {
        edgeClass = 'edge-active';
      } else if (oneVisible) {
        edgeClass = 'edge-partial';
      }

      edges.push({
        id: `e-${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'straight',
        className: edgeClass,
      });
    }
  }

  return edges;
}
