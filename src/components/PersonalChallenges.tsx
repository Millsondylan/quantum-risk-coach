import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Trophy, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Zap,
  Star,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'simulation' | 'mini-objective' | 'redemption' | 'skill-building';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  reward: string;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'failed';
  startDate: Date;
  endDate?: Date;
  requirements: string[];
  metrics: ChallengeMetric[];
  aiGenerated: boolean;
}

interface ChallengeMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
}

const PersonalChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    // Initialize with AI-generated challenges based on weaknesses
    const aiChallenges: Challenge[] = [
      {
        id: '1',
        title: 'News Trading Discipline',
        description: 'Practice staying out of the market 30 minutes before and after major news releases. Your analysis shows 40% lower win rate during news events.',
        type: 'skill-building',
        difficulty: 'intermediate',
        duration: '7 days',
        reward: 'Improved discipline score + 15%',
        progress: 0,
        status: 'active',
        startDate: new Date(),
        requirements: ['No trades during news windows', 'Document market reactions', 'Review news impact'],
        metrics: [
          { name: 'News-free days', target: 7, current: 0, unit: 'days' },
          { name: 'Discipline score', target: 85, current: 45, unit: '%' }
        ],
        aiGenerated: true
      },
      {
        id: '2',
        title: 'London Session Mastery',
        description: 'Focus on trading only during your best performing hours (08:00-12:00 GMT) to maximize your 78% win rate in this timeframe.',
        type: 'mini-objective',
        difficulty: 'beginner',
        duration: '5 days',
        reward: 'Better win rate + 10%',
        progress: 60,
        status: 'active',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        requirements: ['Trade only 08:00-12:00 GMT', 'Minimum 3 trades per day', 'Document session performance'],
        metrics: [
          { name: 'London session trades', target: 15, current: 9, unit: 'trades' },
          { name: 'Win rate', target: 80, current: 78, unit: '%' }
        ],
        aiGenerated: true
      },
      {
        id: '3',
        title: 'Risk Management Redemption',
        description: 'Your recent trades show overexposure. Complete this simulation to practice proper position sizing and risk management.',
        type: 'simulation',
        difficulty: 'advanced',
        duration: '3 days',
        reward: 'Risk management certification',
        progress: 0,
        status: 'paused',
        startDate: new Date(),
        requirements: ['Max 2% risk per trade', 'Maintain 1:2 R:R ratio', 'No consecutive losses > 3'],
        metrics: [
          { name: 'Risk per trade', target: 2, current: 0, unit: '%' },
          { name: 'R:R ratio', target: 2, current: 0, unit: ':1' }
        ],
        aiGenerated: true
      },
      {
        id: '4',
        title: 'Emotional Control Challenge',
        description: 'Practice trading with emotional awareness. Your journal entries show anxiety affects decision-making.',
        type: 'skill-building',
        difficulty: 'intermediate',
        duration: '10 days',
        reward: 'Emotional balance badge',
        progress: 30,
        status: 'active',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        requirements: ['Daily mood tracking', 'No trades when anxious', 'Journal every trade'],
        metrics: [
          { name: 'Calm trading days', target: 10, current: 3, unit: 'days' },
          { name: 'Anxiety-free trades', target: 20, current: 6, unit: 'trades' }
        ],
        aiGenerated: true
      }
    ];

    setChallenges(aiChallenges);
  }, []);

  const startChallenge = (challenge: Challenge) => {
    setChallenges(prev => prev.map(c => 
      c.id === challenge.id 
        ? { ...c, status: 'active', startDate: new Date() }
        : c
    ));
    setActiveChallenge(challenge);
    toast.success(`Started: ${challenge.title}`);
  };

  const pauseChallenge = (challenge: Challenge) => {
    setChallenges(prev => prev.map(c => 
      c.id === challenge.id 
        ? { ...c, status: 'paused' }
        : c
    ));
    toast.info(`Paused: ${challenge.title}`);
  };

  const completeChallenge = (challenge: Challenge) => {
    setChallenges(prev => prev.map(c => 
      c.id === challenge.id 
        ? { ...c, status: 'completed', progress: 100, endDate: new Date() }
        : c
    ));
    toast.success(`🎉 Completed: ${challenge.title}! Reward: ${challenge.reward}`);
  };

  const resetChallenge = (challenge: Challenge) => {
    setChallenges(prev => prev.map(c => 
      c.id === challenge.id 
        ? { ...c, status: 'active', progress: 0, startDate: new Date() }
        : c
    ));
    toast.info(`Reset: ${challenge.title}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'simulation': return <Play className="w-4 h-4" />;
      case 'mini-objective': return <Target className="w-4 h-4" />;
      case 'redemption': return <RotateCcw className="w-4 h-4" />;
      case 'skill-building': return <Brain className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'paused': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const aiGeneratedChallenges = challenges.filter(c => c.aiGenerated);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Personal Challenges</h2>
          <p className="text-slate-400">AI-powered challenges to improve your trading skills</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-400">
            <Brain className="w-3 h-3 mr-1" />
            AI Generated
          </Badge>
          <Badge variant="outline">
            {activeChallenges.length} Active
          </Badge>
        </div>
      </div>

      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="holo-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Active Challenges</p>
                <p className="text-2xl font-bold text-white">{activeChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-white">{completedChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">AI Generated</p>
                <p className="text-2xl font-bold text-white">{aiGeneratedChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="holo-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {challenges.length > 0 ? Math.round((completedChallenges.length / challenges.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Play className="w-5 h-5 text-green-400" />
          <span>Active Challenges</span>
        </h3>
        
        {activeChallenges.map(challenge => (
          <Card key={challenge.id} className="holo-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(challenge.type)}
                    <h4 className="font-medium text-white">{challenge.title}</h4>
                    <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    {challenge.aiGenerated && (
                      <Badge variant="outline" className="text-blue-400">
                        <Brain className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{challenge.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{challenge.reward}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-2" />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {challenge.metrics.map((metric, index) => (
                      <div key={index} className="p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-xs text-slate-400">{metric.name}</p>
                        <p className="text-sm font-medium text-white">
                          {metric.current} / {metric.target} {metric.unit}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-2">Requirements:</p>
                    <div className="space-y-1">
                      {challenge.requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-slate-300">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pauseChallenge(challenge)}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => completeChallenge(challenge)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paused Challenges */}
      {challenges.filter(c => c.status === 'paused').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Pause className="w-5 h-5 text-yellow-400" />
            <span>Paused Challenges</span>
          </h3>
          
          {challenges.filter(c => c.status === 'paused').map(challenge => (
            <Card key={challenge.id} className="holo-card opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{challenge.title}</h4>
                    <p className="text-slate-400 text-sm">{challenge.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startChallenge(challenge)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetChallenge(challenge)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Completed Challenges</span>
          </h3>
          
          {completedChallenges.map(challenge => (
            <Card key={challenge.id} className="holo-card bg-green-900/20 border-green-600/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-medium text-white">{challenge.title}</h4>
                      <Badge variant="outline" className="text-green-400">
                        Completed
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm">{challenge.description}</p>
                    <p className="text-green-400 text-sm mt-2">
                      🎉 Reward: {challenge.reward}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    <p>Completed on</p>
                    <p>{challenge.endDate?.toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalChallenges; 