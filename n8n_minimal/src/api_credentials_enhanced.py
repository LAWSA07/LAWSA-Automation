from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from .schemas import (
    CreateCredentialRequest, UpdateCredentialRequest, CredentialValidationRequest,
    CredentialValidationResponse, CredentialConfig, CredentialType
)
from .credential_manager import credential_manager
from .api_auth import get_current_user
from .audit import log_audit_action
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/credentials", tags=["credentials"])

@router.post("/", response_model=Dict[str, str], status_code=201)
async def create_credential(
    request: CreateCredentialRequest,
    user: str = Depends(get_current_user)
):
    """Create a new credential for the authenticated user"""
    try:
        credential_id = await credential_manager.create_credential(user, request)
        return {"credential_id": credential_id, "message": "Credential created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create credential for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create credential")

@router.get("/", response_model=List[Dict[str, Any]])
async def list_credentials(user: str = Depends(get_current_user)):
    """List all credentials for the authenticated user"""
    try:
        credentials = await credential_manager.list_credentials(user)
        return credentials
    except Exception as e:
        logger.error(f"Failed to list credentials for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list credentials")

@router.get("/{credential_id}", response_model=Dict[str, Any])
async def get_credential(
    credential_id: str,
    user: str = Depends(get_current_user)
):
    """Get a specific credential for the authenticated user"""
    try:
        credential = await credential_manager.get_credential(user, credential_id)
        if not credential:
            raise HTTPException(status_code=404, detail="Credential not found")
        return credential
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get credential {credential_id} for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get credential")

@router.put("/{credential_id}", response_model=Dict[str, str])
async def update_credential(
    credential_id: str,
    request: UpdateCredentialRequest,
    user: str = Depends(get_current_user)
):
    """Update a credential for the authenticated user"""
    try:
        updates = {}
        if request.name is not None:
            updates["name"] = request.name
        if request.description is not None:
            updates["description"] = request.description
        if request.data is not None:
            updates["data"] = request.data
        
        success = await credential_manager.update_credential(user, credential_id, updates)
        if not success:
            raise HTTPException(status_code=404, detail="Credential not found")
        
        return {"message": "Credential updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update credential {credential_id} for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update credential")

@router.delete("/{credential_id}", response_model=Dict[str, str])
async def delete_credential(
    credential_id: str,
    user: str = Depends(get_current_user)
):
    """Delete a credential for the authenticated user"""
    try:
        success = await credential_manager.delete_credential(user, credential_id)
        if not success:
            raise HTTPException(status_code=404, detail="Credential not found")
        
        return {"message": "Credential deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete credential {credential_id} for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete credential")

@router.post("/validate", response_model=CredentialValidationResponse)
async def validate_credential(
    request: CredentialValidationRequest,
    user: str = Depends(get_current_user)
):
    """Validate a credential without saving it"""
    try:
        validation = await credential_manager.validate_credential(request.type, request.data)
        return validation
    except Exception as e:
        logger.error(f"Failed to validate credential for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to validate credential")

@router.get("/types", response_model=List[Dict[str, Any]])
async def get_credential_types():
    """Get available credential types and their requirements"""
    return [
        {
            "type": "openai_api_key",
            "name": "OpenAI API Key",
            "description": "API key for OpenAI services (GPT-4, GPT-3.5, etc.)",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "OpenAI API key"}
            ]
        },
        {
            "type": "anthropic_api_key",
            "name": "Anthropic API Key",
            "description": "API key for Anthropic services (Claude models)",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "Anthropic API key"}
            ]
        },
        {
            "type": "groq_api_key",
            "name": "Groq API Key",
            "description": "API key for Groq services (ultra-fast inference)",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "Groq API key"}
            ]
        },
        {
            "type": "together_api_key",
            "name": "Together AI API Key",
            "description": "API key for Together AI services (open source models)",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "Together AI API key"}
            ]
        },
        {
            "type": "cohere_api_key",
            "name": "Cohere API Key",
            "description": "API key for Cohere services (Command models)",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "Cohere API key"}
            ]
        },
        {
            "type": "mistral_api_key",
            "name": "Mistral AI API Key",
            "description": "API key for Mistral AI services",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "Mistral AI API key"}
            ]
        },
        {
            "type": "tavily_api_key",
            "name": "Tavily API Key",
            "description": "API key for Tavily search services",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "Tavily API key"}
            ]
        },
        {
            "type": "gmail_credentials",
            "name": "Gmail Credentials",
            "description": "Gmail account credentials for sending emails",
            "fields": [
                {"name": "email", "type": "email", "required": True, "description": "Gmail address"},
                {"name": "password", "type": "password", "required": True, "description": "App password (not regular password)"},
                {"name": "smtp_server", "type": "text", "required": False, "description": "SMTP server (default: smtp.gmail.com)"},
                {"name": "smtp_port", "type": "number", "required": False, "description": "SMTP port (default: 587)"}
            ]
        },
        {
            "type": "slack_webhook",
            "name": "Slack Webhook",
            "description": "Slack webhook URL for posting messages",
            "fields": [
                {"name": "webhook_url", "type": "url", "required": True, "description": "Slack webhook URL"},
                {"name": "channel", "type": "text", "required": False, "description": "Default channel for messages"}
            ]
        },
        {
            "type": "database_connection",
            "name": "Database Connection",
            "description": "Database connection string for memory storage",
            "fields": [
                {"name": "connection_string", "type": "password", "required": True, "description": "Database connection string"},
                {"name": "database_type", "type": "select", "required": True, "description": "Database type", "options": ["mongodb", "postgresql", "sqlite"]}
            ]
        },
        {
            "type": "custom_api_key",
            "name": "Custom API Key",
            "description": "Custom API key for external services",
            "fields": [
                {"name": "api_key", "type": "password", "required": True, "description": "API key"},
                {"name": "service_name", "type": "text", "required": True, "description": "Service name"}
            ]
        }
    ]

