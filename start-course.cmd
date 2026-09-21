@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 18 or newer and run this launcher again.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is required. Check your Node.js installation and run this launcher again.
  exit /b 1
)

if not exist "node_modules" (
  echo Installing local course dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    exit /b 1
  )
)

echo Starting Web Learning Lab at http://localhost:5181/
call npm run dev -- --open --port 5181
