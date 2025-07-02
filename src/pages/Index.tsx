import React, { useState, useEffect, memo, useMemo } from 'react';
import { lazy, Suspense } from 'react';
import { Target, Brain, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Lazy load heavy components
const UltraTraderDashboard = lazy(() => import('../components/UltraTraderDashboard'));
const PersonalChallenges = lazy(() => import('../components/PersonalChallenges'));
const AICoachCard = lazy(() => import('../components/AICoachCard'));
const RiskAnalyzer = lazy(() => import('../components/RiskAnalyzer'));

// Loading component for lazy-loaded sections
const SectionLoader = memo(() => (
  <div className="animate-pulse">
    <div className="h-32 bg-slate-800 rounded-lg mb-4"></div>
  </div>
));

SectionLoader.displayName = 'SectionLoader';

// Memoized section header component
const SectionHeader = memo(({ 
  icon: Icon, 
  title, 
  badgeText, 
  badgeColor 
}: { 
  icon: any; 
  title: string; 
  badgeText: string; 
  badgeColor: string; 
}) => (
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
      <Icon className={`w-5 h-5 ${badgeColor}`} />
      {title}
    </h2>
    <Badge variant="outline" className={`text-xs ${badgeColor} border-opacity-20`}>
      {badgeText}
    </Badge>
  </div>
));

SectionHeader.displayName = 'SectionHeader';

const Index = memo(() => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Reduced from 1000ms
    return () => clearTimeout(timer);
  }, []);
  
  // Memoized section configurations
  const sections = useMemo(() => [
    {
      id: 'challenges',
      title: 'AI-Generated Challenges',
      icon: Target,
      badgeText: '4 Active',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      component: PersonalChallenges
    },
    {
      id: 'ai-coach',
      title: 'AI Coaching Insights',
      icon: Brain,
      badgeText: 'Live Analysis',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      component: AICoachCard
    },
    {
      id: 'risk-analysis',
      title: 'Risk Analysis Engine',
      icon: Shield,
      badgeText: 'Real-time',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
      component: RiskAnalyzer
    }
  ], []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div data-testid="page-container" className="min-h-screen bg-[#0A0B0D] text-white">
      <main data-testid="main-content" className="main-content" role="main">
        <Suspense fallback={<SectionLoader />}>
          <UltraTraderDashboard />
        </Suspense>
        
        {/* Optimized Challenge Section */}
        <div className="px-4 py-6 space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <SectionHeader
                icon={section.icon}
                title={section.title}
                badgeText={section.badgeText}
                badgeColor={section.badgeColor}
              />
              <Suspense fallback={<SectionLoader />}>
                <section.component />
              </Suspense>
            </div>
          ))}

          {/* Bottom spacing for mobile nav */}
          <div className="h-24"></div>
        </div>
      </main>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
