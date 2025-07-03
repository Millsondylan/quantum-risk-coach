import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LineChart, 
  BookOpen, 
  PlusCircle, 
  BarChart3, 
  Settings,
  Newspaper,
  Target,
  Calendar,
  Lightbulb,
  Bell,
  Zap,
  TestTube
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const navItems = [
    {
      icon: PlusCircle,
      label: 'Add Trade',
      path: '/add-trade',
      testId: 'add-trade-tab'
    },
    {
      icon: BarChart3,
      label: 'Portfolio',
      path: '/portfolio',
      testId: 'portfolio-tab'
    },
    {
      icon: Calendar,
      label: 'Calendar',
      path: '/calendar',
      testId: 'calendar-tab'
    },
    {
      icon: Zap,
      label: 'AI Coach',
      path: '/ai-coach',
      testId: 'ai-coach-tab'
    },
    {
      icon: TestTube,
      label: 'Tests',
      path: '/functional-tests',
      testId: 'functional-tests-tab'
    }
  ];

  const handleNavClick = (label: string, description: string) => {
    toast({
      title: `Navigating to ${label}`,
      description: description,
      duration: 1000
    });
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 flex justify-around p-1 space-x-0.5"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={location.pathname === item.path ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => {
            navigate(item.path);
            handleNavClick(item.label, '');
          }}
          className="flex-1 max-w-[60px] min-w-[50px] px-1"
          data-testid={item.testId}
        >
          <div className="flex flex-col items-center">
            <item.icon 
              className={`h-4 w-4 ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`} 
            />
            <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
          </div>
        </Button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;