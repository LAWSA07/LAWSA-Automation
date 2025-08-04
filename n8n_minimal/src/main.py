from fastapi import FastAPI, HTTPException, Header
from fastapi import Request
from .engine import execute_workflow
import asyncio
import time
from .api_workflows import router as workflows_router
from .api_executions import router as executions_router
from .api_credentials import router as credentials_router
from .api_auth import router as auth_router, get_current_user
from .scheduler import register_schedule_job
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json
from .schemas import ExecutionRequest
from .agent.builder import create_agentic_graph, AgentState
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
            "config": {"api_key": "string", "search_depth": "basic|advanced"}
        },
        {
            "name": "multiply",
            "config": {"a": "number", "b": "number"}
        },
        {
            "name": "send_email",
            "config": {"smtp_server": "string", "username": "string", "password": "string", "to": "string", "subject": "string", "body": "string"}
        },
        {
            "name": "post_to_slack",
            "config": {"webhook_url": "string", "channel": "string", "message": "string"}
        }
    ]

app.include_router(tools_router)

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html><body style='background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;'>
    <h1 style='font-size:48px;font-weight:900;letter-spacing:2px;margin-bottom:32px;'>lawsa</h1>
    <a href='/register' style='background:#fff;color:#000;border:none;border-radius:8px;padding:16px 40px;font-size:22px;font-weight:700;text-decoration:none;'>Get Started</a>
    </body></html>
    """

@app.get("/register", response_class=HTMLResponse)
def register():
    return """
    <html><body style='background:#fff;color:#000;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;'>
    <h2 style='font-size:32px;font-weight:800;margin-bottom:24px;'>Register</h2>
    <input placeholder='Email' style='margin-bottom:12px;padding:10px;border-radius:6px;border:1px solid #bbb;width:240px;'/>
    <input placeholder='Password' type='password' style='margin-bottom:18px;padding:10px;border-radius:6px;border:1px solid #bbb;width:240px;'/>
    <a href='/login' style='background:#000;color:#fff;border:none;border-radius:8px;padding:12px 32px;font-size:18px;font-weight:700;text-decoration:none;margin-bottom:12px;'>Register</a>
    <a href='/login' style='background:none;color:#000;border:none;font-size:15px;text-decoration:underline;'>Already have an account? Login</a>
    </body></html>
    """

@app.get("/login", response_class=HTMLResponse)
def login():
    return """
    <html><body style='background:#fff;color:#000;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;'>
    <h2 style='font-size:32px;font-weight:800;margin-bottom:24px;'>Login</h2>
    <input placeholder='Email' style='margin-bottom:12px;padding:10px;border-radius:6px;border:1px solid #bbb;width:240px;'/>
    <input placeholder='Password' type='password' style='margin-bottom:18px;padding:10px;border-radius:6px;border:1px solid #bbb;width:240px;'/>
    <a href='/automation' style='background:#000;color:#fff;border:none;border-radius:8px;padding:12px 32px;font-size:18px;font-weight:700;text-decoration:none;margin-bottom:12px;'>Login</a>
    <a href='/register' style='background:none;color:#000;border:none;font-size:15px;text-decoration:underline;'>Don't have an account? Register</a>
    </body></html>
    """

@app.get("/automation", response_class=HTMLResponse)
def automation():
    return """
    <html><body style='background:#fff;color:#000;'><h2 style='text-align:center;margin-top:40px;font-size:32px;'>Main Automation Page</h2></body></html>
    """

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/workflows/execute/{workflow_id}")
async def execute_workflow_endpoint(workflow_id: str, request: Request):
    # TODO: Load workflow from DB by ID
    # For now, use a mock workflow
    workflow = {
        "nodes": [
            {"type": "ManualTriggerNode", "config": {}},
            {"type": "CodeNode", "config": {"code": "result = {'msg': 'Hello from CodeNode!'}"}},
        ]
    }
    result = await execute_workflow(workflow)
    return {"result": result}

@app.post("/workflows/schedule/{workflow_id}")
async def schedule_workflow(workflow_id: str, cron: dict, username: str = Depends(lambda: None)):
    # TODO: Load workflow from DB by ID and user
    # For now, use a mock workflow
    workflow = {
        "nodes": [
            {"type": "ScheduleTriggerNode", "config": {}},
            {"type": "CodeNode", "config": {"code": "result = {'msg': 'Scheduled!'}"}},
        ]
    }
    register_schedule_job(workflow, cron)
    return {"scheduled": True}

@app.post("/webhook/{workflow_id}")
async def webhook_trigger(workflow_id: str):
    # TODO: Load workflow from DB by ID and check for WebhookTriggerNode
    # For now, use a mock workflow
    workflow = {
        "nodes": [
            {"type": "WebhookTriggerNode", "config": {}},
            {"type": "CodeNode", "config": {"code": "result = {'msg': 'Webhook triggered!'}"}},
        ]
    }
    result = await execute_workflow(workflow)
    return {"result": result}

async def inject_credentials_into_tools(workflow, username=None):
    for node in getattr(workflow, 'nodes', []):
        if node.type == 'tool' and node.config and node.config.get('credentialId'):
            cred_id = node.config['credentialId']
            try:
                cred = await get_credential(cred_id, username=username) if username else await get_credential(cred_id)
                if cred and 'data' in cred:
                    # Inject as 'api_key' or 'password' depending on tool type
                    node.config['api_key'] = cred['data']
            except Exception as e:
                print(f"Credential injection failed for node {node.id}: {e}")
    return workflow

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
    # Inject credentials into tool nodes before execution
    workflow = request.graph
    # --- Validation: Tool/LLM config ---
    from fastapi import HTTPException
    # Define available tools and models locally since data.models doesn't exist
    AVAILABLE_TOOLS = [
        {
            "name": "tavily_search",
            "displayName": "Tavily Search",
            "configFields": [
                {"name": "api_key", "label": "API Key", "required": True},
                {"name": "search_depth", "label": "Search Depth", "required": False}
            ]
        },
        {
            "name": "multiply",
            "displayName": "Multiply",
            "configFields": [
                {"name": "a", "label": "Number A", "required": True},
                {"name": "b", "label": "Number B", "required": True}
            ]
        }
    ]
    AVAILABLE_MODELS = ["gpt-4", "gpt-3.5-turbo", "claude-3"]
    for node in getattr(workflow, 'nodes', []):
        if getattr(node, 'type', None) == 'tool':
            tool_type = node.config.get('toolType') or node.config.get('type')
            tool = next((t for t in AVAILABLE_TOOLS if t['name'] == tool_type), None)
            if not tool:
                raise HTTPException(status_code=400, detail=f"Unsupported tool type: {tool_type}")
            for field in tool['configFields']:
                if field.get('required') and not node.config.get(field['name']):
                    raise HTTPException(status_code=400, detail=f"Tool node '{tool['displayName']}' is missing required field: {field['label']}")
            # Credential validation
            if 'credentialId' in node.config and not node.config.get('api_key'):
                raise HTTPException(status_code=400, detail=f"Tool node '{tool['displayName']}' is missing injected credential.")
        if getattr(node, 'type', None) == 'agentic':
            # LLM validation (simplified, extend as needed)
            if not node.config.get('models'):
                raise HTTPException(status_code=400, detail="Agentic node is missing LLM model configuration.")
    workflow = await inject_credentials_into_tools(workflow)
    try:
        # 1. Dynamically build the graph from the frontend's definition
        graph_builder = create_agentic_graph(workflow)
        # 2. Compile the graph with memory persistence
        runnable = graph_builder.compile()
    except ValueError as e:
        from fastapi import HTTPException
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
        raise HTTPException(status_code=409, detail="Email already registered")
    
    mock_users[email] = {
        "email": email,
        "username": email,
        "hashed_password": password,  # In production, hash this
        "role": "user"
    }
    return {"success": True, "username": email, "email": email}

@app.post("/auth/login")
async def mock_login(req: dict):
    email = req.get("email")
    password = req.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    user = mock_users.get(email)
    if not user or user["hashed_password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create a simple token (in production, use proper JWT)
    token = f"mock_token_{email}_{int(time.time())}"
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me")
async def mock_me(token: str = Header(None)):
    if not token or not token.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Extract email from token
    parts = token.split("_")
    if len(parts) < 3:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    email = parts[2]
    user = mock_users.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "name": user.get("name", ""),
        "avatar": user.get("avatar", ""),
        "status": user.get("status", "")
    } 