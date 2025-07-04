import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Upload, 
  Download, 
  Settings, 
  HelpCircle, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  FileText,
  Target,
  Bell,
  BookOpen,
  Database,
  Zap,
  Sparkles,
  Rocket,
  Star,
  Award,
  Trophy,
  Lightbulb,
  Users,
  Globe,
  Shield,
  Lock,
  Key,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Filter,
  Search,
  Grid,
  List,
  Eye,
  EyeOff,
  Copy,
  Share,
  Edit,
  Trash2,
  Archive,
  Folder,
  File,
  Image,
  Video,
  Music,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Phone,
  Mail,
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Gift,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Bitcoin,
  Coins,
  PiggyBank,
  Wallet,
  Banknote,
  Receipt,
  Tag,
  Hash,
  AtSign,
  Percent,
  Infinity,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Home,
  Menu,
  MoreHorizontal,
  MoreVertical,
  XCircle,
  AlertCircle,
  CheckCircle2,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  UserCog,
  LogOut,
  LogIn,
  Unlock,
  Cog,
  Wrench,
  Hammer,
  Ruler,
  Compass,
  Map,
  Navigation
} from 'lucide-react';
import { EmptyStateManager } from '@/lib/dataValidation';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export interface EmptyStateHelpItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  link?: string;
  action?: () => void;
}

export interface EmptyStateFeature {
  name: string;
  description: string;
  icon?: React.ReactNode;
  badge?: 'new' | 'beta' | 'pro' | 'premium';
  enabled?: boolean;
}

export interface EmptyStateProps {
  type: 'trades' | 'portfolio' | 'analytics' | 'history' | 'dashboard' | 'watchlist' | 'goals' | 'news' | 'alerts' | 'journal' | 'data' | 'settings' | 'api' | 'backup' | 'import' | 'export' | 'sync' | 'search' | 'filter' | 'custom';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: EmptyStateAction[];
  helpItems?: EmptyStateHelpItem[];
  features?: EmptyStateFeature[];
  showDefaultActions?: boolean;
  showHelp?: boolean;
  showFeatures?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed' | 'featured';
}

