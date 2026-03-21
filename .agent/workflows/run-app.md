---
description: How to run the current NeuroSense AI application manually
---

Run both the backend and frontend in separate terminals.

## 1. Start the backend

Open PowerShell in:

```powershell
cd c:\Users\ianub\Documents\Neurosense\Code\backend
```

Then run:

```powershell
.\start_backend.ps1
```

Notes:

- The script looks for Python in `Code\backend\.venv` first, then `Code\.venv`
- The backend serves FastAPI on `http://localhost:8000`
- Model loading can take a little time on startup

## 2. Start the frontend

Open PowerShell in:

```powershell
cd c:\Users\ianub\Documents\Neurosense\Code\backend
```

Then run:

```powershell
python main.py
```

Notes:

- The backend serves FastAPI on `http://localhost:8000`

## 2. Start the frontend

Open a new terminal in:

```powershell
cd c:\Users\ianub\Documents\Neurosense\Code\frontend
```

Install packages if needed:

```powershell
npm install
```

Then run:

```powershell
npm run dev
```

The frontend runs on:

- `http://localhost:4173`

## 3. Verify the app

- Open `http://localhost:4173`
- Confirm the landing page loads
- Use the navbar to open `Core Capabilities`, `Intelligence Hub`, `MRI Analysis`, `Vocal Patterns`, or `Session Matrix`
- Toggle `EN / हिंदी` in the navbar to verify bilingual mode

## 4. Build check

To confirm a production build:

```powershell
cd c:\Users\ianub\Documents\Neurosense\Code
npm run build
```
