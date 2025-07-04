import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown, Filter, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PriceTicker from './PriceTicker';

const TopHeader = () => {
  const navigate = useNavigate();
  const [selectedPortfolio, setSelectedPortfolio] = useState('All Portfolios');
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
    <>
      {/* Price Ticker - Always at the very top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <PriceTicker />
      </div>
      
      {/* Main Header - Below the ticker */}
      <div className={`fixed top-12 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border z-40 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}>
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left Section - Portfolio Selector */}
          <div className="flex items-center space-x-3">
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={handlePortfolioClick}
            >
              <span className="text-sm font-medium">{selectedPortfolio}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              onClick={handleFilterClick}
              aria-label="Filter trades"
            >
              <Filter className="h-5 w-5" />
            </button>
            <button 
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              onClick={handleMenuClick}
              aria-label="Settings"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopHeader; 