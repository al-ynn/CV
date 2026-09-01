import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

try:
    import mongomock_motor
except ImportError:  # pragma: no cover
    mongomock_motor = None

load_dotenv(Path(__file__).parent / ".env")

mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
use_mock_raw = os.environ.get("USE_MOCK_MONGO", "auto").strip().lower()
use_mock_mongo = use_mock_raw in {"1", "true", "yes", "on"}
local_like_url = mongo_url.startswith("mongodb://localhost") or mongo_url.startswith("mongodb://127.0.0.1")


def _get_client():
    if mongomock_motor is not None and (use_mock_mongo or local_like_url):
        return mongomock_motor.AsyncMongoMockClient()
    return AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)


client = _get_client()
db = client[os.environ.get("DB_NAME", "cv")]
