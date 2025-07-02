import React from 'react';
import Header from '@/components/Header';
import AICoachCard from '@/components/AICoachCard';

const AICoach: React.FC = () => {
  return (
    <>
      <Header />
      <main className="p-4 max-w-4xl mx-auto">
        <AICoachCard />
      </main>
    </>
  );
};

export default AICoach; 