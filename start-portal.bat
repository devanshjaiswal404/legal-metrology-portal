@echo off
title Legal Metrology Compliance Portal
color 0A
echo ========================================================
echo   National Legal Metrology Compliance & Enforcement Portal
echo ========================================================
echo.
echo Starting local development server...
cd /d "%~dp0"
set "PATH=C:\Users\ASUS\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64;%PATH%"

start http://localhost:5173
npm run dev

pause
