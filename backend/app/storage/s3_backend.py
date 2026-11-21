import boto3
from botocore.config import Config
from typing import AsyncIterator, Tuple
from app.storage.base import StorageBackend, StoredFile

class S3Backend(StorageBackend):
    name = "s3"
    def __init__(self, cfg):
        self.client = boto3.client("s3", endpoint_url=cfg.get("endpoint_url") or None,
            aws_access_key_id=cfg.get("access_key") or None, aws_secret_access_key=cfg.get("secret_key") or None,
            region_name=cfg.get("region") or None, config=Config(signature_version="s3v4"))
        self.bucket = cfg["bucket"]; self.presign_ttl = int(cfg.get("presign_ttl_seconds", 3600))

    async def save(self, local_path, key, content_type):
        self.client.upload_file(local_path, self.bucket, key, ExtraArgs={"ContentType": content_type})
        return StoredFile(storage_id=key, url=self.public_url(key), backend="s3")

    async def open_stream(self, storage_id):
        obj = self.client.get_object(Bucket=self.bucket, Key=storage_id)
        body = obj["Body"]; ctype = obj.get("ContentType", "application/octet-stream")
        async def gen():
            for chunk in body.iter_chunks(chunk_size=1024*1024): yield chunk
        return gen(), ctype

    async def delete(self, storage_id): self.client.delete_object(Bucket=self.bucket, Key=storage_id)
    def public_url(self, storage_id):
        return self.client.generate_presigned_url("get_object", Params={"Bucket": self.bucket, "Key": storage_id}, ExpiresIn=self.presign_ttl)
