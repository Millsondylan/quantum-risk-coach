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

export interface Analytics {
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
  behavioralPatterns: string[];
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  drawdownPeriods: Array<{ date: string; value: number }>;
  profitHeatmapData: Array<{ day: string; hour: number; profit: number }>;
  profitByMonth: Array<{ month: string; profit: number }>;
  profitByWeek: Array<{ week: string; profit: number }>;
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
      bestSession: { name: 'N/A', profit: 0, trades: 0, winRate: 0 },
      behavioralPatterns: [],
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      drawdownPeriods: [],
      profitHeatmapData: [],
      profitByMonth: [],
      profitByWeek: [],
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

    // Analyze behavioral patterns
    analytics.behavioralPatterns = this.analyzeBehavioralPatterns(trades, analytics);

    // Calculate Sharpe and Sortino Ratios
    const closedTradesWithProfit = trades.filter(trade => trade.status === 'closed' && trade.profit !== undefined);
    const profits = closedTradesWithProfit.map(trade => trade.profit!);
    
    analytics.sharpeRatio = this.calculateSharpeRatio(profits);
    analytics.sortinoRatio = this.calculateSortinoRatio(profits);

    // Calculate Drawdown
    const equityCurve = this.calculateEquityCurve(trades);
    const { maxDrawdown, drawdownPeriods } = this.calculateDrawdown(equityCurve);
    analytics.maxDrawdown = maxDrawdown;
    analytics.drawdownPeriods = drawdownPeriods;

    // Calculate Monthly and Weekly Profits
    analytics.profitByMonth = this.calculateProfitByPeriod(trades, 'month') as Array<{ month: string; profit: number }>;
    analytics.profitByWeek = this.calculateProfitByPeriod(trades, 'week') as Array<{ week: string; profit: number }>;

    // Calculate Heatmap Data
    analytics.profitHeatmapData = this.calculateProfitHeatmapData(trades);

