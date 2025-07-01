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
    <div className="dashboard-container">
      {/* Quick Stats - Always visible at top */}
      <section className="dashboard-section priority-high">
        <QuickStats />
      </section>

      {/* Portfolio Manager - High priority for trading focus */}
      <section className="dashboard-section priority-high" data-section="portfolio">
        <div className="section-header">
          <h2 className="section-title">Portfolio Overview</h2>
          <p className="section-subtitle">Real-time portfolio performance</p>
        </div>
        <PortfolioManager />
      </section>

      {/* Enhanced Trading Journal - Core feature */}
      <section className="dashboard-section priority-high">
        <div className="section-header">
          <h2 className="section-title">Trading Journal</h2>
          <p className="section-subtitle">Track and analyze your trades</p>
        </div>
        <EnhancedTradingJournal />
      </section>

      {/* Calendar View - Trade journal focus */}
      <section className="dashboard-section priority-medium">
        <div className="section-header">
          <h2 className="section-title">Performance Calendar</h2>
          <p className="section-subtitle">Visualize your trading patterns</p>
        </div>
        <CalendarView />
      </section>

      {/* AI Coach & Analytics Row */}
      <div className="dashboard-row">
        <section className="dashboard-card" data-section="ai-coach">
          <div className="card-header">
            <h3 className="card-title">AI Coach</h3>
          </div>
          <AICoachCard />
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Analytics</h3>
          </div>
          <AdvancedAnalytics />
        </section>
      </div>

      {/* Strategy Analysis */}
      <section className="dashboard-section priority-medium">
        <div className="section-header">
          <h2 className="section-title">Strategy Analysis</h2>
          <p className="section-subtitle">Optimize your trading strategies</p>
        </div>
        <StrategyAnalysis />
      </section>

      {/* Risk & Performance Row */}
      <div className="dashboard-row">
        <section className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Risk Analysis</h3>
          </div>
          <RiskAnalyzer />
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Performance</h3>
          </div>
          <PerformanceCalendar />
        </section>
      </div>

      {/* Recent Activity */}
      <section className="dashboard-section priority-medium">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <p className="section-subtitle">Latest trades and updates</p>
        </div>
        <RecentTrades />
      </section>

      {/* Trade Builder */}
      <section className="dashboard-section priority-medium">
        <div className="section-header">
          <h2 className="section-title">Trade Builder</h2>
          <p className="section-subtitle">Plan your next trade</p>
        </div>
        <TradeBuilder />
      </section>

      {/* Market Data Row */}
      <div className="dashboard-row">
        <section className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Market Sentiment</h3>
          </div>
          <MarketCoverageSentiment />
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Economic Calendar</h3>
          </div>
          <EconomicCalendar />
        </section>
      </div>

      {/* Paper Trading */}
      <section className="dashboard-section priority-low">
        <div className="section-header">
          <h2 className="section-title">Paper Trading</h2>
          <p className="section-subtitle">Practice without risk</p>
        </div>
        <PaperTrading />
      </section>

      {/* Community & Social Row */}
      <div className="dashboard-row">
        <section className="dashboard-card" data-section="leaderboard">
          <div className="card-header">
            <h3 className="card-title">Leaderboard</h3>
          </div>
          <Leaderboard />
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Challenges</h3>
          </div>
          <PersonalChallenges />
        </section>
      </div>

      {/* Broker Integration */}
      <section className="dashboard-section priority-low">
        <div className="section-header">
          <h2 className="section-title">Broker Integration</h2>
          <p className="section-subtitle">Connect your trading accounts</p>
        </div>
        <BrokerIntegration />
      </section>

      {/* Additional Features (Lower Priority) */}
      <div className="dashboard-expandable">
        <div className="dashboard-row">
          <section className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Smart Journal</h3>
            </div>
            <SmartJournal />
          </section>

          <section className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Market Sentiment</h3>
            </div>
            <MarketSentimentOverlay />
          </section>
        </div>

        <section className="dashboard-section priority-low">
          <div className="section-header">
            <h2 className="section-title">Strategy Analyzer</h2>
            <p className="section-subtitle">Advanced strategy metrics</p>
          </div>
          <StrategyAnalyzer />
        </section>

        <section className="dashboard-section priority-low">
          <div className="section-header">
            <h2 className="section-title">Notifications & Alerts</h2>
            <p className="section-subtitle">Stay informed with alerts</p>
          </div>
          <NotificationsAlerts />
        </section>

        <section className="dashboard-section priority-low">
          <div className="section-header">
            <h2 className="section-title">Notification System</h2>
            <p className="section-subtitle">Real-time updates</p>
          </div>
          <NotificationSystem />
        </section>
      </div>
    </div>
  );
};

export default DashboardGrid;
