import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Tag,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Shield,
  Zap,
  Star,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Link,
  Hash,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  CalendarDays,
  Timer,
  TimerOff,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Save,
  Camera,
  Mic,
  Paperclip,
  Smile,
  Send,
  Archive,
  Trash,
  StarOff,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  Globe,
  Activity,
  Database,
  Server,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Minus,
  PlusCircle,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Coffee,
  Beer,
  Wine,
  Apple,
  Banana,
  Grape,
  Cherry,
  Glasses,
  FileText as Mirror,
  FileText as Lens,
  Telescope,
  Microscope,
  Binoculars,
  Compass,
  Map,
  Earth,
  Moon,
  Sun,
  Plane,
  Space,
  Rocket,
  Satellite,
  Bot,
  Laptop,
  Tablet,
  Smartphone,
  Watch,
  Headphones,
  Speaker,
  Mic as Microphone,
  Film,
  Folder,
  File,
  FileText as Document,
  FileText as PDF,
  FileText as Word,
  FileText as Excel,
  FileText as PowerPoint,
  FileText as CSV,
  FileText as JSON,
  FileText as XML,
  FileText as HTML,
  FileText as CSS,
  FileText as JavaScript,
  FileText as TypeScript,
  FileText as Python,
  FileText as Java,
  FileText as PHP,
  FileText as Ruby,
  FileText as Go,
  FileText as Rust,
  FileText as Swift,
  FileText as Kotlin,
  FileText as Haskell,
  FileText as Clojure,
  FileText as Erlang,
  FileText as Elixir,
  FileText as R,
  FileText as Julia,
  FileText as Dart,
  FileText as ReactIcon,
  FileText as Vue,
  FileText as Angular,
  FileText as Svelte,
  FileText as Next,
  FileText as Gatsby,
  FileText as Strapi,
  FileText as WordPress,
  FileText as Drupal,
  FileText as Joomla,
  FileText as Magento,
  FileText as Shopify,
  FileText as WooCommerce,
  FileText as BigCommerce,
  FileText as Squarespace,
  FileText as Wix,
  FileText as Webflow,
  FileText as Bubble,
  FileText as Zapier,
  FileText as IFTTT,
  FileText as Make,
  FileText as Integromat,
  FileText as Automate,
  FileText as Workflow,
  FileText as Pipeline,
  FileText as ETL,
  FileText as API,
  FileText as REST,
  FileText as GraphQL,
  FileText as SOAP,
  FileText as gRPC,
  FileText as WebSocket,
  FileText as Webhook,
  FileText as Cron,
  FileText as Scheduler,
  FileText as Queue,
  FileText as Cache,
  Database as DatabaseIcon,
  FileText as SQL,
  FileText as NoSQL,
  FileText as MongoDB,
  FileText as PostgreSQL,
  FileText as MySQL,
  FileText as SQLite,
  FileText as Redis,
  FileText as Elasticsearch,
  FileText as InfluxDB,
  FileText as Cassandra,
  FileText as DynamoDB,
  FileText as Firebase,
  FileText as Supabase,
  FileText as AWS,
  FileText as Azure,
  FileText as GCP,
  FileText as DigitalOcean,
  FileText as Heroku,
  FileText as Vercel,
  FileText as Netlify,
  FileText as Cloudflare,
  FileText as CDN,
  FileText as DNS,
  FileText as SSL,
  FileText as HTTPS,
  FileText as HTTP,
  FileText as TCP,
  FileText as UDP,
  FileText as IP,
  FileText as IPv4,
  FileText as IPv6,
  FileText as MAC,
  FileText as Bluetooth,
  FileText as Nfc,
  Folder as FolderIcon,
  File as FileIcon,
  Calendar as CalendarIcon2,
  Clipboard,
  Notebook,
  Sigma
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';
import { useUser } from '@/contexts/UserContext';

interface JournalEntry {
  id: string;
  tradeId?: string;
  title: string;
  content: string;
  tags: string[];
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  marketCondition: 'bullish' | 'bearish' | 'sideways' | 'volatile' | 'trending';
  strategy: string;
  lessons: string[];
  attachments: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTime: number;
  likes: number;
  shares: number;
  bookmarks: number;
}

