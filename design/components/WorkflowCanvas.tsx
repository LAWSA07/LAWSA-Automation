
'use client';

import React, { useState, useCallback, useRef } from 'react';

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; icon: string; description: string; color: string };
}

interface Connection {
  id: string;
  source: string;
  target: string;
}

const WorkflowCanvas = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<{ from: { x: number; y: number }, to: { x: number; y: number } } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const nodeTypes = [
    { type: 'trigger', label: 'HTTP Trigger', icon: 'ri-global-line', description: 'Start workflow with HTTP request', color: 'bg-emerald-500' },
    { type: 'email', label: 'Send Email', icon: 'ri-mail-send-line', description: 'Send email notifications', color: 'bg-blue-500' },
    { type: 'database', label: 'Database Query', icon: 'ri-database-2-line', description: 'Execute database operations', color: 'bg-purple-500' },
    { type: 'webhook', label: 'Webhook', icon: 'ri-webhook-line', description: 'Call external APIs', color: 'bg-orange-500' },
    { type: 'condition', label: 'Condition', icon: 'ri-git-branch-line', description: 'Branch workflow logic', color: 'bg-yellow-500' },
    { type: 'transform', label: 'Transform Data', icon: 'ri-shuffle-line', description: 'Process and modify data', color: 'bg-indigo-500' },
    { type: 'timer', label: 'Timer', icon: 'ri-timer-line', description: 'Schedule workflow execution', color: 'bg-red-500' },
    { type: 'slack', label: 'Slack Message', icon: 'ri-slack-line', description: 'Send Slack notifications', color: 'bg-green-500' }
  ];

  const addNode = useCallback((nodeType: any, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: nodeType.type,
      position,
      data: {
        label: nodeType.label,
        icon: nodeType.icon,
        description: nodeType.description,
        color: nodeType.color
      }
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleDragStart = (e: React.DragEvent, nodeType: any) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const reactFlowBounds = canvasRef.current?.getBoundingClientRect();
    const nodeType = JSON.parse(e.dataTransfer.getData('application/reactflow'));

    if (reactFlowBounds && nodeType) {
      const position = {
        x: e.clientX - reactFlowBounds.left - 75,
        y: e.clientY - reactFlowBounds.top - 30
      };
      addNode(nodeType, position);
    }
  }, [addNode]);

  const handleNodeMouseDown = (e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    setDraggedNode(node);
    setSelectedNode(node.id);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (draggedNode && canvasRef.current) {
      const newPosition = {
        x: e.clientX - rect!.left - dragOffset.x,
        y: e.clientY - rect!.top - dragOffset.y
      };

      setNodes(prev => prev.map(node =>
        node.id === draggedNode.id
          ? { ...node, position: newPosition }
          : node
      ));
    }

    if (connectingFrom && rect) {
      const sourceNode = nodes.find(n => n.id === connectingFrom);
      if (sourceNode) {
        setTempConnection({
          from: {
            x: sourceNode.position.x + 150,
            y: sourceNode.position.y + 30
          },
          to: {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          }
        });
      }
    }
  }, [draggedNode, dragOffset, connectingFrom, nodes]);

  const handleMouseUp = () => {
    setDraggedNode(null);
    if (connectingFrom) {
      setConnectingFrom(null);
      setTempConnection(null);
    }
  };

  const handleConnectionStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (sourceNode) {
      setTempConnection({
        from: {
          x: sourceNode.position.x + 150,
          y: sourceNode.position.y + 30
        },
        to: mousePosition
      });
    }
  };

  const handleConnectionEnd = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== nodeId) {
      const connectionExists = connections.some(
        conn => conn.source === connectingFrom && conn.target === nodeId
      );

      if (!connectionExists) {
        const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          source: connectingFrom,
          target: nodeId
        };
        setConnections(prev => [...prev, newConnection]);
      }
    }
    setConnectingFrom(null);
    setTempConnection(null);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.source !== nodeId && conn.target !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const getCurvedPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlDistance = Math.min(distance * 0.5, 100);

    const controlX1 = x1 + controlDistance;
    const controlY1 = y1;
    const controlX2 = x2 - controlDistance;
    const controlY2 = y2;

    return `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Workflow Nodes</h2>
          <p className="text-sm text-gray-400 mt-1">Drag and drop to create your automation</p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {nodeTypes.map((nodeType) => (
              <div
                key={nodeType.type}
                draggable
                onDragStart={(e) => handleDragStart(e, nodeType)}
                className="flex items-start p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 cursor-move transition-all duration-200 hover:shadow-lg"
              >
                <div className={`w-10 h-10 flex items-center justify-center ${nodeType.color} text-white rounded-lg mr-3 flex-shrink-0`}>
                  <i className={`${nodeType.icon} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white whitespace-nowrap">{nodeType.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">{nodeType.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Workflow Editor</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span>Ready to execute</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors whitespace-nowrap">
              <i className="ri-save-line mr-2"></i>Save
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap">
              <i className="ri-play-line mr-2"></i>Execute
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 relative bg-gray-900 overflow-hidden cursor-crosshair"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(75, 85, 99, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#4b5563" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Connection Wires */}
          <svg className="absolute inset-0 pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" fill="#10b981" />
              </marker>
              <filter id="wire-glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Permanent Connections */}
            {connections.map((connection) => {
              const sourceNode = nodes.find(n => n.id === connection.source);
              const targetNode = nodes.find(n => n.id === connection.target);
              if (!sourceNode || !targetNode) return null;

              const x1 = sourceNode.position.x + 150;
              const y1 = sourceNode.position.y + 30;
              const x2 = targetNode.position.x;
              const y2 = targetNode.position.y + 30;

              return (
                <g key={connection.id} className="group">
                  {/* Wire Shadow */}
                  <path
                    d={getCurvedPath(x1, y1, x2, y2)}
                    stroke="rgba(16, 185, 129, 0.2)"
                    strokeWidth="6"
                    fill="none"
                    className="opacity-60"
                  />
                  {/* Main Wire */}
                  <path
                    d={getCurvedPath(x1, y1, x2, y2)}
                    stroke="url(#wireGradient)"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    filter="url(#wire-glow)"
                    className="transition-all duration-300 hover:stroke-emerald-400"
                  />
                  {/* Connection Points */}
                  <circle cx={x1} cy={y1} r="6" fill="#10b981" className="opacity-80" />
                  <circle cx={x2} cy={y2} r="6" fill="#10b981" className="opacity-80" />

                  {/* Delete Button (appears on hover) */}
                  <foreignObject
                    x={x1 + (x2 - x1) / 2 - 12}
                    y={y1 + (y2 - y1) / 2 - 12}
                    width="24"
                    height="24"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto"
                  >
                    <button
                      onClick={() => deleteConnection(connection.id)}
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                      title="Delete connection"
                    >
                      ×
                    </button>
                  </foreignObject>
                </g>
              );
            })}

            {/* Temporary Connection Wire */}
            {tempConnection && (
              <g>
                <path
                  d={getCurvedPath(tempConnection.from.x, tempConnection.from.y, tempConnection.to.x, tempConnection.to.y)}
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  className="animate-pulse"
                />
                <circle
                  cx={tempConnection.from.x}
                  cy={tempConnection.from.y}
                  r="6"
                  fill="#6b7280"
                  className="animate-pulse"
                />
              </g>
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-36 bg-gray-800 rounded-lg border-2 shadow-lg transition-all duration-200 cursor-move ${
                selectedNode === node.id
                  ? 'border-emerald-500 shadow-emerald-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              } ${connectingFrom === node.id ? 'ring-2 ring-emerald-500/50' : ''}`}
              style={{
                left: node.position.x,
                top: node.position.y,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-6 h-6 flex items-center justify-center ${node.data.color} text-white rounded`}>
                    <i className={`${node.data.icon} text-xs`}></i>
                  </div>
                  <button
                    onClick={() => deleteNode(node.id)}
                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>

                <h3 className="text-xs font-medium text-white mb-1">{node.data.label}</h3>
                <p className="text-xs text-gray-400 leading-tight">{node.data.description}</p>
              </div>

              {/* Input Connection Point */}
              <div
                className={`absolute -left-2 top-1/2 w-4 h-4 rounded-full cursor-pointer transition-all duration-200 border-2 border-gray-800 ${
                  connectingFrom && connectingFrom !== node.id
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-125'
                    : 'bg-gray-600 hover:bg-emerald-500 hover:scale-110'
                }`}
                style={{ transform: 'translateY(-50%)' }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => handleConnectionEnd(e, node.id)}
                title="Input"
              >
                {connectingFrom && connectingFrom !== node.id && (
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping"></div>
                )}
              </div>

              {/* Output Connection Point */}
              <div
                className={`absolute -right-2 top-1/2 w-4 h-4 rounded-full cursor-pointer transition-all duration-200 border-2 border-gray-800 ${
                  connectingFrom === node.id
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-125'
                    : 'bg-gray-600 hover:bg-emerald-500 hover:scale-110'
                }`}
                style={{ transform: 'translateY(-50%)' }}
                onMouseDown={(e) => handleConnectionStart(e, node.id)}
                title="Output"
              >
                {connectingFrom === node.id && (
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded-full mx-auto mb-4">
                  <i className="ri-workflow-line text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-400 max-w-md">Drag nodes from the sidebar to create your automation workflow. Click the output connection point (right side) then click on an input point (left side) to create wire connections.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
