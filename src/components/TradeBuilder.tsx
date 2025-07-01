import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Save, 
  Target, 
  DollarSign, 
  Percent, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  BookOpen,
  Tag,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface TradeSetup {
  id: string;
  name: string;
  description: string;
  instrument: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  riskPercentage: number;
  strategy: string;
  tags: string[];
  conditions: TradeCondition[];
  isActive: boolean;
  createdAt: Date;
}

interface TradeCondition {
  id: string;
  type: 'price' | 'time' | 'indicator' | 'news';
  condition: string;
  value: string;
  operator: 'above' | 'below' | 'equals' | 'between';
}

const TradeBuilder = () => {
  const [tradeSetup, setTradeSetup] = useState<Partial<TradeSetup>>({
    name: '',
    description: '',
    instrument: 'EURUSD',
    direction: 'buy',
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    lotSize: 0.01,
    riskPercentage: 2,
    strategy: 'trend-following',
    tags: [],
    conditions: [],
    isActive: true
  });

  const [newTag, setNewTag] = useState('');
  const [newCondition, setNewCondition] = useState<Partial<TradeCondition>>({
    type: 'price',
    condition: '',
    value: '',
    operator: 'above'
  });

  const instruments = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDCAD', 'NZDUSD', 'EURCAD'
  ];

  const strategies = [
    'trend-following',
    'mean-reversion',
    'breakout',
    'scalping',
    'swing-trading',
    'news-trading',
    'grid-trading',
    'martingale'
  ];

  const conditionTypes = [
    { value: 'price', label: 'Price Level', icon: DollarSign },
    { value: 'time', label: 'Time Window', icon: Clock },
    { value: 'indicator', label: 'Technical Indicator', icon: TrendingUp },
    { value: 'news', label: 'News Event', icon: AlertTriangle }
  ];

  const handleInputChange = (field: keyof TradeSetup, value: any) => {
    setTradeSetup(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !tradeSetup.tags?.includes(newTag.trim())) {
      setTradeSetup(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTradeSetup(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addCondition = () => {
    if (newCondition.condition && newCondition.value) {
      const condition: TradeCondition = {
        id: Date.now().toString(),
        type: newCondition.type as any,
        condition: newCondition.condition,
        value: newCondition.value,
        operator: newCondition.operator as any
      };

      setTradeSetup(prev => ({
        ...prev,
        conditions: [...(prev.conditions || []), condition]
      }));

      setNewCondition({
        type: 'price',
        condition: '',
        value: '',
        operator: 'above'
      });
    }
  };

  const removeCondition = (conditionId: string) => {
    setTradeSetup(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(cond => cond.id !== conditionId) || []
    }));
  };

  const calculateRisk = () => {
    if (!tradeSetup.entryPrice || !tradeSetup.stopLoss || !tradeSetup.lotSize) return 0;
    
    const pipValue = 10; // Simplified calculation
    const pips = Math.abs(tradeSetup.entryPrice - tradeSetup.stopLoss) * 10000;
    return pips * pipValue * tradeSetup.lotSize;
  };

  const calculateReward = () => {
    if (!tradeSetup.entryPrice || !tradeSetup.takeProfit || !tradeSetup.lotSize) return 0;
    
    const pipValue = 10; // Simplified calculation
    const pips = Math.abs(tradeSetup.entryPrice - tradeSetup.takeProfit) * 10000;
    return pips * pipValue * tradeSetup.lotSize;
  };

  const saveTradeSetup = () => {
    if (!tradeSetup.name || !tradeSetup.instrument) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newSetup: TradeSetup = {
      ...tradeSetup as TradeSetup,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    // Here you would save to Supabase
    console.log('Saving trade setup:', newSetup);
    toast.success('Trade setup saved successfully!');
  };

  const riskAmount = calculateRisk();
  const rewardAmount = calculateReward();
  const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0;

  return (
    <div className="space-y-6">
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span>Trade Setup Builder</span>
          </CardTitle>
          <CardDescription>
            Create and save personalized trade setups with advanced risk management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Setup Name *</Label>
              <Input
                id="name"
                placeholder="e.g., EURUSD Breakout Strategy"
                value={tradeSetup.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="instrument">Instrument *</Label>
              <Select value={tradeSetup.instrument} onValueChange={(value) => handleInputChange('instrument', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map(instrument => (
                    <SelectItem key={instrument} value={instrument}>
                      {instrument}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your trading strategy and setup..."
              value={tradeSetup.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Trade Direction and Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Direction</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={tradeSetup.direction === 'buy' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('direction', 'buy')}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button
                  variant={tradeSetup.direction === 'sell' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('direction', 'sell')}
                  className="flex-1"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="strategy">Strategy</Label>
              <Select value={tradeSetup.strategy} onValueChange={(value) => handleInputChange('strategy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map(strategy => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.00001"
                placeholder="1.0850"
                value={tradeSetup.entryPrice}
                onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.00001"
                placeholder="1.0800"
                value={tradeSetup.stopLoss}
                onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                type="number"
                step="0.00001"
                placeholder="1.0950"
                value={tradeSetup.takeProfit}
                onChange={(e) => handleInputChange('takeProfit', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Risk Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lotSize">Lot Size</Label>
              <Input
                id="lotSize"
                type="number"
                step="0.01"
                placeholder="0.01"
                value={tradeSetup.lotSize}
                onChange={(e) => handleInputChange('lotSize', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="riskPercentage">Risk % of Account</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tradeSetup.riskPercentage || 0]}
                  onValueChange={([value]) => handleInputChange('riskPercentage', value)}
                  max={10}
                  min={0.1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm text-slate-400 w-12">{tradeSetup.riskPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Risk/Reward Analysis */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="pt-6">
              <h4 className="font-medium text-white mb-4">Risk Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-400">Risk Amount</p>
                  <p className="text-lg font-semibold text-red-400">${riskAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Reward Amount</p>
                  <p className="text-lg font-semibold text-green-400">${rewardAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">R:R Ratio</p>
                  <p className="text-lg font-semibold text-blue-400">{riskRewardRatio.toFixed(2)}:1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <div>
            <Label>Strategy Tags</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tradeSetup.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Entry Conditions */}
          <div>
            <Label>Entry Conditions</Label>
            <div className="space-y-3 mt-2">
              {tradeSetup.conditions?.map(condition => (
                <div key={condition.id} className="flex items-center space-x-2 p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-white">{condition.condition} {condition.operator} {condition.value}</p>
                    <p className="text-xs text-slate-400">{condition.type}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(condition.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Select value={newCondition.type} onValueChange={(value) => setNewCondition(prev => ({ ...prev, type: value as 'price' | 'time' | 'indicator' | 'news' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Condition"
                  value={newCondition.condition}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, condition: e.target.value }))}
                />
                <Select value={newCondition.operator} onValueChange={(value) => setNewCondition(prev => ({ ...prev, operator: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Value"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                  />
                  <Button onClick={addCondition} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={tradeSetup.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label>Active Setup</Label>
          </div>

          {/* Save Button */}
          <Button onClick={saveTradeSetup} className="w-full" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save Trade Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeBuilder; 