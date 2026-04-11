import gc
import os
import subprocess
import tempfile
from typing import Callable, TypeVar

from core.config import MAX_MRI_SIZE_BYTES, MAX_AUDIO_SIZE_BYTES, logger

T = TypeVar("T")

IMAGE_SIGNATURES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",
    b"GIF8": "image/gif",
}

AUDIO_SIGNATURES = {
    b"RIFF": "audio/wav",
    b"\x1a\x45\xdf\xa3": "audio/webm",
    b"OggS": "audio/ogg",
    b"fLaC": "audio/flac",
}


def verify_image_bytes(content: bytes) -> str:
    if len(content) < 4:
        raise ValueError("File is too small to be a valid image.")
    if len(content) > MAX_MRI_SIZE_BYTES:
        raise ValueError(f"Image too large. Maximum {MAX_MRI_SIZE_BYTES // (1024*1024)}MB.")

    header = content[:8]
    for signature, mime_type in IMAGE_SIGNATURES.items():
        if header.startswith(signature):
            logger.debug(f"[Sandbox] Image verified: {mime_type}")
            return mime_type

    raise ValueError(
        "Invalid image file. Only JPEG, PNG, and WebP are accepted. "
        "The file you uploaded does not match any valid image format."
    )


def verify_audio_bytes(content: bytes, filename: str = "") -> str:
    if len(content) < 4:
        raise ValueError("File is too small to be valid audio.")
    if len(content) > MAX_AUDIO_SIZE_BYTES:
        raise ValueError(f"Audio too large. Maximum {MAX_AUDIO_SIZE_BYTES // (1024*1024)}MB.")

    header = content[:8]
    for signature, mime_type in AUDIO_SIGNATURES.items():
        if header.startswith(signature):
            logger.debug(f"[Sandbox] Audio verified: {mime_type}")
            return mime_type

    if filename.lower().endswith(".wav"):
        return "audio/wav"

    raise ValueError(
        "Invalid audio file. Only WAV, WebM, OGG, and FLAC are accepted."
    )


def safe_temp_write(content: bytes, suffix: str = ".tmp") -> str:
    clean_suffix = "." + suffix.lstrip(".").replace("/", "").replace("\\", "")[:10]

    with tempfile.NamedTemporaryFile(suffix=clean_suffix, delete=False) as f:
        f.write(content)
        return f.name


def safe_cleanup(*paths: str):
    for path in paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except OSError:
                pass
    gc.collect()


def transcode_to_wav(input_path: str) -> str | None:
    output_path = input_path + "_safe.wav"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-t", "10", "-ar", "22050", "-ac", "1", output_path],
            timeout=30,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return output_path
    except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        logger.warning(f"[Sandbox] FFmpeg transcode failed: {e}")
        return None


def run_sandboxed(fn: Callable[..., T], *args, **kwargs) -> T:
    try:
        result = fn(*args, **kwargs)
        return result
    except Exception:
        gc.collect()
        raise
