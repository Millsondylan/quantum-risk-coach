import React, { Suspense, lazy, memo } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { UserProvider, useUser } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "react-error-boundary";
import MobileBottomNav from "./components/MobileBottomNav";

// Lazy load components for better performance
const Onboarding = lazy(() => import("./components/Onboarding"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const MT4Connection = lazy(() => import("./pages/MT4Connection"));
const Settings = lazy(() => import("./pages/Settings"));
const Journal = lazy(() => import("./pages/Journal"));
const TradeBuilder = lazy(() => import("./pages/TradeBuilder"));
const PerformanceCalendar = lazy(() => import("./pages/PerformanceCalendar"));
const StrategyAnalyzer = lazy(() => import("./pages/StrategyAnalyzer"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MT4MT5AutoSyncDashboard = lazy(() => import("./components/MT4MT5AutoSyncDashboard"));
const LiveTrades = lazy(() => import('./pages/LiveTrades'));
const AddTrade = lazy(() => import('./pages/AddTrade'));
const History = lazy(() => import('./pages/History'));
const Alarms = lazy(() => import('./pages/Alarms'));

// Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading component with better UX
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4" />
      <p className="text-slate-400">Loading Qlarity...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Protected Route Component with memoization
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

// App Content Component with optimized rendering
const AppContent = memo(() => {
  const { user, isLoading } = useUser();
  
  // Show loading during initialization
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Show main app with proper routing
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Home: show auth page for non-authenticated users */}
          <Route path="/" element={user ? <Index /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/connect-mt4" element={
            <ProtectedRoute>
              <MT4Connection />
            </ProtectedRoute>
          } />
          <Route path="/connect-mt5" element={
            <ProtectedRoute>
              <MT4Connection platform="MT5" />
            </ProtectedRoute>
          } />
          <Route path="/connect-ctrader" element={
            <ProtectedRoute>
              <MT4Connection platform="cTrader" />
            </ProtectedRoute>
          } />
          <Route path="/connect-tradingview" element={
            <ProtectedRoute>
              <MT4Connection platform="TradingView" />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          } />
          <Route path="/journal/add" element={
            <ProtectedRoute>
              <Journal defaultTab="add" />
            </ProtectedRoute>
          } />
          <Route path="/journal/analytics" element={
            <ProtectedRoute>
              <Journal defaultTab="analytics" />
            </ProtectedRoute>
          } />
          <Route path="/journal/tags" element={
            <ProtectedRoute>
              <Journal defaultTab="tags" />
            </ProtectedRoute>
          } />
          <Route path="/journal/export" element={
            <ProtectedRoute>
              <Journal defaultTab="export" />
            </ProtectedRoute>
          } />
          <Route path="/trade-builder" element={
            <ProtectedRoute>
              <TradeBuilder />
            </ProtectedRoute>
          } />
          <Route path="/performance-calendar" element={
            <ProtectedRoute>
              <PerformanceCalendar />
            </ProtectedRoute>
          } />
          <Route path="/strategy-analyzer" element={
            <ProtectedRoute>
              <StrategyAnalyzer />
            </ProtectedRoute>
          } />
          <Route path="/mt4mt5-sync" element={
            <ProtectedRoute>
              <MT4MT5AutoSyncDashboard />
            </ProtectedRoute>
          } />
          <Route path="/live-trades" element={<ProtectedRoute><LiveTrades /></ProtectedRoute>} />
          <Route path="/add-trade" element={<ProtectedRoute><AddTrade /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/alarms" element={<ProtectedRoute><Alarms /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isLoading && user && <MobileBottomNav />}
    </div>
  );
});

AppContent.displayName = 'AppContent';

// Error Fallback Component
const ErrorFallback = memo(({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
        <p className="text-slate-400 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

// Main App Component
const App = memo(() => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </ErrorBoundary>
            </TooltipProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
});

App.displayName = 'App';

export default App;
