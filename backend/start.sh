#!/bin/bash

# Quantum Risk Coach Backend Startup Script

echo "🚀 Starting Quantum Risk Coach Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check if MetaTrader5 module is installed
if ! python -c "import MetaTrader5" &> /dev/null; then
    echo "⚠️  MetaTrader5 module not found. Installing..."
    pip install MetaTrader5
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before starting."
fi

# Create logs directory if it doesn't exist
if [ ! -d logs ]; then
    echo "📁 Creating logs directory..."
    mkdir logs
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start the server
echo "🌟 Starting server on port ${PORT:-3001}..."
echo "📊 Health check: http://localhost:${PORT:-3001}/health"
echo "🔗 MT4 API: http://localhost:${PORT:-3001}/api/mt4"
echo "🔗 MT5 API: http://localhost:${PORT:-3001}/api/mt5"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start 