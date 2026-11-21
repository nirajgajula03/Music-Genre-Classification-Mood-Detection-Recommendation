from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator, Tuple

@dataclass
class StoredFile:
    storage_id: str; url: str; backend: str

class StorageBackend(ABC):
    name: str
    @abstractmethod
    async def save(self, local_path: str, key: str, content_type: str) -> StoredFile: ...
    @abstractmethod
    async def open_stream(self, storage_id: str) -> Tuple[AsyncIterator[bytes], str]: ...
    @abstractmethod
    async def delete(self, storage_id: str) -> None: ...
    @abstractmethod
    def public_url(self, storage_id: str) -> str: ...
