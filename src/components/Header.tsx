
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Settings, Bell, User, WifiOff, Menu, LogOut, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();
  const isConnected = false;
  const balance = null;

  return (
    <header className="border-b border-slate-700/50 backdrop-blur-lg bg-slate-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
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
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Disconnected</span>
              </div>
              <div className="text-slate-400">
                Balance: <span className="text-slate-400 font-semibold">
                  {balance ? `$${balance.toFixed(2)}` : '--'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Notifications</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <p className="font-medium">Connect MT4/5 Account</p>
                        <p className="text-slate-600">Start receiving real-time trading data</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <p className="font-medium">AI Analysis Ready</p>
                        <p className="text-slate-600">Connect your account to unlock insights</p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/auth')}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/connect-mt4')}>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Connect MT4/5
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/auth')}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign In
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors md:hidden">
                    <Menu className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/journal')}>
                    Trading Journal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/connect-mt4')}>
                    Connect MT4/5
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
