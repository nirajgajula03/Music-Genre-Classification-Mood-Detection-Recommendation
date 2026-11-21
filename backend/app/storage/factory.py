from app.config import settings
from app.storage.base import StorageBackend

def get_storage() -> StorageBackend:
    if settings.storage_backend == "s3":
        from app.storage.s3_backend import S3Backend
        return S3Backend({"endpoint_url": settings.s3_endpoint_url, "access_key": settings.s3_access_key,
            "secret_key": settings.s3_secret_key, "region": settings.s3_region,
            "bucket": settings.s3_bucket, "presign_ttl_seconds": settings.s3_presign_ttl})
    from app.storage.gridfs_backend import GridFSBackend
    return GridFSBackend()

storage = get_storage()
