import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, TrendingUp, Activity, Database, Menu } from 'lucide-react';
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

// Static market data for display purposes
const useStaticMarketData = () => {
  const [marketData] = useState({
    BTCUSDT: { price: 43250, change: 2.34, source: 'Static', status: 'static' as 'static' },
    EURUSD: { price: 1.0852, change: -0.12, source: 'Static', status: 'static' as 'static' },
    GBPUSD: { price: 1.2634, change: 0.45, source: 'Static', status: 'static' as 'static' },
    USDJPY: { price: 149.85, change: -0.23, source: 'Static', status: 'static' as 'static' }
  });

  return marketData;
};

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const marketData = useStaticMarketData();
  const [notifications, setNotifications] = useState(3);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [availableSources, setAvailableSources] = useState<string[]>([]);

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

  // Hide header for UltraTrader-style mobile interface
  return null;
};

export default Header;
