@echo off
echo 🚀 Setting up development environment...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install --legacy-peer-deps
) else (
    echo ✅ Dependencies already installed
)

echo 🐳 Starting Docker services...
docker-compose up --build
pause 