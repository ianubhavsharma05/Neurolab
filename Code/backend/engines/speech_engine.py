import os
import uuid
import threading

import joblib
import librosa
import numpy as np

from core.config import SPEECH_MODEL_PATH, logger

_load_error: str | None = None
_model = None

try:
    if os.path.exists(SPEECH_MODEL_PATH):
        _model = joblib.load(SPEECH_MODEL_PATH)
        logger.info("Speech engine: Model loaded.")
    else:
        _load_error = f"Not found: {SPEECH_MODEL_PATH}"
        logger.warning(f"Speech engine: {_load_error}")
except Exception as e:
    _load_error = str(e)
    logger.error(f"Speech engine: Load failed — {e}")


def is_ready() -> bool:
    return _model is not None


def get_load_error() -> str | None:
    return _load_error


def _warmup():
    try:
        dummy = np.zeros(2205, dtype=np.float32)
        librosa.feature.mfcc(y=dummy, sr=22050, n_mfcc=13)
        librosa.piptrack(y=dummy, sr=22050, fmin=50, fmax=500)
        logger.info("Speech engine: JIT warmup complete.")
    except Exception as e:
        logger.warning(f"Speech engine: JIT warmup failed — {e}")

threading.Thread(target=_warmup, daemon=True).start()


def _extract_features(file_path: str) -> np.ndarray:
    audio, sr = librosa.load(file_path, sr=22050, mono=True, duration=10)
    audio, _ = librosa.effects.trim(audio)

    if len(audio) == 0:
        raise ValueError("Audio file is empty or unreadable.")

    intervals = librosa.effects.split(audio, top_db=20)
    speech_feat = np.array([i[1] - i[0] for i in intervals]) if len(intervals) > 0 else np.array([0])
    speech_ratio = float(np.sum(speech_feat) / len(audio))

    pitches, _ = librosa.piptrack(y=audio, sr=sr, fmin=50, fmax=500)
    pitch_values = pitches[pitches > 0]
    pitch_instability = float(np.std(pitch_values)) if len(pitch_values) > 0 else 0.0

    mfccs = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13).T, axis=0)

    centroid = float(np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr)))

    return np.hstack([mfccs, [speech_ratio, pitch_instability, centroid]])


def run_inference(audio_path: str) -> dict:
    if not _model:
        raise RuntimeError(f"Speech engine offline: {_load_error}")

    features = _extract_features(audio_path).reshape(1, -1)

    prob = _model.predict_proba(features)[0]
    prediction = _model.predict(features)[0]

    return {
        "id": str(uuid.uuid4()),
        "classification": "High" if prediction == 1 else "Low",
        "confidence": float(prob.max()) * 100,
        "modelAccuracy": 92.0,
        "transcript": None,
        "features": {
            "jitter": None,
            "shimmer": None,
            "pitch": float(features[0, 14]),
            "pauseDuration": float(features[0, 13]),
            "spectralCentroid": float(features[0, 15]),
        },
    }
