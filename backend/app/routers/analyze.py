
import os
import tempfile
import uuid
from datetime import datetime

from fastapi import (
    APIRouter, UploadFile, File, HTTPException,
    Header, Depends, Request, Form
)
from jose import jwt, JWTError
from bson import ObjectId

from app.config import settings
from app.database import db
from app.ml.genre_classifier import classifier
from app.ml.mood_detector import mood_detector
from app.storage.factory import storage

router = APIRouter()

ALLOWED = {"audio/mpeg", "audio/wav", "audio/x-wav", "audio/wave"}
MAX_FILE_SIZE = 25 * 1024 * 1024


async def maybe_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None

    try:
        payload = jwt.decode(
            authorization.split()[1],
            settings.jwt_secret,
            algorithms=[settings.jwt_alg]
        )
        return await db.users.find_one(
            {"_id": ObjectId(payload["sub"])}
        )
    except Exception:
        return None


@router.post("")
async def analyze(
    request: Request,
    file: UploadFile = File(...),
    song_id: str = Form(None),
    title: str = Form(None),
    artist: str = Form(None),
    album: str = Form(None),
    language: str = Form("English"),
    cover: str = Form(None),
    user=Depends(maybe_user)
):
    if file.content_type not in ALLOWED:
        raise HTTPException(
            400, "Only MP3 and WAV files are supported."
        )

    selected_song = None

    if song_id:
        if user is None:
            raise HTTPException(
                401, "Please log in before linking a song."
            )

        try:
            song_oid = ObjectId(song_id)
        except Exception:
            raise HTTPException(400, "Invalid song ID.")

        selected_song = await db.songs.find_one({
            "_id": song_oid,
            "genre": "bollywood"
        })

        if not selected_song:
            raise HTTPException(404, "Bollywood song not found.")

    if (title or artist) and not (title and artist):
        raise HTTPException(
            400, "Please provide both song title and artist."
        )

    if title and artist and selected_song:
        raise HTTPException(
            400, "Choose either an existing song or a new song."
        )

    if (title or artist) and user is None:
        raise HTTPException(
            401, "Please log in before publishing a song."
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            413,
            "File too large. Maximum size is 25 MB."
        )

    suffix = ".mp3" if "mpeg" in file.content_type else ".wav"

    with tempfile.NamedTemporaryFile(
        delete=False, suffix=suffix
    ) as tmp:
        tmp.write(contents)
        path = tmp.name

    try:
        genre_result = classifier.predict(path)
        mood_result = mood_detector.detect(path)

        detected_genre = genre_result["genre"]
        detected_mood = mood_result["mood"]

        response = {
            "filename": file.filename,
            "genre": detected_genre,
            "confidence": genre_result["confidence"],
            "demo_mode": genre_result["demo_mode"],
            "mood": detected_mood,
            "mood_color": mood_result["color"],
            "mood_confidence": mood_result.get("confidence"),
            "mood_demo_mode": mood_result["demo_mode"],
            "tempo": mood_result["tempo"],
            "features": genre_result["features"],
            "saved": False,
        }

        if user is not None:
            key = (
                f"uploads/{user['_id']}/"
                f"{uuid.uuid4().hex}{suffix}"
            )

            stored = await storage.save(
                path, key, file.content_type
            )

            replay_url = stored.url if stored.backend == "s3" else ""

            doc = {
                "user_id": str(user["_id"]),
                "filename": file.filename,
                "storage_backend": stored.backend,
                "storage_id": stored.storage_id,
                "url": replay_url,
                "genre": detected_genre,
                "genre_confidence": genre_result["confidence"],
                "mood": detected_mood,
                "mood_confidence": mood_result.get("confidence"),
                "tempo": mood_result["tempo"],
                "content_type": file.content_type,
                "size_bytes": len(contents),
                "created_at": datetime.utcnow(),
            }

            if selected_song:
                doc["linked_song_id"] = str(selected_song["_id"])

            result = await db.uploads.insert_one(doc)
            upload_id = str(result.inserted_id)

            stream_url = f"/api/uploads/{upload_id}/stream"

            if stored.backend != "s3":
               replay_url = str(request.base_url).rstrip("/") + stream_url

            response["upload_id"] = upload_id
            response["replay_url"] = replay_url
            response["saved"] = True

            if selected_song:
                await db.songs.update_one(
                    {"_id": selected_song["_id"]},
                    {
                        "$set": {
                            "url": stream_url,
                            "audio_upload_id": upload_id
                        }
                    }
                )

                response["linked_song"] = selected_song["title"]

            elif title and artist:
                new_song = {
                    "title": title.strip(),
                    "artist": artist.strip(),
                    "album": (album or "").strip(),
                    "genre": detected_genre,
                    "mood": detected_mood,
                    "language": language.strip(),
                    "cover": (cover or "").strip(),
                    "url": stream_url,
                    "audio_upload_id": upload_id,
                    "uploaded_by": str(user["_id"]),
                    "created_at": datetime.utcnow(),
                }

                song_result = await db.songs.insert_one(new_song)

                response["new_song"] = {
                    "_id": str(song_result.inserted_id),
                    "title": new_song["title"],
                    "artist": new_song["artist"],
                    "genre": detected_genre,
                    "mood": detected_mood,
                }

        return response

    finally:
        os.unlink(path)
