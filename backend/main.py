from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, songs, analyze, recommend, playlist, uploads, playlists, smart_playlists

app = FastAPI(title="Deep Music API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(songs.router, prefix="/api/songs", tags=["songs"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])
app.include_router(recommend.router, prefix="/api/recommend", tags=["recommend"])
app.include_router(playlist.router, prefix="/api/playlist", tags=["playlist"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(playlists.router, prefix="/api/playlists", tags=["playlists"])
app.include_router(smart_playlists.router, prefix="/api/smart-playlists", tags=["smart-playlists"])

@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": settings.demo_mode}

@app.get("/")
def root():
    return {"name": "Deep Music API", "docs": "/docs"}
