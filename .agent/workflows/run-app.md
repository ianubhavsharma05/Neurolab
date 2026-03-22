---
description: How to run the current NeuroSense AI application manually
---

Follow these steps to start the complete diagnostic environment (Backend + Frontend). You can use the automated script or run the commands manually.

## 🚀 Option 1: Automated Start (Recommended)

This method handles virtual environments and dependency verification automatically.

### 1. Start the Backend (FastAPI Core)
Open a PowerShell terminal in:
`c:\Users\ianub\Documents\Neurosense\Code\backend`

// turbo
```powershell
.\start_backend.ps1
```
*Note: If script execution is restricted, use:* `powershell -ExecutionPolicy Bypass -File .\start_backend.ps1`

### 2. Start the Frontend (Vite & React)
Open a **separate** terminal in:
`c:\Users\ianub\Documents\Neurosense\Code`

// turbo
```powershell
npm run dev
```

---

## 🛠 Option 2: Pure Manual Process

Use this if you prefer to run every command individually.

### 1. Manual Backend Setup
Navigate to: `c:\Users\ianub\Documents\Neurosense\Code\backend`

1. **Activate Environment**:
```powershell
.\.venv\Scripts\Activate.ps1
```

2. **Launch Server**:
```powershell
python main.py
```
*The core will be reachable at `http://localhost:8000`.*

### 2. Manual Frontend Setup
Navigate to: `c:\Users\ianub\Documents\Neurosense\Code`

1. **Ensure Dependencies**:
```powershell
npm install
```

2. **Launch Dev Server**:
```powershell
npm run dev
```
*The dashboard will be reachable at `http://localhost:5173`.*

---

## 🔍 Post-Launch & Troubleshooting

### Verification Checklist
1. **Connectivity**: Navigate to `http://localhost:5173` and verify "API Connection: Synchronized".
2. **API Health**: Visit `http://localhost:8000/health` to confirm models are loaded.

### Troubleshooting
- **Port Conflicts**: Ensure no other service is using port 8000 (Backend) or 5173 (Frontend).
- **Model Loading**: Initial startup may take 5–10 seconds as the ResNet-18 vision engine initializes.
- **Node Modules**: If the frontend fails to start, delete the `node_modules` folder and run `npm install` again.

## 4. Building for Production

To generate an optimized, deployment-ready bundle:
```powershell
cd c:\Users\ianub\Documents\Neurosense\Code
npm run build
```
This produces a minified `dist/` folder ready for CDN or hospital network hosting.


