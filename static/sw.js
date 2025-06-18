/**
 * PERFORMANCE-OPTIMIZED SERVICE WORKER
 * Advanced caching, offline functionality, and performance monitoring
 */

const VERSION = '2.0.0';
const CACHE_NAME = `hugo-author-v${VERSION}`;
const RUNTIME_CACHE = `runtime-cache-v${VERSION}`;
const IMAGE_CACHE = `images-v${VERSION}`;
const API_CACHE = `api-v${VERSION}`;

// Performance-optimized critical resources
const CRITICAL_RESOURCES = [
  '/',
  '/css/critical-enhanced.css',
  '/css/main.css',
  '/js/lazy-loading.js',
  '/js/code-splitting.js',
  '/js/environment-optimizer.js',
  '/js/main.js',
  '/offline/',
  '/manifest.json',
  '/performance-budget.json'
];

// Performance-aware cache configuration
const PERFORMANCE_CONFIG = {
  maxAge: {
    images: 30 * 24 * 60 * 60 * 1000,    // 30 days
    css: 7 * 24 * 60 * 60 * 1000,        // 7 days
    js: 7 * 24 * 60 * 60 * 1000,         // 7 days
    pages: 24 * 60 * 60 * 1000,          // 1 day
    api: 60 * 60 * 1000                  // 1 hour
  },
  maxEntries: {
    images: 100,
    pages: 50,
    api: 20,
    css: 10,
    js: 20
  },
  networkTimeouts: {
    slow: 3000,     // 3G and slower
    fast: 1000      // 4G and faster
  }
};

// Detect connection speed for adaptive caching
let connectionSpeed = 'fast';
if ('connection' in navigator) {
  const connection = navigator.connection;
  const slowConnections = ['slow-2g', '2g', '3g'];
  connectionSpeed = slowConnections.includes(connection.effectiveType) ? 'slow' : 'fast';
}

// Resources to cache on runtime
const RUNTIME_CACHE_URLS = [
  '/books/',
  '/stories/',
  '/audio/',
  '/posts/',
  '/about/',
  '/newsletter/'
];

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  images: PERFORMANCE_CONFIG.maxEntries.images,
  pages: PERFORMANCE_CONFIG.maxEntries.pages,
  api: PERFORMANCE_CONFIG.maxEntries.api
};

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different resource types
  if (url.pathname.match(/\.(css|js)$/)) {
    event.respondWith(handleStaticAssets(request));
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    event.respondWith(handleImages(request));
  } else if (url.pathname.match(/^\/api\//)) {
    event.respondWith(handleAPI(request));
  } else {
    event.respondWith(handlePages(request));
  }
});

/**
 * Cache first strategy for static assets (CSS, JS)
 */
async function handleStaticAssets(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Return cached version immediately
      fetchAndUpdateCache(request, cache);
      return cachedResponse;
    }
    
    // Fetch and cache if not found
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Static asset fetch failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Cache first with size limit for images
 */
async function handleImages(request) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
      // Check cache size before adding
      await manageCacheSize(cache, 'images', MAX_CACHE_SIZE.images);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Image fetch failed:', error);
    // Return placeholder image
    return new Response(createPlaceholderSVG(), {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

/**
 * Network first strategy for API calls
 */
async function handleAPI(request) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      await manageCacheSize(cache, 'api', MAX_CACHE_SIZE.api);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'API not available offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Stale while revalidate for pages
 */
async function handlePages(request) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Fetch fresh version in background
    const fetchPromise = fetch(request)
      .then(response => {
        if (response.status === 200) {
          manageCacheSize(cache, 'pages', MAX_CACHE_SIZE.pages);
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);
    
    // Return cached version immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Wait for network if no cache
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Return offline page as fallback
    return await caches.match('/offline/') || new Response('Page not available offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Page fetch failed:', error);
    return await caches.match('/offline/') || new Response('Page not available offline', {
      status: 503
    });
  }
}

/**
 * Background fetch and update cache
 */
async function fetchAndUpdateCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.log('Background fetch failed:', error);
  }
}

/**
 * Manage cache size by removing oldest entries
 */
async function manageCacheSize(cache, type, maxSize) {
  const keys = await cache.keys();
  const typeKeys = keys.filter(key => {
    const url = new URL(key.url);
    switch (type) {
      case 'images':
        return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/);
      case 'pages':
        return !url.pathname.match(/\.(css|js|jpg|jpeg|png|gif|webp|svg)$/) && !url.pathname.match(/^\/api\//);
      case 'api':
        return url.pathname.match(/^\/api\//);
      default:
        return false;
    }
  });
  
  if (typeKeys.length >= maxSize) {
    // Remove oldest entries (FIFO)
    const toDelete = typeKeys.slice(0, typeKeys.length - maxSize + 1);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

/**
 * Create placeholder SVG for failed image loads
 */
function createPlaceholderSVG() {
  return `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#2D0F54"/>
      <text x="50%" y="50%" font-family="Orbitron, monospace" font-size="16" 
            fill="#00F5D4" text-anchor="middle" dominant-baseline="middle">
        Image Offline
      </text>
    </svg>
  `;
}

/**
 * Background sync for form submissions
 */
self.addEventListener('sync', event => {
  if (event.tag === 'newsletter-signup') {
    event.waitUntil(handleNewsletterSync());
  }
});

/**
 * Handle newsletter signup when back online
 */
async function handleNewsletterSync() {
  try {
    const stored = await getStoredNewsletterSignups();
    
    for (const signup of stored) {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signup)
      });
      
      if (response.ok) {
        await removeStoredSignup(signup.id);
      }
    }
  } catch (error) {
    console.error('Newsletter sync failed:', error);
  }
}

/**
 * Handle push notifications
 */
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icon-192.png',
    badge: '/images/icon-badge.png',
    data: data.url,
    actions: [
      {
        action: 'open',
        title: 'Read More',
        icon: '/images/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/images/action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

/**
 * Utility functions for IndexedDB storage
 */
async function getStoredNewsletterSignups() {
  // Implementation for IndexedDB storage
  return [];
}

async function removeStoredSignup(id) {
  // Implementation for removing from IndexedDB
}

/**
 * Performance monitoring
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Log performance metrics
    console.log('Performance metrics:', event.data.metrics);
    
    // Send to analytics if available
    if (event.data.metrics.lcp > 2500) {
      console.warn('LCP is slow:', event.data.metrics.lcp);
    }
  }
});
