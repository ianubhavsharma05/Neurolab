FROM python:3.12-slim

# Install system dependencies for OpenCV and audio processing
# libgl1 replaces deprecated libgl1-mesa-glx on Debian bookworm/trixie
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    ffmpeg \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 1: Install PyTorch CPU-only FIRST (separate step for clarity and caching)
# Using --index-url ensures we get the CPU build, not the CUDA one
RUN pip install --no-cache-dir \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    torchaudio==2.2.2+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Step 2: Copy and install remaining requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 3: Copy application code and models
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
