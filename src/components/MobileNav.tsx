import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  BarChart3,
  PlusCircle,
  BookOpen,
  Brain,
  Settings,
  Bell,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      testId: 'dashboard-tab'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/history',
      testId: 'analytics-tab'
    },
    {
      icon: PlusCircle,
      label: 'Add Trade',
      path: '/add-trade',
      testId: 'add-trade-tab'
    },
    {
      icon: BookOpen,
      label: 'Journal',
      path: '/journal',
      testId: 'journal-tab'
    },
    {
      icon: Brain,
      label: 'AI Coach',
      path: '/ai-coach',
      testId: 'ai-coach-tab'
    }
  ];

  const handleNavClick = (label: string, path: string) => {
    navigate(path);
    toast({
      title: `Navigating to ${label}`,
      description: `Opening ${label.toLowerCase()} section`,
      duration: 1000
    });
  };

  return (
    <>
      {/* Top Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#2A2B2E] p-4 w-full">
        <div className="flex items-center justify-between">
          {/* App Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Quantum Risk Coach</span>
              <span className="text-xs text-slate-400">Trading Dashboard</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50"
              onClick={() => navigate('/alarms')}
            >
              <Bell className="h-5 w-5 text-slate-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5 text-slate-300" />
            </Button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Fixed */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0B0D]/95 backdrop-blur-xl border-t border-[#2A2B2E] p-4 w-full"
        role="navigation"
        aria-label="Mobile Navigation"
        data-testid="mobile-bottom-nav"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => handleNavClick(item.label, item.path)}
                className={cn(
                  "nav-item h-12 px-3 min-w-0 flex-1",
                  isActive 
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                )}
                data-testid={item.testId}
              >
                <div className="flex flex-col items-center space-y-1">
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-400"
                  )} />
                  <span className="text-xs font-medium leading-tight text-center">
                    {item.label}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav; 