const getDefaultConfig = (type: EmptyStateProps['type']) => {
  const configs = {
    trades: {
      title: 'No Trades Yet',
      description: 'Start tracking your trading performance by adding your first trade.',
      icon: <TrendingUp className="h-12 w-12 text-blue-500" />,
      defaultActions: [
        {
          label: 'Add Trade',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        },
        {
          label: 'Import CSV',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <Upload className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'How to Add Trades',
          description: 'Learn how to manually add trades and track your performance.',
          icon: <HelpCircle className="h-4 w-4" />
        },
        {
          title: 'Import from Broker',
          description: 'Import your trading history from your broker platform.',
          icon: <Download className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Trade Builder',
          description: 'Advanced trade entry with real-time data',
          icon: <Plus className="h-4 w-4" />,
          badge: 'new'
        },
        {
          name: 'CSV Import',
          description: 'Import trades from CSV files',
          icon: <Upload className="h-4 w-4" />
        },
        {
          name: 'Auto Sync',
          description: 'Automatically sync with your broker',
          icon: <RefreshCw className="h-4 w-4" />,
          badge: 'pro'
        }
      ]
    },
    portfolio: {
      title: 'No Portfolio Created',
      description: 'Create your first portfolio to organize and track your investments.',
      icon: <BarChart3 className="h-12 w-12 text-green-500" />,
      defaultActions: [
        {
          label: 'Create Portfolio',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Portfolio Management',
          description: 'Learn how to create and manage multiple portfolios.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Multi-Portfolio',
          description: 'Manage multiple investment portfolios',
          icon: <BarChart3 className="h-4 w-4" />
        },
        {
          name: 'Performance Tracking',
          description: 'Track portfolio performance over time',
          icon: <TrendingUp className="h-4 w-4" />
        }
      ]
    },
    analytics: {
      title: 'No Analytics Data',
      description: 'Add some trades to start seeing detailed analytics and insights.',
      icon: <BarChart3 className="h-12 w-12 text-purple-500" />,
      defaultActions: [
        {
          label: 'Add Trades',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        },
        {
          label: 'View Demo',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <Play className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Analytics Guide',
          description: 'Learn about the different analytics available.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Performance Metrics',
          description: 'Comprehensive performance analysis',
          icon: <TrendingUp className="h-4 w-4" />
        },
        {
          name: 'Risk Analysis',
          description: 'Advanced risk assessment tools',
          icon: <Shield className="h-4 w-4" />,
          badge: 'pro'
        },
        {
          name: 'AI Insights',
          description: 'AI-powered trading insights',
          icon: <Sparkles className="h-4 w-4" />,
          badge: 'premium'
        }
      ]
    },
    history: {
      title: 'No Trading History',
      description: 'Your trading history will appear here once you add some trades.',
      icon: <Calendar className="h-12 w-12 text-orange-500" />,
      defaultActions: [
        {
          label: 'Add Trades',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        },
        {
          label: 'Import History',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <Upload className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Import Trading History',
          description: 'Learn how to import your existing trading history.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Trade History',
          description: 'Complete trading history tracking',
          icon: <Calendar className="h-4 w-4" />
        },
        {
          name: 'Performance Analysis',
          description: 'Historical performance insights',
          icon: <TrendingUp className="h-4 w-4" />
        }
      ]
    },
    dashboard: {
      title: 'Dashboard Empty',
      description: 'Customize your dashboard by adding widgets and configuring your layout.',
      icon: <Grid className="h-12 w-12 text-indigo-500" />,
      defaultActions: [
        {
          label: 'Add Widgets',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        },
        {
          label: 'Customize Layout',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <Settings className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Dashboard Setup',
          description: 'Learn how to customize your dashboard.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Custom Widgets',
          description: 'Add and customize dashboard widgets',
          icon: <Grid className="h-4 w-4" />
        },
        {
          name: 'Layout Manager',
          description: 'Drag and drop layout customization',
          icon: <Settings className="h-4 w-4" />
        }
      ]
    },
    watchlist: {
      title: 'No Watchlist Items',
      description: 'Add symbols to your watchlist to track their performance.',
      icon: <Eye className="h-12 w-12 text-cyan-500" />,
      defaultActions: [
        {
          label: 'Add Symbol',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Managing Watchlists',
          description: 'Learn how to create and manage watchlists.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Symbol Tracking',
          description: 'Track multiple symbols in watchlists',
          icon: <Eye className="h-4 w-4" />
        },
        {
          name: 'Price Alerts',
          description: 'Set alerts for price movements',
          icon: <Bell className="h-4 w-4" />
        }
      ]
    },
    goals: {
      title: 'No Trading Goals Set',
      description: 'Set trading goals to track your progress and stay motivated.',
      icon: <Target className="h-12 w-12 text-red-500" />,
      defaultActions: [
        {
          label: 'Set Goal',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Setting Trading Goals',
          description: 'Learn how to set realistic trading goals.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Goal Tracking',
          description: 'Track progress towards trading goals',
          icon: <Target className="h-4 w-4" />
        },
        {
          name: 'Performance Metrics',
          description: 'Monitor goal achievement metrics',
          icon: <TrendingUp className="h-4 w-4" />
        }
      ]
    },
    news: {
      title: 'No News Available',
      description: 'Configure your news sources to get the latest market updates.',
      icon: <FileText className="h-12 w-12 text-yellow-500" />,
      defaultActions: [
        {
          label: 'Configure Sources',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Settings className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'News Configuration',
          description: 'Learn how to set up news sources.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Market News',
          description: 'Real-time market news and updates',
          icon: <FileText className="h-4 w-4" />
        },
        {
          name: 'News Filtering',
          description: 'Filter news by relevance and source',
          icon: <Filter className="h-4 w-4" />
        }
      ]
    },
    alerts: {
      title: 'No Alerts Set',
      description: 'Create price alerts and notifications to stay informed.',
      icon: <Bell className="h-12 w-12 text-pink-500" />,
      defaultActions: [
        {
          label: 'Create Alert',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Setting Up Alerts',
          description: 'Learn how to create and manage alerts.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Price Alerts',
          description: 'Set alerts for price movements',
          icon: <Bell className="h-4 w-4" />
        },
        {
          name: 'Push Notifications',
          description: 'Get notified on your device',
          icon: <Bell className="h-4 w-4" />
        }
      ]
    },
    journal: {
      title: 'No Journal Entries',
      description: 'Start journaling your trading thoughts and lessons learned.',
      icon: <BookOpen className="h-12 w-12 text-emerald-500" />,
      defaultActions: [
        {
          label: 'Write Entry',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Trading Journal Guide',
          description: 'Learn how to maintain an effective trading journal.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Trading Journal',
          description: 'Document your trading thoughts and lessons',
          icon: <BookOpen className="h-4 w-4" />
        },
        {
          name: 'Entry Templates',
          description: 'Use templates for consistent journaling',
          icon: <FileText className="h-4 w-4" />
        }
      ]
    },
    data: {
      title: 'No Data Available',
      description: 'Import or connect data sources to start analyzing your trading data.',
      icon: <Database className="h-12 w-12 text-slate-500" />,
      defaultActions: [
        {
          label: 'Import Data',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Upload className="h-4 w-4" />
        },
        {
          label: 'Connect Sources',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <Zap className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Data Import Guide',
          description: 'Learn how to import your trading data.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Data Import',
          description: 'Import data from various sources',
          icon: <Upload className="h-4 w-4" />
        },
        {
          name: 'Data Validation',
          description: 'Validate and clean imported data',
          icon: <CheckCircle className="h-4 w-4" />
        }
      ]
    },
    settings: {
      title: 'Settings Not Configured',
      description: 'Configure your preferences and settings to personalize your experience.',
      icon: <Settings className="h-12 w-12 text-gray-500" />,
      defaultActions: [
        {
          label: 'Configure Settings',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Settings className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Settings Guide',
          description: 'Learn how to configure your preferences.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Preferences',
          description: 'Customize your trading experience',
          icon: <Settings className="h-4 w-4" />
        },
        {
          name: 'Theme Options',
          description: 'Choose your preferred theme',
          icon: <Settings className="h-4 w-4" />
        }
      ]
    },
    api: {
      title: 'API Keys Not Configured',
      description: 'Add your API keys to enable advanced features and data integration.',
      icon: <Key className="h-12 w-12 text-blue-500" />,
      defaultActions: [
        {
          label: 'Add API Keys',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        },
        {
          label: 'Learn More',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'API Setup Guide',
          description: 'Learn how to set up API keys for data integration.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'API Integration',
          description: 'Connect to external data sources',
          icon: <Key className="h-4 w-4" />
        },
        {
          name: 'Secure Storage',
          description: 'Encrypted API key storage',
          icon: <Shield className="h-4 w-4" />
        }
      ]
    },
    backup: {
      title: 'No Backups Available',
      description: 'Create backups of your trading data to keep it safe and secure.',
      icon: <Shield className="h-12 w-12 text-green-500" />,
      defaultActions: [
        {
          label: 'Create Backup',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Backup Guide',
          description: 'Learn how to create and manage backups.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Data Backup',
          description: 'Secure backup of your trading data',
          icon: <Shield className="h-4 w-4" />
        },
        {
          name: 'Auto Backup',
          description: 'Automatic backup scheduling',
          icon: <RefreshCw className="h-4 w-4" />
        }
      ]
    },
    import: {
      title: 'No Data to Import',
      description: 'Select files or connect sources to import your trading data.',
      icon: <Upload className="h-12 w-12 text-blue-500" />,
      defaultActions: [
        {
          label: 'Select Files',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Upload className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Import Guide',
          description: 'Learn how to import your data.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'File Import',
          description: 'Import data from various file formats',
          icon: <Upload className="h-4 w-4" />
        },
        {
          name: 'Data Validation',
          description: 'Validate imported data',
          icon: <CheckCircle className="h-4 w-4" />
        }
      ]
    },
    export: {
      title: 'No Data to Export',
      description: 'Add some data first, then you can export it in various formats.',
      icon: <Download className="h-12 w-12 text-green-500" />,
      defaultActions: [
        {
          label: 'Add Data',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Plus className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Export Guide',
          description: 'Learn how to export your data.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Data Export',
          description: 'Export data in various formats',
          icon: <Download className="h-4 w-4" />
        },
        {
          name: 'Format Options',
          description: 'Multiple export format options',
          icon: <FileText className="h-4 w-4" />
        }
      ]
    },
    sync: {
      title: 'No Sync Configured',
      description: 'Configure data synchronization to keep your data up to date.',
      icon: <RefreshCw className="h-12 w-12 text-purple-500" />,
      defaultActions: [
        {
          label: 'Configure Sync',
          onClick: () => {},
          variant: 'default' as const,
          icon: <Settings className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Sync Guide',
          description: 'Learn how to configure data synchronization.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Data Sync',
          description: 'Synchronize data across devices',
          icon: <RefreshCw className="h-4 w-4" />
        },
        {
          name: 'Auto Sync',
          description: 'Automatic data synchronization',
          icon: <Settings className="h-4 w-4" />
        }
      ]
    },
    search: {
      title: 'No Search Results',
      description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
      icon: <Search className="h-12 w-12 text-gray-500" />,
      defaultActions: [
        {
          label: 'Clear Filters',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <X className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Search Tips',
          description: 'Learn how to use advanced search features.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Advanced Search',
          description: 'Search across all your data',
          icon: <Search className="h-4 w-4" />
        },
        {
          name: 'Search Filters',
          description: 'Filter search results',
          icon: <Filter className="h-4 w-4" />
        }
      ]
    },
    filter: {
      title: 'No Filtered Results',
      description: 'No items match your current filters. Try adjusting your criteria.',
      icon: <Filter className="h-12 w-12 text-gray-500" />,
      defaultActions: [
        {
          label: 'Clear Filters',
          onClick: () => {},
          variant: 'outline' as const,
          icon: <X className="h-4 w-4" />
        }
      ],
      helpItems: [
        {
          title: 'Filter Guide',
          description: 'Learn how to use filters effectively.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Advanced Filters',
          description: 'Filter data by multiple criteria',
          icon: <Filter className="h-4 w-4" />
        },
        {
          name: 'Filter Presets',
          description: 'Save and reuse filter combinations',
          icon: <Filter className="h-4 w-4" />
        }
      ]
    },
    custom: {
      title: 'No Items Found',
      description: 'There are no items to display in this section.',
      icon: <Info className="h-12 w-12 text-gray-500" />,
      defaultActions: [],
      helpItems: [
        {
          title: 'Getting Started',
          description: 'Learn how to get started with this section.',
          icon: <HelpCircle className="h-4 w-4" />
        }
      ],
      features: [
        {
          name: 'Custom Section',
          description: 'Customizable section for your needs',
          icon: <Settings className="h-4 w-4" />
        }
      ]
    }
  };

  return configs[type] || configs.custom;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  icon,
  actions,
  helpItems,
  features,
  showDefaultActions = true,
  showHelp = true,
  showFeatures = true,
  className = '',
  variant = 'default'
}) => {
  const config = getDefaultConfig(type);
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIcon = icon || config.icon;
  const finalActions = actions || (showDefaultActions ? config.defaultActions : []);
  const finalHelpItems = helpItems || (showHelp ? (config.helpItems || []) : []);
  const finalFeatures = features || (showFeatures ? (config.features || []) : []);

  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case 'new': return 'default';
      case 'beta': return 'secondary';
      case 'pro': return 'outline';
      case 'premium': return 'destructive';
      default: return 'outline';
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'new': return 'bg-blue-500 text-white';
      case 'beta': return 'bg-purple-500 text-white';
      case 'pro': return 'bg-green-500 text-white';
      case 'premium': return 'bg-yellow-500 text-black';
      default: return '';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        {finalIcon}
        <h3 className="mt-4 text-lg font-semibold text-white">{finalTitle}</h3>
        <p className="mt-2 text-sm text-gray-400">{finalDescription}</p>
        {finalActions.length > 0 && (
          <div className="mt-4 flex gap-2">
            {finalActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant}
                disabled={action.disabled}
                className="flex items-center gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`holo-card ${className}`}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="mb-6">
            {finalIcon}
          </div>

          {/* Title and Description */}
          <div className="mb-8 max-w-md">
            <h3 className="text-2xl font-bold text-white mb-2">{finalTitle}</h3>
            <p className="text-gray-400 leading-relaxed">{finalDescription}</p>
          </div>

          {/* Actions */}
          {finalActions.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-3 justify-center">
              {finalActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant}
                  disabled={action.disabled}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Help Items */}
          {finalHelpItems.length > 0 && (
            <div className="mb-8 w-full max-w-2xl">
              <Separator className="mb-6" />
              <h4 className="text-lg font-semibold text-white mb-4">Need Help?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finalHelpItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={item.action}
                  >
                    <div className="text-gray-400 mt-1">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <h5 className="font-medium text-white mb-1">{item.title}</h5>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {finalFeatures.length > 0 && (
            <div className="w-full max-w-3xl">
              <Separator className="mb-6" />
              <h4 className="text-lg font-semibold text-white mb-4">Available Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {finalFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-colors ${
                      feature.enabled === false 
                        ? 'border-gray-700 bg-gray-800/50 opacity-50' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-400">
                          {feature.icon}
                        </div>
                        <h5 className="font-medium text-white">{feature.name}</h5>
                      </div>
                      {feature.badge && (
                        <Badge 
                          variant={getBadgeVariant(feature.badge)}
                          className={`text-xs ${getBadgeColor(feature.badge)}`}
                        >
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Pre-configured empty state components
export const TradesEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="trades" {...props} />
);

export const PortfolioEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="portfolio" {...props} />
);

export const AnalyticsEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="analytics" {...props} />
);

export const HistoryEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="history" {...props} />
);

export const DashboardEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="dashboard" {...props} />
);

export const WatchlistEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="watchlist" {...props} />
);

export const GoalsEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="goals" {...props} />
);

export const NewsEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="news" {...props} />
);

export const AlertsEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="alerts" {...props} />
);

export const JournalEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="journal" {...props} />
);

export const DataEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="data" {...props} />
); 