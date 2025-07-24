import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../theme.css';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { 
  SleekNodeData, 
  ContextMenu, 
  EditingEdge, 
  HistoryState, 
  WorkflowConfig,
  NodeConfig,
  ChatModelConfig,
  MemoryConfig,
  ToolConfig
} from '../types';
import { applyLayout } from '../utils/layout';
import { 
  AVAILABLE_MODELS, 
  MODELS_BY_PROVIDER, 
  PROVIDERS, 
  MEMORY_BACKENDS, 
  AVAILABLE_TOOLS 
} from '../data/models';
import AgentNode from './AgentNode';
import { useMutation } from '@tanstack/react-query';
import { validateCredential } from '../api/validation';
import API from '../api';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import confetti from 'canvas-confetti';

const nodeTypesList = [
  { type: 'input', label: 'Input' },
  { type: 'agentic', label: 'Agentic' },
  { type: 'memory', label: 'Memory' },
  { type: 'tool', label: 'Tool' },
  { type: 'output', label: 'Output' },
];

let id = 0;
const getId = (): string => `node_${id++}`;

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const nodeTypeIcons: Record<string, string> = {
  input: '🟢',
  agentic: '🤖',
  memory: '🧠',
  tool: '🛠️',
  output: '🔵',
};
const nodeTypeColors: Record<string, string> = {
  input: '#43D675',
  agentic: '#a044ff',
  memory: '#FFD700',
  tool: '#3498db',
  output: '#FF9800',
};
const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  return (
    <aside className="sidebar" style={{ 
      width: 170, 
      padding: 20, 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      zIndex: 30
    }}>
      <div style={{ 
        fontWeight: 700, 
        fontSize: 20, 
        marginBottom: 18, 
        letterSpacing: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8 
      }}>
        <span style={{ fontSize: 22 }}>⚡</span> <span>Workflow</span>
      </div>
      <div style={{ 
        width: '100%', 
        fontWeight: 600, 
        marginBottom: 12, 
        fontSize: 15, 
        color: '#aaa', 
        letterSpacing: 0.5 
      }}>
        Nodes
      </div>
      {nodeTypesList.map((node) => (
        <div
          key={node.type}
          title={`Drag to add a ${node.label} node`}
          style={{
            padding: '12px 10px',
            marginBottom: 12,
            background: '#282834cc',
            borderRadius: 10,
            cursor: 'grab',
            userSelect: 'none',
            textAlign: 'center',
            fontWeight: 500,
            fontSize: 16,
            border: '1.5px solid #23232b',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
            boxShadow: '0 2px 8px rgba(40,40,60,0.08)',
          }}
          draggable
          onDragStart={(e) => onDragStart(e, node.type)}
          onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.background = '#353545ee')}
          onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.background = '#282834cc')}
        >
          <span style={{
            background: nodeTypeColors[node.type],
            color: '#fff',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            marginRight: 8
          }}>{nodeTypeIcons[node.type]}</span>
          {node.label}
        </div>
      ))}
    </aside>
  );
};

// n8n-style connection logic
function n8nIsValidConnection(
  connection: Connection, 
  nodes: Node<SleekNodeData>[], 
  edges: Edge[]
): boolean {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  if (!sourceNode || !targetNode) return false;
  if (connection.source === connection.target) return false;
  
  // Input: can only be source, not target
  if (targetNode.type === 'input') return false;
  // Output: can only be target, not source
  if (sourceNode.type === 'output') return false;
  // No input-to-input
  if (sourceNode.type === 'input' && targetNode.type === 'input') return false;
  // No output as source
  if (sourceNode.type === 'output') return false;
  
  // No cycles
  const visited = new Set<string>();
  function dfs(nodeId: string): boolean {
    if (nodeId === connection.source) return true;
    for (const e of edges) {
      if (e.source === nodeId && !visited.has(e.target)) {
        visited.add(e.target);
        if (dfs(e.target)) return true;
      }
    }
    return false;
  }
  if (connection.target && dfs(connection.target)) return false;
  
  return true;
}

