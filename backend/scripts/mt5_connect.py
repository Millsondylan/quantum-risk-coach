#!/usr/bin/env python3
"""
MT5 Connection Script for Quantum Risk Coach Backend
Connects to MetaTrader 5 and retrieves account information
"""

import argparse
import json
import sys
import time
from datetime import datetime
import traceback

try:
    import MetaTrader5 as mt5
except ImportError:
    print("MetaTrader5 module not found. Please install: pip install MetaTrader5", file=sys.stderr)
    sys.exit(1)

def connect_to_mt5(server, login, password, sandbox=False):
    """
    Connect to MT5 terminal and get account information
    """
    try:
        # Initialize MT5
        if not mt5.initialize():
            return {
                "success": False,
                "error": "Failed to initialize MetaTrader 5"
            }

        # Connect to account
        account_info = mt5.account_info()
        if account_info is None:
            return {
                "success": False,
                "error": "Failed to get account info"
            }

        # Get account details
        balance = account_info.balance
        equity = account_info.equity
        margin = account_info.margin
        free_margin = account_info.margin_free
        profit = account_info.profit
        currency = account_info.currency

        # Get server info
        terminal_info = mt5.terminal_info()
        server_name = terminal_info.server if terminal_info else "Unknown"

        # Format response
        account_data = {
            "balance": float(balance),
            "equity": float(equity),
            "margin": float(margin),
            "freeMargin": float(free_margin),
            "profit": float(profit),
            "currency": currency,
            "server": server_name,
            "login": int(account_info.login),
            "connected": True,
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
    parser = argparse.ArgumentParser(description='Connect to MT5 and get account info')
    parser.add_argument('--server', required=True, help='MT5 server address')
    parser.add_argument('--login', required=True, help='Account login')
    parser.add_argument('--password', required=True, help='Account password')
    parser.add_argument('--sandbox', default='false', help='Use sandbox environment')

    args = parser.parse_args()

    # Convert sandbox string to boolean
    sandbox = args.sandbox.lower() == 'true'

    # Attempt connection
    result = connect_to_mt5(args.server, args.login, args.password, sandbox)

    # Output JSON result
    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main() 