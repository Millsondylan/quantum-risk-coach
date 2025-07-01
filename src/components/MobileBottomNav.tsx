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
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      activeColor: 'text-cyan-400',
      paths: ['/']
    },
    {
      href: '/journal',
      icon: BookOpen,
      label: 'Journal',
      activeColor: 'text-blue-400',
      paths: ['/journal']
    },
    {
      href: '/trade-builder',
      icon: PlusCircle,
      label: 'Trade',
      activeColor: 'text-emerald-400',
      isHighlight: true,
      paths: ['/trade-builder']
    },
    {
      href: '/performance-calendar',
      icon: BarChart3,
      label: 'Analytics',
      activeColor: 'text-purple-400',
      paths: ['/performance-calendar', '/strategy-analyzer']
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings',
      activeColor: 'text-slate-400',
      paths: ['/settings']
    }
  ];

  const isActivePath = (paths: string[]) => {
    return paths.some(path => location.pathname === path || location.pathname.startsWith(path));
  };

  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 sm:hidden">
      <div className="mobile-nav-content px-2 py-2">
        {navItems.map((item) => {
          const isActive = isActivePath(item.paths);
          const Icon = item.icon;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300",
                  "bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg",
                  "hover:scale-105 active:scale-95",
                  "w-14 h-14 -mt-2 border-2 border-slate-800"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium mt-1">{item.label}</span>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-lg -z-10 scale-110"></div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "mobile-nav-item flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200",
                "min-w-[60px] text-center relative overflow-hidden",
                isActive 
                  ? `${item.activeColor} bg-slate-800/80` 
                  : "text-slate-400 hover:text-slate-300"
              )}
            >
              {/* Background highlight for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl"></div>
              )}
              
              <Icon className={cn(
                "w-5 h-5 transition-all duration-200 relative z-10",
                isActive ? "scale-110" : "scale-100"
              )} />
              
              <span className={cn(
                "text-xs font-medium mt-1 relative z-10 transition-all duration-200",
                isActive ? "opacity-100" : "opacity-80"
              )}>
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for iPhones */}
      <div className="h-safe-bottom bg-slate-900/95"></div>
    </nav>
  );
};

export default MobileBottomNav; 