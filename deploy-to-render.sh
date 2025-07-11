#!/bin/bash

# Quantum Risk Coach Backend - Render Deployment Guide
echo "🚀 Render Deployment Guide for Quantum Risk Coach Backend"
echo ""

echo "📋 Manual Deployment Steps (Render doesn't have CLI):"
echo ""
echo "1. 🌐 Go to https://render.com and sign up (free)"
echo ""
echo "2. 📦 Click 'New +' → 'Web Service'"
echo ""
echo "3. 🔗 Connect your GitHub repository"
echo ""
echo "4. ⚙️  Configure the service:"
echo "   - Name: quantum-risk-coach-backend"
echo "   - Environment: Node"
echo "   - Build Command: cd backend && npm install"
echo "   - Start Command: cd backend && npm start"
echo ""
echo "5. 🔧 Set Environment Variables:"
echo "   - NODE_ENV=production"
echo "   - FRONTEND_URL=https://your-frontend-url.com"
echo ""
echo "6. 🚀 Click 'Create Web Service'"
echo ""
echo "✅ Your backend will be deployed automatically!"
echo ""
echo "🌐 You'll get a URL like: https://quantum-risk-coach-backend.onrender.com"
echo ""
echo "📝 Update your frontend .env.local with:"
echo "REACT_APP_BACKEND_URL=https://your-render-url.onrender.com"
echo ""
echo "🎉 That's it! Your backend is now live and free!" 