    return analytics;
  }

  // Helper to calculate profit by a given period (month or week)
  private calculateProfitByPeriod(trades: Trade[], period: 'month' | 'week'): Array<{ month?: string; week?: string; profit: number }> {
    const aggregatedData: { [key: string]: number } = {};

    trades.forEach(trade => {
      if (trade.status === 'closed' && trade.profit !== undefined) {
        const date = parseISO(trade.entryDate);
        let key: string;

        if (period === 'month') {
          key = format(date, 'yyyy-MM'); // e.g., "2024-01"
        } else {
          key = format(date, 'yyyy-W'); // e.g., "2024-1" (ISO week)
        }

        aggregatedData[key] = (aggregatedData[key] || 0) + trade.profit;
      }
    });

    // Convert to array and sort
    const result = Object.entries(aggregatedData).map(([periodKey, profit]) => {
      if (period === 'month') {
        return { month: periodKey, profit: parseFloat(profit.toFixed(2)) };
      } else {
        return { week: periodKey, profit: parseFloat(profit.toFixed(2)) };
      }
    });

    // Sort by period key
    result.sort((a, b) => {
      const keyA = (a as any)[period];
      const keyB = (b as any)[period];
      if (typeof keyA === 'string' && typeof keyB === 'string') {
        return keyA.localeCompare(keyB);
      }
      return 0;
    });

    return result;
  }

  // Helper to calculate Profit Heatmap Data
  private calculateProfitHeatmapData(trades: Trade[]): Array<{ day: string; hour: number; profit: number }> {
    const heatmap: { [key: string]: { [key: number]: number } } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // getDay() returns 0 for Sunday

    // Initialize heatmap with 0 profit for all days and hours
    days.forEach(day => {
      heatmap[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        heatmap[day][hour] = 0;
      }
    });

    trades.forEach(trade => {
      if (trade.status === 'closed' && trade.profit !== undefined && trade.entryDate) {
        const date = parseISO(trade.entryDate);
        const dayName = days[date.getDay()];
        const hour = date.getHours();
        heatmap[dayName][hour] = parseFloat((heatmap[dayName][hour] + trade.profit).toFixed(2));
      }
    });

    const result: Array<{ day: string; hour: number; profit: number }> = [];
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        result.push({
          day,
          hour,
          profit: heatmap[day][hour]
        });
      }
    });
    return result;
  }

  // Helper to calculate Equity Curve (needed for Drawdown)
  private calculateEquityCurve(trades: Trade[]): Array<{ date: string; value: number }> {
    // Sort trades by entryDate to ensure correct chronological order
    trades.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    let cumulativePnL = 0;
    const equityData: Array<{ date: string; value: number }> = [];

    trades.forEach(trade => {
      if (trade.status === 'closed' && trade.profit !== undefined) {
        cumulativePnL += trade.profit;
        equityData.push({
          date: format(parseISO(trade.entryDate), 'yyyy-MM-dd'), // Use a consistent date format
          value: parseFloat(cumulativePnL.toFixed(2))
        });
      }
    });
    return equityData;
  }

  // Helper to calculate Max Drawdown and Drawdown Periods
  private calculateDrawdown(equityCurve: Array<{ date: string; value: number }>): { maxDrawdown: number; drawdownPeriods: Array<{ date: string; value: number }> } {
    if (equityCurve.length === 0) return { maxDrawdown: 0, drawdownPeriods: [] };

    let maxEquity = equityCurve[0].value;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    const drawdownPeriods: Array<{ date: string; value: number }> = [];

    for (let i = 0; i < equityCurve.length; i++) {
      const { date, value } = equityCurve[i];
      if (value > maxEquity) {
        maxEquity = value;
        currentDrawdown = 0;
      } else {
        currentDrawdown = (maxEquity - value) / maxEquity; // Percentage drawdown
      }

      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
      drawdownPeriods.push({ date, value: parseFloat((currentDrawdown * 100).toFixed(2)) }); // Store as percentage
    }

    return { maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)), drawdownPeriods };
  }

  // Helper to calculate Standard Deviation
  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Helper to calculate Downside Deviation
  private calculateDownsideDeviation(profits: number[], targetReturn: number = 0): number {
    if (profits.length === 0) return 0;
    const downsideReturns = profits.filter(p => p < targetReturn).map(p => targetReturn - p);
    if (downsideReturns.length === 0) return 0;
    const sumOfSquares = downsideReturns.reduce((sum, val) => sum + Math.pow(val, 2), 0);
    return Math.sqrt(sumOfSquares / profits.length);
  }

  // Calculate Sharpe Ratio
  private calculateSharpeRatio(profits: number[], riskFreeRate: number = 0): number {
    if (profits.length === 0) return 0;
    const averageReturn = profits.reduce((sum, p) => sum + p, 0) / profits.length;
    const stdDev = this.calculateStandardDeviation(profits);
    
    if (stdDev === 0) return 0; // Avoid division by zero

    return (averageReturn - riskFreeRate) / stdDev;
  }

  // Calculate Sortino Ratio
  private calculateSortinoRatio(profits: number[], riskFreeRate: number = 0): number {
    if (profits.length === 0) return 0;
    const averageReturn = profits.reduce((sum, p) => sum + p, 0) / profits.length;
    const downsideDev = this.calculateDownsideDeviation(profits, riskFreeRate);
    
    if (downsideDev === 0) return 0; // Avoid division by zero

    return (averageReturn - riskFreeRate) / downsideDev;
  }

  private analyzeBehavioralPatterns(trades: Trade[], analytics: Analytics): string[] {
    const patterns: string[] = [];

    // Pattern 1: Over-risking / Under-sizing
    // Example: If average loss is significantly higher than average win, or risk/reward is consistently bad
    if (analytics.averageWin > 0 && analytics.averageLoss < 0 && Math.abs(analytics.averageLoss) > analytics.averageWin * 1.5) {
      patterns.push("Potential pattern: Average losses are significantly larger than average wins. Consider adjusting your stop-loss and take-profit strategies.");
    }
    if (analytics.averageRiskRewardRatio < 0.8 && analytics.totalTrades > 5) {
        patterns.push("Potential pattern: Your average risk-reward ratio is low. Aim for trades where potential profit is at least twice the potential loss.");
    }

    // Pattern 2: Chasing Losses (e.g., increased trade frequency after a loss)
    // This requires analyzing sequence of trades, which is more complex. For simplicity, we can look at increased activity on losing days.
    const losingDays = analytics.profitByDayOfWeek.filter(day => day.profit < 0);
    if (losingDays.some(day => day.trades > analytics.totalTrades / 7 * 1.5)) { // If trades on losing days are 1.5x average daily trades
        patterns.push("Potential pattern: Increased trading activity on days when you are experiencing losses. This might indicate chasing losses.");
    }

    // Pattern 3: Holding losers too long / Cutting winners too short
    // This is hard without target price or SL/TP. Let's use average hold time for wins vs losses.
    const winningTrades = trades.filter(t => t.profit && t.profit > 0 && t.entryDate && t.exitDate);
    const losingTrades = trades.filter(t => t.profit && t.profit < 0 && t.entryDate && t.exitDate);

    const avgHoldTimeWinning = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => {
        const entry = new Date(t.entryDate!).getTime();
        const exit = new Date(t.exitDate!).getTime();
        return sum + (exit - entry);
    }, 0) / winningTrades.length : 0;
    
    const avgHoldTimeLosing = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => {
        const entry = new Date(t.entryDate!).getTime();
        const exit = new Date(t.exitDate!).getTime();
        return sum + (exit - entry);
    }, 0) / losingTrades.length : 0;

    if (avgHoldTimeLosing > avgHoldTimeWinning * 1.2 && losingTrades.length > 5) { // If losers are held 20% longer than winners
        patterns.push("Potential pattern: You tend to hold onto losing trades longer than winning trades. This can amplify losses.");
    }

    // Pattern 4: Trading during consistently unprofitable times/days
    const consistentlyUnprofitableDays = analytics.profitByDayOfWeek.filter(day => day.trades > 0 && day.profit < 0 && day.trades >= 3); // At least 3 trades and negative profit
    if (consistentlyUnprofitableDays.length > 0) {
        const daysList = consistentlyUnprofitableDays.map(d => d.day).join(', ');
        patterns.push(`Potential pattern: Consistently unprofitable trading on ${daysList}. Consider reviewing your strategy or avoiding trading during these days.`);
    }

    // Pattern 5: Over-trading (e.g., very high trade count with low average profit)
    if (analytics.totalTrades > 50 && analytics.averageProfit < 0.1 * analytics.averageWin && analytics.winRate < 60) {
        patterns.push("Potential pattern: You might be over-trading. A high volume of trades with relatively small average profits and a moderate win rate can reduce overall profitability due to commissions/spreads.");
    }

    return patterns;
  }
}

export const tradeAnalyticsService = new TradeAnalyticsService(); 