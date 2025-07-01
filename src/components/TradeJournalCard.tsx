
import React from 'react';
import { BookOpen, Plus, Tag, MessageSquare } from 'lucide-react';

const TradeJournalCard = () => {
  const recentEntries = [
    {
      id: 1,
      pair: 'EUR/USD',
      type: 'Long',
      pnl: 127.50,
      emotion: 'Confident',
      note: 'Clean breakout from resistance, followed plan perfectly',
      tags: ['Breakout', 'High Confidence'],
      time: '2 hours ago',
    },
    {
      id: 2,
      pair: 'GBP/JPY',
      type: 'Short',
      pnl: -45.20,
      emotion: 'Frustrated',
      note: 'Stopped out too early, should have waited for confirmation',
      tags: ['Early Exit', 'Lesson Learned'],
      time: '4 hours ago',
    },
    {
      id: 3,
      pair: 'USD/CAD',
      type: 'Long',
      pnl: 89.30,
      emotion: 'Satisfied',
      note: 'News-driven trade, quick scalp on employment data',
      tags: ['News Trading', 'Scalp'],
      time: '1 day ago',
    },
  ];

  return (
    <div className="holo-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Smart Journal</h2>
        </div>
        <button className="holo-button px-4 py-2 rounded-lg text-white text-sm flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="space-y-4">
        {recentEntries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-white">{entry.pair}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  entry.type === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {entry.type}
                </span>
                <span className={`font-medium ${
                  entry.pnl > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {entry.pnl > 0 ? '+' : ''}${entry.pnl.toFixed(2)}
                </span>
              </div>
              <span className="text-xs text-slate-400">{entry.time}</span>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Mood: {entry.emotion}</span>
            </div>
            
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">{entry.note}</p>
            
            <div className="flex items-center space-x-2">
              <Tag className="w-3 h-3 text-slate-400" />
              <div className="flex space-x-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">AI Analysis</p>
            <p className="text-xs text-slate-400">Your emotional state correlates 73% with trade success</p>
          </div>
          <div className="text-cyan-400 font-semibold">Learn More</div>
        </div>
      </div>
    </div>
  );
};

export default TradeJournalCard;
