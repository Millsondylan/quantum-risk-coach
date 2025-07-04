import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown, Filter, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TopHeader = () => {
  const navigate = useNavigate();
  const [selectedPortfolio, setSelectedPortfolio] = useState('Default Portfolio');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className={`fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 z-50 h-12 shadow-lg transition-all duration-300 ${
      isScrolled ? 'shadow-xl' : 'shadow-lg'
    }`}>
      <div className="flex items-center justify-between px-3 h-full">
        <button 
          className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800/50"
          onClick={handleMenuClick}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex-1 mx-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-3 min-w-max py-1">
            <button 
              className="flex items-center space-x-1 hover:bg-gray-800/50 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-sm"
              onClick={handlePortfolioClick}
            >
              <span className="font-medium text-xs truncate max-w-[100px]">{selectedPortfolio}</span>
              <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
            </button>
            <button 
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap hover:bg-gray-800/50"
              onClick={handleFilterClick}
            >
              <Filter className="h-3 w-3 inline mr-1" />
              Filters
            </button>
            <button 
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap hover:bg-gray-800/50"
              onClick={handleLayoutClick}
            >
              <LayoutGrid className="h-3 w-3 inline mr-1" />
              Layout
            </button>
            <button 
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap hover:bg-gray-800/50"
              onClick={() => navigate('/add-trade')}
            >
              + Add Trade
            </button>
            <button 
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap hover:bg-gray-800/50"
              onClick={() => navigate('/live-trades')}
            >
              Live Trades
            </button>
            <button 
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap hover:bg-gray-800/50"
              onClick={() => navigate('/news')}
            >
              News
            </button>
          </div>
        </div>

        <button 
          className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800/50"
          onClick={() => navigate('/settings')}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TopHeader; 