import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FaRobot } from 'react-icons/fa';

const diamondStyle = {
  width: 16,
  height: 16,
  background: '#fff',
  border: '2px solid #a044ff',
  transform: 'rotate(45deg)',
  borderRadius: 3,
  position: 'absolute' as const,
  zIndex: 2,
};

const labelStyle = {
  fontSize: 12,
  color: '#6a3093',
  marginTop: 20,
  fontWeight: 600,
  textAlign: 'center' as const,
};

const AgentNode = (props) => {
  const id = props.id;
  const data = props.data;
  const selected = props.selected;
  const onHandleContextMenu = props.onHandleContextMenu;

  // Helper to wrap context menu event for each handle
  const handleContextMenu = (e, handleId) => {
    e.preventDefault();
    if (onHandleContextMenu) {
      onHandleContextMenu(e, id, handleId);
    }
  };

  return (
    <div
      style={{
        minWidth: 220,
        background: '#fff',
        border: selected ? '2.5px solid #a044ff' : '1.5px solid #e0e0e0',
        borderRadius: 18,
        color: '#23232b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        fontWeight: 500,
        position: 'relative',
        padding: '18px 24px 32px 24px',
        fontSize: 16,
        transition: 'border 0.18s, box-shadow 0.18s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <FaRobot size={32} color="#a044ff" />
        <div style={{ fontWeight: 700, fontSize: 22 }}>Agentic</div>
      </div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>AI Agent</div>
      {/* Handles */}
      {/* Left input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-trigger"
        style={{ background: '#43D675', width: 14, height: 14, borderRadius: 7, left: -7, top: '50%', zIndex: 2 }}
      />
      {/* Right output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output-result"
        style={{ background: '#FFD700', width: 14, height: 14, borderRadius: 7, right: -7, top: '50%', zIndex: 2 }}
      />
      {/* Bottom diamond handles */}
      {/* Chat Model */}
      <div style={{ position: 'absolute', left: 32, bottom: -18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Handle
          type="source"
          position={Position.Bottom}
          id="chat-model"
          style={{ ...diamondStyle, borderColor: '#a044ff', background: '#fff', left: 0, top: 0 }}
          onContextMenu={e => handleContextMenu(e, 'chat-model')}
        />
        <div style={labelStyle}>Chat Model*</div>
      </div>
      {/* Memory */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Handle
          type="source"
          position={Position.Bottom}
          id="memory"
          style={{ ...diamondStyle, borderColor: '#43D675', background: '#fff', left: 0, top: 0 }}
          onContextMenu={e => handleContextMenu(e, 'memory')}
        />
        <div style={labelStyle}>Memory</div>
      </div>
      {/* Tool */}
      <div style={{ position: 'absolute', right: 32, bottom: -18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Handle
          type="source"
          position={Position.Bottom}
          id="tool"
          style={{ ...diamondStyle, borderColor: '#FFD700', background: '#fff', left: 0, top: 0 }}
          onContextMenu={e => handleContextMenu(e, 'tool')}
        />
        <div style={labelStyle}>Tool</div>
      </div>
    </div>
  );
};

export default memo(AgentNode); 