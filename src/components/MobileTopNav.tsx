import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Settings,
  User,
  Bell,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const MobileTopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const topMenuItems = [
    {
      label: 'Overview',
      path: '/',
      testId: 'overview-tab'
    },
    {
      label: 'News',
      path: '/news',
      testId: 'news-tab'
    },
    {
      label: 'Live Trades',
      path: '/live-trades',
      testId: 'live-trades-tab'
    },
    {
      label: 'History',
      path: '/history',
      testId: 'history-tab'
    },
    {
      label: 'Journal',
      path: '/journal',
      testId: 'journal-tab'
    },
    {
      label: 'AI Coach',
      path: '/ai-coach',
      testId: 'ai-coach-tab'
    },
    {
      label: 'Tests',
      path: '/functional-tests',
      testId: 'functional-tests-tab'
    }
  ];

  const handleNavClick = (label: string) => {
    toast({
      title: `Navigating to ${label}`,
      description: '',
      duration: 1000
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
      {/* Top row with user info and settings */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* User info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Trader</span>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom row with compact menu */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border/50">
        <div className="flex items-center space-x-1 flex-1 overflow-x-auto scrollbar-hide">
          {topMenuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                navigate(item.path);
                handleNavClick(item.label);
              }}
              className={cn(
                "h-7 px-2 text-xs font-medium whitespace-nowrap flex-shrink-0",
                location.pathname === item.path 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={item.testId}
            >
              {item.label}
            </Button>
          ))}
        </div>
        
        {/* Add Trade button */}
        <Button
          variant="default"
          size="icon"
          className="h-7 w-7 ml-2 bg-primary hover:bg-primary/90"
          onClick={() => navigate('/add-trade')}
        >
          <PlusCircle className="h-3 w-3" />
        </Button>
      </div>
    </header>
  );
};

export default MobileTopNav; 