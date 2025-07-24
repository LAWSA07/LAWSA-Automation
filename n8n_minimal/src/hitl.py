from fastapi import APIRouter, HTTPException
from typing import Dict
import asyncio

router = APIRouter(prefix="/hitl", tags=["human-in-the-loop"])

# In-memory store for paused agent actions (for MVP)
paused_actions: Dict[str, Dict] = {}
pause_events: Dict[str, asyncio.Event] = {}

@router.post("/pause/{run_id}")
def pause_agent(run_id: str, action: Dict):
    paused_actions[run_id] = action
    pause_events[run_id] = asyncio.Event()
    return {"status": "paused", "run_id": run_id}

@router.post("/resume/{run_id}")
def resume_agent(run_id: str, user_input: Dict):
    if run_id not in paused_actions:
        raise HTTPException(status_code=404, detail="No paused action for this run_id")
    paused_actions[run_id]["user_input"] = user_input
    pause_events[run_id].set()
    return {"status": "resumed", "run_id": run_id}

async def wait_for_human(run_id: str, action: Dict):
    """Call this in agent logic to pause and wait for user input."""
    paused_actions[run_id] = action
    pause_events[run_id] = asyncio.Event()
    await pause_events[run_id].wait()
    return paused_actions[run_id].get("user_input") 