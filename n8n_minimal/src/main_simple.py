from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
from datetime import datetime, timedelta
from jose import jwt
import asyncio
from typing import Optional
import os
from dotenv import load_dotenv
# Load env from current working directory and project root
load_dotenv()
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
load_dotenv(os.path.join(PROJECT_ROOT, '.env'), override=False)
import httpx

# Simple in-memory storage for development
mock_users = {}
mock_workflows = {}
mock_credentials = {}

SECRET_KEY = "lawsa_secret_key"
ALGORITHM = "HS256"

app = FastAPI(title="LAWSA Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "LAWSA Backend API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Authentication endpoints
@app.post("/auth/register")
async def register(req: dict):
    email = req.get("email")
    password = req.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    if email in mock_users:
        raise HTTPException(status_code=400, detail="User already exists")
    
    mock_users[email] = {"email": email, "password": password, "name": email.split('@')[0]}
    
    # Create JWT token
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(hours=24)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer", "user": {"email": email, "name": email.split('@')[0]}}

@app.post("/auth/login")
async def login(req: dict):
    email = req.get("email")
    password = req.get("password")
    
    if email not in mock_users or mock_users[email]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(hours=24)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer", "user": mock_users[email]}

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token required")
    
    try:
        # Extract token from "Bearer <token>"
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
            
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email not in mock_users:
            raise HTTPException(status_code=401, detail="Invalid token")
        return mock_users[email]
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Workflow endpoints
@app.get("/api/workflows")
async def get_workflows(user=Depends(get_current_user)):
    user_workflows = [w for w in mock_workflows.values() if w.get("user_email") == user["email"]]
    return user_workflows

@app.post("/api/workflows")
async def create_workflow(workflow: dict, user=Depends(get_current_user)):
    workflow_id = f"workflow_{len(mock_workflows) + 1}"
    
    workflow_data = {
        "id": workflow_id,
        "name": workflow.get("name", "Untitled Workflow"),
        "nodes": workflow.get("nodes", []),
        "edges": workflow.get("edges", []),
        "user_email": user["email"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    mock_workflows[workflow_id] = workflow_data
    return workflow_data

@app.get("/api/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, user=Depends(get_current_user)):
    if workflow_id not in mock_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = mock_workflows[workflow_id]
    if workflow.get("user_email") != user["email"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return workflow

@app.put("/api/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, workflow: dict, user=Depends(get_current_user)):
    if workflow_id not in mock_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    existing_workflow = mock_workflows[workflow_id]
    if existing_workflow.get("user_email") != user["email"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated_workflow = {
        **existing_workflow,
        "name": workflow.get("name", existing_workflow["name"]),
        "nodes": workflow.get("nodes", existing_workflow["nodes"]),
        "edges": workflow.get("edges", existing_workflow["edges"]),
        "updated_at": datetime.now().isoformat()
    }
    
    mock_workflows[workflow_id] = updated_workflow
    return updated_workflow

@app.delete("/api/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, user=Depends(get_current_user)):
    if workflow_id not in mock_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = mock_workflows[workflow_id]
    if workflow.get("user_email") != user["email"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    del mock_workflows[workflow_id]
    return {"message": "Workflow deleted successfully"}

# Credentials endpoints
@app.get("/api/credentials")
async def get_credentials(user=Depends(get_current_user)):
    user_credentials = [c for c in mock_credentials.values() if c.get("user_email") == user["email"]]
    return user_credentials

@app.post("/api/credentials")
async def create_credential(credential: dict, user=Depends(get_current_user)):
    credential_id = f"credential_{len(mock_credentials) + 1}"
    
    credential_data = {
        "id": credential_id,
        "name": credential.get("name", "Untitled Credential"),
        "type": credential.get("type", "api_key"),
        "config": credential.get("config", {}),
        "user_email": user["email"],
        "created_at": datetime.now().isoformat()
    }
    
    mock_credentials[credential_id] = credential_data
    return credential_data

# Execution endpoint
@app.post("/execute-agent")
async def execute_agent(request: dict, user=Depends(get_current_user)):
    async def stream_generator():
        workflow = request.get("graph", {})
        input_text = request.get("input", "Hello, world!")
        thread_id = request.get("thread_id", "default")
        
        # Simulate workflow execution
        yield json.dumps({"type": "token", "data": f"Starting workflow execution for thread {thread_id}...\n"})
        await asyncio.sleep(0.5)
        
        yield json.dumps({"type": "token", "data": f"Processing input: {input_text}\n"})
        await asyncio.sleep(0.5)
        
        # Simulate node execution
        nodes = workflow.get("nodes", [])
        for i, node in enumerate(nodes):
            node_type = node.get("type", "unknown")
            yield json.dumps({"type": "tool_start", "data": {"name": node_type, "input": f"Executing {node_type} node"}})
            await asyncio.sleep(0.3)
            
            yield json.dumps({"type": "token", "data": f"✅ Executed {node_type} node ({i+1}/{len(nodes)})\n"})
            await asyncio.sleep(0.2)
            
            yield json.dumps({"type": "tool_end", "data": {"name": node_type, "output": f"Result from {node_type}"}})
            await asyncio.sleep(0.3)
        
        yield json.dumps({"type": "token", "data": f"\n🎉 Workflow completed successfully!\n"})
        yield json.dumps({"type": "token", "data": f"Final result: Processed {len(nodes)} nodes with input '{input_text}'\n"})
    
    return StreamingResponse(stream_generator(), media_type="text/plain")

# API metadata endpoints
@app.get("/api/models")
async def get_models(user=Depends(get_current_user)):
    return {
        "groq": [
            {"id": "llama3-8b-8192", "name": "Llama 3 8B", "context_length": 8192},
            {"id": "llama3-70b-8192", "name": "Llama 3 70B", "context_length": 8192},
            {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "context_length": 32768}
        ],
        "openai": [
            {"id": "gpt-4", "name": "GPT-4", "context_length": 8192},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "context_length": 4096}
        ],
        "anthropic": [
            {"id": "claude-3-5-sonnet", "name": "Claude 3.5 Sonnet", "context_length": 200000},
            {"id": "claude-3-opus", "name": "Claude 3 Opus", "context_length": 200000}
        ]
    }

@app.get("/api/providers")
async def get_providers(user=Depends(get_current_user)):
    return [
        {
            "name": "groq",
            "display_name": "Groq",
            "description": "Ultra-fast inference with Llama, Mixtral, and other models"
        },
        {
            "name": "openai",
            "display_name": "OpenAI",
            "description": "GPT-4, GPT-3.5, and other OpenAI models"
        },
        {
            "name": "anthropic",
            "display_name": "Anthropic",
            "description": "Claude 3.5, Claude 3, and other Anthropic models"
        }
    ]

@app.post("/execute-real")
async def execute_real(request: dict, user=Depends(get_current_user)):
    try:
        graph = request.get("graph", {})
        user_input = request.get("input", "")

        # Resolve keys later per-node to allow node-specific overrides

        # Very simple linear execution: input -> tavily_search -> llm
        nodes = {n.get("id"): n for n in graph.get("nodes", [])}

        search_text = user_input
        search_result = None
        llm_result = None
        clean_result = ""

        # Tavily web search
        search_node = next((n for n in nodes.values() if n.get("type") in ["tavily_search", "TavilyNode", "tool"]), None)
        if search_node and search_node.get("type") != "llm":
            query_template = search_node.get("config", {}).get("query_template")
            query = query_template.replace("{{input}}", user_input) if query_template else user_input
            tavily_url = "https://api.tavily.com/search"
            # Prefer node-provided key, fall back to env
            tavily_key = search_node.get("config", {}).get("api_key") or os.getenv("TAVILY_API_KEY")
            if not tavily_key:
                raise HTTPException(status_code=400, detail="Missing Tavily API key: provide in node config (api_key) or set TAVILY_API_KEY")
            tavily_headers = {"X-API-Key": tavily_key, "Content-Type": "application/json"}
            tavily_payload = {"query": query, "num_results": search_node.get("config", {}).get("num_results", 3)}
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    r = await client.post(tavily_url, json=tavily_payload, headers=tavily_headers)
                    r.raise_for_status()
                    search_result = r.json()
                    
                    # Extract clean search results
                    if search_result and "results" in search_result:
                        clean_result += f"🔍 Search Results for: {query}\n\n"
                        for i, result in enumerate(search_result["results"], 1):
                            title = result.get("title", "No title")
                            content = result.get("content", "No content")
                            url = result.get("url", "")
                            clean_result += f"{i}. {title}\n"
                            clean_result += f"   {content[:200]}{'...' if len(content) > 200 else ''}\n"
                            clean_result += f"   URL: {url}\n\n"
            except httpx.HTTPStatusError as e:
                detail = e.response.text if e.response is not None else str(e)
                raise HTTPException(status_code=400, detail=f"Tavily error: {e.response.status_code if e.response else 'HTTP'} {detail}")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Tavily request failed: {str(e)}")

        # LLM via Groq
        llm_node = next((n for n in nodes.values() if n.get("type") in ["llm", "GroqNode", "OpenAINode"]), None)
        if llm_node:
            provider = llm_node.get("config", {}).get("provider", "groq")
            model = llm_node.get("config", {}).get("model", "llama3-8b-8192")
            # Compose prompt: include search context if available
            base_prompt = f"User input: {user_input}\n" + (f"Search context: {json.dumps(search_result)[:2000]}\n" if search_result else "") + "Please answer concisely."

            if provider == "groq":
                groq_url = "https://api.groq.com/openai/v1/chat/completions"
                # Prefer node-provided key, fall back to env
                groq_key = llm_node.get("config", {}).get("api_key") or os.getenv("GROQ_API_KEY")
                if not groq_key:
                    raise HTTPException(status_code=400, detail="Missing Groq API key: provide in node config (api_key) or set GROQ_API_KEY")
                groq_headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
                groq_payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": base_prompt}],
                    "max_tokens": llm_node.get("config", {}).get("max_tokens", 256),
                    "temperature": llm_node.get("config", {}).get("temperature", 0.7),
                }
                try:
                    async with httpx.AsyncClient(timeout=60) as client:
                        r = await client.post(groq_url, json=groq_payload, headers=groq_headers)
                        r.raise_for_status()
                        llm_result = r.json()
                        
                        # Extract clean LLM response
                        if llm_result and "choices" in llm_result and len(llm_result["choices"]) > 0:
                            llm_content = llm_result["choices"][0].get("message", {}).get("content", "")
                            if llm_content:
                                clean_result += f"🤖 AI Response:\n{llm_content}\n"
                except httpx.HTTPStatusError as e:
                    detail = e.response.text if e.response is not None else str(e)
                    raise HTTPException(status_code=400, detail=f"Groq error: {e.response.status_code if e.response else 'HTTP'} {detail}")
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Groq request failed: {str(e)}")
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported provider for real execution: {provider}")

        # Return clean result if available, otherwise return the structured data
        if clean_result.strip():
            from fastapi.responses import PlainTextResponse
            return PlainTextResponse(content=clean_result.strip())
        else:
            return {
                "status": "success",
                "search": search_result,
                "llm": llm_result,
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"execute_real failed: {str(e)}")

@app.get("/api/tools")
async def get_tools(user=Depends(get_current_user)):
    return [
        {
            "name": "tavily_search",
            "display_name": "Tavily Search",
            "description": "Web search and information retrieval"
        },
        {
            "name": "send_email",
            "display_name": "Send Email",
            "description": "Send an email via SMTP"
        },
        {
            "name": "post_to_slack",
            "display_name": "Post to Slack",
            "description": "Post a message to a Slack channel"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
