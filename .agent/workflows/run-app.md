---
description: How to run the current NeuroSense AI application manually
---

Run both the backend and frontend in separate terminals to start the full diagnostic environment.

## 1. Start the Backend (FastAPI)

Open a PowerShell terminal in:
`c:\Users\ianub\Documents\Neurosense\Code\backend`

Then run:
```powershell
.\start_backend.ps1
```

**Notes:**
- The script automatically handles virtual environment detection and dependency verification.
- The backend serves at `http://localhost:8000`.
- Initial model loading (ResNet-18) takes roughly 5–10 seconds.

## 2. Start the Frontend (Vite)

Open a **separate** terminal in:
`c:\Users\ianub\Documents\Neurosense\Code`

Ensure dependencies are installed:
```powershell
npm install
```

Start the development server:
```powershell
npm run dev
```

**Notes:**
- The frontend will be accessible at `http://localhost:5173`.
- Ensure the backend is running first for API connectivity.

## 3. Verify the Application

1. Open `http://localhost:5173` in your browser.
2. Confirm the **Intelligence Hub** displays your (demo) patient telemetry.
3. Test the **MRI Analysis** workflow with a JPEG/PNG scan.
4. Test the **Vocal Patterns** workflow with a WAV file.
5. Verify that the **Reports** page lists all diagnostic cycles correctly.

## 4. Production Build

To verify the project for production deployment:
```powershell
cd c:\Users\ianub\Documents\Neurosense\Code
npm run build
```
This generates a minified `dist/` folder ready for static hosting.
