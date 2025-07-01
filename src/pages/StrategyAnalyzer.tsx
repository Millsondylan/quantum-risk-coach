import React from 'react';
import Header from '@/components/Header';
import StrategyAnalyzer from '@/components/StrategyAnalyzer';

const StrategyAnalyzerPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <StrategyAnalyzer />
      </main>
    </div>
  );
};

export default StrategyAnalyzerPage; 