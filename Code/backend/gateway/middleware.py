import time
import uuid
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from core.config import logger


class RateLimitStore:
    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self._hits: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        cutoff = now - self.window
        self._hits[client_ip] = [t for t in self._hits[client_ip] if t > cutoff]
        if len(self._hits[client_ip]) >= self.max_requests:
            return False
        self._hits[client_ip].append(now)
        return True

    def remaining(self, client_ip: str) -> int:
        now = time.time()
        cutoff = now - self.window
        active = [t for t in self._hits[client_ip] if t > cutoff]
        return max(0, self.max_requests - len(active))


rate_store = RateLimitStore(max_requests=60, window_seconds=60)
analysis_rate_store = RateLimitStore(max_requests=10, window_seconds=60)


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class GatewayMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())[:12]
        request.state.request_id = request_id
        start_time = time.time()

        client_ip = get_client_ip(request)

        path = request.url.path
        is_analysis = path in ("/analyze-mri", "/analyze-speech")
        store = analysis_rate_store if is_analysis else rate_store

        if not store.is_allowed(client_ip):
            logger.warning(f"[Gateway] Rate limit exceeded: {client_ip} on {path}")
            return Response(
                content='{"success":false,"error":{"code":"RATE_LIMITED","message":"Too many requests. Please wait and try again."}}',
                status_code=429,
                headers={
                    "Content-Type": "application/json",
                    "Retry-After": "60",
                    "X-Request-Id": request_id,
                },
            )

        response = await call_next(request)

        duration_ms = round((time.time() - start_time) * 1000, 1)
        response.headers["X-Request-Id"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"
        response.headers["X-RateLimit-Remaining"] = str(store.remaining(client_ip))
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["X-Content-Type-Options"] = "nosniff"

        logger.info(
            f"[Gateway] {request.method} {path} → {response.status_code} "
            f"({duration_ms}ms) IP={client_ip} RID={request_id}"
        )

        return response
