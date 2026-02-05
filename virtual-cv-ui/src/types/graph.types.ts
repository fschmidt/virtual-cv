import type { Node, Edge } from '@xyflow/react';
import type { CVNodeType } from './cv.types';

// Visual states for nodes
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
  // Generic
  description?: string;
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

// Typed React Flow node
export type CVGraphNode = Node<GraphNodeData>;

// Typed React Flow edge
export type CVGraphEdge = Edge;
