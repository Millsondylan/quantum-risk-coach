import React from 'react';
import Header from '../components/Header';
import UltraTraderDashboard from '../components/UltraTraderDashboard';

const Index = () => {
  
  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      <Header />
      <main className="main-content">
        <UltraTraderDashboard />
      </main>
    </div>
  );
};

export default Index;
