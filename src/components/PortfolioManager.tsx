import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  Target,
  Activity,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Download,
  Upload,
  CheckCircle2,
  Shield,
  Award,
  BookOpen,
  Pencil
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useTrades } from '@/hooks/useTrades';
import { toast } from 'sonner';
import { placeholderService } from '@/lib/placeholderService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  percentChange: number;
  allocation: number;
  marketValue: number;
  broker: string;
}

interface Portfolio {
  id: string;
  name: string;
  brokerIds: string[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  cashBalance: number;
  marginUsed: number;
  marginAvailable: number;
  exposure: number;
  withdrawals: number;
  deposits: number;
}

interface Transaction {
  id: string;
  portfolioId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

const PortfolioManager = () => {
  const { user } = useUser();
  const { trades } = useTrades();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: '',
    currency: 'USD'
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [portfolioToRename, setPortfolioToRename] = useState<Portfolio | null>(null);

  // Load real portfolios and data
  useEffect(() => {
    loadPortfolios();

    // Load user-created portfolios from localStorage
    const storedCustom = localStorage.getItem('custom_portfolios');
    if (storedCustom) {
      try {
        const parsed: Portfolio[] = JSON.parse(storedCustom);
        if (parsed.length) {
          setPortfolios(prev => [...prev, ...parsed]);
        }
      } catch (error) {
        console.error('Failed to parse stored portfolios:', error);
      }
    }
  }, [user]);

  const loadPortfolios = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Get connected brokers
              placeholderService.showDataConnection('User Connections');
        const connections = [];
      const connectedBrokers = connections.filter(conn => conn.status === 'connected');
      
      if (connectedBrokers.length === 0) {
        // Create default portfolio if no brokers connected
        const defaultPortfolio: Portfolio = {
          id: 'default',
          name: 'Main Portfolio',
          brokerIds: [],
          totalValue: 0,
          totalPnL: 0,
          totalPnLPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          cashBalance: 0,
          marginUsed: 0,
          marginAvailable: 0,
          exposure: 0,
          withdrawals: 0,
          deposits: 0
        };
        setPortfolios([defaultPortfolio]);
        setSelectedPortfolioId('default');
      } else {
        // Create portfolios from connected brokers
        const realPortfolios: Portfolio[] = [];
        let totalBalance = 0;
        let totalPnL = 0;
        
        for (const broker of connectedBrokers) {
          placeholderService.showDataConnection('Account Balance');
          const accountInfo = { balance: 0, profit: 0, freeMargin: 0, margin: 0 };
          totalBalance += accountInfo.balance || 0;
          totalPnL += accountInfo.profit || 0;
          
          const portfolio: Portfolio = {
            id: broker.id,
            name: `${broker.name} Portfolio`,
            brokerIds: [broker.id],
            totalValue: accountInfo.balance || 0,
            totalPnL: accountInfo.profit || 0,
            totalPnLPercent: ((accountInfo.profit || 0) / (accountInfo.balance || 1)) * 100,
            dayChange: accountInfo.profit || 0, // This would be calculated from daily trades
            dayChangePercent: ((accountInfo.profit || 0) / (accountInfo.balance || 1)) * 100,
            cashBalance: accountInfo.freeMargin || 0,
            marginUsed: accountInfo.margin || 0,
            marginAvailable: accountInfo.freeMargin || 0,
            exposure: ((accountInfo.margin || 0) / (accountInfo.balance || 1)),
            withdrawals: 0, // Load from transactions
            deposits: 0 // Load from transactions
          };
          
          realPortfolios.push(portfolio);
        }
        
        // Add combined portfolio
        if (realPortfolios.length > 1) {
          const combinedPortfolio: Portfolio = {
            id: 'combined',
            name: 'All Portfolios',
            brokerIds: connectedBrokers.map(b => b.id),
            totalValue: totalBalance,
            totalPnL: totalPnL,
            totalPnLPercent: (totalPnL / totalBalance) * 100,
            dayChange: totalPnL, // Calculate from daily trades
            dayChangePercent: (totalPnL / totalBalance) * 100,
            cashBalance: realPortfolios.reduce((sum, p) => sum + p.cashBalance, 0),
            marginUsed: realPortfolios.reduce((sum, p) => sum + p.marginUsed, 0),
            marginAvailable: realPortfolios.reduce((sum, p) => sum + p.marginAvailable, 0),
            exposure: realPortfolios.reduce((sum, p) => sum + p.exposure, 0) / realPortfolios.length,
            withdrawals: 0,
            deposits: 0
          };
          realPortfolios.unshift(combinedPortfolio);
        }
        
        setPortfolios(realPortfolios);
        setSelectedPortfolioId(realPortfolios[0]?.id || '');
      }
      
      await loadTransactions();
      await loadPositions();
    } catch (error) {
      console.error('Failed to load portfolios:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPositions = async () => {
    if (!selectedPortfolioId) return;
    
    try {
      const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
      if (!selectedPortfolio) return;
      
      const allPositions: Position[] = [];
      
      for (const brokerId of selectedPortfolio.brokerIds) {
        placeholderService.showDataConnection('Broker Trades');
        const trades = [];
        // Convert trades to positions (aggregate open trades by symbol)
        // This would be implemented based on broker-specific trade data
      }
      
      setPositions(allPositions);
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user?.id) return;
    
    try {
      // Replace Supabase transaction loading
      let transactionData: any[] = [];
      const storedTransactions = localStorage.getItem('portfolioTransactions');
      if (storedTransactions) {
        try {
          transactionData = JSON.parse(storedTransactions);
        } catch (e) {
          transactionData = [];
        }
      }

      const realTransactions: Transaction[] = transactionData.map((t: any) => ({
        id: t.id,
        portfolioId: t.portfolio_id || 'default',
        type: t.type as 'deposit' | 'withdrawal',
        amount: t.amount,
        currency: t.currency || 'USD',
        description: t.description || '',
        date: t.created_at,
        status: t.status as 'pending' | 'completed' | 'failed'
      }));

      setTransactions(realTransactions);
      
      // Update portfolio withdrawal/deposit totals
      setPortfolios(prev => prev.map(portfolio => {
        const portfolioTransactions = realTransactions.filter(t => t.portfolioId === portfolio.id);
        const deposits = portfolioTransactions
          .filter(t => t.type === 'deposit' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        const withdrawals = portfolioTransactions
          .filter(t => t.type === 'withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          ...portfolio,
          deposits,
          withdrawals,
          // Adjust total value to account for withdrawals/deposits
          totalValue: portfolio.totalValue + deposits - withdrawals
        };
      }));
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transaction history');
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Replace Supabase transaction saving
      let transactionData: any[] = [];
      const storedTransactions = localStorage.getItem('portfolioTransactions');
      if (storedTransactions) {
        try {
          transactionData = JSON.parse(storedTransactions);
        } catch (e) {
          transactionData = [];
        }
      }
      const inserted: any = {
        id: (transactionData.length + 1).toString(),
        created_at: new Date().toISOString(),
        ...newTransaction,
        status: 'completed',
      };
      transactionData.push(inserted);
      localStorage.setItem('portfolioTransactions', JSON.stringify(transactionData));
      
      // Add to local state
      const transaction: Transaction = {
        id: inserted.id,
        portfolioId: selectedPortfolioId,
        type: newTransaction.type,
        amount,
        currency: newTransaction.currency,
        description: newTransaction.description,
        date: inserted.created_at,
        status: 'completed'
      };
      
      setTransactions(prev => [transaction, ...prev]);
      setNewTransaction({ type: 'deposit', amount: '', description: '', currency: 'USD' });
      setShowTransactionDialog(false);
      
      // Update portfolio balance
      await loadPortfolios();
      
      toast.success(`${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} recorded successfully`);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to record transaction');
    }
  };

  const handleCreatePortfolio = () => {
    if (!newPortfolioName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    // Check if a portfolio with the same name already exists
    if (portfolios.some(p => p.name.toLowerCase() === newPortfolioName.trim().toLowerCase())) {
        toast.error('A portfolio with this name already exists.');
        return;
    }
    const newPortfolio: Portfolio = {
      id: `custom_${Date.now()}`,
      name: newPortfolioName.trim(),
      brokerIds: [],
      totalValue: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      cashBalance: 0,
      marginUsed: 0,
      marginAvailable: 0,
      exposure: 0,
      withdrawals: 0,
      deposits: 0
    };

    setPortfolios(prev => {
      const updated = [...prev, newPortfolio];
      localStorage.setItem('custom_portfolios', JSON.stringify(updated.filter(p => p.id.startsWith('custom_'))));
      return updated;
    });
    setSelectedPortfolioId(newPortfolio.id);
    setNewPortfolioName('');
    setShowAddDialog(false);
    toast.success('Portfolio created');
  };

  const handleRenamePortfolio = () => {
    if (!portfolioToRename || !newPortfolioName.trim()) {
      toast.error('Invalid portfolio or name');
      return;
    }

    if (portfolios.some(p => p.id !== portfolioToRename.id && p.name.toLowerCase() === newPortfolioName.trim().toLowerCase())) {
      toast.error('A portfolio with this name already exists.');
      return;
    }

    setPortfolios(prev => {
      const updated = prev.map(p =>
        p.id === portfolioToRename.id ? { ...p, name: newPortfolioName.trim() } : p
      );
      localStorage.setItem('custom_portfolios', JSON.stringify(updated.filter(p => p.id.startsWith('custom_'))));
      return updated;
    });
    setNewPortfolioName('');
    setShowRenameDialog(false);
    setPortfolioToRename(null);
    toast.success('Portfolio renamed');
  };

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);

  if (!selectedPortfolio) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">No Portfolio Data</h3>
          <p className="text-slate-400 mb-4">Connect a broker to start tracking your portfolio</p>
          <Button onClick={() => window.location.href = '/settings'}>
            Connect Broker
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (hideValues) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    if (hideValues) return '••••';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header with add portfolio button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Portfolios</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Portfolio
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-green-400" />
            <span>Portfolio Management</span>
          </h2>
          <p className="text-slate-400">Live portfolio tracking from connected brokers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Portfolio" />
            </SelectTrigger>
            <SelectContent>
              {portfolios.map(portfolio => (
                <SelectItem key={portfolio.id} value={portfolio.id} className="flex items-center justify-between">
                  {portfolio.name}
                  {portfolio.id.startsWith('custom_') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-1 text-slate-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent select item from closing
                        setPortfolioToRename(portfolio);
                        setNewPortfolioName(portfolio.name);
                        setShowRenameDialog(true);
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideValues(!hideValues)}
            className="border-slate-600 text-slate-300"
          >
            {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPortfolios}
            disabled={isLoading}
            className="border-cyan-500 text-cyan-400"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedPortfolio.totalValue)}
                </p>
                <p className={`text-sm ${selectedPortfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(selectedPortfolio.totalPnL)} ({formatPercent(selectedPortfolio.totalPnLPercent)})
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Daily Change</p>
                <p className={`text-2xl font-bold ${selectedPortfolio.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(selectedPortfolio.dayChange)}
                </p>
                <p className={`text-sm ${selectedPortfolio.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(selectedPortfolio.dayChangePercent)}
                </p>
              </div>
              {selectedPortfolio.dayChange >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-400" /> : 
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cash Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedPortfolio.cashBalance)}
                </p>
                <p className="text-sm text-slate-400">Available for trading</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Net Deposits</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedPortfolio.deposits - selectedPortfolio.withdrawals)}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-green-400">+{formatCurrency(selectedPortfolio.deposits)}</span>
                  <span className="text-red-400">-{formatCurrency(selectedPortfolio.withdrawals)}</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="holo-card">
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
                <CardDescription>Real-time account overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Value</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(selectedPortfolio.totalValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Unrealized P&L</span>
                  <span className={`font-bold ${selectedPortfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(selectedPortfolio.totalPnL)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Margin Used</span>
                  <span className="text-white font-medium">{formatCurrency(selectedPortfolio.marginUsed)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Margin Available</span>
                  <span className="text-green-400 font-medium">{formatCurrency(selectedPortfolio.marginAvailable)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Portfolio Exposure</span>
                    <span className="text-white font-medium">{(selectedPortfolio.exposure * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={selectedPortfolio.exposure * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="holo-card">
              <CardHeader>
                <CardTitle>Broker Connections</CardTitle>
                <CardDescription>Connected trading accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPortfolio.brokerIds.map(brokerId => (
                    <div key={brokerId} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-white font-medium">{brokerId}</span>
                      </div>
                      <Badge className="bg-green-400/10 text-green-400 border-green-400/30">
                        Connected
                      </Badge>
                    </div>
                  ))}
                  {selectedPortfolio.brokerIds.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">No brokers connected</p>
                      <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                        Connect Broker
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="holo-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Deposits and withdrawals</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setShowTransactionDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Transaction
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No transactions recorded</p>
                  <Button onClick={() => setShowTransactionDialog(true)}>
                    Record First Transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${transaction.type === 'deposit' ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                          {transaction.type === 'deposit' ? 
                            <Download className={`w-4 h-4 text-green-400`} /> : 
                            <Upload className={`w-4 h-4 text-red-400`} />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-white">{transaction.description}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <Badge className={`text-xs ${
                          transaction.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                          transaction.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-red-400/10 text-red-400'
                        }`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents here... */}
      </Tabs>

      {/* Transaction Dialog */}
      {showTransactionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Record Transaction</CardTitle>
              <CardDescription>Add a deposit or withdrawal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transaction Type</Label>
                <Select value={newTransaction.type} onValueChange={(value: 'deposit' | 'withdrawal') => 
                  setNewTransaction(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="e.g., Initial deposit, Profit withdrawal"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-6">
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>
                Record Transaction
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Portfolio Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Portfolio name"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePortfolio}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Portfolio Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New portfolio name"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenamePortfolio}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioManager; 