import React, { useState, useEffect } from 'react';
import UltraTraderDashboard from '../components/UltraTraderDashboard';
import PersonalChallenges from '../components/PersonalChallenges';
import AICoachCard from '../components/AICoachCard';
import RiskAnalyzer from '../components/RiskAnalyzer';
import { Target, Brain, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
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
        <UltraTraderDashboard />
        
        {/* Add Challenge Section for Validation */}
        <div className="px-4 py-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                AI-Generated Challenges
              </h2>
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                4 Active
              </Badge>
            </div>
            <PersonalChallenges />
          </div>

          {/* AI Coach Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                AI Coaching Insights
              </h2>
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                Live Analysis
              </Badge>
            </div>
            <AICoachCard />
          </div>

          {/* Risk Analysis Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Risk Analysis Engine
              </h2>
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                Real-time
              </Badge>
            </div>
            <RiskAnalyzer />
          </div>

          {/* Bottom spacing for mobile nav */}
          <div className="h-24"></div>
        </div>
      </main>
    </div>
  );
};

export default Index;
