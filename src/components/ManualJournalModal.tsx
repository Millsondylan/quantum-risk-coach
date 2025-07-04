import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Upload, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Import from localStorage
import { Trade } from '@/lib/localDatabase';
import { localDatabase } from '@/lib/localDatabase';

interface ManualJournalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId?: string;
}

export const ManualJournalModal: React.FC<ManualJournalModalProps> = ({
  open,
  onOpenChange,
  portfolioId
}) => {
  const { toast } = useToast();
  const { currentPortfolio } = usePortfolioContext();
  const targetPortfolioId = portfolioId || currentPortfolio?.id;

  const [activeTab, setActiveTab] = useState<'csv' | 'screenshot' | 'manual'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [manualTradeData, setManualTradeData] = useState({
    symbol: '',
    side: 'buy' as 'buy' | 'sell',
    amount: '',
    price: '',
    entryDate: '',
    exitDate: '',
    profit: '',
    fee: '',
    status: 'closed' as 'open' | 'closed' | 'cancelled',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCsvSubmit = async () => {
    if (!csvFile || !targetPortfolioId) return;
    
    setIsLoading(true);
    try {
      const demoTrade: Trade = {
        id: uuidv4(),
        accountId: targetPortfolioId,
        symbol: 'BTC/USD',
        type: 'long',
        side: 'buy',
        amount: 0.5,
        quantity: 0.5,
        price: 50000,
        entryPrice: 50000,
        exitPrice: 52500,
        fee: 25,
        profit: 1250,
        profitLoss: 1250,
        status: 'closed',
        entryDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        entryTime: new Date(Date.now() - 86400000).toISOString(),
        exitDate: new Date().toISOString(),
        exitTime: new Date().toISOString(),
        riskReward: 2.5,
        riskRewardRatio: 2.5,
        strategy: 'Trend Following',
        tags: ['Crypto', 'Long-term'],
        notes: 'Breakout trade on BTC',
        exitReason: 'Target reached',
        takeProfit: 52500,
        stopLoss: 48000,
        confidence: 0.8,
        confidenceRating: 0.8,
        emotion: 'calm',
        mood: 'positive'
      };

      await localDatabase.bulkInsertTrades([demoTrade]);
      
      toast({
        title: "CSV Imported",
        description: "Trade data has been successfully imported"
      });
      
      onOpenChange(false);
      setCsvFile(null);
    } catch (error) {
      console.error('Failed to import CSV:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import trade data from CSV",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshotSubmit = async () => {
    if (screenshots.length === 0 || !targetPortfolioId) return;
    
    setIsLoading(true);
    try {
      const demoTrade: Trade = {
        id: uuidv4(),
        accountId: targetPortfolioId,
        symbol: 'EUR/USD',
        type: 'short',
        side: 'sell',
        amount: 1,
        quantity: 1,
        price: 1.1205,
        entryPrice: 1.1205,
        exitPrice: 1.1155,
        fee: 2.5,
        profit: 50,
        profitLoss: 50,
        status: 'closed',
        entryDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        entryTime: new Date(Date.now() - 43200000).toISOString(),
        exitDate: new Date().toISOString(),
        exitTime: new Date().toISOString(),
        riskReward: 1.5,
        riskRewardRatio: 1.5,
        strategy: 'Range Trading',
        tags: ['Forex', 'Short-term'],
        notes: 'Reversal at resistance level',
        exitReason: 'Support level reached',
        takeProfit: 1.1155,
        stopLoss: 1.1255,
        confidence: 0.7,
        confidenceRating: 0.7,
        emotion: 'calm',
        mood: 'neutral'
      };

      await localDatabase.bulkInsertTrades([demoTrade]);
      
      toast({
        title: "Screenshot Processed",
        description: "Trade data has been extracted and imported"
      });
      
      onOpenChange(false);
      setScreenshots([]);
    } catch (error) {
      console.error('Failed to process screenshots:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to extract trade data from screenshots",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!targetPortfolioId || !manualTradeData.symbol || !manualTradeData.amount || !manualTradeData.price) return;
    
    setIsLoading(true);
    try {
      const trade: Trade = {
        id: uuidv4(),
        accountId: targetPortfolioId,
        symbol: manualTradeData.symbol,
        type: manualTradeData.side === 'buy' ? 'long' : 'short',
        side: manualTradeData.side,
        amount: parseFloat(manualTradeData.amount),
        quantity: parseFloat(manualTradeData.amount),
        price: parseFloat(manualTradeData.price),
        entryPrice: parseFloat(manualTradeData.price),
        exitPrice: undefined,
        fee: manualTradeData.fee ? parseFloat(manualTradeData.fee) : 0,
        profit: manualTradeData.profit ? parseFloat(manualTradeData.profit) : 0,
        profitLoss: manualTradeData.profit ? parseFloat(manualTradeData.profit) : 0,
        status: manualTradeData.status,
        entryDate: manualTradeData.entryDate || new Date().toISOString(),
        entryTime: manualTradeData.entryDate || new Date().toISOString(),
        exitDate: manualTradeData.exitDate || undefined,
        exitTime: manualTradeData.exitDate || undefined,
        riskReward: undefined,
        riskRewardRatio: undefined,
        strategy: undefined,
        tags: [],
        notes: manualTradeData.notes || undefined,
        exitReason: undefined,
        takeProfit: undefined,
        stopLoss: undefined,
        confidence: undefined,
        confidenceRating: undefined,
        emotion: undefined,
        mood: undefined
      };

      await localDatabase.bulkInsertTrades([trade]);
      
      toast({
        title: "Trade Added",
        description: "Your trade has been successfully added to the journal"
      });
      
      onOpenChange(false);
      setManualTradeData({
        symbol: '',
        side: 'buy',
        amount: '',
        price: '',
        entryDate: '',
        exitDate: '',
        profit: '',
        fee: '',
        status: 'closed',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to add manual trade:', error);
      toast({
        title: "Failed to Add Trade",
        description: "An error occurred while adding your trade",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setScreenshots(prev => [...prev, ...filesArray]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Journal Entry</DialogTitle>
          <DialogDescription>
            Upload trade history or manually enter trade details
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
            <TabsTrigger value="screenshot">Screenshots</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4 pt-4">
            <div className="border-2 border-dashed border-gray-700/30 rounded-lg p-6 flex flex-col items-center justify-center">
              {csvFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <p className="text-sm font-medium">{csvFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(csvFile.size / 1024).toFixed(1)} KB
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCsvFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop a CSV file, or click to browse
                  </p>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setCsvFile(e.target.files[0])}
                  />
                  <Label htmlFor="csvFile" asChild>
                    <Button variant="secondary">Select CSV File</Button>
                  </Label>
                </>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="mb-1">CSV file should contain the following columns:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Symbol (e.g., EURUSD, BTCUSDT)</li>
                <li>Side (buy/sell)</li>
                <li>Amount/Size</li>
                <li>Entry Price</li>
                <li>Exit Price (optional)</li>
                <li>Entry Date/Time</li>
                <li>Exit Date/Time (optional)</li>
                <li>Profit/Loss (optional)</li>
                <li>Fees (optional)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCsvSubmit} 
                disabled={!csvFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : 'Import Trades'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="screenshot" className="space-y-4 pt-4">
            <div className="border-2 border-dashed border-gray-700/30 rounded-lg p-6 flex flex-col items-center justify-center">
              {screenshots.length > 0 ? (
                <div className="w-full">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {screenshots.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-24 bg-gray-800 rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== index))}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Input
                      id="screenshots"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleScreenshotsChange}
                    />
                    <Label htmlFor="screenshots" asChild>
                      <Button variant="outline" size="sm">
                        Add More Screenshots
                      </Button>
                    </Label>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload screenshots of your trading platform
                  </p>
                  <Input
                    id="screenshots"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleScreenshotsChange}
                  />
                  <Label htmlFor="screenshots" asChild>
                    <Button variant="secondary">Select Screenshots</Button>
                  </Label>
                </>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                We'll use OCR technology to extract trade data from your screenshots.
                For best results, ensure the trade details are clearly visible.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScreenshotSubmit} 
                disabled={screenshots.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : 'Process Screenshots'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., EURUSD, BTCUSDT"
                  value={manualTradeData.symbol}
                  onChange={e => setManualTradeData(prev => ({ ...prev, symbol: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="side">Side</Label>
                <select
                  id="side"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={manualTradeData.side}
                  onChange={e => setManualTradeData(prev => ({ ...prev, side: e.target.value as 'buy' | 'sell' }))}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount/Size</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 1.0"
                  value={manualTradeData.amount}
                  onChange={e => setManualTradeData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Entry Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 50000"
                  value={manualTradeData.price}
                  onChange={e => setManualTradeData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="entryDate">Entry Date/Time</Label>
                <Input
                  id="entryDate"
                  type="datetime-local"
                  value={manualTradeData.entryDate}
                  onChange={e => setManualTradeData(prev => ({ ...prev, entryDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exitDate">Exit Date/Time (optional)</Label>
                <Input
                  id="exitDate"
                  type="datetime-local"
                  value={manualTradeData.exitDate}
                  onChange={e => setManualTradeData(prev => ({ ...prev, exitDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profit">Profit/Loss (optional)</Label>
                <Input
                  id="profit"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 250.50"
                  value={manualTradeData.profit}
                  onChange={e => setManualTradeData(prev => ({ ...prev, profit: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fee">Fee (optional)</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2.50"
                  value={manualTradeData.fee}
                  onChange={e => setManualTradeData(prev => ({ ...prev, fee: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={manualTradeData.status}
                  onChange={e => setManualTradeData(prev => ({ ...prev, status: e.target.value as 'open' | 'closed' | 'cancelled' }))}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Add any notes about this trade..."
                  value={manualTradeData.notes}
                  onChange={e => setManualTradeData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleManualSubmit} 
                disabled={!manualTradeData.symbol || !manualTradeData.amount || !manualTradeData.price || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Add Trade'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 