import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrades } from '@/hooks/useTrades';
import { formatCurrency } from '@/lib/utils';

const RecentTrades = () => {
  const navigate = useNavigate();
  const { trades, loading } = useTrades();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTradeStatusColor = (status: string | null, profitLoss: number | null) => {
    if (status === 'open') return 'text-yellow-400';
    if (profitLoss && profitLoss > 0) return 'text-green-400';
    if (profitLoss && profitLoss < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getTradeTypeIcon = (tradeType: string | null) => {
    return tradeType === 'buy' ? (
      <ArrowUpRight className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-400" />
    );
  };

  if (loading) {
    return (
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-16 bg-slate-500/20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
          </div>
          <Button
            onClick={() => navigate('/journal')}
            className="holo-button"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </Button>
        </div>

        <div className="p-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-16 h-16 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Trades Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Start tracking your trades by adding your first trade entry. You can manually add trades or connect your MT4/5 account for automatic sync.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/journal')}
              className="holo-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Trade
            </Button>
            <Button 
              onClick={() => navigate('/connect-mt4')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Connect MT4/5
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const recentTrades = trades.slice(0, 5);

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
        </div>
        <Button
          onClick={() => navigate('/journal')}
          className="holo-button"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Trade
        </Button>
      </div>

      <div className="space-y-4">
        {recentTrades.map((trade) => (
          <div key={trade.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getTradeTypeIcon(trade.trade_type)}
                <div>
                  <p className="font-medium text-white">{trade.instrument}</p>
                  <p className="text-sm text-slate-400">
                    {trade.lot_size ? `${trade.lot_size} lots` : 'N/A'} • {trade.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`font-medium ${getTradeStatusColor(trade.status, trade.profit_loss)}`}>
                  {trade.profit_loss ? formatCurrency(trade.profit_loss) : '--'}
                </p>
                <p className="text-sm text-slate-400">
                  {trade.entry_price ? `@${trade.entry_price}` : '--'}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-400">
                  {formatDate(trade.opened_at)}
                </p>
                <p className="text-xs text-slate-500">
                  {trade.source || 'Manual'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trades.length > 5 && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate('/journal')}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            View All {trades.length} Trades
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentTrades;
