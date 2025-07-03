import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle,
  X,
  Loader2,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Trade } from '@/lib/localStorage';
import { localDatabase } from '@/lib/localStorage';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface CSVRow {
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  entryDate: string;
  exitDate?: string;
  profit?: number;
  fee?: number;
  notes?: string;
  stopLoss?: number;
  takeProfit?: number;
  orderId?: string;
}

interface CSVImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  errors: string[];
  duplicates: number;
}

interface CSVImportComponentProps {
  onImportComplete?: (result: CSVImportResult) => void;
  onClose?: () => void;
  portfolioId?: string;
}

export const CSVImportComponent: React.FC<CSVImportComponentProps> = ({
  onImportComplete,
  onClose,
  portfolioId
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);
    setValidationErrors([]);
    setParsedData([]);

    try {
      const text = await file.text();
      const result = await parseCSV(text);
      
      if (result.success) {
        setHeaders(result.headers);
        setParsedData(result.data);
        setColumnMapping(result.columnMapping);
        setShowPreview(true);
        toast.success(`Successfully parsed ${result.data.length} trades`);
      } else {
        setValidationErrors(result.errors);
        toast.error('CSV parsing failed. Please check the file format.');
      }
    } catch (error) {
      console.error('CSV parsing error:', error);
      toast.error('Failed to read CSV file');
      setValidationErrors(['Failed to read CSV file. Please check the file format.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = async (csvText: string): Promise<{
    success: boolean;
    data: CSVRow[];
    headers: string[];
    columnMapping: Record<string, string>;
    errors: string[];
  }> => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return {
        success: false,
        data: [],
        headers: [],
        columnMapping: {},
        errors: ['CSV file must have at least a header row and one data row']
      };
    }

    const headerRow = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = lines.slice(1);
    const errors: string[] = [];
    const data: CSVRow[] = [];

    // Auto-map columns
    const columnMapping: Record<string, string> = {};
    const expectedColumns = [
      'symbol', 'type', 'entry price', 'exit price', 'size', 'entry date', 'exit date',
      'profit', 'fee', 'notes', 'stop loss', 'take profit', 'order id'
    ];

    expectedColumns.forEach(expected => {
      const found = headerRow.find(h => h.includes(expected) || expected.includes(h));
      if (found) {
        columnMapping[expected] = found;
      }
    });

    // Validate required columns
    const requiredColumns = ['symbol', 'type', 'entry price', 'size', 'entry date'];
    const missingColumns = requiredColumns.filter(col => !columnMapping[col]);
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Parse data rows
    dataRows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      if (values.length !== headerRow.length) {
        errors.push(`Row ${index + 2}: Column count mismatch`);
        return;
      }

      try {
        const rowData: any = {};
        headerRow.forEach((header, i) => {
          rowData[header] = values[i];
        });

        const csvRow: CSVRow = {
          symbol: rowData[columnMapping['symbol']] || '',
          type: (rowData[columnMapping['type']] || 'buy').toLowerCase() as 'buy' | 'sell',
          entryPrice: parseFloat(rowData[columnMapping['entry price']] || '0'),
          exitPrice: rowData[columnMapping['exit price']] ? parseFloat(rowData[columnMapping['exit price']]) : undefined,
          size: parseFloat(rowData[columnMapping['size']] || '0'),
          entryDate: rowData[columnMapping['entry date']] || '',
          exitDate: rowData[columnMapping['exit date']] || undefined,
          profit: rowData[columnMapping['profit']] ? parseFloat(rowData[columnMapping['profit']]) : undefined,
          fee: rowData[columnMapping['fee']] ? parseFloat(rowData[columnMapping['fee']]) : undefined,
          notes: rowData[columnMapping['notes']] || '',
          stopLoss: rowData[columnMapping['stop loss']] ? parseFloat(rowData[columnMapping['stop loss']]) : undefined,
          takeProfit: rowData[columnMapping['take profit']] ? parseFloat(rowData[columnMapping['take profit']]) : undefined,
          orderId: rowData[columnMapping['order id']] || undefined,
        };

        // Validate row data
        if (!csvRow.symbol) {
          errors.push(`Row ${index + 2}: Missing symbol`);
        }
        if (!['buy', 'sell'].includes(csvRow.type)) {
          errors.push(`Row ${index + 2}: Invalid type (must be 'buy' or 'sell')`);
        }
        if (isNaN(csvRow.entryPrice) || csvRow.entryPrice <= 0) {
          errors.push(`Row ${index + 2}: Invalid entry price`);
        }
        if (isNaN(csvRow.size) || csvRow.size <= 0) {
          errors.push(`Row ${index + 2}: Invalid size`);
        }
        if (!csvRow.entryDate) {
          errors.push(`Row ${index + 2}: Missing entry date`);
        }

        if (errors.length === 0) {
          data.push(csvRow);
        }
      } catch (error) {
        errors.push(`Row ${index + 2}: Data parsing error`);
      }
    });

    return {
      success: errors.length === 0,
      data,
      headers: headerRow,
      columnMapping,
      errors
    };
  };

  const handleImport = async () => {
    if (!parsedData.length || !portfolioId) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const trades: Trade[] = parsedData.map((row, index) => {
        const trade: Trade = {
          id: uuidv4(),
          accountId: portfolioId,
          symbol: row.symbol,
          type: row.type === 'buy' ? 'long' : 'short',
          side: row.type,
          amount: row.size,
          quantity: row.size,
          price: row.entryPrice,
          entryPrice: row.entryPrice,
          exitPrice: row.exitPrice,
          fee: row.fee || 0,
          profit: row.profit || 0,
          profitLoss: row.profit || 0,
          status: row.exitPrice ? 'closed' : 'open',
          entryDate: new Date(row.entryDate).toISOString(),
          entryTime: new Date(row.entryDate).toISOString(),
          exitDate: row.exitDate ? new Date(row.exitDate).toISOString() : undefined,
          exitTime: row.exitDate ? new Date(row.exitDate).toISOString() : undefined,
          riskReward: row.takeProfit && row.stopLoss ? 
            Math.abs((row.takeProfit - row.entryPrice) / (row.entryPrice - row.stopLoss)) : undefined,
          riskRewardRatio: row.takeProfit && row.stopLoss ? 
            Math.abs((row.takeProfit - row.entryPrice) / (row.entryPrice - row.stopLoss)) : undefined,
          strategy: 'CSV Import',
          tags: ['CSV Import'],
          notes: row.notes || `Imported from CSV`,
          exitReason: row.exitPrice ? 'CSV Import' : undefined,
          takeProfit: row.takeProfit,
          stopLoss: row.stopLoss,
          confidence: 1.0,
          confidenceRating: 1.0,
          emotion: 'neutral',
          mood: 'neutral'
        };

        // Update progress
        setImportProgress(Math.round(((index + 1) / parsedData.length) * 100));
        return trade;
      });

      // Check for duplicates
      const existingTrades = await localDatabase.getTrades(portfolioId);
      const duplicates = trades.filter(trade => 
        existingTrades.some(existing => 
          existing.symbol === trade.symbol &&
          existing.entryDate === trade.entryDate &&
          existing.entryPrice === trade.entryPrice
        )
      );

      if (duplicates.length > 0) {
        const confirmed = window.confirm(
          `Found ${duplicates.length} potential duplicate trades. Continue importing anyway?`
        );
        if (!confirmed) {
          setIsImporting(false);
          return;
        }
      }

      // Import trades
      await localDatabase.bulkInsertTrades(trades);

      const result: CSVImportResult = {
        success: true,
        importedCount: trades.length,
        errorCount: 0,
        errors: [],
        duplicates: duplicates.length
      };

      onImportComplete?.(result);
      toast.success(`Successfully imported ${trades.length} trades!`);
      
      // Reset state
      setCsvFile(null);
      setParsedData([]);
      setShowPreview(false);
      setValidationErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import trades');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `Symbol,Type,Entry Price,Exit Price,Size,Entry Date,Exit Date,Profit,Fee,Notes,Stop Loss,Take Profit,Order ID
EURUSD,buy,1.1000,1.1050,1.0,2024-01-01 10:00:00,2024-01-01 15:30:00,50.0,2.5,Test trade,1.0950,1.1100,12345
GBPUSD,sell,1.2500,1.2450,0.5,2024-01-02 14:30:00,2024-01-02 16:45:00,25.0,1.25,Another trade,1.2550,1.2400,12346
BTCUSD,buy,50000,52500,0.1,2024-01-03 09:00:00,2024-01-03 18:00:00,250.0,5.0,Crypto trade,48000,55000,12347`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-trades.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="holo-card max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          CSV Trade Import
        </CardTitle>
        <CardDescription>
          Import multiple trades from a CSV file. Supports bulk import with validation and preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!csvFile && (
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed border-slate-600 rounded-lg p-8",
                "hover:border-blue-500 transition-colors cursor-pointer",
                "flex flex-col items-center justify-center min-h-[200px]"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
              <p className="text-sm text-slate-400 mb-4">or click to browse</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge variant="secondary">CSV</Badge>
                <Badge variant="secondary">Max 10MB</Badge>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Info className="w-4 h-4" />
                <span>Need help with CSV format?</span>
              </div>
              <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                <Download className="w-4 h-4 mr-2" />
                Download Sample
              </Button>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="font-medium mb-2">Required CSV Format:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-400">Required Columns:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Symbol (e.g., EURUSD, BTCUSD)</li>
                    <li>Type (buy/sell)</li>
                    <li>Entry Price</li>
                    <li>Size/Amount</li>
                    <li>Entry Date</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-blue-400">Optional Columns:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Exit Price</li>
                    <li>Exit Date</li>
                    <li>Profit/Loss</li>
                    <li>Fee</li>
                    <li>Notes</li>
                    <li>Stop Loss</li>
                    <li>Take Profit</li>
                    <li>Order ID</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing CSV file...</span>
            </div>
            <Progress value={50} className="w-full" />
          </div>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">CSV validation errors:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li className="text-sm">... and {validationErrors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showPreview && parsedData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Preview ({parsedData.length} trades)</h3>
                <Badge variant="secondary">{parsedData.length} trades ready to import</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCsvFile(null);
                    setParsedData([]);
                    setShowPreview(false);
                    setValidationErrors([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {showPreview && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entry Price</TableHead>
                      <TableHead>Exit Price</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Entry Date</TableHead>
                      <TableHead>Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={row.type === 'buy' ? 'default' : 'secondary'}>
                            {row.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.entryPrice}</TableCell>
                        <TableCell>{row.exitPrice || '-'}</TableCell>
                        <TableCell>{row.size}</TableCell>
                        <TableCell>{new Date(row.entryDate).toLocaleDateString()}</TableCell>
                        <TableCell className={row.profit && row.profit > 0 ? 'text-green-500' : 'text-red-500'}>
                          {row.profit ? `$${row.profit.toFixed(2)}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {parsedData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-slate-400">
                          ... and {parsedData.length - 10} more trades
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !portfolioId}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing... {importProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {parsedData.length} Trades
                  </>
                )}
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>

            {isImporting && (
              <Progress value={importProgress} className="w-full" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 