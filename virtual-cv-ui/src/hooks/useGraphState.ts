import { useCallback, useState, useEffect, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import type { ViewMode } from '../components/ViewToggle';
import { useToast } from '../components/Toast';
import { cvService, buildNodes, buildEdges, getAllContent, type ContentMap, type UpdateNodeCommand, type CreateNodeCommand } from '../services';
import type { CVData, CVNodeType } from '../types';

// Animation duration in ms
const ANIMATION_DURATION = 300;

// Inspector mode: nodes stay as quickview, content shown in side panel
const INSPECTOR_MODE = true;

const initialNodes: Node[] = [];

// URL hash helpers for deep linking
function getNodeIdFromHash(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith('#node=')) {
    return decodeURIComponent(hash.slice(6)) || null;
  }
  return null;
}

function setHashFromNodeId(nodeId: string | null): void {
  if (nodeId) {
    const newHash = `#node=${encodeURIComponent(nodeId)}`;
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
  } else {
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }
}

interface UseGraphStateOptions {
  editMode: boolean;
  viewMode: ViewMode;
  onAddChild: (parentId: string) => void;
}

export function useGraphState({ editMode, viewMode, onAddChild }: UseGraphStateOptions) {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => getNodeIdFromHash());
  const [contentMap, setContentMap] = useState<ContentMap>({});
  const [nodes, setNodes, defaultOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const { fitView } = useReactFlow();
  const { showToast, showError } = useToast();

  // Ref to track current node positions for edit mode (avoids stale state in useEffect)
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const isDraggingRef = useRef(false);

  // Custom onNodesChange that filters out position changes during drag for performance
  const onNodesChange = useCallback(
    (changes: Parameters<typeof defaultOnNodesChange>[0]) => {
      if (isDraggingRef.current) {
        const positionChanges = changes.filter((c) => c.type === 'position');
        if (positionChanges.length > 0) {
          defaultOnNodesChange(positionChanges);
        }
        return;
      }
      defaultOnNodesChange(changes);
    },
    [defaultOnNodesChange]
  );

  // Keep position ref in sync with nodes state (but not during drag to avoid overhead)
  useEffect(() => {
    if (!isDraggingRef.current) {
      nodePositionsRef.current = new Map(nodes.map((n) => [n.id, n.position]));
    }
  }, [nodes]);

  // Load data on mount
  useEffect(() => {
    cvService.getCVData().then(setCvData);
  }, []);

  // Load content map on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: loading static content data on mount, not a cascading render
    setContentMap(getAllContent());
  }, []);

  // Sync URL hash with selected node (deep linking)
  useEffect(() => {
    setHashFromNodeId(selectedId);
  }, [selectedId]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const nodeId = getNodeIdFromHash();
      setSelectedId(nodeId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Rebuild graph when data or selection changes
  useEffect(() => {
    if (cvData && viewMode === 'graph') {
      const existingPositions = nodePositionsRef.current.size > 0
        ? nodePositionsRef.current
        : undefined;

      setNodes(buildNodes(cvData, selectedId, contentMap, INSPECTOR_MODE, editMode, onAddChild, existingPositions));
      setEdges(buildEdges(cvData, selectedId, editMode));

      if (!editMode) {
        setTimeout(() => {
          fitView({ padding: 0.3, duration: ANIMATION_DURATION });
        }, 50);
        setTimeout(() => {
          fitView({ padding: 0.3, duration: ANIMATION_DURATION });
        }, 350);
      }
    }
  }, [cvData, selectedId, viewMode, contentMap, setNodes, setEdges, fitView, editMode, onAddChild]);

  // Node click handler
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedId((current) => (current === node.id ? null : node.id));
  }, []);

  // Pane click handler
  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  // CRUD operations
  const onSaveNode = useCallback(async (id: string, updates: UpdateNodeCommand) => {
    try {
      await cvService.updateNode(id, updates);
      const newData = await cvService.getCVData();
      setCvData(newData);
      setContentMap(getAllContent());
      showToast('Changes saved', 'success');
    } catch (error) {
      showError(error);
      throw error;
    }
  }, [showToast, showError]);

  const onDeleteNode = useCallback(async (id: string) => {
    try {
      await cvService.deleteNode(id);
      const newData = await cvService.getCVData();
      setCvData(newData);
      setSelectedId(null);
      showToast('Node deleted', 'success');
    } catch (error) {
      showError(error);
      throw error;
    }
  }, [showToast, showError]);

  const onCreateNode = useCallback(async (type: CVNodeType, data: CreateNodeCommand) => {
    try {
      const newNode = await cvService.createNode(type, data);
      const newData = await cvService.getCVData();
      setCvData(newData);
      setSelectedId(newNode.id);
      showToast('Node created', 'success');
    } catch (error) {
      showError(error);
      throw error;
    }
  }, [showToast, showError]);

  const onPublishNode = useCallback(async (id: string, publish: boolean) => {
    try {
      await cvService.updateNode(id, {
        attributes: { isDraft: !publish } as unknown as UpdateNodeCommand['attributes'],
      });
      const newData = await cvService.getCVData();
      setCvData(newData);
      showToast(publish ? 'Node published' : 'Node unpublished', 'success');
    } catch (error) {
      showError(error);
      throw error;
    }
  }, [showToast, showError]);

  // Drag handlers
  const onNodeDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      isDraggingRef.current = false;
      nodePositionsRef.current = new Map(nodes.map((n) => [n.id, n.position]));

      if (!editMode) return;

      try {
        await cvService.updateNode(node.id, {
          positionX: Math.round(node.position.x),
          positionY: Math.round(node.position.y),
        });
      } catch (error) {
        showError(error);
      }
    },
    [editMode, showError, nodes]
  );

  return {
    cvData,
    contentMap,
    selectedId,
    setSelectedId,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    onPaneClick,
    onNodeDragStart,
    onNodeDragStop,
    onSaveNode,
    onDeleteNode,
    onCreateNode,
    onPublishNode,
  };
}
