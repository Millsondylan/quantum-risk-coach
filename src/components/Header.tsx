import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Settings, Bell, User, WifiOff, Menu, LogOut, UserCircle, Home, BookOpen, Trophy, Brain, Target, Zap, ChevronDown, Plus, BarChart3, Tag, Download, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTrades } from '@/hooks/useTrades';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { getPerformanceMetrics } = useTrades();
  const [notificationCount, setNotificationCount] = useState(3);

  const metrics = getPerformanceMetrics();
  const balance = metrics.totalProfit; // Using total profit as balance for demo

  const handleConnectMT4 = () => {
    navigate('/connect-mt4');
  };

  const handleConnectMT5 = () => {
    navigate('/connect-mt5');
  };

  const handleConnectCTrader = () => {
    navigate('/connect-ctrader');
  };

  const handleConnectTradingView = () => {
    navigate('/connect-tradingview');
  };

  const handleSignOut = async () => {
    try {
      await signOut(() => navigate('/auth'));
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/auth');
    }
  };

  const handleProfile = () => {
    navigate('/settings');
  };

  const handleDashboard = () => {
    navigate('/');
  };

  const handleJournal = () => {
    navigate('/journal');
  };

  const handleJournalView = () => {
    navigate('/journal');
  };

  const handleJournalAdd = () => {
    navigate('/journal/add');
  };

  const handleJournalAnalytics = () => {
    navigate('/journal/analytics');
  };

  const handleJournalTags = () => {
    navigate('/journal/tags');
  };

  const handleJournalExport = () => {
    navigate('/journal/export');
  };

  const handleLeaderboard = () => {
    // Navigate to leaderboard section on dashboard
    navigate('/');
    // Scroll to leaderboard after navigation
    setTimeout(() => {
      const leaderboardElement = document.querySelector('[data-section="leaderboard"]');
      if (leaderboardElement) {
        leaderboardElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleAICoach = () => {
    // Navigate to AI coach section on dashboard
    navigate('/');
    // Scroll to AI coach after navigation
    setTimeout(() => {
      const aiCoachElement = document.querySelector('[data-section="ai-coach"]');
      if (aiCoachElement) {
        aiCoachElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleTradeBuilder = () => {
    navigate('/trade-builder');
  };

  const handlePerformanceCalendar = () => {
    navigate('/performance-calendar');
  };

  const handleStrategyAnalyzer = () => {
    navigate('/strategy-analyzer');
  };

  const markNotificationsAsRead = () => {
    setNotificationCount(0);
  };

  return (
    <header className="border-b border-slate-700/50 backdrop-blur-lg bg-slate-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={handleDashboard}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold gradient-text">Quantum Risk Coach</h1>
                <p className="text-xs text-slate-400">Next-Gen Trading Intelligence</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-6">
            {/* Desktop Connection Status */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="text-slate-400">
                Balance: <span className={`font-semibold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {balance ? `$${balance.toFixed(2)}` : '$0.00'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      // @ts-ignore: className is used for styling, BadgeProps may not include it
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500">
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Notifications</h3>
                      {notificationCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markNotificationsAsRead}
                          className="text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <p className="font-medium">London Breakout Alert</p>
                        <p className="text-slate-600">Market conditions match your strategy</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <p className="font-medium">NFP News in 30min</p>
                        <p className="text-slate-600">Prepare your news trading strategy</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <p className="font-medium">Daily Target Reached</p>
                        <p className="text-slate-600">Congratulations! You've hit $500 profit</p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Desktop Navigation Menu */}
              <div className="hidden md:flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      Dashboard
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDashboard}>
                      <Home className="w-4 h-4 mr-2" />
                      Overview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLeaderboard}>
                      <Trophy className="w-4 h-4 mr-2" />
                      Leaderboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAICoach}>
                      <Brain className="w-4 h-4 mr-2" />
                      AI Coach
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      Trading
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleTradeBuilder}>
                      <Target className="w-4 h-4 mr-2" />
                      Trade Builder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePerformanceCalendar}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Performance Calendar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleStrategyAnalyzer}>
                      <Zap className="w-4 h-4 mr-2" />
                      Strategy Analyzer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      Journal
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleJournalView}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Journal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleJournalAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleJournalAnalytics}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleJournalTags}>
                      <Tag className="w-4 h-4 mr-2" />
                      Tags & Categories
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleJournalExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export/Import
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Connections
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={handleConnectMT4}>
                          <WifiOff className="w-4 h-4 mr-2" />
                          Connect MT4
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleConnectMT5}>
                          <WifiOff className="w-4 h-4 mr-2" />
                          Connect MT5
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleConnectCTrader}>
                          <WifiOff className="w-4 h-4 mr-2" />
                          Connect cTrader
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleConnectTradingView}>
                          <WifiOff className="w-4 h-4 mr-2" />
                          Connect TradingView
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-slate-500">Trading Account</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfile}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDashboard}>
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleJournal}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Trading Journal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-white transition-colors md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={handleDashboard}>
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleTradeBuilder}>
                    <Target className="w-4 h-4 mr-2" />
                    Trade Builder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleJournal}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Journal
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <WifiOff className="w-4 h-4 mr-2" />
                      Connections
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={handleConnectMT4}>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Connect MT4
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleConnectMT5}>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Connect MT5
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleConnectCTrader}>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Connect cTrader
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleConnectTradingView}>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Connect TradingView
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={handleProfile}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
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
