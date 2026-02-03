/**
 * ADVANCED LAZY LOADING SYSTEM
 * Intersection Observer-based lazy loading for images, components, and features
 * with progressive enhancement and performance budgets
 */

class LazyLoadManager {
  constructor() {
    this.observers = new Map();
    this.performanceBudget = null;
    this.loadedAssets = {
      images: 0,
      components: 0,
      features: 0,
      totalSize: 0
    };
    this.webpSupported = null;
    
    this.init();
  }

  async init() {
    try {
      // Load performance budget configuration
      this.performanceBudget = await this.loadPerformanceBudget();
      
      // Initialize observers
      this.setupImageLazyLoading();
      this.setupComponentLazyLoading();
      this.setupFeatureLazyLoading();
      
      // Monitor performance
      this.setupPerformanceMonitoring();
      
    } catch (error) {
      console.warn('LazyLoadManager initialization failed:', error);
      this.fallbackToEagerLoading();
    }
  }

  async loadPerformanceBudget() {
    try {
      const response = await fetch('/performance-budget.json');
      return await response.json();
    } catch {
      // Fallback budget
      return {
        budgets: {
          mobile: { thresholds: { secondary: { totalImages: 500 } } },
          tablet: { thresholds: { secondary: { totalImages: 800 } } },
          desktop: { thresholds: { secondary: { totalImages: 1200 } } }
        }
      };
    }
  }

  getDeviceCategory() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getBudgetForDevice() {
    const device = this.getDeviceCategory();
    return this.performanceBudget?.budgets?.[device] || 
           this.performanceBudget?.budgets?.mobile || 
           { thresholds: { secondary: { totalImages: 500 } } };
  }

  setupImageLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '100px 0px',
      threshold: 0.01
    });

    this.observers.set('images', imageObserver);

    // Observe all lazy images
    document.querySelectorAll('img[data-lazy-src], img[loading="lazy"]').forEach(img => {
      this.prepareImageForLazyLoading(img);
      imageObserver.observe(img);
    });
  }

  prepareImageForLazyLoading(img) {
    // Store original src
    if (img.src && !img.dataset.lazySrc) {
      img.dataset.lazySrc = img.src;
    }
    
    // Create placeholder
    if (!img.src || img.src === img.dataset.lazySrc) {
      img.src = this.createPlaceholder(img);
    }
    
    // Add loading class
    img.classList.add('lazy-loading');
    
    // Set up responsive images if data-sizes exists
    if (img.dataset.sizes) {
      this.setupResponsiveImage(img);
    }
  }

  createPlaceholder(img) {
    const width = parseInt(img.dataset.width) || 400;
    const height = parseInt(img.dataset.height) || 300;
    
    // SVG placeholder with cyberpunk theme
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6E0DD0" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#00F5D4" stop-opacity="0.1"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#6E0DD0" stroke-width="2" stroke-dasharray="5,5" opacity="0.3">
          <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
        </rect>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#00F5D4" font-family="Orbitron, monospace" font-size="14" opacity="0.7">Loading...</text>
      </svg>
    `)}`;
  }

  setupResponsiveImage(img) {
    const sizes = JSON.parse(img.dataset.sizes);
    const deviceCategory = this.getDeviceCategory();
    const connection = this.getConnectionQuality();
    
    // Select appropriate image size based on device and connection
    let selectedSize;
    if (connection === 'slow' && sizes.small) {
      selectedSize = sizes.small;
    } else if (deviceCategory === 'mobile' && sizes.medium) {
      selectedSize = sizes.medium;
    } else if (sizes.large) {
      selectedSize = sizes.large;
    } else {
      selectedSize = sizes.medium || sizes.small;
    }
    
    if (selectedSize) {
      img.dataset.lazySrc = selectedSize;
    }
  }

  getConnectionQuality() {
    if (navigator.connection) {
      const effectiveType = navigator.connection.effectiveType;
      if (['slow-2g', '2g'].includes(effectiveType)) return 'slow';
      if (effectiveType === '3g') return 'medium';
      return 'fast';
    }
    return 'medium'; // Default assumption
  }

  async loadImage(img) {
    const budget = this.getBudgetForDevice();
    const imageBudget = budget.thresholds?.secondary?.totalImages || 500;
    
    // Check budget
    if (this.loadedAssets.totalSize > imageBudget * 1024) {
      console.warn('Image budget exceeded, skipping non-critical image');
      if (!img.dataset.critical) return;
    }
    
    const src = img.dataset.lazySrc || img.src;
    if (!src) return;
    
    try {
      // Preload image
      const imageLoader = new Image();
      
      const loadPromise = new Promise((resolve, reject) => {
        imageLoader.onload = () => {
          // Update loaded assets tracking
          this.loadedAssets.images++;
          
          // Apply loaded image
          img.src = src;
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          // Trigger load animation
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.3s ease';
          
          requestAnimationFrame(() => {
            img.style.opacity = '1';
          });
          
          // Set up WebP/AVIF format detection
          this.optimizeImageFormat(img);
          
          resolve();
        };
        
        imageLoader.onerror = reject;
        
        // Add timeout for slow connections
        setTimeout(() => reject(new Error('Image load timeout')), 10000);
      });
      
      imageLoader.src = src;
      await loadPromise;
      
    } catch (error) {
      console.warn('Failed to load image:', src, error);
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      
      // Show error placeholder
      img.alt = img.alt || 'Image failed to load';
    }
  }

  optimizeImageFormat(img) {
    // Check if browser supports modern formats
    if (this.supportsWebP() && !img.src.includes('.webp')) {
      const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Test if WebP version exists
      const tester = new Image();
      tester.onload = () => {
        img.src = webpSrc;
      };
      tester.onerror = () => {
        // WebP not available, keep original
      };
      tester.src = webpSrc;
    }
  }

  supportsWebP() {
    if (this.webpSupported !== null) {
      return this.webpSupported;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    this.webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return this.webpSupported;
  }

  setupComponentLazyLoading() {
    const componentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadComponent(entry.target);
          componentObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px 0px',
      threshold: 0.1
    });

    this.observers.set('components', componentObserver);

    // Observe lazy components
    document.querySelectorAll('[data-lazy-component]').forEach(component => {
      componentObserver.observe(component);
    });
  }

  async loadComponent(element) {
    const componentName = element.dataset.lazyComponent;
    const componentConfig = element.dataset.componentConfig;
    
    try {
      // Show loading state
      element.classList.add('component-loading');
      
      // Dynamically import component
      const module = await import(`/js/components/${componentName}.js`);
      const Component = module.default || module[componentName];
      
      if (Component) {
        const config = componentConfig ? JSON.parse(componentConfig) : {};
        const instance = new Component(element, config);
        
        if (instance.init) {
          await instance.init();
        }
        
        element.classList.remove('component-loading');
        element.classList.add('component-loaded');
        
        this.loadedAssets.components++;
      }
      
    } catch (error) {
      console.warn(`Failed to load component ${componentName}:`, error);
      element.classList.remove('component-loading');
      element.classList.add('component-error');
    }
  }

  setupFeatureLazyLoading() {
    const featureObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadFeature(entry.target);
          featureObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '300px 0px',
      threshold: 0.05
    });

    this.observers.set('features', featureObserver);

    // Observe feature containers
    document.querySelectorAll('[data-lazy-feature]').forEach(feature => {
      featureObserver.observe(feature);
    });
  }

  async loadFeature(element) {
    const featureName = element.dataset.lazyFeature;
    const budget = this.getBudgetForDevice();
    const featureBudget = this.performanceBudget?.features?.[featureName];
    
    // Check if feature is within budget
    if (featureBudget && !this.isFeatureWithinBudget(featureBudget, budget)) {
      console.log(`Feature ${featureName} skipped due to budget constraints`);
      return;
    }
    
    try {
      element.classList.add('feature-loading');
      
      // Load feature module
      const module = await import(`/js/features/${featureName}.js`);
      const Feature = module.default || module[featureName];
      
      if (Feature) {
        const instance = new Feature(element);
        
        if (instance.init) {
          await instance.init();
        }
        
        element.classList.remove('feature-loading');
        element.classList.add('feature-loaded');
        
        this.loadedAssets.features++;
      }
      
    } catch (error) {
      console.warn(`Failed to load feature ${featureName}:`, error);
      element.classList.remove('feature-loading');
      element.classList.add('feature-error');
    }
  }

  isFeatureWithinBudget(featureBudget, deviceBudget) {
    const jsRemaining = (deviceBudget.thresholds?.secondary?.totalJavaScript || 300) - this.loadedAssets.totalSize;
    return jsRemaining >= (featureBudget.budget?.js || 0);
  }

  setupPerformanceMonitoring() {
    // Monitor asset loading
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.initiatorType === 'img') {
          this.loadedAssets.totalSize += entry.transferSize || 0;
        }
      });
    });
    
    perfObserver.observe({ entryTypes: ['resource'] });
    
    // Report metrics periodically
    setInterval(() => {
      this.reportMetrics();
    }, 30000);
  }

  reportMetrics() {
    const metrics = {
      timestamp: Date.now(),
      loadedAssets: this.loadedAssets,
      budget: this.getBudgetForDevice(),
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        memory: performance.memory
      }
    };
    
    // Send to analytics or log locally
    console.log('LazyLoad Metrics:', metrics);
    
    // Dispatch custom event for external monitoring
    document.dispatchEvent(new CustomEvent('lazy-load-metrics', {
      detail: metrics
    }));
  }

  fallbackToEagerLoading() {
    // Fallback: load all images immediately
    document.querySelectorAll('img[data-lazy-src]').forEach(img => {
      if (img.dataset.lazySrc) {
        img.src = img.dataset.lazySrc;
      }
    });
    
    console.warn('Lazy loading failed, falling back to eager loading');
  }

  // Public API for manual triggering
  forceLoadImages(selector = 'img[data-lazy-src]') {
    document.querySelectorAll(selector).forEach(img => {
      this.loadImage(img);
    });
  }

  forceLoadComponents(selector = '[data-lazy-component]') {
    document.querySelectorAll(selector).forEach(component => {
      this.loadComponent(component);
    });
  }

  // Cleanup method
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.lazyLoadManager = new LazyLoadManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoadManager;
}
