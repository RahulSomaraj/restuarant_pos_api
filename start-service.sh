#!/bin/bash

# Startup script for NestJS services
# Ensures dependencies are installed and up-to-date

echo "🚀 Starting service with dependency check..."

# Check if package.json has changed (optional - for production)
if [ -f "package.json" ]; then
    echo "📦 Installing/updating dependencies..."
    npm install --legacy-peer-deps
fi

# Start the service
echo "▶️  Starting NestJS service..."
exec npm run start:dev $1 