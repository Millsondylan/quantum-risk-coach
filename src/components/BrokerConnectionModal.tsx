import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { realBrokerService } from '@/lib/realBrokerService';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrokerConnectionModalProps {
  open: boolean;
  broker: string | null;
  onOpenChange: (open: boolean) => void;
  portfolioId?: string;
}

export const BrokerConnectionModal: React.FC<BrokerConnectionModalProps> = ({ 
  open, 
  broker, 
  onOpenChange,
  portfolioId
}) => {
  const { toast } = useToast();
  const { addAccountToPortfolio, currentPortfolio } = usePortfolioContext();
  
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [server, setServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [sandbox, setSandbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accountBalance, setAccountBalance] = useState('');

  const targetPortfolioId = portfolioId || currentPortfolio?.id;

  const resetForm = () => {
    setApiKey('');
    setSecretKey('');
    setPassphrase('');
    setServer('');
    setLogin('');
    setPassword('');
    setSandbox(false);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const handleConnect = async () => {
    if (!broker || !targetPortfolioId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const connectionId = `${broker}_${Date.now()}`;
      const connectionResult = await realBrokerService.connectToBroker({
        id: connectionId,
        userId: 'current-user', // This should come from user context in a real implementation
        name: getBrokerDisplayName(broker),
        type: broker as any,
        status: 'connecting',
        credentials: {
          apiKey,
          secretKey,
          passphrase: broker === 'kucoin' ? passphrase : undefined,
          server: ['mt4', 'mt5'].includes(broker) ? server : undefined,
          login: ['mt4', 'mt5'].includes(broker) ? login : undefined,
          password: ['mt4', 'mt5'].includes(broker) ? password : undefined,
          sandbox
        },
        lastSync: new Date().toISOString(),
        settings: {
          autoSync: true,
          syncInterval: 5
        }
      });

      if (connectionResult.success) {
        // Add the account to the portfolio
        await addAccountToPortfolio({
          portfolioId: targetPortfolioId,
          name: `${getBrokerDisplayName(broker)} Account`,
          type: 'broker',
          broker,
          balance: connectionResult.accountInfo?.balance || parseFloat(accountBalance) || 0,
          currency: 'USD'
        });
        
        setSuccess(true);
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${getBrokerDisplayName(broker)}`
        });
        
        // Auto close after success
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 2000);
      } else {
        setError(connectionResult.message || 'Connection failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getBrokerDisplayName = (brokerCode: string): string => {
    const displayNames: Record<string, string> = {
      'binance': 'Binance',
      'bybit': 'Bybit',
      'kucoin': 'KuCoin',
      'okx': 'OKX',
      'mexc': 'MEXC',
      'mt4': 'MetaTrader 4',
      'mt5': 'MetaTrader 5',
      'ctrader': 'cTrader',
      'interactive': 'Interactive Brokers',
      'alpaca': 'Alpaca'
    };
    return displayNames[brokerCode] || brokerCode;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect {getBrokerDisplayName(broker || '')}</DialogTitle>
          <DialogDescription>
            Enter your API credentials to securely connect your account.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-500/20 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">Connection Successful</h3>
            <p className="text-center text-sm text-muted-foreground">
              Your {getBrokerDisplayName(broker || '')} account has been connected successfully.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-destructive/20 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="space-y-4 py-4">
              <Tabs defaultValue="credentials">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="credentials" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Enter your secret key"
                    />
                  </div>
                  
                  {broker === 'kucoin' && (
                    <div className="space-y-2">
                      <Label htmlFor="passphrase">Passphrase</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter your passphrase"
                      />
                    </div>
                  )}
                  
                  {(broker === 'mt4' || broker === 'mt5') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="server">Server</Label>
                        <Input
                          id="server"
                          value={server}
                          onChange={(e) => setServer(e.target.value)}
                          placeholder="Enter server address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login">Login ID</Label>
                        <Input
                          id="login"
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          placeholder="Enter login ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sandbox" 
                      checked={sandbox}
                      onCheckedChange={(checked) => setSandbox(!!checked)}
                    />
                    <Label htmlFor="sandbox" className="text-sm font-medium leading-none">
                      Use sandbox/testnet environment
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="balance">Initial Balance (Optional)</Label>
                    <Input
                      id="balance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      placeholder="Enter initial balance"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only used if the broker doesn't return your balance
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={loading || (!apiKey || !secretKey) || 
                  (broker === 'kucoin' && !passphrase) ||
                  ((broker === 'mt4' || broker === 'mt5') && (!server || !login || !password))}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : 'Connect'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 