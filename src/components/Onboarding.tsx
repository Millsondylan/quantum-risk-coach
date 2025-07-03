import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/Icons';

const Onboarding = () => {
  const { completeOnboarding, user, createUser } = useUser();
  const { createPortfolio, addAccountToPortfolio } = usePortfolioContext();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    tradingStyle: 'day-trading' as any,
    riskTolerance: 'moderate' as any,
    preferredMarkets: [] as string[],
    experienceLevel: 'beginner' as any,
    notifications: {
      priceAlerts: true,
      newsAlerts: true,
      aiInsights: true,
      tradeSignals: true,
      economicEvents: true,
      portfolioAlerts: true,
      riskWarnings: true,
      pushNotifications: true,
      telegram: false,
      soundEnabled: true,
      marketUpdates: true,
      tradeAlerts: true,
      marketSentiment: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      weekends: true,
      minimumImpact: 'medium',
      frequency: 'instant',
      personalizedSymbols: [],
      tradingStyle: 'day',
      riskTolerance: 'moderate',
      experience: 'intermediate'
    },
    theme: 'dark' as any,
    language: 'en',
  });
  const [username, setUsername] = useState('');
  const [portfolioName, setPortfolioName] = useState('My Portfolio');
  const [accountType, setAccountType] = useState<'broker' | 'manual' | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [apiCredentials, setApiCredentials] = useState({
    apiKey: '',
    secretKey: '',
    passphrase: '',
    server: '',
    login: '',
    password: '',
    sandbox: false
  });
  const [accountBalance, setAccountBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tradingStyles = [
    { value: 'scalping', label: 'Scalping', description: 'Quick trades, small profits' },
    { value: 'day-trading', label: 'Day Trading', description: 'Intraday positions' },
    { value: 'swing-trading', label: 'Swing Trading', description: 'Multi-day positions' },
    { value: 'position-trading', label: 'Position Trading', description: 'Long-term positions' },
  ];

  const riskLevels = [
    { value: 'conservative', label: 'Conservative', description: 'Low risk, steady returns' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced risk and reward' },
    { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential' },
  ];

  const markets = [
    'Forex (FX)',
    'Stocks',
    'Cryptocurrency',
    'Commodities',
    'Indices',
    'Bonds',
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to trading' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced trader' },
  ];

  const brokerOptions = [
    { value: 'mt4', label: 'MetaTrader 4', icon: '📊' },
    { value: 'mt5', label: 'MetaTrader 5', icon: '📈' },
    { value: 'binance', label: 'Binance', icon: '🔶' },
    { value: 'bybit', label: 'Bybit', icon: '🔷' },
    { value: 'kucoin', label: 'KuCoin', icon: '🔵' },
    { value: 'okx', label: 'OKX', icon: '⭕' },
    { value: 'mexc', label: 'MEXC', icon: '🔹' },
    { value: 'ctrader', label: 'cTrader', icon: '📉' },
    { value: 'interactive', label: 'Interactive Brokers', icon: '📊' },
    { value: 'alpaca', label: 'Alpaca', icon: '🦙' },
  ];

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First create the user if needed
      if (!user) {
        await createUser(username);
      }
      
      // Create initial portfolio
      await createPortfolio({
        name: portfolioName,
        color: '#007bff',
        icon: '📈'
      });
      
      // Set up account based on selection
      if (accountType === 'broker' && selectedBroker) {
        // Add account to portfolio
        await addAccountToPortfolio({
          portfolioId: 'default',
          name: `${brokerOptions.find(b => b.value === selectedBroker)?.label} Account`,
          type: 'broker',
          broker: selectedBroker,
          balance: parseFloat(accountBalance) || 0,
          currency: 'USD'
        });
      } else if (accountType === 'manual') {
        // Create manual journal account
        await addAccountToPortfolio({
          portfolioId: 'default',
          name: 'Manual Journal',
          type: 'manual',
          balance: parseFloat(accountBalance) || 0,
          currency: 'USD'
        });
      }
      
      // Finally complete onboarding with user preferences
      await completeOnboarding(preferences);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete setup');
      setLoading(false);
      return;
    }
    
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-step-username">
              <CardHeader>
                <CardTitle className="text-center">Create Your Username</CardTitle>
                <p className="text-center text-muted-foreground">
                  Choose a username to get started. This will be your identity in the app.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    className="w-full"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20))}
                    placeholder="Enter a username"
                    autoFocus
                    data-testid="onboarding-username-input"
                  />
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!username.trim()}
                  className="w-full relative z-20"
                  data-testid="onboarding-next-button"
                >
                  Next
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-portfolio">
              <CardHeader>
                <CardTitle className="text-center">Create Your First Portfolio</CardTitle>
                <p className="text-center text-muted-foreground">
                  A portfolio holds your trading accounts and tracks your performance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="portfolioName">Portfolio Name</Label>
                  <Input
                    id="portfolioName"
                    type="text"
                    className="w-full"
                    value={portfolioName}
                    onChange={e => setPortfolioName(e.target.value)}
                    placeholder="My Portfolio"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!portfolioName.trim()}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-account-type">
              <CardHeader>
                <CardTitle className="text-center">Select Account Type</CardTitle>
                <p className="text-center text-muted-foreground">
                  Choose how you want to track your trades
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant={accountType === 'broker' ? 'default' : 'outline'}
                    className="h-auto py-3 flex justify-between"
                    onClick={() => setAccountType('broker')}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">Connect Broker Account</span>
                      <span className="text-sm text-muted-foreground">
                        Automatically sync trades from your broker
                      </span>
                    </div>
                    <Icons.chevronRight className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant={accountType === 'manual' ? 'default' : 'outline'}
                    className="h-auto py-3 flex justify-between"
                    onClick={() => setAccountType('manual')}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">Manual Journal</span>
                      <span className="text-sm text-muted-foreground">
                        Add trades manually or import from CSV/screenshots
                      </span>
                    </div>
                    <Icons.chevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(accountType === 'broker' ? 4 : 5)}
                    disabled={!accountType}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-broker-selection">
              <CardHeader>
                <CardTitle className="text-center">Select Your Broker</CardTitle>
                <p className="text-center text-muted-foreground">
                  Choose the broker you want to connect with
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {brokerOptions.map((broker) => (
                    <Button
                      key={broker.value}
                      variant={selectedBroker === broker.value ? 'default' : 'outline'}
                      className="h-auto py-3 flex flex-col items-center justify-center gap-2"
                      onClick={() => setSelectedBroker(broker.value)}
                    >
                      <span className="text-xl">{broker.icon}</span>
                      <span>{broker.label}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(6)}
                    disabled={!selectedBroker}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-manual-balance">
              <CardHeader>
                <CardTitle className="text-center">Account Balance</CardTitle>
                <p className="text-center text-muted-foreground">
                  Enter your starting account balance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="balance">Starting Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    className="w-full"
                    value={accountBalance}
                    onChange={e => setAccountBalance(e.target.value)}
                    placeholder="10000"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(9)}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-broker-credentials">
              <CardHeader>
                <CardTitle className="text-center">
                  {brokerOptions.find(b => b.value === selectedBroker)?.label} API Credentials
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Enter your API credentials for secure access
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="text"
                      className="w-full"
                      value={apiCredentials.apiKey}
                      onChange={e => setApiCredentials({...apiCredentials, apiKey: e.target.value})}
                      placeholder="Enter your API key"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      className="w-full"
                      value={apiCredentials.secretKey}
                      onChange={e => setApiCredentials({...apiCredentials, secretKey: e.target.value})}
                      placeholder="Enter your secret key"
                    />
                  </div>
                  
                  {selectedBroker === 'kucoin' && (
                    <div>
                      <Label htmlFor="passphrase">Passphrase</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        className="w-full"
                        value={apiCredentials.passphrase}
                        onChange={e => setApiCredentials({...apiCredentials, passphrase: e.target.value})}
                        placeholder="Enter your passphrase"
                      />
                    </div>
                  )}
                  
                  {(selectedBroker === 'mt4' || selectedBroker === 'mt5') && (
                    <>
                      <div>
                        <Label htmlFor="server">Server</Label>
                        <Input
                          id="server"
                          type="text"
                          className="w-full"
                          value={apiCredentials.server}
                          onChange={e => setApiCredentials({...apiCredentials, server: e.target.value})}
                          placeholder="Enter MT4/MT5 server"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login">Login</Label>
                        <Input
                          id="login"
                          type="text"
                          className="w-full"
                          value={apiCredentials.login}
                          onChange={e => setApiCredentials({...apiCredentials, login: e.target.value})}
                          placeholder="Enter login ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          className="w-full"
                          value={apiCredentials.password}
                          onChange={e => setApiCredentials({...apiCredentials, password: e.target.value})}
                          placeholder="Enter password"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sandbox"
                      checked={apiCredentials.sandbox}
                      onCheckedChange={(checked) => setApiCredentials({
                        ...apiCredentials,
                        sandbox: !!checked
                      })}
                    />
                    <Label htmlFor="sandbox">Use sandbox/testnet environment</Label>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(7)}
                    disabled={!apiCredentials.apiKey || !apiCredentials.secretKey}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-broker-balance">
              <CardHeader>
                <CardTitle className="text-center">Account Balance</CardTitle>
                <p className="text-center text-muted-foreground">
                  Enter your balance if it's not returned by the broker
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="balance">Starting Balance (Optional)</Label>
                  <Input
                    id="balance"
                    type="number"
                    className="w-full"
                    value={accountBalance}
                    onChange={e => setAccountBalance(e.target.value)}
                    placeholder="10000"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This is only used if the broker doesn't return your balance
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(6)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(9)}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 9:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-trading-preferences">
              <CardHeader>
                <CardTitle className="text-center">Trading Preferences</CardTitle>
                <p className="text-center text-muted-foreground">
                  Let's personalize your trading experience
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Trading Style</Label>
                  <Select value={preferences.tradingStyle} onValueChange={(value) => setPreferences({ ...preferences, tradingStyle: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your trading style" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradingStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Risk Tolerance</Label>
                  <Select value={preferences.riskTolerance} onValueChange={(value) => setPreferences({ ...preferences, riskTolerance: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(accountType === 'broker' ? 7 : 5)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(10)}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 10:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-markets">
              <CardHeader>
                <CardTitle className="text-center">Preferred Markets</CardTitle>
                <p className="text-center text-muted-foreground">
                  Which markets do you trade?
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {markets.map((market) => (
                    <div key={market} className="flex items-center space-x-2">
                      <Checkbox
                        id={market}
                        checked={preferences.preferredMarkets.includes(market)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences({
                              ...preferences,
                              preferredMarkets: [...preferences.preferredMarkets, market],
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredMarkets: preferences.preferredMarkets.filter((m) => m !== market),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={market} className="text-sm">{market}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(9)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(11)}
                    disabled={preferences.preferredMarkets.length === 0}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 11:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-summary">
              <CardHeader>
                <CardTitle className="text-center">Ready to Start!</CardTitle>
                <p className="text-center text-muted-foreground">
                  Review your setup before we get started
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-sm text-muted-foreground">{username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Portfolio</Label>
                    <p className="text-sm text-muted-foreground">{portfolioName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {accountType === 'broker' 
                        ? `${brokerOptions.find(b => b.value === selectedBroker)?.label} (Connected)` 
                        : 'Manual Journal'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Trading Style</Label>
                    <p className="text-sm text-muted-foreground">
                      {tradingStyles.find(s => s.value === preferences.tradingStyle)?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Markets</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.preferredMarkets.map((market) => (
                        <Badge key={market} variant="secondary" className="text-xs">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-md">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(10)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    className="flex-1 relative z-20 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Icons.spinner className="h-4 w-4 animate-spin" /> Setting up...
                      </span>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
};

export default Onboarding; 