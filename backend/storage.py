import asyncio
import mimetypes
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parent
UPLOAD_ROOT = Path(os.environ.get("LOCAL_UPLOAD_ROOT", ROOT / "uploads")).resolve()


def init_storage(force: bool = False):
    """Initialize persistent local storage while preserving the storage API."""
    del force
    (UPLOAD_ROOT / "media").mkdir(parents=True, exist_ok=True)
    (UPLOAD_ROOT / "resumes").mkdir(parents=True, exist_ok=True)
    return str(UPLOAD_ROOT)


def _safe_path(path: str) -> Path:
    relative = Path(path.replace("\\", "/").lstrip("/"))
    target = (UPLOAD_ROOT / relative).resolve()
    if target != UPLOAD_ROOT and UPLOAD_ROOT not in target.parents:
        raise ValueError("Invalid storage path")
    return target


def _put(path: str, data: bytes, content_type: str) -> dict:
    target = _safe_path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix(target.suffix + ".tmp")
    temporary.write_bytes(data)
    os.replace(temporary, target)
    return {"path": target.relative_to(UPLOAD_ROOT).as_posix(), "size": len(data), "content_type": content_type}


def _get(path: str) -> tuple[bytes, str]:
    target = _safe_path(path)
    if not target.is_file():
        raise FileNotFoundError(path)
    content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
    return target.read_bytes(), content_type


async def put_object(path: str, data: bytes, content_type: str) -> dict:
    return await asyncio.to_thread(_put, path, data, content_type)


async def get_object(path: str) -> tuple[bytes, str]:
    return await asyncio.to_thread(_get, path)
