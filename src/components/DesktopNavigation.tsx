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
  Wallet,
  Bell,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DesktopNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Overview',
      paths: ['/'],
      testId: 'nav-overview'
    },
    {
      href: '/journal',
      icon: BookOpen,
      label: 'Journal',
      paths: ['/journal'],
      testId: 'nav-journal'
    },
    {
      href: '/add-trade',
      icon: PlusCircle,
      label: 'Trade',
      paths: ['/add-trade', '/trade-builder'],
      testId: 'nav-trade'
    },
    {
      href: '/strategy-analyzer',
      icon: BarChart3,
      label: 'Analytics',
      paths: ['/strategy-analyzer', '/analytics'],
      testId: 'nav-analytics'
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Profile',
      paths: ['/settings', '/profile'],
      testId: 'nav-profile'
    }
  ];

  const isActivePath = (paths: string[]) => {
    return paths.some(path => location.pathname === path || location.pathname.startsWith(path));
  };

  return (
    <nav 
      className="hidden md:flex flex-col space-y-2 p-4 bg-[#1A1B1E] border-r border-[#2A2B2E] min-h-screen"
      data-testid="desktop-navigation"
      role="navigation"
      aria-label="Desktop navigation"
    >
      {navItems.map((item) => {
        const isActive = isActivePath(item.paths);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              isActive 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            role="button"
            tabIndex={0}
            aria-label={`Navigate to ${item.label}`}
            data-testid={item.testId}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default DesktopNavigation; 