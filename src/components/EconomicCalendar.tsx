import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Info,
  Database,
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { realDataService, RealEconomicEvent } from '@/lib/realDataService';
import { format } from 'date-fns';

interface FilterOptions {
  impact: 'all' | 'high' | 'medium' | 'low';
  country: string;
  category: string;
}

const EconomicCalendar = () => {
  const [events, setEvents] = useState<RealEconomicEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<RealEconomicEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    impact: 'all',
    country: 'all',
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRealEconomicCalendar();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters, selectedDate]);

  const fetchRealEconomicCalendar = async () => {
    setIsLoading(true);
    try {
      // Check if API keys are configured
      const apiValidation = realDataService.validateApiKeys();
      setAvailableSources(apiValidation.available);
      
      if (!apiValidation.valid) {
        setApiStatus('error');
        toast.error(`Missing API keys: ${apiValidation.missing.join(', ')}`);
        return;
      }

      // Fetch real economic calendar data
      const realEvents = await realDataService.getRealEconomicCalendar();
      
      setEvents(realEvents);
      setApiStatus('connected');
      toast.success(`Real economic calendar loaded from ${availableSources.length} sources`);
    } catch (error) {
      console.error('Error fetching real economic calendar:', error);
      setApiStatus('error');
      toast.error('Failed to load economic calendar. Check your API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    // Filter by date
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(event => event.date === selectedDateStr);
    }

    // Filter by impact
    if (filters.impact !== 'all') {
      filtered = filtered.filter(event => event.impact === filters.impact);
    }

    // Filter by country
    if (filters.country !== 'all') {
      filtered = filtered.filter(event => event.country === filters.country);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    setFilteredEvents(filtered);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-400/20 border-green-400/30';
      default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <TrendingDown className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected': return `Live Data (${availableSources.length} sources)`;
      case 'error': return 'API Error';
      default: return 'Connecting...';
    }
  };

  const formatTime = (time: string) => {
    return time || 'TBD';
  };

  const getUniqueCountries = () => {
    return ['all', ...Array.from(new Set(events.map(event => event.country)))];
  };

  const getUniqueCategories = () => {
    return ['all', ...Array.from(new Set(events.map(event => event.category)))];
  };

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(`${event.date} ${event.time || '00:00'}`);
    return eventDate >= new Date();
  }).slice(0, 10);

  const todayEvents = filteredEvents.filter(event => event.date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Economic Calendar</h2>
          <p className="text-slate-400">Real-time economic events and market-moving data</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 text-sm ${getApiStatusColor()}`}>
            <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-400' : apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
            <span>{getApiStatusText()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRealEconomicCalendar}
            disabled={isLoading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {isLoading ? 'Loading...' : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Data Sources Info */}
      {availableSources.length > 0 && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Connected Calendar Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSources.map(source => (
              <Badge key={source} variant="outline" className="text-xs text-slate-300 border-slate-600">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="holo-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Impact Level</label>
                <select
                  value={filters.impact}
                  onChange={(e) => setFilters({ ...filters, impact: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Impacts</option>
                  <option value="high">High Impact</option>
                  <option value="medium">Medium Impact</option>
                  <option value="low">Low Impact</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-md px-3 py-2"
                >
                  {getUniqueCountries().map(country => (
                    <option key={country} value={country}>
                      {country === 'all' ? 'All Countries' : country}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-md px-3 py-2"
                >
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-slate-600 bg-slate-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {apiStatus === 'error' ? (
        <Card className="holo-card">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-slate-400">Unable to load economic calendar</p>
              <p className="text-sm text-slate-500">Check your API configuration</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-400" />
                Today's Economic Events
              </h3>
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <Card key={event.id} className="holo-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getImpactColor(event.impact)}>
                              {getImpactIcon(event.impact)}
                              <span className="ml-1">{event.impact.toUpperCase()}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                              {event.country}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-white mb-1">{event.event}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(event.time)}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.currency}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400">Previous:</span>
                              <div className="text-white font-medium">{event.previous}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Forecast:</span>
                              <div className="text-white font-medium">{event.forecast}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Actual:</span>
                              <div className="text-white font-medium">{event.actual || 'Pending'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-green-400" />
                Upcoming Events
              </h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="holo-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getImpactColor(event.impact)}>
                              {getImpactIcon(event.impact)}
                              <span className="ml-1">{event.impact.toUpperCase()}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                              {event.country}
                            </Badge>
                            <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                              {event.category}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-white mb-1">{event.event}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(event.time)}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.currency}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400">Previous:</span>
                              <div className="text-white font-medium">{event.previous}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Forecast:</span>
                              <div className="text-white font-medium">{event.forecast}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Events */}
          {filteredEvents.length === 0 && events.length > 0 && (
            <Card className="holo-card">
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Info className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-slate-400">No events match your filters</p>
                  <p className="text-sm text-slate-500">Try adjusting your filter criteria</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {events.length > 0 && (
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Showing {filteredEvents.length} of {events.length} events from {availableSources.length} sources</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EconomicCalendar; 