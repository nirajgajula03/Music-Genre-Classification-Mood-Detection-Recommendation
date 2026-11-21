from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse, RedirectResponse
from bson import ObjectId
from app.database import db
from app.routers.playlist import get_user
from app.storage.factory import storage

router = APIRouter()

@router.get("")
async def list_uploads(user=Depends(get_user)):
    docs = []
    async for u in db.uploads.find({"user_id": str(user["_id"])}).sort("created_at", -1):
        u["_id"] = str(u["_id"])
        if u.get("storage_backend") == "s3":
            new_url = storage.public_url(u["storage_id"])
            if new_url != u.get("url"):
                u["url"] = new_url
                await db.uploads.update_one({"_id": ObjectId(u["_id"])}, {"$set": {"url": new_url}})
        docs.append(u)
    return {"uploads": docs}

@router.get("/{upload_id}/stream")
async def stream_upload(upload_id: str, request: Request):
    try:
        oid = ObjectId(upload_id)
    except:
        raise HTTPException(400, "Invalid id")
    doc = await db.uploads.find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Upload not found")
    if doc.get("storage_backend") == "s3":
        return RedirectResponse(storage.public_url(doc["storage_id"]))

    try:
        stream, ctype = await storage.open_stream(doc["storage_id"])
    except Exception as e:
        raise HTTPException(404, f"File stream not found: {e}")

    file_size = getattr(stream, "length", None)
    if file_size is None and "size_bytes" in doc:
        file_size = doc["size_bytes"]

    range_header = request.headers.get("range") or request.headers.get("Range")

    if range_header and file_size:
        try:
            # Range header format: "bytes=start-end"
            range_val = range_header.strip().replace("bytes=", "")
            parts = range_val.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1

            if start >= file_size:
                raise HTTPException(416, "Requested Range Not Satisfiable")
            if end >= file_size:
                end = file_size - 1

            content_length = end - start + 1

            # Seek to start
            if hasattr(stream, "seek"):
                seek_res = stream.seek(start)
                if hasattr(seek_res, "__await__"):
                    await seek_res

            async def gen_range():
                bytes_left = content_length
                chunk_size = 64 * 1024
                while bytes_left > 0:
                    read_size = min(chunk_size, bytes_left)
                    chunk = await stream.read(read_size)
                    if not chunk:
                        break
                    bytes_left -= len(chunk)
                    yield chunk

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": ctype or "audio/mpeg",
                "Cache-Control": "public, max-age=3600",
            }
            return StreamingResponse(gen_range(), status_code=206, headers=headers)
        except HTTPException:
            raise
        except Exception:
            # Fallback to full stream if range parsing/seeking encounters an issue
            pass

    async def gen_full():
        chunk_size = 64 * 1024
        while True:
            chunk = await stream.read(chunk_size)
            if not chunk:
                break
            yield chunk

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Type": ctype or "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
    }
    if file_size:
        headers["Content-Length"] = str(file_size)

    return StreamingResponse(gen_full(), status_code=200, headers=headers)

@router.delete("/{upload_id}")
async def delete_upload(upload_id: str, user=Depends(get_user)):
    try: oid = ObjectId(upload_id)
    except: raise HTTPException(400, "Invalid id")
    doc = await db.uploads.find_one({"_id": oid})
    if not doc or doc["user_id"] != str(user["_id"]):
        raise HTTPException(404, "Upload not found")
    try: await storage.delete(doc["storage_id"])
    except Exception as e: print(f"[uploads] storage delete failed: {e}")
    await db.uploads.delete_one({"_id": oid})
    return {"ok": True}
