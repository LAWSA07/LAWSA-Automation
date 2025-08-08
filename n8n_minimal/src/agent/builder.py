from typing import Annotated, Dict, Any, List, Optional
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from .components import TOOL_REGISTRY, create_llm, AVAILABLE_MODELS, MEMORY_BACKENDS
from ..schemas import WorkflowGraph, WorkflowNode, NodeType
import networkx as nx
import logging

logger = logging.getLogger(__name__)

# 1. Define the state for our graph
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    memory: Optional[Dict[str, Any]]
    context: Optional[Dict[str, Any]]

def create_agentic_graph(workflow: WorkflowGraph) -> StateGraph:
    """
    Parses the workflow graph from the frontend and dynamically builds
    a LangGraph StateGraph.
    """
    logger.info(f"Building agentic graph for workflow: {workflow.name}")
    logger.info(f"Nodes: {[n.type for n in workflow.nodes]}")
    
    graph_builder = StateGraph(AgentState)

    # --- Cycle detection ---
    G = nx.DiGraph()
    if hasattr(workflow, 'edges'):
        G.add_edges_from([(e.source, e.target) for e in workflow.edges])
        if not nx.is_directed_acyclic_graph(G):
            raise ValueError("Workflow contains cycles")

    # --- Find the core components from the visual graph ---
    agent_node = next((n for n in workflow.nodes if n.type == NodeType.AGENTIC), None)
    llm_nodes = [n for n in workflow.nodes if n.type == NodeType.LLM]
    tool_nodes = [n for n in workflow.nodes if n.type == NodeType.TOOL]
    memory_nodes = [n for n in workflow.nodes if n.type == NodeType.MEMORY]
    trigger_nodes = [n for n in workflow.nodes if n.type in [NodeType.INPUT, NodeType.WEBHOOK, NodeType.SCHEDULE]]
    output_nodes = [n for n in workflow.nodes if n.type in [NodeType.OUTPUT, NodeType.SLACK, NodeType.DATABASE]]

    logger.info(f"Found components: Agent={agent_node}, LLMs={len(llm_nodes)}, Tools={len(tool_nodes)}")

    if not agent_node:
        raise ValueError("Workflow must include an Agentic node.")

    # --- Configure LLM ---
    llm = None
    if llm_nodes:
        # Use the first LLM node found
        llm_node = llm_nodes[0]
        config = llm_node.config
        provider = config.get("provider", "groq")
        model = config.get("model", "llama3-8b-8192")
        temperature = config.get("temperature", 0.7)
        max_tokens = config.get("max_tokens")
        api_key = config.get("api_key")
        
        try:
            llm = create_llm(provider, model, api_key, temperature, max_tokens)
            logger.info(f"Created LLM: {provider}/{model}")
        except Exception as e:
            logger.error(f"Failed to create LLM: {e}")
            raise ValueError(f"Failed to create LLM: {e}")
    else:
        # Use default LLM if no LLM node specified
        try:
            llm = create_llm("groq", "llama3-8b-8192")
            logger.info("Using default LLM: groq/llama3-8b-8192")
        except Exception as e:
            raise ValueError(f"Failed to create default LLM: {e}")

    # --- Configure Tools ---
    tools = []
    for tool_node in tool_nodes:
        config = tool_node.config
        tool_type = config.get("tool_type") or config.get("toolType")
        
        if tool_type in TOOL_REGISTRY:
            tool_obj = TOOL_REGISTRY[tool_type]
            # Configure tool with any additional settings
            if hasattr(tool_obj, 'configure'):
                tool_obj.configure(config.get("config", {}))
            tools.append(tool_obj)
            logger.info(f"Added tool: {tool_type}")
        else:
            logger.warning(f"Unknown tool type: {tool_type}")

    # --- Configure Memory ---
    memory_config = None
    if memory_nodes:
        memory_node = memory_nodes[0]
        memory_config = memory_node.config
        logger.info(f"Memory configured: {memory_config.get('type', 'unknown')}")

    # --- Bind tools to LLM ---
    llm_with_tools = llm.bind_tools(tools) if tools else llm

    # --- Define the graph nodes ---
    def agent_node_fn(state: AgentState):
        """Main agent node that processes messages and decides next actions."""
        try:
            # Add memory context if available
            if memory_config and state.get("memory"):
                # This is a simplified memory integration
                # In a full implementation, you'd retrieve relevant memory
                pass
            
            # Process with LLM
            response = llm_with_tools.invoke(state["messages"])
            return {"messages": [response]}
        except Exception as e:
            logger.error(f"Agent execution failed: {e}")
            return {"messages": [{"content": f"Error: {str(e)}", "type": "error"}]}

    def tool_execution_fn(state: AgentState):
        """Execute tools based on LLM decisions."""
        try:
            tool_node = ToolNode(tools)
            return tool_node.invoke(state)
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            return {"messages": [{"content": f"Tool error: {str(e)}", "type": "error"}]}

    def trigger_node_fn(state: AgentState):
        """Handle trigger nodes (input, webhook, schedule)."""
        # For now, just pass through the input
        return state

    def output_node_fn(state: AgentState):
        """Handle output nodes (output, slack, database)."""
        # Process the final output based on node type
        # This is a simplified implementation
        return state

    # --- Add nodes to the graph builder ---
    graph_builder.add_node("agent", agent_node_fn)
    
    if tools:
        graph_builder.add_node("tools", tool_execution_fn)
    
    if trigger_nodes:
        graph_builder.add_node("trigger", trigger_node_fn)
    
    if output_nodes:
        graph_builder.add_node("output", output_node_fn)

    # --- Define the graph edges ---
    # Start with trigger if available, otherwise agent
    entry_point = "trigger" if trigger_nodes else "agent"
    graph_builder.set_entry_point(entry_point)
    
    if trigger_nodes:
        graph_builder.add_edge("trigger", "agent")
    
    if tools:
        graph_builder.add_conditional_edges(
            "agent",
            tools_condition,
        )
        graph_builder.add_edge("tools", "agent")
    
    if output_nodes:
        graph_builder.add_edge("agent", "output")
        graph_builder.add_edge("output", END)
    else:
        graph_builder.add_edge("agent", END)

    return graph_builder

