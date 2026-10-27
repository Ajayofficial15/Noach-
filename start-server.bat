@echo off
title NOACH Transport Services - Web Server
echo ========================================================
echo   Starting NOACH Transport Services Local Web Server...
echo ========================================================
echo.

set ELECTRON_RUN_AS_NODE=1
set AGY_NODE="C:\Users\Ajayg\AppData\Local\Programs\antigravity\Antigravity.exe"

if exist %AGY_NODE% (
    %AGY_NODE% server\server.js
) else (
    node server\server.js
)

pause
