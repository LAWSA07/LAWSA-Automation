from fastapi import APIRouter, HTTPException, Depends, Body, FastAPI, status, BackgroundTasks
from typing import List
from .db import get_db_from_uri
from .models import WorkflowModel, ProjectModel
from bson import ObjectId
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from .config import SECRET_KEY
from pydantic import BaseModel, Field
from pymongo import MongoClient
import pymongo.errors
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
ALGORITHM = "HS256"

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

router = APIRouter(prefix="/workflows", tags=["workflows"])

@router.post("/", response_model=WorkflowModel)
async def create_workflow(workflow: WorkflowModel, username: str = Depends(get_current_user)):
    workflow_dict = workflow.dict()
    workflow_dict["createdBy"] = username
    result = await db.workflows.insert_one(workflow_dict)
    workflow_dict["_id"] = str(result.inserted_id)
    return workflow_dict

@router.get("/{workflow_id}", response_model=WorkflowModel)
async def get_workflow(workflow_id: str, username: str = Depends(get_current_user)):
    workflow = await db.workflows.find_one({"_id": ObjectId(workflow_id), "createdBy": username})
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow["_id"] = str(workflow["_id"])
    return workflow

@router.get("/", response_model=List[WorkflowModel])
async def list_workflows(username: str = Depends(get_current_user)):
    workflows = []
    async for wf in db.workflows.find({"createdBy": username}):
        wf["_id"] = str(wf["_id"])
        workflows.append(wf)
    return workflows

@router.put("/{workflow_id}", response_model=WorkflowModel)
async def update_workflow(workflow_id: str, workflow: WorkflowModel, username: str = Depends(get_current_user)):
    result = await db.workflows.replace_one({"_id": ObjectId(workflow_id), "createdBy": username}, workflow.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow_dict = workflow.dict()
    workflow_dict["_id"] = workflow_id
    return workflow_dict

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str, username: str = Depends(get_current_user)):
    result = await db.workflows.delete_one({"_id": ObjectId(workflow_id), "createdBy": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"deleted": True}

# Project CRUD
@router.post("/projects", response_model=ProjectModel)
async def create_project(project: ProjectModel, username: str = Depends(get_current_user)):
    project_dict = project.dict()
    project_dict["createdBy"] = username
    result = await db.projects.insert_one(project_dict)
    project_dict["_id"] = str(result.inserted_id)
    return project_dict

@router.get("/projects", response_model=List[ProjectModel])
async def list_projects(username: str = Depends(get_current_user)):
    projects = []
    async for p in db.projects.find({"createdBy": username}):
        p["_id"] = str(p["_id"])
        projects.append(p)
    return projects

@router.get("/projects/{project_id}", response_model=ProjectModel)
async def get_project(project_id: str, username: str = Depends(get_current_user)):
    project = await db.projects.find_one({"_id": ObjectId(project_id), "createdBy": username})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project["_id"] = str(project["_id"])
    return project

@router.put("/projects/{project_id}", response_model=ProjectModel)
async def update_project(project_id: str, project: ProjectModel, username: str = Depends(get_current_user)):
    result = await db.projects.replace_one({"_id": ObjectId(project_id), "createdBy": username}, project.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    project_dict = project.dict()
    project_dict["_id"] = project_id
    return project_dict

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, username: str = Depends(get_current_user)):
    result = await db.projects.delete_one({"_id": ObjectId(project_id), "createdBy": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"deleted": True} 

class MongoValidationRequest(BaseModel):
    connection_string: str = Field(..., alias="connectionString")

@router.post("/validate/mongodb")
async def validate_mongodb_connection(request: MongoValidationRequest):
    client = None
    try:
        client = MongoClient(
            request.connection_string,
            serverSelectionTimeoutMS=5000
        )
        client.admin.command('ping')
        return {"valid": True, "message": "Connection successful."}
    except pymongo.errors.OperationFailure as e:
        error_message = getattr(e, 'details', {}).get('errmsg', 'Invalid credentials')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"valid": False, "message": f"Authentication failed: {error_message}"}
        )
    except pymongo.errors.ConnectionFailure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"valid": False, "message": "Connection failed. Check host, port, and firewall settings."}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"valid": False, "message": f"An unexpected error occurred: {str(e)}"}
        )
    finally:
        if client:
            client.close()

@router.post("/execute/{workflow_id}")
async def execute_workflow_async(workflow_id: str, background_tasks: BackgroundTasks, username: str = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    client, db = get_db_from_uri()  # You may want to use a system connection string for executions
    await db.executions.insert_one({
        "job_id": job_id,
        "workflow_id": workflow_id,
        "status": "PENDING",
        "result": None,
        "error": None,
        "user": username
    })
    background_tasks.add_task(run_workflow_job, workflow_id, job_id, username)
    return {"job_id": job_id, "status": "PENDING"}

@router.get("/status/{job_id}")
async def get_workflow_status(job_id: str, username: str = Depends(get_current_user)):
    client, db = get_db_from_uri()
    execution = await db.executions.find_one({"job_id": job_id, "user": username})
    if not execution:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job_id,
        "status": execution["status"],
        "result": execution["result"],
        "error": execution["error"]
    }

# Helper function for background execution
async def run_workflow_job(workflow_id: str, job_id: str, username: str):
    client, db = get_db_from_uri()
    try:
        # Load workflow from DB (implement as needed)
        workflow = await db.workflows.find_one({"_id": ObjectId(workflow_id), "createdBy": username})
        if not workflow:
            await db.executions.update_one({"job_id": job_id}, {"$set": {"status": "FAILED", "error": "Workflow not found"}})
            return
        # Execute workflow (reuse your engine)
        from .engine import execute_workflow
        result = await execute_workflow(workflow)
        await db.executions.update_one({"job_id": job_id}, {"$set": {"status": "SUCCESS", "result": result}})
    except Exception as e:
        await db.executions.update_one({"job_id": job_id}, {"$set": {"status": "FAILED", "error": str(e)}}) 