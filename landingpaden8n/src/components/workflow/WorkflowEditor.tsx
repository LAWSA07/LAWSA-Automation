'use client';

import React, { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import CustomNode from './CustomNode';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface WorkflowEditorProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

const WorkflowEditor = React.forwardRef<any, WorkflowEditorProps>(
  ({ workflowName, setWorkflowName, onDragStart }, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();

        const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
        const data = event.dataTransfer.getData('application/json');
        
        if (!reactFlowBounds || !data) return;

        const parsedData = JSON.parse(data);
        const type = parsedData.type;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${type}-${Date.now()}`,
          type: 'custom',
          position,
          data: { 
            label: type.charAt(0).toUpperCase() + type.slice(1),
            type: type,
            icon: getNodeIcon(type),
            color: getNodeColor(type)
          },
        };

        setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance, setNodes]
    );

    const getNodeIcon = (type: string) => {
      const icons: Record<string, string> = {
        input: '⚡',
        webhook: '🔗',
        schedule: '⏰',
        agentic: '🧠',
        llm: '🤖',
        memory: '💾',
        tool: '🔧',
        http: '🌐',
        email: '📧',
        output: '📤',
        slack: '💬',
        database: '🗄️',
      };
      return icons[type] || '📦';
    };

    const getNodeColor = (type: string) => {
      const colors: Record<string, string> = {
        input: '#43D675',
        webhook: '#43D675',
        schedule: '#43D675',
        agentic: '#a044ff',
        llm: '#a044ff',
        memory: '#FFD700',
        tool: '#3498db',
        http: '#3498db',
        email: '#3498db',
        output: '#FF9800',
        slack: '#FF9800',
        database: '#FF9800',
      };
      return colors[type] || '#666';
    };

    // Expose methods to parent component
    React.useImperativeHandle(ref, () => ({
      exportWorkflow: () => {
        const workflow = {
          name: workflowName,
          nodes,
          edges,
          timestamp: new Date().toISOString(),
        };
        
        const dataStr = JSON.stringify(workflow, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${workflowName.replace(/\s+/g, '_')}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
      
      runWorkflow: () => {
        console.log('Running workflow:', { nodes, edges });
        // Here you would integrate with your backend API
      },
      
      deleteSelectedNodes: () => {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedNodeIds = selectedNodes.map(node => node.id);
        
        setNodes(nodes => nodes.filter(node => !selectedNodeIds.includes(node.id)));
        setEdges(edges => edges.filter(edge => 
          !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
        ));
      },
    }));

    return (
      <div className="h-full w-full" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-900"
          >
            <Controls className="bg-gray-800 border border-gray-700" />
            <Background color="#374151" gap={20} />
            <MiniMap 
              className="bg-gray-800 border border-gray-700"
              nodeColor="#43D675"
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  }
);

WorkflowEditor.displayName = 'WorkflowEditor';

export default WorkflowEditor;
