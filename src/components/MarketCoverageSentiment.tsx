import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Globe,
  Activity,
  Filter,
  RefreshCw,
  BarChart3,
  Eye
} from 'lucide-react';
import { marketService, MarketNews, EconomicEvent } from '../lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MarketCoverageSentiment = () => {
  const [selectedMarket, setSelectedMarket] = useState('forex');
  const [news, setNews] = useState<MarketNews[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState<string>('');
  const [selectedImpact, setSelectedImpact] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

  const markets = [
    {
      id: 'forex',
      name: 'Forex',
      sentiment: 0.65,
      volume: '6.6T',
      change: 2.3,
      news: 15,
      events: 8
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      sentiment: 0.78,
      volume: '2.1T',
      change: -1.2,
      news: 23,
      events: 12
    },
    {
      id: 'stocks',
      name: 'Stocks',
      sentiment: 0.45,
      volume: '8.9T',
      change: 0.8,
      news: 31,
      events: 18
    },
    {
      id: 'commodities',
      name: 'Commodities',
      sentiment: 0.32,
      volume: '1.2T',
      change: -0.5,
      news: 8,
      events: 5
    }
  ];

  const newsItems = [
    {
      id: '1',
      title: 'Fed Signals Potential Rate Cut in Q2',
      source: 'Reuters',
      sentiment: 0.75,
      impact: 'high',
      time: '2 hours ago',
      symbols: ['USD', 'EUR', 'GBP']
    },
    {
      id: '2',
      title: 'Bitcoin Surges Past $45,000 Resistance',
      source: 'CoinDesk',
      sentiment: 0.85,
      impact: 'medium',
      time: '4 hours ago',
      symbols: ['BTC', 'ETH']
    },
    {
      id: '3',
      title: 'Oil Prices Drop on Increased Supply Concerns',
      source: 'Bloomberg',
      sentiment: 0.25,
      impact: 'high',
      time: '6 hours ago',
      symbols: ['WTI', 'BRENT']
    }
  ];

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const [newsData, eventsData] = await Promise.all([
          marketService.getMarketNews(),
          marketService.getEconomicCalendar()
        ]);

        setNews(newsData);
        setEconomicEvents(eventsData);
      } catch (error) {
        console.error('Failed to load market data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, []);

  const getSentimentIcon = (sentiment: number | string) => {
    const numSentiment = typeof sentiment === 'string' 
      ? (sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5)
      : sentiment;
    
    if (numSentiment >= 0.7) return <TrendingUp className="w-4 h-4" />;
    if (numSentiment >= 0.5) return <Activity className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getSentimentColor = (sentiment: number | string) => {
    const numSentiment = typeof sentiment === 'string' 
      ? (sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5)
      : sentiment;
    
    if (numSentiment >= 0.7) return 'text-green-400';
    if (numSentiment >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentDisplay = (sentiment: string | number) => {
    if (typeof sentiment === 'string') {
      return sentiment.toUpperCase();
    }
    return `${(sentiment * 100).toFixed(0)}%`;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSentiment = !selectedSentiment || item.sentiment === selectedSentiment;
    const matchesImpact = !selectedImpact || item.impact === selectedImpact;
    return matchesSentiment && matchesImpact;
  });

  const filteredEvents = economicEvents.filter(event => {
    const matchesCurrency = !selectedCurrency || event.currency === selectedCurrency;
    return matchesCurrency;
  });

  const refreshData = async () => {
    setLoading(true);
    try {
      const [newsData, eventsData] = await Promise.all([
        marketService.getMarketNews(),
        marketService.getEconomicCalendar()
      ]);

      setNews(newsData);
      setEconomicEvents(eventsData);
      toast.success('Market data refreshed');
    } catch (error) {
      toast.error('Failed to refresh market data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Activity className="w-6 h-6 animate-spin mr-2" />
              Loading market data...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Coverage & Sentiment</h2>
          <p className="text-slate-400">Market news and sentiment analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-400">
            <Activity className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="news">News Feed</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {markets.map(market => (
              <Card key={market.id} className="holo-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-white">{market.name}</h3>
                      <p className="text-sm text-slate-400">Daily Volume: {market.volume}</p>
                    </div>
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Sentiment</span>
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(market.sentiment)}
                        <span className={`font-medium ${getSentimentColor(market.sentiment)}`}>
                          {getSentimentDisplay(market.sentiment)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">24h Change</span>
                      <span className={`font-medium ${market.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {market.change >= 0 ? '+' : ''}{market.change}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">News Items</span>
                      <span className="text-white font-medium">{market.news}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Events</span>
                      <span className="text-white font-medium">{market.events}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>Market Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-400">Best Performer</span>
                  </div>
                  <p className="text-lg font-bold text-white">Cryptocurrency</p>
                  <p className="text-sm text-green-400">+2.3% today</p>
                </div>
                
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Most Active</span>
                  </div>
                  <p className="text-lg font-bold text-white">Forex</p>
                  <p className="text-sm text-blue-400">6.6T volume</p>
                </div>
                
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-400">High Impact</span>
                  </div>
                  <p className="text-lg font-bold text-white">Commodities</p>
                  <p className="text-sm text-yellow-400">Supply concerns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Newspaper className="w-5 h-5 text-blue-400" />
                <span>Latest News</span>
              </CardTitle>
              <CardDescription>
                Market news with sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNews.map(item => (
                  <div key={item.id} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{item.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                          <span>•</span>
                          <span className={`font-medium ${getImpactColor(item.impact)}`}>
                            {item.impact.toUpperCase()} Impact
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(item.sentiment)}
                        <span className={`text-sm font-medium ${getSentimentColor(item.sentiment)}`}>
                          {getSentimentDisplay(item.sentiment)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.symbols && item.symbols.map(symbol => (
                          <Badge key={symbol} variant="outline" className="text-xs">
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredNews.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    No news items available. Make sure your News API key is configured.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Bullish</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm text-white">65%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Neutral</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm text-white">25%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Bearish</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm text-white">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle>Market Sentiment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {markets.map(market => (
                    <div key={market.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{market.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getSentimentColor(market.sentiment).replace('text-', 'bg-')}`}
                            style={{ width: `${market.sentiment * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getSentimentColor(market.sentiment)}`}>
                          {getSentimentDisplay(market.sentiment)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-400">Positive Sentiment</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Overall market sentiment is bullish with 65% positive outlook across major markets.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-400">Risk Factors</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Commodities showing bearish sentiment due to supply chain concerns and geopolitical tensions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketCoverageSentiment; 