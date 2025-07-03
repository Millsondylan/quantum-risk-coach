import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { PieChart as PieChartIcon, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetAllocationChartProps {
  className?: string;
  isWidget?: boolean;
}

interface AssetData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ 
  className, 
  isWidget = false 
}) => {
  const { trades } = useLocalTrades();

  const assetData = useMemo(() => {
    // Group trades by symbol
    const assetMap = new Map<string, number>();
    let totalValue = 0;

    trades.forEach(trade => {
      const symbol = trade.symbol || 'Unknown';
      const value = Math.abs((trade.profitLoss || 0) + (trade.price * trade.amount));
      
      if (assetMap.has(symbol)) {
        assetMap.set(symbol, assetMap.get(symbol)! + value);
      } else {
        assetMap.set(symbol, value);
      }
      
      totalValue += value;
    });

    // Convert to array and calculate percentages
    const data: AssetData[] = Array.from(assetMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 assets

    // If there are more than 8 assets, group the rest as "Others"
    if (assetMap.size > 8) {
      const othersValue = Array.from(assetMap.entries())
        .slice(8)
        .reduce((sum, [_, value]) => sum + value, 0);
      
      data.push({
        name: 'Others',
        value: othersValue,
        percentage: totalValue > 0 ? (othersValue / totalValue) * 100 : 0,
        color: '#64748B'
      });
    }

    return { data, totalValue };
  }, [trades]);

  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const renderCustomLabel = (entry: AssetData) => {
    if (entry.percentage < 5) return null;
    return `${entry.percentage.toFixed(1)}%`;
  };

  if (isWidget) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Asset Allocation
          </h3>
          <div className="text-sm text-slate-400">
            Total: ${assetData.totalValue.toFixed(2)}
          </div>
        </div>
        
        {assetData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
            <PieChartIcon className="w-8 h-8 mb-2" />
            <p className="text-sm">No trading data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={assetData.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assetData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1B1E',
                  border: '1px solid #2A2B2E',
                  borderRadius: '8px'
                }}
                formatter={formatTooltipValue}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("holo-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Asset Allocation
          </span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total Value:</span>
              <span className="font-bold text-white">
                ${assetData.totalValue.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Assets:</span>
              <span className="font-bold text-white">
                {assetData.data.length}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assetData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
            <PieChartIcon className="w-12 h-12 mb-4" />
            <p className="text-lg mb-2">No trading data available</p>
            <p className="text-sm text-center">
              Start adding trades to see your asset allocation
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetData.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetData.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1B1E',
                      border: '1px solid #2A2B2E',
                      borderRadius: '8px'
                    }}
                    formatter={formatTooltipValue}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Asset List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-400 mb-3">
                Asset Breakdown
              </h4>
              {assetData.data.map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="font-medium">{asset.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      {asset.percentage.toFixed(1)}%
                    </span>
                    <span className="font-medium">
                      ${asset.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {assetData.data.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">Top Asset</div>
                <div className="font-medium">{assetData.data[0]?.name || 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">Concentration</div>
                <div className="font-medium">
                  {assetData.data[0]?.percentage.toFixed(1) || 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">Diversification</div>
                <div className="font-medium">
                  {assetData.data.length <= 3 ? 'Low' : assetData.data.length <= 6 ? 'Medium' : 'High'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 