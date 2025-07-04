import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, TrendingUp, AlertTriangle, Calendar, Filter } from 'lucide-react';

const newsData = [
  {
    id: 1,
    title: "Federal Reserve Signals Potential Rate Cuts",
    source: "Reuters",
    time: "2h ago",
    category: "Central Banks",
    impact: "high",
    upcoming: false,
    description: "Fed officials indicate possible interest rate reductions in coming months amid economic slowdown concerns.",
  },
  {
    id: 2,
    title: "Global Markets Rally on Tech Sector Growth",
    source: "Financial Times",
    time: "4h ago",
    category: "Markets",
    impact: "medium",
    upcoming: false,
    description: "Major indices surge as technology companies report stronger-than-expected earnings.",
  },
  {
    id: 3,
    title: "Oil Prices Surge Amidst Geopolitical Tensions",
    source: "Bloomberg",
    time: "5h ago",
    category: "Commodities",
    impact: "high",
    upcoming: false,
    description: "Crude oil prices jump 3% following renewed tensions in key oil-producing regions.",
  },
  {
    id: 4,
    title: "ECB Interest Rate Decision",
    source: "European Central Bank",
    time: "Tomorrow 13:45",
    category: "Central Banks",
    impact: "high",
    upcoming: true,
    description: "European Central Bank to announce monetary policy decision and press conference.",
  },
  {
    id: 5,
    title: "US Non-Farm Payrolls Report",
    source: "Bureau of Labor Statistics",
    time: "Friday 13:30",
    category: "Economic Data",
    impact: "high",
    upcoming: true,
    description: "Monthly employment report showing job creation and unemployment rate changes.",
  },
  {
    id: 6,
    title: "Bank of England Policy Meeting",
    source: "Bank of England",
    time: "Next Week",
    category: "Central Banks",
    impact: "medium",
    upcoming: true,
    description: "BOE monetary policy committee meeting and interest rate decision.",
  },
  {
    id: 7,
    title: "CPI Inflation Data Release",
    source: "Bureau of Labor Statistics",
    time: "Next Week",
    category: "Economic Data",
    impact: "high",
    upcoming: true,
    description: "Consumer Price Index data showing inflation trends and price level changes.",
  },
  {
    id: 8,
    title: "Retail Sales Report",
    source: "US Census Bureau",
    time: "Next Week",
    category: "Economic Data",
    impact: "medium",
    upcoming: true,
    description: "Monthly retail sales data indicating consumer spending patterns.",
  },
];

const NewsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  const filteredNews = newsData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesImpact = selectedImpact === 'all' || item.impact === selectedImpact;
    const matchesUpcoming = !showUpcomingOnly || item.upcoming;
    
    return matchesSearch && matchesCategory && matchesImpact && matchesUpcoming;
  });

  const upcomingNews = newsData.filter(item => item.upcoming);

  const categories = ['all', ...new Set(newsData.map(item => item.category))];
  const impacts = ['all', 'high', 'medium', 'low'];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Upcoming Events Summary */}
      {upcomingNews.length > 0 && (
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-300 text-lg">
              <Calendar className="h-5 w-5" />
              Upcoming Events ({upcomingNews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {upcomingNews.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-blue-200">{item.title}</span>
                  <span className="text-blue-400 text-xs">{item.time}</span>
                </div>
              ))}
              {upcomingNews.length > 3 && (
                <div className="text-blue-400 text-xs pt-1">
                  +{upcomingNews.length - 3} more events
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedImpact} onValueChange={setSelectedImpact}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              {impacts.map(impact => (
                <SelectItem key={impact} value={impact}>
                  {impact === 'all' ? 'All Impact' : impact.charAt(0).toUpperCase() + impact.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
              showUpcomingOnly 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            <Clock className="h-3 w-3" />
            Upcoming Only
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No news found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNews.map((item) => (
            <Card key={item.id} className="hover:bg-gray-800/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      {item.upcoming && (
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Upcoming
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400">{item.source}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getImpactColor(item.impact)}`}>
                        {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsTab; 