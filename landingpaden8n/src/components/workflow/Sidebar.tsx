'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const nodeCategories = {
  triggers: [
    { type: 'input', label: 'Input', icon: '⚡', description: 'Start your workflow' },
    { type: 'webhook', label: 'Webhook', icon: '🔗', description: 'Receive web requests' },
    { type: 'schedule', label: 'Schedule', icon: '⏰', description: 'Time-based triggers' }
  ],
  ai: [
    { type: 'agentic', label: 'AI Agent', icon: '🧠', description: 'Intelligent automation' },
    { type: 'llm', label: 'LLM', icon: '🤖', description: 'Language model integration' },
    { type: 'tavily_search', label: 'Web Search', icon: '🔍', description: 'Tavily web search' },
    { type: 'memory', label: 'Memory', icon: '💾', description: 'Context storage' }
  ],
  tools: [
    { type: 'tool', label: 'Tool', icon: '🔧', description: 'External integrations' },
    { type: 'http', label: 'HTTP', icon: '🌐', description: 'API calls' },
    { type: 'email', label: 'Email', icon: '📧', description: 'Send emails' }
  ],
  outputs: [
    { type: 'output', label: 'Output', icon: '📤', description: 'Final results' },
    { type: 'slack', label: 'Slack', icon: '💬', description: 'Slack notifications' },
    { type: 'database', label: 'Database', icon: '🗄️', description: 'Data storage' }
  ]
};

const nodeTypeColors: Record<string, string> = {
  input: '#43D675',
  webhook: '#43D675',
  schedule: '#43D675',
  agentic: '#a044ff',
  llm: '#a044ff',
  tavily_search: '#FF6B6B',
  memory: '#FFD700',
  tool: '#3498db',
  http: '#3498db',
  email: '#3498db',
  output: '#FF9800',
  slack: '#FF9800',
  database: '#FF9800',
};

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredNodes = useCallback(() => {
    let allNodes: any[] = [];
    Object.values(nodeCategories).forEach(category => {
      allNodes = [...allNodes, ...category];
    });

    if (searchTerm) {
      return allNodes.filter(node => 
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeCategory === 'all') {
      return allNodes;
    }

    return nodeCategories[activeCategory as keyof typeof nodeCategories] || [];
  }, [searchTerm, activeCategory]);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({ type: nodeType }));
    
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: linear-gradient(135deg, ${nodeTypeColors[nodeType]}, ${nodeTypeColors[nodeType]}dd);
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      z-index: 10000;
    `;
    dragImage.textContent = nodeType;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
    onDragStart(e, nodeType);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold mb-4">Workflow Nodes</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', ...Object.keys(nodeCategories)].map(category => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredNodes().map((node, index) => (
            <motion.div
              key={node.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                draggable
                onDragStart={(e: React.DragEvent) => handleDragStart(e, node.type)}
                className="group cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-yellow-400 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-400/20"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: nodeTypeColors[node.type] + '20' }}
                  >
                    {node.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                      {node.label}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {node.description}
                    </p>
                  </div>
                </div>
              </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-center text-sm text-gray-400">
          <p>Drag nodes to the canvas</p>
          <p className="mt-1">Ctrl+S to save</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
