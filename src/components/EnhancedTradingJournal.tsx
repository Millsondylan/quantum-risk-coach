import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Download, 
  Image, 
  Smile, 
  Frown, 
  Meh,
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { journalService, JournalEntry } from '@/lib/api';

const EnhancedTradingJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  // Mock journal entries for demonstration
  const mockEntries: JournalEntry[] = [
    {
      id: '1',
      tradeId: 'T001',
      notes: 'Strong breakout from key resistance level. Volume was high and RSI showed momentum. Entry was clean and stop loss was well-placed.',
      screenshots: ['screenshot1.png', 'screenshot2.png'],
      emotionalState: 'confident',
      strategy: 'breakout',
      lessons: 'Always wait for volume confirmation before entering breakouts. This trade worked well because I waited for the retest.',
      rating: 5,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      tradeId: 'T002',
      notes: 'FOMO entry without proper analysis. Market was choppy and I should have stayed out. Lost more than planned due to poor position sizing.',
      screenshots: ['screenshot3.png'],
      emotionalState: 'frustrated',
      strategy: 'scalping',
      lessons: 'Never trade out of FOMO. Always stick to your trading plan and proper position sizing. Market conditions were not suitable for scalping.',
      rating: 2,
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      tradeId: 'T003',
      notes: 'Perfect trend following trade. Entered on pullback to moving average with strong momentum. Held position for multiple days.',
      screenshots: ['screenshot4.png', 'screenshot5.png', 'screenshot6.png'],
      emotionalState: 'excited',
      strategy: 'trend-following',
      lessons: 'Trend following works best when you have patience and let winners run. Multiple timeframe analysis confirmed the trend.',
      rating: 5,
      createdAt: '2024-01-13T09:15:00Z'
    }
  ];

  useEffect(() => {
    setEntries(mockEntries);
  }, []);

  const handleCreateEntry = () => {
    setIsCreating(true);
    setSelectedEntry({
      id: '',
      tradeId: '',
      notes: '',
      screenshots: [],
      emotionalState: 'neutral',
      strategy: '',
      lessons: '',
      rating: 3,
      createdAt: new Date().toISOString()
    });
  };

  const handleSaveEntry = async (entry: JournalEntry) => {
    try {
      const savedEntry = await journalService.createEntry(entry);
      setEntries(prev => [...prev, savedEntry]);
      setIsCreating(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await journalService.exportToCSV(entries);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-journal-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'excited':
      case 'confident':
      case 'happy':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'frustrated':
      case 'angry':
      case 'sad':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'excited':
      case 'confident':
      case 'happy':
        return 'bg-green-100 text-green-800';
      case 'frustrated':
      case 'angry':
      case 'sad':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tradeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = filterEmotion === 'all' || entry.emotionalState === filterEmotion;
    const matchesRating = filterRating === 'all' || 
                         (filterRating === 'high' && entry.rating >= 4) ||
                         (filterRating === 'medium' && entry.rating >= 3 && entry.rating < 4) ||
                         (filterRating === 'low' && entry.rating < 3);
    
    return matchesSearch && matchesEmotion && matchesRating;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Enhanced Trading Journal
        </CardTitle>
        <CardDescription>
          Detailed trading journal with notes, screenshots, emotional tracking, and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="entries" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entries">Journal Entries</TabsTrigger>
            <TabsTrigger value="create">Create Entry</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emotions</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="frustrated">Frustrated</SelectItem>
                  <SelectItem value="angry">Angry</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="high">High (4-5)</SelectItem>
                  <SelectItem value="medium">Medium (3)</SelectItem>
                  <SelectItem value="low">Low (1-2)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{entry.tradeId}</h3>
                          <Badge variant="outline">{entry.strategy}</Badge>
                          <div className="flex items-center gap-1">
                            {getEmotionIcon(entry.emotionalState)}
                            <Badge className={getEmotionColor(entry.emotionalState)}>
                              {entry.emotionalState}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {getRatingStars(entry.rating)}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {entry.notes}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(entry.createdAt)}
                          </div>
                          {entry.screenshots.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Image className="h-4 w-4" />
                              {entry.screenshots.length} screenshot(s)
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Journal Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tradeId">Trade ID</Label>
                    <Input
                      id="tradeId"
                      placeholder="e.g., T001"
                      value={selectedEntry?.tradeId || ''}
                      onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, tradeId: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <Input
                      id="strategy"
                      placeholder="e.g., breakout, scalping"
                      value={selectedEntry?.strategy || ''}
                      onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, strategy: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Trade Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe the trade setup, execution, and outcome..."
                    value={selectedEntry?.notes || ''}
                    onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="lessons">Lessons Learned</Label>
                  <Textarea
                    id="lessons"
                    placeholder="What did you learn from this trade?"
                    value={selectedEntry?.lessons || ''}
                    onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, lessons: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emotion">Emotional State</Label>
                    <Select
                      value={selectedEntry?.emotionalState || 'neutral'}
                      onValueChange={(value) => setSelectedEntry(prev => prev ? { ...prev, emotionalState: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excited">Excited</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="frustrated">Frustrated</SelectItem>
                        <SelectItem value="angry">Angry</SelectItem>
                        <SelectItem value="sad">Sad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Select
                      value={String(selectedEntry?.rating || 3)}
                      onValueChange={(value) => setSelectedEntry(prev => prev ? { ...prev, rating: parseInt(value) } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Poor</SelectItem>
                        <SelectItem value="2">2 - Below Average</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedEntry(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedEntry && handleSaveEntry(selectedEntry)}
                    disabled={!selectedEntry?.tradeId || !selectedEntry?.notes}
                  >
                    Save Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold">{entries.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <p className="text-2xl font-bold">
                        {(entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length).toFixed(1)}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Most Common Emotion</p>
                      <p className="text-2xl font-bold capitalize">
                        {entries.length > 0 ? 
                          Object.entries(
                            entries.reduce((acc, entry) => {
                              acc[entry.emotionalState] = (acc[entry.emotionalState] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).sort(([,a], [,b]) => b - a)[0][0] : 'N/A'
                        }
                      </p>
                    </div>
                    <Smile className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Emotional State Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    entries.reduce((acc, entry) => {
                      acc[entry.emotionalState] = (acc[entry.emotionalState] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([emotion, count]) => (
                    <div key={emotion} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getEmotionIcon(emotion)}
                        <span className="capitalize">{emotion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / entries.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedEntry.tradeId}</CardTitle>
                  <CardDescription>{formatDate(selectedEntry.createdAt)}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{selectedEntry.strategy}</Badge>
                <div className="flex items-center gap-1">
                  {getEmotionIcon(selectedEntry.emotionalState)}
                  <Badge className={getEmotionColor(selectedEntry.emotionalState)}>
                    {selectedEntry.emotionalState}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {getRatingStars(selectedEntry.rating)}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Trade Notes</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedEntry.notes}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Lessons Learned</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedEntry.lessons}</p>
              </div>

              {selectedEntry.screenshots.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Screenshots</h4>
                  <div className="flex gap-2">
                    {selectedEntry.screenshots.map((screenshot, index) => (
                      <div key={index} className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTradingJournal; 