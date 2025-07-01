import React from 'react';
import Header from '../components/Header';
import DashboardGrid from '../components/DashboardGrid';

const Index = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header />
      <main className="main-content container mx-auto px-4 md:px-6 py-4 md:py-8">
        <DashboardGrid />
      </main>
    </div>
  );
};

export default Index;
