import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, TrendingUp, Activity } from 'lucide-react';
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

// Real-time market data (simplified for demo)
const useRealTimeData = () => {
  const [marketData, setMarketData] = useState({
    BTCUSDT: { price: 0, change: 0 },
    EURUSD: { price: 0, change: 0 },
    GBPUSD: { price: 0, change: 0 },
    USDJPY: { price: 0, change: 0 }
  });

  useEffect(() => {
    // Simulate real-time data updates
    const updateData = () => {
      setMarketData({
        BTCUSDT: { 
          price: 43000 + Math.random() * 2000, 
          change: (Math.random() - 0.5) * 5 
        },
        EURUSD: { 
          price: 1.0850 + Math.random() * 0.01, 
          change: (Math.random() - 0.5) * 0.5 
        },
        GBPUSD: { 
          price: 1.2650 + Math.random() * 0.01, 
          change: (Math.random() - 0.5) * 0.5 
        },
        USDJPY: { 
          price: 148.50 + Math.random() * 2, 
          change: (Math.random() - 0.5) * 1 
        }
      });
    };

    updateData();
    const interval = setInterval(updateData, 5000); // Update every 5 seconds

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

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/': return 'Dashboard';
      case '/journal': return 'Trading Journal';
      case '/trade-builder': return 'Trade Builder';
      case '/performance-calendar': return 'Performance';
      case '/strategy-analyzer': return 'Strategy Analyzer';
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

  const MarketTicker = ({ symbol, data }: { symbol: string; data: { price: number; change: number } }) => (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
      <span className="text-xs font-medium text-slate-300">{symbol}</span>
      <span className="text-sm font-semibold text-white">
        {symbol === 'BTCUSDT' ? `$${data.price.toFixed(0)}` : data.price.toFixed(4)}
      </span>
      <span className={`text-xs font-medium ${data.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
      </span>
    </div>
  );

  return (
    <header className="header sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
      <div className="header-content flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 header-logo">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Quantum Risk Coach
            </span>
          </Link>
          
          {/* Page Title */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
            <h1 className="text-lg font-semibold text-slate-200">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Market Ticker - Hidden on small screens */}
        <div className="hidden lg:flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <MarketTicker symbol="BTC" data={marketData.BTCUSDT} />
          <MarketTicker symbol="EUR/USD" data={marketData.EURUSD} />
          <MarketTicker symbol="GBP/USD" data={marketData.GBPUSD} />
          <MarketTicker symbol="USD/JPY" data={marketData.USDJPY} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Live Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-400">LIVE</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" onClick={() => setNotifications(0)}>
            <Bell className="w-5 h-5 text-slate-400" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Activity Monitor */}
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Activity className="w-5 h-5 text-slate-400" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-900/95 backdrop-blur-xl border-slate-700/50" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none text-slate-200">{user?.email}</p>
                <p className="text-xs leading-none text-slate-400">Professional Trader</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-700/50" />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/journal" className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700/50" />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Market Ticker */}
      <div className="lg:hidden border-t border-slate-700/50 bg-slate-900/50 px-4 py-2">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <MarketTicker symbol="BTC" data={marketData.BTCUSDT} />
          <MarketTicker symbol="EUR/USD" data={marketData.EURUSD} />
          <MarketTicker symbol="GBP/USD" data={marketData.GBPUSD} />
          <MarketTicker symbol="USD/JPY" data={marketData.USDJPY} />
        </div>
      </div>
    </header>
  );
};

export default Header;
