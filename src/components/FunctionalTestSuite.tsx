import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Smartphone, 
  MousePointer, 
  Database, 
  BarChart3, 
  Brain, 
  Calendar, 
  Key, 
  Type,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';
import { runAllTests, TestResult } from '@/lib/testingUtils';

interface TestCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  tests: TestResult[];
}

const FunctionalTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const categories: TestCategory[] = [
    { id: 'mobile', name: 'Mobile UX & Navigation', icon: <Smartphone className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'mobile') },
    { id: 'buttons', name: 'Buttons & Placement', icon: <MousePointer className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'buttons') },
    { id: 'trades', name: 'Trade Entry & History', icon: <Database className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'trades') },
    { id: 'analytics', name: 'Analytics Accuracy', icon: <BarChart3 className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'analytics') },
    { id: 'ai', name: 'AI Coach Behavior', icon: <Brain className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'ai') },
    { id: 'calendar', name: 'Calendar & Event Sync', icon: <Calendar className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'calendar') },
    { id: 'api', name: 'API Key Integration', icon: <Key className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'api') },
    { id: 'text', name: 'Text & Visual Consistency', icon: <Type className="w-4 h-4" />, tests: testResults.filter(t => t.category === 'text') }
  ];

  const executeTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallProgress(0);
    
    try {
      const results = await runAllTests();
      setTestResults(results);
      setOverallProgress(100);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setOverallProgress(0);
    setCurrentTest(null);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'running': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const totalTests = testResults.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Functional Testing Suite</h1>
          <p className="text-slate-400">Real-time testing for all app features</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={executeTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button 
            onClick={resetTests} 
            variant="outline"
            disabled={isRunning}
          >
            <Square className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
        <CardHeader>
          <CardTitle className="text-white">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallProgress} className="w-full" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progress: {Math.round(overallProgress)}%</span>
              <span className="text-slate-400">
                {passedTests} passed, {failedTests} failed, {totalTests - passedTests - failedTests} pending
              </span>
            </div>
            {isRunning && (
              <div className="text-sm text-blue-400">
                Running comprehensive tests...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => (
          <Card key={category.id} className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {category.icon}
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.tests.length > 0 ? (
                  category.tests.map(test => (
                    <div key={test.id} className="flex items-center justify-between p-2 rounded bg-[#1A1B1E]/30">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className={`text-sm ${getStatusColor(test.status)}`}>
                          {test.name}
                        </span>
                      </div>
                      {test.duration && (
                        <Badge variant="outline" className="text-xs">
                          {test.duration}ms
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-sm text-center py-4">
                    No tests run yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Results */}
      {testResults.length > 0 && (
        <Card className="bg-[#1A1B1E]/50 border-[#2A2B2E]">
          <CardHeader>
            <CardTitle className="text-white">Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map(result => (
                <div key={result.id} className="p-4 rounded bg-[#1A1B1E]/30 border border-[#2A2B2E]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className={`font-medium ${getStatusColor(result.status)}`}>
                        {result.name}
                      </span>
                    </div>
                    {result.duration && (
                      <Badge variant="outline">
                        {result.duration}ms
                      </Badge>
                    )}
                  </div>
                  {result.error && (
                    <div className="text-red-400 text-sm mt-2">
                      Error: {result.error}
                    </div>
                  )}
                  {result.details && (
                    <div className="text-slate-400 text-sm mt-1">
                      {result.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunctionalTestSuite; 