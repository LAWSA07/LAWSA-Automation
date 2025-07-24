from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal

class NodeConfig(BaseModel):
    pass

class LLMConfig(NodeConfig):
    provider: Literal["groq", "openai", "anthropic"] = "groq"
    model_name: str = "llama3-8b-8192"
    # Add other parameters like temperature, etc.

class ToolConfig(NodeConfig):
    tool_name: str  # e.g., "tavily_search", "multiply"

class AgentConfig(NodeConfig):
    pass

class MemoryConfig(NodeConfig):
    type: Literal["in-memory", "sqlite"] = "sqlite"

class WorkflowNode(BaseModel):
    id: str
    type: str
    config: Dict[str, Any]

class WorkflowEdge(BaseModel):
    source: str
    target: str

class WorkflowGraph(BaseModel):
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]

class ExecutionRequest(BaseModel):
    graph: WorkflowGraph
    input: str
    thread_id: str 