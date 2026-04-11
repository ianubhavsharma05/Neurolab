import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core.config import (
    PORT, ALLOWED_ORIGINS, IS_DEV, logger,
    supabase_client, patient_db,
    MAX_RESULTS_PER_PAGE, MAX_SEARCH_LENGTH,
)
from core.response import success_response
from gateway.middleware import GatewayMiddleware
from auth.jwt_guard import verify_jwt, require_role
from engines import mri_engine, speech_engine, risk_engine
from sandbox.executor import (
    verify_image_bytes, verify_audio_bytes,
    safe_temp_write, safe_cleanup, transcode_to_wav,
    run_sandboxed,
)


app = FastAPI(
    title="Neurosense AI Integrated Core",
    version="2.2.0",
    docs_url="/docs" if IS_DEV else None,
    redoc_url=None,
    openapi_url="/openapi.json" if IS_DEV else None,
)

app.add_middleware(GatewayMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)


class RiskRequest(BaseModel):
    mri_score: float = Field(..., ge=0, le=100)
    speech_score: float = Field(..., ge=0, le=100)
    cognitive_score: float = Field(..., ge=0, le=100)


@app.post("/analyze-mri")
async def route_mri(
    file: UploadFile = File(...),
    user: dict = Depends(verify_jwt),
):
    content = await file.read()
    try:
        verify_image_bytes(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not mri_engine.is_ready():
        raise HTTPException(status_code=503, detail="MRI engine offline.")

    try:
        result = run_sandboxed(
            mri_engine.run_inference,
            content,
            user_id=user.get("id"),
        )
        return success_response(result, model="ResNet18-MRI")
    except Exception as e:
        logger.error(f"MRI pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="MRI analysis failed. Please try again.")


@app.post("/analyze-speech")
async def route_speech(
    file: UploadFile = File(...),
    user: dict = Depends(verify_jwt),
):
    content = await file.read()
    filename = file.filename or "speech.wav"

    try:
        verify_audio_bytes(content, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not speech_engine.is_ready():
        raise HTTPException(status_code=503, detail="Speech engine offline.")

    is_wav = filename.lower().endswith(".wav")
    temp_path = safe_temp_write(content, suffix=".wav" if is_wav else ".webm")
    transcode_path = None

    try:
        process_path = temp_path
        if not is_wav:
            transcode_path = transcode_to_wav(temp_path)
            if transcode_path:
                process_path = transcode_path

        result = run_sandboxed(
            speech_engine.run_inference,
            process_path,
        )
        return success_response(result, model="RandomForest-Speech")
    except Exception as e:
        logger.error(f"Speech pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Speech analysis failed. Please try again.")
    finally:
        safe_cleanup(temp_path, transcode_path or "")


@app.post("/calculate-risk")
async def route_risk(
    request: RiskRequest,
    user: dict = Depends(verify_jwt),
):
    result = risk_engine.run_inference(
        request.mri_score, request.speech_score, request.cognitive_score
    )
    return success_response(result, model="RiskAggregator-v1")


@app.get("/patients")
async def route_patients(
    limit: int = 50,
    skip: int = 0,
    search: str = None,
    user: dict = Depends(verify_jwt),
):
    limit = min(limit, MAX_RESULTS_PER_PAGE)
    skip = max(skip, 0)

    if supabase_client:
        try:
            query = supabase_client.table("patients").select("*", count="exact")
            if search:
                sanitized = "".join(c for c in search if c.isalnum() or c in " .-")[:MAX_SEARCH_LENGTH]
                query = query.ilike("name", f"%{sanitized}%")
            response = query.range(skip, skip + limit - 1).execute()
            return success_response({
                "total": response.count,
                "count": len(response.data),
                "data": response.data,
                "source": "Supabase Cloud",
            })
        except Exception as e:
            logger.warning(f"Supabase query failed, JSON fallback: {e}")

    filtered = patient_db
    if search:
        s = search.lower()[:MAX_SEARCH_LENGTH]
        filtered = [p for p in patient_db if s in p["name"].lower() or s in p["id"].lower()]

    return success_response({
        "total": len(filtered),
        "count": len(filtered[skip : skip + limit]),
        "data": filtered[skip : skip + limit],
        "source": "Local JSON",
    })


@app.get("/patients/{patient_id}")
async def route_patient_by_id(
    patient_id: str,
    user: dict = Depends(verify_jwt),
):
    if len(patient_id) > 200:
        raise HTTPException(status_code=400, detail="Invalid patient ID.")
    for p in patient_db:
        if p["id"] == patient_id or p["name"].lower() == patient_id.lower():
            return success_response(p)
    raise HTTPException(status_code=404, detail="Patient not found.")


@app.get("/")
async def root():
    return {"message": "Neurosense AI Core", "status": "active"}


@app.get("/health")
async def health():
    return {
        "status": "online",
        "mri_ready": mri_engine.is_ready(),
        "speech_ready": speech_engine.is_ready(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
