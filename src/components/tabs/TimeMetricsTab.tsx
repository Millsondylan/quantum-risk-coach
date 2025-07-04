import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const TimeMetricsTab = () => {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Win Rate by Duration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Intraday</span>
            <span>0</span>
          </div>
          <div className="flex justify-between">
            <span>Multiday</span>
            <span>0</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Avg Hold Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Wins</span>
            <span>0H 0M 0S</span>
          </div>
          <div className="flex justify-between">
            <span>Losses</span>
            <span>0H 0M 0S</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg Hold Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Longs</span>
            <span>0H 0M 0S</span>
          </div>
          <div className="flex justify-between">
            <span>Shorts</span>
            <span>0H 0M 0S</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center space-x-2">
          <CardTitle>Day of Week</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-2">PNL</p>
          <div className="h-48 bg-gray-800/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Day of Week PNL Chart</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeMetricsTab; 