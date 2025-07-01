import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface OnboardingData {
  name: string;
  tradingExperience: string;
  preferredMarkets: string[];
  riskTolerance: number;
  tradingGoals: string[];
  timeHorizon: string;
  accountSize: string;
  tradingStyle: string;
  motivation: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    tradingExperience: '',
    preferredMarkets: [],
    riskTolerance: 5,
    tradingGoals: [],
    timeHorizon: '',
    accountSize: '',
    tradingStyle: '',
    motivation: ''
  });

  const steps = [
    {
      title: "Welcome to Quantum Risk Coach",
      description: "Let's personalize your trading experience",
      component: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Your Trading Journey
            </h2>
            <p className="text-muted-foreground">
              We'll ask you a few questions to tailor your experience and provide personalized coaching.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">What's your name?</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Trading Experience",
      description: "Help us understand your background",
      component: (
        <div className="space-y-6">
          <div>
            <Label>How long have you been trading?</Label>
            <Select value={data.tradingExperience} onValueChange={(value) => setData({ ...data, tradingExperience: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                <SelectItem value="expert">Expert (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Preferred Markets",
      description: "Which markets do you trade?",
      component: (
        <div className="space-y-6">
          <div>
            <Label>Select your preferred markets (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {['Forex', 'Stocks', 'Crypto', 'Commodities', 'Indices', 'Options'].map((market) => (
                <Button
                  key={market}
                  variant={data.preferredMarkets.includes(market) ? "default" : "outline"}
                  onClick={() => {
                    const updated = data.preferredMarkets.includes(market)
                      ? data.preferredMarkets.filter(m => m !== market)
                      : [...data.preferredMarkets, market];
                    setData({ ...data, preferredMarkets: updated });
                  }}
                  className="justify-start"
                >
                  {market}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Risk Tolerance",
      description: "How much risk are you comfortable with?",
      component: (
        <div className="space-y-6">
          <div>
            <Label>Risk Tolerance Level</Label>
            <div className="mt-4 space-y-4">
              <Slider
                value={[data.riskTolerance]}
                onValueChange={(value) => setData({ ...data, riskTolerance: value[0] })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Level {data.riskTolerance}/10
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Trading Goals",
      description: "What are your primary objectives?",
      component: (
        <div className="space-y-6">
          <div>
            <Label>Select your trading goals (select all that apply)</Label>
            <div className="grid grid-cols-1 gap-3 mt-3">
              {[
                'Generate consistent income',
                'Build long-term wealth',
                'Learn and improve skills',
                'Beat market returns',
                'Preserve capital',
                'Achieve financial freedom'
              ].map((goal) => (
                <Button
                  key={goal}
                  variant={data.tradingGoals.includes(goal) ? "default" : "outline"}
                  onClick={() => {
                    const updated = data.tradingGoals.includes(goal)
                      ? data.tradingGoals.filter(g => g !== goal)
                      : [...data.tradingGoals, goal];
                    setData({ ...data, tradingGoals: updated });
                  }}
                  className="justify-start h-auto p-4"
                >
                  {goal}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Time Horizon",
      description: "How long do you plan to hold positions?",
      component: (
        <div className="space-y-6">
          <div>
            <Label>Your typical holding period</Label>
            <Select value={data.timeHorizon} onValueChange={(value) => setData({ ...data, timeHorizon: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your time horizon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scalping">Scalping (seconds to minutes)</SelectItem>
                <SelectItem value="day">Day Trading (hours to 1 day)</SelectItem>
                <SelectItem value="swing">Swing Trading (days to weeks)</SelectItem>
                <SelectItem value="position">Position Trading (weeks to months)</SelectItem>
                <SelectItem value="long">Long-term (months to years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Account Size",
      description: "What's your typical trading account size?",
      component: (
        <div className="space-y-6">
          <div>
            <Label>Account size range</Label>
            <Select value={data.accountSize} onValueChange={(value) => setData({ ...data, accountSize: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your account size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="micro">Micro ($100 - $1,000)</SelectItem>
                <SelectItem value="small">Small ($1,000 - $10,000)</SelectItem>
                <SelectItem value="medium">Medium ($10,000 - $100,000)</SelectItem>
                <SelectItem value="large">Large ($100,000 - $1,000,000)</SelectItem>
                <SelectItem value="institutional">Institutional ($1M+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Trading Style",
      description: "What's your preferred trading approach?",
      component: (
        <div className="space-y-6">
          <div>
            <Label>Your trading style</Label>
            <Select value={data.tradingStyle} onValueChange={(value) => setData({ ...data, tradingStyle: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your trading style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Analysis</SelectItem>
                <SelectItem value="fundamental">Fundamental Analysis</SelectItem>
                <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                <SelectItem value="quantitative">Quantitative/Algorithmic</SelectItem>
                <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                <SelectItem value="intuitive">Intuitive/Discretionary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Motivation",
      description: "What motivates you to trade?",
      component: (
        <div className="space-y-6">
          <div>
            <Label>What's your primary motivation for trading?</Label>
            <Select value={data.motivation} onValueChange={(value) => setData({ ...data, motivation: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your motivation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial Independence</SelectItem>
                <SelectItem value="challenge">Intellectual Challenge</SelectItem>
                <SelectItem value="passion">Passion for Markets</SelectItem>
                <SelectItem value="career">Career Development</SelectItem>
                <SelectItem value="lifestyle">Lifestyle Freedom</SelectItem>
                <SelectItem value="legacy">Building Legacy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (currentStep === 0) return data.name.trim() !== '';
    if (currentStep === 1) return data.tradingExperience !== '';
    if (currentStep === 2) return data.preferredMarkets.length > 0;
    if (currentStep === 4) return data.tradingGoals.length > 0;
    if (currentStep === 5) return data.timeHorizon !== '';
    if (currentStep === 6) return data.accountSize !== '';
    if (currentStep === 7) return data.tradingStyle !== '';
    if (currentStep === 8) return data.motivation !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription className="text-white/70">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[currentStep].component}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow; 