from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_together import TogetherLLM
from langchain_cohere import ChatCohere
from langchain_mistralai import ChatMistralAI
from langchain.tools import tool
from langchain_tavily import TavilySearch
import smtplib
import os
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
import json

# --- Tool Registry ---

@tool
def multiply(a: int, b: int) -> int:
    """Multiply two integers."""
    return a * b

@tool
def send_email(to: str, subject: str, body: str, smtp_config: Optional[Dict[str, Any]] = None) -> str:
    """Send an email using SMTP."""
    # Use provided config or environment variables
    if smtp_config:
        smtp_server = smtp_config.get("smtp_server", "smtp.gmail.com")
        smtp_port = smtp_config.get("smtp_port", 587)
        sender_email = smtp_config.get("sender_email")
        sender_password = smtp_config.get("sender_password")
    else:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.environ.get("GMAIL_USER")
        sender_password = os.environ.get("GMAIL_APP_PASSWORD")
    
    if not sender_email or not sender_password:
        return "Missing email credentials. Please configure SMTP settings."

    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [to], msg.as_string())
        return f"Email sent successfully to {to} with subject '{subject}'"
    except Exception as e:
        return f"Failed to send email: {str(e)}"

@tool
def post_to_slack(channel: str, message: str, webhook_url: Optional[str] = None) -> str:
    """Post a message to a Slack channel."""
    if not webhook_url:
        webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    
    if not webhook_url:
        return "Missing Slack webhook URL. Please configure SLACK_WEBHOOK_URL environment variable."
    
    payload = {
        "channel": channel,
        "text": message,
        "username": "LAWSA Bot"
    }
    
    try:
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        return f"Message posted successfully to Slack channel {channel}"
    except Exception as e:
        return f"Failed to post to Slack: {str(e)}"

@tool
def http_request(method: str, url: str, headers: Optional[Dict[str, str]] = None, 
                data: Optional[Dict[str, Any]] = None) -> str:
    """Make an HTTP request."""
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            return f"Unsupported HTTP method: {method}"
        
        response.raise_for_status()
        return json.dumps({
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        })
    except Exception as e:
        return f"HTTP request failed: {str(e)}"

@tool
def database_query(query: str, connection_string: Optional[str] = None) -> str:
    """Execute a database query (placeholder implementation)."""
    # This is a placeholder - in a real implementation, you'd connect to the database
    return f"Database query executed: {query} (placeholder implementation)"

TOOL_REGISTRY = {
    "tavily_search": TavilySearch(max_results=5),
    "multiply": multiply,
    "send_email": send_email,
    "post_to_slack": post_to_slack,
    "http_request": http_request,
    "database_query": database_query,
}

# --- LLM Registry ---

def create_llm(provider: str, model: str, api_key: Optional[str] = None, 
               temperature: float = 0.7, max_tokens: Optional[int] = None) -> Any:
    """Create an LLM instance based on provider and configuration."""
    
    # Use provided API key or environment variable
    if not api_key:
        api_key = os.environ.get(f"{provider.upper()}_API_KEY")
    
    if not api_key:
        raise ValueError(f"API key not found for provider {provider}")
    
    common_kwargs = {
        "temperature": temperature,
        "api_key": api_key
    }
    
    if max_tokens:
        common_kwargs["max_tokens"] = max_tokens
    
    if provider == "groq":
        return ChatGroq(model=model, **common_kwargs)
    elif provider == "openai":
        return ChatOpenAI(model=model, **common_kwargs)
    elif provider == "anthropic":
        return ChatAnthropic(model=model, **common_kwargs)
    elif provider == "together":
        return TogetherLLM(model=model, **common_kwargs)
    elif provider == "cohere":
        return ChatCohere(model=model, **common_kwargs)
    elif provider == "mistral":
        return ChatMistralAI(model=model, **common_kwargs)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

LLM_REGISTRY = {
    "groq": ChatGroq,
    "openai": ChatOpenAI,
    "anthropic": ChatAnthropic,
    "together": TogetherLLM,
    "cohere": ChatCohere,
    "mistral": ChatMistralAI,
}

# --- Available Models Configuration ---

AVAILABLE_MODELS = {
    "openai": [
        {"name": "gpt-4o", "context_length": 128000},
        {"name": "gpt-4o-mini", "context_length": 128000},
        {"name": "gpt-4-turbo", "context_length": 128000},
        {"name": "gpt-3.5-turbo", "context_length": 16385},
    ],
    "anthropic": [
        {"name": "claude-3-5-sonnet-20241022", "context_length": 200000},
        {"name": "claude-3-5-haiku-20241022", "context_length": 200000},
        {"name": "claude-3-opus-20240229", "context_length": 200000},
        {"name": "claude-3-sonnet-20240229", "context_length": 200000},
    ],
    "groq": [
        {"name": "llama3-70b-8192", "context_length": 8192},
        {"name": "llama3-8b-8192", "context_length": 8192},
        {"name": "mixtral-8x7b-32768", "context_length": 32768},
    ],
    "together": [
        {"name": "meta-llama/Llama-2-70b-chat-hf", "context_length": 4096},
        {"name": "meta-llama/Llama-2-13b-chat-hf", "context_length": 4096},
    ],
    "cohere": [
        {"name": "command", "context_length": 32768},
        {"name": "command-light", "context_length": 32768},
    ],
    "mistral": [
        {"name": "mistral-large-latest", "context_length": 32768},
        {"name": "mistral-medium-latest", "context_length": 32768},
        {"name": "mistral-small-latest", "context_length": 32768},
    ]
}

# --- Memory Backends ---

MEMORY_BACKENDS = {
    "window_buffer": {
        "display_name": "Window Buffer",
        "description": "In-memory buffer with sliding window",
        "config_fields": [
            {"name": "window_size", "label": "Window Size", "type": "number", "default": 10}
        ]
    },
    "mongodb": {
        "display_name": "MongoDB",
        "description": "MongoDB database for persistent storage",
        "config_fields": [
            {"name": "connection_string", "label": "Connection String", "type": "text", "default": "mongodb://localhost:27017"}
        ]
    },
    "sqlite": {
        "display_name": "SQLite",
        "description": "Lightweight SQLite database",
        "config_fields": [
            {"name": "database_path", "label": "Database Path", "type": "text", "default": "./memory.db"}
        ]
    }
} 