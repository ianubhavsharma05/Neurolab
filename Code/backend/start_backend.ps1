# NeuroLab Backend Start Script
Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "  NeuroLab: Backend Inference Core starting..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

# Ensure we are in the backend directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# Check for virtual environment
if (-Not (Test-Path ".venv")) {
    Write-Host "[!] Virtual environment (.venv) not found. Creating..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "[+] Activating Virtual Environment..." -ForegroundColor Gray
.\.venv\Scripts\Activate.ps1

# Install/Update requirements
Write-Host "[+] Verifying Python dependencies (this may take a moment)..." -ForegroundColor Gray
pip install -r requirements.txt --quiet

# Start the FastAPI application
Write-Host "[*] Launching NeuroLab Integrated Core at http://localhost:8000" -ForegroundColor Green
python main.py
