#!/bin/bash

echo "🚀 Setting up development environment..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
else
    echo "✅ Dependencies already installed"
fi

echo "🐳 Starting Docker services..."
docker-compose up --build 