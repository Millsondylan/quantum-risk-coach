import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  Users,
  MessageSquare,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';

interface SentimentData {
  timestamp: string;
  value: number;
  change: number;
  volume: number;
  confidence: number;
}

interface MarketSentiment {
  instrument: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  confidence: number; // 0-100
  data: SentimentData[];
  sources: string[];
  lastUpdate: Date;
}

const MarketSentimentOverlay = () => {
  const [sentiments, setSentiments] = useState<MarketSentiment[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState<string>('EURUSD');
  const [isLoading, setIsLoading] = useState(false);

  const instruments = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDCAD', 'NZDUSD', 'EURCAD'
  ];

  useEffect(() => {
    // Simulate sentiment data
    const generateSentimentData = (instrument: string): MarketSentiment => {
      const baseValue = Math.random() * 100;
      const data: SentimentData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: baseValue + (Math.random() - 0.5) * 20,
        change: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000,
        confidence: 70 + Math.random() * 30
      }));

      const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;
      let sentiment: 'bullish' | 'bearish' | 'neutral';
      if (avgValue > 60) sentiment = 'bullish';
      else if (avgValue < 40) sentiment = 'bearish';
      else sentiment = 'neutral';

      return {
        instrument,
        sentiment,
        strength: Math.abs(avgValue - 50) * 2,
        confidence: data.reduce((sum, d) => sum + d.confidence, 0) / data.length,
        data,
        sources: ['Social Media', 'News Analysis', 'Technical Indicators', 'Institutional Flow'],
        lastUpdate: new Date()
      };
    };

    const mockSentiments = instruments.map(instrument => generateSentimentData(instrument));
    setSentiments(mockSentiments);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success('Sentiment data refreshed!');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      case 'neutral': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4" />;
      case 'bearish': return <TrendingDown className="w-4 h-4" />;
      case 'neutral': return <Activity className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength > 80) return 'text-red-500';
    if (strength > 60) return 'text-orange-400';
    if (strength > 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const selectedSentiment = sentiments.find(s => s.instrument === selectedInstrument);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Market Sentiment Overlay</h2>
            <p className="text-sm text-slate-400">Global sentiment shifts before price action</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isVisible && (
        <>
          {/* Instrument Selector */}
          <div className="flex flex-wrap gap-2">
            {instruments.map(instrument => {
              const sentiment = sentiments.find(s => s.instrument === instrument);
              return (
                <Button
                  key={instrument}
                  variant={selectedInstrument === instrument ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedInstrument(instrument)}
                  className="flex items-center space-x-2"
                >
                  {sentiment && (
                    <div className={`${getSentimentColor(sentiment.sentiment)}`}>
                      {getSentimentIcon(sentiment.sentiment)}
                    </div>
                  )}
                  <span>{instrument}</span>
                </Button>
              );
            })}
          </div>

          {/* Selected Instrument Sentiment */}
          {selectedSentiment && (
            <Card className="holo-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{selectedSentiment.instrument}</span>
                    <Badge variant="outline" className={getSentimentColor(selectedSentiment.sentiment)}>
                      {getSentimentIcon(selectedSentiment.sentiment)}
                      {selectedSentiment.sentiment.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400">
                    Last update: {selectedSentiment.lastUpdate.toLocaleTimeString()}
                  </div>
                </CardTitle>
                <CardDescription>
                  Sentiment strength: {selectedSentiment.strength.toFixed(1)}% | 
                  Confidence: {selectedSentiment.confidence.toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sentiment Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedSentiment.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        stroke="#9CA3AF"
                      />
                      <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sentiment Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Sentiment Strength</span>
                    </div>
                    <p className={`text-2xl font-bold ${getStrengthColor(selectedSentiment.strength)}`}>
                      {selectedSentiment.strength.toFixed(1)}%
                    </p>
                    <Progress value={selectedSentiment.strength} className="mt-2" />
                  </div>

                  <div className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-slate-400">Confidence</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {selectedSentiment.confidence.toFixed(1)}%
                    </p>
                    <Progress value={selectedSentiment.confidence} className="mt-2" />
                  </div>

                  <div className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-slate-400">Data Sources</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {selectedSentiment.sources.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Active feeds</p>
                  </div>
                </div>

                {/* Data Sources */}
                <div>
                  <h4 className="font-medium text-white mb-3">Data Sources</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedSentiment.sources.map((source, index) => (
                      <Badge key={index} variant="outline" className="justify-center">
                        <Zap className="w-3 h-3 mr-1" />
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recent Changes */}
                <div>
                  <h4 className="font-medium text-white mb-3">Recent Sentiment Changes</h4>
                  <div className="space-y-2">
                    {selectedSentiment.data.slice(-5).map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-800/20 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-400">
                            {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-sm text-white">
                            Sentiment: {data.value.toFixed(1)}
                          </span>
                        </div>
                        <div className={`text-sm ${data.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sentiment Alerts */}
                <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">Sentiment Alert</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {selectedSentiment.sentiment === 'bullish' 
                      ? 'Strong bullish sentiment detected. Consider long positions with proper risk management.'
                      : selectedSentiment.sentiment === 'bearish'
                      ? 'Bearish sentiment building. Monitor for short opportunities or protect existing longs.'
                      : 'Neutral sentiment. Market may be consolidating. Wait for clearer directional signals.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Sentiment Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sentiments.slice(0, 8).map(sentiment => (
              <Card key={sentiment.instrument} className="holo-card">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{sentiment.instrument}</span>
                    <div className={getSentimentColor(sentiment.sentiment)}>
                      {getSentimentIcon(sentiment.sentiment)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Strength</span>
                      <span className={`font-medium ${getStrengthColor(sentiment.strength)}`}>
                        {sentiment.strength.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={sentiment.strength} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MarketSentimentOverlay; 