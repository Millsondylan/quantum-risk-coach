import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Onboarding: React.FC = () => {
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    tradingStyle: 'day-trading' as any,
    riskTolerance: 'moderate' as any,
    preferredMarkets: ['Forex (FX)', 'Stocks'] as string[],
    experienceLevel: 'intermediate' as any,
    notifications: {
      tradeAlerts: true,
      marketUpdates: true,
      riskWarnings: true,
    },
    theme: 'dark' as any,
    language: 'en',
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

  const handleComplete = async () => {
    await completeOnboarding(preferences);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-step-1">
              <CardHeader>
                <CardTitle className="text-center" data-testid="onboarding-title">Welcome to Quantum Risk Coach</CardTitle>
                <p className="text-center text-muted-foreground">
                  Let's personalize your trading experience
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Trading Style</Label>
                  <Select value={preferences.tradingStyle} onValueChange={(value) => setPreferences({ ...preferences, tradingStyle: value })}>
                    <SelectTrigger data-testid="trading-style-select" className="relative z-20">
                      <SelectValue placeholder="Select your trading style" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50">
                      {tradingStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value} data-testid={`trading-style-${style.value}`}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!preferences.tradingStyle}
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
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-step-2">
              <CardHeader>
                <CardTitle className="text-center" data-testid="risk-tolerance-title">Risk Tolerance</CardTitle>
                <p className="text-center text-muted-foreground">
                  How much risk are you comfortable with?
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Risk Level</Label>
                  <Select value={preferences.riskTolerance} onValueChange={(value) => setPreferences({ ...preferences, riskTolerance: value })}>
                    <SelectTrigger data-testid="risk-tolerance-select" className="relative z-20">
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50">
                      {riskLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} data-testid={`risk-level-${level.value}`}>
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
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 relative z-20" data-testid="onboarding-back-button">
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!preferences.riskTolerance}
                    className="flex-1 relative z-20"
                    data-testid="onboarding-next-button"
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
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-step-3">
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
                        data-testid={`market-checkbox-${market.replace(/\s+/g, '-').toLowerCase()}`}
                      />
                      <Label htmlFor={market} className="text-sm">{market}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 relative z-20" data-testid="onboarding-back-button">
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(4)} 
                    disabled={preferences.preferredMarkets.length === 0}
                    className="flex-1 relative z-20"
                    data-testid="onboarding-next-button"
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
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-step-4">
              <CardHeader>
                <CardTitle className="text-center">Experience Level</CardTitle>
                <p className="text-center text-muted-foreground">
                  What's your trading experience?
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Experience Level</Label>
                  <Select value={preferences.experienceLevel} onValueChange={(value) => setPreferences({ ...preferences, experienceLevel: value })}>
                    <SelectTrigger data-testid="experience-level-select" className="relative z-20">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50">
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} data-testid={`experience-level-${level.value}`}>
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
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1 relative z-20" data-testid="onboarding-back-button">
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(5)} 
                    disabled={!preferences.experienceLevel}
                    className="flex-1 relative z-20"
                    data-testid="onboarding-next-button"
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
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-step-5">
              <CardHeader>
                <CardTitle className="text-center">Notifications</CardTitle>
                <p className="text-center text-muted-foreground">
                  Choose what notifications you'd like to receive
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trade-alerts"
                      checked={preferences.notifications.tradeAlerts}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, tradeAlerts: !!checked }
                      })}
                      data-testid="notification-trade-alerts"
                    />
                    <Label htmlFor="trade-alerts">Trade Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="market-updates"
                      checked={preferences.notifications.marketUpdates}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, marketUpdates: !!checked }
                      })}
                      data-testid="notification-market-updates"
                    />
                    <Label htmlFor="market-updates">Market Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="risk-warnings"
                      checked={preferences.notifications.riskWarnings}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, riskWarnings: !!checked }
                      })}
                      data-testid="notification-risk-warnings"
                    />
                    <Label htmlFor="risk-warnings">Risk Warnings</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(4)} className="flex-1 relative z-20" data-testid="onboarding-back-button">
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(6)} 
                    className="flex-1 relative z-20"
                    data-testid="onboarding-next-button"
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
            <Card className="w-full max-w-md mx-auto relative z-10" data-testid="onboarding-step-6">
              <CardHeader>
                <CardTitle className="text-center">Summary</CardTitle>
                <p className="text-center text-muted-foreground">
                  Review your preferences before we get started
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Trading Style</Label>
                    <p className="text-sm text-muted-foreground">
                      {tradingStyles.find(s => s.value === preferences.tradingStyle)?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Risk Tolerance</Label>
                    <p className="text-sm text-muted-foreground">
                      {riskLevels.find(r => r.value === preferences.riskTolerance)?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Markets</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.preferredMarkets.map((market) => (
                        <Badge key={market} variant="secondary" className="text-xs">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Experience Level</Label>
                    <p className="text-sm text-muted-foreground">
                      {experienceLevels.find(e => e.value === preferences.experienceLevel)?.label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(5)} className="flex-1 relative z-20" data-testid="onboarding-back-button">
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    className="flex-1 relative z-20 bg-blue-600 hover:bg-blue-700"
                    data-testid="onboarding-complete-button"
                  >
                    Complete Setup
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