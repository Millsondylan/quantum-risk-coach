import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, TrendingUp, Activity, Database, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { realDataService } from '@/lib/realDataService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Real-time market data from live APIs
const useRealTimeData = () => {
  const [marketData, setMarketData] = useState({
    BTCUSDT: { price: 0, change: 0, source: '', status: 'loading' as 'loading' | 'connected' | 'error' },
    EURUSD: { price: 0, change: 0, source: '', status: 'loading' as 'loading' | 'connected' | 'error' },
    GBPUSD: { price: 0, change: 0, source: '', status: 'loading' as 'loading' | 'connected' | 'error' },
    USDJPY: { price: 0, change: 0, source: '', status: 'loading' as 'loading' | 'connected' | 'error' }
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Check API health first
        const healthCheck = await realDataService.healthCheck();
        const hasWorkingApis = Object.values(healthCheck).some(status => status);
        
        if (!hasWorkingApis) {
          setMarketData(prev => ({
            ...prev,
            BTCUSDT: { ...prev.BTCUSDT, status: 'error' },
            EURUSD: { ...prev.EURUSD, status: 'error' },
            GBPUSD: { ...prev.GBPUSD, status: 'error' },
            USDJPY: { ...prev.USDJPY, status: 'error' }
          }));
          return;
        }

        // Fetch real data from multiple sources
        const [cryptoData, forexData] = await Promise.all([
          realDataService.getCryptoPrices(),
          realDataService.getForexRates()
        ]);

        const updatedData = { ...marketData };

        // Update crypto data
        if (cryptoData.length > 0) {
          const btcData = cryptoData.find(d => d.symbol === 'BTC');
          if (btcData) {
            updatedData.BTCUSDT = {
              price: btcData.current_price,
              change: btcData.price_change_percentage_24h,
              source: 'CoinGecko',
              status: 'connected'
            };
          }
        }

        // Update forex data
        forexData.forEach(data => {
          if (data.target === 'EUR') {
            updatedData.EURUSD = {
              price: data.rate,
              change: data.change_24h || 0,
              source: 'ExchangeRate API',
              status: 'connected'
            };
          } else if (data.target === 'GBP') {
            updatedData.GBPUSD = {
              price: data.rate,
              change: data.change_24h || 0,
              source: 'ExchangeRate API',
              status: 'connected'
            };
          } else if (data.target === 'JPY') {
            updatedData.USDJPY = {
              price: data.rate,
              change: data.change_24h || 0,
              source: 'ExchangeRate API',
              status: 'connected'
            };
          }
        });

        setMarketData(updatedData);
      } catch (error) {
        console.error('Error fetching real market data:', error);
        setMarketData(prev => ({
          ...prev,
          BTCUSDT: { ...prev.BTCUSDT, status: 'error' },
          EURUSD: { ...prev.EURUSD, status: 'error' },
          GBPUSD: { ...prev.GBPUSD, status: 'error' },
          USDJPY: { ...prev.USDJPY, status: 'error' }
        }));
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return marketData;
};

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const marketData = useRealTimeData();
  const [notifications, setNotifications] = useState(3);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check overall API status
    const checkApiStatus = async () => {
      try {
        const healthCheck = await realDataService.healthCheck();
        const workingApis = Object.entries(healthCheck)
          .filter(([_, status]) => status)
          .map(([api, _]) => api);
        
        setAvailableSources(workingApis);
        
        if (workingApis.length > 0) {
          const hasConnectedData = Object.values(marketData).some(data => data.status === 'connected');
          setApiStatus(hasConnectedData ? 'connected' : 'error');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        setApiStatus('error');
      }
    };

    checkApiStatus();
  }, [marketData]);

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/': return 'Overview';
      case '/journal': return 'Journal';
      case '/trade-builder': return 'Trade';
      case '/performance-calendar': return 'Analytics';
      case '/strategy-analyzer': return 'Strategy';
      case '/settings': return 'Settings';
      default: return 'Quantum Risk Coach';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await useRealTimeData();
      setNotifications(3); // Assuming the number of notifications doesn't change on refresh
    } catch (error) {
      console.error('Error refreshing market data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const MarketTicker = ({ symbol, data }: { symbol: string; data: { price: number; change: number; source: string; status: string } }) => (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
      <span className="text-xs font-medium text-slate-300">{symbol}</span>
      <span className="text-sm font-semibold text-white">
        {symbol === 'BTC' ? `$${data.price.toFixed(0)}` : data.price.toFixed(4)}
      </span>
      <span className={`text-xs font-medium ${data.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
      </span>
      {data.status === 'connected' && (
        <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
      )}
    </div>
  );

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusBg = () => {
    switch (apiStatus) {
      case 'connected': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected': return 'LIVE DATA';
      case 'error': return 'API ERROR';
      default: return 'CONNECTING';
    }
  };

  return (
    <header className="header sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
      <div className="header-content flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 header-logo">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-white">Quantum Risk Coach</h1>
            </div>
          </Link>
          
          <div className="hidden lg:block text-slate-400 text-sm">
            {getPageTitle()}
          </div>
        </div>

        {/* Market Data Tickers - Desktop */}
        <div className="hidden xl:flex items-center gap-3">
          <Badge variant="outline" className={`px-2 py-1 text-xs border ${getStatusBg()} ${getStatusColor()}`}>
            <Database className="w-3 h-3 mr-1" />
            {getStatusText()}
          </Badge>
          
          <div className="flex items-center gap-2">
            <MarketTicker symbol="BTC" data={marketData.BTCUSDT} />
            <MarketTicker symbol="EUR/USD" data={marketData.EURUSD} />
            <MarketTicker symbol="GBP/USD" data={marketData.GBPUSD} />
            <MarketTicker symbol="USD/JPY" data={marketData.USDJPY} />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-10 w-10 p-0 text-slate-400 hover:text-white touch-manipulation active:scale-95 transition-all duration-150"
            aria-label="Refresh market data"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-slate-400 hover:text-white touch-manipulation active:scale-95 transition-all duration-150"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-slate-400 hover:text-white touch-manipulation active:scale-95 transition-all duration-150"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-slate-700 text-white text-xs">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer touch-manipulation"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer touch-manipulation"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Market Data */}
        <div className="xl:hidden fixed bottom-20 left-4 right-4 z-40">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className={`px-2 py-1 text-xs border ${getStatusBg()} ${getStatusColor()}`}>
                <Database className="w-3 h-3 mr-1" />
                {getStatusText()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <MarketTicker symbol="BTC" data={marketData.BTCUSDT} />
              <MarketTicker symbol="EUR/USD" data={marketData.EURUSD} />
              <MarketTicker symbol="GBP/USD" data={marketData.GBPUSD} />
              <MarketTicker symbol="USD/JPY" data={marketData.USDJPY} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
