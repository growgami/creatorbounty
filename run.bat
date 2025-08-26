@echo off
echo Starting frontend and backend servers...

echo.
echo Starting frontend server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Starting backend server...
start "Backend" cmd /k "cd backend && venv\Scripts\activate && python src/main.py"

echo.
echo Both servers are starting in separate windows.
echo Press any key to exit this script...
pause >nul