@router.post("/workflow/requirements", response_model=Dict[str, Any])
async def get_workflow_credential_requirements(
    workflow: Dict[str, Any],
    user: str = Depends(get_current_user)
):
    """Analyze a workflow and return required credentials"""
    try:
        from .schemas import WorkflowGraph
        workflow_graph = WorkflowGraph(**workflow)
        requirements = await credential_manager.get_workflow_credential_requirements(workflow_graph)
        
        # Get user's existing credentials
        user_credentials = await credential_manager.list_credentials(user)
        
        # Match required credentials with user's existing credentials
        matched_credentials = []
        missing_credentials = []
        
        for required in requirements["required_credentials"]:
            # Find matching credential
            matching_credential = None
            for user_cred in user_credentials:
                if user_cred["type"] == required["type"]:
                    matching_credential = user_cred
                    break
            
            if matching_credential:
                matched_credentials.append({
                    "required": required,
                    "credential": matching_credential
                })
            else:
                missing_credentials.append(required)
        
        return {
            "required_credentials": requirements["required_credentials"],
            "matched_credentials": matched_credentials,
            "missing_credentials": missing_credentials,
            "user_credentials": user_credentials
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze workflow credentials for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze workflow credentials")

@router.post("/workflow/inject", response_model=Dict[str, Any])
async def inject_credentials_into_workflow(
    workflow: Dict[str, Any],
    user: str = Depends(get_current_user)
):
    """Inject user credentials into a workflow"""
    try:
        from .schemas import WorkflowGraph
        workflow_graph = WorkflowGraph(**workflow)
        
        # Inject credentials
        updated_workflow = await credential_manager.inject_credentials_into_workflow(user, workflow_graph)
        
        return {
            "workflow": updated_workflow.dict(),
            "message": "Credentials injected successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to inject credentials into workflow for user {user}: {e}")
        raise HTTPException(status_code=500, detail="Failed to inject credentials")

@router.get("/providers", response_model=List[Dict[str, Any]])
async def get_credential_providers():
    """Get available credential providers"""
    return [
        {
            "name": "openai",
            "display_name": "OpenAI",
            "description": "GPT-4, GPT-3.5, and other OpenAI models",
            "credential_type": "openai_api_key",
            "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]
        },
        {
            "name": "anthropic",
            "display_name": "Anthropic",
            "description": "Claude 3.5, Claude 3, and other Anthropic models",
            "credential_type": "anthropic_api_key",
            "models": ["claude-3-5-sonnet", "claude-3-5-haiku", "claude-3-opus", "claude-3-sonnet"]
        },
        {
            "name": "groq",
            "display_name": "Groq",
            "description": "Ultra-fast inference with Llama, Mixtral, and other models",
            "credential_type": "groq_api_key",
            "models": ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"]
        },
        {
            "name": "together",
            "display_name": "Together AI",
            "description": "Open source models including Llama, Falcon, and more",
            "credential_type": "together_api_key",
            "models": ["meta-llama/Llama-2-70b-chat-hf", "meta-llama/Llama-2-13b-chat-hf"]
        },
        {
            "name": "cohere",
            "display_name": "Cohere",
            "description": "Command and other Cohere models",
            "credential_type": "cohere_api_key",
            "models": ["command", "command-light"]
        },
        {
            "name": "mistral",
            "display_name": "Mistral AI",
            "description": "Mistral Large, Medium, Small, and open source models",
            "credential_type": "mistral_api_key",
            "models": ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"]
        },
        {
            "name": "tavily",
            "display_name": "Tavily",
            "description": "Web search and information retrieval",
            "credential_type": "tavily_api_key",
            "models": []
        },
        {
            "name": "gmail",
            "display_name": "Gmail",
            "description": "Email sending via Gmail SMTP",
            "credential_type": "gmail_credentials",
            "models": []
        },
        {
            "name": "slack",
            "display_name": "Slack",
            "description": "Slack notifications via webhooks",
            "credential_type": "slack_webhook",
            "models": []
        }
    ]
