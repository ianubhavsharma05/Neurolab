FROM python:3.12-slim

# Install system dependencies for OpenCV and audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    ffmpeg \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first (for Docker layer caching)
COPY requirements.txt .

# Install ALL packages in ONE atomic pip call.
# --extra-index-url makes the PyTorch CPU wheels (torch==2.2.2+cpu etc.) resolvable.
# Pip resolves the full dependency graph at once — no more numpy overwrites
# between separate RUN steps.
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# Hard re-pin numpy==1.26.4 as a safety net in case any transitive dep upgraded it
RUN pip install --no-cache-dir --force-reinstall "numpy==1.26.4"

# Verify both numpy and torch import cleanly at build time
RUN python -c " \
import numpy; \
print('numpy version:', numpy.__version__); \
assert numpy.__version__.startswith('1.'), f'FATAL: numpy {numpy.__version__} incompatible — must be 1.x'; \
import torch; \
print('torch version:', torch.__version__); \
print('numpy available in torch:', torch.is_floating_point(torch.tensor([1.0]))); \
"

# Copy application code and models
COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
