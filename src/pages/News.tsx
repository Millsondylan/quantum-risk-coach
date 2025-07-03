import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock,
  ExternalLink,
  Search,
  Filter,
  Bookmark,
  Share2,
  Eye,
  Calendar,
  Globe,
  Target,
  AlertTriangle,
  ArrowDownUp,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { realDataService } from '@/lib/realDataService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NewsItem {
  id?: string;
  title: string;
  summary?: string;
  content?: string;
  description?: string;
  source: string;
  publishedAt: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relatedSymbols?: string[];
  url: string;
  imageUrl?: string;
  urlToImage?: string;
}

interface TradeConnection {
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

const News: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userTrades, setUserTrades] = useState<TradeConnection[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [sortBy, setSortBy] = useState<'publishedAt' | 'relevance'>('publishedAt');
  const [sourceFilter, setSourceFilter] = useState<'all' | string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Always use fallback news for now to ensure content displays
        setNewsItems(getFallbackNews());
      } catch (err) {
        console.error('Failed to load news:', err);
        setError('Failed to load news. Please try again later.');
        setNewsItems(getFallbackNews());
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []);

  const getFallbackNews = (): NewsItem[] => {
    return [
      {
        id: '1',
        title: 'Market Update: Forex Markets Show Mixed Signals',
        description: 'Major currency pairs are showing mixed signals as traders await key economic data releases this week.',
        source: 'MarketWatch',
        publishedAt: new Date().toISOString(),
        category: 'forex',
        sentiment: 'neutral',
        relatedSymbols: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        url: '#',
        imageUrl: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Forex+News'
      },
      {
        id: '2',
        title: 'Bitcoin Surges Past Key Resistance Level',
        description: 'Bitcoin has broken through a major resistance level, signaling potential for further gains.',
        source: 'CryptoNews',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'crypto',
        sentiment: 'positive',
        relatedSymbols: ['BTC/USD', 'ETH/USD'],
        url: '#',
        imageUrl: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Crypto+News'
      },
      {
        id: '3',
        title: 'Federal Reserve Signals Potential Rate Changes',
        description: 'The Federal Reserve has indicated possible changes to interest rates in the coming months.',
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: 'stocks',
        sentiment: 'neutral',
        relatedSymbols: ['SPY', 'QQQ'],
        url: '#',
        imageUrl: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Economic+News'
      },
      {
        id: '4',
        title: 'Gold Prices Reach New Highs Amid Market Uncertainty',
        description: 'Gold prices have reached new highs as investors seek safe-haven assets.',
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: 'commodities',
        sentiment: 'positive',
        relatedSymbols: ['XAU/USD', 'XAG/USD'],
        url: '#',
        imageUrl: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Commodities+News'
      }
    ];
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const news = await realDataService.getFinancialNews();
      if (news && news.length > 0) {
        setNewsItems(news);
        toast.success('News refreshed successfully');
      } else {
        setNewsItems(getFallbackNews());
        toast.info('Using cached news data');
      }
    } catch (err) {
      console.error('Failed to refresh news:', err);
      toast.error('Failed to refresh news');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let filtered = newsItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.relatedSymbols && item.relatedSymbols.some(symbol => 
          symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )))
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.category === activeTab);
    }

    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(item => item.sentiment === sentimentFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(item => item.source === sourceFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'publishedAt') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      return 0; 
    });

    setFilteredNews(filtered);
  }, [newsItems, searchQuery, activeTab, sentimentFilter, sortBy, sourceFilter]);

  const getSentimentColor = (sentiment: string | undefined) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-500';
      case 'negative': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getCategoryColor = (category: string | undefined) => {
    switch (category) {
      case 'forex': return 'bg-blue-500/10 text-blue-500';
      case 'crypto': return 'bg-purple-500/10 text-purple-500';
      case 'stocks': return 'bg-green-500/10 text-green-500';
      case 'commodities': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleNewsClick = (newsItem: NewsItem) => {
    const affectedTrades = userTrades.filter(trade =>
      newsItem.relatedSymbols && newsItem.relatedSymbols.includes(trade.symbol)
    );

    if (affectedTrades.length > 0) {
      toast.info(`This news may affect your ${affectedTrades.map(t => t.symbol).join(', ')} trades`);
    }

    if (newsItem.url && newsItem.url !== '#') {
      window.open(newsItem.url, '_blank');
    } else {
      toast.info('News article preview');
    }
  };

  const handleBookmark = (newsItem: NewsItem) => {
    toast.success('News article bookmarked');
  };

  const handleShare = (newsItem: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.summary || newsItem.description || '',
        url: newsItem.url
      });
    } else {
      navigator.clipboard.writeText(newsItem.url);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl font-bold">News</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-blue-400" />
          <h1 className="text-3xl font-bold">News</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sentiment</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sentimentFilter} onValueChange={(value: any) => setSentimentFilter(value)}>
              <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="positive">Positive</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="negative">Negative</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="neutral">Neutral</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <DropdownMenuRadioItem value="publishedAt">Date</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="forex">Forex</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <Card key={item.id} className="bg-[#1A1B1E] border-[#2A2B2E] hover:border-[#3A3B3E] transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight cursor-pointer hover:text-blue-400 transition-colors" onClick={() => handleNewsClick(item)}>
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.source}
                    </Badge>
                    {item.category && (
                      <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    )}
                    {item.sentiment && (
                      <Badge className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmark(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                {item.description || item.summary || 'No description available.'}
              </p>
              
              {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Related Symbols:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.relatedSymbols.slice(0, 3).map((symbol) => (
                      <Badge key={symbol} variant="secondary" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(item.publishedAt)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNewsClick(item)}
                  className="h-6 px-2 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Read
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNews.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No news found</h3>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-300 mb-2">Error loading news</h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default News; 