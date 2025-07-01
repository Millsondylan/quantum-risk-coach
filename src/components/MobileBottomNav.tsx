import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Target, BookOpen, Brain, TrendingUp, Plus } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '@/components/ui/button';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      onClick: () => navigate('/')
    },
    {
      icon: TrendingUp,
      label: 'Portfolio',
      path: '/portfolio',
      onClick: () => {
        navigate('/');
        setTimeout(() => {
          const portfolioSection = document.querySelector('[data-section="portfolio"]') || 
                                 document.querySelector('.portfolio-manager');
          if (portfolioSection) {
            portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    },
    {
      icon: Plus,
      label: 'Add Trade',
      path: '/journal/add',
      onClick: () => navigate('/journal/add'),
      isHighlight: true
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
        setTimeout(() => {
          const aiCoachSection = document.querySelector('[data-section="ai-coach"]');
          if (aiCoachSection) {
            aiCoachSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  ];

  return (
    <nav className="nav-mobile">
      <div className="nav-mobile-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === '/' && location.pathname === '/');
          
          if (item.isHighlight) {
            return (
              <Button
                key={item.path}
                onClick={item.onClick}
                className="nav-mobile-highlight"
                size="icon"
              >
                <Icon className="w-6 h-6" />
              </Button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={item.onClick}
              className={`nav-mobile-item ${
                isActive 
                  ? 'nav-mobile-item-active' 
                  : 'nav-mobile-item-inactive'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav; 