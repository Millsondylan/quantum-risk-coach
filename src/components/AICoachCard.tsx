import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Lightbulb, AlertTriangle, TrendingUp, TrendingDown, Target, Clock, Zap, BookOpen, Trophy, MessageCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { aiService } from '@/lib/api';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';

interface TradingInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

interface PerformanceTime {
  time: string;
  profit: number;
  winRate: number;
  trades: number;
}

const AICoachCard = () => {
  const navigate = useNavigate();
  const { trades, getPerformanceMetrics } = useTrades();
  const [isConnected, setIsConnected] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<TradingInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<any>(null);

  // Simulated data
  const strengths: TradingInsight[] = [
    {
      type: 'strength',
      title: 'Excellent Risk Management',
      description: 'Your position sizing and stop-loss placement show strong discipline',
      impact: 'high',
      category: 'Risk Management'
    },
    {
      type: 'strength',
      title: 'Strong Trend Following',
      description: 'You excel at identifying and riding market trends',
      impact: 'high',
      category: 'Strategy'
    }
  ];

  const weaknesses: TradingInsight[] = [
    {
      type: 'weakness',
      title: 'Overtrading During News',
      description: 'You tend to enter too many positions during high-impact news events',
      impact: 'medium',
      category: 'Psychology'
    },
    {
      type: 'weakness',
      title: 'Poor Time Management',
      description: 'Your worst performance occurs during London session overlap',
      impact: 'medium',
      category: 'Timing'
    }
  ];

  const bestTimes: PerformanceTime[] = [
    { time: '08:00-12:00 GMT', profit: 1250, winRate: 78, trades: 45 },
    { time: '14:00-18:00 GMT', profit: 890, winRate: 72, trades: 32 },
    { time: '20:00-24:00 GMT', profit: 650, winRate: 68, trades: 28 }
  ];

  const worstTimes: PerformanceTime[] = [
    { time: '12:00-14:00 GMT', profit: -320, winRate: 45, trades: 18 },
    { time: '00:00-04:00 GMT', profit: -180, winRate: 52, trades: 12 }
  ];

  const personalizedChallenges = [
    {
      title: 'News Trading Challenge',
      description: 'Practice staying out of the market 30 minutes before and after major news releases',
      duration: '7 days',
      reward: 'Improved discipline score'
    },
    {
      title: 'London Session Focus',
      description: 'Focus on trading only during your best performing hours (08:00-12:00 GMT)',
      duration: '5 days',
      reward: 'Better win rate'
    }
  ];

  useEffect(() => {
    // Simulate connection status
    setIsConnected(true);
    
    // Set initial insight
    setCurrentInsight(strengths[0]);
    
    // Get AI insight if API key is available
    if (import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here') {
      getAIInsight();
    }
  }, []);

  const getAIInsight = async () => {
    setIsLoading(true);
    try {
      const mockTradeData = {
        recentTrades: [
          { symbol: 'EURUSD', type: 'BUY', profit: 45, duration: '2h' },
          { symbol: 'GBPUSD', type: 'SELL', profit: -20, duration: '1h' },
          { symbol: 'USDJPY', type: 'BUY', profit: 30, duration: '3h' }
        ],
        winRate: 68,
        avgProfit: 45.2,
        totalTrades: 45
      };

      const mockUserProfile = {
        experience: 'intermediate',
        riskTolerance: 'moderate',
        preferredPairs: ['EURUSD', 'GBPUSD'],
        tradingStyle: 'scalping'
      };

      const insight = await aiService.getTradingInsight(mockTradeData, mockUserProfile);
      if (insight) {
        setAiInsight(insight);
        toast.success("AI insight generated successfully!");
      }
    } catch (error) {
      console.error('Error getting AI insight:', error);
      toast.error("Failed to generate AI insight");
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'weakness': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'opportunity': return <Target className="w-4 h-4 text-blue-400" />;
      case 'threat': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default: return <Lightbulb className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Coach Header */}
      <div className="holo-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Coach</h2>
            <p className="text-sm text-slate-400">Real-time insights & guidance</p>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
            {isConnected ? "Active" : "Inactive"}
          </Badge>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            {/* Current Insight */}
            {currentInsight && (
              <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
                <div className="flex items-center space-x-3 mb-3">
                  {getTypeIcon(currentInsight.type)}
                  <h3 className="font-medium text-white">{currentInsight.title}</h3>
                  <Badge variant="outline" className={getImpactColor(currentInsight.impact)}>
                    {currentInsight.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentInsight.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{currentInsight.category}</span>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Get Advice
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">Win Rate</span>
                </div>
                <p className="text-lg font-semibold text-white">68%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Avg Profit</span>
                </div>
                <p className="text-lg font-semibold text-green-400">$45.20</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-medium text-white">No Active Insights</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect your MT4/5 account to receive personalized trading insights and recommendations.
              </p>
            </div>

            <div 
              onClick={() => navigate('/connect-mt4')}
              className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30 cursor-pointer hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="font-medium text-white">Setup Required</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Enable data synchronization to start receiving AI-powered trading analysis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      {isConnected && (
        <div className="holo-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Your Trading Profile</span>
          </h3>
          
          <div className="space-y-4">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Strengths</span>
              </h4>
              <div className="space-y-2">
                {strengths.map((strength, index) => (
                  <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{strength.title}</span>
                      <Badge variant="outline" className="text-green-400">
                        {strength.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center space-x-2">
                <TrendingDown className="w-4 h-4" />
                <span>Areas for Improvement</span>
              </h4>
              <div className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{weakness.title}</span>
                      <Badge variant="outline" className="text-red-400">
                        {weakness.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">{weakness.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best & Worst Times */}
      {isConnected && (
        <div className="holo-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Performance by Time</span>
          </h3>
          
          <div className="space-y-4">
            {/* Best Times */}
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-3">Best Performing Times</h4>
              <div className="space-y-2">
                {bestTimes.map((time, index) => (
                  <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{time.time}</span>
                      <span className="text-sm text-green-400">+${time.profit}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Win Rate: {time.winRate}%</span>
                      <span>{time.trades} trades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Times */}
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-3">Worst Performing Times</h4>
              <div className="space-y-2">
                {worstTimes.map((time, index) => (
                  <div key={index} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{time.time}</span>
                      <span className="text-sm text-red-400">${time.profit}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Win Rate: {time.winRate}%</span>
                      <span>{time.trades} trades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Challenges */}
      {isConnected && (
        <div className="holo-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Personalized Challenges</span>
          </h3>
          
          <div className="space-y-3">
            {personalizedChallenges.map((challenge, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{challenge.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {challenge.duration}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Reward: {challenge.reward}</span>
                  <Button variant="ghost" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Challenge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoachCard;
