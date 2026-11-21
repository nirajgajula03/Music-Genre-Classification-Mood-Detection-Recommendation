from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import db
from app.routers.playlist import get_user

router = APIRouter()

class SongRef(BaseModel):
    song_id: str; title: str; artist: str; cover: str
    genre: str; mood: Optional[str] = ""; url: str = ""

class PlaylistCreate(BaseModel):
    name: str; description: Optional[str] = ""; cover: Optional[str] = ""

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None; description: Optional[str] = None; cover: Optional[str] = None

def _oid(pid): 
    try: return ObjectId(pid)
    except: raise HTTPException(400, "Invalid playlist id")

async def _owned(pid, user):
    p = await db.playlists.find_one({"_id": _oid(pid)})
    if not p or p["user_id"] != str(user["_id"]): raise HTTPException(404, "Playlist not found")
    return p

def _serialize(p):
    p["_id"] = str(p["_id"]); p["song_count"] = len(p.get("songs", [])); return p

@router.post("")
async def create_playlist(data: PlaylistCreate, user=Depends(get_user)):
    doc = {"user_id": str(user["_id"]), "name": data.name.strip(),
           "description": data.description or "", "cover": data.cover or f"https://picsum.photos/seed/{ObjectId()}/300",
           "songs": [], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
    res = await db.playlists.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return {"playlist": _serialize(doc)}

@router.get("")
async def list_playlists(user=Depends(get_user)):
    items = []
    async for p in db.playlists.find({"user_id": str(user["_id"])}).sort("updated_at", -1):
        items.append(_serialize(p))
    return {"playlists": items}

@router.get("/{playlist_id}")
async def get_playlist(playlist_id: str, user=Depends(get_user)):
    p = await _owned(playlist_id, user)
    return {"playlist": _serialize(p)}

@router.put("/{playlist_id}")
async def update_playlist(playlist_id: str, data: PlaylistUpdate, user=Depends(get_user)):
    await _owned(playlist_id, user)
    update = {k: v for k, v in data.dict().items() if v is not None and v != ""}
    if not update: return {"ok": False, "message": "Nothing to update"}
    update["updated_at"] = datetime.utcnow()
    await db.playlists.update_one({"_id": _oid(playlist_id)}, {"$set": update})
    p = await db.playlists.find_one({"_id": _oid(playlist_id)})
    return {"playlist": _serialize(p)}

@router.delete("/{playlist_id}")
async def delete_playlist(playlist_id: str, user=Depends(get_user)):
    await _owned(playlist_id, user)
    await db.playlists.delete_one({"_id": _oid(playlist_id)})
    return {"ok": True}

@router.post("/{playlist_id}/songs")
async def add_song(playlist_id: str, song: SongRef, user=Depends(get_user)):
    p = await _owned(playlist_id, user)
    if any(s.get("song_id") == song.song_id for s in p.get("songs", [])):
        return {"ok": True, "duplicate": True}
    await db.playlists.update_one({"_id": _oid(playlist_id)},
        {"$push": {"songs": song.dict()}, "$set": {"updated_at": datetime.utcnow()}})
    return {"ok": True, "duplicate": False}

@router.delete("/{playlist_id}/songs/{song_id}")
async def remove_song(playlist_id: str, song_id: str, user=Depends(get_user)):
    await _owned(playlist_id, user)
    await db.playlists.update_one({"_id": _oid(playlist_id)},
        {"$pull": {"songs": {"song_id": song_id}}, "$set": {"updated_at": datetime.utcnow()}})
    return {"ok": True}

@router.patch("/{playlist_id}/reorder")
async def reorder_songs(playlist_id: str, song_ids: List[str], user=Depends(get_user)):
    p = await _owned(playlist_id, user)
    by_id = {s["song_id"]: s for s in p.get("songs", [])}
    new_order = [by_id[sid] for sid in song_ids if sid in by_id]
    missing = [s for s in p.get("songs", []) if s["song_id"] not in song_ids]
    new_order += missing
    await db.playlists.update_one({"_id": _oid(playlist_id)},
        {"$set": {"songs": new_order, "updated_at": datetime.utcnow()}})
    return {"ok": True}
