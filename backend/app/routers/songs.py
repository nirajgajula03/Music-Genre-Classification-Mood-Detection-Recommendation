from fastapi import APIRouter, Query
from bson import ObjectId
from app.database import db
from app.data.sample_songs import CATALOG

router = APIRouter()

@router.get("")
async def list_songs(q: str = Query(None), genre: str = Query(None), mood: str = Query(None)):
    songs = []
    async for s in db.songs.find({}):
        s["_id"] = str(s["_id"])
        songs.append(s)
    if not songs:
        await db.songs.insert_many([dict(s) for s in CATALOG])
        songs = []
        async for s in db.songs.find({}):
            s["_id"] = str(s["_id"])
            songs.append(s)
    else:
        # Self-heal catalog songs that have missing or empty audio URLs
        catalog_urls = {s["title"]: s.get("url", "") for s in CATALOG}
        for s in songs:
            if not s.get("url") and s.get("title") in catalog_urls and catalog_urls[s["title"]]:
                s["url"] = catalog_urls[s["title"]]
                try:
                    await db.songs.update_one({"_id": ObjectId(s["_id"])}, {"$set": {"url": s["url"]}})
                except Exception:
                    pass

    if q:     songs = [s for s in songs if q.lower() in s["title"].lower() or q.lower() in s.get("artist","").lower()]
    if genre: songs = [s for s in songs if s.get("genre") == genre]
    if mood:  songs = [s for s in songs if s.get("mood") == mood]
    return {"songs": songs}
