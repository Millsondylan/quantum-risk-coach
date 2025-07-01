import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Crown, Star, Target, Award, Medal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  maxDrawdown: number;
  followers: number;
  strategy: string;
  experience: string;
  badges: string[];
  isOnline: boolean;
}

const Leaderboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [traders, setTraders] = useState<Trader[]>([]);

  // Generate simulated trader data
  const generateTraders = (): Trader[] => {
    const names = [
      'Alex Thompson', 'Sarah Chen', 'Marcus Rodriguez', 'Emma Wilson', 'David Kim',
      'Lisa Anderson', 'James Miller', 'Maria Garcia', 'Robert Johnson', 'Jennifer Lee'
    ];
    
    const strategies = ['Scalping', 'Swing Trading', 'Day Trading', 'Position Trading', 'News Trading'];
    const experiences = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
    const badges = ['Top Performer', 'Consistent', 'Risk Manager', 'High Volume', 'Innovator'];

    return names.map((name, index) => {
      const totalPnL = (Math.random() * 50000 - 10000) * (selectedTimeframe === 'monthly' ? 1 : selectedTimeframe === 'weekly' ? 0.25 : 4);
      const winRate = Math.floor(Math.random() * 40) + 50; // 50-90%
      const totalTrades = Math.floor(Math.random() * 200) + 50;
      const profitFactor = Math.random() * 3 + 0.5; // 0.5-3.5
      const maxDrawdown = -(Math.random() * 20 + 5); // -5% to -25%
      const followers = Math.floor(Math.random() * 1000) + 10;
      
      return {
        id: `trader-${index}`,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        rank: index + 1,
        totalPnL,
        winRate,
        totalTrades,
        profitFactor,
        maxDrawdown,
        followers,
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        experience: experiences[Math.floor(Math.random() * experiences.length)],
        badges: badges.slice(0, Math.floor(Math.random() * 3) + 1),
        isOnline: Math.random() > 0.7
      };
    }).sort((a, b) => b.totalPnL - a.totalPnL);
  };

  useEffect(() => {
    setTraders(generateTraders());
  }, [selectedTimeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-slate-400">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default: return 'bg-slate-700/30 border-slate-600/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const timeframes = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'quarterly', label: 'This Quarter' },
    { value: 'yearly', label: 'This Year' }
  ];

  const categories = [
    { value: 'all', label: 'All Traders' },
    { value: 'scalping', label: 'Scalping' },
    { value: 'swing', label: 'Swing Trading' },
    { value: 'day', label: 'Day Trading' },
    { value: 'position', label: 'Position Trading' }
  ];

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Trading Leaderboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">{traders.length} traders</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map(timeframe => (
                <SelectItem key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-slate-400" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm">
          <Star className="w-4 h-4 mr-2" />
          My Ranking
        </Button>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {traders.slice(0, 3).map((trader, index) => (
          <div
            key={trader.id}
            className={`p-4 rounded-lg border ${getRankColor(trader.rank)} relative`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={trader.avatar} />
                  <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{trader.name}</h3>
                  <p className="text-sm text-slate-400">{trader.strategy}</p>
                </div>
              </div>
              <div className="text-right">
                {getRankIcon(trader.rank)}
                <div className={`text-lg font-bold ${trader.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(trader.totalPnL)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Win Rate:</span>
                <span className="text-white ml-1">{trader.winRate}%</span>
              </div>
              <div>
                <span className="text-slate-400">Trades:</span>
                <span className="text-white ml-1">{trader.totalTrades}</span>
              </div>
            </div>

            {trader.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {trader.badges.map((badge, badgeIndex) => (
                  <Badge key={badgeIndex} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {traders.slice(3).map((trader) => (
          <div
            key={trader.id}
            className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-slate-400 w-8">{trader.rank}</span>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={trader.avatar} />
                    <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <h3 className="font-medium text-white">{trader.name}</h3>
                    <p className="text-sm text-slate-400">{trader.strategy} • {trader.experience}</p>
                    {trader.isOnline && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className={`font-semibold ${trader.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(trader.totalPnL)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {trader.winRate}% WR • {trader.totalTrades} trades
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-white">
                    PF: {trader.profitFactor.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    DD: {trader.maxDrawdown.toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Star className="w-4 h-4 mr-1" />
                    Follow
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    {trader.followers}
                  </Badge>
                </div>
              </div>
            </div>

            {trader.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {trader.badges.map((badge, badgeIndex) => (
                  <Badge key={badgeIndex} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leaderboard Stats */}
      <div className="mt-6 pt-4 border-t border-slate-600/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(traders[0]?.totalPnL || 0)}
            </div>
            <div className="text-sm text-slate-400">Top Performer</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(traders.reduce((sum, t) => sum + t.winRate, 0) / traders.length)}%
            </div>
            <div className="text-sm text-slate-400">Avg Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {traders.reduce((sum, t) => sum + t.totalTrades, 0)}
            </div>
            <div className="text-sm text-slate-400">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {traders.filter(t => t.isOnline).length}
            </div>
            <div className="text-sm text-slate-400">Online Now</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 