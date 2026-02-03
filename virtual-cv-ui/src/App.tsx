import { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';

// Define the graph structure with parent relationships
interface NodeData {
  id: string;
  label: string;
  parentId: string | null;
  position: { x: number; y: number };
  nodeType: 'profile' | 'category' | 'item' | 'skill-group' | 'skill';
}

const graphData: NodeData[] = [
  // Central node
  { id: 'profile', label: 'Frank Schmidt', parentId: null, position: { x: 450, y: 320 }, nodeType: 'profile' },

  // Category nodes - spread around center with organic spacing
  { id: 'work', label: 'Work Experience', parentId: 'profile', position: { x: 120, y: 180 }, nodeType: 'category' },
  { id: 'skills', label: 'Skills', parentId: 'profile', position: { x: 780, y: 120 }, nodeType: 'category' },
  { id: 'projects', label: 'Projects', parentId: 'profile', position: { x: 80, y: 520 }, nodeType: 'category' },
  { id: 'education', label: 'Education', parentId: 'profile', position: { x: 820, y: 480 }, nodeType: 'category' },

  // Work Experience subnodes - fan out to the left
  { id: 'job-1', label: 'Senior Developer\n@ TechCorp', parentId: 'work', position: { x: -180, y: 80 }, nodeType: 'item' },
  { id: 'job-2', label: 'Full Stack Dev\n@ StartupXYZ', parentId: 'work', position: { x: -220, y: 200 }, nodeType: 'item' },
  { id: 'job-3', label: 'Junior Developer\n@ AgencyABC', parentId: 'work', position: { x: -160, y: 320 }, nodeType: 'item' },

  // Skills - Frontend - spread to upper right
  { id: 'skill-frontend', label: 'Frontend', parentId: 'skills', position: { x: 1020, y: 20 }, nodeType: 'skill-group' },
  { id: 'skill-react', label: 'React', parentId: 'skill-frontend', position: { x: 1220, y: -60 }, nodeType: 'skill' },
  { id: 'skill-typescript', label: 'TypeScript', parentId: 'skill-frontend', position: { x: 1280, y: 40 }, nodeType: 'skill' },
  { id: 'skill-css', label: 'CSS/Tailwind', parentId: 'skill-frontend', position: { x: 1200, y: 120 }, nodeType: 'skill' },

  // Skills - Backend - middle right
  { id: 'skill-backend', label: 'Backend', parentId: 'skills', position: { x: 1050, y: 180 }, nodeType: 'skill-group' },
  { id: 'skill-java', label: 'Java', parentId: 'skill-backend', position: { x: 1260, y: 200 }, nodeType: 'skill' },
  { id: 'skill-spring', label: 'Spring Boot', parentId: 'skill-backend', position: { x: 1300, y: 280 }, nodeType: 'skill' },
  { id: 'skill-postgres', label: 'PostgreSQL', parentId: 'skill-backend', position: { x: 1240, y: 360 }, nodeType: 'skill' },

  // Skills - DevOps - lower right of skills
  { id: 'skill-devops', label: 'DevOps', parentId: 'skills', position: { x: 980, y: 320 }, nodeType: 'skill-group' },
  { id: 'skill-docker', label: 'Docker', parentId: 'skill-devops', position: { x: 1150, y: 420 }, nodeType: 'skill' },
  { id: 'skill-k8s', label: 'Kubernetes', parentId: 'skill-devops', position: { x: 1080, y: 500 }, nodeType: 'skill' },

  // Projects - fan out to lower left
  { id: 'project-1', label: 'Virtual CV', parentId: 'projects', position: { x: -140, y: 440 }, nodeType: 'item' },
  { id: 'project-2', label: 'E-Commerce Platform', parentId: 'projects', position: { x: -200, y: 560 }, nodeType: 'item' },
  { id: 'project-3', label: 'Open Source CLI', parentId: 'projects', position: { x: -100, y: 680 }, nodeType: 'item' },

  // Education - fan out to lower right
  { id: 'edu-1', label: 'M.Sc. Computer Science', parentId: 'education', position: { x: 1040, y: 580 }, nodeType: 'item' },
  { id: 'edu-2', label: 'B.Sc. Computer Science', parentId: 'education', position: { x: 980, y: 700 }, nodeType: 'item' },
  { id: 'cert-1', label: 'AWS Certified', parentId: 'education', position: { x: 1120, y: 680 }, nodeType: 'skill' },
];

const edgeDefinitions = [
  // Profile to categories
  { source: 'profile', target: 'work' },
  { source: 'profile', target: 'skills' },
  { source: 'profile', target: 'projects' },
  { source: 'profile', target: 'education' },

  // Work to jobs
  { source: 'work', target: 'job-1' },
  { source: 'work', target: 'job-2' },
  { source: 'work', target: 'job-3' },

  // Skills to skill groups
  { source: 'skills', target: 'skill-frontend' },
  { source: 'skills', target: 'skill-backend' },
  { source: 'skills', target: 'skill-devops' },

  // Frontend skills
  { source: 'skill-frontend', target: 'skill-react' },
  { source: 'skill-frontend', target: 'skill-typescript' },
  { source: 'skill-frontend', target: 'skill-css' },

  // Backend skills
  { source: 'skill-backend', target: 'skill-java' },
  { source: 'skill-backend', target: 'skill-spring' },
  { source: 'skill-backend', target: 'skill-postgres' },

  // DevOps skills
  { source: 'skill-devops', target: 'skill-docker' },
  { source: 'skill-devops', target: 'skill-k8s' },

  // Projects
  { source: 'projects', target: 'project-1' },
  { source: 'projects', target: 'project-2' },
  { source: 'projects', target: 'project-3' },

  // Education
  { source: 'education', target: 'edu-1' },
  { source: 'education', target: 'edu-2' },
  { source: 'education', target: 'cert-1' },
];

type NodeState = 'detailed' | 'quickview' | 'dormant';

// Get all ancestor IDs for a node (path to root)
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
    // Initial state: profile is detailed, its children are quickview
    if (nodeId === 'profile') return 'detailed';
    const node = graphData.find((n) => n.id === nodeId);
    if (node?.parentId === 'profile') return 'quickview';
    return 'dormant';
  }

  // Selected node is detailed
  if (nodeId === selectedId) return 'detailed';

  // Children of selected are quickview
  const node = graphData.find((n) => n.id === nodeId);
  if (node?.parentId === selectedId) return 'quickview';

  // All ancestors of selected are quickview (full path/breadcrumb)
  const ancestors = getAncestorIds(selectedId);
  if (ancestors.includes(nodeId)) return 'quickview';

  return 'dormant';
}

function buildNodes(selectedId: string | null): Node[] {
  return graphData.map((nodeData) => {
    const state = getNodeState(nodeData.id, selectedId);

    return {
      id: nodeData.id,
      type: 'default',
      position: nodeData.position,
      data: {
        label: state === 'dormant' ? '' : nodeData.label,
      },
      className: `node-${state} node-type-${nodeData.nodeType}`,
    };
  });
}

function buildEdges(selectedId: string | null): Edge[] {
  return edgeDefinitions.map((edge) => {
    const sourceState = getNodeState(edge.source, selectedId);
    const targetState = getNodeState(edge.target, selectedId);

    // Determine edge visibility class based on connected node states
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

  // Update nodes and edges when selection changes
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
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default App;
