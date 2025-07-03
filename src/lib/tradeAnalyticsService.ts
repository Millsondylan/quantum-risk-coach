import { Trade } from '@/lib/localDatabase';
import { format, parseISO } from 'date-fns';

interface SymbolStats {
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  profit: number;
  winRate: number;
}

interface SessionData {
  trades: number;
  wins: number;
  losses: number;
  profit: number;
  winRate: number;
}

interface Analytics {
  totalTrades: number;
  totalPnL: number;
  wins: number;
  losses: number;
  winRate: number;
  averageProfit: number;
  averageWin: number;
  averageLoss: number;
  biggestWin: number;
  biggestLoss: number;
  averageHoldTime: number; // in minutes
  averageRiskRewardRatio: number;
  longTrades: number;
  shortTrades: number;
  longWins: number;
  shortWins: number;
  longWinRate: number;
  shortWinRate: number;
  profitByDayOfWeek: Array<{ day: string; profit: number; trades: number }>;
  bestSymbol: SymbolStats;
  worstSymbol: SymbolStats;
  mostTradedSymbols: Array<{ symbol: string; trades: number }>;
  sessionPerformance: {
    Asia: SessionData;
    Europe: SessionData;
    US: SessionData;
  };
  bestSession: {
    name: string;
    profit: number;
    trades: number;
    winRate: number;
  };
}

class TradeAnalyticsService {
  
