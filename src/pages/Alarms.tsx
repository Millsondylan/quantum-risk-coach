import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  BellOff, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  Settings,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Alarm {
  id: string;
  symbol: string;
  type: 'price' | 'news' | 'technical' | 'custom';
  condition: 'above' | 'below' | 'crosses' | 'news_release';
  value: number | string;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  description?: string;
  notificationType: 'push' | 'email' | 'both';
  repeat: boolean;
}

const Alarms = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [newAlarm, setNewAlarm] = useState<Partial<Alarm>>({
    symbol: '',
    type: 'price',
    condition: 'above',
    value: 0,
    isActive: true,
    notificationType: 'push',
    repeat: false
  });

  useEffect(() => {
    // Load alarms from localStorage
    const savedAlarms = localStorage.getItem('trading_alarms');
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch (error) {
        console.error('Failed to load alarms:', error);
      }
    }
  }, []);

  const saveAlarms = (updatedAlarms: Alarm[]) => {
    localStorage.setItem('trading_alarms', JSON.stringify(updatedAlarms));
    setAlarms(updatedAlarms);
  };

  const addAlarm = () => {
    if (!newAlarm.symbol || !newAlarm.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    const alarm: Alarm = {
      id: Date.now().toString(),
      symbol: newAlarm.symbol.toUpperCase(),
      type: newAlarm.type || 'price',
      condition: newAlarm.condition || 'above',
      value: newAlarm.value,
      isActive: newAlarm.isActive || true,
      createdAt: new Date().toISOString(),
      description: newAlarm.description,
      notificationType: newAlarm.notificationType || 'push',
      repeat: newAlarm.repeat || false
    };

    const updatedAlarms = [...alarms, alarm];
    saveAlarms(updatedAlarms);
    setIsAddModalOpen(false);
    setNewAlarm({
      symbol: '',
      type: 'price',
      condition: 'above',
      value: 0,
      isActive: true,
      notificationType: 'push',
      repeat: false
    });
    toast.success('Alarm created successfully');
  };

  const updateAlarm = (id: string, updates: Partial<Alarm>) => {
    const updatedAlarms = alarms.map(alarm => 
      alarm.id === id ? { ...alarm, ...updates } : alarm
    );
    saveAlarms(updatedAlarms);
    setEditingAlarm(null);
    toast.success('Alarm updated successfully');
  };

  const deleteAlarm = (id: string) => {
    const updatedAlarms = alarms.filter(alarm => alarm.id !== id);
    saveAlarms(updatedAlarms);
    toast.success('Alarm deleted successfully');
  };

  const toggleAlarm = (id: string) => {
    const updatedAlarms = alarms.map(alarm => 
      alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
    );
    saveAlarms(updatedAlarms);
    toast.success(`Alarm ${alarms.find(a => a.id === id)?.isActive ? 'disabled' : 'enabled'}`);
  };

  const getAlarmIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'news':
        return <AlertTriangle className="w-4 h-4 text-blue-400" />;
      case 'technical':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getConditionText = (condition: string, value: number | string) => {
    switch (condition) {
      case 'above':
        return `Above $${value}`;
      case 'below':
        return `Below $${value}`;
      case 'crosses':
        return `Crosses $${value}`;
      case 'news_release':
        return `News Release`;
      default:
        return `${condition} ${value}`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'push':
        return <Bell className="w-4 h-4" />;
      case 'email':
        return <Settings className="w-4 h-4" />;
      case 'both':
        return <Zap className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-[#1A1B1E]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Alarms & Alerts</h1>
              <p className="text-slate-400 text-sm">Price alerts, news notifications, and trading signals</p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Alarm
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Alarms</p>
                  <p className="text-xl font-bold text-white">{alarms.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active</p>
                  <p className="text-xl font-bold text-green-400">
                    {alarms.filter(a => a.isActive).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Inactive</p>
                  <p className="text-xl font-bold text-red-400">
                    {alarms.filter(a => !a.isActive).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Triggered Today</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {alarms.filter(a => a.lastTriggered && new Date(a.lastTriggered).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alarms List */}
        <div className="space-y-4">
          {alarms.length === 0 ? (
            <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
              <CardContent className="p-8 text-center">
                <BellOff className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No Alarms Set</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Create your first alarm to get notified about price movements, news events, and trading opportunities.
                </p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Alarm
                </Button>
              </CardContent>
            </Card>
          ) : (
            alarms.map(alarm => (
              <Card key={alarm.id} className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getAlarmIcon(alarm.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{alarm.symbol}</h3>
                          <Badge variant="outline" className="text-xs">
                            {alarm.type}
                          </Badge>
                          {alarm.isActive ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {getConditionText(alarm.condition, alarm.value)}
                        </p>
                        {alarm.description && (
                          <p className="text-slate-500 text-xs mt-1">{alarm.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-slate-400">
                        {getNotificationIcon(alarm.notificationType)}
                        <span className="text-xs">{alarm.notificationType}</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlarm(alarm.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {alarm.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAlarm(alarm)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlarm(alarm.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {alarm.lastTriggered && (
                    <div className="mt-3 pt-3 border-t border-[#2A2B2E]">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>Last triggered: {new Date(alarm.lastTriggered).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingAlarm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1A1B1E] border-[#2A2B2E] w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">
                {editingAlarm ? 'Edit Alarm' : 'Create New Alarm'}
              </CardTitle>
              <CardDescription>
                Set up price alerts, news notifications, or custom trading signals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="symbol" className="text-white">Symbol</Label>
                <Input
                  id="symbol"
                  value={editingAlarm?.symbol || newAlarm.symbol}
                  onChange={(e) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, symbol: e.target.value });
                    } else {
                      setNewAlarm({ ...newAlarm, symbol: e.target.value });
                    }
                  }}
                  placeholder="e.g., BTC, EURUSD, AAPL"
                  className="bg-[#2A2B2E] border-[#3A3B3E] text-white"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-white">Alarm Type</Label>
                <Select
                  value={editingAlarm?.type || newAlarm.type}
                  onValueChange={(value) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, type: value as any });
                    } else {
                      setNewAlarm({ ...newAlarm, type: value as any });
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#2A2B2E] border-[#3A3B3E] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price Alert</SelectItem>
                    <SelectItem value="news">News Alert</SelectItem>
                    <SelectItem value="technical">Technical Signal</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition" className="text-white">Condition</Label>
                <Select
                  value={editingAlarm?.condition || newAlarm.condition}
                  onValueChange={(value) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, condition: value as any });
                    } else {
                      setNewAlarm({ ...newAlarm, condition: value as any });
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#2A2B2E] border-[#3A3B3E] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="crosses">Crosses</SelectItem>
                    <SelectItem value="news_release">News Release</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value" className="text-white">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={editingAlarm?.value || newAlarm.value}
                  onChange={(e) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, value: parseFloat(e.target.value) });
                    } else {
                      setNewAlarm({ ...newAlarm, value: parseFloat(e.target.value) });
                    }
                  }}
                  placeholder="0.00"
                  className="bg-[#2A2B2E] border-[#3A3B3E] text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                <Input
                  id="description"
                  value={editingAlarm?.description || newAlarm.description}
                  onChange={(e) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, description: e.target.value });
                    } else {
                      setNewAlarm({ ...newAlarm, description: e.target.value });
                    }
                  }}
                  placeholder="e.g., Bitcoin resistance level"
                  className="bg-[#2A2B2E] border-[#3A3B3E] text-white"
                />
              </div>

              <div>
                <Label htmlFor="notification" className="text-white">Notification Type</Label>
                <Select
                  value={editingAlarm?.notificationType || newAlarm.notificationType}
                  onValueChange={(value) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, notificationType: value as any });
                    } else {
                      setNewAlarm({ ...newAlarm, notificationType: value as any });
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#2A2B2E] border-[#3A3B3E] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="repeat" className="text-white">Repeat Alert</Label>
                <Switch
                  id="repeat"
                  checked={editingAlarm?.repeat || newAlarm.repeat}
                  onCheckedChange={(checked) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, repeat: checked });
                    } else {
                      setNewAlarm({ ...newAlarm, repeat: checked });
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active" className="text-white">Active</Label>
                <Switch
                  id="active"
                  checked={editingAlarm?.isActive ?? newAlarm.isActive}
                  onCheckedChange={(checked) => {
                    if (editingAlarm) {
                      setEditingAlarm({ ...editingAlarm, isActive: checked });
                    } else {
                      setNewAlarm({ ...newAlarm, isActive: checked });
                    }
                  }}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (editingAlarm) {
                      updateAlarm(editingAlarm.id, editingAlarm);
                    } else {
                      addAlarm();
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingAlarm ? 'Update Alarm' : 'Create Alarm'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAlarm(null);
                    setNewAlarm({
                      symbol: '',
                      type: 'price',
                      condition: 'above',
                      value: 0,
                      isActive: true,
                      notificationType: 'push',
                      repeat: false
                    });
                  }}
                  className="flex-1 border-[#3A3B3E] text-white hover:bg-[#2A2B2E]"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Alarms; 