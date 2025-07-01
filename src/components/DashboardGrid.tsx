import React from 'react';
import PerformanceCalendar from './PerformanceCalendar';
import AICoachCard from './AICoachCard';
import TradeJournalCard from './TradeJournalCard';
import RiskAnalyzer from './RiskAnalyzer';
import QuickStats from './QuickStats';
import RecentTrades from './RecentTrades';
import EconomicCalendar from './EconomicCalendar';
import Leaderboard from './Leaderboard';
import StrategyAnalyzer from './StrategyAnalyzer';
import NotificationSystem from './NotificationSystem';
import TradeBuilder from './TradeBuilder';
import SmartJournal from './SmartJournal';
import PersonalChallenges from './PersonalChallenges';
import MarketSentimentOverlay from './MarketSentimentOverlay';

// Import comprehensive feature components
import BrokerIntegration from './BrokerIntegration';
import AdvancedAnalytics from './AdvancedAnalytics';
import CalendarView from './CalendarView';
import StrategyAnalysis from './StrategyAnalysis';
import EnhancedTradingJournal from './EnhancedTradingJournal';
import NotificationsAlerts from './NotificationsAlerts';
import MarketCoverageSentiment from './MarketCoverageSentiment';
import PaperTrading from './PaperTrading';
import PortfolioManager from './PortfolioManager';

const DashboardGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
      {/* Quick Stats Row - Mobile optimized */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <QuickStats />
      </div>

      {/* Portfolio Manager - High priority placement */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <PortfolioManager />
      </div>

      {/* Broker Integration - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <BrokerIntegration />
      </div>

      {/* Advanced Analytics - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <AdvancedAnalytics />
      </div>

      {/* Calendar View - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <CalendarView />
      </div>

      {/* Strategy Analysis - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <StrategyAnalysis />
      </div>

      {/* Enhanced Trading Journal - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <EnhancedTradingJournal />
      </div>

      {/* Notifications & Alerts - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <NotificationsAlerts />
      </div>

      {/* Market Coverage & Sentiment - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <MarketCoverageSentiment />
      </div>

      {/* Paper Trading - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <PaperTrading />
      </div>

      {/* Performance Calendar - Mobile optimized layout */}
      <div className="col-span-1 md:col-span-2 lg:col-span-8">
        <PerformanceCalendar />
      </div>

      {/* AI Coach - Mobile optimized */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4" data-section="ai-coach">
        <AICoachCard />
      </div>

      {/* Trade Builder - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <TradeBuilder />
      </div>

      {/* Smart Journal and Personal Challenges - Mobile optimized */}
      <div className="col-span-1 md:col-span-1 lg:col-span-6">
        <SmartJournal />
      </div>

      <div className="col-span-1 md:col-span-1 lg:col-span-6">
        <PersonalChallenges />
      </div>

      {/* Market Sentiment Overlay - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <MarketSentimentOverlay />
      </div>

      {/* Strategy Analyzer - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <StrategyAnalyzer />
      </div>

      {/* Economic Calendar and Leaderboard - Mobile optimized */}
      <div className="col-span-1 md:col-span-1 lg:col-span-6">
        <EconomicCalendar />
      </div>

      <div className="col-span-1 md:col-span-1 lg:col-span-6" data-section="leaderboard">
        <Leaderboard />
      </div>

      {/* Trade Journal and Risk Analyzer - Mobile optimized */}
      <div className="col-span-1 md:col-span-1 lg:col-span-7">
        <TradeJournalCard />
      </div>

      <div className="col-span-1 md:col-span-1 lg:col-span-5">
        <RiskAnalyzer />
      </div>

      {/* Recent Trades */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <RecentTrades />
      </div>

      {/* Notification System */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12">
        <NotificationSystem />
      </div>
    </div>
  );
};

export default DashboardGrid;
