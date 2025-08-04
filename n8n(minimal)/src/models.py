from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class NodeModel(BaseModel):
    id: str
    type: str
    config: Dict[str, Any]
    credentials: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, float]] = None

class ConnectionModel(BaseModel):
    source: str
    target: str
    conditions: Optional[Dict[str, Any]] = None

class ProjectModel(BaseModel):
    name: str
    description: Optional[str] = None
    createdBy: Optional[str]
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class WorkflowModel(BaseModel):
    name: str
    nodes: List[NodeModel]
    connections: List[ConnectionModel]
    createdBy: Optional[str]
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    project_id: Optional[str] = None

class ExecutionModel(BaseModel):
    workflowId: str
    status: str
    startedAt: datetime = Field(default_factory=datetime.utcnow)
    finishedAt: Optional[datetime] = None
    log: Optional[List[Dict[str, Any]]] = None

class CredentialModel(BaseModel):
    type: str
    data: str  # Encrypted
    userId: Optional[str] 

class UserModel(BaseModel):
    username: str
    hashed_password: str
    email: str
    name: str 