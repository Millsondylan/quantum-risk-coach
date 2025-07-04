import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarTab = () => {
  // Dummy data for days in a month
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-4">
      <div className="flex justify-center space-x-4 mb-4">
        <Button variant="ghost" className="bg-blue-600">Monthly</Button>
        <Button variant="ghost">Yearly</Button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon">
          <ChevronLeft />
        </Button>
        <h3 className="text-lg font-semibold">July 2025</h3>
        <Button variant="ghost" size="icon">
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-400 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map(day => (
          <div key={day} className="p-2 h-12 flex items-center justify-center bg-gray-800/50 rounded-lg">
            {day}
          </div>
        ))}
      </div>
       <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Weekly Info</h3>
            <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">No data for this week.</p>
            </div>
        </div>
    </div>
  );
};

export default CalendarTab; 