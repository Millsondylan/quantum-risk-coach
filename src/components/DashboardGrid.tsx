
import React from 'react';
import PerformanceCalendar from './PerformanceCalendar';
import AICoachCard from './AICoachCard';
import TradeJournalCard from './TradeJournalCard';
import RiskAnalyzer from './RiskAnalyzer';
import QuickStats from './QuickStats';
import RecentTrades from './RecentTrades';

const DashboardGrid = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Quick Stats Row */}
      <div className="lg:col-span-12">
        <QuickStats />
      </div>

      {/* Performance Calendar - Takes up most space */}
      <div className="lg:col-span-8">
        <PerformanceCalendar />
      </div>

      {/* AI Coach - Right sidebar */}
      <div className="lg:col-span-4">
        <AICoachCard />
      </div>

      {/* Trade Journal */}
      <div className="lg:col-span-7">
        <TradeJournalCard />
      </div>

      {/* Risk Analyzer */}
      <div className="lg:col-span-5">
        <RiskAnalyzer />
      </div>

      {/* Recent Trades */}
      <div className="lg:col-span-12">
        <RecentTrades />
      </div>
    </div>
  );
};

export default DashboardGrid;
