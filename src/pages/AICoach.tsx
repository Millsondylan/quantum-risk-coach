import React, { useState, useEffect } from 'react';
import AICoachCard from '@/components/AICoachCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Target, 
  Activity, 
  BarChart3, 
  Award,
  Lightbulb,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  BookOpen,
  Target as TargetIcon,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface CoachingInsight {
  id: string;
  type: 'strength' | 'improvement' | 'warning' | 'tip';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  icon: React.ReactNode;
}

const AICoach = () => {
  const { user } = useUser();
  const { getTradeStats } = useTrades();
  const stats = getTradeStats();
  
  // Calculate additional metrics
  const maxDrawdown = Math.abs(stats.largestLoss || 0);
  const profitFactor = stats.largestWin > 0 && stats.largestLoss > 0 ? stats.largestWin / Math.abs(stats.largestLoss) : 1;
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced coaching metrics with more detailed analysis
  const coachingMetrics = [
    {
      title: 'Trading Performance',
      value: `${stats.winRate.toFixed(1)}%`,
      label: 'Win Rate',
      icon: <TrendingUp className="w-5 h-5" />,
      color: stats.winRate >= 60 ? 'text-green-400' : stats.winRate >= 50 ? 'text-yellow-400' : 'text-red-400',
      trend: stats.winRate >= 60 ? 'up' : 'down',
      description: stats.winRate >= 60 ? 'Excellent performance' : 'Room for improvement'
    },
          {
        title: 'Risk Management',
        value: `${maxDrawdown.toFixed(1)}%`,
        label: 'Max Drawdown',
        icon: <Shield className="w-5 h-5" />,
        color: maxDrawdown <= 10 ? 'text-green-400' : maxDrawdown <= 20 ? 'text-yellow-400' : 'text-red-400',
        trend: maxDrawdown <= 10 ? 'up' : 'down',
        description: maxDrawdown <= 10 ? 'Well controlled risk' : 'Consider reducing position sizes'
      },
          {
        title: 'Profit Factor',
        value: profitFactor.toFixed(2),
        label: 'Risk/Reward',
        icon: <Target className="w-5 h-5" />,
        color: profitFactor >= 1.5 ? 'text-green-400' : profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400',
        trend: profitFactor >= 1.5 ? 'up' : 'down',
        description: profitFactor >= 1.5 ? 'Strong risk/reward ratio' : 'Focus on better entries/exits'
      },
    {
      title: 'Experience Level',
      value: stats.totalTrades.toString(),
      label: 'Total Trades',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-blue-400',
      trend: stats.totalTrades >= 50 ? 'up' : 'neutral',
      description: stats.totalTrades >= 50 ? 'Experienced trader' : 'Building experience'
    }
  ];

  // AI-generated coaching insights
  const coachingInsights: CoachingInsight[] = [
    {
      id: '1',
      type: 'strength',
      title: 'Consistent Risk Management',
      description: 'Your position sizing is well-controlled, showing disciplined risk management.',
      impact: 'high',
      actionItems: ['Continue current risk management approach', 'Document your risk rules'],
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: '2',
      type: 'improvement',
      title: 'Trade Selection',
      description: 'Focus on higher probability setups and avoid low-quality trades.',
      impact: 'medium',
      actionItems: ['Review entry criteria', 'Wait for better setups', 'Reduce FOMO trades'],
      icon: <Target className="w-4 h-4" />
    },
    {
      id: '3',
      type: 'tip',
      title: 'Market Timing',
      description: 'Consider trading during higher volatility periods for better opportunities.',
      impact: 'low',
      actionItems: ['Monitor market sessions', 'Track volatility patterns'],
      icon: <Clock className="w-4 h-4" />
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'border-green-500/20 bg-green-500/10';
      case 'improvement': return 'border-yellow-500/20 bg-yellow-500/10';
      case 'warning': return 'border-red-500/20 bg-red-500/10';
      case 'tip': return 'border-blue-500/20 bg-blue-500/10';
      default: return 'border-slate-500/20 bg-slate-500/10';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-green-400';
      case 'improvement': return 'text-yellow-400';
      case 'warning': return 'text-red-400';
      case 'tip': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const handleAskQuestion = async () => {
    setIsLoading(true);
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('AI response generated! Check the chat below.');
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-24">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                AI Trading Coach
              </h1>
              <p className="text-slate-400 text-sm">
                Personalized insights and recommendations based on your trading performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Powered
              </Badge>
              <Button
                onClick={handleAskQuestion}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {coachingMetrics.map((metric, index) => (
            <Card key={index} className="bg-[#1A1B1E]/50 border-[#2A2B2E] hover:border-[#3A3B3E] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{metric.title}</span>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                  <div className="text-xs text-slate-500">{metric.label}</div>
                  <div className="text-xs text-slate-400">{metric.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#1A1B1E] border border-[#2A2B2E]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-purple-600">
              <TargetIcon className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Coach Card */}
              <div className="lg:col-span-2">
                <AICoachCard />
              </div>

              {/* Performance Breakdown */}
              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-white">{stats.winRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.winRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Profit Factor</span>
                      <span className="text-white">{stats.profitFactor.toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min(stats.profitFactor * 50, 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Risk Management</span>
                      <span className="text-white">{Math.max(100 - Math.abs(stats.maxDrawdown), 0).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.max(100 - Math.abs(stats.maxDrawdown), 0)} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Trading Psychology */}
              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Trading Psychology
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Strengths
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Consistent risk management</li>
                      <li>• Patient trade selection</li>
                      <li>• Good emotional control</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Areas to Improve
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Reduce FOMO trades</li>
                      <li>• Better exit timing</li>
                      <li>• More detailed journaling</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {coachingInsights.map((insight) => (
                <Card key={insight.id} className={`bg-[#1A1B1E]/50 border-[#2A2B2E] ${getInsightColor(insight.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getInsightIconColor(insight.type)}`}>
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-white">{insight.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{insight.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-medium">Action Items:</p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {insight.actionItems.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  AI Trading Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your trading performance, get personalized advice, or discuss strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-blue-400 mt-1" />
                      <div>
                        <p className="text-white font-medium mb-1">AI Assistant</p>
                        <p className="text-slate-300 text-sm">
                          Hello! I'm your AI trading coach. I've analyzed your trading performance and I'm here to help you improve. 
                          What would you like to discuss today?
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start text-left h-auto p-3">
                      <div>
                        <p className="font-medium text-white">How can I improve my win rate?</p>
                        <p className="text-xs text-slate-400">Get personalized advice</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start text-left h-auto p-3">
                      <div>
                        <p className="font-medium text-white">Review my recent trades</p>
                        <p className="text-xs text-slate-400">AI analysis of patterns</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start text-left h-auto p-3">
                      <div>
                        <p className="font-medium text-white">Risk management tips</p>
                        <p className="text-xs text-slate-400">Optimize position sizing</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start text-left h-auto p-3">
                      <div>
                        <p className="font-medium text-white">Psychology coaching</p>
                        <p className="text-xs text-slate-400">Mental game improvement</p>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TargetIcon className="w-5 h-5 text-green-400" />
                    Current Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Win Rate Target</span>
                      <span className="text-white">60%</span>
                    </div>
                    <Progress value={Math.min((stats.winRate / 60) * 100, 100)} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Profit Factor Target</span>
                      <span className="text-white">1.5</span>
                    </div>
                    <Progress value={Math.min((stats.profitFactor / 1.5) * 100, 100)} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Max Drawdown Target</span>
                      <span className="text-white">10%</span>
                    </div>
                    <Progress value={Math.max(100 - (Math.abs(stats.maxDrawdown) / 10) * 100, 0)} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">Week 3</p>
                      <p className="text-slate-400 text-sm">of 12-week improvement plan</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-green-500/10 rounded">
                        <p className="text-green-400 font-medium">+2.3%</p>
                        <p className="text-xs text-slate-400">Win Rate</p>
                      </div>
                      <div className="p-2 bg-blue-500/10 rounded">
                        <p className="text-blue-400 font-medium">+0.2</p>
                        <p className="text-xs text-slate-400">Profit Factor</p>
                      </div>
                      <div className="p-2 bg-purple-500/10 rounded">
                        <p className="text-purple-400 font-medium">-1.5%</p>
                        <p className="text-xs text-slate-400">Drawdown</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AICoach; 