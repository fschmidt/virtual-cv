import { useCallback, useState, useMemo } from 'react';
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
import GraphNode, { type NodeState, type NodeType } from './components/GraphNode';

const nodeTypes = {
  graphNode: GraphNode,
};

interface NodeData {
  id: string;
  label: string;
  parentId: string | null;
  position: { x: number; y: number };
  nodeType: NodeType;
}

const profileData = {
  name: 'Frank Schmidt',
  title: 'Senior Software Developer',
  subtitle: 'Hands-On Technical Lead',
  experience: '10+ Years Experience',
  email: 'frank@example.com',
  location: 'Berlin, Germany',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
};

const graphData: NodeData[] = [
  // Central node
  { id: 'profile', label: profileData.name, parentId: null, position: { x: 400, y: 280 }, nodeType: 'profile' },

  // Category nodes
  { id: 'work', label: 'Work', parentId: 'profile', position: { x: 120, y: 180 }, nodeType: 'category' },
  { id: 'skills', label: 'Skills', parentId: 'profile', position: { x: 780, y: 120 }, nodeType: 'category' },
  { id: 'projects', label: 'Projects', parentId: 'profile', position: { x: 80, y: 520 }, nodeType: 'category' },
  { id: 'education', label: 'Education', parentId: 'profile', position: { x: 820, y: 480 }, nodeType: 'category' },

  // Work Experience subnodes
  { id: 'job-1', label: 'Senior Dev\nTechCorp', parentId: 'work', position: { x: -180, y: 80 }, nodeType: 'item' },
  { id: 'job-2', label: 'Full Stack\nStartupXYZ', parentId: 'work', position: { x: -220, y: 200 }, nodeType: 'item' },
  { id: 'job-3', label: 'Junior Dev\nAgencyABC', parentId: 'work', position: { x: -160, y: 320 }, nodeType: 'item' },

  // Skills - Frontend
  { id: 'skill-frontend', label: 'Frontend', parentId: 'skills', position: { x: 1020, y: 20 }, nodeType: 'skill-group' },
  { id: 'skill-react', label: 'React', parentId: 'skill-frontend', position: { x: 1220, y: -60 }, nodeType: 'skill' },
  { id: 'skill-typescript', label: 'TypeScript', parentId: 'skill-frontend', position: { x: 1280, y: 40 }, nodeType: 'skill' },
  { id: 'skill-css', label: 'CSS', parentId: 'skill-frontend', position: { x: 1200, y: 120 }, nodeType: 'skill' },

  // Skills - Backend
  { id: 'skill-backend', label: 'Backend', parentId: 'skills', position: { x: 1050, y: 180 }, nodeType: 'skill-group' },
  { id: 'skill-java', label: 'Java', parentId: 'skill-backend', position: { x: 1260, y: 200 }, nodeType: 'skill' },
  { id: 'skill-spring', label: 'Spring', parentId: 'skill-backend', position: { x: 1300, y: 280 }, nodeType: 'skill' },
  { id: 'skill-postgres', label: 'PostgreSQL', parentId: 'skill-backend', position: { x: 1240, y: 360 }, nodeType: 'skill' },

  // Skills - DevOps
  { id: 'skill-devops', label: 'DevOps', parentId: 'skills', position: { x: 980, y: 320 }, nodeType: 'skill-group' },
  { id: 'skill-docker', label: 'Docker', parentId: 'skill-devops', position: { x: 1150, y: 420 }, nodeType: 'skill' },
  { id: 'skill-k8s', label: 'K8s', parentId: 'skill-devops', position: { x: 1080, y: 500 }, nodeType: 'skill' },

  // Projects
  { id: 'project-1', label: 'Virtual CV', parentId: 'projects', position: { x: -140, y: 440 }, nodeType: 'item' },
  { id: 'project-2', label: 'E-Commerce', parentId: 'projects', position: { x: -200, y: 560 }, nodeType: 'item' },
  { id: 'project-3', label: 'CLI Tool', parentId: 'projects', position: { x: -100, y: 680 }, nodeType: 'item' },

  // Education
  { id: 'edu-1', label: 'M.Sc. CS', parentId: 'education', position: { x: 1040, y: 580 }, nodeType: 'item' },
  { id: 'edu-2', label: 'B.Sc. CS', parentId: 'education', position: { x: 980, y: 700 }, nodeType: 'item' },
  { id: 'cert-1', label: 'AWS Cert', parentId: 'education', position: { x: 1120, y: 680 }, nodeType: 'skill' },
];

