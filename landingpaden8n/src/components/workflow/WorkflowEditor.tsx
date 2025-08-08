'use client';

import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
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
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import CustomNode from './CustomNode';
import NodeConfigPanel from './NodeConfigPanel';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface WorkflowEditorProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

interface NodeConfig {
  provider?: string;
  model?: string;
  api_key?: string;
  tool_type?: string;
  temperature?: number;
  max_tokens?: number;
  webhook_url?: string;
  schedule_cron?: string;
  format?: string;
  destination?: string;
  config?: Record<string, any>;
}

const WorkflowEditor = React.forwardRef<any, WorkflowEditorProps>(
  ({ workflowName, setWorkflowName, onDragStart }, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [showConfigPanel, setShowConfigPanel] = useState(false);
    const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [executionOutput, setExecutionOutput] = useState<string>('');

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

        const position = reactFlowInstance!.project({
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
            color: getNodeColor(type),
            config: getDefaultConfig(type)
          },
        };

        setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance, setNodes]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setShowConfigPanel(true);
    }, []);

    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
      // Quick edit mode
      setSelectedNode(node);
      setShowConfigPanel(true);
    }, []);

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

    const getDefaultConfig = (type: string): NodeConfig => {
      const defaults: Record<string, NodeConfig> = {
        llm: {
          provider: 'groq',
          model: 'llama3-8b-8192',
          temperature: 0.7,
          max_tokens: 1000,
        },
        tool: {
          tool_type: 'tavily_search',
          config: {},
        },
        memory: {
          config: {
            type: 'sqlite',
            database_path: './memory.db',
          },
        },
        webhook: {
          webhook_url: '',
        },
        schedule: {
          schedule_cron: '0 0 * * *',
        },
        output: {
          format: 'json',
        },
      };
      return defaults[type] || {};
    };

    const updateNodeConfig = useCallback((nodeId: string, config: NodeConfig) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config } }
            : node
        )
      );
      setShowConfigPanel(false);
    }, [setNodes]);

    const runWorkflow = useCallback(async () => {
      setExecutionStatus('running');
      setExecutionOutput('Starting workflow execution...\n');

      try {
        const workflow = {
          name: workflowName,
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.type,
            position: node.position,
            config: node.data.config || {},
          })),
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
          })),
        };

        const response = await fetch('http://localhost:8000/execute-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('lawsa_token') || ''}`,
          },
          body: JSON.stringify({
            graph: workflow,
            input: 'Hello, please help me with this workflow.',
            thread_id: `thread_${Date.now()}`,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        let result = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          result += chunk;
          setExecutionOutput(prev => prev + chunk);
        }

        setExecutionStatus('success');
        setExecutionOutput(prev => prev + '\n✅ Workflow completed successfully!');
      } catch (error) {
        setExecutionStatus('error');
        setExecutionOutput(prev => prev + `\n❌ Error: ${error}`);
        console.error('Workflow execution failed:', error);
      }
    }, [workflowName, nodes, edges]);

    const saveWorkflow = useCallback(async () => {
      try {
        const workflow = {
          name: workflowName,
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.type,
            position: node.position,
            config: node.data.config || {},
          })),
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
          })),
        };

        const response = await fetch('http://localhost:8000/api/workflows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('lawsa_token') || ''}`,
          },
          body: JSON.stringify(workflow),
        });

        if (!response.ok) {
          throw new Error(`Failed to save workflow: ${response.statusText}`);
        }

        alert('Workflow saved successfully!');
      } catch (error) {
        console.error('Failed to save workflow:', error);
        alert(`Failed to save workflow: ${error}`);
      }
    }, [workflowName, nodes, edges]);

    // Expose methods to parent component
    React.useImperativeHandle(ref, () => ({
      exportWorkflow: () => {
        const workflow = {
          name: workflowName,
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.type,
            position: node.position,
            config: node.data.config || {},
          })),
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
          })),
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
      
      runWorkflow,
      saveWorkflow,
      
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
      <div className="h-full w-full flex">
        {/* Main Workflow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
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
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
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

        {/* Configuration Panel */}
        {showConfigPanel && selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={(config) => updateNodeConfig(selectedNode.id, config)}
            onClose={() => setShowConfigPanel(false)}
          />
        )}

        {/* Execution Panel */}
        {executionStatus !== 'idle' && (
          <div className="absolute bottom-4 right-4 w-96 bg-gray-800 border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Execution Log</h3>
              <button
                onClick={() => setExecutionStatus('idle')}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {executionOutput}
            </pre>
          </div>
        )}
      </div>
    );
  }
);

WorkflowEditor.displayName = 'WorkflowEditor';

export default WorkflowEditor;
