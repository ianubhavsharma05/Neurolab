FROM python:3.11-slim

# Install system dependencies for OpenCV and audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    ffmpeg \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a constraints file to prevent ANY package from upgrading numpy
RUN echo "numpy<2.0" > /tmp/constraints.txt

# Copy and install core requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -c /tmp/constraints.txt -r requirements.txt

# Install PyTorch CPU-only explicitly from its own index (while allowing PyPI for dependencies)
RUN pip install --no-cache-dir -c /tmp/constraints.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    torchaudio==2.2.2+cpu

# Install grad-cam WITH --no-deps to prevent it from pulling `opencv-python` 
# Which conflicts with our already-installed `opencv-python-headless`
RUN pip install --no-cache-dir --no-deps grad-cam==1.4.8

# Show installed versions to the build log for debugging
RUN pip list

# Copy application code and models
COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
