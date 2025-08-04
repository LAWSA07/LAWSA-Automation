from typing import Annotated, Dict, Any
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from .components import TOOL_REGISTRY, LLM_REGISTRY
from ..schemas import WorkflowGraph, WorkflowNode
import networkx as nx

# 1. Define the state for our graph
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

def create_agentic_graph(workflow: WorkflowGraph) -> StateGraph:
    """
    Parses the workflow graph from the frontend and dynamically builds
    a LangGraph StateGraph.
    """
    print("[DEBUG] Received workflow nodes:")
    for n in workflow.nodes:
        print(f"  Node id={n.id}, type={n.type}, config={getattr(n, 'config', None)}")
    print("[DEBUG] Node types received:", [n.type for n in workflow.nodes])
    graph_builder = StateGraph(AgentState)

    # --- Cycle detection ---
    G = nx.DiGraph()
    if hasattr(workflow, 'edges'):
        G.add_edges_from([(e.source, e.target) for e in workflow.edges])
        if not nx.is_directed_acyclic_graph(G):
            raise ValueError("Workflow contains cycles")

    # --- Find the core components from the visual graph ---
    agent_node = next((n for n in workflow.nodes if n.type.lower() == "agentic"), None)
    model_node = next((n for n in workflow.nodes if n.type.lower() in ["model", "chatmodel"]), None)
    print("[DEBUG] agent_node:", agent_node)
    print("[DEBUG] model_node:", model_node)
    if not agent_node or not model_node:
        print("[DEBUG] ERROR: Missing Agentic or Model node!")
        raise ValueError("Workflow must include an Agentic node and a Model node.")

    # Find all tool nodes connected to the agent node
    agent_node_id = agent_node.id
    connected_tool_ids = {
        edge.target for edge in workflow.edges if edge.source == agent_node_id and \
        next((n.type.lower() for n in workflow.nodes if n.id == edge.target), None) == "tool"
    }
    tool_nodes = [n for n in workflow.nodes if n.id in connected_tool_ids]

    # --- Instantiate components from registries ---
    provider = model_node.config.get("provider", "groq")
    model_name = model_node.config.get("model_name") or model_node.config.get("model") or "llama3-8b-8192"
    LLMClass = LLM_REGISTRY.get(provider)
    if not LLMClass:
        raise ValueError(f"Unsupported LLM provider: {provider}")
    llm = LLMClass(model=model_name)

    # Get the actual tool objects from the registry, using config if needed
    tools = []
    for tool_node in tool_nodes:
        config = tool_node.config
        tool_name = config.get("tool_name") or config.get("toolType")
        tool_obj = TOOL_REGISTRY.get(tool_name)
        if not tool_obj:
            raise ValueError(f"Unsupported tool: {tool_name}")
        tools.append(tool_obj)

    # Bind the tools to the LLM. This allows the LLM to call them.
    llm_with_tools = llm.bind_tools(tools) if tools else llm

    # --- Define the graph nodes ---
    def agent_node_fn(state: AgentState):
        return {"messages": [llm_with_tools.invoke(state["messages"])]}

    tool_node = ToolNode(tools) if tools else None

    # --- Add nodes to the graph builder ---
    graph_builder.add_node("agent", agent_node_fn)
    if tool_node:
        graph_builder.add_node("tools", tool_node)

    # --- Define the graph edges ---
    graph_builder.set_entry_point("agent")
    if tool_node:
        graph_builder.add_conditional_edges(
            "agent",
            tools_condition,
        )
        graph_builder.add_edge("tools", "agent")
    else:
        graph_builder.add_edge("agent", END)

    return graph_builder 