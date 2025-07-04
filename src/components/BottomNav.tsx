import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart2, PlusCircle, BookOpen, Brain, Calendar, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/portfolio', label: 'Portfolio', icon: BarChart2 },
  { path: '/add-trade', label: '', icon: PlusCircle, isAction: true },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/ai-coach', label: 'AI Coach', icon: Brain },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="bottom-nav safe-bottom">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isAction) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex-shrink-0"
              >
                <div className="bg-primary rounded-full p-3 -mt-6 border-4 border-background shadow-lg hover:shadow-xl transition-all duration-200">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </NavLink>
            );
          }
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav; 