from fastapi import FastAPI, HTTPException, Header
from fastapi import Request
from .engine import execute_workflow
import asyncio
import time
from .api_workflows import router as workflows_router
from .api_executions import router as executions_router
from .api_credentials import router as credentials_router
from .api_credentials_enhanced import router as enhanced_credentials_router
from .api_auth import router as auth_router, get_current_user
from .scheduler import register_schedule_job
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json
from .schemas import ExecutionRequest
from .agent.builder import create_agentic_graph, AgentState, validate_workflow, get_workflow_metadata
from .agent.components import AVAILABLE_MODELS, MEMORY_BACKENDS, TOOL_REGISTRY
from .credential_manager import credential_manager
from langgraph.checkpoint.sqlite import SqliteSaver
import logging
from .monitoring import add_metrics
from .hitl import router as hitl_router
from .git_memory import save_state, get_state, list_states
from fastapi import APIRouter
from .api_credentials import get_credential
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta
SECRET_KEY = "lawsa_secret_key"
ALGORITHM = "HS256"
# Remove users_db and any in-memory user logic. All user management is now handled via MongoDB in api_auth.

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

# sentry_sdk.init(
#     dsn="<YOUR_SENTRY_DSN>",
#     traces_sample_rate=1.0,
# )

app = FastAPI()
# add_metrics(app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For production, specify your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflows_router, prefix="/api/workflows")
app.include_router(executions_router)
app.include_router(credentials_router)
app.include_router(enhanced_credentials_router)  # Enhanced credential management
app.include_router(auth_router)
app.include_router(auth_router, prefix="/api/users")
app.include_router(hitl_router)
app.include_router(credentials_router, prefix="/api/credentials")

# Persistent memory for conversations (in-memory SQLite for now)
memory = SqliteSaver.from_conn_string(":memory:")

memory_router = APIRouter(prefix="/memory", tags=["memory"])

@memory_router.post("/save")
def save_agent_state(state: dict):
    hash_ = save_state(state)
    return {"hash": hash_}

@memory_router.get("/get/{hash_}")
def get_agent_state(hash_: str):
    state = get_state(hash_)
    if state is None:
        return {"error": "Not found"}
    return {"state": state}

@memory_router.get("/list")
def list_agent_states():
    return {"hashes": list_states()}

app.include_router(memory_router)

tools_router = APIRouter(prefix="/api/tools", tags=["tools"])

@tools_router.get("/")
async def get_tools(user=Depends(get_current_user)):
    """
    Returns a list of available tools and their configurations.
    """
    return [
        {
            "name": "tavily_search",
            "display_name": "Tavily Search",
            "description": "Web search and information retrieval",
            "config_fields": [
                {"name": "api_key", "label": "Tavily API Key", "type": "text", "required": True},
                {"name": "search_depth", "label": "Search Depth", "type": "select", "options": ["basic", "advanced"], "default": "basic"}
            ]
        },
        {
            "name": "multiply",
            "display_name": "Multiply",
            "description": "Multiply two numbers",
            "config_fields": [
                {"name": "a", "label": "Number A", "type": "number", "required": True},
                {"name": "b", "label": "Number B", "type": "number", "required": True}
            ]
        },
        {
            "name": "send_email",
            "display_name": "Send Email",
            "description": "Send an email via SMTP",
            "config_fields": [
                {"name": "to", "label": "To", "type": "text", "required": True},
                {"name": "subject", "label": "Subject", "type": "text", "required": True},
                {"name": "body", "label": "Body", "type": "textarea", "required": True}
            ]
        },
        {
            "name": "post_to_slack",
            "display_name": "Post to Slack",
            "description": "Post a message to a Slack channel",
            "config_fields": [
                {"name": "channel", "label": "Channel", "type": "text", "required": True},
                {"name": "message", "label": "Message", "type": "textarea", "required": True}
            ]
        }
    ]

app.include_router(tools_router)

# New API endpoints for enhanced functionality
api_router = APIRouter(prefix="/api", tags=["api"])

@api_router.get("/models")
async def get_available_models(user=Depends(get_current_user)):
    """
    Returns a list of available models by provider.
    """
    return AVAILABLE_MODELS

@api_router.get("/memory-backends")
async def get_memory_backends(user=Depends(get_current_user)):
    """
    Returns a list of available memory backends.
    """
    return MEMORY_BACKENDS

