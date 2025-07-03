import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  PlusCircle, 
  Upload, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface TradeFormData {
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: string;
  exitPrice: string;
  size: string;
  entryDate: string;
  exitDate: string;
  notes: string;
  customSymbol: string;
  useCustomSymbol: boolean;
}

const AddTrade: React.FC = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    type: 'buy',
    entryPrice: '',
    exitPrice: '',
    size: '',
    entryDate: '',
    exitDate: '',
    notes: '',
    customSymbol: '',
    useCustomSymbol: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonSymbols = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'CHFJPY', 'AUDCAD', 'NZDUSD',
    'BTCUSD', 'ETHUSD', 'XAUUSD', 'XAGUSD'
  ];

  const handleInputChange = (field: keyof TradeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymbolSelect = (symbol: string) => {
    if (symbol === 'custom') {
      setFormData(prev => ({
        ...prev,
        useCustomSymbol: true,
        symbol: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        symbol,
        useCustomSymbol: false,
        customSymbol: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.symbol && !formData.customSymbol) {
      toast.error('Please enter a symbol');
      return false;
    }
    if (!formData.entryPrice) {
      toast.error('Please enter an entry price');
      return false;
    }
    if (!formData.exitPrice) {
      toast.error('Please enter an exit price');
      return false;
    }
    if (!formData.size) {
      toast.error('Please enter a position size');
      return false;
    }
    if (!formData.entryDate) {
      toast.error('Please enter an entry date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalSymbol = formData.useCustomSymbol ? formData.customSymbol : formData.symbol;
      
      // Here you would typically save to your database
      console.log('Saving trade:', {
        ...formData,
        symbol: finalSymbol
      });
      
      toast.success('Trade added successfully!');
      
      // Reset form
      setFormData({
        symbol: '',
        type: 'buy',
        entryPrice: '',
        exitPrice: '',
        size: '',
        entryDate: '',
        exitDate: '',
        notes: '',
        customSymbol: '',
        useCustomSymbol: false
      });
    } catch (error) {
      toast.error('Failed to add trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle CSV file upload
      toast.info('CSV import functionality would be implemented here');
    }
  };

  const calculateProfit = () => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const size = parseFloat(formData.size);
    
    if (isNaN(entry) || isNaN(exit) || isNaN(size)) return null;
    
    const priceDiff = formData.type === 'buy' ? exit - entry : entry - exit;
    return priceDiff * size;
  };

  const profit = calculateProfit();

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6" data-testid="add-trade-page">
      <div className="flex items-center gap-2">
        <PlusCircle className="h-6 w-6 text-blue-400" />
        <h1 className="text-3xl font-bold">Add Trade</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Trade Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Symbol Selection */}
              <div className="space-y-2">
                <Label>Symbol</Label>
                <div className="space-y-2">
                  <Select 
                    value={formData.useCustomSymbol ? 'custom' : formData.symbol} 
                    onValueChange={handleSymbolSelect}
                  >
                    <SelectTrigger data-testid="symbol-select">
                      <SelectValue placeholder="Select or enter custom symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonSymbols.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Symbol</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {formData.useCustomSymbol && (
                    <Input
                      placeholder="Enter custom symbol (e.g., AAPL, TSLA, BTC)"
                      value={formData.customSymbol}
                      onChange={(e) => handleInputChange('customSymbol', e.target.value)}
                      data-testid="custom-symbol-input"
                    />
                  )}
                </div>
              </div>

              {/* Trade Type */}
              <div className="space-y-2">
                <Label>Trade Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'buy' | 'sell') => handleInputChange('type', value)}
                >
                  <SelectTrigger data-testid="trade-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Buy (Long)
                      </div>
                    </SelectItem>
                    <SelectItem value="sell">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Sell (Short)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Price</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Enter entry price"
                    value={formData.entryPrice}
                    onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                    data-testid="entry-price-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exit Price</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Enter exit price"
                    value={formData.exitPrice}
                    onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                    data-testid="exit-price-input"
                  />
                </div>
              </div>

              {/* Size and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Position Size</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter size (lots)"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    data-testid="size-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entry Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.entryDate}
                    onChange={(e) => handleInputChange('entryDate', e.target.value)}
                    data-testid="entry-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exit Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.exitDate}
                    onChange={(e) => handleInputChange('exitDate', e.target.value)}
                    data-testid="exit-date-input"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add trade notes, strategy, or observations..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  data-testid="notes-input"
                />
              </div>

              {/* Profit Calculation */}
              {profit !== null && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Calculated Profit/Loss:</span>
                    <Badge variant={profit >= 0 ? 'default' : 'destructive'} className="text-sm">
                      {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[44px]"
                  data-testid="save-trade-button"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Save Trade
                    </div>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFormData({
                    symbol: '',
                    type: 'buy',
                    entryPrice: '',
                    exitPrice: '',
                    size: '',
                    entryDate: '',
                    exitDate: '',
                    notes: '',
                    customSymbol: '',
                    useCustomSymbol: false
                  })}
                  className="min-h-[44px]"
                  data-testid="reset-form-button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import CSV Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload CSV File</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  data-testid="csv-file-input"
                />
                <p className="text-sm text-slate-400">
                  CSV should contain columns: Symbol, Type, Entry Price, Exit Price, Size, Date, Notes
                </p>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Example:</h4>
                <pre className="text-xs text-slate-400">
{`Symbol,Type,Entry Price,Exit Price,Size,Date,Notes
EURUSD,buy,1.1000,1.1050,1.0,2024-01-01 10:00:00,Test trade
GBPUSD,sell,1.2500,1.2450,0.5,2024-01-02 14:30:00,Another trade`}
                </pre>
              </div>

              <Button 
                variant="outline" 
                className="w-full min-h-[44px]"
                data-testid="csv-import-button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Trades
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddTrade; 