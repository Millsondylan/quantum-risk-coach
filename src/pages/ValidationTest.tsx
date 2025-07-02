import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Brain, Shield, Star, TrendingUp } from 'lucide-react';

const ValidationTest = () => {
  // Mock challenge data for validation
  const challenges = [
    {
      id: 1,
      title: "News Trading Discipline",
      progress: 67,
      reward: "Risk Management Badge",
      xp: 150,
      status: "active"
    },
    {
      id: 2,
      title: "London Session Mastery", 
      progress: 34,
      reward: "Session Expert Badge",
      xp: 300,
      status: "active"
    },
    {
      id: 3,
      title: "Risk Management",
      progress: 89,
      reward: "Risk Master Certificate",
      xp: 75,
      status: "almost_complete"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Validation Test Page</h1>

      {/* Challenge Section */}
      <div className="space-y-4" data-testid="challenges-section">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">AI-Generated Challenges</h2>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
            {challenges.length} Active
          </Badge>
        </div>

        {/* Challenge Cards */}
        {challenges.map((challenge) => (
          <Card 
            key={challenge.id} 
            className="bg-[#1A1B1E] border-[#2A2B2E] challenge" 
            data-testid={`challenge-${challenge.id}`}
            data-challenge-id={challenge.id}
            data-status={challenge.status}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">{challenge.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 ai-generated-badge">
                    AI Generated
                  </Badge>
                  <div className="flex items-center gap-1 text-yellow-400 reward">
                    <Star className="w-3 h-3" />
                    <span className="text-xs">{challenge.xp} XP</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white">{challenge.progress}%</span>
                </div>
                <Progress 
                  value={challenge.progress} 
                  className="h-2 progress-bar"
                  data-testid={`progress-${challenge.id}`}
                  data-value={challenge.progress}
                />
                <div className="text-xs text-slate-400">
                  Reward: <span className="reward-element">{challenge.reward}</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <div className="text-xs text-blue-400 personalized-challenge">
                  • Personalized insight based on your trading patterns
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Badge Section */}
        <div className="grid grid-cols-3 gap-3">
          <div className="badge bg-yellow-500/20 text-yellow-400 p-3 rounded text-center" data-testid="badge-0" data-earned="true">
            <div className="text-lg">🏆</div>
            <div className="text-xs">Risk Master</div>
          </div>
          <div className="badge bg-green-500/20 text-green-400 p-3 rounded text-center" data-testid="badge-1" data-earned="true">
            <div className="text-lg">⚡</div>
            <div className="text-xs">Speed Trader</div>
          </div>
          <div className="badge bg-blue-500/20 text-blue-400 p-3 rounded text-center" data-testid="badge-2" data-earned="false">
            <div className="text-lg">🎯</div>
            <div className="text-xs">Precision</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationTest;
