#!/usr/bin/env python3
"""
MT5 Account Info Script for Quantum Risk Coach Backend
Retrieves detailed account information from MetaTrader 5
"""

import argparse
import json
import sys
from datetime import datetime
import traceback

try:
    import MetaTrader5 as mt5
except ImportError:
    print("MetaTrader5 module not found. Please install: pip install MetaTrader5", file=sys.stderr)
    sys.exit(1)

def get_mt5_account_info(server, login, password):
    """
    Get detailed account information from MT5
    """
    try:
        # Initialize MT5
        if not mt5.initialize():
            return {
                "success": False,
                "error": "Failed to initialize MetaTrader 5"
            }

        # Get account info
        account_info = mt5.account_info()
        if account_info is None:
            return {
                "success": False,
                "error": "Failed to get account info"
            }

        # Get terminal info
        terminal_info = mt5.terminal_info()
        
        # Get version info
        version_info = mt5.version()

        # Format detailed account data
        account_data = {
            "login": int(account_info.login),
            "balance": float(account_info.balance),
            "equity": float(account_info.equity),
            "margin": float(account_info.margin),
            "freeMargin": float(account_info.margin_free),
            "profit": float(account_info.profit),
            "currency": account_info.currency,
            "leverage": int(account_info.leverage),
            "server": terminal_info.server if terminal_info else "Unknown",
            "terminal": {
                "name": terminal_info.name if terminal_info else "Unknown",
                "path": terminal_info.path if terminal_info else "Unknown",
                "dataPath": terminal_info.data_path if terminal_info else "Unknown",
                "connected": terminal_info.connected if terminal_info else False
            },
            "version": {
                "build": version_info.build if version_info else 0,
                "release": version_info.release if version_info else "Unknown"
            },
            "timestamp": datetime.now().isoformat()
        }

        return {
            "success": True,
            "data": account_data
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
    finally:
        # Shutdown MT5
        mt5.shutdown()

def main():
    parser = argparse.ArgumentParser(description='Get MT5 account information')
    parser.add_argument('--server', required=True, help='MT5 server address')
    parser.add_argument('--login', required=True, help='Account login')
    parser.add_argument('--password', required=True, help='Account password')

    args = parser.parse_args()

    # Get account info
    result = get_mt5_account_info(args.server, args.login, args.password)

    # Output JSON result
    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main() 