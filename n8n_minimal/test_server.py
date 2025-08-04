from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import time

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock user storage for testing
mock_users = {}

@app.get("/health")
def health_check():
    return {"status": "ok"}

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
        "hashed_password": password,
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
    
    # Create a simple token
    token = f"mock_token_{email}_{int(time.time())}"
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me")
async def mock_me(token: str = None):
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

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html><body style='background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;'>
    <h1 style='font-size:48px;font-weight:900;letter-spacing:2px;margin-bottom:32px;'>LAWSA Backend</h1>
    <p style='font-size:18px;'>Backend server is running successfully!</p>
    </body></html>
    """

# Mock workflow storage
mock_workflows = {}
mock_credentials = {}
mock_executions = {}

@app.post("/api/workflows")
async def create_workflow(req: dict):
    workflow_id = f"workflow_{int(time.time())}"
    mock_workflows[workflow_id] = {
        "id": workflow_id,
        "name": req.get("name", "Untitled"),
        "nodes": req.get("nodes", []),
        "edges": req.get("edges", []),
        "created_at": time.time()
    }
    return {"id": workflow_id, "success": True}

@app.get("/api/workflows")
async def list_workflows():
    return list(mock_workflows.values())

@app.get("/api/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    if workflow_id not in mock_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return mock_workflows[workflow_id]

@app.post("/api/workflows/{workflow_id}/execute")
async def execute_workflow_endpoint(workflow_id: str):
    if workflow_id not in mock_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    execution_id = f"exec_{int(time.time())}"
    mock_executions[execution_id] = {
        "id": execution_id,
        "workflow_id": workflow_id,
        "status": "completed",
        "result": "Mock execution completed successfully"
    }
    return {"execution_id": execution_id, "status": "completed"}

@app.get("/api/executions/{execution_id}")
async def get_execution(execution_id: str):
    if execution_id not in mock_executions:
        raise HTTPException(status_code=404, detail="Execution not found")
    return mock_executions[execution_id]

@app.post("/api/credentials")
async def create_credential(req: dict):
    cred_id = f"cred_{int(time.time())}"
    mock_credentials[cred_id] = {
        "id": cred_id,
        "name": req.get("name", ""),
        "type": req.get("type_", ""),
        "data": req.get("data", ""),
        "created_at": time.time()
    }
    return {"id": cred_id, "success": True}

@app.get("/api/credentials")
async def list_credentials():
    return list(mock_credentials.values())

@app.get("/api/credentials/{cred_id}")
async def get_credential(cred_id: str):
    if cred_id not in mock_credentials:
        raise HTTPException(status_code=404, detail="Credential not found")
    return mock_credentials[cred_id]

@app.delete("/api/credentials/{cred_id}")
async def delete_credential(cred_id: str):
    if cred_id not in mock_credentials:
        raise HTTPException(status_code=404, detail="Credential not found")
    del mock_credentials[cred_id]
    return {"success": True}

@app.post("/execute-agent")
async def execute_agent(req: dict):
    # Mock agent execution
    return {"result": "Mock agent execution completed", "status": "success"} 