import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import GraphNode from './components/GraphNode';
import ViewToggle, { type ViewMode } from './components/ViewToggle';
import StandardCVView from './components/StandardCVView';
import SearchDialog from './components/SearchDialog';
import InspectorPanel from './components/InspectorPanel';
import LoadingSkeleton from './components/LoadingSkeleton';
import FeatureTogglePopup from './components/FeatureTogglePopup';
import CreateNodeDialog from './components/CreateNodeDialog';
import { ToastProvider, useToast } from './components/Toast';
import { cvService, buildNodes, buildEdges, getAllContent, type ContentMap, type UpdateNodeCommand, type CreateNodeCommand } from './services';
import type { CVData, CVNodeType } from './types';
import { CV_SECTIONS } from './types';
import { Feature, isFeatureEnabled } from './utils/feature-flags';

const nodeTypes = {
  graphNode: GraphNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Animation duration in ms
const ANIMATION_DURATION = 300;

// Inspector mode: nodes stay as quickview, content shown in side panel
const INSPECTOR_MODE = true;

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

function HomeButton({ onClick, visible }: { onClick: () => void; visible: boolean }) {
  if (!visible) return null;

  return (
    <button className="home-button" onClick={onClick} title="Back to profile (Esc)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </button>
  );
}

function Flow() {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => getNodeIdFromHash());
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [contentMap, setContentMap] = useState<ContentMap>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFeaturePopupOpen, setIsFeaturePopupOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [createDialogParentId, setCreateDialogParentId] = useState<string | null>(null);
  const [nodes, setNodes, defaultOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Custom onNodesChange that filters out position changes during drag for performance
  const onNodesChange = useCallback(
    (changes: Parameters<typeof defaultOnNodesChange>[0]) => {
      if (isDraggingRef.current) {
        // During drag, only apply position changes (let React Flow handle internally)
        // Skip all other processing
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
  const { fitView } = useReactFlow();

  // Ref to track current node positions for edit mode (avoids stale state in useEffect)
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const isDraggingRef = useRef(false);

  // Keep position ref in sync with nodes state (but not during drag to avoid overhead)
  useEffect(() => {
    if (!isDraggingRef.current) {
      nodePositionsRef.current = new Map(nodes.map((n) => [n.id, n.position]));
    }
  }, [nodes]);

  // Feature flags - controls visibility of edit toggle button
  const showEditToggle = useMemo(() => isFeatureEnabled(Feature.EDIT_MODE), []);

  // Toast notifications
  const { showToast, showError } = useToast();

  // Load data on mount (mimics API call)
  useEffect(() => {
    cvService.getCVData().then(setCvData);
  }, []);

  // Load content map on mount
  useEffect(() => {
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

  // Handle adding a child node - opens create dialog directly
  const onAddChild = useCallback((parentId: string) => {
    setCreateDialogParentId(parentId);
  }, []);

  // Rebuild graph when data or selection changes
  // In edit mode, preserve current positions to allow dragging
  useEffect(() => {
    if (cvData && viewMode === 'graph') {
      // Always preserve existing positions from ref to avoid resetting dragged nodes
      const existingPositions = nodePositionsRef.current.size > 0
        ? nodePositionsRef.current
        : undefined;

      setNodes(buildNodes(cvData, selectedId, contentMap, INSPECTOR_MODE, editMode, onAddChild, existingPositions));
      setEdges(buildEdges(cvData, selectedId, editMode));

      // Only fit view when not in edit mode (to avoid disrupting drag positions)
      if (!editMode) {
        // Animate to fit view after state change
        // First call: quick adjustment
        setTimeout(() => {
          fitView({ padding: 0.3, duration: ANIMATION_DURATION });
        }, 50);

        // Second call: after CSS transition completes (300ms) to handle container resize
        setTimeout(() => {
          fitView({ padding: 0.3, duration: ANIMATION_DURATION });
        }, 350);
      }
    }
  }, [cvData, selectedId, viewMode, contentMap, setNodes, setEdges, fitView, editMode, onAddChild]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle feature popup
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsFeaturePopupOpen((prev) => !prev);
        return;
      }
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close dialogs or deselect node
      if (e.key === 'Escape') {
        if (createDialogParentId) {
          setCreateDialogParentId(null);
        } else if (isFeaturePopupOpen) {
          setIsFeaturePopupOpen(false);
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
        } else {
          setSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isFeaturePopupOpen, createDialogParentId]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedId((current) => (current === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const onHomeClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const onSearchSelect = useCallback((nodeId: string) => {
    setSelectedId(nodeId);
    setViewMode('graph'); // Switch to graph view if in CV view
  }, []);

  // Handle saving node edits
  const onSaveNode = useCallback(async (id: string, updates: UpdateNodeCommand) => {
    try {
      await cvService.updateNode(id, updates);
      // Refresh data after save
      const newData = await cvService.getCVData();
      setCvData(newData);
      // Refresh content map (content is already updated via setNodeContent in InspectorPanel)
      setContentMap(getAllContent());
      showToast('Changes saved', 'success');
    } catch (error) {
      showError(error);
      throw error; // Re-throw so InspectorPanel can also handle it
    }
  }, [showToast, showError]);

  // Handle deleting a node
  const onDeleteNode = useCallback(async (id: string) => {
    try {
      await cvService.deleteNode(id);
      // Refresh data after delete
      const newData = await cvService.getCVData();
      setCvData(newData);
      setSelectedId(null); // Deselect the deleted node
      showToast('Node deleted', 'success');
    } catch (error) {
      showError(error);
      throw error; // Re-throw so InspectorPanel can also handle it
    }
  }, [showToast, showError]);

  // Handle creating a new node
  const onCreateNode = useCallback(async (type: CVNodeType, data: CreateNodeCommand) => {
    try {
      const newNode = await cvService.createNode(type, data);
      // Refresh data after create
      const newData = await cvService.getCVData();
      setCvData(newData);
      // Select the newly created node
      setSelectedId(newNode.id);
      showToast('Node created', 'success');
    } catch (error) {
      showError(error);
      throw error; // Re-throw so CreateNodeDialog can also handle it
    }
  }, [showToast, showError]);

  // Handle publishing/unpublishing a node
  const onPublishNode = useCallback(async (id: string, publish: boolean) => {
    try {
      await cvService.updateNode(id, {
        attributes: { isDraft: !publish } as unknown as UpdateNodeCommand['attributes'],
      });
      // Refresh data after publish
      const newData = await cvService.getCVData();
      setCvData(newData);
      showToast(publish ? 'Node published' : 'Node unpublished', 'success');
    } catch (error) {
      showError(error);
      throw error; // Re-throw so InspectorPanel can also handle it
    }
  }, [showToast, showError]);

  // Handle node drag start - disable position sync during drag for performance
  const onNodeDragStart = useCallback(() => {
    // eslint-disable-next-line react-hooks/immutability -- refs are mutable containers by design; isDraggingRef is a performance optimization flag
    isDraggingRef.current = true;
  }, []);

  // Handle node drag end - persist position to backend
  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      // eslint-disable-next-line react-hooks/immutability -- refs are mutable containers by design; isDraggingRef is a performance optimization flag
      isDraggingRef.current = false;
      // Sync positions after drag ends
      nodePositionsRef.current = new Map(nodes.map((n) => [n.id, n.position]));

      if (!editMode) return;

      try {
        await cvService.updateNode(node.id, {
          positionX: Math.round(node.position.x),
          positionY: Math.round(node.position.y),
        });
        // Don't refresh all data - just update the local position
        // The position is already updated in the local state by React Flow
      } catch (error) {
        showError(error);
      }
    },
    [editMode, showError, nodes]
  );

  if (!cvData) {
    return (
      <div className="app loading">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={`app ${selectedId && viewMode === 'graph' ? 'panel-open' : ''}`}>
      <ViewToggle
        view={viewMode}
        onChange={setViewMode}
        showEditToggle={showEditToggle}
        editMode={editMode}
        onEditModeChange={setEditMode}
      />
      {viewMode === 'graph' ? (
        <>
          <div className="graph-container">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onNodeDragStart={onNodeDragStart}
              onNodeDragStop={onNodeDragStop}
              nodesDraggable={editMode}
              selectNodesOnDrag={false}
              fitView
              fitViewOptions={{ padding: 0.3, duration: ANIMATION_DURATION }}
            >
              <HomeButton onClick={onHomeClick} visible={selectedId !== null} />
            </ReactFlow>
          </div>
          <InspectorPanel
            selectedId={selectedId}
            cvData={cvData}
            contentMap={contentMap}
            sections={CV_SECTIONS}
            onClose={onHomeClick}
            editModeEnabled={editMode}
            onSave={onSaveNode}
            onDelete={onDeleteNode}
            onCreate={onCreateNode}
            onPublish={onPublishNode}
          />
        </>
      ) : (
        <StandardCVView cvData={cvData} contentMap={contentMap} sections={CV_SECTIONS} />
      )}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={onSearchSelect}
        cvData={cvData}
        contentMap={contentMap}
        sections={CV_SECTIONS}
      />
      <FeatureTogglePopup
        isOpen={isFeaturePopupOpen}
        onClose={() => setIsFeaturePopupOpen(false)}
      />
      {/* Create node dialog triggered from graph + button */}
      {createDialogParentId && cvData.nodes.find((n) => n.id === createDialogParentId) && (
        <CreateNodeDialog
          isOpen={true}
          parentNode={cvData.nodes.find((n) => n.id === createDialogParentId)!}
          onClose={() => setCreateDialogParentId(null)}
          onCreate={onCreateNode}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </ToastProvider>
  );
}

export default App;
