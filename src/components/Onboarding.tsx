import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { type UserPreferences } from '@/types/user';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/Icons';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Shield, 
  Heart, 
  Activity,
  Zap,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Bitcoin,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface TradingPersona {
  type: 'scalper' | 'day-trader' | 'swing-trader' | 'position-trader';
  description: string;
  icon: React.ReactNode;
  color: string;
}

const tradingPersonas: TradingPersona[] = [
  {
    type: 'scalper',
    description: 'Quick trades, small profits, high frequency',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-400'
  },
  {
    type: 'day-trader',
    description: 'Open and close positions within the same day',
    icon: <Activity className="w-5 h-5" />,
    color: 'text-blue-400'
  },
  {
    type: 'swing-trader',
    description: 'Hold positions for days or weeks',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-green-400'
  },
  {
    type: 'position-trader',
    description: 'Long-term positions based on fundamentals',
    icon: <Target className="w-5 h-5" />,
    color: 'text-purple-400'
  }
];

const Onboarding = () => {
  const { completeOnboarding, user } = useUser();
  const { createPortfolio, addAccountToPortfolio } = usePortfolioContext();
  const [step, setStep] = useState(1); // Always start at step 1
  
  // Update step when user state changes
  useEffect(() => {
    if (user) {
      setStep(2); // Move to step 2 if user exists
    }
  }, [user]);
  
  const [preferences, setPreferences] = useState({
    tradingStyle: 'day-trading' as any,
    riskTolerance: 'moderate' as any,
    preferredMarkets: [] as string[],
    experienceLevel: 'beginner' as any,
    emotionTracking: true,
    aiCoaching: true,
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
      experience: 'intermediate',
      email: true,
      push: true
    },
    theme: 'dark' as any,
    language: 'en',
  });
  const [portfolioName, setPortfolioName] = useState('My Portfolio');
  const [startingBalance, setStartingBalance] = useState('10000');
  const [accountType, setAccountType] = useState<'broker' | 'manual' | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trading persona quiz results
  const [quizAnswers, setQuizAnswers] = useState({
    timeCommitment: '',
    riskAppetite: '',
    holdingPeriod: '',
    decisionStyle: '',
    marketFocus: ''
  });

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

  const marketOptions = [
    { value: 'forex', label: 'Forex', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'crypto', label: 'Cryptocurrency', icon: <Bitcoin className="w-4 h-4" /> },
    { value: 'stocks', label: 'Stocks', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'commodities', label: 'Commodities', icon: <Package className="w-4 h-4" /> },
    { value: 'indices', label: 'Indices', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'options', label: 'Options', icon: <Target className="w-4 h-4" /> }
  ];

  const calculateTradingPersona = () => {
    // Simple logic to determine trading persona based on quiz answers
    if (quizAnswers.holdingPeriod === 'minutes' || quizAnswers.holdingPeriod === 'hours') {
      if (quizAnswers.timeCommitment === 'full-time') {
        return 'scalper';
      }
      return 'day-trader';
    } else if (quizAnswers.holdingPeriod === 'days' || quizAnswers.holdingPeriod === 'weeks') {
      return 'swing-trader';
    }
    return 'position-trader';
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // User should already be created by Auth.tsx at this point
      // Determine trading persona from quiz
      const persona = calculateTradingPersona();
      // Map persona types to match UserPreferences tradingStyle type
      const tradingStyleMap = {
        'scalper': 'scalping' as const,
        'day-trader': 'day-trading' as const,
        'swing-trader': 'swing-trading' as const,
        'position-trader': 'position-trading' as const
      };
      
      // Create preferences that match UserPreferences interface
      const finalPreferences: UserPreferences = {
        tradingStyle: tradingStyleMap[persona],
        riskTolerance: preferences.riskTolerance,
        preferredMarkets: preferences.preferredMarkets,
        experienceLevel: preferences.experienceLevel,
        notifications: preferences.notifications,
        theme: preferences.theme,
        language: preferences.language,
        currency: 'USD',
        emotionTracking: preferences.emotionTracking,
        aiCoaching: preferences.aiCoaching,
        tradingPersona: {
          type: persona,
          quizResults: quizAnswers,
          determinedAt: new Date().toISOString()
        }
      };
      
      // Complete onboarding with user preferences
      await completeOnboarding(finalPreferences);
      toast.success('Welcome to your trading journey!');
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
        // This step should never be reached since we start at step 2 when user exists
        // But just in case, redirect to step 2
        setStep(2);
        return null;

      case 2:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-persona-quiz">
              <CardHeader>
                <CardTitle className="text-center">Trading Persona Quiz</CardTitle>
                <p className="text-center text-muted-foreground">
                  Let's find your trading style with a few quick questions
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Time Commitment */}
                <div className="space-y-3">
                  <Label>How much time can you dedicate to trading?</Label>
                  <RadioGroup value={quizAnswers.timeCommitment} onValueChange={(value) => setQuizAnswers({...quizAnswers, timeCommitment: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full-time" id="full-time" />
                      <Label htmlFor="full-time">Full-time (8+ hours/day)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="part-time" id="part-time" />
                      <Label htmlFor="part-time">Part-time (2-4 hours/day)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="occasional" id="occasional" />
                      <Label htmlFor="occasional">Occasional (&lt; 2 hours/day)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Holding Period */}
                <div className="space-y-3">
                  <Label>How long do you typically want to hold positions?</Label>
                  <RadioGroup value={quizAnswers.holdingPeriod} onValueChange={(value) => setQuizAnswers({...quizAnswers, holdingPeriod: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minutes" id="minutes" />
                      <Label htmlFor="minutes">Minutes to hours</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="days" id="days" />
                      <Label htmlFor="days">Days to weeks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="months" id="months" />
                      <Label htmlFor="months">Weeks to months</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Decision Style */}
                <div className="space-y-3">
                  <Label>How do you prefer to make trading decisions?</Label>
                  <RadioGroup value={quizAnswers.decisionStyle} onValueChange={(value) => setQuizAnswers({...quizAnswers, decisionStyle: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical">Technical analysis & charts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fundamental" id="fundamental" />
                      <Label htmlFor="fundamental">Fundamental analysis & news</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Both technical and fundamental</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!quizAnswers.timeCommitment || !quizAnswers.holdingPeriod || !quizAnswers.decisionStyle}
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
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-risk-tolerance">
              <CardHeader>
                <CardTitle className="text-center">Risk Tolerance Assessment</CardTitle>
                <p className="text-center text-muted-foreground">
                  Understanding your risk comfort level helps us provide better guidance
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Risk Tolerance Level</Label>
                  <div className="space-y-4">
                    <Slider
                      value={[preferences.riskTolerance === 'conservative' ? 1 : preferences.riskTolerance === 'moderate' ? 2 : 3]}
                      onValueChange={(value) => {
                        const risk = value[0] === 1 ? 'conservative' : value[0] === 2 ? 'moderate' : 'aggressive';
                        setPreferences({...preferences, riskTolerance: risk as any});
                      }}
                      max={3}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Conservative</span>
                      <span>Moderate</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  {preferences.riskTolerance === 'conservative' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        <h4 className="font-medium">Conservative Risk Profile</h4>
                      </div>
                      <p className="text-sm text-slate-400">
                        You prefer steady, predictable returns with minimal risk. 
                        Recommended: 1-2% risk per trade, focus on high-probability setups.
                      </p>
                    </div>
                  )}
                  {preferences.riskTolerance === 'moderate' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        <h4 className="font-medium">Moderate Risk Profile</h4>
                      </div>
                      <p className="text-sm text-slate-400">
                        You balance risk and reward, accepting some volatility for better returns. 
                        Recommended: 2-3% risk per trade, diversified strategies.
                      </p>
                    </div>
                  )}
                  {preferences.riskTolerance === 'aggressive' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-400" />
                        <h4 className="font-medium">Aggressive Risk Profile</h4>
                      </div>
                      <p className="text-sm text-slate-400">
                        You seek maximum returns and can handle significant volatility. 
                        Recommended: 3-5% risk per trade, high-volatility opportunities.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Enable Emotion Tracking?</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emotion-tracking"
                      checked={preferences.emotionTracking}
                      onCheckedChange={(checked) => 
                        setPreferences({...preferences, emotionTracking: !!checked})
                      }
                    />
                    <label
                      htmlFor="emotion-tracking"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Track emotional state with each trade to identify patterns
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
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
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-portfolio-setup">
              <CardHeader>
                <CardTitle className="text-center">Portfolio Setup</CardTitle>
                <p className="text-center text-muted-foreground">
                  Create your first portfolio to start tracking trades
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="portfolio-name">Portfolio Name</Label>
                  <Input
                    id="portfolio-name"
                    type="text"
                    value={portfolioName}
                    onChange={(e) => setPortfolioName(e.target.value)}
                    placeholder="e.g., Main Trading Account"
                  />
                </div>

                <div>
                  <Label htmlFor="starting-balance">Starting Balance</Label>
                  <Input
                    id="starting-balance"
                    type="number"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(e.target.value)}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Preferred Markets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {marketOptions.map((market) => (
                      <div key={market.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={market.value}
                          checked={preferences.preferredMarkets.includes(market.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPreferences({
                                ...preferences,
                                preferredMarkets: [...preferences.preferredMarkets, market.value]
                              });
                            } else {
                              setPreferences({
                                ...preferences,
                                preferredMarkets: preferences.preferredMarkets.filter(m => m !== market.value)
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={market.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                        >
                          {market.icon}
                          {market.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    disabled={!portfolioName || !startingBalance || preferences.preferredMarkets.length === 0}
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
                  <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(accountType === 'broker' ? 6 : 7)}
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

      case 6:
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
                  <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(8)}
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

      case 7:
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
                  <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(11)}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 8:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-broker-credentials">
              <CardHeader>
                <CardTitle className="text-center">Connect {brokerOptions.find(b => b.value === selectedBroker)?.label}</CardTitle>
                <p className="text-center text-muted-foreground">
                  Enter your trading account balance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                  <Label htmlFor="balance">Account Balance</Label>
                    <Input
                    id="balance"
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    placeholder="10000"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(6)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(9)}
                    disabled={!accountBalance}
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
                  <Button variant="outline" onClick={() => setStep(8)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(11)}
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
                  <Button variant="outline" onClick={() => setStep(accountType === 'broker' ? 9 : 7)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(11)}
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
                    <p className="text-sm text-muted-foreground">{user?.name || 'Unknown'}</p>
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