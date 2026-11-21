import asyncio
from app.database import db

async def main():
    files = db["uploads.files"]
    async for f in files.find({"filename": {"$regex": "Mf Gabhru", "$options": "i"}}):
        print("GridFS ID:", str(f["_id"]))
        print("Filename:", f.get("filename"))

asyncio.run(main())