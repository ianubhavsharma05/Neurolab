from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import supabase_client, SUPABASE_JWT_SECRET, logger

security = HTTPBearer(auto_error=False)


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    if supabase_client:
        try:
            user_response = supabase_client.auth.get_user(token)
            if user_response and user_response.user:
                return {
                    "id": user_response.user.id,
                    "email": user_response.user.email,
                    "role": user_response.user.user_metadata.get("role", "patient"),
                }
        except Exception as e:
            logger.warning(f"[Auth] JWT verification failed: {e}")
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    try:
        import jwt as pyjwt

        if not SUPABASE_JWT_SECRET:
            raise HTTPException(status_code=500, detail="Server auth misconfigured.")

        payload = pyjwt.decode(
            token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated"
        )
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("user_metadata", {}).get("role", "patient"),
        }
    except ImportError:
        raise HTTPException(status_code=500, detail="Server auth module missing.")
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(*allowed_roles: str):
    async def role_checker(user: dict = Depends(verify_jwt)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}.",
            )
        return user

    return role_checker
