import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Scan, 
  Check, 
  AlertCircle,
  FileText,
  Download,
  X,
  Loader2,
  Sparkles,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { Trade } from '@/lib/localStorage';
import Tesseract from 'tesseract.js';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface ExtractedTradeData {
  symbol?: string;
  entryPrice?: number;
  exitPrice?: number;
  quantity?: number;
  side?: 'buy' | 'sell';
  entryDate?: string;
  exitDate?: string;
  profitLoss?: number;
  broker?: string;
  accountNumber?: string;
  orderType?: string;
  commission?: number;
  swap?: number;
  stopLoss?: number;
  takeProfit?: number;
  date?: string;
  time?: string;
  orderId?: string;
  type?: 'buy' | 'sell';
  riskReward?: number;
  confidence: number;
}

interface OCRTradeCaptureProps {
  onTradeExtracted: (trade: Partial<Trade>) => void;
  onClose?: () => void;
}

export const OCRTradeCapture: React.FC<OCRTradeCaptureProps> = ({ 
  onTradeExtracted, 
  onClose 
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedTradeData | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedTradeData | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image file');
    }
  };

  const processImage = async () => {
    if (!imageFile || !imagePreview) return;

    setIsProcessing(true);
    setExtractedData(null);
    setExtractedText('');

    try {
      // Perform OCR using Tesseract.js
      const result = await Tesseract.recognize(
        imagePreview,
        'eng'
      );

      const text = result.data.text;
      setExtractedText(text);

      // Extract trade data from OCR text
      const extracted = extractTradeData(text);
      setExtractedData(extracted);
      setEditedData(extracted);
      setIsReviewing(true);

      if (extracted.confidence < 0.5) {
        toast.warning('Low confidence extraction. Please review and correct the data.');
      } else {
        toast.success('Trade data extracted successfully!');
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTradeData = (text: string): ExtractedTradeData => {
    const data: ExtractedTradeData = { confidence: 0 };
    let matchCount = 0;

    // Extract symbol
    const symbolRegex = /(?:Symbol|Ticker|Pair)[:\s]+([A-Z]{2,}[/-]?[A-Z]*)/i;
    const symbolMatch = text.match(symbolRegex);
    if (symbolMatch) {
      data.symbol = symbolMatch[1].toUpperCase();
      matchCount++;
    }

    // Extract trade type
    const typeRegex = /(?:Type|Side|Action)[:\s]+(BUY|SELL|LONG|SHORT)/i;
    const typeMatch = text.match(typeRegex);
    if (typeMatch) {
      data.type = typeMatch[1].toLowerCase() === 'sell' || typeMatch[1].toLowerCase() === 'short' ? 'sell' : 'buy';
      matchCount++;
    }

    // Extract quantity
    const quantityRegex = /(?:Quantity|Volume|Size|Units)[:\s]+(\d+(?:\.\d+)?)/i;
    const quantityMatch = text.match(quantityRegex);
    if (quantityMatch) {
      data.quantity = parseFloat(quantityMatch[1]);
      matchCount++;
    }

    // Extract prices (entry and exit if distinguishable)
    const entryPriceRegex = /(?:Entry Price|Entry)[:\s]+\$?(\d+(?:\.\d+)?)/i;
    const entryPriceMatch = text.match(entryPriceRegex);
    if (entryPriceMatch) {
      data.entryPrice = parseFloat(entryPriceMatch[1]);
      matchCount++;
    }

    const exitPriceRegex = /(?:Exit Price|Close)[:\s]+\$?(\d+(?:\.\d+)?)/i;
    const exitPriceMatch = text.match(exitPriceRegex);
    if (exitPriceMatch) {
      data.exitPrice = parseFloat(exitPriceMatch[1]);
      matchCount++;
    }

    // Extract stop loss
    const stopLossRegex = /(?:Stop Loss|SL)[:\s]+\$?(\d+(?:\.\d+)?)/i;
    const stopLossMatch = text.match(stopLossRegex);
    if (stopLossMatch) {
      data.stopLoss = parseFloat(stopLossMatch[1]);
      matchCount++;
    }

    // Extract take profit
    const takeProfitRegex = /(?:Take Profit|TP|Target)[:\s]+\$?(\d+(?:\.\d+)?)/i;
    const takeProfitMatch = text.match(takeProfitRegex);
    if (takeProfitMatch) {
      data.takeProfit = parseFloat(takeProfitMatch[1]);
      matchCount++;
    }

    // Extract date
    const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      data.date = dateMatch[1];
      matchCount++;
    }

    // Extract time (optional, from a common format like HH:MM)
    const timeRegex = /(\d{1,2}:\d{2})/; // Basic HH:MM format
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
      data.time = timeMatch[1];
      matchCount++;
    }

    // Extract order ID
    const orderIdRegex = /(?:Order ID|Order #|ID)[:\s]+([A-Z0-9-]+)/i;
    const orderIdMatch = text.match(orderIdRegex);
    if (orderIdMatch) {
      data.orderId = orderIdMatch[1];
      matchCount++;
    }

    // Calculate confidence based on matches found relative to potential fields
    // Adjusted to 10 potential fields (symbol, type, quantity, entryPrice, exitPrice, SL, TP, date, time, orderId)
    data.confidence = matchCount / 10; 

    return data;
  };

  const handleConfirmExtraction = () => {
    if (!editedData) return;

    const trade: Partial<Trade> = {
      id: uuidv4(),
      symbol: editedData.symbol || 'UNKNOWN',
      amount: editedData.quantity || 1,
      side: editedData.type === 'sell' ? 'sell' : 'buy',
      price: editedData.entryPrice || 0,
      fee: editedData.commission || 0,
      profit: editedData.profitLoss,
      status: editedData.exitPrice ? 'closed' : 'open',
      entryDate: editedData.date ? new Date(editedData.date).toISOString() : new Date().toISOString(),
      exitDate: editedData.time ? new Date(`${editedData.date}T${editedData.time}`).toISOString() : new Date().toISOString(),
      riskReward: editedData.riskReward,
      notes: `Imported via OCR from ${imageFile?.name}`,
      confidenceRating: editedData.confidence,
    };

    onTradeExtracted(trade);
    toast.success('Trade data confirmed and ready to save!');
    
    // Reset state
    setImageFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setEditedData(null);
    setIsReviewing(false);
    setExtractedText('');
  };

  const updateEditedData = (field: keyof ExtractedTradeData, value: any) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  return (
    <Card className="holo-card max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          OCR Trade Capture
        </CardTitle>
        <CardDescription>
          Upload a screenshot of your trade to automatically extract trade details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!imagePreview && !isProcessing && (
          <div
            className={cn(
              "border-2 border-dashed border-slate-600 rounded-lg p-8",
              "hover:border-blue-500 transition-colors cursor-pointer",
              "flex flex-col items-center justify-center min-h-[300px]"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium mb-2">Drop your trade screenshot here</p>
            <p className="text-sm text-slate-400 mb-4">or click to browse</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">PNG</Badge>
              <Badge variant="secondary">JPG</Badge>
              <Badge variant="secondary">JPEG</Badge>
              <Badge variant="secondary">GIF</Badge>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {imagePreview && !isReviewing && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-slate-800">
              <img 
                src={imagePreview} 
                alt="Trade screenshot" 
                className="w-full h-auto max-h-[400px] object-contain"
              />
              {!isProcessing && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={processImage} 
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract Trade Data
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isReviewing && editedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Review Extracted Data</h3>
              <Badge variant={editedData.confidence > 0.7 ? "default" : "secondary"}>
                {Math.round(editedData.confidence * 100)}% Confidence
              </Badge>
            </div>

            {editedData.confidence < 0.7 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-500">Low confidence extraction</p>
                  <p className="text-slate-400">Please carefully review and correct the extracted data below.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={editedData.symbol || ''}
                  onChange={(e) => updateEditedData('symbol', e.target.value)}
                  placeholder="e.g., EUR/USD"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={editedData.type || 'buy'} 
                  onValueChange={(value) => updateEditedData('type', value as 'buy' | 'sell')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={editedData.quantity || ''}
                  onChange={(e) => updateEditedData('quantity', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.00001"
                  value={editedData.entryPrice || ''}
                  onChange={(e) => updateEditedData('entryPrice', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="exitPrice">Exit Price</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.00001"
                  value={editedData.exitPrice || ''}
                  onChange={(e) => updateEditedData('exitPrice', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.00001"
                  value={editedData.stopLoss || ''}
                  onChange={(e) => updateEditedData('stopLoss', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="takeProfit">Take Profit</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.00001"
                  value={editedData.takeProfit || ''}
                  onChange={(e) => updateEditedData('takeProfit', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editedData.date || ''}
                  onChange={(e) => updateEditedData('date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={editedData.time || ''}
                  onChange={(e) => updateEditedData('time', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={editedData.orderId || ''}
                  onChange={(e) => updateEditedData('orderId', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleConfirmExtraction} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Confirm & Add Trade
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewing(false);
                  setEditedData(null);
                  setExtractedData(null);
                }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>

            {extractedText && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
                  Show extracted text
                </summary>
                <div className="mt-2 p-3 bg-slate-800 rounded-lg">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap">{extractedText}</pre>
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 