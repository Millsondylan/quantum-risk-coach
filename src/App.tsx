import React, { Suspense, lazy, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useUser } from './contexts/UserContext';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import TopHeader from './components/TopHeader';
import DebugInfo from './components/DebugInfo';
import { logger } from './lib/logger';
import { Plus } from 'lucide-react';
import AutoTestSuite from './pages/AutoTestSuite';

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
const PortfolioTracker = lazy(() => import('./components/PortfolioTracker'));

const ValidationTest = lazy(() => import('./pages/ValidationTest'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AICoach = lazy(() => import('./pages/AICoach'));
const AIStrategyBuilder = lazy(() => import('./pages/AIStrategyBuilder'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const FunctionalTestSuite = lazy(() => import('./components/FunctionalTestSuite'));
const TestPage = lazy(() => import('./pages/TestPage'));
const SimpleTest = lazy(() => import('./pages/SimpleTest'));
const MinimalTest = lazy(() => import('./pages/MinimalTest'));

// Enhanced loading component with better UX
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-700 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-white font-medium text-lg">{message}</p>
        <p className="text-slate-400 text-sm">Please wait while we prepare your trading dashboard...</p>
      </div>
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

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useUser();

  // Show loading spinner
  if (isLoading) {
    return <LoadingSpinner message="Loading user data..." />;
  }

  // If no user exists, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If onboarding not completed, show onboarding
  if (!user.onboardingCompleted) {
    return <Onboarding />;
  }

  // User authenticated, show protected content
  return <>{children}</>;
};

// Layout wrapper for protected routes with optimized touch handling
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative flex flex-col">
      <TopHeader />
      <nav style={{ display: 'none' }} data-testid="nav"></nav>
      <main className="flex-1 relative z-10 overflow-y-auto pt-[6.5rem] pb-20 w-full scroll-smooth" data-testid="main-content">
        <div className="container mx-auto px-4 max-w-7xl w-full">
          {children}
        </div>
      </main>
      
      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/add-trade')}
        className="fab"
        style={{ boxShadow: '0 4px 20px rgba(78, 78, 255, 0.5)' }}
      >
        <Plus className="w-6 h-6" />
      </button>
      
      <BottomNav />
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
            <Route path="/test" element={<TestPage />} />
            <Route path="/simple" element={<SimpleTest />} />
            <Route path="/minimal" element={<MinimalTest />} />
            
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
            
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingSpinner message="Loading portfolio..." />}>
                    <PortfolioTracker />
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
            
            <Route path="/auto-test" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AutoTestSuite />
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
