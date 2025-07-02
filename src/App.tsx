import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MT4Connection from "./pages/MT4Connection";
import Settings from "./pages/Settings";
import Journal from "./pages/Journal";
import TradeBuilder from "./pages/TradeBuilder";
import PerformanceCalendar from "./pages/PerformanceCalendar";
import StrategyAnalyzer from "./pages/StrategyAnalyzer";
import NotFound from "./pages/NotFound";
import AuthDebug from "./pages/AuthDebug";
import MobileBottomNav from "./components/MobileBottomNav";
import { authDebug } from "@/lib/authDebug";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component with improved error handling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, initialized } = useAuth();
  
  console.log('ProtectedRoute - loading:', loading, 'initialized:', initialized, 'user:', user?.email);
  
  // Show simple loading during initialization
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Quantum Risk Coach...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to auth if no user
  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Make debug functions globally available
  if (typeof window !== 'undefined') {
    (window as any).authDebug = authDebug;
    (window as any).runAuthDiagnostic = authDebug.runFullDiagnostic;
    (window as any).testSignup = authDebug.testSpecificSignup;
    (window as any).testSignin = authDebug.testSpecificSignin;
    (window as any).checkCurrentUser = authDebug.checkCurrentUser;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
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
                <Route path="/debug" element={<AuthDebug />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileBottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