def validate_workflow(workflow: WorkflowGraph) -> List[str]:
    """
    Validate a workflow and return any errors found.
    """
    errors = []
    
    # Check for required nodes
    has_agentic = any(n.type == NodeType.AGENTIC for n in workflow.nodes)
    if not has_agentic:
        errors.append("Workflow must contain at least one Agentic node")
    
    # Check for cycles
    G = nx.DiGraph()
    if hasattr(workflow, 'edges'):
        G.add_edges_from([(e.source, e.target) for e in workflow.edges])
        if not nx.is_directed_acyclic_graph(G):
            errors.append("Workflow contains cycles")
    
    # Check node configurations
    for node in workflow.nodes:
        if node.type == NodeType.LLM:
            config = node.config
            provider = config.get("provider")
            model = config.get("model")
            if not provider or not model:
                errors.append(f"LLM node {node.id} missing provider or model configuration")
        
        elif node.type == NodeType.TOOL:
            config = node.config
            tool_type = config.get("tool_type") or config.get("toolType")
            if not tool_type:
                errors.append(f"Tool node {node.id} missing tool type")
            elif tool_type not in TOOL_REGISTRY:
                errors.append(f"Tool node {node.id} has unknown tool type: {tool_type}")
    
    return errors

def get_workflow_metadata(workflow: WorkflowGraph) -> Dict[str, Any]:
    """
    Extract metadata from a workflow for analysis and display.
    """
    node_counts = {}
    for node in workflow.nodes:
        node_counts[node.type] = node_counts.get(node.type, 0) + 1
    
    return {
        "name": workflow.name,
        "node_count": len(workflow.nodes),
        "edge_count": len(workflow.edges),
        "node_types": node_counts,
        "has_llm": any(n.type == NodeType.LLM for n in workflow.nodes),
        "has_tools": any(n.type == NodeType.TOOL for n in workflow.nodes),
        "has_memory": any(n.type == NodeType.MEMORY for n in workflow.nodes),
    } 