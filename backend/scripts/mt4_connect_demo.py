#!/usr/bin/env python3
"""
MT4 Connection Demo Script for Quantum Risk Coach Backend
Demo version that works without MetaTrader5 for testing
"""

import argparse
import json
import sys
from datetime import datetime

def connect_to_mt4_demo(server, login, password, sandbox=False):
    """
    Demo MT4 connection that simulates successful connection
    """
    try:
        # Simulate connection delay
        import time
        time.sleep(1)
        
        # Demo account data
        account_data = {
            "balance": 10000.00,
            "equity": 10050.25,
            "margin": 500.00,
            "freeMargin": 9550.25,
            "profit": 50.25,
            "currency": "USD",
            "server": server,
            "login": int(login),
            "connected": True,
            "timestamp": datetime.now().isoformat(),
            "demo": True
        }

        return {
            "success": True,
            "data": account_data
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    parser = argparse.ArgumentParser(description='Demo MT4 connection')
    parser.add_argument('--server', required=True, help='MT4 server address')
    parser.add_argument('--login', required=True, help='Account login')
    parser.add_argument('--password', required=True, help='Account password')
    parser.add_argument('--sandbox', default='false', help='Use sandbox environment')

    args = parser.parse_args()

    # Attempt connection
    result = connect_to_mt4_demo(args.server, args.login, args.password, args.sandbox.lower() == 'true')

    # Output JSON result
    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main() 