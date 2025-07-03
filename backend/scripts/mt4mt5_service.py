#!/usr/bin/env python3
"""
Enhanced MT4/MT5 Service for Quantum Risk Coach
Provides real-time connection to MetaTrader 4 and 5 terminals
"""

import os
import sys
import json
import time
import logging
import asyncio
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

try:
    import MetaTrader5 as mt5
except ImportError:
    print("MetaTrader5 module not found. Installing...")
    os.system("pip install MetaTrader5")
    import MetaTrader5 as mt5

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/mt4mt5_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class MTAccount:
    login: int
    server: str
    balance: float
    equity: float
    margin: float
    free_margin: float
    profit: float
    currency: str
    leverage: int
    connected: bool
    last_update: str

@dataclass
class MTTrade:
    ticket: int
    symbol: str
    type: str  # 'buy' or 'sell'
    volume: float
    price: float
    profit: float
    swap: float
    fee: float
    time: int
    magic: int
    comment: str
    external_id: str

class MT4MT5Service:
    def __init__(self):
        self.connections: Dict[str, Dict] = {}
        self.is_initialized = False
        self.connection_lock = threading.Lock()
        
    def initialize(self) -> bool:
        """Initialize MetaTrader5 connection"""
        try:
            if not mt5.initialize():
                logger.error("Failed to initialize MetaTrader5")
                return False
                
            self.is_initialized = True
            logger.info("MetaTrader5 initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Error initializing MetaTrader5: {e}")
            return False
    
    def connect_account(self, server: str, login: int, password: str, platform: str = "MT5") -> Dict:
        """Connect to MT4/MT5 account"""
        try:
            if not self.is_initialized:
                if not self.initialize():
                    return {"success": False, "error": "Failed to initialize MetaTrader5"}
            
            connection_id = f"{platform}_{login}_{int(time.time())}"
            
            # Attempt to connect
            if not mt5.login(login=login, password=password, server=server):
                error = mt5.last_error()
                logger.error(f"Login failed: {error}")
                return {"success": False, "error": f"Login failed: {error}"}
            
            # Get account info
            account_info = mt5.account_info()
            if not account_info:
                return {"success": False, "error": "Failed to get account info"}
            
            # Create account object
            account = MTAccount(
                login=account_info.login,
                server=account_info.server,
                balance=float(account_info.balance),
                equity=float(account_info.equity),
                margin=float(account_info.margin),
                free_margin=float(account_info.margin_free),
                profit=float(account_info.profit),
                currency=account_info.currency,
                leverage=int(account_info.leverage),
                connected=True,
                last_update=datetime.now().isoformat()
            )
            
            # Store connection
            with self.connection_lock:
                self.connections[connection_id] = {
                    "account": asdict(account),
                    "server": server,
                    "login": login,
                    "password": password,
                    "platform": platform,
                    "connected_at": datetime.now().isoformat()
                }
            
            logger.info(f"Successfully connected to {platform} account {login}")
            return {
                "success": True,
                "connection_id": connection_id,
                "account": asdict(account)
            }
            
        except Exception as e:
            logger.error(f"Error connecting to account: {e}")
            return {"success": False, "error": str(e)}
    
    def get_account_info(self, connection_id: str) -> Dict:
        """Get current account information"""
        try:
            with self.connection_lock:
                if connection_id not in self.connections:
                    return {"success": False, "error": "Connection not found"}
                
                connection = self.connections[connection_id]
            
            # Get fresh account info
            account_info = mt5.account_info()
            if not account_info:
                return {"success": False, "error": "Failed to get account info"}
            
            # Update account data
            account = MTAccount(
                login=account_info.login,
                server=account_info.server,
                balance=float(account_info.balance),
                equity=float(account_info.equity),
                margin=float(account_info.margin),
                free_margin=float(account_info.margin_free),
                profit=float(account_info.profit),
                currency=account_info.currency,
                leverage=int(account_info.leverage),
                connected=True,
                last_update=datetime.now().isoformat()
            )
            
            # Update stored connection
            with self.connection_lock:
                self.connections[connection_id]["account"] = asdict(account)
            
            return {"success": True, "account": asdict(account)}
            
        except Exception as e:
            logger.error(f"Error getting account info: {e}")
            return {"success": False, "error": str(e)}
    
    def get_positions(self, connection_id: str) -> Dict:
        """Get open positions"""
        try:
            with self.connection_lock:
                if connection_id not in self.connections:
                    return {"success": False, "error": "Connection not found"}
            
            # Get positions
            positions = mt5.positions_get()
            if positions is None:
                return {"success": True, "positions": []}
            
            positions_data = []
            for pos in positions:
                position = MTTrade(
                    ticket=int(pos.ticket),
                    symbol=pos.symbol,
                    type="buy" if pos.type == 0 else "sell",
                    volume=float(pos.volume),
                    price=float(pos.price_open),
                    profit=float(pos.profit),
                    swap=float(pos.swap),
                    fee=0.0,  # MT5 doesn't provide fee directly
                    time=int(pos.time),
                    magic=int(pos.magic),
                    comment=pos.comment,
                    external_id=pos.external_id
                )
                positions_data.append(asdict(position))
            
            return {"success": True, "positions": positions_data}
            
        except Exception as e:
            logger.error(f"Error getting positions: {e}")
            return {"success": False, "error": str(e)}
    
    def get_history(self, connection_id: str, symbol: str = None, 
                   from_date: str = None, to_date: str = None, limit: int = 100) -> Dict:
        """Get trade history"""
        try:
            with self.connection_lock:
                if connection_id not in self.connections:
                    return {"success": False, "error": "Connection not found"}
            
            # Parse dates
            from_dt = datetime.now() - timedelta(days=30) if not from_date else datetime.fromisoformat(from_date)
            to_dt = datetime.now() if not to_date else datetime.fromisoformat(to_date)
            
            # Get deals
            deals = mt5.history_deals_get(from_dt, to_dt, symbol=symbol)
            if deals is None:
                return {"success": True, "trades": []}
            
            # Limit results
            deals = deals[:limit] if limit else deals
            
            trades_data = []
            for deal in deals:
                trade = MTTrade(
                    ticket=int(deal.ticket),
                    symbol=deal.symbol,
                    type="buy" if deal.type == 0 else "sell",
                    volume=float(deal.volume),
                    price=float(deal.price),
                    profit=float(deal.profit),
                    swap=float(deal.swap),
                    fee=float(deal.fee),
                    time=int(deal.time),
                    magic=int(deal.magic),
                    comment=deal.comment,
                    external_id=deal.external_id
                )
                trades_data.append(asdict(trade))
            
            return {
                "success": True,
                "trades": trades_data,
                "count": len(trades_data),
                "from": from_dt.isoformat(),
                "to": to_dt.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting history: {e}")
            return {"success": False, "error": str(e)}
    
    def disconnect(self, connection_id: str) -> Dict:
        """Disconnect from account"""
        try:
            with self.connection_lock:
                if connection_id not in self.connections:
                    return {"success": False, "error": "Connection not found"}
                
                del self.connections[connection_id]
            
            logger.info(f"Disconnected from account {connection_id}")
            return {"success": True, "message": "Disconnected successfully"}
            
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
            return {"success": False, "error": str(e)}
    
    def get_connections(self) -> Dict:
        """Get all active connections"""
        try:
            with self.connection_lock:
                connections = {}
                for conn_id, conn_data in self.connections.items():
                    connections[conn_id] = {
                        "account": conn_data["account"],
                        "server": conn_data["server"],
                        "login": conn_data["login"],
                        "platform": conn_data["platform"],
                        "connected_at": conn_data["connected_at"]
                    }
                
                return {"success": True, "connections": connections}
                
        except Exception as e:
            logger.error(f"Error getting connections: {e}")
            return {"success": False, "error": str(e)}
    
    def shutdown(self):
        """Shutdown the service"""
        try:
            mt5.shutdown()
            logger.info("MetaTrader5 service shutdown")
        except Exception as e:
            logger.error(f"Error shutting down: {e}")

# Global service instance
mt_service = MT4MT5Service()

if __name__ == "__main__":
    # Test the service
    print("MT4/MT5 Service Test")
    print("====================")
    
    # Initialize
    if mt_service.initialize():
        print("✓ MetaTrader5 initialized")
    else:
        print("✗ Failed to initialize MetaTrader5")
        sys.exit(1)
    
    # Test connection (you would provide real credentials)
    print("\nTo test connection, provide credentials:")
    print("server = input('Server: ')")
    print("login = int(input('Login: '))")
    print("password = input('Password: ')")
    
    # Shutdown
    mt_service.shutdown() 