  calculateAnalytics(trades: Trade[]): Analytics {
    // Initialize with safe defaults
    const analytics: Analytics = {
      totalTrades: trades.length,
      totalPnL: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageProfit: 0,
      averageWin: 0,
      averageLoss: 0,
      biggestWin: 0,
      biggestLoss: 0,
      averageHoldTime: 0,
      averageRiskRewardRatio: 0,
      longTrades: 0,
      shortTrades: 0,
      longWins: 0,
      shortWins: 0,
      longWinRate: 0,
      shortWinRate: 0,
      profitByDayOfWeek: [
        { day: 'Mon', profit: 0, trades: 0 },
        { day: 'Tue', profit: 0, trades: 0 },
        { day: 'Wed', profit: 0, trades: 0 },
        { day: 'Thu', profit: 0, trades: 0 },
        { day: 'Fri', profit: 0, trades: 0 },
        { day: 'Sat', profit: 0, trades: 0 },
        { day: 'Sun', profit: 0, trades: 0 },
      ],
      bestSymbol: { symbol: 'N/A', trades: 0, wins: 0, losses: 0, profit: 0, winRate: 0 },
      worstSymbol: { symbol: 'N/A', trades: 0, wins: 0, losses: 0, profit: 0, winRate: 0 },
      mostTradedSymbols: [],
      sessionPerformance: {
        Asia: { trades: 0, wins: 0, losses: 0, profit: 0, winRate: 0 },
        Europe: { trades: 0, wins: 0, losses: 0, profit: 0, winRate: 0 },
        US: { trades: 0, wins: 0, losses: 0, profit: 0, winRate: 0 },
      },
      bestSession: { name: 'N/A', profit: 0, trades: 0, winRate: 0 }
    };
    
    if (trades.length === 0) {
      return analytics;
    }

    // Calculate basic metrics
    let totalProfit = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalWinProfit = 0;
    let totalLossProfit = 0;
    let totalHoldTimeMinutes = 0;
    let biggestWin = 0;
    let biggestLoss = 0;
    let totalRiskReward = 0;
    let riskRewardCount = 0;

    // Direction metrics
    let longTrades = 0;
    let shortTrades = 0;
    let longWins = 0;
    let shortWins = 0;

    // Symbol stats tracking
    const symbolStats: Record<string, SymbolStats> = {};

    // Session tracking
    const sessionData = {
      Asia: { trades: 0, wins: 0, losses: 0, profit: 0 },
      Europe: { trades: 0, wins: 0, losses: 0, profit: 0 },
      US: { trades: 0, wins: 0, losses: 0, profit: 0 },
    };

    for (const trade of trades) {
      // Skip if no profit data or not closed
      if (trade.profit === undefined || trade.status !== 'closed') continue;

      const profit = trade.profit;
      totalProfit += profit;

      // Win/loss tracking
      if (profit > 0) {
        totalWins++;
        totalWinProfit += profit;
        biggestWin = Math.max(biggestWin, profit);

        // Direction win tracking
        if (trade.side === 'buy') {
          longWins++;
        } else {
          shortWins++;
        }
      } else if (profit < 0) {
        totalLosses++;
        totalLossProfit += profit;
        biggestLoss = Math.min(biggestLoss, profit);
      }

      // Direction tracking
      if (trade.side === 'buy') {
        longTrades++;
      } else {
        shortTrades++;
      }

      // Hold time
      if (trade.entryDate && trade.exitDate) {
        const entryTime = new Date(trade.entryDate).getTime();
        const exitTime = new Date(trade.exitDate).getTime();
        const holdTimeMinutes = (exitTime - entryTime) / (1000 * 60);
        totalHoldTimeMinutes += holdTimeMinutes;
      }

      // Risk-reward
      if (trade.riskReward) {
        totalRiskReward += trade.riskReward;
        riskRewardCount++;
      }

      // Day of week
      if (trade.entryDate) {
        const date = parseISO(trade.entryDate);
        const dayIndex = date.getDay();
        // Convert 0-6 (Sun-Sat) to our array indexes (0-6 for Mon-Sun)
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        analytics.profitByDayOfWeek[adjustedIndex].profit += profit;
        analytics.profitByDayOfWeek[adjustedIndex].trades++;
      }

      // Symbol stats
      const symbol = trade.symbol;
      if (!symbolStats[symbol]) {
        symbolStats[symbol] = {
          symbol,
          trades: 0,
          wins: 0,
          losses: 0,
          profit: 0,
          winRate: 0
        };
      }
      
      symbolStats[symbol].trades++;
      symbolStats[symbol].profit += profit;
      
      if (profit > 0) {
        symbolStats[symbol].wins++;
      } else if (profit < 0) {
        symbolStats[symbol].losses++;
      }

      // Market session
      if (trade.entryDate) {
        const hour = new Date(trade.entryDate).getUTCHours();
        
        // Simplified session assignment
        let session;
        if (hour >= 0 && hour < 8) {
          session = 'Asia';
        } else if (hour >= 8 && hour < 16) {
          session = 'Europe';
        } else {
          session = 'US';
        }
        
        sessionData[session].trades++;
        sessionData[session].profit += profit;
        if (profit > 0) {
          sessionData[session].wins++;
        } else if (profit < 0) {
          sessionData[session].losses++;
        }
      }
    }

    // Set calculated values
    analytics.totalPnL = totalProfit;
    analytics.wins = totalWins;
    analytics.losses = totalLosses;
    analytics.winRate = totalWins > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;
    analytics.averageProfit = totalProfit / trades.length;
    analytics.averageWin = totalWins > 0 ? totalWinProfit / totalWins : 0;
    analytics.averageLoss = totalLosses > 0 ? totalLossProfit / totalLosses : 0;
    analytics.biggestWin = biggestWin;
    analytics.biggestLoss = biggestLoss;
    analytics.averageHoldTime = trades.length > 0 ? totalHoldTimeMinutes / trades.length : 0;
    analytics.averageRiskRewardRatio = riskRewardCount > 0 ? totalRiskReward / riskRewardCount : 1;
    
    // Direction stats
    analytics.longTrades = longTrades;
    analytics.shortTrades = shortTrades;
    analytics.longWins = longWins;
    analytics.shortWins = shortWins;
    analytics.longWinRate = longTrades > 0 ? Math.round((longWins / longTrades) * 100) : 0;
    analytics.shortWinRate = shortTrades > 0 ? Math.round((shortWins / shortTrades) * 100) : 0;

    // Symbol performance
    const symbolsArray = Object.values(symbolStats).map(stats => ({
      ...stats,
      winRate: stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0
    }));
    
    // Best/worst symbol
    if (symbolsArray.length > 0) {
      symbolsArray.sort((a, b) => b.profit - a.profit);
      analytics.bestSymbol = symbolsArray[0];
      analytics.worstSymbol = symbolsArray[symbolsArray.length - 1];
    }
    
    // Most traded
    analytics.mostTradedSymbols = symbolsArray
      .sort((a, b) => b.trades - a.trades)
      .map(s => ({ symbol: s.symbol, trades: s.trades }));

    // Session stats
    for (const [sessionName, data] of Object.entries(sessionData)) {
      analytics.sessionPerformance[sessionName].trades = data.trades;
      analytics.sessionPerformance[sessionName].wins = data.wins;
      analytics.sessionPerformance[sessionName].losses = data.losses;
      analytics.sessionPerformance[sessionName].profit = data.profit;
      analytics.sessionPerformance[sessionName].winRate = 
        data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0;
    }

    // Best session
    let bestSession = { name: 'N/A', profit: 0, trades: 0, winRate: 0 };
    for (const [sessionName, data] of Object.entries(analytics.sessionPerformance)) {
      if (data.trades > 0 && data.profit > bestSession.profit) {
        bestSession = {
          name: sessionName,
          profit: data.profit,
          trades: data.trades,
          winRate: data.winRate
        };
      }
    }
    analytics.bestSession = bestSession;

    return analytics;
  }
}

export const tradeAnalyticsService = new TradeAnalyticsService(); 