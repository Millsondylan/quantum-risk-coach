#!/usr/bin/env python3
"""
MT4 Positions Script for Quantum Risk Coach Backend
Retrieves open positions from MetaTrader 4
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

def get_mt4_positions(server, login, password):
    """
    Get open positions from MT4
    """
    try:
        # Initialize MT5 (works with MT4 as well)
        if not mt5.initialize():
            return {
                "success": False,
                "error": "Failed to initialize MetaTrader"
            }

        # Get open positions
        positions = mt5.positions_get()
        if positions is None:
            return {
                "success": True,
                "data": []
            }

        # Format positions data
        positions_data = []
        for position in positions:
            position_data = {
                "ticket": int(position.ticket),
                "symbol": position.symbol,
                "type": "buy" if position.type == 0 else "sell",
                "volume": float(position.volume),
                "priceOpen": float(position.price_open),
                "priceCurrent": float(position.price_current),
                "profit": float(position.profit),
                "swap": float(position.swap),
                "time": int(position.time),
                "magic": int(position.magic),
                "comment": position.comment,
                "stopLoss": float(position.sl) if position.sl > 0 else None,
                "takeProfit": float(position.tp) if position.tp > 0 else None
            }
            positions_data.append(position_data)

        return {
            "success": True,
            "data": positions_data,
            "count": len(positions_data),
            "timestamp": datetime.now().isoformat()
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
    parser = argparse.ArgumentParser(description='Get MT4 open positions')
    parser.add_argument('--server', required=True, help='MT4 server address')
    parser.add_argument('--login', required=True, help='Account login')
    parser.add_argument('--password', required=True, help='Account password')

    args = parser.parse_args()

    # Get positions
    result = get_mt4_positions(args.server, args.login, args.password)

    # Output JSON result
    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main() 