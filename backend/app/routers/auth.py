from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from app.config import settings
from app.database import db

router = APIRouter()

class PasswordHelper:
    @staticmethod
    def hash(secret: str) -> str:
        secret_bytes = secret.encode("utf-8")[:72]
        return bcrypt.hashpw(secret_bytes, bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify(secret: str, hashed: str) -> bool:
        try:
            secret_bytes = secret.encode("utf-8")[:72]
            return bcrypt.checkpw(secret_bytes, hashed.encode("utf-8"))
        except Exception:
            return False

pwd = PasswordHelper()

class UserIn(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def name_nonempty(cls, v):
        if len(v.strip()) < 2: raise ValueError("Name must be at least 2 characters")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6: raise ValueError("Password must be at least 6 characters")
        return v

class LoginIn(BaseModel):
    email: EmailStr
    password: str

def make_token(user_id: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.jwt_ttl_minutes)
    return jwt.encode({"sub": user_id, "exp": exp}, settings.jwt_secret, algorithm=settings.jwt_alg)

@router.post("/register")
async def register(u: UserIn):
    if await db.users.find_one({"email": u.email}):
        raise HTTPException(400, "Email already registered")
    doc = {"name": u.name, "email": u.email, "password": pwd.hash(u.password), "created_at": datetime.utcnow()}
    res = await db.users.insert_one(doc)
    return {"token": make_token(str(res.inserted_id)), "user": {"id": str(res.inserted_id), "name": u.name, "email": u.email}}

@router.post("/login")
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email})
    if not user or not pwd.verify(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    return {"token": make_token(str(user["_id"])), "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}}
