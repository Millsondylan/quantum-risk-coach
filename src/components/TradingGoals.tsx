import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Trophy, TrendingUp, Calendar, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useLocalTrades } from '@/hooks/useLocalTrades';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TradingGoal {
  id: string;
  name: string;
  type: 'profit' | 'win_rate' | 'risk_reward' | 'trade_count';
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  progress: number;
}

interface TradingGoalsProps {
  isWidget?: boolean;
}

export const TradingGoals: React.FC<TradingGoalsProps> = ({ isWidget = false }) => {
  const { user, updatePreferences } = useUser();
  const { trades, getTradeStats } = useLocalTrades();
  const [goals, setGoals] = useState<TradingGoal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TradingGoal | null>(null);

  // Form state
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<TradingGoal['type']>('profit');
  const [targetValue, setTargetValue] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load goals from user preferences
  useEffect(() => {
    if (user?.preferences?.tradingGoals) {
      setGoals(user.preferences.tradingGoals);
    }
  }, [user]);

  // Update goal progress based on actual trading data
  useEffect(() => {
    const stats = getTradeStats();
    const updatedGoals = goals.map(goal => {
      let currentValue = 0;
      let progress = 0;

      switch (goal.type) {
        case 'profit':
          currentValue = stats.totalProfitLoss;
          break;
        case 'win_rate':
          currentValue = stats.winRate;
          break;
        case 'risk_reward':
          const tradesWithRR = trades.filter(t => t.riskReward && t.riskReward > 0);
          currentValue = tradesWithRR.length > 0 
            ? tradesWithRR.reduce((sum, t) => sum + (t.riskReward || 0), 0) / tradesWithRR.length
            : 0;
          break;
        case 'trade_count':
          currentValue = stats.totalTrades;
          break;
      }

      progress = Math.min((currentValue / goal.targetValue) * 100, 100);
      const isCompleted = progress >= 100;

      return { ...goal, currentValue, progress, isCompleted };
    });

    setGoals(updatedGoals);
  }, [trades, getTradeStats]);

  const saveGoals = async (newGoals: TradingGoal[]) => {
    try {
      await updatePreferences({ tradingGoals: newGoals });
      setGoals(newGoals);
    } catch (error) {
      console.error('Failed to save goals:', error);
      toast.error('Failed to save goals');
    }
  };

  const handleAddGoal = async () => {
    if (!goalName || !targetValue || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const newGoal: TradingGoal = {
      id: `goal_${Date.now()}`,
      name: goalName,
      type: goalType,
      targetValue: parseFloat(targetValue),
      currentValue: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(endDate).toISOString(),
      isCompleted: false,
      progress: 0
    };

    const updatedGoals = [...goals, newGoal];
    await saveGoals(updatedGoals);
    
    // Reset form
    setGoalName('');
    setTargetValue('');
    setEndDate('');
    setIsAddingGoal(false);
    
    toast.success('Goal added successfully!');
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !goalName || !targetValue || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal.id 
        ? {
            ...goal,
            name: goalName,
            targetValue: parseFloat(targetValue),
            endDate: new Date(endDate).toISOString()
          }
        : goal
    );

    await saveGoals(updatedGoals);
    setEditingGoal(null);
    
    toast.success('Goal updated successfully!');
  };

  const handleDeleteGoal = async (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    await saveGoals(updatedGoals);
    toast.success('Goal deleted successfully!');
  };

  const getGoalIcon = (type: TradingGoal['type']) => {
    switch (type) {
      case 'profit': return <TrendingUp className="w-4 h-4" />;
      case 'win_rate': return <Trophy className="w-4 h-4" />;
      case 'risk_reward': return <Target className="w-4 h-4" />;
      case 'trade_count': return <Calendar className="w-4 h-4" />;
    }
  };

  const getGoalUnit = (type: TradingGoal['type']) => {
    switch (type) {
      case 'profit': return '$';
      case 'win_rate': return '%';
      case 'risk_reward': return ':1';
      case 'trade_count': return ' trades';
    }
  };

  const formatGoalValue = (value: number, type: TradingGoal['type']) => {
    switch (type) {
      case 'profit': return `$${value.toFixed(2)}`;
      case 'win_rate': return `${value.toFixed(0)}%`;
      case 'risk_reward': return `${value.toFixed(2)}:1`;
      case 'trade_count': return `${value} trades`;
    }
  };

  if (isWidget) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Trading Goals
          </h3>
          <Button size="sm" variant="ghost" onClick={() => setIsAddingGoal(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[150px] text-slate-400">
            <Target className="w-8 h-8 mb-2" />
            <p className="text-sm">Set your first trading goal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 3).map(goal => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    {getGoalIcon(goal.type)}
                    {goal.name}
                  </span>
                  {goal.isCompleted && <CheckCircle className="w-4 h-4 text-green-400" />}
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formatGoalValue(goal.currentValue, goal.type)}</span>
                  <span>{formatGoalValue(goal.targetValue, goal.type)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="holo-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Trading Goals
          </span>
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Trading Goal</DialogTitle>
                <DialogDescription>
                  Set a specific, measurable goal to track your trading progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    placeholder="e.g., Monthly Profit Target"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <Select value={goalType} onValueChange={(value) => setGoalType(value as TradingGoal['type'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profit">Profit Target</SelectItem>
                      <SelectItem value="win_rate">Win Rate</SelectItem>
                      <SelectItem value="risk_reward">Average Risk/Reward</SelectItem>
                      <SelectItem value="trade_count">Number of Trades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target-value">
                    Target Value {getGoalUnit(goalType)}
                  </Label>
                  <Input
                    id="target-value"
                    type="number"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    placeholder="Enter target value"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Target Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
            <Target className="w-12 h-12 mb-4" />
            <p className="text-lg mb-2">No trading goals set</p>
            <p className="text-sm text-center">Set specific goals to track your progress and stay motivated</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isExpired = daysLeft < 0;
              
              return (
                <div key={goal.id} className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        goal.isCompleted ? "bg-green-500/20" : "bg-slate-700/50"
                      )}>
                        {getGoalIcon(goal.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className="text-sm text-slate-400">
                          Target: {formatGoalValue(goal.targetValue, goal.type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {goal.isCompleted && (
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {!goal.isCompleted && !isExpired && (
                        <Badge variant="outline" className="text-slate-400">
                          {daysLeft} days left
                        </Badge>
                      )}
                      {isExpired && !goal.isCompleted && (
                        <Badge variant="outline" className="text-red-400 border-red-500/30">
                          Expired
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingGoal(goal);
                          setGoalName(goal.name);
                          setTargetValue(goal.targetValue.toString());
                          setEndDate(format(new Date(goal.endDate), 'yyyy-MM-dd'));
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className={cn(
                        "font-medium",
                        goal.progress >= 100 ? "text-green-400" : "text-white"
                      )}>
                        {goal.progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Current: {formatGoalValue(goal.currentValue, goal.type)}</span>
                      <span>Target: {formatGoalValue(goal.targetValue, goal.type)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trading Goal</DialogTitle>
            <DialogDescription>
              Update your trading goal details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-goal-name">Goal Name</Label>
              <Input
                id="edit-goal-name"
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                placeholder="e.g., Monthly Profit Target"
              />
            </div>
            <div>
              <Label htmlFor="edit-target-value">
                Target Value {editingGoal && getGoalUnit(editingGoal.type)}
              </Label>
              <Input
                id="edit-target-value"
                type="number"
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                placeholder="Enter target value"
              />
            </div>
            <div>
              <Label htmlFor="edit-end-date">Target Date</Label>
              <Input
                id="edit-end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <Button onClick={handleUpdateGoal} className="w-full">
              Update Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 