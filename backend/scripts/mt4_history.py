#!/usr/bin/env python3
"""
MT4 History Script for Quantum Risk Coach Backend
Retrieves trade history from MetaTrader 4
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
import traceback

try:
    import MetaTrader5 as mt5
except ImportError:
    print("MetaTrader5 module not found. Please install: pip install MetaTrader5", file=sys.stderr)
    sys.exit(1)

def get_mt4_history(server, login, password, symbol=None, from_date=None, to_date=None, limit=100):
    """
    Get trade history from MT4
    """
    try:
        # Initialize MT5 (works with MT4 as well)
        if not mt5.initialize():
            return {
                "success": False,
                "error": "Failed to initialize MetaTrader"
            }

        # Set date range
        if from_date:
            from_dt = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
        else:
            from_dt = datetime.now() - timedelta(days=30)  # Default to last 30 days

        if to_date:
            to_dt = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
        else:
            to_dt = datetime.now()

        # Get history deals
        deals = mt5.history_deals_get(from_dt, to_dt)
        if deals is None:
            return {
                "success": True,
                "data": []
            }

        # Filter by symbol if specified
        if symbol:
            deals = [deal for deal in deals if deal.symbol == symbol]

        # Limit results
        deals = deals[:limit]

        # Format deals data
        deals_data = []
        for deal in deals:
            deal_data = {
                "ticket": int(deal.ticket),
                "order": int(deal.order),
                "symbol": deal.symbol,
                "type": "buy" if deal.type == 0 else "sell",
                "volume": float(deal.volume),
                "price": float(deal.price),
                "profit": float(deal.profit),
                "swap": float(deal.swap),
                "fee": float(deal.fee),
                "time": int(deal.time),
                "magic": int(deal.magic),
                "comment": deal.comment,
                "externalId": deal.external_id
            }
            deals_data.append(deal_data)

        return {
            "success": True,
            "data": deals_data,
            "count": len(deals_data),
            "from": from_dt.isoformat(),
            "to": to_dt.isoformat(),
            "symbol": symbol,
            "limit": limit,
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
    parser = argparse.ArgumentParser(description='Get MT4 trade history')
    parser.add_argument('--server', required=True, help='MT4 server address')
    parser.add_argument('--login', required=True, help='Account login')
    parser.add_argument('--password', required=True, help='Account password')
    parser.add_argument('--symbol', help='Filter by symbol')
    parser.add_argument('--from', dest='from_date', help='Start date (ISO format)')
    parser.add_argument('--to', dest='to_date', help='End date (ISO format)')
    parser.add_argument('--limit', type=int, default=100, help='Maximum number of trades to return')

    args = parser.parse_args()

    # Get history
    result = get_mt4_history(
        args.server, 
        args.login, 
        args.password, 
        args.symbol, 
        args.from_date, 
        args.to_date, 
        args.limit
    )

    # Output JSON result
    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main() 