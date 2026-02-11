import type { Node, Edge } from '@xyflow/react';
import { CvNodeDtoType } from '../api/generated';
import type { CVData, CVNode, CVNodeType } from '../types';
import { CV_SECTIONS, profileAttrs, categoryAttrs, itemAttrs, isDraft } from '../types';
import type { ContentMap } from './content.service';

// Visual states for nodes (absorbed from former graph.types.ts)
export type NodeState = 'detailed' | 'quickview' | 'dormant';

// Data passed to GraphNode component
export interface GraphNodeData {
  label: string;
  nodeType: CVNodeType;
  state: NodeState;
  // Profile-specific (flattened for rendering)
  name?: string;
  title?: string;
  subtitle?: string;
  experience?: string;
  email?: string;
  location?: string;
  photoUrl?: string;
  // Item-specific
  company?: string;
  dateRange?: string;
  // Markdown content for detailed view
  content?: string;
  // Section icon for category nodes
  icon?: string;
  // Whether this node is currently selected
  selected?: boolean;
  // Whether this node is a draft (only visible in edit mode)
  isDraft?: boolean;
  // Edit mode - enables dragging and add child button
  editMode?: boolean;
  // Callback to add a child node (used in edit mode)
  onAddChild?: (parentId: string) => void;
  // Index signature for React Flow compatibility
  [key: string]: unknown;
}

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
    return inspectorMode ? 'quickview' : 'detailed';
  }

  const node = nodes.find((n) => n.id === nodeId);
  if (node?.parentId === selectedId) return 'quickview';

  const ancestors = getAncestorIds(selectedId, nodes);
  if (ancestors.includes(nodeId)) return 'quickview';

  return 'dormant';
}

// Map CV node to React Flow node data
function mapNodeToGraphData(
  node: CVNode,
  state: NodeState,
  content?: string
): GraphNodeData {
  const draft = isDraft(node);
  const base: GraphNodeData = {
    label: node.label,
    nodeType: node.type,
    state,
    content,
    isDraft: draft,
  };

  if (node.type === CvNodeDtoType.PROFILE) {
    const p = profileAttrs(node);
    return {
      ...base,
      name: p.name,
      title: p.title,
      subtitle: p.subtitle,
      experience: p.experience,
      email: p.email,
      location: p.location,
      photoUrl: p.photoUrl,
    };
  }

  // Add icon for category nodes
  if (node.type === CvNodeDtoType.CATEGORY) {
    const c = categoryAttrs(node);
    const section = CV_SECTIONS.find((s) => s.id === c.sectionId);
    if (section) {
      base.icon = section.icon;
    }
  }

  // Add item-specific fields
  if (node.type === CvNodeDtoType.ITEM) {
    const item = itemAttrs(node);
    if (item.company) base.company = item.company;
    if (item.dateRange) base.dateRange = item.dateRange;
  }

  return base;
}

// Build React Flow nodes from CV data
export function buildNodes(
  cvData: CVData,
  selectedId: string | null,
  contentMap?: ContentMap,
  inspectorMode: boolean = false,
  editModeEnabled: boolean = false,
  onAddChild?: (parentId: string) => void,
  existingPositions?: Map<string, { x: number; y: number }>
): Node<GraphNodeData>[] {
  // Filter out draft nodes when not in edit mode
  const visibleNodes = cvData.nodes.filter(
    (node) => !isDraft(node) || editModeEnabled
  );

  // Get position: prefer existing (dragged) positions in edit mode, then saved, then near parent
  const getPosition = (node: CVNode): { x: number; y: number } => {
    if (existingPositions) {
      const existingPos = existingPositions.get(node.id);
      if (existingPos) return existingPos;
    }
    // Use saved position from backend
    if (node.positionX != null && node.positionY != null) {
      return { x: node.positionX, y: node.positionY };
    }
    // New node - place it near its parent with a small offset
    if (node.parentId) {
      const parentPos = existingPositions?.get(node.parentId);
      if (parentPos) return { x: parentPos.x + 200, y: parentPos.y + 50 };
      const parentNode = cvData.nodes.find((n) => n.id === node.parentId);
      if (parentNode?.positionX != null && parentNode?.positionY != null) {
        return { x: parentNode.positionX + 200, y: parentNode.positionY + 50 };
      }
    }
    return { x: 0, y: 0 };
  };

  return visibleNodes.map((node) => {
    const state = computeNodeState(node.id, selectedId, visibleNodes, inspectorMode);
    const position = getPosition(node);
    const content = inspectorMode ? undefined : contentMap?.[node.id];
    const isSelected = node.id === selectedId;

    return {
      id: node.id,
      type: 'graphNode',
      position,
      draggable: editModeEnabled,
      data: {
        ...mapNodeToGraphData(node, state, content),
        selected: isSelected,
        editMode: editModeEnabled,
        onAddChild,
      },
    };
  });
}

// Generate edges from parent-child relationships
export function buildEdges(
  cvData: CVData,
  selectedId: string | null,
  editModeEnabled: boolean = false
): Edge[] {
  const edges: Edge[] = [];

  const visibleNodes = cvData.nodes.filter(
    (node) => !isDraft(node) || editModeEnabled
  );
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  for (const node of visibleNodes) {
    if (node.parentId && visibleNodeIds.has(node.parentId)) {
      const sourceState = computeNodeState(node.parentId, selectedId, visibleNodes);
      const targetState = computeNodeState(node.id, selectedId, visibleNodes);

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
