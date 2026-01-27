@echo off
REM CivicCare Quick Start Script for Windows
REM This script sets up and starts both backend and frontend servers

echo.
echo ============================================================
echo CivicCare - Smart City Complaint ^& Awareness Portal
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Warning: Node.js is not installed. Please install Node.js v16+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%
echo.

REM Backend Setup
echo Setting up Backend...
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating .env file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/civiccare
        echo JWT_SECRET=civiccare_jwt_secret_change_in_production
        echo JWT_EXPIRE=7d
        echo NODE_ENV=development
        echo ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    ) > .env
    echo .env file created
)

echo Seeding sample data...
call npm run seed

echo Backend setup complete
echo.

REM Frontend Setup
cd ..
echo Setting up Frontend...
cd frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating .env file...
    (
        echo VITE_API_URL=http://localhost:5000/api
        echo VITE_SOCKET_URL=http://localhost:5000
    ) > .env
    echo .env file created
)

echo Frontend setup complete
echo.

echo ============================================================
echo NEXT STEPS:
echo ============================================================
echo.
echo 1. Open Command Prompt/PowerShell 1 and run:
echo    cd backend
echo    npm run dev
echo.
echo 2. Open Command Prompt/PowerShell 2 and run:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Backend will start on: http://localhost:5000
echo 4. Frontend will start on: http://localhost:5173
echo.
echo SAMPLE CREDENTIALS:
echo.
echo Citizen User:
echo   Email: citizen1@civiccare.com
echo   Password: password123
echo.
echo Admin (Waste Department):
echo   Email: admin.waste@civiccare.com
echo   Password: admin123
echo.
echo Setup complete! Happy coding!
echo.
pause
