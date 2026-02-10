import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import GraphNode from './components/GraphNode';
import ViewToggle, { type ViewMode } from './components/ViewToggle';
import CVPDFView from './components/CVPDFView';
import CVDocument from './components/CVDocument';
import { pdf } from '@react-pdf/renderer';
import SearchDialog from './components/SearchDialog';
import InspectorPanel from './components/InspectorPanel';
import LoadingSkeleton from './components/LoadingSkeleton';
import FeatureTogglePopup from './components/FeatureTogglePopup';
import CreateNodeDialog from './components/CreateNodeDialog';
import { ToastProvider } from './components/Toast';
import { CV_SECTIONS } from './types';
import { Feature, isFeatureEnabled } from './utils/feature-flags';
import { authService, type AuthUser } from './services/auth.service';
import { useGraphState } from './hooks/useGraphState';

const nodeTypes = {
  graphNode: GraphNode,
};

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
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [editMode, setEditMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFeaturePopupOpen, setIsFeaturePopupOpen] = useState(false);
  const [createDialogParentId, setCreateDialogParentId] = useState<string | null>(null);

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(authService.getUser());

  useEffect(() => {
    return authService.onAuthChange((user) => {
      setAuthUser(user);
      if (!user) setEditMode(false);
    });
  }, []);

  const showEditToggle = useMemo(
    () => isFeatureEnabled(Feature.EDIT_MODE) && authUser !== null,
    [authUser]
  );

  const onAddChild = useCallback((parentId: string) => {
    setCreateDialogParentId(parentId);
  }, []);

  const {
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
  } = useGraphState({ editMode, viewMode, onAddChild });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsFeaturePopupOpen((prev) => !prev);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
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
  }, [isSearchOpen, isFeaturePopupOpen, createDialogParentId, setSelectedId]);

  const onHomeClick = useCallback(() => {
    setSelectedId(null);
  }, [setSelectedId]);

  const onSearchSelect = useCallback((nodeId: string) => {
    setSelectedId(nodeId);
    setViewMode('graph');
  }, [setSelectedId]);

  const onDownloadPdf = useCallback(async () => {
    if (!cvData) return;
    const blob = await pdf(
      <CVDocument cvData={cvData} contentMap={contentMap} sections={CV_SECTIONS} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }, [cvData, contentMap]);

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
        onDownloadPdf={onDownloadPdf}
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
        <CVPDFView cvData={cvData} contentMap={contentMap} sections={CV_SECTIONS} />
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
        authUser={authUser}
        onSignOut={() => authService.signOut()}
      />
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