@api_router.post("/validate-workflow")
async def validate_workflow_endpoint(workflow: dict, user=Depends(get_current_user)):
    """
    Validates a workflow and returns any errors found.
    """
    try:
        from .schemas import WorkflowGraph
        workflow_graph = WorkflowGraph(**workflow)
        errors = validate_workflow(workflow_graph)
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "metadata": get_workflow_metadata(workflow_graph)
        }
    except Exception as e:
        return {
            "valid": False,
            "errors": [f"Validation failed: {str(e)}"],
            "metadata": None
        }

@api_router.get("/providers")
async def get_providers(user=Depends(get_current_user)):
    """
    Returns a list of available LLM providers.
    """
    return [
        {
            "name": "groq",
            "display_name": "Groq",
            "description": "Ultra-fast inference with Llama, Mixtral, and other models",
            "models": AVAILABLE_MODELS.get("groq", [])
        },
        {
            "name": "openai",
            "display_name": "OpenAI",
            "description": "GPT-4, GPT-3.5, and other OpenAI models",
            "models": AVAILABLE_MODELS.get("openai", [])
        },
        {
            "name": "anthropic",
            "display_name": "Anthropic",
            "description": "Claude 3.5, Claude 3, and other Anthropic models",
            "models": AVAILABLE_MODELS.get("anthropic", [])
        },
        {
            "name": "together",
            "display_name": "Together AI",
            "description": "Open source models including Llama, Falcon, and more",
            "models": AVAILABLE_MODELS.get("together", [])
        },
        {
            "name": "cohere",
            "display_name": "Cohere",
            "description": "Command and other Cohere models",
            "models": AVAILABLE_MODELS.get("cohere", [])
        },
        {
            "name": "mistral",
            "display_name": "Mistral AI",
            "description": "Mistral Large, Medium, Small, and open source models",
            "models": AVAILABLE_MODELS.get("mistral", [])
        }
    ]

