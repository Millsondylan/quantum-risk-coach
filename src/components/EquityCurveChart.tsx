import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquityCurveChartProps {
  className?: string;
  height?: number;
  showDrawdown?: boolean;
  isWidget?: boolean;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ 
  className, 
  height = 300,
  showDrawdown = true,
  isWidget = false
}) => {
  const { trades } = useLocalTrades();

  const equityData = useMemo(() => {
    // Sort trades by date
    const sortedTrades = [...trades]
      .filter(trade => trade.exitDate)
      .sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime());

    if (sortedTrades.length === 0) {
      return {
        data: [],
        maxEquity: 0,
        maxDrawdown: 0,
        currentEquity: 0,
        profitLoss: 0,
        profitLossPercent: 0
      };
    }

    // Calculate cumulative equity curve
    let runningTotal = 0;
    let maxEquity = 0;
    let maxDrawdown = 0;
    
    const data = sortedTrades.map((trade, index) => {
      runningTotal += trade.profitLoss || 0;
      
      // Track max equity for drawdown calculation
      if (runningTotal > maxEquity) {
        maxEquity = runningTotal;
      }
      
      // Calculate drawdown
      const drawdown = maxEquity > 0 ? ((maxEquity - runningTotal) / maxEquity) * 100 : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      return {
        date: new Date(trade.exitDate!).toLocaleDateString(),
        equity: runningTotal,
        drawdown: -drawdown,
        tradeNumber: index + 1
      };
    });

    // Add starting point
    data.unshift({
      date: 'Start',
      equity: 0,
      drawdown: 0,
      tradeNumber: 0
    });

    const currentEquity = runningTotal;
    const profitLoss = currentEquity;
    const profitLossPercent = 0; // Would need initial balance to calculate

    return {
      data,
      maxEquity,
      maxDrawdown,
      currentEquity,
      profitLoss,
      profitLossPercent
    };
  }, [trades]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'Drawdown') {
      return `${Math.abs(value).toFixed(2)}%`;
    }
    return `$${value.toFixed(2)}`;
  };

  if (isWidget) {
    return (
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Equity Curve</h3>
          <div className={cn(
            "flex items-center gap-1 text-sm",
            equityData.profitLoss >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {equityData.profitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            ${Math.abs(equityData.profitLoss).toFixed(2)}
          </div>
        </div>
        
        {equityData.data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-slate-400">
            <p>No closed trades to display</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityData.data}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2E" />
              <XAxis 
                dataKey="tradeNumber" 
                stroke="#64748B"
                fontSize={12}
                tick={{ fill: '#64748B' }}
              />
              <YAxis 
                stroke="#64748B"
                fontSize={12}
                tick={{ fill: '#64748B' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1B1E',
                  border: '1px solid #2A2B2E',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#94A3B8' }}
                formatter={formatTooltipValue}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#equityGradient)"
                strokeWidth={2}
                name="Equity"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("holo-card overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Equity Curve
          </span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current:</span>
              <span className={cn(
                "font-bold",
                equityData.currentEquity >= 0 ? "text-green-400" : "text-red-400"
              )}>
                ${Math.abs(equityData.currentEquity).toFixed(2)}
              </span>
            </div>
            {showDrawdown && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Max DD:</span>
                <span className="text-red-400 font-bold">
                  {equityData.maxDrawdown.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {equityData.data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-slate-400">
            <p>No closed trades to display equity curve</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={equityData.data}>
              <defs>
                <linearGradient id="equityGradientFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#2A2B2E" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="#64748B"
                fontSize={12}
                tick={{ fill: '#64748B' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="equity"
                stroke="#64748B"
                fontSize={12}
                tick={{ fill: '#64748B' }}
                tickFormatter={(value) => `$${value}`}
              />
              {showDrawdown && (
                <YAxis 
                  yAxisId="drawdown"
                  orientation="right"
                  stroke="#64748B"
                  fontSize={12}
                  tick={{ fill: '#64748B' }}
                  tickFormatter={(value) => `${Math.abs(value)}%`}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1B1E',
                  border: '1px solid #2A2B2E',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#94A3B8' }}
                formatter={formatTooltipValue}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px'
                }}
              />
              <Line
                yAxisId="equity"
                type="monotone"
                dataKey="equity"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }}
                activeDot={{ r: 5 }}
                name="Equity"
              />
              {showDrawdown && (
                <Area
                  yAxisId="drawdown"
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#drawdownGradient)"
                  strokeWidth={1}
                  name="Drawdown"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}; 