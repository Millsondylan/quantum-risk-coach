import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import FallbackApp from './components/FallbackApp.tsx'
import './index.css'
import './lib/localUserUtils'
import { performanceMonitor } from './lib/performanceMonitor'
import { UserProvider } from './contexts/UserContext'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { pushNotificationService } from './lib/pushNotificationService'
import { AuthProvider } from './contexts/AuthContext'
import { logger } from './lib/logger'

// Register service worker for caching and offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.log('✅ Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker registration failed:', error);
      });
  });
}

// Initialize performance monitoring
performanceMonitor.mark('app-start');

try {
  logger.log('🚀 Starting React app initialization...');
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  logger.log('✅ Root element found:', rootElement);
  
  const queryClient = new QueryClient();
  const root = ReactDOM.createRoot(rootElement);
  logger.log('✅ React root created');
  
  logger.log('🎬 Rendering React app...');
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <UserProvider>
              <PortfolioProvider>
                <App />
              </PortfolioProvider>
            </UserProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  logger.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  // Show error on page
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: white; padding: 20px; background: #1a1a1a; min-height: 100vh; font-family: Arial, sans-serif;">
        <h1>🚨 App Loading Error</h1>
        <p>There was an error loading the application:</p>
        <pre style="background: #333; padding: 10px; border-radius: 5px; overflow: auto;">${error}</pre>
        <button onclick="window.location.reload()" style="background: #3B82F6; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; cursor: pointer;">
          Reload App
        </button>
      </div>
    `;
  }
}

// Mark app as loaded
performanceMonitor.mark('app-loaded');
performanceMonitor.measure('app-initialization', 'app-start', 'app-loaded');

// Expose push notification service globally for testing
if (typeof window !== 'undefined') {
  (window as any).pushNotificationService = pushNotificationService;
}
