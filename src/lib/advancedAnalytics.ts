import { Trade as LocalTrade } from './localStorage';
import { Trade as DatabaseTrade } from './localDatabase';
import { differenceInDays, parseISO } from 'date-fns';
import * as TechnicalIndicators from 'technicalindicators';

export interface Trade {
  id?: string;
  accountId?: string;
  symbol: string;
  type: 'long' | 'short';
  side?: 'buy' | 'sell';
  amount?: number;
  quantity: number;
  price?: number;
  entryPrice: number;
  exitPrice: number;
  fee?: number;
  profit: number;
  profitLoss?: number;
  status?: 'open' | 'closed' | 'cancelled' | 'pending';
  entryDate?: string;
  entryTime: string;
  exitDate?: string;
  exitTime: string;
  riskReward?: number;
  riskRewardRatio?: number;
  strategy?: string;
  tags?: string[];
  notes?: string;
  exitReason?: string;
  takeProfit?: number;
  stopLoss?: number;
  confidence?: number;
  confidenceRating?: number;
  emotion?: 'calm' | 'anxious' | 'excited' | 'frustrated';
  mood?: 'positive' | 'negative' | 'neutral' | 'excited' | 'stressed' | 'calm' | 'greedy' | 'fearful';
}

export interface AdvancedTradeAnalytics {
  totalTrades: number;
  profitFactor: number;
  expectedValue: number;
  maxDrawdown: number;
  averageHoldingTime: number;
  tradeConfidenceScore: number;
  behavioralPatterns: {
    earlyExits: number;
    overtrading: number;
    revengeTrades: number;
  };
  monthlyPerformance: Array<{month: string, profit: number}>;
  weeklyPerformance: Array<{week: number, profit: number}>;
  strategyBreakdown: Array<{strategy: string, winRate: number, profitability: number}>;
}

export interface AITradeInsights {
  potentialImprovementAreas: string[];
  recommendedStrategies: string[];
  emotionalTradingTrends: {
    mostFrequentMood: Trade['mood'];
    impactOnPerformance: number;
  };
  predictedNextTradeOutcome: {
    probability: number;
    recommendedAction: 'hold' | 'enter' | 'exit';
  };
}

export class AdvancedAnalyticsService {
  calculateAdvancedAnalytics(trades: (LocalTrade | DatabaseTrade)[]): AdvancedTradeAnalytics {
    // Convert trades to a consistent type
    const convertedTrades: Trade[] = trades.map(trade => {
      // Check if it's a LocalTrade or DatabaseTrade
      if ('entryPrice' in trade) {
        // LocalTrade type
        return {
          ...trade,
          type: trade.type === 'buy' ? 'long' : 'short',
          side: trade.side || (trade.type === 'long' ? 'buy' : 'sell'),
          quantity: trade.quantity,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime,
          profit: trade.profit || 0,
          riskRewardRatio: trade.riskRewardRatio,
          confidenceRating: trade.confidence,
          emotion: trade.emotion as 'calm' | 'anxious' | 'excited' | 'frustrated',
          mood: trade.emotion ? 
            (trade.emotion === 'calm' ? 'calm' : 
             trade.emotion === 'anxious' ? 'stressed' : 
             trade.emotion === 'excited' ? 'excited' : 
             trade.emotion === 'frustrated' ? 'negative' : 'neutral') : undefined
        };
      } else {
        // DatabaseTrade type
        const databaseTrade = trade as any;
        return {
          id: databaseTrade.id,
          accountId: databaseTrade.accountId,
          symbol: databaseTrade.symbol,
          type: databaseTrade.side === 'buy' ? 'long' : 'short',
          side: databaseTrade.side,
          amount: databaseTrade.amount,
          quantity: databaseTrade.amount,
          price: databaseTrade.price,
          entryPrice: databaseTrade.price,
          exitPrice: databaseTrade.price,
          fee: databaseTrade.fee,
          profit: databaseTrade.profit || 0,
          profitLoss: databaseTrade.profit,
          status: databaseTrade.status,
          entryDate: databaseTrade.entryDate,
          entryTime: databaseTrade.entryDate,
          exitDate: databaseTrade.exitDate,
          exitTime: databaseTrade.exitDate,
          riskReward: databaseTrade.riskReward,
          riskRewardRatio: databaseTrade.riskReward,
          strategy: undefined,
          tags: [],
          notes: databaseTrade.notes,
          exitReason: undefined,
          takeProfit: undefined,
          stopLoss: undefined,
          confidence: databaseTrade.confidenceRating,
          confidenceRating: databaseTrade.confidenceRating,
          emotion: (databaseTrade.mood === 'calm' ? 'calm' : 
                   databaseTrade.mood === 'stressed' ? 'anxious' : 
                   databaseTrade.mood === 'excited' ? 'excited' : 
                   databaseTrade.mood === 'fearful' ? 'anxious' : 
                   'calm') as 'calm' | 'anxious' | 'excited' | 'frustrated',
          mood: databaseTrade.mood
        };
      }
    });

    const totalTrades = convertedTrades.length;
    const profitableTrades = convertedTrades.filter(trade => trade.profit > 0);
    const lossTrades = convertedTrades.filter(trade => trade.profit <= 0);

    const profitFactor = this.calculateProfitFactor(convertedTrades);
    const expectedValue = this.calculateExpectedValue(convertedTrades);
    const maxDrawdown = this.calculateMaxDrawdown(convertedTrades);
    const averageHoldingTime = this.calculateAverageHoldingTime(convertedTrades);
    const tradeConfidenceScore = this.calculateTradeConfidenceScore(convertedTrades);
    const behavioralPatterns = this.analyzeBehavioralPatterns(convertedTrades);
    const monthlyPerformance = this.calculateMonthlyPerformance(convertedTrades);
    const weeklyPerformance = this.calculateWeeklyPerformance(convertedTrades);
    const strategyBreakdown = this.calculateStrategyBreakdown(convertedTrades);

    return {
      totalTrades,
      profitFactor,
      expectedValue,
      maxDrawdown,
      averageHoldingTime,
      tradeConfidenceScore,
      behavioralPatterns,
      monthlyPerformance,
      weeklyPerformance,
      strategyBreakdown
    };
  }

