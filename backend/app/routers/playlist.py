from fastapi import APIRouter, Depends, HTTPException, Header
from jose import jwt, JWTError
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from app.config import settings
from app.database import db

router = APIRouter()

async def get_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    try:
        payload = jwt.decode(authorization.split()[1], settings.jwt_secret, algorithms=[settings.jwt_alg])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user: raise HTTPException(401, "Invalid user")
        return user
    except JWTError:
        raise HTTPException(401, "Invalid token")

class SongRef(BaseModel):
    song_id: str
    title: str
    artist: str
    cover: str
    genre: str

@router.post("/favourites")
async def add_fav(song: SongRef, user=Depends(get_user)):
    await db.users.update_one({"_id": user["_id"]}, {"$addToSet": {"favourites": song.dict()}})
    return {"ok": True}

@router.get("/favourites")
async def list_fav(user=Depends(get_user)):
    return {"favourites": user.get("favourites", [])}

@router.post("/history")
async def add_history(song: SongRef, user=Depends(get_user)):
    await db.history.insert_one({"user_id": str(user["_id"]), **song.dict(), "played_at": datetime.utcnow()})
    return {"ok": True}

@router.get("/history")
async def list_history(user=Depends(get_user)):
    items = []
    async for h in db.history.find({"user_id": str(user["_id"])}).sort("played_at", -1).limit(20):
        h["_id"] = str(h["_id"])
        items.append(h)
    return {"history": items}
