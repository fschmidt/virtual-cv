import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
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
import { cvService, buildNodes, buildEdges, getAllContent, type ContentMap } from './services';
import type { CVData } from './types';
import { CV_SECTIONS } from './types';

const nodeTypes = {
  graphNode: GraphNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Animation duration in ms
const ANIMATION_DURATION = 300;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [contentMap, setContentMap] = useState<ContentMap>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Load data on mount (mimics API call)
  useEffect(() => {
    cvService.getCVData().then(setCvData);
  }, []);

  // Load content map on mount
  useEffect(() => {
    setContentMap(getAllContent());
  }, []);

  // Rebuild graph when data or selection changes
  useEffect(() => {
    if (cvData && viewMode === 'graph') {
      setNodes(buildNodes(cvData, selectedId, contentMap));
      setEdges(buildEdges(cvData, selectedId));

      // Animate to fit view after state change
      setTimeout(() => {
        fitView({ padding: 0.3, duration: ANIMATION_DURATION });
      }, 50);
    }
  }, [cvData, selectedId, viewMode, contentMap, setNodes, setEdges, fitView]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close search or deselect node
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else {
          setSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

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

  if (!cvData) {
    return <div className="app loading">Loading...</div>;
  }

  return (
    <div className="app">
      <ViewToggle view={viewMode} onChange={setViewMode} />
      {viewMode === 'graph' ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.3, duration: ANIMATION_DURATION }}
        >
          <Controls />
          <MiniMap />
          <HomeButton onClick={onHomeClick} visible={selectedId !== null} />
        </ReactFlow>
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
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default App;