  private calculateProfitFactor(trades: Trade[]): number {
    const grossProfit = trades
      .filter(trade => trade.profit > 0)
      .reduce((sum, trade) => sum + trade.profit, 0);
    const grossLoss = Math.abs(trades
      .filter(trade => trade.profit < 0)
      .reduce((sum, trade) => sum + trade.profit, 0));
    
    return grossLoss > 0 ? grossProfit / grossLoss : 1;
  }

  private calculateExpectedValue(trades: Trade[]): number {
    const winRate = trades.filter(trade => trade.profit > 0).length / trades.length;
    const averageWin = trades
      .filter(trade => trade.profit > 0)
      .reduce((sum, trade) => sum + trade.profit, 0) / trades.length;
    const averageLoss = Math.abs(trades
      .filter(trade => trade.profit < 0)
      .reduce((sum, trade) => sum + trade.profit, 0) / trades.length);
    
    return winRate * averageWin - (1 - winRate) * averageLoss;
  }

  private calculateMaxDrawdown(trades: Trade[]): number {
    let maxDrawdown = 0;
    let peak = 0;
    let currentDrawdown = 0;

    trades.forEach(trade => {
      peak = Math.max(peak, trade.profit);
      currentDrawdown = peak - trade.profit;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    });

    return maxDrawdown;
  }

  private calculateAverageHoldingTime(trades: Trade[]): number {
    const holdingTimes = trades.map(trade => 
      differenceInDays(parseISO(trade.exitTime), parseISO(trade.entryTime))
    );
    return holdingTimes.reduce((sum, time) => sum + time, 0) / trades.length;
  }

  private calculateTradeConfidenceScore(trades: Trade[]): number {
    const recentTrades = trades.slice(-10);
    const consecutiveWins = this.countConsecutiveWins(recentTrades);
    const riskRewardRatio = this.calculateAverageRiskRewardRatio(trades);
    
    return Math.min(100, (consecutiveWins * 10 + riskRewardRatio * 20));
  }

  private analyzeBehavioralPatterns(trades: Trade[]): AdvancedTradeAnalytics['behavioralPatterns'] {
    const earlyExits = trades.filter(trade => trade.exitReason === 'early_exit').length;
    const overtrading = trades.filter(trade => trade.tags?.includes('overtrading')).length;
    const revengeTrades = trades.filter(trade => trade.tags?.includes('revenge_trade')).length;

    return { earlyExits, overtrading, revengeTrades };
  }

  private calculateMonthlyPerformance(trades: Trade[]): AdvancedTradeAnalytics['monthlyPerformance'] {
    const monthlyProfits: {[key: string]: number} = {};
    
    trades.forEach(trade => {
      const month = new Date(trade.exitTime).toLocaleString('default', { month: 'short' });
      monthlyProfits[month] = (monthlyProfits[month] || 0) + trade.profit;
    });

    return Object.entries(monthlyProfits).map(([month, profit]) => ({ month, profit }));
  }

