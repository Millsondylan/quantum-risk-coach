// Service Worker for Push Notifications
// Quantum Risk Coach - Trading Notifications

const CACHE_NAME = 'quantum-risk-coach-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request);
      })
      .catch(error => {
        console.error('Service Worker: Fetch failed', error);
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received');
  
  let notificationData = {
    title: 'Quantum Risk Coach',
    body: 'You have a new trading alert!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'trading-alert',
    requireInteraction: false,
    data: {}
  };
  
  // Parse push payload if available
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload
      };
    } catch (error) {
      console.error('Service Worker: Failed to parse push payload', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }
  
  // Customize notification based on type
  if (notificationData.type) {
    switch (notificationData.type) {
      case 'price_alert':
        notificationData.icon = '/favicon.ico';
        notificationData.tag = 'price-alert';
        notificationData.requireInteraction = true;
        break;
      case 'news_alert':
        notificationData.icon = '/favicon.ico';
        notificationData.tag = 'news-alert';
        break;
      case 'ai_insight':
        notificationData.icon = '/favicon.ico';
        notificationData.tag = 'ai-insight';
        break;
      case 'risk_warning':
        notificationData.icon = '/favicon.ico';
        notificationData.tag = 'risk-warning';
        notificationData.requireInteraction = true;
        break;
    }
  }
  
  // Add action buttons for interactive notifications
  if (notificationData.type === 'price_alert' || notificationData.type === 'risk_warning') {
    notificationData.actions = [
      {
        action: 'view',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ];
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  const notification = event.notification;
  const action = event.action;
  
  notification.close();
  
  // Handle action buttons
  if (action === 'dismiss') {
    return;
  }
  
  // Default action or 'view' action - open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            
            // Send message to client if notification has data
            if (notification.data) {
              client.postMessage({
                type: 'notification_click',
                data: notification.data
              });
            }
            
            return;
          }
        }
        
        // Open new window if app is not open
        return clients.openWindow('/');
      })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-trades') {
    event.waitUntil(syncTrades());
  }
  
  if (event.tag === 'background-sync-market-data') {
    event.waitUntil(syncMarketData());
  }
});

// Sync functions
async function syncTrades() {
  try {
    console.log('Service Worker: Syncing trades...');
    // This would sync pending trades when back online
    // Implementation would depend on your data structure
  } catch (error) {
    console.error('Service Worker: Failed to sync trades', error);
  }
}

async function syncMarketData() {
  try {
    console.log('Service Worker: Syncing market data...');
    // This would fetch latest market data when back online
    // Implementation would depend on your data structure
  } catch (error) {
    console.error('Service Worker: Failed to sync market data', error);
  }
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (requires registration)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'market-data-sync') {
    event.waitUntil(syncMarketData());
  }
}); 