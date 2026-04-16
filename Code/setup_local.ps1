# NeuroLab One-Click Local Setup Script
Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "  NeuroLab: Multimodal AI Core - Local Setup" -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

# 1. Check for Node.js
if (-Not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Error: Node.js (npm) is not installed. Please install it from https://nodejs.org" -ForegroundColor Red
    exit
}

# 2. Check for Python
if (-Not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Error: Python is not installed. Please install it from https://python.org (Add to PATH)" -ForegroundColor Red
    exit
}

# 3. Frontend Setup
Write-Host "[+] Installing Frontend dependencies..." -ForegroundColor Gray
npm install --quiet

# 4. Backend Setup
Write-Host "[+] Setting up Backend environment..." -ForegroundColor Gray
Set-Location backend

if (-Not (Test-Path ".venv")) {
    Write-Host "[+] Creating Virtual Environment..." -ForegroundColor Gray
    python -m venv .venv
}

Write-Host "[+] Installing AI dependencies (This may take a moment)..." -ForegroundColor Gray
.\.venv\Scripts\pip install -r requirements.txt --quiet --extra-index-url https://download.pytorch.org/whl/cpu

# 5. Environment File
Set-Location ..
if (-Not (Test-Path ".env")) {
    Write-Host "[+] Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "[!] ACTION REQUIRED: Open your .env file and add your Supabase keys!" -ForegroundColor White
}

Write-Host "`n----------------------------------------------------" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "  1. Run Backend: cd backend; .\start_backend.ps1" -ForegroundColor Gray
Write-Host "  2. Run Frontend: npm run dev" -ForegroundColor Gray
Write-Host "----------------------------------------------------" -ForegroundColor Green
