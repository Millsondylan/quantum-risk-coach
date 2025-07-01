import React from 'react';
import MT4Connection from '../components/MT4Connection';

const MT4ConnectionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Connect MT4/MT5</h1>
          <p className="text-slate-400">Connect your MetaTrader account to start receiving real-time data and AI insights</p>
        </div>
        <MT4Connection />
      </main>
    </div>
  );
};

export default MT4ConnectionPage;
