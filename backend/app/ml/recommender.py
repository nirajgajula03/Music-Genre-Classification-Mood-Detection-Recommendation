import random
from typing import List

MOOD_COMPAT = {
    "happy": ["happy","energetic","romantic"], "sad": ["sad","calm","relaxing"],
    "energetic": ["energetic","happy","angry"], "calm": ["calm","relaxing","romantic"],
    "romantic": ["romantic","calm","happy"], "angry": ["angry","energetic","metal"],
    "relaxing": ["relaxing","calm","sad"],
}

async def recommend(catalog: List[dict], genre: str, mood: str, limit: int = 6):
    compat = MOOD_COMPAT.get(mood, [mood])
    pool = [s for s in catalog if s.get("genre") == genre and s.get("mood") in compat]
    if len(pool) < limit:
        pool += [s for s in catalog if s.get("genre") == genre and s not in pool]
    if len(pool) < limit:
        pool += [s for s in catalog if s not in pool]
    random.shuffle(pool)
    return pool[:limit]
