#!/bin/bash

# Quantum Risk Coach Backend - Railway Deployment Script
echo "🚀 Deploying Quantum Risk Coach Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Navigate to backend directory
cd backend

# Create new Railway project (if not exists)
echo "🏗️  Creating Railway project..."
railway init --name "quantum-risk-coach-backend"

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-frontend-url.com

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
echo "🔗 Getting deployment URL..."
DEPLOY_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Your backend is now live at: $DEPLOY_URL"
echo ""
echo "📊 Health check: $DEPLOY_URL/health"
echo "🔗 MT4 API: $DEPLOY_URL/api/mt4"
echo "🔗 MT5 API: $DEPLOY_URL/api/mt5"
echo ""
echo "📝 Update your frontend to use: $DEPLOY_URL"
echo ""

# Update frontend configuration
echo "🔄 Updating frontend configuration..."
cd ..
echo "REACT_APP_BACKEND_URL=$DEPLOY_URL" > .env.local

echo "🎉 Setup complete! Your backend is now deployed and ready to use!" 