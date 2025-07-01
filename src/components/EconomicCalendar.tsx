import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Flag, Filter, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { marketService } from '@/lib/api';
import { toast } from 'sonner';

interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  previous: string;
  forecast: string;
  actual?: string;
  country: string;
  category: string;
}

const EconomicCalendar = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated economic events data
  const generateEvents = (): EconomicEvent[] => {
    const today = new Date();
    const events: EconomicEvent[] = [];
    
    const eventTemplates = [
      { event: 'Non-Farm Payrolls', currency: 'USD', impact: 'high' as const, category: 'Employment' },
      { event: 'CPI (YoY)', currency: 'USD', impact: 'high' as const, category: 'Inflation' },
      { event: 'Interest Rate Decision', currency: 'EUR', impact: 'high' as const, category: 'Monetary Policy' },
      { event: 'GDP (QoQ)', currency: 'GBP', impact: 'medium' as const, category: 'Economic Growth' },
      { event: 'Retail Sales (MoM)', currency: 'USD', impact: 'medium' as const, category: 'Consumption' },
      { event: 'Manufacturing PMI', currency: 'EUR', impact: 'medium' as const, category: 'Manufacturing' },
      { event: 'Trade Balance', currency: 'JPY', impact: 'low' as const, category: 'Trade' },
      { event: 'Consumer Confidence', currency: 'GBP', impact: 'low' as const, category: 'Sentiment' }
    ];

    for (let i = 0; i < 20; i++) {
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const eventTime = new Date(today);
      eventTime.setHours(Math.floor(Math.random() * 24));
      eventTime.setMinutes(Math.floor(Math.random() * 60));
      eventTime.setDate(today.getDate() + Math.floor(Math.random() * 7));

      const countries = { USD: 'United States', EUR: 'Eurozone', GBP: 'United Kingdom', JPY: 'Japan' };
      
      events.push({
        id: `event-${i}`,
        time: eventTime.toISOString(),
        currency: template.currency,
        event: template.event,
        impact: template.impact,
        previous: (Math.random() * 10).toFixed(1),
        forecast: (Math.random() * 10).toFixed(1),
        country: countries[template.currency as keyof typeof countries],
        category: template.category
      });
    }

    return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  useEffect(() => {
    fetchEconomicEvents();
  }, []);

  const fetchEconomicEvents = async () => {
    setIsLoading(true);
    try {
      const apiEvents = await marketService.getEconomicCalendar();
      if (apiEvents && apiEvents.length > 0) {
        // Transform API data to match our interface
        const transformedEvents = apiEvents.map((event: any, index: number) => ({
          id: event.id || `event-${index}`,
          time: event.date || new Date().toISOString(),
          currency: event.currency || 'USD',
          event: event.title || 'Economic Event',
          impact: (event.impact || 'medium') as 'high' | 'medium' | 'low',
          previous: event.previous?.toString() || '0.0',
          forecast: event.forecast?.toString() || '0.0',
          actual: event.actual?.toString(),
          country: event.currency || 'United States',
          category: 'Economic'
        }));
        setEvents(transformedEvents);
        toast.success(`Loaded ${transformedEvents.length} economic events`);
      } else {
        // Fallback to mock data
        setEvents(generateEvents());
      }
    } catch (error) {
      console.error('Error fetching economic events:', error);
      setEvents(generateEvents());
      toast.error('Using mock data due to API error');
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getCurrencyFlag = (currency: string) => {
    const flags: { [key: string]: string } = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      JPY: '🇯🇵',
      AUD: '🇦🇺',
      CAD: '🇨🇦',
      CHF: '🇨🇭',
      NZD: '🇳🇿'
    };
    return flags[currency] || '🌍';
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const filteredEvents = events.filter(event => {
    const currencyMatch = selectedCurrency === 'all' || event.currency === selectedCurrency;
    const impactMatch = selectedImpact === 'all' || event.impact === selectedImpact;
    return currencyMatch && impactMatch;
  });

  const currencies = ['all', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const impacts = ['all', 'high', 'medium', 'low'];

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Economic Calendar</h2>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-slate-400">
            {filteredEvents.length} events
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchEconomicEvents}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Flag className="w-4 h-4 text-slate-400" />
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency} value={currency}>
                  {currency === 'all' ? 'All' : `${getCurrencyFlag(currency)} ${currency}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-slate-400" />
          <Select value={selectedImpact} onValueChange={setSelectedImpact}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              {impacts.map(impact => (
                <SelectItem key={impact} value={impact}>
                  {impact === 'all' ? 'All' : impact.charAt(0).toUpperCase() + impact.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No economic events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getCurrencyFlag(event.currency)}</div>
                <div>
                  <p className="font-medium text-white">{event.event}</p>
                  <p className="text-sm text-slate-400">{event.country}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">{formatTime(event.time)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`text-xs ${getImpactColor(event.impact)}`}>
                      {event.impact.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-slate-400">Forecast: {event.forecast}</p>
                  <p className="text-sm text-slate-400">Previous: {event.previous}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EconomicCalendar; 