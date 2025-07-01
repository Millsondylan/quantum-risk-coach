import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runComprehensiveSupabaseTest, testSpecificLogin, testSpecificSignup } from '@/lib/supabaseTest';

const AuthDebug = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('test@example.com');
  const [signupPassword, setSignupPassword] = useState('password123');
  const [signupUsername, setSignupUsername] = useState('testuser');
  const [loading, setLoading] = useState(false);

  const runFullTest = async () => {
    setLoading(true);
    try {
      const results = await runComprehensiveSupabaseTest();
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: `${error}` });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const results = await testSpecificLogin(loginEmail, loginPassword);
      setTestResults(results);
    } catch (error) {
      console.error('Login test failed:', error);
      setTestResults({ error: `${error}` });
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    try {
      const results = await testSpecificSignup(signupEmail, signupPassword, signupUsername);
      setTestResults(results);
    } catch (error) {
      console.error('Signup test failed:', error);
      setTestResults({ error: `${error}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="holo-card">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">🔧 Authentication Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Full System Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Full System Test</h3>
              <Button 
                onClick={runFullTest} 
                disabled={loading}
                className="w-full holo-button"
              >
                {loading ? 'Running Tests...' : 'Run Complete System Test'}
              </Button>
            </div>

            {/* Login Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Login Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={testLogin} 
                disabled={loading}
                className="w-full holo-button"
              >
                {loading ? 'Testing Login...' : 'Test Login'}
              </Button>
            </div>

            {/* Signup Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. Signup Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={testSignup} 
                disabled={loading}
                className="w-full holo-button"
              >
                {loading ? 'Testing Signup...' : 'Test Signup'}
              </Button>
            </div>

            {/* Results */}
            {testResults && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <Card className="bg-slate-800/50">
                  <CardContent className="p-4">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Instructions</h3>
              <div className="bg-slate-800/30 p-4 rounded-lg space-y-2 text-sm">
                <p>1. <strong>Run Full System Test</strong> - Tests connection, auth methods, and database</p>
                <p>2. <strong>Test Login</strong> - Try logging in with existing credentials</p>
                <p>3. <strong>Test Signup</strong> - Create a new account</p>
                <p>4. <strong>Check Results</strong> - Look at the detailed results below</p>
                <p className="text-yellow-400">💡 Open browser console (F12) for additional debugging info</p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthDebug; 