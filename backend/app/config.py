from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "deep_music"
    jwt_secret: str = "change-me"
    jwt_alg: str = "HS256"
    jwt_ttl_minutes: int = 1440
    demo_mode: bool = True
    model_path: str = str(BASE_DIR / "ml/weights/genre_cnn.keras")
    label_encoder_path: str = str(BASE_DIR / "ml/weights/label_encoder.json")
    demo_mode_mood: bool = True
    mood_model_path: str = str(BASE_DIR / "ml/weights/mood_cnn.keras")
    mood_label_encoder_path: str = str(BASE_DIR / "ml/weights/mood_label_encoder.json")
    mood_features_cache: str = str(BASE_DIR / "ml/training/mood_features_cache.npz")
    gtzan_root: str = str(BASE_DIR / "data/gtzan/genres_original")
    deam_root: str = str(BASE_DIR / "data/deam")
    features_cache: str = str(BASE_DIR / "ml/training/features_cache.npz")
    reports_dir: str = str(BASE_DIR.parent / "reports")
    storage_backend: str = "gridfs"
    s3_endpoint_url: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_region: str = ""
    s3_bucket: str = ""
    s3_presign_ttl: int = 3600
    cors_origins: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