// Memoize nodeTypes and edgeTypes to avoid React Flow warning
const WorkflowEditor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node<SleekNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalLabel, setModalLabel] = useState<string>('');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [modalConfig, setModalConfig] = useState<NodeConfig>({});
  // History state for undo/redo functionality
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [editingEdge, setEditingEdge] = useState<EditingEdge | null>(null);
  const [focusedHandle, setFocusedHandle] = useState<string | null>(null);
  const chatModelRef = useRef<HTMLDivElement>(null);
  const memoryRef = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  // Add validation logic inside WorkflowEditor component
  const llmValidation = useMutation({
    mutationFn: ({ provider, apiKey }) =>
      validateCredential({ type: 'llm', provider, credentials: { apiKey } }),
  });
  const memoryValidation = useMutation({
    mutationFn: ({ type, connection_string }) =>
      validateCredential({ type: 'memory', provider: type, credentials: { connection_string } }),
  });
  const toolValidation = useMutation({
    mutationFn: ({ type, api_key }) =>
      validateCredential({ type: 'tool', provider: type, credentials: { api_key } }),
  });
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [newCred, setNewCred] = useState({ name: '', type: '', data: '' });
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [typewriterOutput, setTypewriterOutput] = useState('');
  const typewriterTimeout = useRef<NodeJS.Timeout | null>(null);
  const [recentlyAddedNodeIds, setRecentlyAddedNodeIds] = useState<string[]>([]);

  // 1. Move onHandleContextMenu above nodeTypes
  const onHandleContextMenu = useCallback((event: React.MouseEvent, nodeId: string, handleId: string) => {
    event.preventDefault();
    setContextMenu({ type: 'handle', id: nodeId, x: event.clientX, y: event.clientY, handleId });
  }, []);

  // Move nodeTypes and edgeTypes outside the WorkflowEditor component to fix React Flow memoization issues
  const nodeTypes = {
    input: (props) => <CustomNode {...props} className={recentlyAddedNodeIds.includes(props.id) ? 'sleek-node node-animate' : 'sleek-node'} isValidConnection={n8nIsValidConnection} />, 
    agentic: (props) => <AgentNode {...props} className={recentlyAddedNodeIds.includes(props.id) ? 'sleek-node node-animate' : 'sleek-node'} onHandleContextMenu={() => {}} />, 
    memory: (props) => <CustomNode {...props} className={recentlyAddedNodeIds.includes(props.id) ? 'sleek-node node-animate' : 'sleek-node'} isValidConnection={n8nIsValidConnection} />, 
    tool: (props) => <CustomNode {...props} className={recentlyAddedNodeIds.includes(props.id) ? 'sleek-node node-animate' : 'sleek-node'} isValidConnection={n8nIsValidConnection} />, 
    output: (props) => <CustomNode {...props} className={recentlyAddedNodeIds.includes(props.id) ? 'sleek-node node-animate' : 'sleek-node'} isValidConnection={n8nIsValidConnection} />, 
  };
  const edgeTypes = {
    custom: CustomEdge,
  };

  // Event handlers
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnectValidated = useCallback(
    (connection: Connection) => {
      if (n8nIsValidConnection(connection, nodes, edges)) {
        const newEdge: Edge = {
          ...connection,
          id: `edge_${Date.now()}`,
          type: 'custom',
          data: { label: '' },
          source: connection.source || '',
          target: connection.target || '',
        };
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [nodes, edges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // When adding a new node (e.g., in onDrop or handleDragStart), add its ID to recentlyAddedNodeIds
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode: Node<SleekNodeData> = {
        id: getId(),
        type,
        position,
        data: { 
          label: nodeTypesList.find((n) => n.type === type)?.label || type 
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
      setRecentlyAddedNodeIds((ids) => [...ids, newNode.id]);
    },
    [reactFlowInstance]
  );

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Export config as JSON and download
  const handleExportConfig = () => {
    const config: WorkflowConfig = {
      nodes: nodes.map(({ id, type, data, position }) => ({ 
        id, 
        type: type || 'default', 
        label: data.label, 
        position 
      })),
      edges: edges.map(({ id, source, target }) => ({ id, source, target })),
    };
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Node click handler
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<SleekNodeData>) => {
    setSelectedNodeId(node.id);
    setModalLabel(node.data.label || '');
    setModalConfig(node.data.config || {});
  }, []);

  // Save modal changes
  const handleSaveModal = () => {
    setNodes((nds) => {
      let updated = nds.map((n) =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, label: modalLabel, config: modalConfig } }
          : n
      );

      // Find the Agentic node
      const agentNode = updated.find((n) => n.id === selectedNodeId);
      if (!agentNode) return updated;
      const agentPos = agentNode.position;

      // Helper to generate unique subnode IDs
      const subId = (type, key) => `${selectedNodeId}__${type}__${key}`;

      // 1. Chat Model subnodes
      const chatModels = modalConfig.models || [];
      chatModels.forEach((model, idx) => {
        const nodeId = subId('chatmodel', idx);
        if (!updated.find((n) => n.id === nodeId)) {
          updated.push({
            id: nodeId,
            type: 'chatmodel',
            position: { x: agentPos.x - 120 + idx * 120, y: agentPos.y + 180 },
            data: {
              label: `${model.provider ? model.provider.charAt(0).toUpperCase() + model.provider.slice(1) : 'Chat'} Chat Model`,
              config: model,
            },
          });
        }
      });
      // Remove chat model subnodes that are no longer in config
      updated = updated.filter((n) =>
        !n.id.startsWith(subId('chatmodel', '')) ||
        chatModels.some((_, idx) => n.id === subId('chatmodel', idx))
      );

      // 2. Memory subnode
      if (modalConfig.memory && modalConfig.memoryConfig?.type) {
        const nodeId = subId('memory', modalConfig.memoryConfig.type);
        if (!updated.find((n) => n.id === nodeId)) {
          updated.push({
            id: nodeId,
            type: 'memory',
            position: { x: agentPos.x, y: agentPos.y + 180 },
            data: {
              label: `${modalConfig.memoryConfig.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Memory`,
              config: { memoryConfig: modalConfig.memoryConfig },
            },
          });
        }
      } else {
        // Remove memory subnode if memory is disabled
        updated = updated.filter((n) => !n.id.startsWith(subId('memory', '')));
      }

      // 3. Tool subnode
      if (modalConfig.toolConfig?.type) {
        const nodeId = subId('tool', modalConfig.toolConfig.type);
        if (!updated.find((n) => n.id === nodeId)) {
          updated.push({
            id: nodeId,
            type: 'tool',
            position: { x: agentPos.x + 120, y: agentPos.y + 180 },
            data: {
              label: `${modalConfig.toolConfig.type.charAt(0).toUpperCase() + modalConfig.toolConfig.type.slice(1)} Tool`,
              config: { toolType: modalConfig.toolConfig.type, ...modalConfig.toolConfig.config },
            },
          });
        }
      } else {
        // Remove tool subnode if not configured
        updated = updated.filter((n) => !n.id.startsWith(subId('tool', '')));
      }

      return updated;
    });

    // After updating nodes, update edges to connect subnodes to the correct handle
    setEdges((eds) => {
      let newEdges = eds.filter(
        (e) =>
          !e.source.startsWith(selectedNodeId) ||
          (e.sourceHandle !== 'chat-model' && e.sourceHandle !== 'memory' && e.sourceHandle !== 'tool')
      );
      // Chat Model edges
      (modalConfig.models || []).forEach((_, idx) => {
        newEdges.push({
          id: `${selectedNodeId}__chatmodel__${idx}__edge`,
          source: selectedNodeId,
          sourceHandle: 'chat-model',
          target: `${selectedNodeId}__chatmodel__${idx}`,
          type: 'custom',
          style: { strokeDasharray: '5,5', stroke: '#a044ff' },
          data: { label: 'Model' },
        });
      });
      // Memory edge
      if (modalConfig.memory && modalConfig.memoryConfig?.type) {
        newEdges.push({
          id: `${selectedNodeId}__memory__${modalConfig.memoryConfig.type}__edge`,
          source: selectedNodeId,
          sourceHandle: 'memory',
          target: `${selectedNodeId}__memory__${modalConfig.memoryConfig.type}`,
          type: 'custom',
          style: { strokeDasharray: '5,5', stroke: '#43D675' },
          data: { label: 'Memory' },
        });
      }
      // Tool edge
      if (modalConfig.toolConfig?.type) {
        newEdges.push({
          id: `${selectedNodeId}__tool__${modalConfig.toolConfig.type}__edge`,
          source: selectedNodeId,
          sourceHandle: 'tool',
          target: `${selectedNodeId}__tool__${modalConfig.toolConfig.type}`,
          type: 'custom',
          style: { strokeDasharray: '5,5', stroke: '#FFD700' },
          data: { label: 'Tool' },
        });
      }
      return newEdges;
    });

    setSelectedNodeId(null);
  };

  // Close modal
  const handleCloseModal = () => setSelectedNodeId(null);

  // Track selection
  const onSelectionChange = useCallback(({ nodes: selNodes, edges: selEdges }: { nodes: Node[], edges: Edge[] }) => {
    setSelectedNodes(selNodes.map(n => n.id));
    setSelectedEdges(selEdges.map(e => e.id));
  }, []);

  // Keyboard delete handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
        setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
        setEdges((eds) => eds.filter((e) => !selectedEdges.includes(e.id) && !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, selectedEdges]);

  // Helper: get node type
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const nodeType = selectedNode?.type;

  // Track changes for undo/redo
  useEffect(() => {
    setHistory([{ nodes, edges }]);
    setFuture([]);
  }, []);

  // Push to history on node/edge change
  const pushHistory = useCallback((newNodes: Node<SleekNodeData>[], newEdges: Edge[]) => {
    setHistory(h => [...h, { nodes: newNodes, edges: newEdges }]);
    setFuture([]);
  }, []);

  // Undo/redo handlers
  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length <= 1) return h;
      setFuture(f => [h[h.length - 1], ...f]);
      const prev = h[h.length - 2];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      return h.slice(0, h.length - 1);
    });
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistory(h => [...h, next]);
      return f.slice(1);
    });
  }, [setNodes, setEdges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Wrap node/edge changes to push to history
  const onNodesChangeWithHistory = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    setTimeout(() => pushHistory(nodes, edges), 0);
  }, [onNodesChange, nodes, edges, pushHistory]);

  const onEdgesChangeWithHistory = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    setTimeout(() => pushHistory(nodes, edges), 0);
  }, [onEdgesChange, nodes, edges, pushHistory]);

  // Context menu handlers
  const handleDeleteContext = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'node') {
      setNodes(nds => nds.filter(n => n.id !== contextMenu.id));
      setEdges(eds => eds.filter(e => e.source !== contextMenu.id && e.target !== contextMenu.id));
    } else if (contextMenu.type === 'edge') {
      setEdges(eds => eds.filter(e => e.id !== contextMenu.id));
    }
    setContextMenu(null);
  };

  const handleDuplicateNode = () => {
    if (!contextMenu || contextMenu.type !== 'node') return;
    setNodes(nds => {
      const orig = nds.find(n => n.id === contextMenu.id);
      if (!orig) return nds;
      const newNode = {
        ...orig,
        id: getId(),
        position: { x: orig.position.x + 40, y: orig.position.y + 40 },
      };
      return [...nds, newNode];
    });
    setContextMenu(null);
  };

  const handleCloseContext = () => setContextMenu(null);

  // Edge label double-click handler
  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    const rect = (event.target as Element).getBoundingClientRect();
    setEditingEdge({
      id: edge.id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      value: edge.data?.label || '',
    });
  }, []);

  // Save edge label
  const handleSaveEdgeLabel = () => {
    if (!editingEdge) return;
    setEdges(eds => eds.map(e => e.id === editingEdge.id ? { ...e, data: { ...e.data, label: editingEdge.value } } : e));
    setEditingEdge(null);
  };

  // Layout functions
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = applyLayout(nodes, edges, 'hierarchical');
    setNodes(layoutedNodes);
  }, [nodes, edges]);

  const handleForceLayout = useCallback(() => {
    const layoutedNodes = applyLayout(nodes, edges, 'force');
    setNodes(layoutedNodes);
  }, [nodes, edges]);

  // Add these near the top of the WorkflowEditor component, after useState/useCallback hooks
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ type: 'node', id: node.id, x: event.clientX, y: event.clientY });
  }, []);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({ type: 'edge', id: edge.id, x: event.clientX, y: event.clientY });
  }, []);

  // Scroll and highlight when modal opens with focusedHandle
  useEffect(() => {
    if (!selectedNodeId || !focusedHandle) return;
    let ref: React.RefObject<HTMLDivElement> | null = null;
    if (focusedHandle === 'chat-model') ref = chatModelRef;
    if (focusedHandle === 'memory') ref = memoryRef;
    if (focusedHandle === 'tool') ref = toolRef;
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedSection(focusedHandle);
      setTimeout(() => setHighlightedSection(null), 2000);
    }
  }, [selectedNodeId, focusedHandle]);

  // Reset focusedHandle when modal closes
  useEffect(() => {
    if (!selectedNodeId) setFocusedHandle(null);
  }, [selectedNodeId]);

  useEffect(() => {
    if (showCredentials) {
      API.listCredentials().then(setCredentials).catch(() => setCredentials([]));
    }
  }, [showCredentials]);
  const handleAddCredential = async () => {
    try {
      await API.createCredential(newCred.name, newCred.type, newCred.data);
      setNewCred({ name: '', type: '', data: '' });
      const creds = await API.listCredentials();
      setCredentials(creds);
      toast.success('Credential added!');
    } catch (err) {
      toast.error('Failed to add credential: ' + err);
    }
  };

  const handleDeleteCredential = async (id) => {
    try {
      await API.deleteCredential(id);
      setCredentials(await API.listCredentials());
      toast.success('Credential deleted!');
    } catch (err) {
      toast.error('Failed to delete credential: ' + err);
    }
  };
  const [editingCred, setEditingCred] = useState(null);
  const [editCredData, setEditCredData] = useState({ name: '', type: '', data: '' });
  const handleEditCredential = (cred) => {
    setEditingCred(cred._id);
    setEditCredData({ name: cred.name, type: cred.type || '', data: cred.data || '' });
  };
  const handleSaveEditCredential = async () => {
    try {
      await API.createCredential(editCredData.name, editCredData.type, editCredData.data); // Replace with update API if available
      setEditingCred(null);
      setEditCredData({ name: '', type: '', data: '' });
      setCredentials(await API.listCredentials());
      toast.success('Credential updated!');
    } catch (err) {
      toast.error('Failed to update credential: ' + err);
    }
  };

  const handleRunWorkflow = async () => {
    // Build workflow JSON from nodes/edges (simplified for demo)
    const workflow = { nodes, edges };
    setExecutionOutput('Running...');
    setTypewriterOutput('');
    try {
      const res = await fetch('http://localhost:8000/execute-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      if (!res.body) { setExecutionOutput('No streaming output.'); toast.error('No streaming output.'); return; }
      const reader = res.body.getReader();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
        // Typewriter effect: animate output
        if (typewriterTimeout.current) clearTimeout(typewriterTimeout.current);
        let i = 0;
        const animate = () => {
          setTypewriterOutput(result.slice(0, i));
          if (i < result.length) {
            typewriterTimeout.current = setTimeout(animate, 8);
            i++;
          }
        };
        animate();
      }
      setExecutionOutput(result);
      toast.success('Workflow executed successfully!');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      setExecutionOutput('Error: ' + err);
      toast.error('Workflow execution failed: ' + err);
    }
  };

  // After a short delay, remove node IDs from recentlyAddedNodeIds so animation only plays once
  useEffect(() => {
    if (recentlyAddedNodeIds.length === 0) return;
    const timeout = setTimeout(() => setRecentlyAddedNodeIds([]), 500);
    return () => clearTimeout(timeout);
  }, [recentlyAddedNodeIds]);

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 22, letterSpacing: 1, color: 'var(--accent-primary)' }}>
          <span style={{ fontSize: 28 }}>⚡</span> lawsa
        </div>
        <input
          value={workflowName}
          onChange={e => setWorkflowName(e.target.value)}
          style={{
            marginLeft: 32,
            fontSize: 18,
            fontWeight: 700,
            background: 'rgba(24,24,32,0.85)',
            color: '#fff',
            border: '1.5px solid #353545',
            borderRadius: 8,
            padding: '8px 18px',
            minWidth: 220,
            outline: 'none',
            boxShadow: '0 2px 8px rgba(40,40,60,0.08)'
          }}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <button
            onClick={handleExportConfig}
            title="Export the current workflow as a JSON config file"
            style={{
              background: 'linear-gradient(90deg, #a044ff 0%, #6a3093 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(160,68,255,0.10)'
            }}
          >
            Export
          </button>
          <button
            onClick={handleRunWorkflow}
            title="Run the current workflow"
            style={{
              background: 'linear-gradient(90deg, #FFD700 0%, #FF9800 100%)',
              color: '#23232b',
              border: 'none',
              borderRadius: 8,
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255,215,0,0.10)'
            }}
          >
            Run
          </button>
          <button
            onClick={() => setShowCredentials(true)}
            title="Manage credentials"
            style={{
              background: 'linear-gradient(90deg, #FFD700 0%, #43D675 100%)',
              color: '#23232b',
              border: 'none',
              borderRadius: 8,
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(67,214,117,0.10)'
            }}
          >
            Credentials
          </button>
        </div>
      </div>
      <div className="sidebar">
        <Sidebar onDragStart={handleDragStart} />
      </div>
      <div className="main-canvas">
        <div style={{ height: '100%', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWithHistory}
            onEdgesChange={onEdgesChangeWithHistory}
            onConnect={onConnectValidated}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            onNodeClick={onNodeClick}
            onSelectionChange={onSelectionChange}
            panOnScroll
            panOnDrag
            zoomOnScroll
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onEdgeDoubleClick={onEdgeDoubleClick}
          >
            <Controls />
            <MiniMap 
              style={{ bottom: 16, right: 16 }} 
              zoomable 
              pannable 
              maskColor="rgba(40,40,60,0.12)" 
              title="Workflow Minimap: Drag or click to navigate" 
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={2} color="#3a3a4a" />
          </ReactFlow>
          
          {/* Edge label input */}
          {editingEdge && (
            <div style={{ position: 'fixed', left: editingEdge.x, top: editingEdge.y, zIndex: 300 }}>
              <input
                value={editingEdge.value}
                autoFocus
                onChange={e => setEditingEdge(ed => ed ? { ...ed, value: e.target.value } : null)}
                onBlur={handleSaveEdgeLabel}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdgeLabel(); }}
                style={{ 
                  padding: '4px 10px', 
                  borderRadius: 6, 
                  border: '1px solid #888', 
                  fontSize: 14, 
                  background: '#23232b', 
                  color: '#fff', 
                  minWidth: 80 
                }}
              />
            </div>
          )}
          
          {/* Context Menu */}
          {contextMenu && (
            <div
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                zIndex: 200,
                background: '#23232b',
                border: '1px solid #444',
                borderRadius: 7,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                minWidth: 120,
                padding: 0,
              }}
              onClick={e => e.stopPropagation()}
            >
              {contextMenu.type === 'node' && (
                <button
                  onClick={() => {
                    setSelectedNodeId(contextMenu.id);
                    setContextMenu(null);
                  }}
                  style={{
                    width: '100%',
                    background: 'none',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: '1px solid #333',
                  }}
                >
                  Configure
                </button>
              )}
              <button 
                onClick={handleDeleteContext} 
                style={{ 
                  width: '100%', 
                  background: 'none', 
                  color: '#ff6b6b', 
                  border: 'none', 
                  padding: '12px 18px', 
                  fontWeight: 600, 
                  fontSize: 15, 
                  cursor: 'pointer', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #333' 
                }}
              >
                Delete
              </button>
              {contextMenu.type === 'node' && (
                <button 
                  onClick={handleDuplicateNode} 
                  style={{ 
                    width: '100%', 
                    background: 'none', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '12px 18px', 
                    fontWeight: 600, 
                    fontSize: 15, 
                    cursor: 'pointer', 
                    textAlign: 'left' 
                  }}
                >
                  Duplicate
                </button>
              )}
            </div>
          )}
          
          {/* Node Config Side Panel */}
          {selectedNodeId && (
            <div style={{
              position: 'fixed',
              top: 64,
              right: 0,
              bottom: 0,
              width: 420,
              background: 'rgba(35,35,43,0.98)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              padding: '32px 32px 32px 32px',
              transform: selectedNodeId ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.32s cubic-bezier(.4,1.4,.6,1)',
              overflowY: 'auto',
              minHeight: 'calc(100vh - 64px)'
            }}>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, color: 'var(--accent-primary)' }}>Edit Node</div>
              <label style={{ fontSize: 15, marginBottom: 4, color: '#fff' }}>Label</label>
              <input
                value={modalLabel}
                onChange={e => setModalLabel(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1.5px solid #444',
                  background: '#181820',
                  color: '#fff',
                  fontSize: 17,
                  marginBottom: 12,
                  fontWeight: 600
                }}
              />
              
              {/* Advanced config for Agentic node */}
              {nodeType === 'agentic' && (
                <>
                  <label style={{ fontSize: 14, marginBottom: 4 }}>Enable Memory</label>
                  <input
                    type="checkbox"
                    checked={!!modalConfig.memory}
                    onChange={e => setModalConfig(cfg => ({ ...cfg, memory: e.target.checked }))}
                    style={{ marginBottom: 8 }}
                  />
                  
                  {/* Memory Configuration */}
                  {modalConfig.memory && (
                    <>
                      <label style={{ fontSize: 14, marginBottom: 4 }}>Memory Backend</label>
                      <select
                        value={modalConfig.memoryConfig?.type || ''}
                        onChange={e => setModalConfig(cfg => ({ 
                          ...cfg, 
                          memoryConfig: { 
                            type: e.target.value, 
                            config: {} 
                          } 
                        }))}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15, marginBottom: 8 }}
                      >
                        <option value="">Select Memory Backend</option>
                        {MEMORY_BACKENDS.map(backend => (
                          <option key={backend.name} value={backend.name}>
                            {backend.displayName}
                          </option>
                        ))}
                      </select>
                      
                      {/* Memory Config Fields */}
                      {modalConfig.memoryConfig?.type && (
                        <div style={{ marginBottom: 16 }}>
                          {MEMORY_BACKENDS.find(b => b.name === modalConfig.memoryConfig?.type)?.configFields
                            .filter(field => field.name === 'connection_string')
                            .map(field => (
                              <div key={field.name} style={{ marginBottom: 8 }}>
                                <label style={{ fontSize: 12, marginBottom: 2, display: 'block' }}>{field.label}</label>
                                <input
                                  type={field.type === 'number' ? 'number' : 'text'}
                                  value={modalConfig.memoryConfig?.config[field.name] || field.default || ''}
                                  onChange={e => setModalConfig(cfg => ({
                                    ...cfg,
                                    memoryConfig: {
                                      ...cfg.memoryConfig!,
                                      config: {
                                        ...cfg.memoryConfig!.config,
                                        [field.name]: e.target.value
                                      }
                                    }
                                  }))}
                                  onBlur={() => memoryValidation.mutate({ type: modalConfig.memoryConfig?.type, connection_string: modalConfig.memoryConfig?.config.connection_string || '' })}
                                  placeholder={field.default?.toString()}
                                  style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    borderRadius: 4,
                                    border: memoryValidation.isPending
                                      ? 'blue'
                                      : memoryValidation.isError
                                      ? 'red'
                                      : memoryValidation.isSuccess
                                      ? 'green'
                                      : 'grey',
                                    background: '#181820',
                                    color: '#fff',
                                    fontSize: 14
                                  }}
                                />
                                {memoryValidation.isPending && <span>Checking...</span>}
                                {memoryValidation.isError && <span style={{ color: 'red' }}>{memoryValidation.error.message}</span>}
                                {memoryValidation.isSuccess && <span style={{ color: 'green' }}>Connected</span>}
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Chat Models Configuration */}
                  <label style={{ fontSize: 14, marginBottom: 4 }}>Chat Models</label>
                  <div ref={chatModelRef} style={{ boxShadow: highlightedSection === 'chat-model' ? '0 0 0 3px #a044ff' : undefined, borderRadius: 8, transition: 'box-shadow 0.3s' }}>
                    {(modalConfig.models || []).map((model: ChatModelConfig, idx: number) => (
                      <div key={idx} style={{ border: '1px solid #444', borderRadius: 6, padding: 12, marginBottom: 8, background: '#1a1a1a' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <select
                            value={model.provider || ''}
                            onChange={e => setModalConfig(cfg => {
                              const models = [...(cfg.models || [])];
                              models[idx] = { ...models[idx], provider: e.target.value, model: '' };
                              return { ...cfg, models };
                            })}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14 }}
                          >
                            <option value="">Select Provider</option>
                            {PROVIDERS.map(provider => (
                              <option key={provider.name} value={provider.name}>
                                {provider.displayName}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setModalConfig(cfg => {
                              const models = [...(cfg.models || [])];
                              models.splice(idx, 1);
                              return { ...cfg, models };
                            })}
                            style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '0 8px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </div>
                        
                        {model.provider && (
                          <select
                            value={model.model || ''}
                            onChange={e => setModalConfig(cfg => {
                              const models = [...(cfg.models || [])];
                              models[idx] = { ...models[idx], model: e.target.value };
                              return { ...cfg, models };
                            })}
                            style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14, marginBottom: 8 }}
                          >
                            <option value="">Select Model</option>
                            {MODELS_BY_PROVIDER[model.provider]?.map(m => (
                              <option key={m.name} value={m.name}>
                                {m.name} ({m.contextLength?.toLocaleString()} tokens)
                              </option>
                            ))}
                          </select>
                        )}
                        
                        <input
                          value={model.apiKey || ''}
                          onChange={e => setModalConfig(cfg => {
                            const models = [...(cfg.models || [])];
                            models[idx] = { ...models[idx], apiKey: e.target.value };
                            return { ...cfg, models };
                          })}
                          onBlur={() => llmValidation.mutate({ provider: model.provider, apiKey: e.target.value })}
                          placeholder="API Key"
                          type="password"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: 4,
                            border: llmValidation.isPending
                              ? 'blue'
                              : llmValidation.isError
                              ? 'red'
                              : llmValidation.isSuccess
                              ? 'green'
                              : 'grey',
                          }}
                        />
                        {llmValidation.isPending && <span>Checking...</span>}
                        {llmValidation.isError && <span style={{ color: 'red' }}>{llmValidation.error.message}</span>}
                        {llmValidation.isSuccess && <span style={{ color: 'green' }}>Connected</span>}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => setModalConfig(cfg => ({ 
                        ...cfg, 
                        models: [...(cfg.models || []), { provider: '', model: '', apiKey: '' }] 
                      }))}
                      style={{ background: '#43D675', color: '#181820', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 8 }}
                    >
                      + Add Chat Model
                    </button>
                  </div>
                  
                  {/* Tool Configuration */}
                  <label style={{ fontSize: 14, marginBottom: 4 }}>Tools</label>
                  <select
                    value={modalConfig.toolConfig?.type || ''}
                    onChange={e => setModalConfig(cfg => ({ 
                      ...cfg, 
                      toolConfig: { 
                        type: e.target.value, 
                        config: {} 
                      } 
                    }))}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15, marginBottom: 8 }}
                  >
                    <option value="">Select Tool</option>
                    {AVAILABLE_TOOLS.map(tool => (
                      <option key={tool.name} value={tool.name}>
                        {tool.displayName}
                      </option>
                    ))}
                  </select>
                  
                  {/* Tool Config Fields */}
                  {modalConfig.toolConfig?.type && (
                    <div style={{ marginBottom: 16 }}>
                      {/* Credential selection dropdown */}
                      <label style={{ fontSize: 12, marginBottom: 2, display: 'block' }}>Credential</label>
                      <select
                        value={modalConfig.toolConfig?.config.credentialId || ''}
                        onChange={e => setModalConfig(cfg => ({
                          ...cfg,
                          toolConfig: {
                            ...cfg.toolConfig!,
                            config: {
                              ...cfg.toolConfig!.config,
                              credentialId: e.target.value
                            }
                          }
                        }))}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14, marginBottom: 8 }}
                      >
                        <option value="">Select Credential</option>
                        {credentials.map(cred => (
                          <option key={cred._id} value={cred._id}>{cred.name} ({cred.type || 'N/A'})</option>
                        ))}
                      </select>
                      {/* Existing tool config fields */}
                      {AVAILABLE_TOOLS.find(t => t.name === modalConfig.toolConfig?.type)?.configFields.map(field => (
                        <div key={field.name} style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: 12, marginBottom: 2, display: 'block' }}>{field.label}</label>
                          {field.type === 'select' ? (
                            <select
                              value={modalConfig.toolConfig?.config[field.name] || field.default || ''}
                              onChange={e => setModalConfig(cfg => ({
                                ...cfg,
                                toolConfig: {
                                  ...cfg.toolConfig!,
                                  config: {
                                    ...cfg.toolConfig!.config,
                                    [field.name]: e.target.value
                                  }
                                }
                              }))}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14 }}
                            >
                              {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.name === 'api_key' ? 'password' : 'text'}
                              value={modalConfig.toolConfig?.config[field.name] || field.default || ''}
                              onChange={e => setModalConfig(cfg => ({
                                ...cfg,
                                toolConfig: {
                                  ...cfg.toolConfig!,
                                  config: {
                                    ...cfg.toolConfig!.config,
                                    [field.name]: e.target.value
                                  }
                                }
                              }))}
                              placeholder={field.default?.toString()}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14 }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Advanced config for Tool node */}
              {nodeType === 'tool' && (
                <>
                  <label style={{ fontSize: 14, marginBottom: 4 }}>Tool Type</label>
                  <select
                    value={modalConfig.toolType || ''}
                    onChange={e => setModalConfig(cfg => ({ ...cfg, toolType: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15, marginBottom: 8 }}
                  >
                    <option value="">Select Tool</option>
                    <option value="tavily">Tavily Web Search</option>
                  </select>
                  
                  {modalConfig.toolType === 'tavily' && (
                    <>
                      <label style={{ fontSize: 14, marginBottom: 4 }}>Tavily API Key</label>
                      <input
                        value={modalConfig.apiKey || ''}
                        onChange={e => setModalConfig(cfg => ({ ...cfg, apiKey: e.target.value }))}
                        placeholder="Your Tavily API Key"
                        type="password"
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15, marginBottom: 8 }}
                      />
                      <label style={{ fontSize: 14, marginBottom: 4 }}>Search Depth</label>
                      <select
                        value={modalConfig.searchDepth || 'basic'}
                        onChange={e => setModalConfig(cfg => ({ ...cfg, searchDepth: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15, marginBottom: 8 }}
                      >
                        <option value="basic">Basic</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </>
                  )}
                </>
              )}
              
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={handleSaveModal} style={{ background: 'var(--accent-primary)', color: '#181820', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Save</button>
                <button onClick={handleCloseModal} style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
          
          {/* Handle context menu */}
          {contextMenu && contextMenu.type === 'handle' && (
            <div
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                zIndex: 200,
                background: '#23232b',
                border: '1px solid #444',
                borderRadius: 7,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                minWidth: 160,
                padding: 0,
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedNodeId(contextMenu.id);
                  setFocusedHandle(contextMenu.handleId || null);
                  setContextMenu(null);
                }}
                style={{
                  width: '100%',
                  background: 'none',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 18px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: '1px solid #333',
                }}
              >
                {contextMenu.handleId === 'chat-model' && 'Configure Chat Model'}
                {contextMenu.handleId === 'memory' && 'Configure Memory'}
                {contextMenu.handleId === 'tool' && 'Configure Tool'}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Streaming output display */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, background: '#23232b', color: '#FFD700', padding: 16, borderRadius: 8, minWidth: 320, maxWidth: 600, zIndex: 1000, fontFamily: 'monospace', fontSize: 15 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Execution Output:</div>
        {executionOutput === 'Running...' ? (
          <Skeleton count={4} height={18} style={{ marginBottom: 8 }} />
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{typewriterOutput || executionOutput}</pre>
        )}
      </div>
      {showCredentials && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#23232b', padding: 32, borderRadius: 10, minWidth: 340, maxWidth: 420, maxHeight: '80vh', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Credential Management</div>
            <div style={{ color: '#FFD700', fontSize: 15, marginBottom: 12 }}>
              (UI only, backend integration coming next)
            </div>
            {/* Credential list */}
            <div style={{ color: '#fff', fontSize: 15, marginBottom: 12 }}>
              {credentials.length === 0 ? (
                <Skeleton count={3} height={32} style={{ marginBottom: 12 }} />
              ) : (
                <ul style={{ paddingLeft: 18 }}>
                  {credentials.map((cred, idx) => (
                    <li key={cred._id || idx} style={{ marginBottom: 6 }}>
                      {editingCred === cred._id ? (
                        <>
                          <input
                            value={editCredData.name}
                            onChange={e => setEditCredData(d => ({ ...d, name: e.target.value }))}
                            style={{ marginRight: 6, padding: '4px 8px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14 }}
                          />
                          <input
                            value={editCredData.type}
                            onChange={e => setEditCredData(d => ({ ...d, type: e.target.value }))}
                            style={{ marginRight: 6, padding: '4px 8px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14 }}
                          />
                          <input
                            value={editCredData.data}
                            onChange={e => setEditCredData(d => ({ ...d, data: e.target.value }))}
                            style={{ marginRight: 6, padding: '4px 8px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 14 }}
                          />
                          <button onClick={handleSaveEditCredential} style={{ background: '#43D675', color: '#181820', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginRight: 4 }}>Save</button>
                          <button onClick={() => setEditingCred(null)} style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <b>{cred.name}</b> ({cred.type || 'N/A'})
                          <button onClick={() => handleEditCredential(cred)} style={{ marginLeft: 8, background: '#FFD700', color: '#23232b', border: 'none', borderRadius: 4, padding: '2px 8px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteCredential(cred._id)} style={{ marginLeft: 4, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Delete</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Add credential form */}
            <div style={{ marginBottom: 12 }}>
              <input
                placeholder="Name"
                value={newCred.name}
                onChange={e => setNewCred(c => ({ ...c, name: e.target.value }))}
                style={{ marginRight: 8, padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15 }}
              />
              <input
                placeholder="Type"
                value={newCred.type}
                onChange={e => setNewCred(c => ({ ...c, type: e.target.value }))}
                style={{ marginRight: 8, padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15 }}
              />
              <input
                placeholder="Data (e.g. API key, conn string)"
                value={newCred.data}
                onChange={e => setNewCred(c => ({ ...c, data: e.target.value }))}
                style={{ marginRight: 8, padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#181820', color: '#fff', fontSize: 15 }}
              />
              <button onClick={handleAddCredential} style={{ background: '#43D675', color: '#181820', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Add</button>
            </div>
            <button
              onClick={() => setShowCredentials(false)}
              style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', alignSelf: 'flex-end' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkflowEditor; 