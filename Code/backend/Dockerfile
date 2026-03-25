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

# Step 1: Pin numpy FIRST — must be <2.0 for PyTorch 2.2.x + grad-cam compatibility
RUN pip install --no-cache-dir "numpy==1.26.4"

# Step 2: Install PyTorch CPU-only — uses --index-url to avoid 3GB CUDA download
RUN pip install --no-cache-dir \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    torchaudio==2.2.2+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Step 3: Copy and install remaining requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 4: Hard re-pin numpy AFTER all installs to prevent any package from upgrading it
RUN pip install --no-cache-dir --force-reinstall "numpy==1.26.4"

# Step 5: Verify numpy version at build time
RUN python -c "import numpy; print('numpy version:', numpy.__version__); assert numpy.__version__.startswith('1.'), f'FATAL: numpy {numpy.__version__} is incompatible! Must be 1.x'"

# Step 6: Copy application code and models
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