app.include_router(api_router)

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html>
        <head>
            <title>LAWSA Backend</title>
        </head>
        <body>
            <h1>LAWSA Backend API</h1>
            <p>Welcome to the LAWSA backend API. Use the following endpoints:</p>
            <ul>
                <li><a href="/docs">API Documentation</a></li>
                <li><a href="/health">Health Check</a></li>
            </ul>
        </body>
    </html>
    """

@app.get("/register", response_class=HTMLResponse)
def register():
    return """
    <html>
        <head>
            <title>Register - LAWSA</title>
        </head>
        <body>
            <h1>Register</h1>
            <form action="/auth/register" method="post">
                <input type="email" name="email" placeholder="Email" required><br>
                <input type="password" name="password" placeholder="Password" required><br>
                <button type="submit">Register</button>
            </form>
        </body>
    </html>
    """

@app.get("/login", response_class=HTMLResponse)
def login():
    return """
    <html>
        <head>
            <title>Login - LAWSA</title>
        </head>
        <body>
            <h1>Login</h1>
            <form action="/auth/login" method="post">
                <input type="email" name="email" placeholder="Email" required><br>
                <input type="password" name="password" placeholder="Password" required><br>
                <button type="submit">Login</button>
            </form>
        </body>
    </html>
    """

@app.get("/automation", response_class=HTMLResponse)
def automation():
    return """
    <html>
        <head>
            <title>Automation - LAWSA</title>
        </head>
        <body>
            <h1>Automation Dashboard</h1>
            <p>This is where you can manage your workflows.</p>
        </body>
    </html>
    """

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/workflows/execute/{workflow_id}")
async def execute_workflow_endpoint(workflow_id: str, request: Request):
    # TODO: Load workflow from DB by ID
    # For now, use a mock workflow
    mock_workflow = {
        "nodes": [
            {"id": "1", "type": "ManualTriggerNode", "config": {}},
            {"id": "2", "type": "CodeNode", "config": {"code": "result = {'message': 'Hello from workflow!'}"}}
        ],
        "connections": [{"source": "1", "target": "2"}]
    }
    result = await execute_workflow(mock_workflow)
    return {"result": result}

@app.post("/workflows/schedule/{workflow_id}")
async def schedule_workflow(workflow_id: str, cron: dict, username: str = Depends(lambda: None)):
    # TODO: Load workflow from DB by ID and user
    # For now, use a mock workflow
    mock_workflow = {
        "nodes": [
            {"id": "1", "type": "ScheduleTriggerNode", "config": {"cron": cron.get("expression", "0 0 * * *")}},
            {"id": "2", "type": "CodeNode", "config": {"code": "result = {'message': 'Scheduled task executed!'}"}}
        ],
        "connections": [{"source": "1", "target": "2"}]
    }
    # Register the scheduled job
    job_id = register_schedule_job(workflow_id, cron.get("expression", "0 0 * * *"), mock_workflow)
    return {"job_id": job_id, "status": "scheduled"}

@app.post("/webhook/{workflow_id}")
async def webhook_trigger(workflow_id: str):
    # TODO: Load workflow from DB by ID and check for WebhookTriggerNode
    # For now, use a mock workflow
    mock_workflow = {
        "nodes": [
            {"id": "1", "type": "WebhookTriggerNode", "config": {}},
            {"id": "2", "type": "CodeNode", "config": {"code": "result = {'message': 'Webhook triggered!'}"}}
        ],
        "connections": [{"source": "1", "target": "2"}]
    }
    result = await execute_workflow(mock_workflow)
    return {"result": result}

@app.post("/execute-agent")
async def execute_agent(request: ExecutionRequest, user=Depends(get_current_user)):
    import sys
    import json as _json
    try:
        raw_body = await request.json()
        print("[DEBUG] Raw request body:", _json.dumps(raw_body, indent=2), file=sys.stderr)
    except Exception as e:
        print(f"[DEBUG] Could not print raw request body: {e}", file=sys.stderr)
    print("[DEBUG] /execute-agent endpoint called")
    """
    Executes a dynamically constructed agentic graph and streams the results.
    """
    # Get the workflow from the request
    workflow = request.graph
    
    # Inject user credentials into the workflow
    try:
        workflow = await credential_manager.inject_credentials_into_workflow(user, workflow)
        logger.info(f"Injected credentials into workflow for user {user}")
    except Exception as e:
        logger.error(f"Failed to inject credentials for user {user}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to inject credentials: {str(e)}")
    
    # Validate the workflow
    try:
        errors = validate_workflow(workflow)
        if errors:
            raise HTTPException(status_code=400, detail=f"Workflow validation failed: {errors}")
    except Exception as e:
        logger.error(f"Workflow validation failed for user {user}: {e}")
        raise HTTPException(status_code=400, detail=f"Workflow validation failed: {str(e)}")
    
    try:
        # 1. Dynamically build the graph from the frontend's definition
        graph_builder = create_agentic_graph(workflow)
        # 2. Compile the graph with memory persistence
        runnable = graph_builder.compile()
    except ValueError as e:
        logger.error(f"Failed to build agentic graph for user {user}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    # 3. Define the async generator for streaming responses
    async def stream_generator():
        config = {"configurable": {"thread_id": request.thread_id}}
        async for event in runnable.astream_events(
            {"messages": [("user", request.input)]},
            config=config,
            version="v2"
        ):
            # Stream agent tokens
            if event["event"] == "on_chat_model_stream" and event["name"] == "agent":
                chunk = event["data"]["chunk"]
                if chunk.content:
                    yield json.dumps({"type": "token", "data": chunk.content})
            # Stream tool usage
            if event["event"] == "on_tool_start":
                yield json.dumps({
                    "type": "tool_start",
                    "data": {"name": event["name"], "input": event["data"].get("input")}
                })
            if event["event"] == "on_tool_end":
                output = event["data"].get("output")
                if hasattr(output, "dict"):
                    output = output.dict()
                elif hasattr(output, "__dict__"):
                    output = vars(output)
                yield json.dumps({
                    "type": "tool_end",
                    "data": {"name": event["name"], "output": output}
                })
    return EventSourceResponse(stream_generator()) 

# Mock user storage for testing (remove in production)
mock_users = {}

@app.post("/auth/register")
async def mock_register(req: dict):
    email = req.get("email")
    password = req.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    if email in mock_users:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # In production, hash the password
    mock_users[email] = {"email": email, "password": password}
    
    # Create JWT token
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(hours=24)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/login")
async def mock_login(req: dict):
    email = req.get("email")
    password = req.get("password")
    
    if email not in mock_users or mock_users[email]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(hours=24)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me")
async def mock_me(token: str = Header(None)):
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email not in mock_users:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"email": email}
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token") 