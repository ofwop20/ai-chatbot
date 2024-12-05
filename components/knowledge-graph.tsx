'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapNode {
  text: string;
  children?: MindMapNode[];
}

interface KnowledgeGraph {
  root: MindMapNode;
}

const SAMPLE: KnowledgeGraph = {
  root: {
    text: "Sample Topic",
    children: [
      {
        text: "Subtopic 1",
        children: [
          { text: "Detail 1" },
          { text: "Detail 2" }
        ]
      },
      {
        text: "Subtopic 2",
        children: []
      }
    ]
  }
};

function convertToReactFlow(data: MindMapNode, parentId?: string, x = 0, y = 0): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const currentId = parentId ? `${parentId}-${data.text}` : data.text;

  nodes.push({
    id: currentId,
    position: { x, y },
    data: { label: data.text },
    style: {
      background: '#60a5fa',
      color: 'white',
      border: '1px solid #3b82f6',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      width: 'auto',
      minWidth: '150px',
      textAlign: 'center' as const,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  });

  if (parentId) {
    edges.push({
      id: `${parentId}-${currentId}`,
      source: parentId,
      target: currentId,
      style: { stroke: '#cbd5e1', strokeWidth: 2 },
      animated: true,
      type: 'smoothstep',
    });
  }

  if (data.children) {
    const spacing = 200;
    data.children.forEach((child, index) => {
      const childY = y + (index - (data.children!.length - 1) / 2) * spacing;
      const childX = x + 300;
      const { nodes: childNodes, edges: childEdges } = convertToReactFlow(child, currentId, childX, childY);
      nodes.push(...childNodes);
      edges.push(...childEdges);
    });
  }

  return { nodes, edges };
}

export function KnowledgeGraph({
  knowledgeGraph = SAMPLE,
  width = 800,
  height = 600
}: {
  knowledgeGraph?: KnowledgeGraph;
  width?: number;
  height?: number;
}) {
  const { nodes: initialNodes, edges: initialEdges } = convertToReactFlow(knowledgeGraph.root);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  return (
    <div 
      className="relative w-full overflow-hidden rounded-lg bg-white/40 p-6 shadow-lg backdrop-blur-sm" 
      style={{ height }}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        preventScrolling={true}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnScroll={true}
        panOnDrag={[1, 2]}
        selectionOnDrag={false}
        attributionPosition="bottom-right"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{ background: 'transparent' }}
      >
        <Background color="#f1f5f9" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
