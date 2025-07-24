import { Node, Edge } from 'reactflow';
import { SleekNodeData } from '../types';

interface LayoutNode extends Node<SleekNodeData> {
  level?: number;
  children?: string[];
}

interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  startX?: number;
  startY?: number;
}

export class WorkflowLayout {
  private nodes: LayoutNode[];
  private edges: Edge[];
  private options: Required<LayoutOptions>;

  constructor(
    nodes: Node<SleekNodeData>[],
    edges: Edge[],
    options: LayoutOptions = {}
  ) {
    this.nodes = nodes.map(node => ({ ...node, level: 0, children: [] }));
    this.edges = edges;
    this.options = {
      nodeWidth: 200,
      nodeHeight: 80,
      horizontalSpacing: 250,
      verticalSpacing: 120,
      startX: 50,
      startY: 50,
      ...options,
    };
  }

  /**
   * Calculate hierarchical levels for nodes
   */
  private calculateLevels(): void {
    const visited = new Set<string>();
    const levels = new Map<string, number>();

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = this.nodes.filter(node => 
      !this.edges.some(edge => edge.target === node.id)
    );

    // BFS to assign levels
    const queue: { nodeId: string; level: number }[] = 
      rootNodes.map(node => ({ nodeId: node.id, level: 0 }));

    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      levels.set(nodeId, level);

      // Find children
      const children = this.edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);

      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ nodeId: childId, level: level + 1 });
        }
      });
    }

    // Update node levels
    this.nodes.forEach(node => {
      node.level = levels.get(node.id) || 0;
    });
  }

  /**
   * Position nodes in a hierarchical layout
   */
  public layout(): Node<SleekNodeData>[] {
    this.calculateLevels();

    // Group nodes by level
    const levelGroups = new Map<number, LayoutNode[]>();
    this.nodes.forEach(node => {
      const level = node.level || 0;
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(node);
    });

    // Position nodes level by level
    const maxLevel = Math.max(...levelGroups.keys());
    
    for (let level = 0; level <= maxLevel; level++) {
      const nodesInLevel = levelGroups.get(level) || [];
      const y = this.options.startY + level * this.options.verticalSpacing;
      
      // Center nodes horizontally within their level
      const totalWidth = (nodesInLevel.length - 1) * this.options.horizontalSpacing;
      const startX = this.options.startX + (window.innerWidth - totalWidth) / 2;
      
      nodesInLevel.forEach((node, index) => {
        node.position = {
          x: startX + index * this.options.horizontalSpacing,
          y,
        };
      });
    }

    return this.nodes;
  }

  /**
   * Apply force-directed layout for more organic positioning
   */
  public forceLayout(iterations: number = 100): Node<SleekNodeData>[] {
    this.calculateLevels();

    // Initialize positions randomly
    this.nodes.forEach(node => {
      if (!node.position) {
        node.position = {
          x: Math.random() * 800,
          y: Math.random() * 600,
        };
      }
    });

    // Simple force simulation
    for (let i = 0; i < iterations; i++) {
      this.applyForces();
    }

    return this.nodes;
  }

  private applyForces(): void {
    const forces = new Map<string, { x: number; y: number }>();
    
    // Initialize forces
    this.nodes.forEach(node => {
      forces.set(node.id, { x: 0, y: 0 });
    });

    // Repulsion between all nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i];
        const nodeB = this.nodes[j];
        
        const dx = nodeB.position.x - nodeA.position.x;
        const dy = nodeB.position.y - nodeA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = 1000 / (distance * distance); // Repulsion force
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          const forceA = forces.get(nodeA.id)!;
          const forceB = forces.get(nodeB.id)!;
          
          forceA.x -= fx;
          forceA.y -= fy;
          forceB.x += fx;
          forceB.y += fy;
        }
      }
    }

    // Attraction between connected nodes
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = distance * 0.01; // Attraction force
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          const forceSource = forces.get(sourceNode.id)!;
          const forceTarget = forces.get(targetNode.id)!;
          
          forceSource.x += fx;
          forceSource.y += fy;
          forceTarget.x -= fx;
          forceTarget.y -= fy;
        }
      }
    });

    // Apply forces
    this.nodes.forEach(node => {
      const force = forces.get(node.id)!;
      node.position.x += force.x * 0.1;
      node.position.y += force.y * 0.1;
      
      // Keep nodes within bounds
      node.position.x = Math.max(0, Math.min(window.innerWidth - 200, node.position.x));
      node.position.y = Math.max(0, Math.min(window.innerHeight - 100, node.position.y));
    });
  }
}

/**
 * Utility function to apply layout to nodes and edges
 */
export function applyLayout(
  nodes: Node<SleekNodeData>[],
  edges: Edge[],
  layoutType: 'hierarchical' | 'force' = 'hierarchical',
  options?: LayoutOptions
): Node<SleekNodeData>[] {
  const layout = new WorkflowLayout(nodes, edges, options);
  
  if (layoutType === 'force') {
    return layout.forceLayout();
  } else {
    return layout.layout();
  }
} 