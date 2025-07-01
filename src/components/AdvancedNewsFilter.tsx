import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Filter, 
  Search, 
  X, 
  Settings,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Globe,
  Tag,
  Calendar,
  Bookmark,
  Bell,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface NewsFilter {
  impact: string[];
  sources: string[];
  categories: string[];
  symbols: string[];
  sentiment: string[];
  keywords: string[];
  excludeKeywords: string[];
  timeRange: string;
  minRelevanceScore: number;
  languages: string[];
  countries: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  symbols: string[];
  relevanceScore: number;
  country: string;
  language: string;
  url: string;
  urlToImage?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filter: NewsFilter;
  notifications: boolean;
  lastUsed: Date;
}

const AdvancedNewsFilter = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<NewsFilter>({
    impact: [],
    sources: [],
    categories: [],
    symbols: [],
    sentiment: [],
    keywords: [],
    excludeKeywords: [],
    timeRange: '24h',
    minRelevanceScore: 50,
    languages: ['en'],
    countries: [],
    dateRange: {
      start: null,
      end: null
    }
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: 'High Impact Forex',
      filter: {
        ...filters,
        impact: ['high'],
        categories: ['forex', 'central-bank'],
        symbols: ['USD', 'EUR', 'GBP', 'JPY']
      },
      notifications: true,
      lastUsed: new Date()
    },
    {
      id: '2',
      name: 'Crypto Breaking News',
      filter: {
        ...filters,
        impact: ['high', 'medium'],
        categories: ['cryptocurrency'],
        keywords: ['bitcoin', 'ethereum', 'crypto']
      },
      notifications: false,
      lastUsed: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('filters');

  // Available filter options
  const impactLevels = [
    { value: 'high', label: 'High Impact', color: 'text-red-400' },
    { value: 'medium', label: 'Medium Impact', color: 'text-yellow-400' },
    { value: 'low', label: 'Low Impact', color: 'text-green-400' }
  ];

  const sentimentTypes = [
    { value: 'positive', label: 'Positive', color: 'text-green-400' },
    { value: 'negative', label: 'Negative', color: 'text-red-400' },
    { value: 'neutral', label: 'Neutral', color: 'text-slate-400' }
  ];

  const categories = [
    'forex', 'cryptocurrency', 'stocks', 'commodities', 'central-bank',
    'economic-data', 'corporate', 'geopolitical', 'technology', 'regulation'
  ];

  const sources = [
    'Reuters', 'Bloomberg', 'Financial Times', 'Wall Street Journal',
    'MarketWatch', 'CNBC', 'CoinDesk', 'Forex.com', 'Trading Economics'
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '3d', label: 'Last 3 Days' },
    { value: '1w', label: 'Last Week' },
    { value: '1m', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    applyFilters();
  }, [newsItems, filters, searchTerm]);

  const applyFilters = () => {
    let filtered = [...newsItems];

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.symbols.some(symbol => symbol.toLowerCase().includes(searchLower))
      );
    }

    // Apply impact filter
    if (filters.impact.length > 0) {
      filtered = filtered.filter(item => filters.impact.includes(item.impact));
    }

    // Apply source filter
    if (filters.sources.length > 0) {
      filtered = filtered.filter(item => filters.sources.includes(item.source));
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => filters.categories.includes(item.category));
    }

    // Apply sentiment filter
    if (filters.sentiment.length > 0) {
      filtered = filtered.filter(item => filters.sentiment.includes(item.sentiment));
    }

    // Apply symbol filter
    if (filters.symbols.length > 0) {
      filtered = filtered.filter(item =>
        item.symbols.some(symbol => filters.symbols.includes(symbol))
      );
    }

    // Apply keyword filter
    if (filters.keywords.length > 0) {
      filtered = filtered.filter(item =>
        filters.keywords.some(keyword =>
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Apply exclude keywords filter
    if (filters.excludeKeywords.length > 0) {
      filtered = filtered.filter(item =>
        !filters.excludeKeywords.some(keyword =>
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Apply relevance score filter
    filtered = filtered.filter(item => item.relevanceScore >= filters.minRelevanceScore);

    // Apply time range filter
    if (filters.timeRange !== 'custom') {
      const now = new Date();
      const timeAgo = new Date();
      
      switch (filters.timeRange) {
        case '1h':
          timeAgo.setHours(now.getHours() - 1);
          break;
        case '6h':
          timeAgo.setHours(now.getHours() - 6);
          break;
        case '24h':
          timeAgo.setDate(now.getDate() - 1);
          break;
        case '3d':
          timeAgo.setDate(now.getDate() - 3);
          break;
        case '1w':
          timeAgo.setDate(now.getDate() - 7);
          break;
        case '1m':
          timeAgo.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item =>
        new Date(item.publishedAt) >= timeAgo
      );
    }

    // Sort by relevance score and date
    filtered.sort((a, b) => {
      const scoreA = a.relevanceScore;
      const scoreB = b.relevanceScore;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    setFilteredNews(filtered);
  };

  const updateFilter = (key: keyof NewsFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addToArrayFilter = (key: keyof NewsFilter, value: string) => {
    const currentArray = filters[key] as string[];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeFromArrayFilter = (key: keyof NewsFilter, value: string) => {
    const currentArray = filters[key] as string[];
    updateFilter(key, currentArray.filter(item => item !== value));
  };

  const clearAllFilters = () => {
    setFilters({
      impact: [],
      sources: [],
      categories: [],
      symbols: [],
      sentiment: [],
      keywords: [],
      excludeKeywords: [],
      timeRange: '24h',
      minRelevanceScore: 50,
      languages: ['en'],
      countries: [],
      dateRange: { start: null, end: null }
    });
    setSearchTerm('');
    toast.success('All filters cleared');
  };

  const saveCurrentFilter = () => {
    const name = prompt('Enter a name for this filter:');
    if (name) {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name,
        filter: { ...filters },
        notifications: false,
        lastUsed: new Date()
      };
      setSavedFilters(prev => [...prev, newFilter]);
      toast.success(`Filter "${name}" saved!`);
    }
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filter);
    setSavedFilters(prev =>
      prev.map(f => f.id === savedFilter.id ? { ...f, lastUsed: new Date() } : f)
    );
    toast.success(`Filter "${savedFilter.name}" loaded!`);
  };

  const deleteSavedFilter = (id: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== id));
    toast.success('Filter deleted');
  };

  const toggleNotifications = (id: string) => {
    setSavedFilters(prev =>
      prev.map(f => f.id === id ? { ...f, notifications: !f.notifications } : f)
    );
  };

  const refreshNews = async () => {
    setLoading(true);
    try {
      // This would integrate with your news service
      // const news = await newsService.getFilteredNews(filters);
      // setNewsItems(news);
      toast.success('News refreshed');
    } catch (error) {
      toast.error('Failed to refresh news');
    } finally {
      setLoading(false);
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value) && value.length > 0) return count + 1;
      if (typeof value === 'string' && value !== '24h' && value !== '') return count + 1;
      if (typeof value === 'number' && value !== 50) return count + 1;
      return count;
    }, 0) + (searchTerm ? 1 : 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Filter className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Advanced News Filter</h2>
            <p className="text-sm text-slate-400">
              {filteredNews.length} articles • {getActiveFilterCount()} active filters
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="border-slate-600 text-slate-300"
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNews}
            disabled={loading}
            className="border-slate-600 text-slate-300"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search news articles, symbols, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-600 text-white"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters">Quick Filters</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="saved">Saved Filters</TabsTrigger>
        </TabsList>

        {/* Quick Filters */}
        <TabsContent value="filters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Impact Level */}
            <Card className="holo-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-400" />
                  Impact Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {impactLevels.map(impact => (
                  <label key={impact.value} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.impact.includes(impact.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addToArrayFilter('impact', impact.value);
                        } else {
                          removeFromArrayFilter('impact', impact.value);
                        }
                      }}
                    />
                    <span className={`text-sm ${impact.color}`}>{impact.label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Sentiment */}
            <Card className="holo-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                  Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sentimentTypes.map(sentiment => (
                  <label key={sentiment.value} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.sentiment.includes(sentiment.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addToArrayFilter('sentiment', sentiment.value);
                        } else {
                          removeFromArrayFilter('sentiment', sentiment.value);
                        }
                      }}
                    />
                    <span className={`text-sm ${sentiment.color}`}>{sentiment.label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Time Range */}
            <Card className="holo-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-400" />
                  Time Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={filters.timeRange} onValueChange={(value) => updateFilter('timeRange', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Categories Filter */}
          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Tag className="w-4 h-4 mr-2 text-purple-400" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      filters.categories.includes(category)
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                    onClick={() => {
                      if (filters.categories.includes(category)) {
                        removeFromArrayFilter('categories', category);
                      } else {
                        addToArrayFilter('categories', category);
                      }
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Filters */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="text-sm">Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sources.map(source => (
                  <label key={source} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.sources.includes(source)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addToArrayFilter('sources', source);
                        } else {
                          removeFromArrayFilter('sources', source);
                        }
                      }}
                    />
                    <span className="text-sm text-slate-300">{source}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="text-sm">Keywords & Symbols</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400">Include Keywords</Label>
                  <Input
                    placeholder="Enter keywords separated by commas"
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value) {
                          addToArrayFilter('keywords', value);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.keywords.map(keyword => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeFromArrayFilter('keywords', keyword)}
                      >
                        {keyword} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-400">Exclude Keywords</Label>
                  <Input
                    placeholder="Enter keywords to exclude"
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value) {
                          addToArrayFilter('excludeKeywords', value);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.excludeKeywords.map(keyword => (
                      <Badge
                        key={keyword}
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => removeFromArrayFilter('excludeKeywords', keyword)}
                      >
                        {keyword} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="holo-card">
            <CardHeader>
              <CardTitle className="text-sm">Relevance Score</CardTitle>
              <CardDescription>Minimum relevance score (0-100)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minRelevanceScore}
                  onChange={(e) => updateFilter('minRelevanceScore', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-slate-300 w-12">
                  {filters.minRelevanceScore}%
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Filters */}
        <TabsContent value="saved" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Saved Filters</h3>
            <Button
              size="sm"
              onClick={saveCurrentFilter}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save Current
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedFilters.map(savedFilter => (
              <Card key={savedFilter.id} className="holo-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{savedFilter.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleNotifications(savedFilter.id)}
                        className="p-1"
                      >
                        {savedFilter.notifications ? (
                          <Bell className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Bell className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSavedFilter(savedFilter.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {savedFilter.filter.impact.map(impact => (
                        <Badge key={impact} variant="outline" className="text-xs">
                          {impact}
                        </Badge>
                      ))}
                      {savedFilter.filter.categories.map(category => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Last used: {savedFilter.lastUsed.toLocaleDateString()}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => loadSavedFilter(savedFilter)}
                      className="w-full bg-slate-700 hover:bg-slate-600"
                    >
                      Load Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Results Summary */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Filtered Results ({filteredNews.length} articles)</span>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Auto-refresh in 5 minutes</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Your filters are active and will automatically update as new articles arrive.
            {getActiveFilterCount() > 0 && ` ${getActiveFilterCount()} filters applied.`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedNewsFilter; 