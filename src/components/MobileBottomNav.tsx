import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Target, BookOpen, Brain, Settings, Wallet, BarChart3 } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      onClick: () => navigate('/')
    },
    {
      icon: Wallet,
      label: 'Portfolio',
      path: '/portfolio',
      onClick: () => {
        navigate('/');
        // Scroll to portfolio section
        setTimeout(() => {
          const portfolioSection = document.querySelector('[data-section="portfolio"]');
          if (portfolioSection) {
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            // If no specific section, scroll to top where portfolio is shown
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
      onClick: () => {
        navigate('/');
        // Scroll to analytics section
        setTimeout(() => {
          const analyticsSection = document.querySelector('[data-section="analytics"]');
          if (analyticsSection) {
            analyticsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    },
    {
      icon: Target,
      label: 'Trade',
      path: '/trade-builder',
      onClick: () => navigate('/trade-builder')
    },
    {
      icon: BookOpen,
      label: 'Journal',
      path: '/journal',
      onClick: () => navigate('/journal')
    },
    {
      icon: Brain,
      label: 'AI Coach',
      path: '/ai-coach',
      onClick: () => {
        navigate('/');
        // Scroll to AI coach section
        setTimeout(() => {
          const aiCoachSection = document.querySelector('[data-section="ai-coach"]');
          if (aiCoachSection) {
            aiCoachSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      onClick: () => navigate('/settings')
    }
  ];

  return (
    <nav className="nav-mobile">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === '/' && location.pathname === '/') ||
            (item.path === '/ai-coach' && location.pathname === '/' && location.hash === '#ai-coach') ||
            (item.path === '/portfolio' && location.pathname === '/' && location.hash === '#portfolio') ||
            (item.path === '/analytics' && location.pathname === '/' && location.hash === '#analytics');
          
          return (
            <button
              key={item.path}
              onClick={item.onClick}
              className={`nav-mobile-item flex-1 ${
                isActive 
                  ? 'text-cyan-400 bg-cyan-400/10' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav; 