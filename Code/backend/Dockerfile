FROM python:3.12-slim

# Install system dependencies for OpenCV and audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsndfile1 \
    ffmpeg \
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
