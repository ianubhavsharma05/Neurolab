import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from core.config import MAX_AUDIO_SIZE_BYTES
print(f"DEBUG: MAX_AUDIO_SIZE_BYTES is {MAX_AUDIO_SIZE_BYTES}")
print(f"DEBUG: MB is {MAX_AUDIO_SIZE_BYTES // (1024*1024)}")
