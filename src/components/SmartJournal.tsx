import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Smile, 
  Frown, 
  Meh,
  Target,
  Clock,
  DollarSign,
  MessageCircle,
  Save,
  Plus,
  X,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  tradeId?: string;
  title: string;
  content: string;
  emotionalState: 'confident' | 'anxious' | 'neutral' | 'excited' | 'frustrated';
  marketContext: string;
  observations: string[];
  tags: string[];
  aiInsights: AIInsight[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'suggestion' | 'warning';
  title: string;
  description: string;
  confidence: number;
  relatedTrades: string[];
}

const SmartJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    emotionalState: 'neutral',
    marketContext: '',
    observations: [],
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [newObservation, setNewObservation] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const emotionalStates = [
    { value: 'confident', label: 'Confident', icon: Smile, color: 'text-green-400' },
    { value: 'anxious', label: 'Anxious', icon: Frown, color: 'text-red-400' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-400' },
    { value: 'excited', label: 'Excited', icon: TrendingUp, color: 'text-blue-400' },
    { value: 'frustrated', label: 'Frustrated', icon: TrendingDown, color: 'text-orange-400' }
  ];

  const marketContexts = [
    'Trending Market',
    'Ranging Market',
    'High Volatility',
    'Low Volatility',
    'News Release',
    'Central Bank Meeting',
    'Economic Data',
    'Technical Breakout',
    'Support/Resistance',
    'Correlation Trade'
  ];

  const commonObservations = [
    'FOMO feeling',
    'Overthinking entry',
    'Good risk management',
    'Poor timing',
    'Strong conviction',
    'Second-guessing',
    'Market noise',
    'Clear setup',
    'Emotional trading',
    'Disciplined approach'
  ];

  const handleInputChange = (field: keyof JournalEntry, value: any) => {
    setCurrentEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !currentEntry.tags?.includes(newTag.trim())) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addObservation = () => {
    if (newObservation.trim() && !currentEntry.observations?.includes(newObservation.trim())) {
      setCurrentEntry(prev => ({
        ...prev,
        observations: [...(prev.observations || []), newObservation.trim()]
      }));
      setNewObservation('');
    }
  };

  const removeObservation = (observationToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      observations: prev.observations?.filter(obs => obs !== observationToRemove) || []
    }));
  };

  const saveEntry = () => {
    if (!currentEntry.title || !currentEntry.content) {
      toast.error('Please fill in title and content');
      return;
    }

    const newEntry: JournalEntry = {
      ...currentEntry as JournalEntry,
      id: Date.now().toString(),
      aiInsights: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry({
      title: '',
      content: '',
      emotionalState: 'neutral',
      marketContext: '',
      observations: [],
      tags: []
    });

    toast.success('Journal entry saved!');
  };

  const analyzeEntry = async (entry: JournalEntry) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const insights: AIInsight[] = [
      {
        id: Date.now().toString(),
        type: 'pattern',
        title: 'Emotional Pattern Detected',
        description: 'You tend to perform better when feeling confident vs anxious. Consider waiting for confident setups.',
        confidence: 0.85,
        relatedTrades: ['Trade-001', 'Trade-003']
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'correlation',
        title: 'Market Context Correlation',
        description: 'Your observations about "market noise" correlate with 23% lower win rate in ranging markets.',
        confidence: 0.72,
        relatedTrades: ['Trade-002', 'Trade-005']
      },
      {
        id: (Date.now() + 2).toString(),
        type: 'suggestion',
        title: 'Risk Management Improvement',
        description: 'Consider reducing position size when feeling anxious to maintain emotional balance.',
        confidence: 0.91,
        relatedTrades: []
      }
    ];

    const updatedEntry = {
      ...entry,
      aiInsights: insights,
      updatedAt: new Date()
    };

    setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
    setIsAnalyzing(false);
    toast.success('AI analysis complete!');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <Target className="w-4 h-4" />;
      case 'correlation': return <TrendingUp className="w-4 h-4" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'text-blue-400';
      case 'correlation': return 'text-green-400';
      case 'suggestion': return 'text-yellow-400';
      case 'warning': return 'text-red-400';
      default: return 'text-purple-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* New Entry Form */}
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Smart Journal Entry</span>
          </CardTitle>
          <CardDescription>
            Document your trading thoughts with AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Entry Title</Label>
            <Input
              id="title"
              placeholder="e.g., EURUSD Breakout Trade Analysis"
              value={currentEntry.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="content">Journal Content</Label>
            <Textarea
              id="content"
              placeholder="Describe your trading experience, thoughts, and lessons learned..."
              value={currentEntry.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Emotional State</Label>
              <Select value={currentEntry.emotionalState} onValueChange={(value) => handleInputChange('emotionalState', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emotionalStates.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      <div className="flex items-center space-x-2">
                        <state.icon className={`w-4 h-4 ${state.color}`} />
                        <span>{state.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Market Context</Label>
              <Select value={currentEntry.marketContext} onValueChange={(value) => handleInputChange('marketContext', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select market context" />
                </SelectTrigger>
                <SelectContent>
                  {marketContexts.map(context => (
                    <SelectItem key={context} value={context}>
                      {context}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observations */}
          <div>
            <Label>Key Observations</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                placeholder="Add observation..."
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addObservation()}
              />
              <Button onClick={addObservation} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentEntry.observations?.map(obs => (
                <Badge key={obs} variant="secondary" className="cursor-pointer" onClick={() => removeObservation(obs)}>
                  {obs}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonObservations.map(obs => (
                <Badge 
                  key={obs} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-slate-700"
                  onClick={() => addObservation()}
                >
                  {obs}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
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
              {currentEntry.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={saveEntry} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </Button>
        </CardContent>
      </Card>

      {/* Journal Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Entries</h3>
        {entries.map(entry => (
          <Card key={entry.id} className="holo-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium text-white">{entry.title}</h4>
                  <p className="text-sm text-slate-400">
                    {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const state = emotionalStates.find(s => s.value === entry.emotionalState);
                    if (state?.icon) {
                      const IconComponent = state.icon;
                      return <IconComponent className={`w-5 h-5 ${state.color}`} />;
                    }
                    return null;
                  })()}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => analyzeEntry(entry)}
                    disabled={isAnalyzing}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                  </Button>
                </div>
              </div>

              <p className="text-slate-300 mb-4">{entry.content}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {entry.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {entry.marketContext && (
                <div className="mb-4">
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {entry.marketContext}
                  </Badge>
                </div>
              )}

              {entry.observations.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">Observations:</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.observations.map(obs => (
                      <Badge key={obs} variant="outline">
                        {obs}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insights */}
              {entry.aiInsights.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">AI Insights:</p>
                  {entry.aiInsights.map(insight => (
                    <div key={insight.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`${getInsightColor(insight.type)}`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <h5 className="font-medium text-white">{insight.title}</h5>
                        <Badge variant="outline" className="ml-auto">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{insight.description}</p>
                      {insight.relatedTrades.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400">Related trades: {insight.relatedTrades.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartJournal; 