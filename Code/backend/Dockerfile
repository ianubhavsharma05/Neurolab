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

# Copy requirements first for better Docker caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and models
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
