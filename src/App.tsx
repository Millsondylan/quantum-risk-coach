import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useUser } from './contexts/UserContext';
import { useIsMobile } from './hooks/use-mobile';
import Onboarding from './components/Onboarding';
import MobileBottomNav from './components/MobileBottomNav';

// Lazy load components for better performance
const Auth = lazy(() => import('./pages/Auth'));
const Index = lazy(() => import('./pages/Index'));
const LiveTrades = lazy(() => import('./pages/LiveTrades'));
const AddTrade = lazy(() => import('./pages/AddTrade'));
const History = lazy(() => import('./pages/History'));
const Alarms = lazy(() => import('./pages/Alarms'));
const Journal = lazy(() => import('./pages/Journal'));
const TradeBuilder = lazy(() => import('./pages/TradeBuilder'));
const StrategyAnalyzer = lazy(() => import('./pages/StrategyAnalyzer'));
const Settings = lazy(() => import('./pages/Settings'));
const PerformanceCalendar = lazy(() => import('./pages/PerformanceCalendar'));
const MT4Connection = lazy(() => import('./pages/MT4Connection'));
const ValidationTest = lazy(() => import('./pages/ValidationTest'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AICoach = lazy(() => import('./pages/AICoach'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);

// Protected Route component - only checks if user exists (has completed onboarding)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If no user exists, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If onboarding not completed, show onboarding
  if (!user.onboardingCompleted) {
    return <Onboarding />;
  }

  return <>{children}</>;
};

// Layout wrapper for protected routes
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      {children}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Auth Route */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Main Routes - All protected by username/onboarding */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Index />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Bottom Navigation Routes */}
          <Route 
            path="/live-trades" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <LiveTrades />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/add-trade" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AddTrade />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <History />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/alarms" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Alarms />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />

          {/* Additional Feature Routes */}
          <Route 
            path="/journal" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Journal />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/trade-builder" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <TradeBuilder />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/strategy-analyzer" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <StrategyAnalyzer />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/performance-calendar" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PerformanceCalendar />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ai-coach" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AICoach />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/mt4-connection" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MT4Connection />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/validation-test" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ValidationTest />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        expand={true}
        richColors={true}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1B1E',
            color: '#FFFFFF',
            border: '1px solid #2A2B2E',
          },
          className: 'sonner-toast',
        }}
      />
    </div>
  );
}

export default App;
