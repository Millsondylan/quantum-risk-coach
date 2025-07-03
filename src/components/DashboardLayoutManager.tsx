import React, { useState, useEffect } from 'react';
import { DashboardWidget, WidgetConfig } from './DashboardWidget';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Layout, 
  Save,
  RotateCcw,
  Settings2,
  TrendingUp,
  BarChart3,
  Activity,
  DollarSign,
  Bell,
  Calendar,
  Target,
  Newspaper,
  PieChart as PieChartIcon,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

// Available widget types
export const WIDGET_TYPES = {
  PORTFOLIO_OVERVIEW: {
    id: 'portfolio-overview',
    title: 'Portfolio Overview',
    icon: DollarSign,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'PortfolioOverview'
  },
  TRADE_ANALYTICS: {
    id: 'trade-analytics',
    title: 'Trade Analytics',
    icon: BarChart3,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'TradeAnalytics'
  },
  ASSET_ALLOCATION: {
    id: 'asset-allocation',
    title: 'Asset Allocation',
    icon: PieChartIcon,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'AssetAllocationChart'
  },
  EQUITY_CURVE: {
    id: 'equity-curve',
    title: 'Equity Curve',
    icon: Wallet,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'EquityCurveChart'
  },
  WATCHLIST: {
    id: 'watchlist',
    title: 'Watchlist',
    icon: Activity,
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    component: 'Watchlist'
  },
  RECENT_TRADES: {
    id: 'recent-trades',
    title: 'Recent Trades',
    icon: TrendingUp,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'RecentTrades'
  },
  NEWS_FEED: {
    id: 'news-feed',
    title: 'News Feed',
    icon: Newspaper,
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    component: 'NewsFeed'
  },
  ALERTS: {
    id: 'alerts',
    title: 'Price Alerts',
    icon: Bell,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'PriceAlerts'
  },
  CALENDAR: {
    id: 'calendar',
    title: 'Economic Calendar',
    icon: Calendar,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'EconomicCalendar'
  },
  GOALS: {
    id: 'goals',
    title: 'Trading Goals',
    icon: Target,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    component: 'TradingGoals'
  }
};

interface DashboardLayoutManagerProps {
  children: (widget: WidgetConfig) => React.ReactNode;
}

export const DashboardLayoutManager: React.FC<DashboardLayoutManagerProps> = ({ children }) => {
  const { user, updatePreferences } = useUser();
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Load saved layout from user preferences
  useEffect(() => {
    if (user?.preferences?.dashboardLayout) {
      setWidgets(user.preferences.dashboardLayout);
    } else {
      // Default layout
      setWidgets([
        {
          id: 'widget-1',
          type: 'portfolio-overview',
          title: 'Portfolio Overview',
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          isVisible: true
        },
        {
          id: 'widget-2',
          type: 'trade-analytics',
          title: 'Trade Analytics',
          x: 2,
          y: 0,
          w: 3,
          h: 2,
          isVisible: true
        },
        {
          id: 'widget-3',
          type: 'watchlist',
          title: 'Watchlist',
          x: 5,
          y: 0,
          w: 2,
          h: 3,
          isVisible: true
        },
        {
          id: 'widget-4',
          type: 'recent-trades',
          title: 'Recent Trades',
          x: 0,
          y: 2,
          w: 3,
          h: 2,
          isVisible: true
        }
      ]);
    }
  }, [user]);

  const saveLayout = async () => {
    try {
      await updatePreferences({ dashboardLayout: widgets });
      toast.success('Dashboard layout saved!');
    } catch (error) {
      toast.error('Failed to save layout');
    }
  };

  const resetLayout = () => {
    const defaultLayout = [
      {
        id: 'widget-1',
        type: 'portfolio-overview',
        title: 'Portfolio Overview',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        isVisible: true
      },
      {
        id: 'widget-2',
        type: 'trade-analytics',
        title: 'Trade Analytics',
        x: 2,
        y: 0,
        w: 3,
        h: 2,
        isVisible: true
      },
      {
        id: 'widget-3',
        type: 'watchlist',
        title: 'Watchlist',
        x: 5,
        y: 0,
        w: 2,
        h: 3,
        isVisible: true
      },
      {
        id: 'widget-4',
        type: 'recent-trades',
        title: 'Recent Trades',
        x: 0,
        y: 2,
        w: 3,
        h: 2,
        isVisible: true
      }
    ];
    setWidgets(defaultLayout);
    toast.success('Layout reset to default');
  };

  const addWidget = (type: string) => {
    const widgetType = Object.values(WIDGET_TYPES).find(w => w.id === type);
    if (!widgetType) return;

    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: widgetType.id,
      title: widgetType.title,
      x: 0,
      y: 0,
      w: widgetType.defaultSize.w,
      h: widgetType.defaultSize.h,
      minW: widgetType.minSize.w,
      minH: widgetType.minSize.h,
      isVisible: true
    };

    setWidgets([...widgets, newWidget]);
    setIsAddWidgetOpen(false);
    toast.success(`Added ${widgetType.title} widget`);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    toast.success('Widget removed');
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, isVisible: !w.isVisible } : w
    ));
  };

  const updateWidgetSize = (id: string, size: { w: number; h: number }) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, ...size } : w
    ));
  };

  return (
    <div className="space-y-4">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(isEditMode && "ring-2 ring-blue-500")}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {isEditMode ? 'Done Editing' : 'Edit Layout'}
          </Button>
          
          {isEditMode && (
            <>
              <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Widget</DialogTitle>
                    <DialogDescription>
                      Choose a widget to add to your dashboard
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {Object.values(WIDGET_TYPES).map((widget) => {
                      const Icon = widget.icon;
                      const isAlreadyAdded = widgets.some(w => w.type === widget.id);
                      
                      return (
                        <Button
                          key={widget.id}
                          variant="outline"
                          className="h-auto flex-col gap-2 p-4"
                          onClick={() => addWidget(widget.id)}
                          disabled={isAlreadyAdded}
                        >
                          <Icon className="w-8 h-8 text-slate-400" />
                          <span className="text-sm">{widget.title}</span>
                          {isAlreadyAdded && (
                            <span className="text-xs text-slate-500">Already added</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={saveLayout}>
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
              
              <Button variant="outline" size="sm" onClick={resetLayout}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 min-h-[600px]">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              "transition-all duration-200",
              `col-span-${widget.w}`,
              `row-span-${widget.h}`,
              draggedWidget === widget.id && "opacity-50"
            )}
            style={{
              gridColumn: `span ${widget.w} / span ${widget.w}`,
              gridRow: `span ${widget.h} / span ${widget.h}`
            }}
          >
            <DashboardWidget
              config={widget}
              onRemove={isEditMode ? removeWidget : undefined}
              onToggleVisibility={isEditMode ? toggleWidgetVisibility : undefined}
              onResize={isEditMode ? updateWidgetSize : undefined}
              isDragging={draggedWidget === widget.id}
            >
              {children(widget)}
            </DashboardWidget>
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No widgets added yet</p>
          <Button onClick={() => setIsAddWidgetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      )}
    </div>
  );
}; 