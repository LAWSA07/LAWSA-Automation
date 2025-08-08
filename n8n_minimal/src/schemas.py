from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal, Optional
from enum import Enum

class NodeType(str, Enum):
    # Triggers
    INPUT = "input"
    WEBHOOK = "webhook"
    SCHEDULE = "schedule"
    
    # AI
    AGENTIC = "agentic"
    LLM = "llm"
    MEMORY = "memory"
    
    # Tools
    TOOL = "tool"
    HTTP = "http"
    EMAIL = "email"
    
    # Outputs
    OUTPUT = "output"
    SLACK = "slack"
    DATABASE = "database"

class ProviderType(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GROQ = "groq"
    TOGETHER = "together"
    COHERE = "cohere"
    MISTRAL = "mistral"

class MemoryType(str, Enum):
    WINDOW_BUFFER = "window_buffer"
    MONGODB = "mongodb"
    POSTGRESQL = "postgresql"
    SQLITE = "sqlite"

class ToolType(str, Enum):
    TAVILY_SEARCH = "tavily_search"
    MULTIPLY = "multiply"
    SEND_EMAIL = "send_email"
    POST_TO_SLACK = "post_to_slack"

class CredentialType(str, Enum):
    OPENAI_API_KEY = "openai_api_key"
    ANTHROPIC_API_KEY = "anthropic_api_key"
    GROQ_API_KEY = "groq_api_key"
    TOGETHER_API_KEY = "together_api_key"
    COHERE_API_KEY = "cohere_api_key"
    MISTRAL_API_KEY = "mistral_api_key"
    TAVILY_API_KEY = "tavily_api_key"
    GMAIL_CREDENTIALS = "gmail_credentials"
    SLACK_WEBHOOK = "slack_webhook"
    DATABASE_CONNECTION = "database_connection"
    CUSTOM_API_KEY = "custom_api_key"

class NodeConfig(BaseModel):
    """Base configuration for all nodes"""
    pass

class LLMConfig(NodeConfig):
    provider: ProviderType = ProviderType.GROQ
    model: str = "llama3-8b-8192"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000
    credential_id: Optional[str] = None  # Reference to stored credential
    api_key: Optional[str] = None  # Direct API key (for backward compatibility)

class ToolConfig(NodeConfig):
    tool_type: ToolType
    config: Dict[str, Any] = Field(default_factory=dict)
    credential_id: Optional[str] = None  # Reference to stored credential
    api_key: Optional[str] = None  # Direct API key (for backward compatibility)

class AgentConfig(NodeConfig):
    models: List[LLMConfig] = Field(default_factory=list)
    memory: bool = False
    memory_config: Optional[Dict[str, Any]] = None
    tool_config: Optional[ToolConfig] = None

class MemoryConfig(NodeConfig):
    type: MemoryType = MemoryType.SQLITE
    config: Dict[str, Any] = Field(default_factory=dict)
    credential_id: Optional[str] = None  # For database connections

class TriggerConfig(NodeConfig):
    webhook_url: Optional[str] = None
    schedule_cron: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None

class OutputConfig(NodeConfig):
    format: Literal["json", "text", "html"] = "json"
    destination: Optional[str] = None

class WorkflowNode(BaseModel):
    id: str
    type: NodeType
    position: Dict[str, float] = Field(default_factory=dict)  # x, y coordinates
    config: Dict[str, Any] = Field(default_factory=dict)
    data: Optional[Dict[str, Any]] = None  # Frontend-specific data

class WorkflowEdge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None
    conditions: Optional[Dict[str, Any]] = None

class WorkflowGraph(BaseModel):
    name: str
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    metadata: Optional[Dict[str, Any]] = None

class ExecutionRequest(BaseModel):
    graph: WorkflowGraph
    input: str = ""
    thread_id: str
    user_id: Optional[str] = None

class ExecutionResponse(BaseModel):
    status: Literal["success", "error", "running"]
    data: Optional[Any] = None
    error: Optional[str] = None
    execution_id: Optional[str] = None

class WorkflowTemplate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    graph: WorkflowGraph
    tags: List[str] = Field(default_factory=list)
    created_by: Optional[str] = None
    created_at: Optional[str] = None

# Enhanced Credential Management
class CredentialData(BaseModel):
    """Base credential data model"""
    name: str
    type: CredentialType
    description: Optional[str] = None

class APIKeyCredential(CredentialData):
    """API Key credential"""
    api_key: str
    provider: Optional[str] = None

class EmailCredential(CredentialData):
    """Email service credential"""
    email: str
    password: str
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587

class SlackCredential(CredentialData):
    """Slack webhook credential"""
    webhook_url: str
    channel: Optional[str] = None

class DatabaseCredential(CredentialData):
    """Database connection credential"""
    connection_string: str
    database_type: str

class CustomCredential(CredentialData):
    """Custom credential with key-value pairs"""
    data: Dict[str, str]

class CredentialConfig(BaseModel):
    id: str
    name: str
    type: CredentialType
    provider: Optional[str] = None
    encrypted_data: Dict[str, Any]
    created_by: str
    created_at: Optional[str] = None
    description: Optional[str] = None

class CreateCredentialRequest(BaseModel):
    name: str
    type: CredentialType
    provider: Optional[str] = None
    description: Optional[str] = None
    # Union of different credential types
    data: Dict[str, Any]

class UpdateCredentialRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class CredentialValidationRequest(BaseModel):
    type: CredentialType
    data: Dict[str, Any]

class CredentialValidationResponse(BaseModel):
    valid: bool
    message: str
    details: Optional[Dict[str, Any]] = None

# Workflow with Credentials
class WorkflowWithCredentials(BaseModel):
    workflow: WorkflowGraph
    required_credentials: List[str]  # List of credential IDs
    missing_credentials: List[Dict[str, Any]]  # Credentials that need to be added 