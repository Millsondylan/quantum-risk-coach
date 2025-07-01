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
  RefreshCw
} from 'lucide-react';
import { marketService, MarketNews, EconomicEvent } from '../lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MarketCoverageSentiment() {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState<string>('');
  const [selectedImpact, setSelectedImpact] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Market Coverage & Sentiment
          </CardTitle>
          <CardDescription>
            Real-time news feed with sentiment analysis and economic calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="news">Market News</TabsTrigger>
              <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* News List */}
              <div className="space-y-4">
                {filteredNews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No news articles found matching your filters.</p>
                  </div>
                ) : (
                  filteredNews.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-600 mb-3">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {getSentimentIcon(item.sentiment)}
                            <Badge className={getSentimentColor(item.sentiment)}>
                              {item.sentiment}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Newspaper className="w-4 h-4" />
                              {item.source}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(item.publishedAt), 'MMM dd, HH:mm')}
                            </div>
                            <div className="flex items-center gap-1">
                              {getImpactIcon(item.impact)}
                              <Badge variant="outline" className={getImpactColor(item.impact)}>
                                {item.impact} impact
                              </Badge>
                            </div>
                          </div>

                          {item.symbols.length > 0 && (
                            <div className="flex gap-1">
                              {item.symbols.map((symbol) => (
                                <Badge key={symbol} variant="secondary" className="text-xs">
                                  {symbol}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              {/* Calendar Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Currency:</span>
                </div>
                
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All currencies</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="NZD">NZD</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Economic Events */}
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No economic events found for the selected currency.</p>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge variant="outline">{event.currency}</Badge>
                              <div className="flex items-center gap-1">
                                {getImpactIcon(event.impact)}
                                <Badge className={getImpactColor(event.impact)}>
                                  {event.impact} impact
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span>Forecast: {event.forecast} | Previous: {event.previous}</span>
                              </div>
                            </div>

                            {event.actual && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium text-blue-800">
                                  Actual: {event.actual}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Market Sentiment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Market Sentiment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {news.filter(n => n.sentiment === 'positive').length}
                      </div>
                      <div className="text-sm text-green-600">Positive News</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">
                        {news.filter(n => n.sentiment === 'negative').length}
                      </div>
                      <div className="text-sm text-red-600">Negative News</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Minus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-600">
                        {news.filter(n => n.sentiment === 'neutral').length}
                      </div>
                      <div className="text-sm text-gray-600">Neutral News</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 