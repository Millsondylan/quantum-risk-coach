import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const DashboardTab = () => {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-400">Trade Count</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Realized PNL</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative h-24 w-24">
              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-700" strokeWidth="2"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-500" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">0%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average RR</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
             <div className="relative h-24 w-24">
              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-700" strokeWidth="2"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-green-500" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">0</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-6">
            <div>
              <p className="text-sm text-gray-400">Profit Factor</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Expected Value</p>
              <p className="text-2xl font-bold">0</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader><CardTitle>Average Holding Time</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0 Days 0 Hours 0 Minutes</p></CardContent>
      </Card>
      
      <Card>
          <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0</p></CardContent>
      </Card>

    </div>
  );
};

export default DashboardTab; 