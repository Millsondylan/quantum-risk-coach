import React, { useState } from 'react';
import { Menu, ChevronDown, Filter, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TopHeader = () => {
  const navigate = useNavigate();
  const [selectedPortfolio, setSelectedPortfolio] = useState('Default Portfolio');

  const handleMenuClick = () => {
    navigate('/settings');
  };

  const handlePortfolioClick = () => {
    navigate('/data-management');
  };

  const handleFilterClick = () => {
    navigate('/history');
  };

  const handleLayoutClick = () => {
    navigate('/performance-calendar');
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 z-50 h-16">
      <div className="flex items-center justify-between px-4 h-full">
        <button 
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          onClick={handleMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        <button 
          className="flex items-center space-x-2 hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-colors"
          onClick={handlePortfolioClick}
        >
          <span className="font-semibold">{selectedPortfolio}</span>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </button>

        <div className="flex items-center space-x-2">
          <button 
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            onClick={handleFilterClick}
          >
            <Filter className="h-6 w-6" />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            onClick={handleLayoutClick}
          >
            <LayoutGrid className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader; 