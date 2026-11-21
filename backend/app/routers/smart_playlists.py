import re
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.database import db
from app.routers.playlist import get_user

router = APIRouter()

def _clean(name): return re.sub(r"\.(mp3|wav)$", "", name, flags=re.IGNORECASE)

TEMPLATES = [
    {"id":"calm-jazz","mood":"calm","genre":"jazz","title":"Calm Jazz Nights","description":"Smooth jazz for focused evenings"},
    {"id":"happy-pop","mood":"happy","genre":"pop","title":"Happy Pop Vibes","description":"Upbeat pop to lift your mood"},
    {"id":"energetic-rock","mood":"energetic","genre":"rock","title":"Energetic Rock","description":"High-energy rock anthems"},
    {"id":"sad-blues","mood":"sad","genre":"blues","title":"Sad Blues","description":"Soulful blues for reflective moments"},
    {"id":"relaxing-classical","mood":"relaxing","genre":"classical","title":"Relaxing Classical","description":"Calming classical pieces"},
    {"id":"angry-metal","mood":"angry","genre":"metal","title":"Angry Metal","description":"Aggressive metal for intense focus"},
    {"id":"energetic-hiphop","mood":"energetic","genre":"hiphop","title":"Energetic Hip-Hop","description":"Hype hip-hop beats"},
    {"id":"happy-reggae","mood":"happy","genre":"reggae","title":"Happy Reggae","description":"Sunny reggae rhythms"},
    {"id":"calm-country","mood":"calm","genre":"country","title":"Calm Country","description":"Easy-going country tunes"},
    {"id":"romantic-disco","mood":"romantic","genre":"disco","title":"Romantic Disco","description":"Smooth disco for date nights"},
    {"id":"all-calm","mood":"calm","genre":None,"title":"All Calm","description":"Every calm track across genres"},
    {"id":"all-energetic","mood":"energetic","genre":None,"title":"All Energetic","description":"Pump-up tracks across genres"},
    {"id":"all-happy","mood":"happy","genre":None,"title":"All Happy","description":"Pure positivity, any genre"},
]

async def _matches(user_id, mood, genre):
    results, seen = [], set()
    q_u = {"user_id": user_id}
    if mood: q_u["mood"] = mood
    if genre: q_u["genre"] = genre
    async for u in db.uploads.find(q_u).sort("created_at", -1):
        sid = str(u["_id"])
        if sid in seen: continue
        seen.add(sid)
        results.append({"song_id": f"up-{sid}", "title": _clean(u["filename"]),
            "artist": "Your upload", "cover": f"https://picsum.photos/seed/{sid}/300",
            "genre": u["genre"], "mood": u["mood"],
            "url": u.get("url") or f"/api/uploads/{sid}/stream", "source": "upload"})
    q_s = {}
    if mood: q_s["mood"] = mood
    if genre: q_s["genre"] = genre
    async for s in db.songs.find(q_s):
        sid = str(s.get("_id", s["title"]))
        if sid in seen: continue
        seen.add(sid)
        results.append({"song_id": f"cat-{sid}", "title": s["title"], "artist": s.get("artist",""),
            "cover": s.get("cover",""), "genre": s["genre"], "mood": s.get("mood",""),
            "url": s.get("url",""), "source": "catalog"})
    return results

@router.get("")
async def list_smart_playlists(user=Depends(get_user)):
    out = []
    for t in TEMPLATES:
        songs = await _matches(str(user["_id"]), t["mood"], t["genre"])
        out.append({**t, "song_count": len(songs)})
    return {"smart_playlists": out}

@router.get("/{template_id}/songs")
async def get_songs(template_id: str, user=Depends(get_user)):
    t = next((x for x in TEMPLATES if x["id"] == template_id), None)
    if not t: raise HTTPException(404, "Smart playlist template not found")
    songs = await _matches(str(user["_id"]), t["mood"], t["genre"])
    return {"template": t, "songs": songs, "song_count": len(songs)}

@router.post("/{template_id}/save")
async def save_smart_playlist(template_id: str, user=Depends(get_user)):
    t = next((x for x in TEMPLATES if x["id"] == template_id), None)
    if not t: raise HTTPException(404, "Smart playlist template not found")
    songs = await _matches(str(user["_id"]), t["mood"], t["genre"])
    clean = [{"song_id": s["song_id"], "title": s["title"], "artist": s["artist"],
              "cover": s["cover"], "genre": s["genre"], "mood": s["mood"], "url": s["url"]} for s in songs]
    doc = {"user_id": str(user["_id"]), "name": t["title"],
           "description": t["description"] + " (smart playlist snapshot)",
           "cover": f"https://picsum.photos/seed/{t['id']}/300", "songs": clean,
           "smart_origin": template_id, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
    res = await db.playlists.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    doc["song_count"] = len(clean)
    return {"playlist": doc}

@router.get("/matches/{upload_id}")
async def find_matches_for_upload(upload_id: str, user=Depends(get_user)):
    try: oid = ObjectId(upload_id)
    except: raise HTTPException(400, "Invalid upload id")
    upload = await db.uploads.find_one({"_id": oid})
    if not upload or upload["user_id"] != str(user["_id"]):
        raise HTTPException(404, "Upload not found")
    matches = []
    for t in TEMPLATES:
        mood_ok = (t["mood"] is None) or (t["mood"] == upload["mood"])
        genre_ok = (t["genre"] is None) or (t["genre"] == upload["genre"])
        if mood_ok and genre_ok:
            matches.append({"id": t["id"], "title": t["title"]})
    return {"matches": matches, "upload_mood": upload["mood"], "upload_genre": upload["genre"]}
