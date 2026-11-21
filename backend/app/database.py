import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

_client = None

def get_client():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client

def get_db():
    return get_client()[settings.db_name]

class LazyDatabase:
    def __getattr__(self, name):
        return getattr(get_db(), name)

    def __getitem__(self, name):
        return get_db()[name]

db = LazyDatabase()

async def init_indexes():
    await db.users.create_index("email", unique=True)
    await db.songs.create_index([("title", "text"), ("genre", "text")])
    await db.history.create_index("user_id")
    await db.uploads.create_index([("user_id", 1), ("created_at", -1)])
    await db.playlists.create_index([("user_id", 1), ("updated_at", -1)])
