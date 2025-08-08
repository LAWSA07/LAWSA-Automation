'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';

interface CustomNodeData {
  label: string;
  type: string;
  icon: string;
  color: string;
}

const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  return (
    <motion.div
      className={`px-4 py-3 rounded-lg border-2 min-w-[120px] ${
        selected 
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' 
          : 'border-gray-600'
      }`}
      style={{
        backgroundColor: data.color + '20',
        borderColor: selected ? '#fbbf24' : data.color + '40',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
      />

      {/* Node Content */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: data.color + '40' }}
        >
          {data.icon}
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-white">
            {data.label}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {data.type}
          </p>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
      />
    </motion.div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
