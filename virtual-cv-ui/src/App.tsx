import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import GraphNode from './components/GraphNode';
import { cvService, buildNodes, buildEdges, getAllContent } from './services';
import type { CVData } from './types';

const nodeTypes = {
  graphNode: GraphNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function App() {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Load data on mount (mimics API call)
  useEffect(() => {
    cvService.getCVData().then(setCvData);
  }, []);

  // Rebuild graph when data or selection changes
  useEffect(() => {
    if (cvData) {
      const contentMap = getAllContent();
      setNodes(buildNodes(cvData, selectedId, contentMap));
      setEdges(buildEdges(cvData, selectedId));
    }
  }, [cvData, selectedId, setNodes, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedId((current) => (current === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  if (!cvData) {
    return <div className="app loading">Loading...</div>;
  }

  return (
    <div className="app">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default App;
