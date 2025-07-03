import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './lib/localUserUtils'
import { performanceMonitor } from './lib/performanceMonitor'
import { UserProvider } from './contexts/UserContext'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { pushNotificationService } from './lib/pushNotificationService'

// Register service worker for caching and offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker registration failed:', error);
      });
  });
}

// Initialize performance monitoring
performanceMonitor.mark('app-start');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const queryClient = new QueryClient();
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <PortfolioProvider>
              <App />
            </PortfolioProvider>
          </UserProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering React app:', error);
  document.body.innerHTML = `
    <div style="color: white; padding: 20px; background: #1a1a1a; min-height: 100vh;">
      <h1>Error Loading App</h1>
      <p>There was an error loading the application:</p>
      <pre>${error}</pre>
    </div>
  `;
}

// Mark app as loaded
performanceMonitor.mark('app-loaded');
performanceMonitor.measure('app-initialization', 'app-start', 'app-loaded');

// Expose push notification service globally for testing
if (typeof window !== 'undefined') {
  (window as any).pushNotificationService = pushNotificationService;
}
