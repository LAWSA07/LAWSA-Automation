import os
import uuid
from typing import Dict, Any, Optional, List
from cryptography.fernet import Fernet
from .schemas import (
    CredentialType, CredentialConfig, CreateCredentialRequest, 
    CredentialValidationRequest, CredentialValidationResponse,
    WorkflowGraph, WorkflowNode, NodeType
)
from .db import get_db_from_uri
from .audit import log_audit_action
import logging

logger = logging.getLogger(__name__)

# Initialize encryption
FERNET_KEY = os.environ.get("FERNET_KEY")
if not FERNET_KEY:
    raise RuntimeError("FERNET_KEY environment variable must be set for credential encryption.")
fernet = Fernet(FERNET_KEY.encode() if isinstance(FERNET_KEY, str) else FERNET_KEY)

class CredentialManager:
    """Manages user credentials for workflow execution"""
    
    def __init__(self):
        self.db = get_db_from_uri()
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        return fernet.encrypt(data.encode()).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return fernet.decrypt(encrypted_data.encode()).decode()
    
    async def create_credential(self, user_id: str, request: CreateCredentialRequest) -> str:
        """Create a new credential for a user"""
        try:
            # Validate credential data based on type
            validation = await self.validate_credential(request.type, request.data)
            if not validation.valid:
                raise ValueError(f"Invalid credential data: {validation.message}")
            
            # Encrypt the credential data
            encrypted_data = self.encrypt_data(str(request.data))
            
            # Create credential document
            credential_id = str(uuid.uuid4())
            credential_doc = {
                "_id": credential_id,
                "name": request.name,
                "type": request.type,
                "provider": request.provider,
                "description": request.description,
                "encrypted_data": encrypted_data,
                "user_id": user_id,
                "created_at": str(uuid.uuid4()),  # Simple timestamp
                "is_active": True
            }
            
            # Save to database
            await self.db.credentials.insert_one(credential_doc)
            
            # Log audit action
            log_audit_action(user_id, "create_credential", {
                "credential_id": credential_id,
                "credential_type": request.type,
                "credential_name": request.name
            })
            
            logger.info(f"Created credential {credential_id} for user {user_id}")
            return credential_id
            
        except Exception as e:
            logger.error(f"Failed to create credential for user {user_id}: {e}")
            raise
    
    async def get_credential(self, user_id: str, credential_id: str) -> Optional[Dict[str, Any]]:
        """Get a credential for a user"""
        try:
            credential_doc = await self.db.credentials.find_one({
                "_id": credential_id,
                "user_id": user_id,
                "is_active": True
            })
            
            if not credential_doc:
                return None
            
            # Decrypt the data
            decrypted_data = self.decrypt_data(credential_doc["encrypted_data"])
            
            return {
                "id": credential_doc["_id"],
                "name": credential_doc["name"],
                "type": credential_doc["type"],
                "provider": credential_doc.get("provider"),
                "description": credential_doc.get("description"),
                "data": eval(decrypted_data),  # Convert string back to dict
                "created_at": credential_doc.get("created_at")
            }
            
        except Exception as e:
            logger.error(f"Failed to get credential {credential_id} for user {user_id}: {e}")
            return None
    
    async def list_credentials(self, user_id: str) -> List[Dict[str, Any]]:
        """List all credentials for a user"""
        try:
            credentials = []
            async for doc in self.db.credentials.find({
                "user_id": user_id,
                "is_active": True
            }):
                credentials.append({
                    "id": doc["_id"],
                    "name": doc["name"],
                    "type": doc["type"],
                    "provider": doc.get("provider"),
                    "description": doc.get("description"),
                    "created_at": doc.get("created_at")
                })
            
            return credentials
            
        except Exception as e:
            logger.error(f"Failed to list credentials for user {user_id}: {e}")
            return []
    
    async def update_credential(self, user_id: str, credential_id: str, updates: Dict[str, Any]) -> bool:
        """Update a credential"""
        try:
            update_data = {}
            
            if "name" in updates:
                update_data["name"] = updates["name"]
            if "description" in updates:
                update_data["description"] = updates["description"]
            if "data" in updates:
                # Re-encrypt the data
                encrypted_data = self.encrypt_data(str(updates["data"]))
                update_data["encrypted_data"] = encrypted_data
            
            if not update_data:
                return False
            
            result = await self.db.credentials.update_one(
                {"_id": credential_id, "user_id": user_id, "is_active": True},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                log_audit_action(user_id, "update_credential", {
                    "credential_id": credential_id,
                    "updates": list(updates.keys())
                })
                logger.info(f"Updated credential {credential_id} for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to update credential {credential_id} for user {user_id}: {e}")
            return False
    
    async def delete_credential(self, user_id: str, credential_id: str) -> bool:
        """Soft delete a credential"""
        try:
            result = await self.db.credentials.update_one(
                {"_id": credential_id, "user_id": user_id},
                {"$set": {"is_active": False}}
            )
            
            if result.modified_count > 0:
                log_audit_action(user_id, "delete_credential", {
                    "credential_id": credential_id
                })
                logger.info(f"Deleted credential {credential_id} for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete credential {credential_id} for user {user_id}: {e}")
            return False
    
    async def validate_credential(self, credential_type: CredentialType, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate credential data"""
        try:
            if credential_type == CredentialType.OPENAI_API_KEY:
                return await self._validate_openai_credential(data)
            elif credential_type == CredentialType.ANTHROPIC_API_KEY:
                return await self._validate_anthropic_credential(data)
            elif credential_type == CredentialType.GROQ_API_KEY:
                return await self._validate_groq_credential(data)
            elif credential_type == CredentialType.TAVILY_API_KEY:
                return await self._validate_tavily_credential(data)
            elif credential_type == CredentialType.GMAIL_CREDENTIALS:
                return await self._validate_gmail_credential(data)
            elif credential_type == CredentialType.SLACK_WEBHOOK:
                return await self._validate_slack_credential(data)
            elif credential_type == CredentialType.DATABASE_CONNECTION:
                return await self._validate_database_credential(data)
            else:
                return CredentialValidationResponse(
                    valid=True,
                    message="Credential type validation not implemented"
                )
                
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Validation failed: {str(e)}"
            )
    
    async def _validate_openai_credential(self, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate OpenAI API key"""
        try:
            import openai
            api_key = data.get("api_key")
            if not api_key:
                return CredentialValidationResponse(
                    valid=False,
                    message="OpenAI API key is required"
                )
            
            # Test the API key
            client = openai.OpenAI(api_key=api_key)
            response = client.models.list()
            
            return CredentialValidationResponse(
                valid=True,
                message="OpenAI API key is valid",
                details={"models_count": len(response.data)}
            )
            
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Invalid OpenAI API key: {str(e)}"
            )
    
    async def _validate_anthropic_credential(self, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate Anthropic API key"""
        try:
            import anthropic
            api_key = data.get("api_key")
            if not api_key:
                return CredentialValidationResponse(
                    valid=False,
                    message="Anthropic API key is required"
                )
            
            # Test the API key
            client = anthropic.Anthropic(api_key=api_key)
            response = client.models.list()
            
            return CredentialValidationResponse(
                valid=True,
                message="Anthropic API key is valid",
                details={"models_count": len(response.data)}
            )
            
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Invalid Anthropic API key: {str(e)}"
            )
    
    async def _validate_groq_credential(self, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate Groq API key"""
        try:
            from langchain_groq import ChatGroq
            api_key = data.get("api_key")
            if not api_key:
                return CredentialValidationResponse(
                    valid=False,
                    message="Groq API key is required"
                )
            
            # Test the API key
            llm = ChatGroq(api_key=api_key, model="llama3-8b-8192")
            response = llm.invoke("Hello")
            
            return CredentialValidationResponse(
                valid=True,
                message="Groq API key is valid"
            )
            
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Invalid Groq API key: {str(e)}"
            )
    
    async def _validate_tavily_credential(self, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate Tavily API key"""
        try:
            from langchain_tavily import TavilySearch
            api_key = data.get("api_key")
            if not api_key:
                return CredentialValidationResponse(
                    valid=False,
                    message="Tavily API key is required"
                )
            
            # Test the API key
            search = TavilySearch(api_key=api_key)
            response = search.invoke("test")
            
            return CredentialValidationResponse(
                valid=True,
                message="Tavily API key is valid"
            )
            
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Invalid Tavily API key: {str(e)}"
            )
    
    async def _validate_gmail_credential(self, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate Gmail credentials"""
        try:
            import smtplib
            email = data.get("email")
            password = data.get("password")
            
            if not email or not password:
                return CredentialValidationResponse(
                    valid=False,
                    message="Email and password are required"
                )
            
            # Test SMTP connection
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(email, password)
            server.quit()
            
            return CredentialValidationResponse(
                valid=True,
                message="Gmail credentials are valid"
            )
            
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Invalid Gmail credentials: {str(e)}"
            )
    
    async def _validate_slack_credential(self, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate Slack webhook"""
        try:
            import requests
            webhook_url = data.get("webhook_url")
            
            if not webhook_url:
                return CredentialValidationResponse(
                    valid=False,
                    message="Slack webhook URL is required"
                )
            
            # Test webhook URL format
            if not webhook_url.startswith("https://hooks.slack.com/"):
                return CredentialValidationResponse(
                    valid=False,
                    message="Invalid Slack webhook URL format"
                )
            
            return CredentialValidationResponse(
                valid=True,
                message="Slack webhook URL format is valid"
            )
            
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Invalid Slack webhook: {str(e)}"
            )
    
    async def _validate_database_credential(self, data: Dict[str, Any]) -> CredentialValidationResponse:
        """Validate database connection"""
        try:
            connection_string = data.get("connection_string")
            database_type = data.get("database_type", "mongodb")
            
            if not connection_string:
                return CredentialValidationResponse(
                    valid=False,
                    message="Database connection string is required"
                )
            
            # For now, just validate the format
            if database_type == "mongodb" and not connection_string.startswith("mongodb://"):
                return CredentialValidationResponse(
                    valid=False,
                    message="Invalid MongoDB connection string format"
                )
            
            return CredentialValidationResponse(
                valid=True,
                message="Database connection string format is valid"
            )
            
        except Exception as e:
            return CredentialValidationResponse(
                valid=False,
                message=f"Invalid database connection: {str(e)}"
            )
    
    async def inject_credentials_into_workflow(self, user_id: str, workflow: WorkflowGraph) -> WorkflowGraph:
        """Inject user credentials into workflow nodes"""
        try:
            # Get all user credentials
            user_credentials = await self.list_credentials(user_id)
            credential_map = {cred["id"]: cred for cred in user_credentials}
            
            # Process each node
            for node in workflow.nodes:
                if node.type == NodeType.LLM:
                    await self._inject_llm_credentials(node, user_id, credential_map)
                elif node.type == NodeType.TOOL:
                    await self._inject_tool_credentials(node, user_id, credential_map)
                elif node.type == NodeType.MEMORY:
                    await self._inject_memory_credentials(node, user_id, credential_map)
            
            return workflow
            
        except Exception as e:
            logger.error(f"Failed to inject credentials into workflow for user {user_id}: {e}")
            raise
    
    async def _inject_llm_credentials(self, node: WorkflowNode, user_id: str, credential_map: Dict[str, Any]):
        """Inject credentials into LLM node"""
        config = node.config
        credential_id = config.get("credential_id")
        
        if credential_id and credential_id in credential_map:
            credential = await self.get_credential(user_id, credential_id)
            if credential:
                config["api_key"] = credential["data"].get("api_key")
                logger.info(f"Injected credential {credential_id} into LLM node {node.id}")
    
    async def _inject_tool_credentials(self, node: WorkflowNode, user_id: str, credential_map: Dict[str, Any]):
        """Inject credentials into tool node"""
        config = node.config
        credential_id = config.get("credential_id")
        
        if credential_id and credential_id in credential_map:
            credential = await self.get_credential(user_id, credential_id)
            if credential:
                config["api_key"] = credential["data"].get("api_key")
                logger.info(f"Injected credential {credential_id} into tool node {node.id}")
    
    async def _inject_memory_credentials(self, node: WorkflowNode, user_id: str, credential_map: Dict[str, Any]):
        """Inject credentials into memory node"""
        config = node.config
        credential_id = config.get("credential_id")
        
        if credential_id and credential_id in credential_map:
            credential = await self.get_credential(user_id, credential_id)
            if credential:
                config["connection_string"] = credential["data"].get("connection_string")
                logger.info(f"Injected credential {credential_id} into memory node {node.id}")
    
    async def get_workflow_credential_requirements(self, workflow: WorkflowGraph) -> Dict[str, Any]:
        """Analyze workflow and return required credentials"""
        required_credentials = []
        missing_credentials = []
        
        for node in workflow.nodes:
            if node.type == NodeType.LLM:
                provider = node.config.get("provider", "groq")
                required_credentials.append({
                    "type": f"{provider}_api_key",
                    "provider": provider,
                    "node_id": node.id,
                    "node_type": "llm"
                })
            elif node.type == NodeType.TOOL:
                tool_type = node.config.get("tool_type")
                if tool_type == "tavily_search":
                    required_credentials.append({
                        "type": "tavily_api_key",
                        "provider": "tavily",
                        "node_id": node.id,
                        "node_type": "tool"
                    })
                elif tool_type == "send_email":
                    required_credentials.append({
                        "type": "gmail_credentials",
                        "provider": "gmail",
                        "node_id": node.id,
                        "node_type": "tool"
                    })
                elif tool_type == "post_to_slack":
                    required_credentials.append({
                        "type": "slack_webhook",
                        "provider": "slack",
                        "node_id": node.id,
                        "node_type": "tool"
                    })
        
        return {
            "required_credentials": required_credentials,
            "missing_credentials": missing_credentials
        }

# Global credential manager instance
credential_manager = CredentialManager()
