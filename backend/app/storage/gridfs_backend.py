from typing import AsyncIterator, Tuple
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from app.database import get_db
from app.storage.base import StorageBackend, StoredFile

class GridFSBackend(StorageBackend):
    name = "gridfs"
    def __init__(self):
        self._bucket = None

    @property
    def bucket(self):
        if self._bucket is None:
            self._bucket = AsyncIOMotorGridFSBucket(get_db(), bucket_name="uploads")
        return self._bucket

    async def save(self, local_path, key, content_type):
        with open(local_path, "rb") as f:
            data = f.read()
        oid = await self.bucket.upload_from_stream(key, data, metadata={"content_type": content_type, "filename": key})
        return StoredFile(storage_id=str(oid), url=f"/api/uploads/{oid}/stream", backend="gridfs")

    async def open_stream(self, storage_id):
        try:
            grid_out = await self.bucket.open_download_stream(ObjectId(storage_id))
        except Exception:
            raise FileNotFoundError(storage_id)
        ctype = (grid_out.metadata or {}).get("content_type", "application/octet-stream")
        return grid_out, ctype

    async def delete(self, storage_id):
        await self.bucket.delete(ObjectId(storage_id))

    def public_url(self, storage_id):
        return f"/api/uploads/{storage_id}/stream"
