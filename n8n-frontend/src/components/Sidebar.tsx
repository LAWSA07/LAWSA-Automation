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
  memory: '#FFD700',
  tool: '#3498db',
  http: '#3498db',
  email: '#3498db',
  output: '#FF9800',
  slack: '#FF9800',
  database: '#FF9800',
};

interface UserInfo {
  name: string;
  avatar: string;
  status: string;
}

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  user: UserInfo;
}

const defaultAvatar = (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#23232b" stroke="#FFD700" strokeWidth="2" />
    <circle cx="18" cy="14" r="6" fill="#FFD700" />
    <ellipse cx="18" cy="27" rx="9" ry="5" fill="#FFD700" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ onDragStart, user }) => {
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
    // Add premium drag feedback
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
      font-size: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      z-index: 9999;
    `;
    dragImage.textContent = nodeType;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Remove drag image after drag starts
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    onDragStart(e, nodeType);
  };

  return (
    <motion.aside 
      className="sidebar"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        width: 320,
        padding: 24,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 30,
        position: 'relative',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflow: 'hidden' }}>
        {/* Back Button with Animation */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '12px 16px',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
          }}
          onClick={() => window.history.back()}
          title="Back"
        >
          <span style={{ fontSize: 20, fontWeight: 700 }}>&larr;</span> Back
        </motion.button>

        {/* Title with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontWeight: 800,
            fontSize: 24,
            marginBottom: 20,
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'Inter, sans-serif',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🚀 Workflow Builder
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 20 }}
        >
          <input
            type="text"
            placeholder="🔍 Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              backdropFilter: 'blur(10px)',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #FFD700';
              e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid rgba(255,255,255,0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 20,
            overflowX: 'auto',
            paddingBottom: 8
          }}
        >
          {['all', 'triggers', 'ai', 'tools', 'outputs'].map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: activeCategory === category 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                  : 'rgba(255,255,255,0.1)',
                color: activeCategory === category ? '#000' : '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Nodes Grid */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12,
          overflowY: 'auto',
          paddingRight: 8
        }}>
          <AnimatePresence>
            {filteredNodes().map((node, index) => (
              <motion.div
                key={node.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
                whileTap={{ scale: 0.98 }}
                title={`Drag to add a ${node.label} node`}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  borderRadius: '16px',
                  cursor: 'grab',
                  userSelect: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                draggable
                onDragStart={e => handleDragStart(e, node.type)}
              >
                {/* Glow effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${nodeTypeColors[node.type]}20, transparent)`,
                  borderRadius: '16px',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }} />
                
                <span style={{ 
                  fontSize: 24, 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                  {node.icon}
                </span>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: 16, 
                    color: nodeTypeColors[node.type],
                    marginBottom: 4,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {node.label}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.3
                  }}>
                    {node.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* User Info at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(30,30,40,0.9), rgba(20,20,30,0.9))',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderRadius: '16px',
          marginTop: 20,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ 
          width: 40, 
          height: 40, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          padding: 2
        }}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            defaultAvatar
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: 16, 
            marginBottom: 4, 
            fontFamily: 'Inter, sans-serif'
          }}>
            {user.name}
          </div>
          <div style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: 13, 
            fontFamily: 'Inter, sans-serif' 
          }}>
            Premium Plan
          </div>
        </div>
        <motion.span 
          whileHover={{ scale: 1.05 }}
          style={{ 
            background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: 12, 
            borderRadius: '20px', 
            padding: '6px 12px', 
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          {user.status}
        </motion.span>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar; 