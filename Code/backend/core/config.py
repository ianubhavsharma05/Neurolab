import json
import logging
import os
import tempfile

from dotenv import load_dotenv
from supabase import create_client, Client

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(os.path.join(os.path.dirname(BACKEND_DIR), ".env"))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

IS_DEV = os.environ.get("ENV") == "development"
LOG_LEVEL = logging.DEBUG if IS_DEV else logging.WARNING

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("NeuroLab")

os.environ.setdefault("NUMBA_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("NUMBA_CACHE_DIR", tempfile.gettempdir())
os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())
os.environ.setdefault("XDG_CACHE_HOME", tempfile.gettempdir())

PORT = int(os.environ.get("PORT", 8000))

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "https://NeuroLab-ai.vercel.app",
    "https://NeuroLab-ai-final.vercel.app",
    "https://neuroscan-ai.vercel.app",
    "https://NeuroLab-ai-git-main-ianubhavsharma05-2903s-projects.vercel.app",
]

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY")
    or os.environ.get("VITE_SUPABASE_ANON_KEY")
)
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")

supabase_client: Client | None = None
if SUPABASE_URL and SUPABASE_KEY and "your-supabase" not in SUPABASE_URL:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase PostgreSQL connected.")
    except Exception as e:
        logger.error(f"Supabase connection failed: {e}")
else:
    logger.warning("Supabase credentials missing — fallback to JSON.")

MRI_MODEL_PATH = os.path.join(BACKEND_DIR, "models", "final_model.pth")
SPEECH_MODEL_PATH = os.path.join(BACKEND_DIR, "models", "speech_model.pkl")

MRI_CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]
MRI_LABEL_MAP = {
    "NonDemented": "Low",
    "VeryMildDemented": "Early",
    "MildDemented": "Moderate",
    "ModerateDemented": "High",
}

PATIENT_DB_PATH = os.path.join(BACKEND_DIR, "patient_records.json")
patient_db: list = []
try:
    if os.path.exists(PATIENT_DB_PATH):
        with open(PATIENT_DB_PATH, "r") as f:
            patient_db = json.load(f)
        logger.info(f"Patient DB loaded: {len(patient_db)} records.")
except Exception as e:
    logger.error(f"Patient DB load failed: {e}")

MAX_MRI_SIZE_BYTES = 20 * 1024 * 1024
MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024
MAX_SEARCH_LENGTH = 100
MAX_RESULTS_PER_PAGE = 100
