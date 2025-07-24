from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from .db import get_db_from_uri
from .models import CredentialModel
from bson import ObjectId
from cryptography.fernet import Fernet
from .config import SECRET_KEY
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel
from .credentials import save_credential, get_connection_string
from .api_workflows import validate_mongodb_connection
from .audit import log_audit_action

fernet = Fernet(SECRET_KEY.encode())

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

router = APIRouter(prefix="/credentials", tags=["credentials"])

class CreateCredentialRequest(BaseModel):
    name: str
    connection_string: str

class CreateCredentialResponse(BaseModel):
    id: str
    name: str

@router.post("/", response_model=CredentialModel, status_code=201)
async def create_credential(credential: CreateCredentialRequest, username: str = Depends(get_current_user)):
    encrypted_data = fernet.encrypt(credential.connection_string.encode()).decode()
    cred_dict = {"name": credential.name, "data": encrypted_data, "userId": username}
    result = await get_db_from_uri().credentials.insert_one(cred_dict)
    cred_dict["_id"] = str(result.inserted_id)
    log_audit_action(username, "create_credential", {"credential": credential.name})
    return cred_dict

@router.get("/{credential_id}", response_model=CredentialModel)
async def get_credential(credential_id: str, username: str = Depends(get_current_user)):
    cred = await get_db_from_uri().credentials.find_one({"_id": ObjectId(credential_id), "userId": username})
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    cred["_id"] = str(cred["_id"])
    cred["data"] = fernet.decrypt(cred["data"].encode()).decode()
    log_audit_action(username, "get_credential", {"credential_id": credential_id})
    return cred

@router.get("/", response_model=List[CredentialModel])
async def list_credentials(username: str = Depends(get_current_user)):
    creds = []
    async for cred in get_db_from_uri().credentials.find({"userId": username}):
        cred["_id"] = str(cred["_id"])
        cred["data"] = fernet.decrypt(cred["data"].encode()).decode()
        creds.append(cred)
    return creds

@router.put("/{credential_id}", response_model=CredentialModel)
async def update_credential(credential_id: str, credential: CredentialModel, username: str = Depends(get_current_user)):
    encrypted_data = fernet.encrypt(credential.data.encode()).decode()
    cred_dict = credential.dict()
    cred_dict["data"] = encrypted_data
    cred_dict["userId"] = username
    result = await get_db_from_uri().credentials.replace_one({"_id": ObjectId(credential_id), "userId": username}, cred_dict)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Credential not found")
    cred_dict["_id"] = credential_id
    return cred_dict

@router.delete("/{credential_id}")
async def delete_credential(credential_id: str, username: str = Depends(get_current_user)):
    result = await get_db_from_uri().credentials.delete_one({"_id": ObjectId(credential_id), "userId": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Credential not found")
    return {"deleted": True} 

@router.post("/credentials", response_model=CreateCredentialResponse, status_code=status.HTTP_201_CREATED)
async def create_credential_request(request: CreateCredentialRequest):
    # Validate connection string
    valid = await validate_mongodb_connection(request)
    if not valid.get("valid"):
        raise HTTPException(status_code=400, detail=valid.get("message", "Invalid connection string"))
    credential_id = await save_credential(request.name, request.connection_string)
    return CreateCredentialResponse(id=credential_id, name=request.name)

@router.get("/credentials/{credential_id}")
async def get_credential_connection_string(credential_id: str):
    conn_str = await get_connection_string(credential_id)
    if not conn_str:
        raise HTTPException(status_code=404, detail="Credential not found")
    return {"connection_string": conn_str} 