interface JournalStats {
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  moodDistribution: Record<string, number>;
  marketConditionDistribution: Record<string, number>;
  strategyDistribution: Record<string, number>;
  weeklyActivity: Array<{ date: string; entries: number }>;
  monthlyTrends: Array<{ month: string; entries: number; words: number }>;
}

const UltraTraderJournal: React.FC = () => {
  const { user } = useUser();
  const { trades } = useTrades();
  const [activeTab, setActiveTab] = useState('synced-trades');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedMarketCondition, setSelectedMarketCondition] = useState<string>('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'mood' | 'strategy'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [showPrivate, setShowPrivate] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    mood: 'neutral' as JournalEntry['mood'],
    marketCondition: 'sideways' as JournalEntry['marketCondition'],
    strategy: '',
    lessons: [] as string[],
    isPrivate: false
  });

  // Journal statistics
  const journalStats = useMemo((): JournalStats => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const averageWordsPerEntry = totalEntries > 0 ? totalWords / totalEntries : 0;

    // Most used tags
    const tagCounts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const mostUsedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Mood distribution
    const moodDistribution: Record<string, number> = {};
    entries.forEach(entry => {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    });

    // Market condition distribution
    const marketConditionDistribution: Record<string, number> = {};
    entries.forEach(entry => {
      marketConditionDistribution[entry.marketCondition] = (marketConditionDistribution[entry.marketCondition] || 0) + 1;
    });

    // Strategy distribution
    const strategyDistribution: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.strategy) {
        strategyDistribution[entry.strategy] = (strategyDistribution[entry.strategy] || 0) + 1;
      }
    });

    // Weekly activity (last 4 weeks)
    const weeklyActivity = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      weeklyActivity.push({
        date: weekStart.toLocaleDateString(),
        entries: weekEntries.length
      });
    }

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });
      
      const monthWords = monthEntries.reduce((sum, entry) => sum + entry.wordCount, 0);
      
      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        entries: monthEntries.length,
        words: monthWords
      });
    }

    return {
      totalEntries,
      totalWords,
      averageWordsPerEntry,
      mostUsedTags,
      moodDistribution,
      marketConditionDistribution,
      strategyDistribution,
      weeklyActivity,
      monthlyTrends
    };
  }, [entries]);

  // Filter and sort entries
  useEffect(() => {
    let filtered = entries;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        selectedTags.some(tag => entry.tags.includes(tag))
      );
    }

    // Apply mood filter
    if (selectedMood) {
      filtered = filtered.filter(entry => entry.mood === selectedMood);
    }

    // Apply market condition filter
    if (selectedMarketCondition) {
      filtered = filtered.filter(entry => entry.marketCondition === selectedMarketCondition);
    }

    // Apply strategy filter
    if (selectedStrategy) {
      filtered = filtered.filter(entry => entry.strategy === selectedStrategy);
    }

    // Apply privacy filter
    if (!showPrivate) {
      filtered = filtered.filter(entry => !entry.isPrivate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'mood':
          comparison = a.mood.localeCompare(b.mood);
          break;
        case 'strategy':
          comparison = (a.strategy || '').localeCompare(b.strategy || '');
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredEntries(filtered);
  }, [entries, searchQuery, selectedTags, selectedMood, selectedMarketCondition, selectedStrategy, showPrivate, sortBy, sortOrder]);

  // Create new entry
  const handleCreateEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags,
      mood: newEntry.mood,
      marketCondition: newEntry.marketCondition,
      strategy: newEntry.strategy,
      lessons: newEntry.lessons,
      attachments: [],
      isPrivate: newEntry.isPrivate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: newEntry.content.split(' ').length,
      readingTime: Math.ceil(newEntry.content.split(' ').length / 200), // 200 words per minute
      likes: 0,
      shares: 0,
      bookmarks: 0
    };

    setEntries(prev => [entry, ...prev]);
    setNewEntry({
      title: '',
      content: '',
      tags: [],
      mood: 'neutral',
      marketCondition: 'sideways',
      strategy: '',
      lessons: [],
      isPrivate: false
    });
    setIsCreating(false);
    toast.success('Journal entry created successfully');
  };

  // Update entry
  const handleUpdateEntry = async (entry: JournalEntry) => {
    const updatedEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
      wordCount: entry.content.split(' ').length,
      readingTime: Math.ceil(entry.content.split(' ').length / 200)
    };

    setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
    setSelectedEntry(updatedEntry);
    setIsEditing(false);
    toast.success('Journal entry updated successfully');
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }
    toast.success('Journal entry deleted successfully');
  };

  // Add tag to entry
  const handleAddTag = (entryId: string, tag: string) => {
    if (!tag.trim()) return;
    
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, tags: [...entry.tags, tag.trim()] }
        : entry
    ));
  };

  // Remove tag from entry
  const handleRemoveTag = (entryId: string, tag: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, tags: entry.tags.filter(t => t !== tag) }
        : entry
    ));
  };

  // Get mood icon and color
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent': return { icon: Star, color: 'text-yellow-400' };
      case 'good': return { icon: TrendingUp, color: 'text-green-400' };
      case 'neutral': return { icon: Minus, color: 'text-slate-400' };
      case 'poor': return { icon: TrendingDown, color: 'text-orange-400' };
      case 'terrible': return { icon: AlertTriangle, color: 'text-red-400' };
      default: return { icon: Minus, color: 'text-slate-400' };
    }
  };

  // Get market condition icon and color
  const getMarketConditionIcon = (condition: string) => {
    switch (condition) {
      case 'bullish': return { icon: TrendingUp, color: 'text-green-400' };
      case 'bearish': return { icon: TrendingDown, color: 'text-red-400' };
      case 'sideways': return { icon: Minus, color: 'text-slate-400' };
      case 'volatile': return { icon: Zap, color: 'text-yellow-400' };
      case 'trending': return { icon: ArrowUpRight, color: 'text-blue-400' };
      default: return { icon: Minus, color: 'text-slate-400' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">UltraTrader Journal</h1>
                <p className="text-xs text-slate-400">Trading Insights & Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Journal Statistics */}
        <Card className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{journalStats.totalEntries}</div>
                <div className="text-sm text-slate-400">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{journalStats.totalWords.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(journalStats.averageWordsPerEntry)}</div>
                <div className="text-sm text-slate-400">Avg Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{entries.filter(e => e.isPrivate).length}</div>
                <div className="text-sm text-slate-400">Private Entries</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 space-y-4">
                <div>
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-white">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {journalStats.mostUsedTags.slice(0, 8).map(({ tag, count }) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        className={cn(
                          "cursor-pointer",
                          selectedTags.includes(tag) ? "bg-blue-600" : "bg-slate-700 text-slate-300"
                        )}
                        onClick={() => setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        )}
                      >
                        {tag} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-white">Mood</Label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="All moods" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="">All moods</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="terrible">Terrible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-white">Market Condition</Label>
                  <Select value={selectedMarketCondition} onValueChange={setSelectedMarketCondition}>
                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="All conditions" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="">All conditions</SelectItem>
                      <SelectItem value="bullish">Bullish</SelectItem>
                      <SelectItem value="bearish">Bearish</SelectItem>
                      <SelectItem value="sideways">Sideways</SelectItem>
                      <SelectItem value="volatile">Volatile</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-white">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="mood">Mood</SelectItem>
                      <SelectItem value="strategy">Strategy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showPrivate}
                    onCheckedChange={setShowPrivate}
                  />
                  <Label className="text-sm text-slate-300">Show Private Entries</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-600">
                <TabsTrigger value="synced-trades" className="text-slate-300 data-[state=active]:bg-blue-600">
                  Synced Trades
                </TabsTrigger>
                <TabsTrigger value="manual-entries" className="text-slate-300 data-[state=active]:bg-blue-600">
                  Manual Entries
                </TabsTrigger>
                <TabsTrigger value="strategy-notes" className="text-slate-300 data-[state=active]:bg-blue-600">
                  Strategy Notes
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-slate-300 data-[state=active]:bg-blue-600">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="synced-trades" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trades.map((trade) => (
                    <Card key={trade.id} className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              trade.type?.toLowerCase() === 'buy' ? "bg-green-400" : "bg-red-400"
                            )} />
                            <span className="font-medium text-white">{trade.symbol}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {trade.type?.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Quantity:</span>
                            <span className="text-white">{trade.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Price:</span>
                            <span className="text-white">${trade.entryPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">P&L:</span>
                            <span className={cn(
                              "font-medium",
                              (trade.profitLoss || 0) >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss?.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              setNewEntry({
                                title: `Trade Analysis: ${trade.symbol}`,
                                content: `Analysis for ${trade.symbol} ${trade.type} trade...`,
                                tags: [trade.symbol, trade.type || 'trade'],
                                mood: 'neutral',
                                marketCondition: 'sideways',
                                strategy: '',
                                lessons: [],
                                isPrivate: false
                              });
                              setIsCreating(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Add Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="manual-entries" className="space-y-4">
                {isCreating ? (
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Create New Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-white">Title</Label>
                        <Input
                          value={newEntry.title}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                          className="mt-2 bg-slate-700 border-slate-600 text-white"
                          placeholder="Entry title..."
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Content</Label>
                        <Textarea
                          value={newEntry.content}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                          className="mt-2 bg-slate-700 border-slate-600 text-white min-h-[200px]"
                          placeholder="Write your trading insights..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Mood</Label>
                          <Select value={newEntry.mood} onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, mood: value }))}>
                            <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                              <SelectItem value="terrible">Terrible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white">Market Condition</Label>
                          <Select value={newEntry.marketCondition} onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, marketCondition: value }))}>
                            <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="bullish">Bullish</SelectItem>
                              <SelectItem value="bearish">Bearish</SelectItem>
                              <SelectItem value="sideways">Sideways</SelectItem>
                              <SelectItem value="volatile">Volatile</SelectItem>
                              <SelectItem value="trending">Trending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newEntry.isPrivate}
                          onCheckedChange={(checked) => setNewEntry(prev => ({ ...prev, isPrivate: checked }))}
                        />
                        <Label className="text-sm text-slate-300">Private Entry</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateEntry}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Entry
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreating(false)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredEntries.map((entry) => (
                      <Card key={entry.id} className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-white mb-1">{entry.title}</h3>
                              <p className="text-sm text-slate-400 line-clamp-2">{entry.content}</p>
                            </div>
                            {entry.isPrivate && (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            {getMoodIcon(entry.mood).icon({ className: cn("w-4 h-4", getMoodIcon(entry.mood).color) })}
                            {getMarketConditionIcon(entry.marketCondition).icon({ 
                              className: cn("w-4 h-4", getMarketConditionIcon(entry.marketCondition).color) 
                            })}
                            <span className="text-xs text-slate-400">
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {entry.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                                {tag}
                              </Badge>
                            ))}
                            {entry.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                                +{entry.tags.length - 3}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{entry.wordCount} words • {entry.readingTime} min read</span>
                            <div className="flex items-center gap-3">
                              <span>{entry.likes} likes</span>
                              <span>{entry.bookmarks} bookmarks</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="strategy-notes" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-600">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Strategy Development</h3>
                    <p className="text-slate-300">
                      Document your trading strategies, backtest results, and market analysis here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Mood Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(journalStats.moodDistribution).map(([mood, count]) => (
                          <div key={mood} className="flex items-center justify-between">
                            <span className="text-sm text-slate-300 capitalize">{mood}</span>
                            <span className="text-sm text-white">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Market Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(journalStats.marketConditionDistribution).map(([condition, count]) => (
                          <div key={condition} className="flex items-center justify-between">
                            <span className="text-sm text-slate-300 capitalize">{condition}</span>
                            <span className="text-sm text-white">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltraTraderJournal; 