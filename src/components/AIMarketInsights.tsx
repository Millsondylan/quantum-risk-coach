import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap,
  Target,
  Eye,
  Calendar,
  Clock,
  Globe,
  Activity,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Radio,
  Newspaper,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { realDataService } from '@/lib/realDataService';

interface MarketSentiment {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -100 to 100
  confidence: number; // 0 to 100
  volume: number;
  volatility: number;
  momentum: number;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  signals: {
    technical: string[];
    fundamental: string[];
  };
}

interface NewsItem {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
  source: string;
  affectedInstruments: string[];
  summary: string;
}

interface EconomicEvent {
  id: string;
  title: string;
  currency: string;
  importance: 'high' | 'medium' | 'low';
  impact: 'positive' | 'negative' | 'neutral';
  actual?: number;
  forecast?: number;
  previous?: number;
  timestamp: Date;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  instruments: string[];
  action: 'buy' | 'sell' | 'hold' | 'watch';
  riskLevel: 'low' | 'medium' | 'high';
  expiresAt: Date;
}

const AIMarketInsights = () => {
  const [marketSentiments, setMarketSentiments] = useState<MarketSentiment[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const generateMarketData = useCallback(async () => {
    try {
      // Get real market data from APIs
      const [forexData, cryptoData, newsData] = await Promise.allSettled([
        realDataService.getForexRates(),
        realDataService.getCryptoPrices(),
        realDataService.getFinancialNews()
      ]);

      // Process real forex data for sentiment analysis
      const realForexData = forexData.status === 'fulfilled' ? forexData.value : [];
      const sentiments: MarketSentiment[] = realForexData.map(item => {
        // Calculate real sentiment based on price changes
        const changePercent = item.change_24h || 0;
        const score = Math.max(-100, Math.min(100, changePercent * 10)); // Scale to -100 to 100
        const sentiment = score > 20 ? 'bullish' : score < -20 ? 'bearish' : 'neutral';
        
        return {
          symbol: `${item.base}/${item.target}`,
          sentiment,
          score,
          confidence: Math.abs(score) + 40, // Higher confidence for larger moves
          volume: 0, // Not available in ForexRate interface
          volatility: Math.abs(changePercent) * 2,
          momentum: changePercent,
          keyLevels: {
            support: [item.rate * 0.995, item.rate * 0.99],
            resistance: [item.rate * 1.005, item.rate * 1.01]
          },
          signals: {
            technical: changePercent > 0 ? ['Uptrend', 'Momentum'] : ['Downtrend', 'Reversal'],
            fundamental: ['Market Data', 'Price Action']
          }
        };
      });

      // Use real news data if available
      const news: NewsItem[] = newsData.status === 'fulfilled' && newsData.value.length > 0 
        ? newsData.value.slice(0, 3).map((item: any, index: number) => ({
            id: (index + 1).toString(),
            title: item.title || 'Market Update',
            impact: item.impact || 'medium',
            sentiment: 'neutral', // Not available in NewsItem interface
            timestamp: new Date(item.publishedAt || Date.now()),
            source: item.source || 'Market Data',
            affectedInstruments: ['EUR/USD'], // Default since not available in interface
            summary: item.description || 'Market data update'
          }))
        : [];

      // Get real economic events from API
      const events: EconomicEvent[] = []; // Will be populated by real economic calendar API

      // Generate real AI insights based on market data
      const insights: AIInsight[] = [];
      if (realForexData.length > 0) {
        // Create insights based on real market movements
        realForexData.forEach((item, index) => {
          const changePercent = item.change_24h || 0;
          if (Math.abs(changePercent) > 0.5) { // Only create insights for significant moves
            insights.push({
              id: (index + 1).toString(),
              type: changePercent > 0 ? 'opportunity' : 'warning',
              title: `${item.base}/${item.target} ${changePercent > 0 ? 'Bullish' : 'Bearish'} Move`,
              description: `${item.base}/${item.target} showing ${Math.abs(changePercent).toFixed(2)}% ${changePercent > 0 ? 'gain' : 'loss'} in recent trading.`,
              confidence: Math.min(95, Math.abs(changePercent) * 10 + 50),
              timeframe: '1H',
              instruments: [`${item.base}/${item.target}`],
              action: changePercent > 0 ? 'buy' : 'sell',
              riskLevel: Math.abs(changePercent) > 1 ? 'high' : 'medium',
              expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12)
            });
          }
        });
      }

      setMarketSentiments(sentiments);
      setNewsItems(news);
      setEconomicEvents(events);
      setAiInsights(insights);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to generate real market data:', error);
      // Set empty arrays if real data fails
      setMarketSentiments([]);
      setNewsItems([]);
      setEconomicEvents([]);
      setAiInsights([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      generateMarketData();
      setIsLoading(false);
    };

    loadData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(generateMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [generateMarketData]);

  const overallMarketSentiment = useMemo(() => {
    if (marketSentiments.length === 0) return { sentiment: 'neutral', score: 0, strength: 0 };
    
    const avgScore = marketSentiments.reduce((sum, item) => sum + item.score, 0) / marketSentiments.length;
    const sentiment = avgScore > 15 ? 'bullish' : avgScore < -15 ? 'bearish' : 'neutral';
    const strength = Math.abs(avgScore);
    
    return { sentiment, score: avgScore, strength };
  }, [marketSentiments]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'trend': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'correlation': return <Activity className="w-4 h-4 text-purple-400" />;
      default: return <Lightbulb className="w-4 h-4 text-yellow-400" />;
    }
  };

  const handleRefresh = useCallback(() => {
    generateMarketData();
    toast.success('Market data refreshed');
  }, [generateMarketData]);

  if (isLoading) {
    return (
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">AI Market Insights</h2>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-slate-500/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="holo-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">AI Market Insights</h2>
          <Badge variant="outline" className="text-slate-400">
            Live Data
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-xs text-slate-400">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Overall Market Sentiment */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              {getSentimentIcon(overallMarketSentiment.sentiment)}
            </div>
            <div>
              <h3 className="font-medium text-white">Overall Market Sentiment</h3>
              <p className="text-sm text-slate-400">Across major currency pairs</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getSentimentColor(overallMarketSentiment.sentiment)}`}>
              {overallMarketSentiment.sentiment.toUpperCase()}
            </p>
            <p className="text-sm text-slate-400">
              Strength: {overallMarketSentiment.strength.toFixed(0)}/100
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Progress 
            value={overallMarketSentiment.strength} 
            className="h-2"
          />
        </div>
      </div>

      <Tabs defaultValue="sentiment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid gap-3">
            {marketSentiments.map((item) => (
              <div key={item.symbol} className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-white">{item.symbol}</span>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(item.sentiment)}
                      <span className={`text-sm font-medium ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment.toUpperCase()}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.confidence}% confident
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getSentimentColor(item.sentiment)}`}>
                      {item.score > 0 ? '+' : ''}{item.score}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Volume</p>
                    <p className="text-white">{item.volume.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Volatility</p>
                    <p className="text-white">{item.volatility.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Momentum</p>
                    <p className={item.momentum > 0 ? 'text-green-400' : 'text-red-400'}>
                      {item.momentum > 0 ? '+' : ''}{item.momentum.toFixed(1)}
                    </p>
                  </div>
                </div>

                {item.signals.technical.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1">Technical Signals:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.signals.technical.map((signal, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      {getInsightTypeIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{insight.title}</h4>
                      <p className="text-sm text-slate-300 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getImpactColor(insight.riskLevel)}>
                      {insight.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-400">{insight.confidence}% confidence</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400">Timeframe: {insight.timeframe}</span>
                    <span className="text-slate-400">Action: 
                      <span className={`ml-1 font-medium ${
                        insight.action === 'buy' ? 'text-green-400' :
                        insight.action === 'sell' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {insight.action.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insight.instruments.map((instrument, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  Expires: {insight.expiresAt.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <div className="grid gap-3">
            {newsItems.map((news) => (
              <div key={news.id} className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{news.title}</h4>
                    <p className="text-sm text-slate-300">{news.summary}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-4">
                    <Badge className={getImpactColor(news.impact)}>
                      {news.impact.toUpperCase()}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(news.sentiment)}
                      <span className={`text-xs ${getSentimentColor(news.sentiment)}`}>
                        {news.sentiment}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-3">
                    <span>{news.source}</span>
                    <span>{news.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {news.affectedInstruments.map((instrument, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-3">
            {economicEvents.map((event) => (
              <div key={event.id} className="p-4 rounded-lg border border-slate-600/30 bg-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      {event.currency}
                    </Badge>
                    <span className="font-medium text-white">{event.title}</span>
                    <Badge className={getImpactColor(event.importance)}>
                      {event.importance.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400">
                    {event.timestamp.toLocaleString()}
                  </div>
                </div>

                {(event.actual !== undefined || event.forecast !== undefined) && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {event.actual !== undefined && (
                      <div>
                        <p className="text-slate-400">Actual</p>
                        <p className="text-white font-medium">{event.actual}</p>
                      </div>
                    )}
                    {event.forecast !== undefined && (
                      <div>
                        <p className="text-slate-400">Forecast</p>
                        <p className="text-white">{event.forecast}</p>
                      </div>
                    )}
                    {event.previous !== undefined && (
                      <div>
                        <p className="text-slate-400">Previous</p>
                        <p className="text-white">{event.previous}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-slate-600/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-slate-400">High Impact News</p>
            <p className="text-lg font-semibold text-red-400">
              {newsItems.filter(n => n.impact === 'high').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400">Active Insights</p>
            <p className="text-lg font-semibold text-purple-400">
              {aiInsights.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400">Bullish Pairs</p>
            <p className="text-lg font-semibold text-green-400">
              {marketSentiments.filter(s => s.sentiment === 'bullish').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400">Bearish Pairs</p>
            <p className="text-lg font-semibold text-red-400">
              {marketSentiments.filter(s => s.sentiment === 'bearish').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AIMarketInsights); 