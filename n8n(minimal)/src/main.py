from fastapi import FastAPI
from fastapi import Request
from .engine import execute_workflow
import asyncio
from .api_workflows import router as workflows_router
from .api_executions import router as executions_router
from .api_credentials import router as credentials_router
from .api_auth import router as auth_router
from .scheduler import register_schedule_job
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json
from .schemas import ExecutionRequest
from .agent.builder import create_agentic_graph, AgentState
from langgraph.checkpoint.sqlite import SqliteSaver

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For production, specify your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflows_router)
app.include_router(executions_router)
app.include_router(credentials_router)
app.include_router(auth_router)

# Persistent memory for conversations (in-memory SQLite for now)
memory = SqliteSaver.from_conn_string(":memory:")

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

@app.post("/execute-agent")
async def execute_agent(request: ExecutionRequest):
    """
    Executes a dynamically constructed agentic graph and streams the results.
    """
    try:
        # 1. Dynamically build the graph from the frontend's definition
        graph_builder = create_agentic_graph(request.graph)
        # 2. Compile the graph with memory persistence
        runnable = graph_builder.compile(checkpointer=memory)
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
                yield json.dumps({
                    "type": "tool_end",
                    "data": {"name": event["name"], "output": event["data"].get("output")}
                })
    return EventSourceResponse(stream_generator()) 