const edgeDefinitions = [
  { source: 'profile', target: 'work' },
  { source: 'profile', target: 'skills' },
  { source: 'profile', target: 'projects' },
  { source: 'profile', target: 'education' },
  { source: 'work', target: 'job-1' },
  { source: 'work', target: 'job-2' },
  { source: 'work', target: 'job-3' },
  { source: 'skills', target: 'skill-frontend' },
  { source: 'skills', target: 'skill-backend' },
  { source: 'skills', target: 'skill-devops' },
  { source: 'skill-frontend', target: 'skill-react' },
  { source: 'skill-frontend', target: 'skill-typescript' },
  { source: 'skill-frontend', target: 'skill-css' },
  { source: 'skill-backend', target: 'skill-java' },
  { source: 'skill-backend', target: 'skill-spring' },
  { source: 'skill-backend', target: 'skill-postgres' },
  { source: 'skill-devops', target: 'skill-docker' },
  { source: 'skill-devops', target: 'skill-k8s' },
  { source: 'projects', target: 'project-1' },
  { source: 'projects', target: 'project-2' },
  { source: 'projects', target: 'project-3' },
  { source: 'education', target: 'edu-1' },
  { source: 'education', target: 'edu-2' },
  { source: 'education', target: 'cert-1' },
];

function getAncestorIds(nodeId: string): string[] {
  const ancestors: string[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = graphData.find((n) => n.id === currentId);
    if (node?.parentId) {
      ancestors.push(node.parentId);
      currentId = node.parentId;
    } else {
      currentId = null;
    }
  }

  return ancestors;
}

function getNodeState(nodeId: string, selectedId: string | null): NodeState {
  if (!selectedId) {
    if (nodeId === 'profile') return 'detailed';
    const node = graphData.find((n) => n.id === nodeId);
    if (node?.parentId === 'profile') return 'quickview';
    return 'dormant';
  }

  if (nodeId === selectedId) return 'detailed';

  const node = graphData.find((n) => n.id === nodeId);
  if (node?.parentId === selectedId) return 'quickview';

  const ancestors = getAncestorIds(selectedId);
  if (ancestors.includes(nodeId)) return 'quickview';

  return 'dormant';
}

function buildNodes(selectedId: string | null): Node[] {
  return graphData.map((nodeData) => {
    const state = getNodeState(nodeData.id, selectedId);

    const data: Record<string, unknown> = {
      label: nodeData.label,
      nodeType: nodeData.nodeType,
      state,
    };

    // Add profile-specific data
    if (nodeData.nodeType === 'profile') {
      Object.assign(data, profileData);
    }

    return {
      id: nodeData.id,
      type: 'graphNode',
      position: nodeData.position,
      data,
    };
  });
}

function buildEdges(selectedId: string | null): Edge[] {
  return edgeDefinitions.map((edge) => {
    const sourceState = getNodeState(edge.source, selectedId);
    const targetState = getNodeState(edge.target, selectedId);

    const bothVisible = sourceState !== 'dormant' && targetState !== 'dormant';
    const oneVisible = sourceState !== 'dormant' || targetState !== 'dormant';

    let edgeClass = 'edge-dormant';
    if (bothVisible) {
      edgeClass = 'edge-active';
    } else if (oneVisible) {
      edgeClass = 'edge-partial';
    }

    return {
      id: `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'straight',
      className: edgeClass,
    };
  });
}

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialNodes = useMemo(() => buildNodes(selectedId), [selectedId]);
  const initialEdges = useMemo(() => buildEdges(selectedId), [selectedId]);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  useMemo(() => {
    setNodes(buildNodes(selectedId));
    setEdges(buildEdges(selectedId));
  }, [selectedId, setNodes, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedId((current) => (current === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

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
