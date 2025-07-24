from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from .db import get_db_from_uri
from .models import UserModel
from bson import ObjectId
from .config import SECRET_KEY
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def authenticate_user(username: str, password: str):
    client, db = get_db_from_uri()
    user = await db.users.find_one({"username": username})
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    client, db = get_db_from_uri()
    user = await db.users.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    return user

def get_current_user_with_role(required_role: str):
    def dependency(token: str = Depends(oauth2_scheme)):
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        client, db = get_db_from_uri()
        user = db.users.find_one({"username": username})
        if not user or user.get("role", "user") not in [required_role, "admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dependency

@router.get("/admin/ping")
def admin_ping(user = Depends(get_current_user_with_role("admin"))):
    return {"status": "admin pong"}

MONGO_URI = "mongodb://localhost:27017/yourappdb"

@router.post("/register")
async def register(req: RegisterRequest):
    client, db = get_db_from_uri(MONGO_URI)
    if await db.users.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(req.password)
    user_dict = {
        "email": req.email,
        "username": req.email,  # Use email as username for now
        "hashed_password": hashed_password,
        "role": "user"
    }
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return {"success": True, "username": req.email, "email": req.email}

@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    client, db = get_db_from_uri(MONGO_URI)
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token({"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"} 