/**
 * ENVIRONMENT-SPECIFIC OPTIMIZATION CONFIGURATION
 * Manages feature loading and optimization based on deployment environment
 */

class EnvironmentOptimizer {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.getEnvironmentConfig();
    this.optimizations = new Map();
    
    this.init();
  }  detectEnvironment() {
    // Hugo environment variable injection - will be replaced during build
    const hugoEnv = '{{ hugo.Environment }}' || 'production';
    
    // Additional environment detection
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('netlify.app') || hostname.includes('vercel.app')) {
      return 'preview';
    } else {
      return hugoEnv;
    }
  }

  getEnvironmentConfig() {
    const configs = {
      development: {
        description: 'Development environment with debugging enabled',
        features: {
          debugging: true,
          sourceMap: true,
          hotReload: true,
          performanceWarnings: true,
          bundleAnalysis: true,
          mockData: true
        },
        optimization: {
          minification: false,
          compression: false,
          caching: false,
          lazyLoading: false, // Disable for easier debugging
          codeSplitting: false,
          imageOptimization: false
        },
        performance: {
          budgetEnforcement: false,
          metricCollection: true,
          errorReporting: true,
          verbose: true
        },
        assets: {
          cssSourceMaps: true,
          jsSourceMaps: true,
          unminified: true,
          separateFiles: true
        }
      },

      staging: {
        description: 'Staging environment for testing optimizations',
        features: {
          debugging: true,
          sourceMap: true,
          hotReload: false,
          performanceWarnings: true,
          bundleAnalysis: true,
          mockData: false
        },
        optimization: {
          minification: true,
          compression: true,
          caching: true,
          lazyLoading: true,
          codeSplitting: true,
          imageOptimization: true
        },
        performance: {
          budgetEnforcement: true,
          metricCollection: true,
          errorReporting: true,
          verbose: true
        },
        assets: {
          cssSourceMaps: true,
          jsSourceMaps: true,
          unminified: false,
          separateFiles: false
        }
      },

      preview: {
        description: 'Preview environment (Netlify Deploy Previews, etc.)',
        features: {
          debugging: false,
          sourceMap: false,
          hotReload: false,
          performanceWarnings: false,
          bundleAnalysis: false,
          mockData: false
        },
        optimization: {
          minification: true,
          compression: true,
          caching: true,
          lazyLoading: true,
          codeSplitting: true,
          imageOptimization: true
        },
        performance: {
          budgetEnforcement: true,
          metricCollection: true,
          errorReporting: false,
          verbose: false
        },
        assets: {
          cssSourceMaps: false,
          jsSourceMaps: false,
          unminified: false,
          separateFiles: false
        }
      },

      production: {
        description: 'Production environment with maximum optimization',
        features: {
          debugging: false,
          sourceMap: false,
          hotReload: false,
          performanceWarnings: false,
          bundleAnalysis: false,
          mockData: false
        },
        optimization: {
          minification: true,
          compression: true,
          caching: true,
          lazyLoading: true,
          codeSplitting: true,
          imageOptimization: true,
          preloading: true,
          serviceWorker: true
        },
        performance: {
          budgetEnforcement: true,
          metricCollection: true,
          errorReporting: true,
          verbose: false,
          analyticsIntegration: true
        },
        assets: {
          cssSourceMaps: false,
          jsSourceMaps: false,
          unminified: false,
          separateFiles: false,
          cdn: true,
          longTermCaching: true
        }
      }
    };

    return configs[this.environment] || configs.production;
  }

  init() {
    console.log(`Environment: ${this.environment}`, this.config);
    
    // Apply environment-specific optimizations
    this.applyGlobalOptimizations();
    this.setupAssetLoading();
    this.configurePerformanceMonitoring();
    this.setupErrorHandling();
    this.configureFeatureFlags();
    
    // Expose environment info globally
    window.environment = {
      name: this.environment,
      config: this.config,
      optimizer: this
    };
    
    // Dispatch environment ready event
    document.dispatchEvent(new CustomEvent('environment-ready', {
      detail: { environment: this.environment, config: this.config }
    }));
  }

  applyGlobalOptimizations() {
    const body = document.body;
    const html = document.documentElement;
    
    // Add environment class
    html.classList.add(`env-${this.environment}`);
    
    // Apply optimization classes based on config
    if (this.config.optimization.lazyLoading) {
      body.classList.add('lazy-loading-enabled');
    }
    
    if (this.config.optimization.codeSplitting) {
      body.classList.add('code-splitting-enabled');
    }
    
    if (this.config.performance.budgetEnforcement) {
      body.classList.add('budget-enforcement-enabled');
    }
    
    if (this.config.features.debugging) {
      body.classList.add('debug-mode');
      // Enable debug overlays
      this.enableDebugOverlays();
    }
    
    // Configure animations based on environment
    if (this.environment === 'development') {
      // Slower animations for debugging
      document.documentElement.style.setProperty('--animation-speed-multiplier', '0.5');
    } else if (this.environment === 'production') {
      // Optimized animations
      document.documentElement.style.setProperty('--animation-speed-multiplier', '1.0');
    }
  }

  setupAssetLoading() {
    if (this.config.optimization.lazyLoading) {
      // Enable lazy loading
      this.enableLazyLoading();
    }
    
    if (this.config.optimization.preloading) {
      // Setup critical resource preloading
      this.setupPreloading();
    }
    
    if (this.config.assets.cdn && this.environment === 'production') {
      // Configure CDN usage
      this.configureCDN();
    }
  }

  enableLazyLoading() {
    // Initialize lazy loading if not already done
    if (!window.lazyLoadManager) {
      import('/js/lazy-loading.js').then(module => {
        window.lazyLoadManager = new module.default();
      });
    }
  }

  setupPreloading() {
    // Preload critical resources based on current page
    const criticalResources = this.getCriticalResourcesForPage();
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = resource.type === 'script' ? 'modulepreload' : 'preload';
      link.href = resource.url;
      if (resource.type !== 'script') {
        link.as = resource.type;
      }
      document.head.appendChild(link);
    });
  }

  getCriticalResourcesForPage() {
    const path = window.location.pathname;
    const resources = [];
    
    // Page-specific critical resources
    if (path.includes('/books/')) {
      resources.push(
        { url: '/js/pages/books.js', type: 'script' },
        { url: '/css/books.css', type: 'style' }
      );
    } else if (path.includes('/stories/')) {
      resources.push(
        { url: '/js/pages/stories.js', type: 'script' },
        { url: '/css/stories.css', type: 'style' }
      );
    } else if (path.includes('/audio/')) {
      resources.push(
        { url: '/js/pages/audio.js', type: 'script' },
        { url: '/js/features/audio-visualization.js', type: 'script' }
      );
    }
    
    return resources;
  }

  configureCDN() {
    // Replace asset URLs with CDN URLs in production
    const baseURL = 'https://cdn.example.com'; // Replace with actual CDN
    
    document.querySelectorAll('link[rel="stylesheet"], script[src]').forEach(element => {
      if (element.href || element.src) {
        const url = element.href || element.src;
        if (url.startsWith('/') && !url.startsWith('//')) {
          const cdnUrl = baseURL + url;
          if (element.href) {
            element.href = cdnUrl;
          } else {
            element.src = cdnUrl;
          }
        }
      }
    });
  }

  configurePerformanceMonitoring() {
    if (this.config.performance.metricCollection) {
      // Enhanced performance monitoring
      this.enablePerformanceMonitoring();
    }
    
    if (this.config.performance.budgetEnforcement) {
      // Strict budget enforcement
      this.enableBudgetEnforcement();
    }
    
    if (this.config.performance.analyticsIntegration && this.environment === 'production') {
      // Setup analytics integration
      this.setupAnalyticsIntegration();
    }
  }

  enablePerformanceMonitoring() {
    // Enhanced monitoring is already setup in baseof.html
    // Just configure it based on environment
    
    document.addEventListener('performance-report', (event) => {
      const report = event.detail;
      
      if (this.config.performance.verbose) {
        console.log('Performance Report:', report);
      }
      
      // Store metrics for analysis
      this.storePerformanceMetrics(report);
    });
  }

  enableBudgetEnforcement() {
    document.addEventListener('performance-report', (event) => {
      const report = event.detail;
      
      // Check against budgets
      this.enforcePerformanceBudgets(report);
    });
  }

  enforcePerformanceBudgets(report) {
    const deviceCategory = report.device.isMobile ? 'mobile' : 
                          report.device.isTablet ? 'tablet' : 'desktop';
    
    // Load budget configuration
    fetch('/performance-budget.json')
      .then(response => response.json())
      .then(budget => {
        const deviceBudget = budget.budgets[deviceCategory];
        
        if (deviceBudget) {
          // Check Core Web Vitals
          if (report.metrics.LCP > deviceBudget.metrics.LCP) {
            this.handleBudgetViolation('LCP', report.metrics.LCP, deviceBudget.metrics.LCP);
          }
          
          if (report.metrics.FID > deviceBudget.metrics.FID) {
            this.handleBudgetViolation('FID', report.metrics.FID, deviceBudget.metrics.FID);
          }
          
          if (report.metrics.CLS > deviceBudget.metrics.CLS) {
            this.handleBudgetViolation('CLS', report.metrics.CLS, deviceBudget.metrics.CLS);
          }
        }
      });
  }

  handleBudgetViolation(metric, actual, budget) {
    const violation = { metric, actual, budget, timestamp: Date.now() };
    
    console.warn(`Performance budget violation: ${metric}`, violation);
    
    // Apply degradation strategies
    document.body.classList.add('performance-degraded', `${metric.toLowerCase()}-degraded`);
    
    // Dispatch event for other systems to react
    document.dispatchEvent(new CustomEvent('budget-violation', {
      detail: violation
    }));
  }

  setupAnalyticsIntegration() {
    // Integration with analytics services
    // This would integrate with Google Analytics, Adobe Analytics, etc.
    
    document.addEventListener('performance-report', (event) => {
      const report = event.detail;
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'performance_metrics', {
          custom_map: {
            'metric1': 'lcp',
            'metric2': 'fid',
            'metric3': 'cls'
          },
          lcp: report.metrics.LCP,
          fid: report.metrics.FID,
          cls: report.metrics.CLS
        });
      }
    });
  }

  setupErrorHandling() {
    if (this.config.performance.errorReporting) {
      // Enhanced error reporting
      window.addEventListener('error', (event) => {
        this.reportError({
          type: 'javascript',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          environment: this.environment,
          timestamp: Date.now()
        });
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError({
          type: 'promise',
          reason: event.reason,
          environment: this.environment,
          timestamp: Date.now()
        });
      });
    }
  }

  reportError(error) {
    if (this.config.features.debugging) {
      console.error('Environment Error:', error);
    }
    
    // In production, send to error tracking service
    if (this.environment === 'production') {
      // Example: Sentry, Bugsnag, etc.
      // errorTracker.captureException(error);
    }
  }

  configureFeatureFlags() {
    // Configure feature availability based on environment
    const features = this.config.features;
    
    window.featureFlags = {
      debugging: features.debugging,
      sourceMap: features.sourceMap,
      performanceWarnings: features.performanceWarnings,
      bundleAnalysis: features.bundleAnalysis,
      
      // Expose feature check function
      isEnabled: (feature) => features[feature] || false
    };
  }

  enableDebugOverlays() {
    if (!this.config.features.debugging) return;
    
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.innerHTML = `
      <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; z-index: 10000; font-family: monospace; font-size: 12px;">
        <div>Environment: ${this.environment}</div>
        <div>Screen: <span id="debug-screen-size"></span></div>
        <div>Memory: <span id="debug-memory"></span></div>
        <div>Connection: <span id="debug-connection"></span></div>
        <div>FPS: <span id="debug-fps">--</span></div>
        <button onclick="this.parentElement.style.display='none'" style="margin-top: 5px;">Hide</button>
      </div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Update debug info
    this.updateDebugInfo();
    setInterval(() => this.updateDebugInfo(), 1000);
  }

  updateDebugInfo() {
    const screenSize = document.getElementById('debug-screen-size');
    const memory = document.getElementById('debug-memory');
    const connection = document.getElementById('debug-connection');
    const fps = document.getElementById('debug-fps');
    
    if (screenSize) {
      screenSize.textContent = `${window.innerWidth}x${window.innerHeight}`;
    }
    
    if (memory && performance.memory) {
      const memMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      memory.textContent = `${memMB}MB`;
    }
    
    if (connection && navigator.connection) {
      connection.textContent = navigator.connection.effectiveType;
    }
    
    // FPS monitoring would require additional implementation
  }

  storePerformanceMetrics(report) {
    // Store metrics in localStorage for development analysis
    if (this.config.features.debugging) {
      const stored = JSON.parse(localStorage.getItem('performance-metrics') || '[]');
      stored.push(report);
      
      // Keep only last 50 reports
      if (stored.length > 50) {
        stored.splice(0, stored.length - 50);
      }
      
      localStorage.setItem('performance-metrics', JSON.stringify(stored));
    }
  }

  // Public API
  getEnvironment() {
    return this.environment;
  }

  getConfig() {
    return this.config;
  }

  isFeatureEnabled(feature) {
    return this.config.features[feature] || false;
  }

  isOptimizationEnabled(optimization) {
    return this.config.optimization[optimization] || false;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.environmentOptimizer = new EnvironmentOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnvironmentOptimizer;
}
