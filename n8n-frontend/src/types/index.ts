import { Node, Edge, Connection } from 'reactflow';

// Node data types
export interface SleekNodeData {
  label: string;
  subtitle?: string;
  config?: NodeConfig;
}

export interface NodeConfig {
  // Legacy fields for backward compatibility
  provider?: string;
  model?: string;
  apiKey?: string;
  toolType?: string;
  
  // New Agentic node configuration
  memory?: boolean;
  models?: ChatModelConfig[];
  memoryConfig?: MemoryConfig;
  toolConfig?: ToolConfig;
}

export interface ChatModelConfig {
  provider: string;
  model: string;
  apiKey: string;
  name?: string; // Display name
}

export interface MemoryConfig {
  type: string; // 'window_buffer', 'mongodb', 'postgresql', 'sqlite'
  config: Record<string, any>; // Configuration fields
}

export interface ToolConfig {
  type: string; // 'tavily'
  config: Record<string, any>; // Configuration fields
}

// Node type configuration
export interface NodeTypeConfig {
  icon: string;
  color: string;
  label: string;
  handles: HandleConfig[];
}

import { Position } from 'reactflow';

export interface HandleConfig {
  type: 'source' | 'target';
  position: string;
  id: string;
  label?: string;
}

// Context menu types
export interface ContextMenu {
  type: 'node' | 'edge' | 'handle';
  id: string;
  x: number;
  y: number;
  handleId?: string; // For handle-specific context menus
}

// Edge editing types
export interface EditingEdge {
  id: string;
  x: number;
  y: number;
  value: string;
}

// History state types
export interface HistoryState {
  nodes: Node<SleekNodeData>[];
  edges: Edge[];
}

// Custom node props
export interface CustomNodeProps {
  id: string;
  data: SleekNodeData;
  type: string;
  selected?: boolean;
  isValidConnection?: (connection: Connection) => boolean;
}

// Workflow export types
export interface WorkflowConfig {
  nodes: {
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
} 