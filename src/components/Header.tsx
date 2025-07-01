import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Settings, Bell, User, WifiOff, Menu, LogOut, UserCircle, Home, BookOpen, Trophy, Brain, Target, Zap, ChevronDown, Plus, BarChart3, Tag, Download, Upload, Shield, HelpCircle, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTrades } from '@/hooks/useTrades';
import { useIsMobile } from '../hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Input } from './ui/input';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { getPerformanceMetrics } = useTrades();
  const [notificationCount, setNotificationCount] = useState(3);
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const metrics = getPerformanceMetrics();
  const balance = metrics.totalProfit; // Using total profit as balance for demo

  const handleConnectMT4 = () => {
    navigate('/connect-mt4');
    setIsMenuOpen(false);
  };

  const handleConnectMT5 = () => {
    navigate('/connect-mt5');
    setIsMenuOpen(false);
  };

  const handleConnectCTrader = () => {
    navigate('/connect-ctrader');
    setIsMenuOpen(false);
  };

  const handleConnectTradingView = () => {
    navigate('/connect-tradingview');
    setIsMenuOpen(false);
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
    setIsMenuOpen(false);
  };

  const handleJournal = () => {
    navigate('/journal');
    setIsMenuOpen(false);
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
    navigate('/');
    // Scroll to leaderboard section
    const leaderboardSection = document.querySelector('[data-section="leaderboard"]');
    if (leaderboardSection) {
      leaderboardSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleAICoach = () => {
    navigate('/');
    // Scroll to AI coach section
    const aiCoachSection = document.querySelector('[data-section="ai-coach"]');
    if (aiCoachSection) {
      aiCoachSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleTradeBuilder = () => {
    navigate('/trade-builder');
    setIsMenuOpen(false);
  };

  const handlePerformanceCalendar = () => {
    navigate('/performance-calendar');
    setIsMenuOpen(false);
  };

  const handleStrategyAnalyzer = () => {
    navigate('/strategy-analyzer');
    setIsMenuOpen(false);
  };

  const markNotificationsAsRead = () => {
    setNotificationCount(0);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/75">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">Quantum Risk Coach</span>
              <span className="text-xl font-bold text-white sm:hidden">QRC</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-slate-400" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-slate-900 border-r border-slate-800">
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Mobile Navigation Items */}
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handleDashboard}
                    >
                      <Home className="w-4 h-4 mr-3" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handleTradeBuilder}
                    >
                      <Target className="w-4 h-4 mr-3" />
                      Trade Builder
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handleJournal}
                    >
                      <BookOpen className="w-4 h-4 mr-3" />
                      Journal
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handleAICoach}
                    >
                      <Brain className="w-4 h-4 mr-3" />
                      AI Coach
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handleLeaderboard}
                    >
                      <Trophy className="w-4 h-4 mr-3" />
                      Leaderboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handlePerformanceCalendar}
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Performance
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handleStrategyAnalyzer}
                    >
                      <Zap className="w-4 h-4 mr-3" />
                      Strategy Analyzer
                    </Button>
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Connect</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        onClick={handleConnectMT4}
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        MT4
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        onClick={handleConnectMT5}
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        MT5
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        onClick={handleConnectCTrader}
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        cTrader
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={handleProfile}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search trades, strategies..."
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-300 placeholder:text-slate-400"
                  />
                </div>
              </div>

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
                      Connect
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleConnectMT4}>
                      <Shield className="w-4 h-4 mr-2" />
                      MT4
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleConnectMT5}>
                      <Shield className="w-4 h-4 mr-2" />
                      MT5
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleConnectCTrader}>
                      <Shield className="w-4 h-4 mr-2" />
                      cTrader
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleConnectTradingView}>
                      <Shield className="w-4 h-4 mr-2" />
                      TradingView
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Notifications */}
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-slate-400" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-slate-300 hidden lg:block">{user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfile}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
