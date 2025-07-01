
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, MessageSquare } from 'lucide-react';

const TradeJournalCard = () => {
  const navigate = useNavigate();

  return (
    <div className="holo-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Smart Journal</h2>
        </div>
        <button 
          onClick={() => navigate('/journal')}
          className="holo-button px-4 py-2 rounded-lg text-white text-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-8 rounded-lg border border-slate-600/30 bg-slate-700/30 text-center">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="font-medium text-white mb-2">No Journal Entries</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Start documenting your trades to build a comprehensive trading history and receive AI-powered insights.
          </p>
          <button 
            onClick={() => navigate('/journal')}
            className="mt-4 holo-button px-4 py-2 rounded-lg text-white text-sm"
          >
            Create First Entry
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">AI Analysis</p>
            <p className="text-xs text-slate-400">Add trades to unlock pattern recognition</p>
          </div>
          <div className="text-cyan-400 font-semibold">Get Started</div>
        </div>
      </div>
    </div>
  );
};

export default TradeJournalCard;
