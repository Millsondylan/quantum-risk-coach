#!/bin/bash

# MT4/MT5 Service Startup Script for Gitpod
# This script sets up and starts the MT4/MT5 integration services

echo "🚀 Starting MT4/MT5 Integration Services..."

# Create necessary directories
mkdir -p backend/logs
mkdir -p logs

# Set environment variables
export PYTHONPATH=/workspaces/quantum-risk-coach/backend/scripts:$PYTHONPATH
export NODE_ENV=development
export MT5_PATH=/usr/local/lib/python3.*/site-packages/MetaTrader5
export DISPLAY=:99

# Start Xvfb for MetaTrader5 (if not already running)
if ! pgrep -x "Xvfb" > /dev/null; then
    echo "📺 Starting Xvfb..."
    Xvfb :99 -screen 0 1024x768x24 &
    sleep 2
fi

# Install Python dependencies if not already installed
echo "📦 Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt

# Test MetaTrader5 installation
echo "🔧 Testing MetaTrader5 installation..."
python3 -c "
import sys
try:
    import MetaTrader5 as mt5
    print('✓ MetaTrader5 imported successfully')
    if mt5.initialize():
        print('✓ MetaTrader5 initialized successfully')
        mt5.shutdown()
    else:
        print('⚠ MetaTrader5 initialization failed')
except ImportError as e:
    print(f'✗ MetaTrader5 import failed: {e}')
    sys.exit(1)
except Exception as e:
    print(f'⚠ MetaTrader5 test error: {e}')
"

# Start the MT4/MT5 API service
echo "🌐 Starting MT4/MT5 API service..."
python3 mt4mt5_api.py &
MT4MT5_PID=$!

# Wait for MT4/MT5 service to start
sleep 5

# Test the API service
echo "🧪 Testing MT4/MT5 API service..."
curl -s http://localhost:3002/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ MT4/MT5 API service is running"
else
    echo "⚠ MT4/MT5 API service may not be ready yet"
fi

# Start the main backend server
echo "🔧 Starting main backend server..."
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test the main backend
echo "🧪 Testing main backend..."
curl -s http://localhost:3001/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Main backend server is running"
else
    echo "⚠ Main backend server may not be ready yet"
fi

# Go back to root directory
cd ..

# Start the frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Test the frontend
echo "🧪 Testing frontend..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Frontend is running"
else
    echo "⚠ Frontend may not be ready yet"
fi

echo ""
echo "🎉 All services started!"
echo ""
echo "📊 Service Status:"
echo "  Frontend:     http://localhost:3000"
echo "  Backend API:  http://localhost:3001"
echo "  MT4/MT5 API:  http://localhost:3002"
echo ""
echo "🔗 Quick Links:"
echo "  MT4/MT5 Health: http://localhost:3002/health"
echo "  Backend Health: http://localhost:3001/health"
echo "  API Docs:      http://localhost:3002/docs"
echo ""
echo "📝 Process IDs:"
echo "  MT4/MT5 API: $MT4MT5_PID"
echo "  Backend:     $BACKEND_PID"
echo "  Frontend:    $FRONTEND_PID"
echo ""
echo "💡 To stop all services, run: pkill -f 'python3\|node\|npm'"
echo ""

# Keep the script running and monitor services
echo "👀 Monitoring services... (Press Ctrl+C to stop)"
trap 'echo "🛑 Stopping services..."; kill $MT4MT5_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

while true; do
    sleep 30
    echo "📊 Service check: $(date)"
    
    # Check MT4/MT5 service
    if curl -s http://localhost:3002/health > /dev/null; then
        echo "  ✓ MT4/MT5 API: Running"
    else
        echo "  ✗ MT4/MT5 API: Not responding"
    fi
    
    # Check backend
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "  ✓ Backend: Running"
    else
        echo "  ✗ Backend: Not responding"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo "  ✓ Frontend: Running"
    else
        echo "  ✗ Frontend: Not responding"
    fi
    
    echo ""
done 