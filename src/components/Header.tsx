
import React from 'react';
import { TrendingUp, Settings, Bell, User, Wifi, WifiOff } from 'lucide-react';

const Header = () => {
  // In a real implementation, this would come from your trading platform connection status
  const isConnected = false;
  const balance = null;

  return (
    <header className="border-b border-slate-700/50 backdrop-blur-lg bg-slate-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">TradeMind AI</h1>
                <p className="text-xs text-slate-400">Next-Gen Trading Intelligence</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400">MT5 Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Disconnected</span>
                  </>
                )}
              </div>
              <div className="text-slate-400">
                Balance: <span className="text-slate-400 font-semibold">
                  {balance ? `$${balance.toFixed(2)}` : '--'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
