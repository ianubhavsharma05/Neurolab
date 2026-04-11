import uuid
from typing import Any, Optional

API_VERSION = "2.1.0"


def success_response(
    data: Any,
    *,
    model: str = "none",
    request_id: Optional[str] = None,
) -> dict:
    return {
        "success": True,
        "data": data,
        "error": None,
        "metadata": {
            "request_id": request_id or str(uuid.uuid4())[:12],
            "model": model,
            "version": API_VERSION,
        },
    }


def error_response(
    message: str,
    *,
    code: str = "UNKNOWN_ERROR",
    request_id: Optional[str] = None,
) -> dict:
    return {
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "message": message,
        },
        "metadata": {
            "request_id": request_id or str(uuid.uuid4())[:12],
            "model": "none",
            "version": API_VERSION,
        },
    }
