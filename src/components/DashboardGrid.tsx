import React, { memo, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import QuickStats from './QuickStats';
import RecentTrades from './RecentTrades';
import TradeJournalCard from './TradeJournalCard';
import AICoachCard from './AICoachCard';
import PerformanceCalendar from './PerformanceCalendar';
import StrategyAnalyzer from './StrategyAnalyzer';
import RiskAnalyzer from './RiskAnalyzer';
import MarketCoverageSentiment from './MarketCoverageSentiment';
import AdvancedAnalytics from './AdvancedAnalytics';
import AIMarketInsights from './AIMarketInsights';
import EnhancedTradingJournal from './EnhancedTradingJournal';

// Memoized component wrappers for better performance
const MemoizedQuickStats = memo(QuickStats);
const MemoizedRecentTrades = memo(RecentTrades);
const MemoizedTradeJournalCard = memo(TradeJournalCard);
const MemoizedAICoachCard = memo(AICoachCard);
const MemoizedPerformanceCalendar = memo(PerformanceCalendar);
const MemoizedStrategyAnalyzer = memo(StrategyAnalyzer);
const MemoizedRiskAnalyzer = memo(RiskAnalyzer);
const MemoizedMarketCoverageSentiment = memo(MarketCoverageSentiment);
const MemoizedAdvancedAnalytics = memo(AdvancedAnalytics);
const MemoizedAIMarketInsights = memo(AIMarketInsights);
const MemoizedEnhancedTradingJournal = memo(EnhancedTradingJournal);

interface DashboardGridProps {
  layout?: 'standard' | 'compact' | 'analytics' | 'journal';
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ layout = 'standard' }) => {
  const isMobile = useIsMobile();

  // Memoized layout configurations for different screen sizes and modes
  const layoutConfig = useMemo(() => {
    switch (layout) {
      case 'compact':
        return {
          primary: ['quick-stats', 'recent-trades'],
          secondary: ['ai-insights', 'performance-calendar']
        };
      case 'analytics':
        return {
          primary: ['advanced-analytics', 'strategy-analyzer'],
          secondary: ['performance-calendar', 'risk-analyzer']
        };
      case 'journal':
        return {
          primary: ['enhanced-journal'],
          secondary: ['ai-coach', 'recent-trades']
        };
      default:
        return {
          primary: ['quick-stats', 'recent-trades', 'trade-journal', 'performance-calendar', 'strategy-analyzer'],
          secondary: ['ai-insights', 'ai-coach', 'risk-analyzer', 'market-sentiment']
        };
    }
  }, [layout]);

  // Component mapping for dynamic rendering
  const componentMap = useMemo(() => ({
    'quick-stats': <MemoizedQuickStats />,
    'recent-trades': <MemoizedRecentTrades />,
    'trade-journal': <MemoizedTradeJournalCard />,
    'ai-coach': <MemoizedAICoachCard />,
    'performance-calendar': <MemoizedPerformanceCalendar />,
    'strategy-analyzer': <MemoizedStrategyAnalyzer />,
    'risk-analyzer': <MemoizedRiskAnalyzer />,
    'market-sentiment': <MemoizedMarketCoverageSentiment />,
    'advanced-analytics': <MemoizedAdvancedAnalytics />,
    'ai-insights': <MemoizedAIMarketInsights />,
    'enhanced-journal': <MemoizedEnhancedTradingJournal />
  }), []);

  // Mobile-optimized layout
  if (isMobile) {
    return (
      <div className="space-y-6 p-4">
        {/* Critical components first for mobile */}
        <div className="space-y-4">
          {componentMap['quick-stats']}
          {componentMap['recent-trades']}
          {componentMap['ai-insights']}
          {layout === 'journal' && componentMap['enhanced-journal']}
          {layout === 'analytics' && componentMap['advanced-analytics']}
          {componentMap['performance-calendar']}
          {componentMap['ai-coach']}
        </div>
      </div>
    );
  }

  // Desktop/tablet layout with optimized grid
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
      {/* Primary Column - Main content */}
      <div className="lg:col-span-8 space-y-6">
        {layout === 'journal' ? (
          // Journal-focused layout
          <div className="space-y-6">
            {componentMap['enhanced-journal']}
          </div>
        ) : layout === 'analytics' ? (
          // Analytics-focused layout
          <div className="space-y-6">
            {componentMap['advanced-analytics']}
            {componentMap['strategy-analyzer']}
          </div>
        ) : (
          // Standard dashboard layout
          <div className="space-y-6">
            {/* Top row - Critical stats */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {componentMap['quick-stats']}
              {componentMap['recent-trades']}
            </div>

            {/* Second row - Journal and Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {componentMap['trade-journal']}
              {componentMap['performance-calendar']}
            </div>

            {/* Third row - Strategy Analysis */}
            <div className="w-full">
              {componentMap['strategy-analyzer']}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Column - Supporting content */}
      <div className="lg:col-span-4 space-y-6">
        {layout === 'journal' ? (
          // Journal sidebar
          <div className="space-y-6">
            {componentMap['ai-coach']}
            {componentMap['recent-trades']}
            {componentMap['ai-insights']}
            {componentMap['risk-analyzer']}
          </div>
        ) : layout === 'analytics' ? (
          // Analytics sidebar
          <div className="space-y-6">
            {componentMap['performance-calendar']}
            {componentMap['risk-analyzer']}
            {componentMap['ai-insights']}
            {componentMap['market-sentiment']}
          </div>
        ) : (
          // Standard sidebar
          <div className="space-y-6">
            {componentMap['ai-insights']}
            {componentMap['ai-coach']}
            {componentMap['risk-analyzer']}
            {componentMap['market-sentiment']}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DashboardGrid);
