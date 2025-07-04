import React from 'react';
import { FlagIcon } from 'react-flag-kit';

const watchlistData = [
  { symbol: 'GBPUSD', flag: 'GB', price: '1.3628', change: '-0.86%' },
  { symbol: 'USDCAD', flag: 'CA', price: '1.3584', change: '-0.40%' },
  { symbol: 'EURUSD', flag: 'EU', price: '1.1797', change: '-0.04%' },
  { symbol: 'USDCHF', flag: 'CH', price: '0.79162', change: '-0.02%' },
  { symbol: 'USDJPY', flag: 'JP', price: '143.6640', change: '0.06%', positive: true },
  { symbol: 'AUDUSD', flag: 'AU', price: '0.65867', change: '0.09%', positive: true },
];

const WatchlistTab = () => {
  return (
    <div className="p-4">
      <ul className="space-y-4">
        {watchlistData.map((item) => (
          <li key={item.symbol} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FlagIcon code={item.flag as any} size={32} />
              <span className="font-semibold">{item.symbol}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold">{item.price}</p>
              <p className={`text-sm ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                {item.change}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WatchlistTab; 