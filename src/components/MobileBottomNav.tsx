import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  PlusCircle, 
  BarChart3, 
  Settings,
  TrendingUp,
  Target,
  Calendar,
  User,
  LineChart,
  Search,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

// UltraTrader-style mobile navigation matching their exact interface
const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Overview',
      activeColor: 'text-blue-400',
      paths: ['/'],
      testId: 'nav-overview'
    },
    {
      href: '/journal',
      icon: BookOpen,
      label: 'Journal',
      activeColor: 'text-blue-400',
      paths: ['/journal'],
      testId: 'nav-journal'
    },
    {
      href: '/trade-builder',
      icon: PlusCircle,
      label: 'Trade',
      activeColor: 'text-blue-400',
      isHighlight: true,
      paths: ['/trade-builder'],
      testId: 'nav-trade'
    },
    {
      href: '/performance-calendar',
      icon: BarChart3,
      label: 'Analytics',
      activeColor: 'text-blue-400',
      paths: ['/performance-calendar', '/strategy-analyzer'],
      testId: 'nav-analytics'
    },
    {
      href: '/settings',
      icon: User,
      label: 'Profile',
      activeColor: 'text-blue-400',
      paths: ['/settings'],
      testId: 'nav-profile'
    }
  ];

  const isActivePath = (paths: string[]) => {
    return paths.some(path => location.pathname === path || location.pathname.startsWith(path));
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0B0D]/95 backdrop-blur-xl border-t border-[#1A1B1E] safe-area-inset-bottom touch-manipulation"
      data-testid="mobile-bottom-nav"
    >
      <div className="px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = isActivePath(item.paths);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all duration-200 min-w-[60px] min-h-[60px] touch-manipulation select-none active:scale-95 cursor-pointer",
                  isActive 
                    ? "text-blue-400" 
                    : "text-slate-500 hover:text-slate-300 active:text-slate-400",
                  item.isHighlight && isActive && "bg-blue-600/10"
                )}
                role="button"
                tabIndex={0}
                aria-label={`Navigate to ${item.label}`}
                data-testid={item.testId}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-200 flex items-center justify-center",
                  isActive && item.isHighlight 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                    : isActive 
                    ? "bg-blue-500/10" 
                    : "hover:bg-slate-800/50 active:bg-slate-800/70"
                )}>
                  <Icon className={cn(
                    "transition-all duration-200",
                    item.isHighlight ? "w-6 h-6" : "w-5 h-5"
                  )} />
                </div>
                <span className={cn(
                  "text-xs font-medium transition-all duration-200 text-center",
                  isActive ? "text-blue-400" : "text-slate-500"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav; 