from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .db import get_db_from_uri
from .models import ExecutionModel
from bson import ObjectId
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from .config import SECRET_KEY

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

router = APIRouter(prefix="/executions", tags=["executions"])

@router.post("/", response_model=ExecutionModel)
async def log_execution(execution: ExecutionModel, username: str = Depends(get_current_user)):
    exec_dict = execution.dict()
    exec_dict["user"] = username
    result = await get_db_from_uri().executions.insert_one(exec_dict)
    exec_dict["_id"] = str(result.inserted_id)
    return exec_dict

@router.get("/{execution_id}", response_model=ExecutionModel)
async def get_execution(execution_id: str, username: str = Depends(get_current_user)):
    execution = await get_db_from_uri().executions.find_one({"_id": ObjectId(execution_id), "user": username})
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    execution["_id"] = str(execution["_id"])
    return execution

@router.get("/", response_model=List[ExecutionModel])
async def list_executions(username: str = Depends(get_current_user), workflow_id: str = None):
    query = {"user": username}
    if workflow_id:
        query["workflowId"] = workflow_id
    executions = []
    async for ex in get_db_from_uri().executions.find(query):
        ex["_id"] = str(ex["_id"])
        executions.append(ex)
    return executions 