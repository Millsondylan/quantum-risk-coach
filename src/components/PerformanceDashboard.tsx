import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { localDatabase as database, Trade } from '@/lib/localStorage';
import { tradeAnalyticsService } from '@/lib/tradeAnalyticsService';

export const PerformanceDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { currentPortfolio } = usePortfolioContext();
  const [tradeData, setTradeData] = React.useState<Trade[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchTrades = async () => {
      if (currentPortfolio) {
        setLoading(true);
        try {
          // Get all trades for the current portfolio across all accounts
          const portfolioTrades: Trade[] = [];
          
          for (const account of currentPortfolio.accounts) {
            const accountTrades = await database.getTrades(account.id);
            portfolioTrades.push(...accountTrades);
          }
          
          setTradeData(portfolioTrades);
        } catch (err) {
          console.error('Failed to fetch trades:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTrades();
  }, [currentPortfolio]);

  // Calculate analytics using the service
  const analytics = tradeAnalyticsService.calculateAnalytics(tradeData);
  
  // Chart colors
  const colors = {
    profit: theme === 'dark' ? '#22c55e' : '#16a34a',
    loss: theme === 'dark' ? '#ef4444' : '#dc2626',
    neutral: theme === 'dark' ? '#6b7280' : '#9ca3af',
    long: theme === 'dark' ? '#3b82f6' : '#2563eb',
    short: theme === 'dark' ? '#f97316' : '#ea580c',
    accent: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
    background: theme === 'dark' ? '#1e1e2e' : '#f8fafc',
    text: theme === 'dark' ? '#e2e8f0' : '#1e293b',
  };

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="text-sm font-medium">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-1/2 bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tradeData.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>No Trade Data</CardTitle>
          <CardDescription>
            You don't have any trades yet. Add trades manually or connect your broker account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-center">
            Start by adding a trade or importing your trade history to see your analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Win Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Win Rate</CardTitle>
          <CardDescription>Overall success percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-3xl font-bold">{analytics.winRate}%</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({analytics.wins} wins / {analytics.losses} losses)
              </span>
            </div>
            <Badge variant={analytics.winRate >= 50 ? "default" : "destructive"} className={analytics.winRate >= 50 ? "bg-green-500" : ""}>
              {analytics.winRate >= 50 ? "Above Average" : "Below Average"}
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Wins', value: analytics.wins },
                  { name: 'Losses', value: analytics.losses }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                <Cell fill={colors.profit} />
                <Cell fill={colors.loss} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit by Day of Week */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Profit by Day of Week</CardTitle>
          <CardDescription>Average profit per trading day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.profitByDayOfWeek}>
              <XAxis dataKey="day" stroke={colors.text} fontSize={12} />
              <YAxis stroke={colors.text} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="profit" 
                radius={[4, 4, 0, 0]} 
                fill={colors.accent}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk-Reward Ratio */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Risk-Reward Ratio</CardTitle>
          <CardDescription>Average reward relative to risk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold">{analytics.averageRiskRewardRatio.toFixed(2)}</span>
            <Badge 
              className={`ml-2 ${analytics.averageRiskRewardRatio >= 1 ? "bg-green-500" : ""}`} 
              variant={analytics.averageRiskRewardRatio >= 1 ? "default" : "destructive"}
            >
              {analytics.averageRiskRewardRatio >= 2 ? "Excellent" : 
               analytics.averageRiskRewardRatio >= 1 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Average Win</span>
              <span className="font-medium text-green-500">
                ${analytics.averageWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Loss</span>
              <span className="font-medium text-red-500">
                ${analytics.averageLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Biggest Win</span>
              <span className="font-medium text-green-500">
                ${analytics.biggestWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Biggest Loss</span>
              <span className="font-medium text-red-500">
                ${analytics.biggestLoss.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Long vs Short Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Long vs Short Performance</CardTitle>
          <CardDescription>Win rate by trade direction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-center">
                <span className="text-sm font-medium">Long</span>
                <div className="text-2xl font-bold text-blue-500">
                  {analytics.longWinRate}%
                </div>
                <span className="text-xs text-muted-foreground">
                  ({analytics.longTrades} trades)
                </span>
              </div>
            </div>
            <div>
              <div className="text-center">
                <span className="text-sm font-medium">Short</span>
                <div className="text-2xl font-bold text-orange-500">
                  {analytics.shortWinRate}%
                </div>
                <span className="text-xs text-muted-foreground">
                  ({analytics.shortTrades} trades)
                </span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Long', value: analytics.longTrades },
                  { name: 'Short', value: analytics.shortTrades }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={50}
                dataKey="value"
              >
                <Cell fill={colors.long} />
                <Cell fill={colors.short} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Best Market Session */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Best Market Session</CardTitle>
          <CardDescription>Performance by trading session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(analytics.sessionPerformance).map(([session, data]) => (
              <div key={session} className="text-center p-2 rounded-lg border">
                <span className="text-sm font-medium">{session}</span>
                <div className={`text-xl font-bold ${data.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${data.profit.toFixed(0)}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({data.trades} trades)
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Best Session</span>
              <Badge>{analytics.bestSession.name}</Badge>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Profit</span>
              <span className="font-medium text-green-500">
                ${analytics.bestSession.profit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Win Rate</span>
              <span className="font-medium">
                {analytics.bestSession.winRate}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Performing Symbol */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Symbol Performance</CardTitle>
          <CardDescription>Best and worst performing symbols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Best Symbol</span>
                <Badge variant="outline">{analytics.bestSymbol.symbol}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Profit</span>
                <span className="text-sm font-medium text-green-500">
                  ${analytics.bestSymbol.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Win Rate</span>
                <span className="text-sm font-medium">
                  {analytics.bestSymbol.winRate}%
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Worst Symbol</span>
                <Badge variant="outline">{analytics.worstSymbol.symbol}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Loss</span>
                <span className="text-sm font-medium text-red-500">
                  ${analytics.worstSymbol.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Win Rate</span>
                <span className="text-sm font-medium">
                  {analytics.worstSymbol.winRate}%
                </span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-1">Most Traded</div>
              <div className="flex flex-wrap gap-1">
                {analytics.mostTradedSymbols.slice(0, 5).map(symbol => (
                  <Badge key={symbol.symbol} variant="secondary">
                    {symbol.symbol} ({symbol.trades})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 