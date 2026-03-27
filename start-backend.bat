@echo off
cd /d "C:\Users\Romulo Sedano Sant'A\Documents\Rio sol academy\rio-sol-academy"
start /B node backend\server.mjs > backend-runn.log 2>&1
timeout /t 2 /nobreak > nul
