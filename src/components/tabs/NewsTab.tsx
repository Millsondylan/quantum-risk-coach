import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const newsData = [
  {
    title: "Global Markets Rally on Tech Sector Growth",
    source: "Financial Times",
    time: "2h ago",
  },
  {
    title: "Federal Reserve Signals Potential Rate Cuts",
    source: "Reuters",
    time: "4h ago",
  },
  {
    title: "Oil Prices Surge Amidst Geopolitical Tensions",
    source: "Bloomberg",
    time: "5h ago",
  },
];

const NewsTab = () => {
  return (
    <div className="p-4 space-y-4">
      {newsData.map((item, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NewsTab; 