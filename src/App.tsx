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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component with error handling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  try {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/auth" replace />;
  }
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="/trade-builder" element={
                <ProtectedRoute>
                  <TradeBuilder />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
