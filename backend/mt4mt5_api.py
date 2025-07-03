#!/usr/bin/env python3
"""
FastAPI service for MT4/MT5 integration
Provides REST API endpoints for MetaTrader connections
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add scripts directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scripts'))

from mt4mt5_service import mt_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/mt4mt5_api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="MT4/MT5 API Service",
    description="REST API for MetaTrader 4 and 5 integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ConnectionRequest(BaseModel):
    server: str
    login: int
    password: str
    platform: str = "MT5"

class HistoryRequest(BaseModel):
    symbol: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    limit: int = 100

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize MT4/MT5 service on startup"""
    try:
        if mt_service.initialize():
            logger.info("MT4/MT5 service initialized successfully")
        else:
            logger.error("Failed to initialize MT4/MT5 service")
    except Exception as e:
        logger.error(f"Error during startup: {e}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown MT4/MT5 service"""
    try:
        mt_service.shutdown()
        logger.info("MT4/MT5 service shutdown")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "mt4mt5-api",
        "timestamp": datetime.now().isoformat(),
        "mt5_initialized": mt_service.is_initialized
    }

# Connect to MT4/MT5 account
@app.post("/connect")
async def connect_account(request: ConnectionRequest):
    """Connect to MT4/MT5 account"""
    try:
        result = mt_service.connect_account(
            server=request.server,
            login=request.login,
            password=request.password,
            platform=request.platform
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Error connecting to account: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get account information
@app.get("/account/{connection_id}")
async def get_account_info(connection_id: str):
    """Get account information for a connection"""
    try:
        result = mt_service.get_account_info(connection_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=404, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Error getting account info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get open positions
@app.get("/positions/{connection_id}")
async def get_positions(connection_id: str):
    """Get open positions for a connection"""
    try:
        result = mt_service.get_positions(connection_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=404, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Error getting positions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get trade history
@app.post("/history/{connection_id}")
async def get_history(connection_id: str, request: HistoryRequest):
    """Get trade history for a connection"""
    try:
        result = mt_service.get_history(
            connection_id=connection_id,
            symbol=request.symbol,
            from_date=request.from_date,
            to_date=request.to_date,
            limit=request.limit
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=404, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Disconnect from account
@app.post("/disconnect/{connection_id}")
async def disconnect_account(connection_id: str):
    """Disconnect from MT4/MT5 account"""
    try:
        result = mt_service.disconnect(connection_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=404, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Error disconnecting: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all connections
@app.get("/connections")
async def get_connections():
    """Get all active connections"""
    try:
        result = mt_service.get_connections()
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=500, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Error getting connections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Test endpoint
@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify service is running"""
    return {
        "message": "MT4/MT5 API service is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    # Run the FastAPI server
    uvicorn.run(
        "mt4mt5_api:app",
        host="0.0.0.0",
        port=3002,
        reload=True,
        log_level="info"
    ) 