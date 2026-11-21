from fastapi import APIRouter, Query
from app.ml.recommender import recommend
from app.database import db

router = APIRouter()

@router.get("")
async def get_recommendations(genre: str = Query(...), mood: str = Query(...), limit: int = 6):
    catalog = []
    async for s in db.songs.find({}):
        s["_id"] = str(s["_id"])
        catalog.append(s)
    recs = await recommend(catalog, genre, mood, limit)
    return {"recommendations": recs}
