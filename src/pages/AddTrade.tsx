import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TagInput } from '@/components/ui/tag-input';
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
  X,
  Scan,
  Camera,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { toast } from 'sonner';
import { Trade } from '@/lib/localDatabase';
import { Slider } from '@/components/ui/slider';
import { localDatabase } from '@/lib/localDatabase';
import { cn } from '@/lib/utils';

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
  tags: string[];
  confidenceRating: number;
  mood: 'positive' | 'negative' | 'neutral' | 'excited' | 'stressed' | 'calm' | 'greedy' | 'fearful';
}

interface FormErrors {
  symbol?: string;
  entryPrice?: string;
  exitPrice?: string;
  size?: string;
  entryDate?: string;
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
    useCustomSymbol: false,
    tags: [],
    confidenceRating: 50,
    mood: 'neutral'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
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
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleNumberInputChange = (field: keyof TradeFormData, value: string) => {
    // Allow any numeric input including decimals and negative numbers
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      // Clear error for this field when user starts typing
      if (formErrors[field as keyof FormErrors]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    }
  };

  const handleConfidenceChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, confidenceRating: value[0] }));
  };

  const handleMoodChange = (value: Trade['mood']) => {
    setFormData(prev => ({ ...prev, mood: value }));
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
    const errors: FormErrors = {};
    
    // Symbol validation
    if (!formData.symbol && !formData.customSymbol) {
      errors.symbol = 'Please enter a symbol';
    }
    
    // Entry price validation
    if (!formData.entryPrice) {
      errors.entryPrice = 'Please enter an entry price';
    } else if (isNaN(parseFloat(formData.entryPrice))) {
      errors.entryPrice = 'Entry price must be a valid number';
    }
    
    // Exit price validation
    if (!formData.exitPrice) {
      errors.exitPrice = 'Please enter an exit price';
    } else if (isNaN(parseFloat(formData.exitPrice))) {
      errors.exitPrice = 'Exit price must be a valid number';
    }
    
    // Size validation
    if (!formData.size) {
      errors.size = 'Please enter a position size';
    } else if (isNaN(parseFloat(formData.size)) || parseFloat(formData.size) <= 0) {
      errors.size = 'Position size must be a positive number';
    }
    
    // Entry date validation
    if (!formData.entryDate) {
      errors.entryDate = 'Please enter an entry date';
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors in the form');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call or direct database save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalSymbol = formData.useCustomSymbol ? formData.customSymbol : formData.symbol;
      
      // Construct the trade object to save
      const tradeToSave: any = {
        id: `trade_${Date.now()}`,
        symbol: finalSymbol,
        side: formData.type === 'buy' ? 'buy' : 'sell',
        amount: parseFloat(formData.size),
        price: parseFloat(formData.entryPrice),
        fee: 0, // Placeholder
        profit: calculateProfit() || 0,
        status: 'closed', // Assuming trades are closed upon entry for simplicity
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || new Date().toISOString(),
        riskReward: 0, // Placeholder
        tags: formData.tags,
        confidenceRating: formData.confidenceRating,
        mood: formData.mood
      };

      // Save to local database
      // You would use your actual localDatabase service here
      console.log('Saving trade:', tradeToSave);
      // await localDatabase.createTrade(tradeToSave);
      toast.success('Trade saved successfully!');

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
        useCustomSymbol: false,
        tags: [],
        confidenceRating: 50,
        mood: 'neutral'
      });
    } catch (error) {
      console.error('Failed to add trade:', error);
      toast.error('Failed to add trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Handle CSV file upload
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          try {
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const trades = lines.slice(1).filter(line => line.trim()).map(line => {
              const values = line.split(',').map(v => v.trim());
              const trade: any = {};
              headers.forEach((header, index) => {
                trade[header.toLowerCase().replace(/\s+/g, '')] = values[index];
              });
              return trade;
            });
            
            // Convert CSV data to Trade objects and save to database
            const savedTrades = [];
            for (const csvTrade of trades) {
              try {
                const tradeToSave: Trade = {
                  id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  accountId: 'default', // You might want to get this from user context
                  symbol: csvTrade.symbol || csvTrade.symbol || 'UNKNOWN',
                  type: (csvTrade.type || csvTrade.side || 'buy').toLowerCase() === 'sell' ? 'short' : 'long',
                  side: (csvTrade.type || csvTrade.side || 'buy').toLowerCase() === 'sell' ? 'sell' : 'buy',
                  amount: parseFloat(csvTrade.size || csvTrade.quantity || csvTrade.amount || '0') || 0,
                  quantity: parseFloat(csvTrade.size || csvTrade.quantity || csvTrade.amount || '0') || 0,
                  price: parseFloat(csvTrade.entryprice || csvTrade.entry || csvTrade.price || '0') || 0,
                  entryPrice: parseFloat(csvTrade.entryprice || csvTrade.entry || csvTrade.price || '0') || 0,
                  exitPrice: parseFloat(csvTrade.exitprice || csvTrade.exit || '0') || undefined,
                  fee: 0,
                  profit: parseFloat(csvTrade.profit || csvTrade.pnl || '0') || 0,
                  status: (csvTrade.exitprice || csvTrade.exit ? 'closed' : 'open') as 'open' | 'closed' | 'cancelled' | 'pending',
                  entryDate: csvTrade.date || csvTrade.entrydate || new Date().toISOString(),
                  exitDate: csvTrade.exitdate || csvTrade.date || undefined,
                  notes: csvTrade.notes || `Imported from CSV`,
                  tags: csvTrade.tags ? csvTrade.tags.split(';').map((tag: string) => tag.trim()) : [],
                  confidenceRating: 50,
                  mood: 'neutral'
                };

                // Save to database
                await localDatabase.createTrade(tradeToSave);
                savedTrades.push(tradeToSave);
              } catch (tradeError) {
                console.error('Failed to save trade:', csvTrade, tradeError);
              }
            }
            
            toast.success(`Successfully imported ${savedTrades.length} trades from CSV`);
            console.log('Saved trades:', savedTrades);
            
            // Reset file input
            event.target.value = '';
            
          } catch (error) {
            console.error('CSV parsing error:', error);
            toast.error('Failed to parse CSV file. Please check the format.');
          }
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        // Handle image upload for OCR
        await handleImageUpload(file);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      toast.info('Processing image with OCR...');
      
      // For now, we'll simulate OCR processing
      // In a real implementation, you would use Tesseract.js or similar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate extracted data
      const extractedData = {
        symbol: 'EURUSD',
        type: 'buy' as const,
        quantity: 1.0,
        entryPrice: 1.1000,
        exitPrice: 1.1050,
        date: new Date().toISOString().slice(0, 10),
        time: '10:00',
        confidence: 0.85
      };
      
      handleOCRTradeExtraction(extractedData);
      toast.success('OCR processing completed!');
      
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error('Failed to process image. Please try again.');
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

  const handleOCRTradeExtraction = (extractedData: {
    symbol?: string;
    type?: 'buy' | 'sell';
    quantity?: number;
    entryPrice?: number;
    exitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    date?: string;
    time?: string;
    broker?: string;
    orderId?: string;
    confidence: number;
  }) => {
    // Map ExtractedTradeData to TradeFormData
    setFormData(prev => ({
      ...prev,
      symbol: extractedData.symbol || '',
      type: extractedData.type === 'sell' ? 'sell' : 'buy',
      entryPrice: extractedData.entryPrice?.toString() || '',
      exitPrice: extractedData.exitPrice?.toString() || '',
      size: extractedData.quantity?.toString() || '',
      entryDate: extractedData.date ? (extractedData.date + (extractedData.time ? `T${extractedData.time}` : '')) : new Date().toISOString().slice(0, 16),
      exitDate: '',
      notes: `Imported via OCR` + (extractedData.orderId ? `. Order ID: ${extractedData.orderId}` : ''),
      tags: [], // Tags are not extracted by OCR yet
      confidenceRating: Math.round(extractedData.confidence * 100), // Convert 0-1 confidence to 0-100
      mood: 'neutral' // Mood is not extracted by OCR
    }));
    
    // Switch to manual tab to show the extracted data
    setActiveTab('manual');
    toast.success('Trade data extracted! Please review and complete the form.');
  };

  const renderManualEntry = () => (
    <div className="space-y-6">
      {/* Symbol Selection */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="symbol" className="text-white">Trading Symbol</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {commonSymbols.slice(0, 16).map((symbol) => (
              <Button
                key={symbol}
                variant={formData.symbol === symbol ? "default" : "outline"}
                size="sm"
                onClick={() => handleSymbolSelect(symbol)}
                className="text-xs"
              >
                {symbol}
              </Button>
            ))}
            <Button
              variant={formData.useCustomSymbol ? "default" : "outline"}
              size="sm"
              onClick={() => handleSymbolSelect('custom')}
              className="text-xs"
            >
              Custom
            </Button>
          </div>
          {formData.useCustomSymbol && (
            <Input
              value={formData.customSymbol}
              onChange={(e) => handleInputChange('customSymbol', e.target.value)}
              placeholder="Enter custom symbol"
              className={cn(
                "mt-2 bg-[#2A2B2E] border-[#3A3B3E] text-white",
                formErrors.symbol && "border-red-500"
              )}
            />
          )}
          {formErrors.symbol && (
            <p className="text-red-400 text-sm mt-1">{formErrors.symbol}</p>
          )}
        </div>

        {/* Trade Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Trade Type</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={formData.type === 'buy' ? "default" : "outline"}
                onClick={() => handleInputChange('type', 'buy')}
                className="flex-1"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={formData.type === 'sell' ? "default" : "outline"}
                onClick={() => handleInputChange('type', 'sell')}
                className="flex-1"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Sell
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="size" className="text-white">Position Size</Label>
            <Input
              id="size"
              type="number"
              value={formData.size}
              onChange={(e) => handleNumberInputChange('size', e.target.value)}
              placeholder="0.00"
              className={cn(
                "mt-2 bg-[#2A2B2E] border-[#3A3B3E] text-white",
                formErrors.size && "border-red-500"
              )}
            />
            {formErrors.size && (
              <p className="text-red-400 text-sm mt-1">{formErrors.size}</p>
            )}
          </div>
        </div>

        {/* Entry and Exit Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entryPrice" className="text-white">Entry Price</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.00001"
              value={formData.entryPrice}
              onChange={(e) => handleNumberInputChange('entryPrice', e.target.value)}
              placeholder="0.00000"
              className={cn(
                "mt-2 bg-[#2A2B2E] border-[#3A3B3E] text-white",
                formErrors.entryPrice && "border-red-500"
              )}
            />
            {formErrors.entryPrice && (
              <p className="text-red-400 text-sm mt-1">{formErrors.entryPrice}</p>
            )}
          </div>
          <div>
            <Label htmlFor="exitPrice" className="text-white">Exit Price</Label>
            <Input
              id="exitPrice"
              type="number"
              step="0.00001"
              value={formData.exitPrice}
              onChange={(e) => handleNumberInputChange('exitPrice', e.target.value)}
              placeholder="0.00000"
              className={cn(
                "mt-2 bg-[#2A2B2E] border-[#3A3B3E] text-white",
                formErrors.exitPrice && "border-red-500"
              )}
            />
            {formErrors.exitPrice && (
              <p className="text-red-400 text-sm mt-1">{formErrors.exitPrice}</p>
            )}
          </div>
        </div>

        {/* Entry and Exit Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entryDate" className="text-white">Entry Date</Label>
            <Input
              id="entryDate"
              type="datetime-local"
              value={formData.entryDate}
              onChange={(e) => handleInputChange('entryDate', e.target.value)}
              className={cn(
                "mt-2 bg-[#2A2B2E] border-[#3A3B3E] text-white",
                formErrors.entryDate && "border-red-500"
              )}
            />
            {formErrors.entryDate && (
              <p className="text-red-400 text-sm mt-1">{formErrors.entryDate}</p>
            )}
          </div>
          <div>
            <Label htmlFor="exitDate" className="text-white">Exit Date</Label>
            <Input
              id="exitDate"
              type="datetime-local"
              value={formData.exitDate}
              onChange={(e) => handleInputChange('exitDate', e.target.value)}
              className="mt-2 bg-[#2A2B2E] border-[#3A3B3E] text-white"
            />
          </div>
        </div>

        {/* Trade Analysis */}
        {formData.entryPrice && formData.exitPrice && (
          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Trade Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Profit/Loss</p>
                  <p className={`text-lg font-bold ${calculateProfit() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${calculateProfit()?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Return %</p>
                  <p className={`text-lg font-bold ${calculateProfit() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.entryPrice && formData.exitPrice ? 
                      (((parseFloat(formData.exitPrice) - parseFloat(formData.entryPrice)) / parseFloat(formData.entryPrice)) * 100).toFixed(2) : '0.00'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confidence and Mood */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Confidence Level</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Low</span>
                <span className="text-white font-medium">{formData.confidenceRating}%</span>
                <span className="text-slate-400 text-sm">High</span>
              </div>
              <Slider
                value={[formData.confidenceRating]}
                onValueChange={handleConfidenceChange}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Trade Mood</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={formData.mood === 'positive' ? "default" : "outline"}
                size="sm"
                onClick={() => handleMoodChange('positive')}
                className="flex-1"
              >
                <Smile className="w-4 h-4 mr-1" />
                Positive
              </Button>
              <Button
                variant={formData.mood === 'neutral' ? "default" : "outline"}
                size="sm"
                onClick={() => handleMoodChange('neutral')}
                className="flex-1"
              >
                <Meh className="w-4 h-4 mr-1" />
                Neutral
              </Button>
              <Button
                variant={formData.mood === 'negative' ? "default" : "outline"}
                size="sm"
                onClick={() => handleMoodChange('negative')}
                className="flex-1"
              >
                <Frown className="w-4 h-4 mr-1" />
                Negative
              </Button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-white">Tags</Label>
          <TagInput
            value={formData.tags}
            onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            placeholder="Add tags (e.g., breakout, reversal, news)"
            className="mt-2"
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-white">Trade Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Describe your trade setup, reasoning, and lessons learned..."
            className="mt-2 bg-[#2A2B2E] border-[#3A3B3E] text-white min-h-[100px]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Adding Trade...
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Trade
          </>
        )}
      </Button>
    </div>
  );

  const renderOCREntry = () => (
    <div className="space-y-6">
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-400" />
            OCR Trade Capture
          </CardTitle>
          <CardDescription>
            Upload a screenshot or photo of your trade to automatically extract trade details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-[#3A3B3E] rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Upload Trade Screenshot</p>
            <p className="text-slate-400 text-sm mb-4">
              Supported formats: PNG, JPG, JPEG. Max size: 10MB
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="trade-screenshot"
            />
            <label htmlFor="trade-screenshot">
              <Button variant="outline" className="cursor-pointer">
                <Camera className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Camera className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <p className="text-sm font-medium">Take Photo</p>
                <p className="text-xs text-slate-400">Use camera</p>
              </div>
            </Button>
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-sm font-medium">Paste Image</p>
                <p className="text-xs text-slate-400">From clipboard</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OCR Results Preview */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardHeader>
          <CardTitle className="text-white">Extracted Trade Data</CardTitle>
          <CardDescription>
            Review and edit the automatically extracted trade information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white text-sm">Symbol</Label>
                <Input
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  className="mt-1 bg-[#2A2B2E] border-[#3A3B3E] text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="mt-1 bg-[#2A2B2E] border-[#3A3B3E] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white text-sm">Entry Price</Label>
                <Input
                  value={formData.entryPrice}
                  onChange={(e) => handleNumberInputChange('entryPrice', e.target.value)}
                  className="mt-1 bg-[#2A2B2E] border-[#3A3B3E] text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Exit Price</Label>
                <Input
                  value={formData.exitPrice}
                  onChange={(e) => handleNumberInputChange('exitPrice', e.target.value)}
                  className="mt-1 bg-[#2A2B2E] border-[#3A3B3E] text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white text-sm">Size</Label>
              <Input
                value={formData.size}
                onChange={(e) => handleNumberInputChange('size', e.target.value)}
                className="mt-1 bg-[#2A2B2E] border-[#3A3B3E] text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6" data-testid="add-trade-page">
      <div className="flex items-center gap-2">
        <PlusCircle className="h-6 w-6 text-blue-400" />
        <h1 className="text-3xl font-bold">Add Trade</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            OCR Capture
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          {renderManualEntry()}
        </TabsContent>

        <TabsContent value="ocr" className="space-y-4">
          {renderOCREntry()}
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