import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { realDataService } from '@/lib/realDataService';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'crypto' | 'forex' | 'commodity' | 'stock';
}

const PriceTicker = () => {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Default ticker items
  const defaultTickers: Partial<TickerItem>[] = [
    { symbol: 'BTC/USDT', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH/USDT', name: 'Ethereum', type: 'crypto' },
    { symbol: 'EUR/USD', name: 'Euro/Dollar', type: 'forex' },
    { symbol: 'GBP/USD', name: 'Pound/Dollar', type: 'forex' },
    { symbol: 'USD/JPY', name: 'Dollar/Yen', type: 'forex' },
    { symbol: 'GOLD', name: 'Gold', type: 'commodity' },
    { symbol: 'OIL', name: 'Crude Oil', type: 'commodity' },
    { symbol: 'SPX', name: 'S&P 500', type: 'stock' },
  ];

  // Fetch real-time data
  const fetchTickerData = async () => {
    try {
      // Fetch data from multiple sources in parallel
      const [cryptoData, forexData] = await Promise.allSettled([
        realDataService.getCryptoPrices(),
        realDataService.getForexRates()
      ]);

      const updatedTickers: TickerItem[] = [];

      // Process crypto data
      if (cryptoData.status === 'fulfilled' && cryptoData.value) {
        const btc = cryptoData.value.find(c => c.symbol === 'BTC');
        const eth = cryptoData.value.find(c => c.symbol === 'ETH');

        if (btc) {
          updatedTickers.push({
            symbol: 'BTC/USDT',
            name: 'Bitcoin',
            price: btc.current_price,
            change: btc.price_change_24h || 0,
            changePercent: btc.price_change_percentage_24h || 0,
            type: 'crypto'
          });
        }

        if (eth) {
          updatedTickers.push({
            symbol: 'ETH/USDT',
            name: 'Ethereum',
            price: eth.current_price,
            change: eth.price_change_24h || 0,
            changePercent: eth.price_change_percentage_24h || 0,
            type: 'crypto'
          });
        }
      }

      // Process forex data
      if (forexData.status === 'fulfilled' && forexData.value) {
        const forexPairs = [
          { base: 'USD', target: 'EUR', symbol: 'EUR/USD', name: 'Euro/Dollar' },
          { base: 'USD', target: 'GBP', symbol: 'GBP/USD', name: 'Pound/Dollar' },
          { base: 'USD', target: 'JPY', symbol: 'USD/JPY', name: 'Dollar/Yen' }
        ];

        forexPairs.forEach(pair => {
          const data = forexData.value.find(f => f.base === pair.base && f.target === pair.target);
          if (data) {
            // For forex pairs, we need to calculate the display rate correctly
            let displayRate = data.rate;
            if (pair.symbol === 'EUR/USD' || pair.symbol === 'GBP/USD') {
              // For these pairs, we need the inverse since API gives USD as base
              displayRate = 1 / data.rate;
            }
            
            updatedTickers.push({
              symbol: pair.symbol,
              name: pair.name,
              price: displayRate,
              change: data.change_24h || 0,
              changePercent: data.change_24h ? (data.change_24h / displayRate) * 100 : 0,
              type: 'forex'
            });
          }
        });
      }

      // Add dummy data for commodities (replace with real API later)
      updatedTickers.push(
        {
          symbol: 'GOLD',
          name: 'Gold',
          price: 2045.30,
          change: 12.50,
          changePercent: 0.61,
          type: 'commodity'
        },
        {
          symbol: 'OIL',
          name: 'Crude Oil',
          price: 72.85,
          change: -1.23,
          changePercent: -1.66,
          type: 'commodity'
        }
      );

      setTickerData(updatedTickers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching ticker data:', error);
      // Use default data with zero values on error
      setTickerData(defaultTickers.map(item => ({
        ...item as TickerItem,
        price: 0,
        change: 0,
        changePercent: 0
      })));
      setIsLoading(false);
    }
  };

  // Auto-scroll animation
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker || tickerData.length === 0) return;

    let scrollPosition = 0;
    const scroll = () => {
      if (!ticker) return;
      
      scrollPosition += 0.5;
      if (scrollPosition >= ticker.scrollWidth / 2) {
        scrollPosition = 0;
      }
      ticker.scrollLeft = scrollPosition;
      animationRef.current = requestAnimationFrame(scroll);
    };

    // Start scrolling after a delay
    const timeoutId = setTimeout(() => {
      animationRef.current = requestAnimationFrame(scroll);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [tickerData]);

  // Fetch data on mount and set up refresh interval
  useEffect(() => {
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Format price based on value
  const formatPrice = (price: number, type: string) => {
    if (type === 'crypto') {
      return price.toFixed(2);
    } else if (type === 'forex') {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  };

  // Duplicate items for seamless scrolling
  const displayItems = [...tickerData, ...tickerData];

  return (
    <div className="price-ticker">
      <div 
        ref={tickerRef}
        className="flex items-center overflow-x-auto scrollbar-hide"
        onMouseEnter={() => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        }}
        onMouseLeave={() => {
          if (!tickerRef.current) return;
          const scroll = () => {
            if (!tickerRef.current) return;
            let scrollPosition = tickerRef.current.scrollLeft;
            scrollPosition += 0.5;
            if (scrollPosition >= tickerRef.current.scrollWidth / 2) {
              scrollPosition = 0;
            }
            tickerRef.current.scrollLeft = scrollPosition;
            animationRef.current = requestAnimationFrame(scroll);
          };
          animationRef.current = requestAnimationFrame(scroll);
        }}
      >
        {isLoading ? (
          <div className="flex items-center space-x-6 px-4 h-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                <div className="w-12 h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          displayItems.map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="ticker-item whitespace-nowrap flex-shrink-0"
            >
              <span className="font-medium text-foreground">{item.symbol}</span>
              <span className="font-semibold ml-2">
                {item.type === 'commodity' && item.symbol === 'GOLD' && '$'}
                {item.type === 'commodity' && item.symbol === 'OIL' && '$'}
                {formatPrice(item.price, item.type)}
              </span>
              <span 
                className={`ml-2 flex items-center text-xs font-medium ${
                  item.changePercent >= 0 ? "ticker-positive" : "ticker-negative"
                }`}
              >
                {item.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceTicker; 