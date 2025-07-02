import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ErrorBoundary } from "react-error-boundary";
import Onboarding from "./components/Onboarding";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MT4Connection from "./pages/MT4Connection";
import Settings from "./pages/Settings";
import Journal from "./pages/Journal";
import TradeBuilder from "./pages/TradeBuilder";
import PerformanceCalendar from "./pages/PerformanceCalendar";
import StrategyAnalyzer from "./pages/StrategyAnalyzer";
import NotFound from "./pages/NotFound";
import MobileBottomNav from "./components/MobileBottomNav";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Quantum Risk Coach...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Auth />;
  }
  
  if (!user.onboardingCompleted) {
    return <Onboarding />;
  }
  
  return <>{children}</>;
};

// App Content Component
const AppContent = () => {
  const { user, isLoading } = useUser();
  const location = useLocation();
  
  // Show loading during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Quantum Risk Coach...</p>
        </div>
      </div>
    );
  }
  
  // Define valid routes
  const validRoutes = [
    '/',
    '/auth',
    '/connect-mt4',
    '/connect-mt5', 
    '/connect-ctrader',
    '/connect-tradingview',
    '/settings',
    '/journal',
    '/journal/add',
    '/journal/analytics',
    '/journal/tags',
    '/journal/export',
    '/trade-builder',
    '/performance-calendar',
    '/strategy-analyzer'
  ];
  
  // Check if current route is valid
  const isValidRoute = validRoutes.some(route => {
    if (route === '/') return location.pathname === '/';
    return location.pathname === route || location.pathname.startsWith(route + '/');
  });
  
  // If route is invalid, show 404
  if (!isValidRoute) {
    return <NotFound />;
  }
  
  // If user is not authenticated and trying to access protected routes, show auth
  if (!user && location.pathname !== '/auth') {
    return <Auth />;
  }
  
  // If user is authenticated but hasn't completed onboarding, show onboarding
  if (user && !user.onboardingCompleted) {
    return <Onboarding />;
  }
  
  // Show main app
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/connect-mt4" element={<MT4Connection />} />
        <Route path="/connect-mt5" element={<MT4Connection platform="MT5" />} />
        <Route path="/connect-ctrader" element={<MT4Connection platform="cTrader" />} />
        <Route path="/connect-tradingview" element={<MT4Connection platform="TradingView" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/add" element={<Journal defaultTab="add" />} />
        <Route path="/journal/analytics" element={<Journal defaultTab="analytics" />} />
        <Route path="/journal/tags" element={<Journal defaultTab="tags" />} />
        <Route path="/journal/export" element={<Journal defaultTab="export" />} />
        <Route path="/trade-builder" element={<TradeBuilder />} />
        <Route path="/performance-calendar" element={<PerformanceCalendar />} />
        <Route path="/strategy-analyzer" element={<StrategyAnalyzer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MobileBottomNav />
    </div>
  );
};

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
        <p className="text-slate-400 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
