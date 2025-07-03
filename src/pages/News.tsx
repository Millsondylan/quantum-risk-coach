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
  Zap
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

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    realDataService.getFinancialNews()
      .then((news) => {
        setNewsItems(news);
        setIsLoading(false);
      })
      .catch((err) => {
        setError('Failed to load news. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = newsItems;

    // Filter by search query
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

    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.category === activeTab);
    }

    // Filter by sentiment
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(item => item.sentiment === sentimentFilter);
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(item => item.source === sourceFilter);
    }

    // Sort news items
    filtered.sort((a, b) => {
      if (sortBy === 'publishedAt') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      // For 'relevance', we'll just use a dummy sort for now or rely on API's default
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
    // Check if news affects user's trades
    const affectedTrades = userTrades.filter(trade =>
      newsItem.relatedSymbols && newsItem.relatedSymbols.includes(trade.symbol)
    );

    if (affectedTrades.length > 0) {
      toast.info(`This news may affect your ${affectedTrades.map(t => t.symbol).join(', ')} trades`);
    }

    window.open(newsItem.url, '_blank');
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
      <div className="container mx-auto p-4 pb-20 space-y-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-blue-400" />
          <h1 className="text-3xl font-bold">News</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 pb-20 space-y-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-blue-400" />
          <h1 className="text-3xl font-bold">News</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6" data-testid="news-page">
      <div className="flex items-center gap-2">
        <Newspaper className="h-6 w-6 text-blue-400" />
        <h1 className="text-3xl font-bold">News</h1>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search news by title, content, or symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="news-search-input"
          />
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

        {/* Advanced Filters */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium text-sm">Filters:</h3>
          <div className="flex gap-2">
            {/* Sentiment Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Sentiment ({sentimentFilter === 'all' ? 'All' : sentimentFilter})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Filter by Sentiment</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sentimentFilter} onValueChange={(value: 'all' | 'positive' | 'negative' | 'neutral') => setSentimentFilter(value)}>
                  <DropdownMenuRadioItem value="all">All Sentiments</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="positive">Positive</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="neutral">Neutral</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="negative">Negative</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Source Filter (Dummy for now) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Source ({sourceFilter === 'all' ? 'All' : sourceFilter})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sourceFilter} onValueChange={setSourceFilter}>
                  <DropdownMenuRadioItem value="all">All Sources</DropdownMenuRadioItem>
                  {/* Replace with dynamic sources from your API */}
                  <DropdownMenuRadioItem value="Reuters">Reuters</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Bloomberg">Bloomberg</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Investing.com">Investing.com</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort By */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  Sort By ({sortBy === 'publishedAt' ? 'Date' : 'Relevance'})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Sort News By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: 'publishedAt' | 'relevance') => setSortBy(value)}>
                  <DropdownMenuRadioItem value="publishedAt">Published Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="relevance">Relevance (Coming Soon)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Trade Impact Summary (optional, can be connected to real trades) */}
      {userTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Trades Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userTrades.map((trade) => (
                <div key={trade.symbol} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                      {trade.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{trade.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} ({trade.pnlPercent.toFixed(2)}%)
                    </div>
                    <div className="text-xs text-slate-400">
                      {trade.entryPrice} → {trade.currentPrice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Newspaper className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No news found matching your criteria</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNews.map((newsItem, idx) => (
            <Card key={newsItem.id || idx} className="hover:bg-slate-800/30 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight cursor-pointer hover:text-blue-400 transition-colors"
                          onClick={() => handleNewsClick(newsItem)}>
                        {newsItem.title}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">{newsItem.summary || newsItem.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {newsItem.sentiment && (
                        <Badge className={getSentimentColor(newsItem.sentiment)}>
                          {newsItem.sentiment}
                        </Badge>
                      )}
                      {newsItem.category && (
                        <Badge className={getCategoryColor(newsItem.category)}>
                          {newsItem.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Related Symbols (optional, if available) */}
                  {newsItem.relatedSymbols && newsItem.relatedSymbols.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Related:</span>
                      {newsItem.relatedSymbols.map((symbol) => {
                        const userTrade = userTrades.find(trade => trade.symbol === symbol);
                        return (
                          <Badge 
                            key={symbol} 
                            variant={userTrade ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {symbol}
                            {userTrade && <AlertTriangle className="h-3 w-3 ml-1" />}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {newsItem.source}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(newsItem.publishedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(newsItem)}
                        className="h-8 w-8 p-0"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(newsItem)}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNewsClick(newsItem)}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default News; 