import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Crown, Star, Target, Award, Medal, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  isRealData: boolean;
}

const Leaderboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataMode, setDataMode] = useState<'simulated' | 'real'>('simulated');

  const timeframes = ['weekly', 'monthly', 'quarterly', 'yearly'];
  const categories = ['all', 'forex', 'crypto', 'stocks', 'futures'];

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedTimeframe, selectedCategory, dataMode]);

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    try {
      if (dataMode === 'real') {
        // TODO: Integrate with real trading community API
        // For now, we'll show simulated data with clear indication
        toast.info('Real community data integration coming soon');
        setDataMode('simulated');
      }
      
      const simulatedTraders = generateSimulatedTraders();
      setTraders(simulatedTraders);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimulatedTraders = (): Trader[] => {
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
        isOnline: Math.random() > 0.7,
        isRealData: false
      };
    }).sort((a, b) => b.totalPnL - a.totalPnL);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Star className="h-5 w-5 text-orange-400" />;
    return null;
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Top Performer': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Consistent': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Risk Manager': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'High Volume': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'Innovator': return 'text-pink-400 bg-pink-500/20 border-pink-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const filteredTraders = traders.filter(trader => {
    if (selectedCategory === 'all') return true;
    // In a real implementation, you'd filter by actual trading categories
    return true;
  });

  return (
    <Card className="holo-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Trading Leaderboard</CardTitle>
            <CardDescription className="text-slate-400">
              Top performing traders in the community
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-orange-400 border-orange-400/30">
              <Info className="h-3 w-3 mr-1" />
              Simulated Data
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadLeaderboardData}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Data Mode Notice */}
          <div className="p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="font-medium text-white">Simulated Data</span>
            </div>
            <p className="text-sm text-slate-300">
              This leaderboard currently shows simulated trader data for demonstration purposes. 
              Real community data integration is planned for future updates.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-slate-300">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {timeframes.map(timeframe => (
                  <SelectItem key={timeframe} value={timeframe} className="text-slate-300">
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-slate-300">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="text-slate-300">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            {filteredTraders.map((trader) => (
              <div
                key={trader.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(trader.rank)}
                      <span className="text-lg font-bold text-white">#{trader.rank}</span>
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trader.avatar} alt={trader.name} />
                      <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white">{trader.name}</h4>
                        <div className={`w-2 h-2 rounded-full ${trader.isOnline ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <span>{trader.strategy}</span>
                        <span>•</span>
                        <span>{trader.experience}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${trader.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(trader.totalPnL)}
                      </p>
                      <p className="text-sm text-slate-400">Total P&L</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{trader.winRate}%</p>
                      <p className="text-sm text-slate-400">Win Rate</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{trader.totalTrades}</p>
                      <p className="text-sm text-slate-400">Trades</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{trader.followers}</p>
                      <p className="text-sm text-slate-400">Followers</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center space-x-2 mt-3">
                  {trader.badges.map((badge, index) => (
                    <Badge key={index} className={getBadgeColor(badge)}>
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Showing {filteredTraders.length} traders</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard; 