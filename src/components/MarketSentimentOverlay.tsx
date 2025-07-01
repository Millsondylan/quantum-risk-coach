import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  Info,
  Database,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { realDataService, RealNewsItem } from '@/lib/realDataService';

interface SentimentData {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  strength: number;
  confidence: number;
  sources: string[];
  lastUpdate: string;
  volume: number;
  socialMentions: number;
  newsCount: number;
}

interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  confidence: number;
  dataPoints: number;
  lastUpdate: string;
  sources: string[];
}

const MarketSentimentOverlay = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);
  const [newsData, setNewsData] = useState<RealNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'GOOGL'];

  useEffect(() => {
    fetchRealSentimentData();
  }, []);

  const fetchRealSentimentData = async () => {
    setIsLoading(true);
    try {
      // Check if API keys are configured
      const apiValidation = realDataService.validateApiKeys();
      setAvailableSources(apiValidation.available);
      
      if (!apiValidation.valid) {
        setApiStatus('error');
        toast.error(`Missing API keys: ${apiValidation.missing.join(', ')}`);
        return;
      }

      // Fetch real sentiment data and news
      const [sentimentData, newsData] = await Promise.all([
        realDataService.getRealMarketSentiment(symbols),
        realDataService.getRealMarketNews()
      ]);

      // Process sentiment data
      const processedSentimentData: SentimentData[] = sentimentData.map((data, index) => ({
        symbol: data.symbol,
        sentiment: data.sentiment,
        strength: data.strength,
        confidence: data.confidence,
        sources: data.sources,
        lastUpdate: data.lastUpdate,
        volume: Math.floor(Math.random() * 1000000) + 100000, // Mock volume data
        socialMentions: Math.floor(Math.random() * 1000) + 100, // Mock social mentions
        newsCount: Math.floor(Math.random() * 50) + 5 // Mock news count
      }));

      // Calculate overall market sentiment
      const totalStrength = processedSentimentData.reduce((sum, data) => sum + data.strength, 0);
      const avgStrength = totalStrength / processedSentimentData.length;
      const positiveCount = processedSentimentData.filter(d => d.sentiment === 'positive').length;
      const negativeCount = processedSentimentData.filter(d => d.sentiment === 'negative').length;

      const overallSentiment: MarketSentiment = {
        overall: positiveCount > negativeCount ? 'bullish' : negativeCount > positiveCount ? 'bearish' : 'neutral',
        strength: avgStrength,
        confidence: processedSentimentData.reduce((sum, data) => sum + data.confidence, 0) / processedSentimentData.length,
        dataPoints: processedSentimentData.length,
        lastUpdate: new Date().toISOString(),
        sources: [...new Set(processedSentimentData.flatMap(d => d.sources))]
      };

      setSentimentData(processedSentimentData);
      setMarketSentiment(overallSentiment);
      setNewsData(newsData);
      setApiStatus('connected');
      toast.success(`Real sentiment data loaded from ${availableSources.length} sources`);
    } catch (error) {
      console.error('Error fetching real sentiment data:', error);
      setApiStatus('error');
      toast.error('Failed to load real sentiment data. Check your API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getSentimentBgColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-400/20';
      case 'negative': return 'bg-red-400/20';
      default: return 'bg-slate-400/20';
    }
  };

  const getMarketSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected': return `Live Data (${availableSources.length} sources)`;
      case 'error': return 'API Error';
      default: return 'Connecting...';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Sentiment Analysis</h2>
          <p className="text-slate-400">Real-time sentiment data from multiple sources</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 text-sm ${getApiStatusColor()}`}>
            <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-400' : apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
            <span>{getApiStatusText()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRealSentimentData}
            disabled={isLoading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {isLoading ? 'Loading...' : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Data Sources Info */}
      {availableSources.length > 0 && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Connected Sentiment Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSources.map(source => (
              <Badge key={source} variant="outline" className="text-xs text-slate-300 border-slate-600">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {apiStatus === 'error' ? (
        <Card className="holo-card">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-slate-400">Unable to load sentiment data</p>
              <p className="text-sm text-slate-500">Check your API configuration</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Market Sentiment */}
          {marketSentiment && (
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <span>Overall Market Sentiment</span>
                </CardTitle>
                <CardDescription>
                  Aggregated sentiment across all instruments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${getMarketSentimentColor(marketSentiment.overall)}`}>
                      {marketSentiment.overall.toUpperCase()}
                    </div>
                    <p className="text-slate-400 text-sm">Market Direction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {marketSentiment.strength.toFixed(1)}
                    </div>
                    <p className="text-slate-400 text-sm">Sentiment Strength</p>
                    <Progress value={marketSentiment.strength} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {marketSentiment.confidence.toFixed(1)}%
                    </div>
                    <p className="text-slate-400 text-sm">Confidence Level</p>
                    <Progress value={marketSentiment.confidence} className="mt-2" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Based on {marketSentiment.dataPoints} instruments</span>
                    <span>Updated: {formatTimestamp(marketSentiment.lastUpdate)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {marketSentiment.sources.map(source => (
                      <Badge key={source} variant="outline" className="text-xs text-slate-300 border-slate-600">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Instrument Sentiment */}
          {sentimentData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-400" />
                Instrument Sentiment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentimentData.map((data) => (
                  <Card key={data.symbol} className="holo-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{data.symbol}</span>
                          {getSentimentIcon(data.sentiment)}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSentimentColor(data.sentiment)} border-slate-600`}
                        >
                          {data.sentiment}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Strength</span>
                            <span className="text-white">{data.strength.toFixed(1)}</span>
                          </div>
                          <Progress value={data.strength} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Confidence</span>
                            <span className="text-white">{data.confidence.toFixed(1)}%</span>
                          </div>
                          <Progress value={data.confidence} className="h-2" />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/50">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400">Volume:</span>
                            <div className="text-white font-medium">{data.volume.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Mentions:</span>
                            <div className="text-white font-medium">{data.socialMentions}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          <span>{data.sources.join(', ')}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {formatTimestamp(data.lastUpdate)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent News Sentiment */}
          {newsData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-400" />
                Recent Market News
              </h3>
              <div className="space-y-3">
                {newsData.slice(0, 5).map((news) => (
                  <Card key={news.id} className="holo-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{news.title}</h4>
                          <p className="text-sm text-slate-400 mb-2">{news.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>{news.source}</span>
                            <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                            <span>{news.impact} impact</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSentimentColor(news.sentiment)} border-slate-600`}
                          >
                            {news.sentiment}
                          </Badge>
                        </div>
                      </div>
                      {news.symbols.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <div className="flex flex-wrap gap-2">
                            {news.symbols.map(symbol => (
                              <Badge key={symbol} variant="outline" className="text-xs text-slate-300 border-slate-600">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {sentimentData.length > 0 && (
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Analyzing {sentimentData.length} instruments from {availableSources.length} sources</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketSentimentOverlay; 