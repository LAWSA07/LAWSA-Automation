import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { CustomNodeProps, NodeTypeConfig } from '../types';
import openaiIcon from '../assets/providers/openai.png';
import groqIcon from '../assets/providers/groq.png';
import togetherIcon from '../assets/providers/together.png';
import anthropicIcon from '../assets/providers/anthropic.png';
import mongodbIcon from '../assets/providers/mongodb.png';

const nodeTypeConfig: Record<string, NodeTypeConfig> = {
  input: { 
    icon: '📥', 
    color: '#43D675', 
    label: 'Input', 
    handles: [{ type: 'source', position: Position.Right, id: 'out' }] 
  },
  agentic: {
    icon: '🧠', 
    color: '#FF9800', 
    label: 'Agentic',
    handles: [
      { type: 'target', position: Position.Left, id: 'in' },
      { type: 'target', position: Position.Bottom, id: 'memory', label: 'Memory' },
      { type: 'target', position: Position.Bottom, id: 'tool', label: 'Tool' },
      { type: 'source', position: Position.Right, id: 'out' },
    ]
  },
  memory: { 
    icon: '💾', 
    color: '#3498db', 
    label: 'Memory', 
    handles: [
      { type: 'source', position: Position.Right, id: 'out' }, 
      { type: 'target', position: Position.Left, id: 'in' }
    ] 
  },
  tool: { 
    icon: '🛠️', 
    color: '#a044ff', 
    label: 'Tool', 
    handles: [
      { type: 'source', position: Position.Right, id: 'out' }, 
      { type: 'target', position: Position.Left, id: 'in' }
    ] 
  },
  output: { 
    icon: '📤', 
    color: '#FFD700', 
    label: 'Output', 
    handles: [{ type: 'target', position: Position.Left, id: 'in' }] 
  },
};

const providerIcons: Record<string, string> = {
  openai: openaiIcon,
  groq: groqIcon,
  together: togetherIcon,
  anthropic: anthropicIcon,
  mongodb: mongodbIcon,
};

const CustomNode: React.FC<CustomNodeProps> = ({ 
  data, 
  type, 
  selected, 
  isValidConnection 
}) => {
  const [animate, setAnimate] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setAnimate(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [animate]);
  const config = nodeTypeConfig[type] || { 
    icon: '⬜', 
    color: '#888', 
    label: data.label, 
    handles: [] 
  };
  
  // Group bottom handles for rendering below node
  const bottomHandles = (config.handles || []).filter(h => h.position === Position.Bottom);
  const sideHandles = (config.handles || []).filter(h => h.position !== Position.Bottom);

  // Determine which icon to show (if any)
  let iconSrc = '';
  let validationStatus: null | 'pending' | 'valid' | 'invalid' = null;
  if (type === 'memory' && data?.config?.memoryConfig?.type) {
    iconSrc = providerIcons[data.config.memoryConfig.type] || '';
    validationStatus = data?.config?.memoryConfig?.validationStatus || null;
  } else if (type === 'tool' && data?.config?.toolType) {
    iconSrc = providerIcons[data.config.toolType] || '';
    validationStatus = data?.config?.toolValidationStatus || null;
  } else if ((type === 'llm' || type === 'chatmodel') && data?.config?.models?.[0]?.provider) {
    iconSrc = providerIcons[data.config.models[0].provider] || '';
    validationStatus = data?.config?.models?.[0]?.validationStatus || null;
  }

  const borderColor = validationStatus === 'invalid' ? '#ff4d4f' : (selected ? '#a044ff' : '#e0e0e0');

  return (
    <div
      ref={nodeRef}
      className={`sleek-node${animate ? ' node-animate' : ''}${selected ? ' selected' : ''}`}
      style={{ position: 'relative', minWidth: 64, minHeight: 64, maxWidth: 90, maxHeight: 90, padding: 0, justifyContent: 'center', alignItems: 'center', display: 'flex', border: `2px solid ${borderColor}` }}
    >
      {/* Side handles (left/right) */}
      {sideHandles.map(h => (
        <Handle
          key={h.id}
          type={h.type}
          position={h.position}
          id={h.id}
          style={{ background: config.color, width: 14, height: 14, borderRadius: 7, [h.position === Position.Left ? 'left' : 'right']: -7, zIndex: 2 }}
          isValidConnection={conn => isValidConnection ? isValidConnection({ ...conn, sourceHandle: h.id, targetHandle: h.id }) : true}
        />
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {iconSrc ? (
          <img src={iconSrc} alt={type} style={{ width: 36, height: 36, borderRadius: 8, background: '#f5f5f5' }} />
        ) : (
          <span style={{ fontSize: 32 }}>{config.icon}</span>
        )}
        {validationStatus === 'invalid' && (
          <span style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>Not connected</span>
        )}
      </div>
      {/* No label or subtitle inside the node */}
      {/* Bottom handles with labels */}
      {bottomHandles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 10 }}>
          {bottomHandles.map(h => (
            <div key={h.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
              <Handle
                type={h.type}
                position={h.position}
                id={h.id}
                style={{ background: config.color, width: 14, height: 14, borderRadius: 7, marginBottom: 2, zIndex: 2 }}
                isValidConnection={conn => isValidConnection ? isValidConnection({ ...conn, sourceHandle: h.id, targetHandle: h.id }) : true}
              />
              {/* Optionally, you can keep the handle label here if needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(CustomNode); 