# --- BASE OPERATING SYSTEM ---
# We use Python 3.11 "slim" to keep the server lightweight. It runs a minimal Debian Linux OS underneath.
FROM python:3.11-slim

# --- SYSTEM-LEVEL LIBRARIES (C/C++ DEPENDENCIES) ---
# apt-get update: Refreshes the Linux package manager
# libgl1 & libglib2.0-0: Required by OpenCV to mathematically process and resize our brain heatmaps
# libsndfile1 & ffmpeg: Critical audio engines. They allow Python to decode raw sound files (WAV, WebM) natively before Librosa analyzes them
# libgomp1: A multithreading library that accelerates Scikit-Learn (our speech model) matrix math
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    ffmpeg \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/* # This deletes the installer files to save space on Render/Railway

# Sets the virtual working folder inside the container
WORKDIR /app

# --- PYTHON DEPENDENCIES ---
# We copy ONLY the requirements.txt first. Why? Because Docker caches this step! 
# This means if we change our python code later, Docker doesn't have to re-download 2GB of libraries.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- AI CORE LIBRARIES (PyTorch) ---
# We explicitly force the installation of the "CPU-ONLY" version of PyTorch. 
# Render and Railway Free/Hobby tiers do not have expensive NVIDIA GPUs. 
# If we didn't do this, PyTorch would install massive 5GB GPU drivers and crash the deployment immediately.
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    torch==2.3.0+cpu \
    torchvision==0.18.0+cpu \
    torchaudio==2.3.0+cpu

# --- SPECIALIZED EXPLAINABILITY LIBRARY ---
# Grad-CAM lets us "see" inside the neural network's brain. 
# We use '--no-deps' so it doesn't accidentally download broken versions of OpenCV that conflict with our headless setup.
RUN pip install --no-cache-dir --no-deps grad-cam==1.4.8

# Outputs the final list of installed libraries to the cloud console so we can debug if something breaks
RUN pip list

# --- APPLICATION DEPLOYMENT ---
# Copies all our Python files, models, and audio scripts into the Docker container
COPY . .

# Opens port 8000 on the container so the internet (and our React frontend) can reach the FastAPI endpoints
EXPOSE 8000

# The final trigger command that boots the web-server when Render/Railway turns the machine on
CMD ["python", "main.py"]