  private calculateWeeklyPerformance(trades: Trade[]): AdvancedTradeAnalytics['weeklyPerformance'] {
    const weeklyProfits: {[key: number]: number} = {};
    
    trades.forEach(trade => {
      const week = this.getWeekNumber(new Date(trade.exitTime));
      weeklyProfits[week] = (weeklyProfits[week] || 0) + trade.profit;
    });

    return Object.entries(weeklyProfits).map(([week, profit]) => ({ 
      week: parseInt(week), 
      profit 
    }));
  }

  private calculateStrategyBreakdown(trades: Trade[]): AdvancedTradeAnalytics['strategyBreakdown'] {
    const strategyPerformance: {[key: string]: {wins: number, total: number, profit: number}} = {};

    trades.forEach(trade => {
      const strategy = trade.strategy || 'Undefined';
      if (!strategyPerformance[strategy]) {
        strategyPerformance[strategy] = { wins: 0, total: 0, profit: 0 };
      }
      
      strategyPerformance[strategy].total++;
      strategyPerformance[strategy].profit += trade.profit;
      if (trade.profit > 0) strategyPerformance[strategy].wins++;
    });

    return Object.entries(strategyPerformance).map(([strategy, data]) => ({
      strategy,
      winRate: (data.wins / data.total) * 100,
      profitability: data.profit / data.total
    }));
  }

  private countConsecutiveWins(trades: Trade[]): number {
    let consecutiveWins = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].profit > 0) {
        consecutiveWins++;
      } else {
        break;
      }
    }
    return consecutiveWins;
  }

  private calculateAverageRiskRewardRatio(trades: Trade[]): number {
    const riskRewardRatios = trades.map(trade => 
      trade.riskRewardRatio || (trade.takeProfit && trade.stopLoss 
        ? Math.abs(trade.takeProfit - trade.entryPrice) / Math.abs(trade.entryPrice - trade.stopLoss)
        : 1)
    );
    return riskRewardRatios.reduce((sum, ratio) => sum + ratio, 0) / riskRewardRatios.length;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  generateAITradeInsights(trades: Trade[]): AITradeInsights {
    const emotionalAnalysis = this.analyzeEmotionalTrading(trades);
    const strategyPerformance = this.calculateStrategyBreakdown(trades);
    
    const potentialImprovementAreas = this.identifyImprovementAreas(trades);
    const recommendedStrategies = strategyPerformance
      .filter(strategy => strategy.winRate > 0.6)
      .map(strategy => strategy.strategy);

    const predictedNextTradeOutcome = this.predictNextTradeOutcome(trades);

    return {
      potentialImprovementAreas,
      recommendedStrategies,
      emotionalTradingTrends: {
        mostFrequentMood: emotionalAnalysis.mostFrequentMood,
        impactOnPerformance: emotionalAnalysis.performanceImpact
      },
      predictedNextTradeOutcome
    };
  }

  private analyzeEmotionalTrading(trades: Trade[]): {
    mostFrequentMood: Trade['mood'];
    performanceImpact: number;
  } {
    const moodCounts = trades.reduce((acc, trade) => {
      acc[trade.mood || 'neutral'] = (acc[trade.mood || 'neutral'] || 0) + 1;
      return acc;
    }, {} as Record<Trade['mood'], number>);

    const mostFrequentMood = Object.entries(moodCounts).reduce(
      (a, b) => b[1] > a[1] ? b : a
    )[0] as Trade['mood'];

    const moodPerformance = trades.reduce((acc, trade) => {
      if (trade.mood === mostFrequentMood) {
        acc.push(trade.profit);
      }
      return acc;
    }, [] as number[]);

    const performanceImpact = moodPerformance.reduce((a, b) => a + b, 0) / moodPerformance.length;

    return { mostFrequentMood, performanceImpact };
  }

  private identifyImprovementAreas(trades: Trade[]): string[] {
    const improvements: string[] = [];

    const earlyExitTrades = trades.filter(trade => 
      trade.exitReason === 'early_exit' && trade.profit < 0
    );
    if (earlyExitTrades.length > trades.length * 0.2) {
      improvements.push('Reduce premature trade exits');
    }

    const highEmotionalTrades = trades.filter(trade => 
      ['anxious', 'frustrated', 'greedy', 'fearful'].includes(trade.mood || '')
    );
    if (highEmotionalTrades.length > trades.length * 0.3) {
      improvements.push('Manage emotional trading triggers');
    }

    return improvements;
  }

  private predictNextTradeOutcome(trades: Trade[]): AITradeInsights['predictedNextTradeOutcome'] {
    const recentTrades = trades.slice(-10);
    const winRate = recentTrades.filter(trade => trade.profit > 0).length / recentTrades.length;
    
    const recommendedAction = winRate > 0.6 ? 'enter' : 
                               winRate < 0.4 ? 'exit' : 'hold';

    return {
      probability: winRate,
      recommendedAction
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService(); 