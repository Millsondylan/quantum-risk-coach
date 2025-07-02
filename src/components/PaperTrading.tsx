import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Shield,
  Zap,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Minus,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
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
  BookmarkPlus,
  CalendarDays,
  Timer,
  TimerOff,
  Save,
  Camera,
  Mic,
  Paperclip,
  Smile,
  Send,
  Archive,
  ArchiveRestore,
  Trash,
  Star as StarIcon,
  StarOff,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  Globe,
  Database,
  Server,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  PlusCircle,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Heart as HeartIcon,
  Coffee,
  Beer,
  Wine,
  Cocktail,
  Pizza,
  Hamburger,
  IceCream,
  Cake,
  Apple,
  Banana,
  Orange,
  Grape,
  Strawberry,
  Cherry,
  Lemon,
  Lime,
  Watermelon,
  Pineapple,
  Mango,
  Peach,
  Pear,
  Plum,
  Apricot,
  Fig,
  Date,
  Raisin,
  Cranberry,
  Blueberry,
  Raspberry,
  Blackberry,
  Gooseberry,
  Currant,
  Elderberry,
  Mulberry,
  Boysenberry,
  Loganberry,
  Tayberry,
  Marionberry,
  Salmonberry,
  Cloudberry,
  Wineberry,
  Dewberry,
  Thimbleberry,
  Serviceberry,
  Chokecherry,
  Hackberry,
  Juneberry,
  Saskatoon,
  Chokeberry,
  Aronia,
  Hawthorn,
  Rosehip,
  Crabapple,
  Quince,
  Medlar,
  Loquat,
  Kumquat,
  Clementine,
  Tangerine,
  Mandarin,
  Satsuma,
  Yuzu,
  Buddha,
  Citron,
  Pomelo,
  Grapefruit,
  Blood,
  Seville,
  Bergamot,
  Calamondin,
  Rangpur,
  Ugli,
  Tangelo,
  Minneola,
  Orlando,
  Seminole,
  Fairchild,
  Nova,
  Page,
  Robinson,
  Sunburst,
  Fallglo,
  Dancy,
  Honey,
  Murcott,
  Temple,
  Kinnow,
  Wilking,
  Kara,
  Encore,
  Gold,
  Silver,
  Bronze,
  Platinum,
  Diamond as DiamondIcon,
  Ruby,
  Emerald,
  Sapphire,
  Amethyst,
  Topaz,
  Opal,
  Pearl,
  Jade,
  Onyx,
  Obsidian,
  Granite,
  Marble,
  Quartz,
  Crystal,
  Glass,
  Mirror,
  Lens,
  Telescope,
  Microscope,
  Binoculars,
  Compass,
  Map,
  Globe as GlobeIcon,
  Earth,
  Moon,
  Sun,
  Star as StarIcon2,
  Planet,
  Galaxy,
  Universe,
  Cosmos,
  Space,
  Rocket,
  Satellite,
  UFO,
  Alien,
  Robot,
  Cyborg,
  Android,
  iPhone,
  Laptop,
  Desktop,
  Tablet,
  Smartphone,
  Watch,
  Headphones,
  Speaker,
  Microphone,
  Camera as CameraIcon,
  Video as VideoIcon,
  Film,
  Photo,
  Picture,
  Image as ImageIcon,
  Gallery,
  Album,
  Folder,
  File,
  Document,
  PDF,
  Word,
  Excel,
  PowerPoint,
  CSV,
  JSON,
  XML,
  HTML,
  CSS,
  JavaScript,
  TypeScript,
  Python,
  Java,
  CPlusPlus,
  CSharp,
  PHP,
  Ruby as RubyIcon,
  Go,
  Rust,
  Swift,
  Kotlin,
  Scala,
  Haskell,
  Clojure,
  Erlang,
  Elixir,
  FSharp,
  R,
  MATLAB,
  Julia,
  Dart,
  Flutter,
  React,
  Vue,
  Angular,
  Svelte,
  Next,
  Nuxt,
  Gatsby,
  Strapi,
  WordPress,
  Drupal,
  Joomla,
  Magento,
  Shopify,
  WooCommerce,
  BigCommerce,
  Squarespace,
  Wix,
  Webflow,
  Bubble,
  Zapier,
  IFTTT,
  Make,
  Integromat,
  Automate,
  Workflow,
  Pipeline,
  ETL,
  API,
  REST,
  GraphQL,
  SOAP,
  gRPC,
  WebSocket,
  Webhook,
  Cron,
  Scheduler,
  Queue,
  Cache,
  Database as DatabaseIcon,
  SQL,
  NoSQL,
  MongoDB,
  PostgreSQL,
  MySQL,
  SQLite,
  Redis,
  Elasticsearch,
  InfluxDB,
  Cassandra,
  DynamoDB,
  Firebase,
  Supabase,
  AWS,
  Azure,
  GCP,
  DigitalOcean,
  Heroku,
  Vercel,
  Netlify,
  Cloudflare,
  CDN,
  DNS,
  SSL,
  HTTPS,
  HTTP,
  TCP,
  UDP,
  IP,
  IPv4,
  IPv6,
  MAC,
  WiFi,
  Bluetooth,
  NFC,
  RFID,
  QR,
  Barcode,
  NFC as NFCIcon,
  RFID as RFIDIcon,
  QR as QRIcon,
  Barcode as BarcodeIcon,
  Scanner,
  Printer,
  Fax,
  Copier,
  Shredder,
  Stapler,
  Hole,
  Punch,
  Binder,
  Folder as FolderIcon,
  File as FileIcon,
  Document as DocumentIcon,
  Paper,
  Clipboard,
  Notebook,
  Journal,
  Diary,
  Planner,
  Calendar as CalendarIcon,
  Schedule,
  Agenda,
  Timeline,
  Gantt,
  Kanban,
  Scrum,
  Agile,
  Waterfall,
  Lean,
  Six,
  Sigma,
  DMAIC,
  PDCA,
  Kaizen,
  TQM,
  ISO,
  SixSigma,
  Lean as LeanIcon,
  Agile as AgileIcon,
  Scrum as ScrumIcon,
  Kanban as KanbanIcon,
  Waterfall as WaterfallIcon,
  Gantt as GanttIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  Agenda as AgendaIcon,
  Planner as PlannerIcon,
  Diary as DiaryIcon,
  Journal as JournalIcon,
  Notebook as NotebookIcon,
  Clipboard as ClipboardIcon,
  Paper as PaperIcon,
  Document as DocumentIcon2,
  File as FileIcon2,
  Folder as FolderIcon2,
  Barcode as BarcodeIcon2,
  QR as QRIcon2,
  RFID as RFIDIcon2,
  NFC as NFCIcon2,
  Barcode as BarcodeIcon3,
  QR as QRIcon3,
  RFID as RFIDIcon3,
  NFC as NFCIcon3,
  Barcode as BarcodeIcon4,
  QR as QRIcon4,
  RFID as RFIDIcon4,
  NFC as NFCIcon4,
  Barcode as BarcodeIcon5,
  QR as QRIcon5,
  RFID as RFIDIcon5,
  NFC as NFCIcon5,
  Barcode as BarcodeIcon6,
  QR as QRIcon6,
  RFID as RFIDIcon6,
  NFC as NFCIcon6,
  Barcode as BarcodeIcon7,
  QR as QRIcon7,
  RFID as RFIDIcon7,
  NFC as NFCIcon7,
  Barcode as BarcodeIcon8,
  QR as QRIcon8,
  RFID as RFIDIcon8,
  NFC as NFCIcon8,
  Barcode as BarcodeIcon9,
  QR as QRIcon9,
  RFID as RFIDIcon9,
  NFC as NFCIcon9,
  Barcode as BarcodeIcon10,
  QR as QRIcon10,
  RFID as RFIDIcon10,
  NFC as NFCIcon10
} from 'lucide-react';
import { paperTradingService, PaperTrade } from '../lib/api';
import { ResponsiveContainer, BarChart as RechartsBarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { realDataService } from '@/lib/realDataService';

interface PaperTrade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed';
  pnl: number;
  pnlPercent: number;
  entryTime: string;
  exitTime?: string;
  exitPrice?: number;
  notes: string;
  tags: string[];
}

