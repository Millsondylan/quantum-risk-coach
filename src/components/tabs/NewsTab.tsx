import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Calendar, 
  Filter,
  RefreshCw,
  Newspaper,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { realDataService } from '@/lib/realDataService';
import { format } from 'date-fns';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  url?: string;
  description: string;
  upcoming?: boolean;
  symbols?: string[];
}

const NewsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data with enhanced properties
  const mockNewsData: NewsItem[] = [
    {
      id: '1',
      title: "Federal Reserve Signals Potential Rate Cuts",
      source: "Reuters",
      time: "2h ago",
      category: "Central Banks",
      impact: "high",
      sentiment: "bullish",
      upcoming: false,
      description: "Fed officials indicate possible interest rate reductions in coming months amid economic slowdown concerns.",
      symbols: ['USD', 'DXY'],
      url: 'https://example.com'
    },
    {
      id: '2',
      title: "Global Markets Rally on Tech Sector Growth",
      source: "Financial Times",
      time: "4h ago",
      category: "Markets",
      impact: "medium",
      sentiment: "bullish",
      upcoming: false,
      description: "Major indices surge as technology companies report stronger-than-expected earnings.",
      symbols: ['SPX', 'NDX', 'AAPL', 'MSFT'],
      url: 'https://example.com'
    },
    {
      id: '3',
      title: "Oil Prices Surge Amidst Geopolitical Tensions",
      source: "Bloomberg",
      time: "5h ago",
      category: "Commodities",
      impact: "high",
      sentiment: "bearish",
      upcoming: false,
      description: "Crude oil prices jump 3% following renewed tensions in key oil-producing regions.",
      symbols: ['OIL', 'USO', 'XLE'],
      url: 'https://example.com'
    },
    {
      id: '4',
      title: "ECB Interest Rate Decision",
      source: "European Central Bank",
      time: "Tomorrow 13:45",
      category: "Central Banks",
      impact: "high",
      sentiment: "neutral",
      upcoming: true,
      description: "European Central Bank to announce monetary policy decision and press conference.",
      symbols: ['EUR', 'EURUSD'],
      url: 'https://example.com'
    },
    {
      id: '5',
      title: "US Non-Farm Payrolls Report",
      source: "Bureau of Labor Statistics",
      time: "Friday 13:30",
      category: "Economic Data",
      impact: "high",
      sentiment: "neutral",
      upcoming: true,
      description: "Monthly employment report showing job creation and unemployment rate changes.",
      symbols: ['USD', 'SPX', 'VIX'],
      url: 'https://example.com'
    }
  ];

  useEffect(() => {
    // In a real app, fetch from API
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Try to fetch real news data
      const news = await realDataService.getFinancialNews();
      if (news && news.length > 0) {
        const formattedNews: NewsItem[] = news.map((item, index) => ({
          id: item.id || index.toString(),
          title: item.title,
          source: item.source,
          time: format(new Date(item.publishedAt), 'HH:mm'),
          category: item.category || 'General',
          impact: item.impact || 'medium',
          sentiment: determineSentiment(item.title, item.description),
          description: item.description,
          url: item.url,
          symbols: item.symbols || []
        }));
        setNewsData(formattedNews);
      } else {
        // Use mock data if API fails
        setNewsData(mockNewsData);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsData(mockNewsData);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const determineSentiment = (title: string, description: string): 'bullish' | 'bearish' | 'neutral' => {
    const text = (title + ' ' + description).toLowerCase();
    const bullishWords = ['rally', 'surge', 'gain', 'growth', 'positive', 'rise', 'boost'];
    const bearishWords = ['fall', 'drop', 'decline', 'negative', 'crash', 'plunge', 'tension'];
    
    const bullishCount = bullishWords.filter(word => text.includes(word)).length;
    const bearishCount = bearishWords.filter(word => text.includes(word)).length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  };

  const filteredNews = newsData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesImpact = selectedImpact === 'all' || item.impact === selectedImpact;
    const matchesSentiment = selectedSentiment === 'all' || item.sentiment === selectedSentiment;
    const matchesUpcoming = !showUpcomingOnly || item.upcoming;
    
    return matchesSearch && matchesCategory && matchesImpact && matchesSentiment && matchesUpcoming;
  });

  const categories = ['all', ...new Set(newsData.map(item => item.category))];
  const impacts = ['all', 'high', 'medium', 'low'];
  const sentiments = ['all', 'bullish', 'bearish', 'neutral'];

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-3 w-3" />;
      case 'bearish':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'sentiment-positive';
      case 'bearish':
        return 'sentiment-negative';
      default:
        return 'sentiment-neutral';
    }
  };

  const getImpactBadgeClass = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Market News & Events</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRefresh}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search news, symbols, or sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedImpact} onValueChange={setSelectedImpact}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              {impacts.map(impact => (
                <SelectItem key={impact} value={impact}>
                  {impact === 'all' ? 'All Impact' : impact.charAt(0).toUpperCase() + impact.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              {sentiments.map(sentiment => (
                <SelectItem key={sentiment} value={sentiment}>
                  {sentiment === 'all' ? 'All Sentiment' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showUpcomingOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming
          </Button>
        </div>
      </div>

      {/* News List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="ultra-card">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <Card className="ultra-card">
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No news found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNews.map((item) => (
            <Card key={item.id} className="news-item">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-sm leading-tight flex-1">
                      {item.title}
                    </h3>
                    {item.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.sentiment && (
                        <div className={cn("flex items-center gap-1", getSentimentColor(item.sentiment))}>
                          {getSentimentIcon(item.sentiment)}
                        </div>
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getImpactBadgeClass(item.impact))}
                      >
                        {item.impact.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {item.symbols && item.symbols.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.symbols.map(symbol => (
                        <Badge 
                          key={symbol}
                          variant="outline" 
                          className="text-xs bg-muted/30"
                        >
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsTab; 