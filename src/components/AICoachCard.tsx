import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Lightbulb, AlertTriangle, TrendingUp, TrendingDown, Target, Clock, Zap, BookOpen, Trophy, MessageCircle, Loader2, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';
import { createAIStreamService } from '@/lib/aiStreamService';

interface TradingInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  confidence: number;
  timestamp: Date;
  provider?: string;
}

interface AIHealthStatus {
  openai: boolean;
  groq: boolean;
  gemini: boolean;
}

const AICoachCard = () => {
  const navigate = useNavigate();
  const { trades, getPerformanceMetrics } = useTrades();
  const [aiHealth, setAiHealth] = useState<AIHealthStatus>({ openai: false, groq: false, gemini: false });
  const [currentInsight, setCurrentInsight] = useState<TradingInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [aiService] = useState(() => createAIStreamService());

  useEffect(() => {
    checkAIHealth();
    generateRealTimeInsight();
    
    // Update insights every 5 minutes
    const interval = setInterval(generateRealTimeInsight, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAIHealth = async () => {
    try {
      const healthStatus = await aiService.healthCheck();
      setAiHealth({
        openai: healthStatus.openai || false,
        groq: healthStatus.groq || false,
        gemini: healthStatus.gemini || false
      });
    } catch (error) {
      console.error('AI health check failed:', error);
      setAiHealth({ openai: false, groq: false, gemini: false });
    }
  };

  const generateRealTimeInsight = async () => {
    const connectedProviders = Object.values(aiHealth).filter(Boolean).length;
    if (connectedProviders === 0) {
      console.warn('No AI providers available for coaching');
      return;
    }

    setIsLoading(true);
    try {
      const performanceData = getPerformanceMetrics();
      const tradingData = {
        recentTrades: trades.slice(0, 10),
        totalTrades: trades.length,
        winRate: performanceData.winRate,
        totalPnL: performanceData.totalPnL,
        avgTrade: performanceData.avgTrade,
        riskRewardRatio: performanceData.riskRewardRatio,
        maxDrawdown: performanceData.maxDrawdown,
        tradingFrequency: trades.length > 0 ? trades.length / 30 : 0
      };

      const coachingResponse = await aiService.getAICoaching(tradingData);
      
      if (coachingResponse && coachingResponse.content) {
        // Parse the AI response
        const insight = parseCoachingResponse(coachingResponse);
        setCurrentInsight(insight);
        setLastUpdate(new Date());
        toast.success(`AI coaching updated via ${coachingResponse.provider || 'AI'}`);
      }
    } catch (error) {
      console.error('Error generating AI coaching insight:', error);
      toast.error("Failed to get AI coaching insight");
      
      // Fallback to basic insight
      setCurrentInsight({
        type: 'opportunity',
        title: 'AI Coaching Unavailable',
        description: 'Unable to connect to AI services. Check your API keys in settings.',
        impact: 'medium',
        category: 'System',
        confidence: 0,
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseCoachingResponse = (response: any): TradingInsight => {
    const content = response.content || '';
    const provider = response.provider || 'AI';
    
    // Extract key insights from the response
    const lines = content.split('\n').filter((line: string) => line.trim());
    const title = lines.find((line: string) => 
      line.includes('strength') || line.includes('weakness') || 
      line.includes('improve') || line.includes('focus')
    )?.substring(0, 60) || 'Trading Analysis Complete';
    
    // Determine insight type based on content
    let type: 'strength' | 'weakness' | 'opportunity' | 'threat' = 'opportunity';
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('strength') || contentLower.includes('good') || contentLower.includes('excellent')) {
      type = 'strength';
    } else if (contentLower.includes('weakness') || contentLower.includes('poor') || contentLower.includes('improve')) {
      type = 'weakness';
    } else if (contentLower.includes('risk') || contentLower.includes('danger') || contentLower.includes('warning')) {
      type = 'threat';
    }
    
    // Determine impact level
    let impact: 'high' | 'medium' | 'low' = 'medium';
    if (contentLower.includes('critical') || contentLower.includes('urgent') || contentLower.includes('major')) {
      impact = 'high';
    } else if (contentLower.includes('minor') || contentLower.includes('slight')) {
      impact = 'low';
    }
    
    return {
      type,
      title: title.replace(/^\d+\.\s*/, ''), // Remove numbering
      description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      impact,
      category: 'AI Coaching',
      confidence: 85,
      timestamp: new Date(),
      provider
    };
  };

  const testProvider = async (provider: 'openai' | 'groq' | 'gemini') => {
    try {
      const result = await aiService.testProvider(provider);
      if (result.success) {
        toast.success(`${provider.toUpperCase()}: ${result.message} (${result.latency}ms)`);
      } else {
        toast.error(`${provider.toUpperCase()}: ${result.message}`);
      }
      
      // Refresh health status
      await checkAIHealth();
    } catch (error) {
      toast.error(`${provider.toUpperCase()}: Connection failed`);
    }
  };

  const getProviderStatus = () => {
    const connectedCount = Object.values(aiHealth).filter(Boolean).length;
    return {
      count: connectedCount,
      total: 3,
      isConnected: connectedCount > 0
    };
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

  const status = getProviderStatus();

  return (
    <div className="space-y-6">
      {/* AI Coach Header */}
      <div className="holo-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">AI Coach</h2>
            <p className="text-sm text-slate-400">Multi-provider AI coaching system</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={status.isConnected ? "default" : "destructive"}>
              {status.isConnected ? `${status.count}/${status.total} Connected` : "Disconnected"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={generateRealTimeInsight}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isLoading ? 'Analyzing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* AI Provider Status */}
        <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <h3 className="text-sm font-medium text-white mb-3">AI Provider Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center space-x-2">
                {aiHealth.openai ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-sm text-slate-300">OpenAI GPT</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => testProvider('openai')}>
                Test
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center space-x-2">
                {aiHealth.groq ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-sm text-slate-300">Groq Llama</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => testProvider('groq')}>
                Test
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center space-x-2">
                {aiHealth.gemini ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-sm text-slate-300">Gemini Pro</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => testProvider('gemini')}>
                Test
              </Button>
            </div>
          </div>
        </div>

        {status.isConnected ? (
          <div className="space-y-4">
            {/* Current AI Insight */}
            {currentInsight && (
              <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
                <div className="flex items-center space-x-3 mb-3">
                  {getTypeIcon(currentInsight.type)}
                  <h3 className="font-medium text-white">{currentInsight.title}</h3>
                  <Badge variant="outline" className={getImpactColor(currentInsight.impact)}>
                    {currentInsight.impact} impact
                  </Badge>
                  {currentInsight.confidence > 0 && (
                    <Badge variant="outline" className="text-blue-400">
                      {currentInsight.confidence}% confidence
                    </Badge>
                  )}
                  {currentInsight.provider && (
                    <Badge variant="outline" className="text-purple-400">
                      {currentInsight.provider}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  {currentInsight.description}
                </p>
                {lastUpdate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                    <Button variant="ghost" size="sm" onClick={generateRealTimeInsight}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Get More Details
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">Win Rate</span>
                </div>
                <p className="text-lg font-semibold text-white">{getPerformanceMetrics().winRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Total P&L</span>
                </div>
                <p className={`text-lg font-semibold ${getPerformanceMetrics().totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${getPerformanceMetrics().totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="font-medium text-white">AI Services Unavailable</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                No AI providers are currently connected. Please check your API keys in the environment configuration.
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure API Keys
                </Button>
                <Button variant="ghost" size="sm" onClick={checkAIHealth}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICoachCard;