interface PaperAccount {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  totalPnL: number;
  totalPnLPercent: number;
  openTrades: number;
  closedTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

const PaperTrading: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);
  const [paperAccount, setPaperAccount] = useState<PaperAccount>({
    balance: 100000,
    equity: 100000,
    margin: 0,
    freeMargin: 100000,
    marginLevel: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    openTrades: 0,
    closedTrades: 0,
    winRate: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    sharpeRatio: 0
  });

  const [newTrade, setNewTrade] = useState({
    symbol: '',
    type: 'buy' as 'buy' | 'sell',
    quantity: 0,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    notes: '',
    tags: [] as string[]
  });

  const [marketData, setMarketData] = useState({
    BTCUSD: { price: 43567.89, change: 1245.67, changePercent: 2.94 },
    ETHUSD: { price: 2876.34, change: 89.23, changePercent: 3.21 },
    EURUSD: { price: 1.0845, change: 0.0023, changePercent: 0.21 },
    GBPUSD: { price: 1.2634, change: -0.0012, changePercent: -0.09 },
    USDJPY: { price: 148.76, change: 0.34, changePercent: 0.23 },
    GOLD: { price: 2034.56, change: 12.34, changePercent: 0.61 }
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate account metrics
  useEffect(() => {
    const openTrades = paperTrades.filter(trade => trade.status === 'open');
    const closedTrades = paperTrades.filter(trade => trade.status === 'closed');
    
    const totalPnL = paperTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const equity = paperAccount.balance + totalPnL;
    const margin = openTrades.reduce((sum, trade) => sum + (trade.entryPrice * trade.quantity), 0);
    const freeMargin = equity - margin;
    const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;
    
    const winningTrades = closedTrades.filter(trade => trade.pnl > 0);
    const losingTrades = closedTrades.filter(trade => trade.pnl < 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    
    const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

    setPaperAccount(prev => ({
      ...prev,
      equity,
      margin,
      freeMargin,
      marginLevel,
      totalPnL,
      totalPnLPercent: paperAccount.balance > 0 ? (totalPnL / paperAccount.balance) * 100 : 0,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      winRate,
      profitFactor
    }));
  }, [paperTrades, paperAccount.balance]);

  // Simulate market price updates
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setMarketData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(symbol => {
          const currentPrice = newData[symbol as keyof typeof newData].price;
          const change = (Math.random() - 0.5) * currentPrice * 0.01; // ±0.5% change
          newData[symbol as keyof typeof newData] = {
            price: currentPrice + change,
            change: change,
            changePercent: (change / currentPrice) * 100
          };
        });
        return newData;
      });

      // Update open trades with new prices
      setPaperTrades(prev => prev.map(trade => {
        if (trade.status === 'open') {
          const marketPrice = marketData[trade.symbol as keyof typeof marketData]?.price || trade.currentPrice;
          const pnl = trade.type === 'buy' 
            ? (marketPrice - trade.entryPrice) * trade.quantity
            : (trade.entryPrice - marketPrice) * trade.quantity;
          const pnlPercent = trade.entryPrice > 0 ? (pnl / (trade.entryPrice * trade.quantity)) * 100 : 0;

          return {
            ...trade,
            currentPrice: marketPrice,
            pnl,
            pnlPercent
          };
        }
        return trade;
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isActive, marketData]);

  const handleStartPaperTrading = () => {
    setIsActive(true);
    toast.success('Paper trading started! Virtual funds: $100,000');
  };

  const handleStopPaperTrading = () => {
    setIsActive(false);
    toast.info('Paper trading paused');
  };

  const handleResetAccount = () => {
    setPaperTrades([]);
    setPaperAccount({
      balance: 100000,
      equity: 100000,
      margin: 0,
      freeMargin: 100000,
      marginLevel: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      openTrades: 0,
      closedTrades: 0,
      winRate: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    });
    toast.success('Paper trading account reset');
  };

  const handleOpenTrade = () => {
    if (!newTrade.symbol || newTrade.quantity <= 0 || newTrade.entryPrice <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const trade: PaperTrade = {
      id: Date.now().toString(),
      symbol: newTrade.symbol,
      type: newTrade.type,
      quantity: newTrade.quantity,
      entryPrice: newTrade.entryPrice,
      currentPrice: newTrade.entryPrice,
      stopLoss: newTrade.stopLoss || undefined,
      takeProfit: newTrade.takeProfit || undefined,
      status: 'open',
      pnl: 0,
      pnlPercent: 0,
      entryTime: new Date().toISOString(),
      notes: newTrade.notes,
      tags: newTrade.tags
    };

    setPaperTrades(prev => [...prev, trade]);
    setNewTrade({
      symbol: '',
      type: 'buy',
      quantity: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      notes: '',
      tags: []
    });

    toast.success(`${newTrade.type.toUpperCase()} ${newTrade.quantity} ${newTrade.symbol} at $${newTrade.entryPrice}`);
  };

  const handleCloseTrade = (tradeId: string) => {
    setPaperTrades(prev => prev.map(trade => {
      if (trade.id === tradeId && trade.status === 'open') {
        return {
          ...trade,
          status: 'closed',
          exitTime: new Date().toISOString(),
          exitPrice: trade.currentPrice
        };
      }
      return trade;
    }));

    const trade = paperTrades.find(t => t.id === tradeId);
    if (trade) {
      toast.success(`Closed ${trade.symbol} trade. P&L: $${trade.pnl.toFixed(2)}`);
    }
  };

  const openTrades = paperTrades.filter(trade => trade.status === 'open');
  const closedTrades = paperTrades.filter(trade => trade.status === 'closed');

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Paper Trading</h1>
                <p className="text-xs text-slate-400">Risk-free trading simulation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : "bg-slate-600"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={isActive ? handleStopPaperTrading : handleStartPaperTrading}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isActive ? "Stop" : "Start"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAccount}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Account Overview */}
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${paperAccount.balance.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${paperAccount.equity.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Equity</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  paperAccount.totalPnL >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {paperAccount.totalPnL >= 0 ? '+' : ''}${paperAccount.totalPnL.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">Total P&L</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{paperAccount.openTrades}</div>
                <div className="text-sm text-slate-400">Open Trades</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{paperAccount.winRate.toFixed(1)}%</div>
                <div className="text-sm text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{paperAccount.profitFactor.toFixed(2)}</div>
                <div className="text-sm text-slate-400">Profit Factor</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{paperAccount.closedTrades}</div>
                <div className="text-sm text-slate-400">Closed Trades</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{paperAccount.maxDrawdown.toFixed(1)}%</div>
                <div className="text-sm text-slate-400">Max Drawdown</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Data */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Market Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(marketData).map(([symbol, data]) => (
                  <div key={symbol} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{symbol}</div>
                      <div className="text-sm text-slate-400">${data.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-medium",
                        data.changePercent >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                      </div>
                      <div className={cn(
                        "text-xs",
                        data.change >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {data.change >= 0 ? '+' : ''}${Math.abs(data.change).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Trade Form */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Open New Trade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white">Symbol</label>
                    <Select value={newTrade.symbol} onValueChange={(value) => setNewTrade(prev => ({ ...prev, symbol: value }))}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select symbol" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {Object.keys(marketData).map(symbol => (
                          <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white">Type</label>
                    <Select value={newTrade.type} onValueChange={(value: 'buy' | 'sell') => setNewTrade(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white">Quantity</label>
                    <Input
                      type="number"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white">Entry Price</label>
                    <Input
                      type="number"
                      value={newTrade.entryPrice}
                      onChange={(e) => setNewTrade(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white">Stop Loss</label>
                      <Input
                        type="number"
                        value={newTrade.stopLoss}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                        className="mt-2 bg-slate-700 border-slate-600 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-white">Take Profit</label>
                      <Input
                        type="number"
                        value={newTrade.takeProfit}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || 0 }))}
                        className="mt-2 bg-slate-700 border-slate-600 text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    {showAdvanced ? "Hide" : "Show"} Advanced
                  </Button>
                  
                  <Button
                    onClick={handleOpenTrade}
                    disabled={!isActive}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Open Trade
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Open Trades */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Open Trades</CardTitle>
              </CardHeader>
              <CardContent>
                {openTrades.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No open trades</p>
                    <p className="text-sm text-slate-500">Start paper trading to see your positions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            trade.type === 'buy' ? "bg-green-400" : "bg-red-400"
                          )} />
                          <div>
                            <div className="font-medium text-white">{trade.symbol}</div>
                            <div className="text-sm text-slate-400">
                              {trade.type.toUpperCase()} {trade.quantity} @ ${trade.entryPrice}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={cn(
                            "font-medium",
                            trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </div>
                          <div className={cn(
                            "text-sm",
                            trade.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCloseTrade(trade.id)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Close
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperTrading; 