import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Trophy, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Zap,
  Star,
  Calendar,
  BarChart3,
  Award,
  Flame,
  PlayCircle,
  ChevronRight,
  Sparkles,
  Gift,
  Shield,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AIStreamService } from '@/lib/aiStreamService';
import { useTrades } from '@/hooks/useTrades';

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'behavioral' | 'performance' | 'risk' | 'psychology' | 'technical';
  progress: number;
  target: number;
  reward: string;
  timeLeft: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp: number;
  status: 'active' | 'completed' | 'almost_complete' | 'failed';
  aiGenerated: boolean;
  insights?: string[];
  category: string;
}

const PersonalChallenges = () => {
  const { trades, getTradeStats } = useTrades();
  const [selectedTab, setSelectedTab] = useState('active');
  const [aiService] = useState(() => new AIStreamService({}));
  const [totalXP, setTotalXP] = useState(2340);
  const [level, setLevel] = useState(12);
  const [badges, setBadges] = useState([
    { name: "First Profit", icon: "💰", earned: true },
    { name: "Week Warrior", icon: "⚡", earned: true },
    { name: "Risk Guardian", icon: "🛡️", earned: true },
    { name: "Patience Master", icon: "🧘", earned: false },
    { name: "News Ninja", icon: "📰", earned: false },
    { name: "Session Expert", icon: "🎯", earned: false }
  ]);

  // Calculate level from XP
  useEffect(() => {
    const newLevel = Math.floor(totalXP / 200) + 1;
    setLevel(newLevel);
  }, [totalXP]);

  // CALCULATE REAL USER CHALLENGES based on actual trading performance
  const challenges = useMemo(() => {
    const stats = getTradeStats();
    const userChallenges: Challenge[] = [];
    
    // Challenge 1: Win Rate Improvement
    if (stats.winRate < 60) {
      userChallenges.push({
        id: 1,
        title: "Improve Win Rate",
        description: `Your current win rate is ${stats.winRate.toFixed(1)}%. Aim for 60%+ by focusing on high-probability setups and avoiding low-quality trades.`,
        type: "performance",
        progress: Math.min(stats.winRate, 60),
        target: 60,
        reward: "Consistency Badge",
        timeLeft: "Ongoing",
        difficulty: "Medium",
        xp: 200,
        status: "active",
        aiGenerated: true,
        insights: [
          `Current win rate: ${stats.winRate.toFixed(1)}%`,
          "Focus on setups with clear entry/exit signals",
          "Avoid trading during low-probability market conditions"
        ],
        category: "Performance Optimization"
      });
    }
    
    // Challenge 2: Trade Frequency
    if (stats.totalTrades < 10) {
      userChallenges.push({
        id: 2,
        title: "Increase Activity",
        description: `You've taken ${stats.totalTrades} trades. Aim for at least 10 trades to build experience and establish trading patterns.`,
        type: "behavioral",
        progress: Math.min(stats.totalTrades * 10, 100),
        target: 100,
        reward: "Active Trader Badge",
        timeLeft: "Ongoing",
        difficulty: "Easy",
        xp: 100,
        status: "active",
        aiGenerated: true,
        insights: [
          `Total trades taken: ${stats.totalTrades}`,
          "Look for 2-3 high-quality setups per week",
          "Focus on major currency pairs for consistency"
        ],
        category: "Behavioral Control"
      });
    }
    
    // Challenge 3: Consistency
    if (stats.totalTrades >= 10 && stats.winRate > 50) {
      userChallenges.push({
        id: 3,
        title: "Maintain Consistency",
        description: `Great start! Maintain your ${stats.winRate.toFixed(1)}% win rate while increasing trade frequency for better results.`,
        type: "psychology",
        progress: Math.min(stats.winRate, 80),
        target: 80,
        reward: "Consistency Master Badge",
        timeLeft: "Ongoing",
        difficulty: "Medium",
        xp: 180,
        status: "active",
        aiGenerated: true,
        insights: [
          `Current win rate: ${stats.winRate.toFixed(1)}%`,
          "Stick to your proven trading strategy",
          "Avoid emotional decisions during losses"
        ],
        category: "Psychology"
      });
    }
    
    // Challenge 4: Max Drawdown Reduction
    if (stats.maxDrawdown > 10) {
      userChallenges.push({
        id: 4,
        title: "Reduce Max Drawdown",
        description: `Your max drawdown is ${stats.maxDrawdown.toFixed(1)}%. Aim to reduce it below 10% by implementing stricter risk management.`, 
        type: "risk",
        progress: Math.min(100 - (stats.maxDrawdown * 5), 100), // Invert for progress
        target: 10,
        reward: "Risk Manager Badge",
        timeLeft: "Ongoing",
        difficulty: "Hard",
        xp: 250,
        status: "active",
        aiGenerated: true,
        insights: [
          `Current max drawdown: ${stats.maxDrawdown.toFixed(1)}%`,
          "Implement fixed stop-loss for every trade",
          "Avoid over-leveraging and large position sizes"
        ],
        category: "Risk Management"
      });
    }

    // Challenge 5: Profit Factor Improvement
    if (stats.profitFactor < 1.5) {
      userChallenges.push({
        id: 5,
        title: "Increase Profit Factor",
        description: `Your profit factor is ${stats.profitFactor.toFixed(2)}. Aim for 1.5+ by improving your trade selection and exit strategies.`, 
        type: "performance",
        progress: Math.min((stats.profitFactor / 1.5) * 100, 100),
        target: 1.5,
        reward: "Profit Maximizer Badge",
        timeLeft: "Ongoing",
        difficulty: "Medium",
        xp: 220,
        status: "active",
        aiGenerated: true,
        insights: [
          `Current profit factor: ${stats.profitFactor.toFixed(2)}`,
          "Let winners run, cut losers short",
          "Review losing trades for common patterns"
        ],
        category: "Performance Optimization"
      });
    }

    // Challenge 6: Daily Trading Goal
    if (stats.tradingDays < 5) {
      userChallenges.push({
        id: 6,
        title: "Consistent Trading Days",
        description: `You have traded on ${stats.tradingDays} days this month. Aim for at least 5 trading days per month to build consistency.`, 
        type: "behavioral",
        progress: Math.min((stats.tradingDays / 5) * 100, 100),
        target: 5,
        reward: "Daily Streak Badge",
        timeLeft: "Monthly",
        difficulty: "Easy",
        xp: 120,
        status: "active",
        aiGenerated: true,
        insights: [
          `Trading days this month: ${stats.tradingDays}`,
          "Dedicate specific hours each day for trading analysis",
          "Use a trading plan to guide your daily actions"
        ],
        category: "Behavioral Control"
      });
    }
    
    return userChallenges;
  }, [getTradeStats]);

  // Generate new AI challenges based on trading performance
  const generateAIChallenge = async () => {
    try {
      console.log('AI challenge generation is a future feature, not yet implemented.');
      toast.info('AI challenge generation is coming soon!');
    } catch (error) {
      console.error('Failed to generate AI challenge:', error);
      toast.error('Failed to generate AI challenge');
    }
  };

  const completeChallenge = (challengeId: number) => {
    toast.success('Challenge completed! XP awarded.');
    // In a real app, this would update the database
  };

  const startChallenge = (challengeId: number) => {
    toast.info('Challenge started!');
    // In a real app, this would update the database
  };

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'almost_complete': return 'bg-yellow-500';
      case 'active': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'behavioral': return <Brain className="w-4 h-4" />;
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'risk': return <Shield className="w-4 h-4" />;
      case 'psychology': return <Eye className="w-4 h-4" />;
      case 'technical': return <Target className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (selectedTab === 'active') return challenge.status === 'active' || challenge.status === 'almost_complete';
    if (selectedTab === 'completed') return challenge.status === 'completed';
    if (selectedTab === 'all') return true;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="challenges-section">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Total XP</p>
                <p className="text-2xl font-bold text-white">{totalXP.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-2xl font-bold text-white">{level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Badges</p>
                <p className="text-2xl font-bold text-white badge-count">{badges.filter(b => b.earned).length}/{badges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">{challenges.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            <span>Achievement Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border transition-all duration-200 badge",
                  badge.earned 
                    ? "bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-yellow-400/30" 
                    : "bg-gray-800/50 border-gray-700/50 opacity-50"
                )}
                data-testid={`badge-${index}`}
                data-earned={badge.earned}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <p className={cn(
                  "text-xs text-center font-medium",
                  badge.earned ? "text-yellow-400" : "text-gray-500"
                )}>
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-auto grid-cols-3 bg-black/50">
            <TabsTrigger value="active" className="data-[state=active]:bg-blue-600">
              Active ({challenges.filter(c => c.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-600">
              Completed ({challenges.filter(c => c.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All ({challenges.length})
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={generateAIChallenge}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Challenge
          </Button>
        </div>

        <TabsContent value="active" className="space-y-4">
          {filteredChallenges.length === 0 ? (
            <Card className="holo-card">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Active Challenges</h3>
                <p className="text-gray-400 mb-4">Great job! You've completed all your current challenges.</p>
                <Button onClick={generateAIChallenge} className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Challenge
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredChallenges.map((challenge) => (
              <Card key={challenge.id} className="holo-card challenge-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        {getTypeIcon(challenge.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{challenge.title}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {challenge.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {challenge.xp} XP
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{challenge.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-2 progress-bar" />
                  </div>

                  {challenge.insights && challenge.insights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">AI Insights</h4>
                      <div className="space-y-1">
                        {challenge.insights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.timeLeft}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span>{challenge.reward}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => startChallenge(challenge.id)}
                        variant="outline"
                        size="sm"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                      <Button
                        onClick={() => completeChallenge(challenge.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {challenges.filter(c => c.status === 'completed').length === 0 ? (
            <Card className="holo-card">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Completed Challenges</h3>
                <p className="text-gray-400">Complete your first challenge to see it here!</p>
              </CardContent>
            </Card>
          ) : (
            challenges
              .filter(c => c.status === 'completed')
              .map((challenge) => (
                <Card key={challenge.id} className="holo-card bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <div>
                          <h4 className="font-medium text-white">{challenge.title}</h4>
                          <p className="text-sm text-gray-400">Completed • {challenge.xp} XP earned</p>
                        </div>
                      </div>
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="holo-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      getStatusColor(challenge.status)
                    )} />
                    <div>
                      <h4 className="font-medium text-white">{challenge.title}</h4>
                      <p className="text-sm text-gray-400">{challenge.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-400">{challenge.xp} XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalChallenges; 