import { useCallback, useState, useEffect, useMemo } from 'react';
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
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Feature flags
  const editModeEnabled = useMemo(() => isFeatureEnabled(Feature.EDIT_MODE), []);

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

  // Rebuild graph when data or selection changes
  useEffect(() => {
    if (cvData && viewMode === 'graph') {
      setNodes(buildNodes(cvData, selectedId, contentMap, true, INSPECTOR_MODE, editModeEnabled));
      setEdges(buildEdges(cvData, selectedId, editModeEnabled));

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
  }, [cvData, selectedId, viewMode, contentMap, setNodes, setEdges, fitView, editModeEnabled]);

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
      // Escape to close search, feature popup, or deselect node
      if (e.key === 'Escape') {
        if (isFeaturePopupOpen) {
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
  }, [isSearchOpen, isFeaturePopupOpen]);

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
  const onSaveNode = useCallback(async (id: string, updates: UpdateNodeCommand, _content?: string) => {
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

  if (!cvData) {
    return (
      <div className="app loading">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={`app ${selectedId && viewMode === 'graph' ? 'panel-open' : ''}`}>
      <ViewToggle view={viewMode} onChange={setViewMode} />
      {viewMode === 'graph' ? (
        <>
          <div className="graph-container">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
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
            editModeEnabled={editModeEnabled}
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
