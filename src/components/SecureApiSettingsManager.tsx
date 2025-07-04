import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Key, 
  Save, 
  TestTube, 
  Trash2, 
  Download, 
  Upload, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Shield,
  Lock,
  Unlock,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  apiKeyManager, 
  ApiKeyConfig, 
  ApiConnectionStatus, 
  ApiKeyMetadata,
  validateApiKey,
  clearSensitiveData
} from '@/lib/secureStorage';
import { buttonActions, useButtonState } from '@/lib/buttonValidation';

interface SecureApiSettingsManagerProps {
  onApiKeysUpdate?: (keys: ApiKeyConfig) => void;
  showAdvanced?: boolean;
  allowExport?: boolean;
  allowImport?: boolean;
  allowClear?: boolean;
}

export const SecureApiSettingsManager: React.FC<SecureApiSettingsManagerProps> = ({
  onApiKeysUpdate,
  showAdvanced = true,
  allowExport = true,
  allowImport = true,
  allowClear = true
}) => {
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig>({});
  const [connectionStatus, setConnectionStatus] = useState<ApiConnectionStatus>({});
  const [metadata, setMetadata] = useState<Record<string, ApiKeyMetadata>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [testingConnections, setTestingConnections] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Button states
  const saveButtonState = useButtonState('save-api-keys');
  const testButtonState = useButtonState('test-connections');
  const exportButtonState = useButtonState('export-api-keys');
  const importButtonState = useButtonState('import-api-keys');
  const clearButtonState = useButtonState('clear-api-keys');

  // Load API keys on component mount
  useEffect(() => {
    loadApiKeys();
    loadMetadata();
  }, []);

  // Load API keys from secure storage
  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const keys = await apiKeyManager.getAllApiKeys();
      setApiKeys(keys);
      
      // Update connection status for existing keys
      const status: ApiConnectionStatus = {};
      for (const [provider, key] of Object.entries(keys)) {
        if (key) {
          status[provider] = null; // Set to loading initially
        }
      }
      setConnectionStatus(status);
      
      onApiKeysUpdate?.(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, [onApiKeysUpdate]);

  // Load API key metadata
  const loadMetadata = useCallback(async () => {
    try {
      const meta = await apiKeyManager.getApiKeyMetadata();
      setMetadata(meta);
    } catch (error) {
      console.error('Failed to load API key metadata:', error);
    }
  }, []);

  // Handle API key change
  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
    
    // Validate format in real-time
    if (value && !validateApiKey(value, provider)) {
      toast.warning(`Invalid ${provider} API key format`);
    }
  };

  // Save API keys
  const handleSaveKeys = async () => {
    try {
      const providers = Object.keys(apiKeys);
      let savedCount = 0;

      for (const provider of providers) {
        const key = apiKeys[provider as keyof ApiKeyConfig];
        if (key) {
          await apiKeyManager.saveApiKey(provider, key);
          savedCount++;
        }
      }

      if (savedCount > 0) {
        toast.success(`${savedCount} API key(s) saved securely`);
        await loadMetadata(); // Refresh metadata
        onApiKeysUpdate?.(apiKeys);
      }
    } catch (error) {
      console.error('Failed to save API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  // Test all connections
  const handleTestAllConnections = async () => {
    try {
      setTestingConnections(true);
      const status = await apiKeyManager.testAllConnections();
      setConnectionStatus(status);
      
      const connectedCount = Object.values(status).filter(s => s === true).length;
      const totalCount = Object.keys(status).length;
      
      if (connectedCount > 0) {
        toast.success(`${connectedCount}/${totalCount} API connections successful`);
      } else {
        toast.error('No API connections successful');
      }
    } catch (error) {
      console.error('Failed to test connections:', error);
      toast.error('Failed to test connections');
    } finally {
      setTestingConnections(false);
    }
  };

  // Test single connection
  const handleTestConnection = async (provider: string) => {
    try {
      setSelectedProvider(provider);
      const isConnected = await apiKeyManager.testConnection(provider);
      setConnectionStatus(prev => ({ ...prev, [provider]: isConnected }));
      
      if (isConnected) {
        toast.success(`${provider} connection successful`);
      } else {
        toast.error(`${provider} connection failed`);
      }
    } catch (error) {
      console.error(`Failed to test ${provider} connection:`, error);
      toast.error(`Failed to test ${provider} connection`);
    } finally {
      setSelectedProvider(null);
    }
  };

  // Remove API key
  const handleRemoveKey = async (provider: string) => {
    try {
      await apiKeyManager.removeApiKey(provider);
      setApiKeys(prev => {
        const newKeys = { ...prev };
        delete newKeys[provider as keyof ApiKeyConfig];
        return newKeys;
      });
      setConnectionStatus(prev => ({ ...prev, [provider]: false }));
      onApiKeysUpdate?.(apiKeys);
    } catch (error) {
      console.error(`Failed to remove ${provider} API key:`, error);
      toast.error(`Failed to remove ${provider} API key`);
    }
  };

  // Export API keys
  const handleExportKeys = async () => {
    try {
      const exportData = await apiKeyManager.exportApiKeys();
      
      // Create download link
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-keys-backup-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('API keys exported successfully');
    } catch (error) {
      console.error('Failed to export API keys:', error);
      toast.error('Failed to export API keys');
    }
  };

  // Import API keys
  const handleImportKeys = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      await apiKeyManager.importApiKeys(content);
      await loadApiKeys();
      await loadMetadata();
      toast.success('API keys imported successfully');
    } catch (error) {
      console.error('Failed to import API keys:', error);
      toast.error('Failed to import API keys: Invalid format');
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Clear all API keys
  const handleClearAllKeys = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all API keys? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      await apiKeyManager.clearAllApiKeys();
      setApiKeys({});
      setConnectionStatus({});
      setMetadata({});
      onApiKeysUpdate?.({});
      toast.success('All API keys cleared');
    } catch (error) {
      console.error('Failed to clear API keys:', error);
      toast.error('Failed to clear API keys');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (provider: string) => {
    setShowPasswords(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  // Copy API key to clipboard
  const copyToClipboard = async (provider: string) => {
    const key = apiKeys[provider as keyof ApiKeyConfig];
    if (key) {
      try {
        await navigator.clipboard.writeText(key);
        toast.success(`${provider} API key copied to clipboard`);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error('Failed to copy API key');
      }
    }
  };

  // Get connection status icon
  const getConnectionStatusIcon = (status: boolean | null, provider: string) => {
    if (selectedProvider === provider) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (status === null) {
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
    
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  // Get connection status text
  const getConnectionStatusText = (status: boolean | null, provider: string) => {
    if (selectedProvider === provider) {
      return 'Testing...';
    }
    
    if (status === null) {
      return 'Not tested';
    }
    
    return status ? 'Connected' : 'Failed';
  };

  // API providers configuration
  const apiProviders = [
    { key: 'openai', name: 'OpenAI', placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', pattern: /^sk-[a-zA-Z0-9]{32,}$/ },
    { key: 'groq', name: 'Groq', placeholder: 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', pattern: /^gsk_[a-zA-Z0-9]{32,}$/ },
    { key: 'gemini', name: 'Google Gemini', placeholder: 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx', pattern: /^AIza[a-zA-Z0-9_-]{35}$/ },
    { key: 'news', name: 'News API', placeholder: 'Your News API Key', pattern: /^[a-zA-Z0-9]{32}$/ },
    { key: 'yfinance', name: 'Yahoo Finance', placeholder: 'Your YFinance API Key', pattern: /^[a-zA-Z0-9]{32,}$/ },
    { key: 'coingecko', name: 'CoinGecko', placeholder: 'CG-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', pattern: /^CG-[a-zA-Z0-9]{32,}$/ },
    { key: 'alphavantage', name: 'Alpha Vantage', placeholder: 'Your Alpha Vantage API Key', pattern: /^[a-zA-Z0-9]{16}$/ },
    { key: 'polygon', name: 'Polygon.io', placeholder: 'Your Polygon API Key', pattern: /^[a-zA-Z0-9]{32,}$/ },
    { key: 'exchangeRate', name: 'ExchangeRate API', placeholder: 'Your ExchangeRate API Key', pattern: /^[a-zA-Z0-9]{32,}$/ },
    { key: 'fixer', name: 'Fixer.io', placeholder: 'Your Fixer API Key', pattern: /^[a-zA-Z0-9]{32}$/ },
    { key: 'fmp', name: 'Financial Modeling Prep', placeholder: 'Your FMP API Key', pattern: /^[a-zA-Z0-9]{32,}$/ },
    { key: 'etherscan', name: 'Etherscan', placeholder: 'Your Etherscan API Key', pattern: /^[a-zA-Z0-9]{34}$/ },
    { key: 'finnhub', name: 'Finnhub', placeholder: 'Your Finnhub API Key', pattern: /^[a-zA-Z0-9]{32,}$/ }
  ];

  return (
    <Card className="holo-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Secure API Key Management
        </CardTitle>
        <CardDescription>
          Manage your API keys securely with encrypted storage and connection testing.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Security Status */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            All API keys are encrypted with AES-256 and stored securely on your device.
          </AlertDescription>
        </Alert>

        {/* API Key Inputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">API Keys</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswords({})}
                className="text-xs"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hide All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allVisible = apiProviders.reduce((acc, provider) => {
                    acc[provider.key] = true;
                    return acc;
                  }, {} as Record<string, boolean>);
                  setShowPasswords(allVisible);
                }}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Show All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiProviders.map((provider) => {
              const key = apiKeys[`${provider.key}ApiKey` as keyof ApiKeyConfig];
              const status = connectionStatus[provider.key];
              const isVisible = showPasswords[provider.key];
              const meta = metadata[provider.key];

              return (
                <div key={provider.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${provider.key}-api-key`} className="text-white">
                      {provider.name}
                    </Label>
                    <div className="flex items-center gap-1">
                      {getConnectionStatusIcon(status, provider.key)}
                      <span className="text-xs text-gray-400">
                        {getConnectionStatusText(status, provider.key)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Input
                      id={`${provider.key}-api-key`}
                      type={isVisible ? 'text' : 'password'}
                      value={key || ''}
                      onChange={(e) => handleApiKeyChange(`${provider.key}ApiKey`, e.target.value)}
                      placeholder={provider.placeholder}
                      className={`pr-20 ${key && !provider.pattern.test(key) ? 'border-red-500' : ''}`}
                    />
                    
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      {key && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${provider.key}ApiKey`)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(provider.key)}
                        className="h-6 w-6 p-0"
                      >
                        {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      
                      {key && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestConnection(provider.key)}
                          disabled={selectedProvider === provider.key}
                          className="h-6 w-6 p-0"
                        >
                          <TestTube className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {key && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveKey(provider.key)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  {meta && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Badge variant="outline" className="text-xs">
                        Used {meta.usageCount} times
                      </Badge>
                      {meta.lastTested && (
                        <Badge variant="outline" className="text-xs">
                          Tested {new Date(meta.lastTested).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSaveKeys}
              disabled={saveButtonState.isDisabled() || loading}
              className="flex items-center gap-2"
            >
              {saveButtonState.isActive() ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save All Keys
            </Button>

            <Button
              variant="outline"
              onClick={handleTestAllConnections}
              disabled={testButtonState.isDisabled() || testingConnections}
              className="flex items-center gap-2"
            >
              {testButtonState.isActive() ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Test All Connections
            </Button>

            {allowExport && (
              <Button
                variant="outline"
                onClick={handleExportKeys}
                disabled={exportButtonState.isDisabled()}
                className="flex items-center gap-2"
              >
                {exportButtonState.isActive() ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export Keys
              </Button>
            )}

            {allowImport && (
              <div className="relative">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleImportKeys}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={importButtonState.isDisabled()}
                />
                <Button
                  variant="outline"
                  disabled={importButtonState.isDisabled()}
                  className="flex items-center gap-2"
                >
                  {importButtonState.isActive() ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Import Keys
                </Button>
              </div>
            )}

            {allowClear && (
              <Button
                variant="destructive"
                onClick={handleClearAllKeys}
                disabled={clearButtonState.isDisabled()}
                className="flex items-center gap-2"
              >
                {clearButtonState.isActive() ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Clear All
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Connection Status Summary */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Connection Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {apiProviders.map((provider) => {
              const status = connectionStatus[provider.key];
              const key = apiKeys[`${provider.key}ApiKey` as keyof ApiKeyConfig];
              
              if (!key) return null;

              return (
                <div
                  key={provider.key}
                  className={`p-2 rounded border ${
                    status === true ? 'border-green-500 bg-green-500/10' :
                    status === false ? 'border-red-500 bg-red-500/10' :
                    'border-gray-500 bg-gray-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getConnectionStatusIcon(status, provider.key)}
                    <span className="text-sm font-medium">{provider.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Indicators */}
        {(saveButtonState.isActive() || testButtonState.isActive() || 
          exportButtonState.isActive() || importButtonState.isActive()) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(saveButtonState.getProgress() || testButtonState.getProgress() || 
                exportButtonState.getProgress() || importButtonState.getProgress())}%</span>
            </div>
            <Progress 
              value={saveButtonState.getProgress() || testButtonState.getProgress() || 
                exportButtonState.getProgress() || importButtonState.getProgress()} 
              className="h-2" 
            />
          </div>
        )}

        {/* Error Display */}
        {(saveButtonState.getError() || testButtonState.getError() || 
          exportButtonState.getError() || importButtonState.getError()) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {saveButtonState.getError() || testButtonState.getError() || 
                exportButtonState.getError() || importButtonState.getError()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 