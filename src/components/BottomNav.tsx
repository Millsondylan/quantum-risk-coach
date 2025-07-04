import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart2, PlusCircle, History, BrainCircuit } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/live-trades', label: 'Live Trades', icon: BarChart2 },
  { path: '/add-trade', label: 'Add Trade', icon: PlusCircle },
  { path: '/history', label: 'History', icon: History },
  { path: '/ai-coach', label: 'AI Coach', icon: BrainCircuit },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.path === '/add-trade') {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className="flex-shrink-0"
              >
                <div className="bg-blue-600 rounded-full p-3 -mt-6 border-3 border-gray-800 shadow-lg">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
              </NavLink>
            );
          }
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-0.5 transition-colors duration-200 ${
                isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav; 