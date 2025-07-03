import React, { Suspense, lazy, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useUser } from './contexts/UserContext';
import { useIsMobile } from './hooks/use-mobile';
import Onboarding from './components/Onboarding';
import MobileTopNav from './components/MobileTopNav';
import DebugInfo from './components/DebugInfo';
import { logger } from './lib/logger';

// Lazy load components for better performance with preloading
const Auth = lazy(() => import('./pages/Auth'));
const Index = lazy(() => import('./pages/Index'));
const News = lazy(() => import('./pages/News'));
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
const AIStrategyBuilder = lazy(() => import('./pages/AIStrategyBuilder'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const FunctionalTestSuite = lazy(() => import('./components/FunctionalTestSuite'));

// Enhanced loading component with better UX
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
      <p className="text-slate-400">{message}</p>
      <div className="mt-2 text-xs text-slate-500">Please wait...</div>
    </div>
  </div>
);

// Preload critical components for better performance
const preloadCriticalComponents = () => {
  // Preload main dashboard and auth
  const preloadAuth = () => import('./pages/Auth');
  const preloadIndex = () => import('./pages/Index');
  
  // Start preloading after initial load
  setTimeout(() => {
    preloadAuth();
    preloadIndex();
  }, 1000);
};

// Protected Route component with optimized loading
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useUser();
  
  logger.log('ProtectedRoute - user:', user, 'isLoading:', isLoading);

  // Show loading with timeout to prevent infinite loading
  if (isLoading) {
    logger.log('ProtectedRoute - showing loading spinner');
    return (
      <>
        <LoadingSpinner message="Loading your account..." />
        <DebugInfo user={user} isLoading={isLoading} error={null} />
      </>
    );
  }

  // If no user exists, redirect to auth
  if (!user) {
    logger.log('ProtectedRoute - no user, redirecting to auth');
    return (
      <>
        <Navigate to="/auth" replace />
        <DebugInfo user={user} isLoading={isLoading} error={null} />
      </>
    );
  }

  // If If onboarding not completed, show onboarding
  if (!user.onboardingCompleted) {
    logger.log('ProtectedRoute - onboarding not completed, showing onboarding');
    return (
      <>
        <Onboarding />
        <DebugInfo user={user} isLoading={isLoading} error={null} />
      </>
    );
  }

  logger.log('ProtectedRoute - user authenticated, showing children');
  return (
    <>
      {children}
      <DebugInfo user={user} isLoading={isLoading} error={null} />
    </>
  );
};

// Layout wrapper for protected routes with optimized touch handling
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const swipableRoutes = useMemo(() => [
    '/', // Dashboard
    '/news',
    '/live-trades',
    '/add-trade',
    '/history',
    '/alarms',
    '/journal',
    // Add other main routes here if they should be swipable
  ], []);

  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return; // Only enable on mobile

    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration > 300) return; // Ignore long touches

    const currentPathIndex = swipableRoutes.indexOf(location.pathname);
    if (currentPathIndex === -1) return; // Not a swipable route

    const threshold = 50; // Minimum swipe distance
    const swipeDistance = Math.abs(touchEndX - touchStartX);

    if (swipeDistance < threshold) return; // Not enough distance

    if (touchEndX < touchStartX - threshold) {
      // Swiped left (go to next page)
      if (currentPathIndex < swipableRoutes.length - 1) {
        navigate(swipableRoutes[currentPathIndex + 1]);
      }
    } else if (touchEndX > touchStartX + threshold) {
      // Swiped right (go to previous page)
      if (currentPathIndex > 0) {
        navigate(swipableRoutes[currentPathIndex - 1]);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#0A0B0D] text-white relative flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isMobile && <MobileTopNav />}
      <nav style={{ display: 'none' }} data-testid="nav"></nav>
      <main className="flex-1 relative z-10 overflow-y-auto pt-20" data-testid="main-content">
        {children}
      </main>
    </div>
  );
};

// Error Boundary Component with better error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#1a1a1a',
          color: 'white',
          padding: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1>🚨 React Error Detected</h1>
          <p>Something went wrong with the app:</p>
          <pre style={{ background: '#333', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Preload critical components on mount
  React.useEffect(() => {
    preloadCriticalComponents();
  }, []);

  // Global error handler
  React.useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // You could send this to an error reporting service
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You could send this to an error reporting service
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <Suspense fallback={<LoadingSpinner message="Loading app..." />}>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Index />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/news" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading news..." />}>
                    <News />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/live-trades" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading live trades..." />}>
                    <LiveTrades />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/add-trade" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading trade form..." />}>
                    <AddTrade />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading history..." />}>
                    <History />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/alarms" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading alarms..." />}>
                    <Alarms />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/journal" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading journal..." />}>
                    <Journal />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/trade-builder" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading trade builder..." />}>
                    <TradeBuilder />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/strategy-analyzer" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading strategy analyzer..." />}>
                    <StrategyAnalyzer />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
                    <Settings />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/performance-calendar" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading calendar..." />}>
                    <PerformanceCalendar />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/mt4-connection" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading MT4 connection..." />}>
                    <MT4Connection />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/validation-test" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading validation test..." />}>
                    <ValidationTest />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/ai-coach" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading AI coach..." />}>
                    <AICoach />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/ai-strategy-builder" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading AI strategy builder..." />}>
                    <AIStrategyBuilder />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/data-management" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading data management..." />}>
                    <DataManagement />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/functional-tests" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading functional tests..." />}>
                    <FunctionalTestSuite />
                  </Suspense>
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
