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

# Install PyTorch CPU-only explicitly from its own index
RUN pip install --no-cache-dir -c /tmp/constraints.txt \
    --index-url https://download.pytorch.org/whl/cpu \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    torchaudio==2.2.2+cpu

# Install grad-cam WITH --no-deps to prevent it from pulling `opencv-python` 
# Which conflicts with our already-installed `opencv-python-headless`
RUN pip install --no-cache-dir --no-deps grad-cam==1.4.8

# Final sanity check at build time
RUN python -c " \
import numpy; \
print('numpy version:', numpy.__version__); \
assert numpy.__version__.startswith('1.'), f'FATAL: numpy {numpy.__version__} incompatible — must be 1.x'; \
import torch; \
print('torch version:', torch.__version__); \
print('numpy available in torch:', torch.is_floating_point(torch.tensor([1.0]))); \
import cv2; \
print('cv2 version:', cv2.__version__); \
from pytorch_grad_cam import GradCAM; \
print('grad-cam successfully imported'); \
"

# Copy application code and models
COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
