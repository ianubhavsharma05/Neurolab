# 🧠 Neurosense AI: Multimodal Dementia Risk Assessment

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 1. PROJECT OVERVIEW

**Neurosense AI** is an advanced diagnostic auxiliary tool designed to detect early-stage dementia using a multimodal artificial intelligence approach. By analyzing structural neuroimaging (MRI) and acoustic biomarker analysis (Speech), along with digital cognitive evaluations, the platform fuses multiple modalities to produce a unified risk index score.

### Key Value Proposition
- **Automated MRI Analysis:** Leverages a ResNet-18 model to evaluate hippocampus and temporal lobe morphology, returning Grad-CAM heatmaps for explainability.
- **Vocal Biomarkers Assessment:** Extracts features (MFCCs, pitch instability, speech-to-silence ratio) to identify subtle cognitive decline markers in speech patterns.
- **Explainable AI (XAI):** Ensures clinical trust by offering transparent insights and heatmap overlays showing *why* a specific classification was made.

---

## 2. HOW IT WORKS

### Workflow Architecture
1. **Data Input:** Clinicians upload a patient's T2-weighted MRI scan and a short speech recording.
2. **Preprocessing:** 
   - **MRI:** Normalization and transformation to a 224x224 tensor.
   - **Speech:** Trimming and feature extraction (MFCCs, Spectral Centroid, librosa).
3. **Inference Pipeline:**
   - **Vision Subsystem:** A fine-tuned ResNet-18 model evaluates the brain scan.
   - **Audio Subsystem:** A custom model analyzes acoustic data for hesitation, prosody, and phonetic changes.
4. **Weighted Ensemble Risk Score:** Results are fused with a cognitive baseline score to produce a single, actionable clinical index: `(MRI * 0.45) + (Speech * 0.25) + (Cognitive * 0.30)`.

---

## 3. TECH STACK & LIBRARIES

### Frontend
- **React 18 & Vite:** Modern, high-performance web development.
- **Tailwind CSS & Radix UI:** Premium, accessible, and highly customizable interface.
- **Framer Motion:** Micro-interactions and smooth layout transitions.
- **Recharts:** Interactive data visualization for longitudinal patient tracking.

### Backend & AI Models
- **FastAPI:** High-performance async API to handle concurrent inference requests.
- **PyTorch & torchvision:** Powers the ResNet-18 CNN for interpreting MRI scans.
- **Scikit-Learn & Joblib:** Used for the speech classification model.
- **Librosa:** Core audio processing and digital signal manipulation.
- **pytorch-grad-cam:** Enables XAI by rendering spatial attention maps for MRI evaluations.
- **OpenCV:** Utility operations for heatmap post-processing.

---

## 4. API DOCUMENTATION

| Method | Endpoint | Internal Operation | Response |
| :--- | :--- | :--- | :--- |
| **POST** | `/analyze-mri` | Receives multipart/form-data. Yields ResNet CNN inference & spatial heatmap overlay. | JSON with Precision, Classification, and `heatmapData`. |
| **POST** | `/analyze-speech` | Receives WAV file. Evaluates pitch instability, hesitations, and MFCC features. | JSON with Precision, Classification, and feature dump. |
| **POST** | `/calculate-risk` | Fuses MRI (45%), Speech (25%), and Cognitive (30%) inputs. | Unified clinical risk (`overallRisk`). |
| **GET** | `/health` | Verifies models are loaded and GPU (if any) is reachable. | API status & loaded models. |

---

## 5. INSTALLATION & SETUP

### Prerequisites
- Python 3.10+
- Node.js 18+

### Initialization
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ianubhavsharma05/Neurosense.git
   cd Neurosense
   ```

2. **Frontend Setup:**
   ```bash
   cd Code
   npm install
   npm run dev
   # Server spins up at http://localhost:5173 (or as configured)
   ```

3. **Backend Setup:**
   ```bash
   cd Code/backend
   python -m venv .venv
   .\.venv\Scripts\activate   # On Windows
   # source .venv/bin/activate # On Unix
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   *Make sure model artifacts (`final_model.pth`, `speech_model.pkl`) are placed under `Code/backend/models/` before starting.*

---

## 6. FOLDER STRUCTURE

```
📁 Neurosense
├── 📁 Code                  
│   ├── 📁 backend           # FastAPI backend server
│   │   ├── 📁 models        # PyTorch & Scikit-learn models
│   │   ├── main.py          # Application endpoints & core logic
│   │   └── requirements.txt # Python dependencies
│   ├── 📁 src               # React Frontend components & views
│   ├── 📁 public            # Static web assets
│   ├── package.json         # Node.js dependencies
│   └── tailwind.config.ts   # UI styling configuration
├── README.md                # Project documentation
```

---

## 7. AI MODELS RECAP

- **MRI Vision Engine (ResNet-18):** 18-layer CNN transfer-learned on brain scans, modifying the fully connected layer to output one of 4 dementia severity classes (NonDemented, VeryMild, Mild, Moderate). Evaluated via robust spatial attention logic (Grad-CAM).
- **Speech Classifier:** Evaluates 10-second vocal clips assessing prosody (pitch instability) and fluency (speech-to-silence ratio), passing an ensemble array of 13 MFCCs into a structured classifier pipeline.

---
**Developed efficiently for modern telemedicine diagnostics.**



That is an incredibly important question! If your app suddenly goes viral and 5 million people hit your Railway Free Tier container at the exact same moment, it will completely crash under the pressure (a classic out-of-memory or timeout failure).

Handling millions of concurrent users doing **heavy AI math operations** requires moving from a "startup" architecture to an "enterprise" architecture. 

Here is exactly what you connect on Railway (and beyond) to prevent that crash:

### 1. Upgrade from Free Tier to a Paid Machine (Vertical Scaling)
First, you absolutely cannot run 5 million AI scans on a 500 MB RAM free tier server. You would click the Railway dashboard and pay to upgrade your container to a **High-Performance CPU** (e.g., 8-16 vCPUs and 16 GB of RAM). This ensures the AI models process requests in 1 second instead of 30 seconds.

### 2. Auto-Scaling Instances (Horizontal Scaling)
Even a massive 16-core server will crash if 5 million people hit it at once. In the Railway settings, you can turn on **Auto-Scaling**.
* Railway will monitor your app. If it sees 5,000 people logging in, Railway will automatically spawn 50 identical copies (clones) of your backend container across their server farm.
* A "Load Balancer" automatically splits the traffic equally so no single container gets overwhelmed.

### 3. Attach a Queue System (Redis/Celery)
This is the most critical step for AI apps. You cannot let 5 million people try to execute heavy PyTorch MRI models over a live web socket simultaneously.
* You connect a **Redis Database** to your backend.
* When a user uploads an audio file from Vercel, Railway doesn't analyze it instantly. Instead, it drops the file into a "Waiting Line" (the Queue).
* Your Vercel frontend says *"You are spot #405 in line..."*
* Your "Worker" servers process the line one by one silently in the background, keeping the servers completely safe from crashing.

### Summary
To survive a 5-million user spike in the future, you would upgrade your Railway plan to **Auto-Scale multiple containers**, connect a **Redis Queue** so users wait in line during peak traffic instead of crashing the server, and ideally, move to a cloud host that specifically provides **NVIDIA GPUs** (like AWS, Azure, or RunPod) because GPUs calculate AI predictions 100x faster than standard CPUs!
