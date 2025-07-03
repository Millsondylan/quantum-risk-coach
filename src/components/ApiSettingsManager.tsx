import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  CloudOff, 
  Plug,
  Database,
  Newspaper,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { AIStreamService } from '@/lib/aiStreamService';
import { realDataService } from '@/lib/realDataService';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ApiConfig {
  openaiApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  newsApiKey?: string;
  marketDataApiKey?: string;
  yfinanceApiKey?: string;
  coingeckoApiKey?: string;
  alphavantageApiKey?: string;
  polygonApiKey?: string;
  exchangeRateApiKey?: string;
  fixerApiKey?: string;
  fmpApiKey?: string;
  etherscanApiKey?: string;
  finnhubApiKey?: string;
}

interface ConnectionStatus {
  openai: boolean;
  groq: boolean;
  gemini: boolean;
  news: boolean;
  yfinance: boolean;
  coingecko: boolean;
  alphavantage: boolean;
  polygon: boolean;
  exchangeRate: boolean;
  fixer: boolean;
  fmp: boolean;
  etherscan: boolean;
  finnhub: boolean;
}

interface ApiSettingsManagerProps {
  handlePreferenceUpdate: (key: string, value: any) => Promise<void>;
}

export const ApiSettingsManager: React.FC<ApiSettingsManagerProps> = ({ handlePreferenceUpdate }) => {
  const { user, updatePreferences } = useUser();
  const [apiKeys, setApiKeys] = useState<ApiConfig>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    openai: false,
    groq: false,
    gemini: false,
    news: false,
    yfinance: false,
    coingecko: false,
    alphavantage: false,
    polygon: false,
    exchangeRate: false,
    fixer: false,
    fmp: false,
    etherscan: false,
    finnhub: false,
  });
  const [loading, setLoading] = useState(false);

  const aiService = useMemo(() => new AIStreamService({}), []);

  useEffect(() => {
    if (user?.preferences?.apiKeys) {
      setApiKeys(user.preferences.apiKeys);
    }
  }, [user]);

  useEffect(() => {
    // Initialize API service with user's stored keys
    const initApiServices = async () => {
      const initialStatus = await aiService.healthCheck();
      setConnectionStatus(prev => ({ ...prev, ...initialStatus }));
    };
    initApiServices();
  }, [apiKeys]); // Re-run when apiKeys change

  const handleApiKeyChange = (key: keyof ApiConfig, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveKeys = async () => {
    if (!user) return;
    try {
      await updatePreferences({ apiKeys });
      toast.success('API keys saved!');
      // Trigger re-check of status after saving
      handleTestAllConnections();
    } catch (error) {
      console.error('Failed to save API keys:', error);
      toast.error('Failed to save API keys.');
    }
  };

  const handleTestConnection = async (apiName: keyof ConnectionStatus) => {
    setLoading(true);
    try {
      let success = false;
      let message = '';

      if (apiName === 'openai' || apiName === 'groq' || apiName === 'gemini') {
        const result = await aiService.testProvider(apiName);
        success = result.success;
        message = result.message;
      } else if (apiName === 'news') {
        const testResult = await realDataService.testNewsApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'yfinance') {
        const testResult = await realDataService.testYFinanceApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'coingecko') {
        const testResult = await realDataService.testCoinGeckoApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'alphavantage') {
        const testResult = await realDataService.testAlphaVantageApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'polygon') {
        const testResult = await realDataService.testPolygonApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'exchangeRate') {
        const testResult = await realDataService.testExchangeRateApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'fixer') {
        const testResult = await realDataService.testFixerApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'fmp') {
        const testResult = await realDataService.testFmpApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'etherscan') {
        const testResult = await realDataService.testEtherscanApi();
        success = testResult.success;
        message = testResult.message;
      } else if (apiName === 'finnhub') {
        const testResult = await realDataService.testFinnhubApi();
        success = testResult.success;
        message = testResult.message;
      } else {
        // Fallback for any unhandled marketData keys, though all should be explicit now
        success = false;
        message = "Unknown API type or test not implemented.";
      }

      setConnectionStatus(prev => ({ ...prev, [apiName]: success }));
      if (success) {
        toast.success(`${apiName.toUpperCase()} connected successfully!`);
      } else {
        toast.error(`${apiName.toUpperCase()} connection failed: ${message}`);
      }
    } catch (error) {
      console.error(`Error testing ${apiName} connection:`, error);
      setConnectionStatus(prev => ({ ...prev, [apiName]: false }));
      toast.error(`Error testing ${apiName} connection.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAllConnections = async () => {
    setLoading(true);
    const results: Partial<ConnectionStatus> = {};
    try {
      const aiResults = await aiService.healthCheck();
      results.openai = aiResults.openai;
      results.groq = aiResults.groq;
      results.gemini = aiResults.gemini;

      // Test all new market data APIs individually
      results.news = (await realDataService.testNewsApi())?.success || false;
      results.yfinance = (await realDataService.testYFinanceApi())?.success || false;
      results.coingecko = (await realDataService.testCoinGeckoApi())?.success || false;
      results.alphavantage = (await realDataService.testAlphaVantageApi())?.success || false;
      results.polygon = (await realDataService.testPolygonApi())?.success || false;
      results.exchangeRate = (await realDataService.testExchangeRateApi())?.success || false;
      results.fixer = (await realDataService.testFixerApi())?.success || false;
      results.fmp = (await realDataService.testFmpApi())?.success || false;
      results.etherscan = (await realDataService.testEtherscanApi())?.success || false;
      results.finnhub = (await realDataService.testFinnhubApi())?.success || false;

      setConnectionStatus(results as ConnectionStatus);
      toast.success('All connections tested!');
    } catch (error) {
      console.error('Error testing all connections:', error);
      toast.error('Failed to test all connections.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="holo-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>Manage your API keys and check service connections.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Inputs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">API Keys</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openai-api-key">OpenAI API Key</Label>
              <Input 
                id="openai-api-key" 
                type="password" 
                value={apiKeys.openaiApiKey || ''} 
                onChange={e => handleApiKeyChange('openaiApiKey', e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="groq-api-key">Groq API Key</Label>
              <Input 
                id="groq-api-key" 
                type="password" 
                value={apiKeys.groqApiKey || ''} 
                onChange={e => handleApiKeyChange('groqApiKey', e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="gemini-api-key">Google Gemini API Key</Label>
              <Input 
                id="gemini-api-key" 
                type="password" 
                value={apiKeys.geminiApiKey || ''} 
                onChange={e => handleApiKeyChange('geminiApiKey', e.target.value)}
                placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="news-api-key">News API Key</Label>
              <Input 
                id="news-api-key" 
                type="password" 
                value={apiKeys.newsApiKey || ''} 
                onChange={e => handleApiKeyChange('newsApiKey', e.target.value)}
                placeholder="Your News API Key"
              />
            </div>
            <div>
              <Label htmlFor="market-data-api-key">Market Data API Key</Label>
              <Input 
                id="market-data-api-key" 
                type="password" 
                value={apiKeys.marketDataApiKey || ''} 
                onChange={e => handleApiKeyChange('marketDataApiKey', e.target.value)}
                placeholder="Your Market Data API Key"
              />
            </div>
            <div>
              <Label htmlFor="yfinance-api-key">YFinance API Key</Label>
              <Input 
                id="yfinance-api-key" 
                type="password" 
                value={apiKeys.yfinanceApiKey || ''} 
                onChange={e => handleApiKeyChange('yfinanceApiKey', e.target.value)}
                placeholder="Your YFinance API Key"
              />
            </div>
            <div>
              <Label htmlFor="coingecko-api-key">CoinGecko API Key</Label>
              <Input 
                id="coingecko-api-key" 
                type="password" 
                value={apiKeys.coingeckoApiKey || ''} 
                onChange={e => handleApiKeyChange('coingeckoApiKey', e.target.value)}
                placeholder="Your CoinGecko API Key"
              />
            </div>
            <div>
              <Label htmlFor="alphavantage-api-key">Alpha Vantage API Key</Label>
              <Input 
                id="alphavantage-api-key" 
                type="password" 
                value={apiKeys.alphavantageApiKey || ''} 
                onChange={e => handleApiKeyChange('alphavantageApiKey', e.target.value)}
                placeholder="Your Alpha Vantage API Key"
              />
            </div>
            <div>
              <Label htmlFor="polygon-api-key">Polygon API Key</Label>
              <Input 
                id="polygon-api-key" 
                type="password" 
                value={apiKeys.polygonApiKey || ''} 
                onChange={e => handleApiKeyChange('polygonApiKey', e.target.value)}
                placeholder="Your Polygon API Key"
              />
            </div>
            <div>
              <Label htmlFor="exchange-rate-api-key">ExchangeRate API Key</Label>
              <Input 
                id="exchange-rate-api-key" 
                type="password" 
                value={apiKeys.exchangeRateApiKey || ''} 
                onChange={e => handleApiKeyChange('exchangeRateApiKey', e.target.value)}
                placeholder="Your ExchangeRate API Key"
              />
            </div>
            <div>
              <Label htmlFor="fixer-api-key">Fixer API Key</Label>
              <Input 
                id="fixer-api-key" 
                type="password" 
                value={apiKeys.fixerApiKey || ''} 
                onChange={e => handleApiKeyChange('fixerApiKey', e.target.value)}
                placeholder="Your Fixer API Key"
              />
            </div>
            <div>
              <Label htmlFor="fmp-api-key">FMP API Key</Label>
              <Input 
                id="fmp-api-key" 
                type="password" 
                value={apiKeys.fmpApiKey || ''} 
                onChange={e => handleApiKeyChange('fmpApiKey', e.target.value)}
                placeholder="Your FMP API Key"
              />
            </div>
            <div>
              <Label htmlFor="etherscan-api-key">Etherscan API Key</Label>
              <Input 
                id="etherscan-api-key" 
                type="password" 
                value={apiKeys.etherscanApiKey || ''} 
                onChange={e => handleApiKeyChange('etherscanApiKey', e.target.value)}
                placeholder="Your Etherscan API Key"
              />
            </div>
            <div>
              <Label htmlFor="finnhub-api-key">Finnhub API Key</Label>
              <Input 
                id="finnhub-api-key" 
                type="password" 
                value={apiKeys.finnhubApiKey || ''} 
                onChange={e => handleApiKeyChange('finnhubApiKey', e.target.value)}
                placeholder="Your Finnhub API Key"
              />
            </div>
          </div>
          <Button onClick={handleSaveKeys} className="w-full" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save API Keys
          </Button>
        </div>

        <Separator />

        {/* Connection Statuses */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Service Connection Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(connectionStatus).map(([apiName, isConnected]) => (
              <div key={apiName} className="p-3 border rounded-lg flex items-center justify-between">
                <span className="font-medium text-white">{apiName.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    isConnected ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"
                  )}
                >
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </Badge>
              </div>
            ))}
          </div>
          <Button onClick={handleTestAllConnections} className="w-full" disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Test All Connections
          </Button>
        </div>

        <Separator />

        {/* Toggle for Advanced Features (Placeholder) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Feature Toggles</h3>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="advanced-analytics-toggle">Advanced Analytics</Label>
              <p className="text-sm text-muted-foreground">Enable detailed charts and risk metrics.</p>
            </div>
            <Switch 
              id="advanced-analytics-toggle" 
              checked={user?.preferences?.enableAdvancedAnalytics || false}
              onCheckedChange={(checked) => handlePreferenceUpdate('enableAdvancedAnalytics', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="ai-coaching-toggle">AI Coaching & Simulation</Label>
              <p className="text-sm text-muted-foreground">Enable AI assistant for personalized insights and what-if scenarios.</p>
            </div>
            <Switch 
              id="ai-coaching-toggle" 
              checked={user?.preferences?.aiCoaching || false}
              onCheckedChange={(checked) => handlePreferenceUpdate('aiCoaching', checked)}
            />
          </div>
          <Button onClick={handleSaveKeys} className="w-full" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Feature Toggles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 