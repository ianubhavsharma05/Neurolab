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
- **Multilingual Support:** Fully bilingual interface supporting **English** and **Hindi** transitions.

---

## 2. HOW IT WORKS

### Workflow Architecture
1. **Data Input:** Clinicians upload a patient's T2-weighted MRI scan (JPEG/PNG) and a short speech recording (WAV).
2. **Preprocessing:** 
   - **MRI:** Normalization and transformation to a 224x224 tensor.
   - **Speech:** Trimming and feature extraction (MFCCs, Spectral Centroid).
3. **Inference Pipeline:**
   - **Vision Subsystem:** A fine-tuned ResNet-18 model evaluates the brain scan.
   - **Audio Subsystem:** A custom model analyzes acoustic data for hesitation, prosody, and phonetic changes.
4. **Weighted Ensemble Risk Score:** Results are fused with a cognitive baseline score to produce a single clinical index: `(MRI * 0.45) + (Speech * 0.25) + (Cognitive * 0.30)`.

---

## 3. TECH STACK & LIBRARIES

### Frontend
- **React 18 & Vite:** Modern, high-performance web development.
- **Tailwind CSS & Radix UI:** Premium, glassmorphic UI elements.
- **Framer Motion:** Micro-interactions and smooth layout transitions.
- **Recharts:** Interactive data visualization for longitudinal patient tracking.
- **jsPDF:** Clinical telemetry export to PDF.

### Backend & AI Models
- **FastAPI:** High-performance async API for concurrent inference.
- **PyTorch & torchvision:** Powers the ResNet-18 CNN for interpreting MRI scans.
- **Scikit-Learn & Joblib:** Used for the speech classification model.
- **Librosa:** Core audio processing and digital signal manipulation.
- **pytorch-grad-cam:** Enables XAI by rendering spatial attention maps.

---

## 4. API DOCUMENTATION

| Method | Endpoint | Internal Operation | Response |
| :--- | :--- | :--- | :--- |
| **POST** | `/analyze-mri` | Receives JPEG/PNG. Yields ResNet CNN inference & Grad-CAM heatmap. | JSON with Precision, Classification, and heatmap data. |
| **POST** | `/analyze-speech` | Receives WAV file. Evaluates pitch instability, hesitations, and MFCCs. | JSON with Precision, Classification, and feature dump. |
| **POST** | `/calculate-risk` | Fuses MRI (45%), Speech (25%), and Cognitive (30%) inputs. | Unified clinical risk assessment. |
| **GET** | `/health` | Verifies models are loaded and GPU is reachable. | API status & loaded models. |

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
   # Accessible at http://localhost:5173
   ```

3. **Backend Setup:**
   ```bash
   cd Code/backend
   python -m venv .venv
   .\.venv\Scripts\activate   # On Windows
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   *Ensure model artifacts are placed under `Code/backend/models/`.*

---

## 6. FOLDER STRUCTURE

```
📁 Neurosense
├── 📁 Code                  
│   ├── 📁 backend           # FastAPI backend server
│   │   ├── 📁 models        # PyTorch & Scikit-learn models
│   │   ├── main.py          # Application endpoints & core logic
│   │   └── requirements.txt # Python dependencies
│   ├── 📁 src               # React Frontend (App.tsx, pages, etc.)
│   ├── package.json         # Node.js dependencies
│   └── tailwind.config.ts   # UI styling configuration
├── 📁 docs                  # High-level architecture and flowcharts
└── README.md                # Integrated project documentation
```

---

## 7. MAIN USER FLOWS

### 🏥 Intelligence Hub (Dashboard)
- Transparent, curved dashboard shell with quick links to all modules.
- Longitudinal charting (History) shows diagnostic volatility over time.
- Integrated `RiskGauge` for immediate clinical risk visualization.

### 🧠 MRI Structural Analysis
- Clinicians upload brain scans to compute dementia severity classes.
- XAI logic displays Grad-CAM heatmaps showing neuroimaging focus areas.

### 🎤 Vocal Pattern Intelligence
- Real-time recording or WAV upload to extract acoustic biomarkers.
- Visualization of prosody, fluency, and phonetic biomarkers.

### 📑 Session Matrix (Reports)
- A longitudinal data archive showing all previous diagnostic telemetry.
- One-click PDF export for clinical distribution.

---
**Finalized for modern telemedicine and advanced cognitive diagnostics.**