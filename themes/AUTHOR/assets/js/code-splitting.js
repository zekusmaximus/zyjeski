/**
 * CODE SPLITTING AND DYNAMIC LOADING SYSTEM
 * Progressive feature loading based on device capabilities and user interaction
 */

class CodeSplittingManager {
  constructor() {
    this.loadedModules = new Set();
    this.loadingPromises = new Map();
    this.performanceBudget = null;
    this.deviceCapabilities = null;
    
    this.moduleRegistry = {
      // Core modules - loaded immediately
      core: [
        'accessibility',
        'basic-interactions'
      ],

      // Critical modules - high priority, loaded early
      critical: {
        'image-optimizer': {
          path: '/js/image-optimizer.js',
          requirements: {},
          budget: { js: 150, css: 0 },
          priority: 'high'
        }
      },

      // Progressive modules - loaded on demand based on device capabilities
      progressive: {
        'mandala-3d': {
          path: '/js/features/mandala-3d.js',
          // Touch devices excluded: 3D effects rely on hover/mouse parallax which doesn't translate to touch
          // High performance required: WebGL rendering + parallax calculations are CPU/GPU intensive
          requirements: { webGL: true, performance: 'high', reducedMotion: false, touch: false },
          budget: { js: 80, css: 20 }
        },
        'animations': {
          path: '/js/features/animations.js',
          requirements: { performance: 'medium', reducedMotion: false },
          budget: { js: 100, css: 30 }
        },
        'audio-visualization': {
          path: '/js/features/audio-visualization.js',
          requirements: { webAudio: true, performance: 'medium' },
          budget: { js: 120, css: 10 }
        }
      },

      // Route-specific modules - loaded based on current page
      routes: {
        'books': {
          path: '/js/pages/books.js',
          budget: { js: 50, css: 20 }
        },
        'stories': {
          path: '/js/pages/stories.js',
          budget: { js: 40, css: 15 }
        },
        'audio': {
          path: '/js/pages/audio.js',
          budget: { js: 100, css: 20 },
          // Load audio visualization on audio routes
          includes: ['audio-visualization']
        }
      }
    };
    
    this.init();
  }

  async init() {
    try {
      await this.loadPerformanceBudget();
      await this.detectDeviceCapabilities();
      await this.loadCoreModules();
      this.setupRouteBasedLoading();
      this.setupIntersectionObservers();
      this.setupUserInteractionLoading();
      
      console.log('CodeSplittingManager initialized successfully');
    } catch (error) {
      console.warn('CodeSplittingManager initialization failed:', error);
      this.fallbackToMonolithicLoading();
    }
  }

  async loadPerformanceBudget() {
    try {
      const response = await fetch('/performance-budget.json');
      this.performanceBudget = await response.json();
    } catch {
      console.warn('Could not load performance budget, using defaults');
      this.performanceBudget = this.getDefaultBudget();
    }
  }

  getDefaultBudget() {
    return {
      budgets: {
        mobile: { thresholds: { secondary: { totalJavaScript: 300 } } },
        tablet: { thresholds: { secondary: { totalJavaScript: 500 } } },
        desktop: { thresholds: { secondary: { totalJavaScript: 800 } } }
      }
    };
  }

  async detectDeviceCapabilities() {
    this.deviceCapabilities = {
      screenSize: this.getScreenSize(),
      performance: await this.assessPerformance(),
      webGL: this.hasWebGL(),
      webAudio: this.hasWebAudio(),
      gpuAcceleration: this.hasGPUAcceleration(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      connection: this.getConnectionType(),
      memory: this.getMemoryInfo()
    };
    
    console.log('Device capabilities:', this.deviceCapabilities);
  }

  getScreenSize() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  async assessPerformance() {
    // Simple performance assessment
    const start = performance.now();
    
    // CPU test
    let iterations = 0;
    const cpuTestEnd = start + 10; // 10ms test
    while (performance.now() < cpuTestEnd) {
      iterations++;
    }
    
    // Memory test
    const memoryInfo = navigator.deviceMemory || 4; // Default to 4GB
    
    // Network test
    const connection = navigator.connection;
    const effectiveType = connection?.effectiveType || '4g';
    
    // Determine performance level
    if (iterations > 100000 && memoryInfo >= 8 && ['4g'].includes(effectiveType)) {
      return 'high';
    } else if (iterations > 50000 && memoryInfo >= 4 && ['3g', '4g'].includes(effectiveType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  hasWebAudio() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  hasGPUAcceleration() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return false;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return !renderer.includes('Software');
    }
    return true;
  }

  getConnectionType() {
    if (navigator.connection) {
      return navigator.connection.effectiveType;
    }
    return '4g'; // Default assumption
  }

  getMemoryInfo() {
    return navigator.deviceMemory || 4; // Default to 4GB
  }

  async loadCoreModules() {
    const coreModules = this.moduleRegistry.core;
    const loadPromises = coreModules.map(module => this.loadModule('core', module));
    
    try {
      await Promise.all(loadPromises);
      console.log('Core modules loaded successfully');
    } catch (error) {
      console.warn('Some core modules failed to load:', error);
    }
  }

  async loadModule(category, moduleName, options = {}) {
    const moduleKey = `${category}:${moduleName}`;
    
    // Check if already loaded
    if (this.loadedModules.has(moduleKey)) {
      return;
    }
    
    // Check if already loading
    if (this.loadingPromises.has(moduleKey)) {
      return this.loadingPromises.get(moduleKey);
    }
    
    // Get module configuration
    const moduleConfig = this.getModuleConfig(category, moduleName);
    if (!moduleConfig) {
      console.warn(`Module configuration not found: ${moduleKey}`);
      return;
    }
    
    // Check requirements
    if (!this.meetsRequirements(moduleConfig.requirements)) {
      console.log(`Module ${moduleKey} requirements not met, skipping`);
      return;
    }
    
    // Check budget
    if (!this.withinBudget(moduleConfig.budget)) {
      console.log(`Module ${moduleKey} exceeds budget, skipping`);
      return;
    }
    
    // Start loading
    const loadPromise = this.doLoadModule(moduleConfig, moduleKey, options);
    this.loadingPromises.set(moduleKey, loadPromise);
    
    try {
      await loadPromise;
      this.loadedModules.add(moduleKey);
      this.loadingPromises.delete(moduleKey);
      
      console.log(`Module ${moduleKey} loaded successfully`);
    } catch (error) {
      this.loadingPromises.delete(moduleKey);
      console.warn(`Failed to load module ${moduleKey}:`, error);
    }
    
    return loadPromise;
  }

  getModuleConfig(category, moduleName) {
    if (category === 'core') {
      return { path: `/js/core/${moduleName}.js`, budget: { js: 20 } };
    }
    
    return this.moduleRegistry[category]?.[moduleName];
  }

  meetsRequirements(requirements = {}) {
    for (const [requirement, value] of Object.entries(requirements)) {
      const deviceValue = this.deviceCapabilities[requirement];
      
      if (requirement === 'performance') {
        const levels = { low: 1, medium: 2, high: 3 };
        if (levels[deviceValue] < levels[value]) {
          return false;
        }
      } else if (requirement === 'reducedMotion') {
        // Special case: if reduced motion is required to be false, check that it's actually false
        if (value === false && deviceValue === true) {
          return false;
        }
      } else if (deviceValue !== value && value !== undefined) {
        return false;
      }
    }
    
    return true;
  }

  withinBudget(budget = {}) {
    const deviceBudget = this.getDeviceBudget();
    const jsUsed = this.getJavaScriptUsage();
    
    const jsLimit = deviceBudget.thresholds?.secondary?.totalJavaScript || 500;
    const jsRequired = budget.js || 0;
    
    return (jsUsed + jsRequired) <= jsLimit;
  }

  getDeviceBudget() {
    const device = this.deviceCapabilities.screenSize;
    return this.performanceBudget?.budgets?.[device] || 
           this.performanceBudget?.budgets?.mobile || 
           { thresholds: { secondary: { totalJavaScript: 300 } } };
  }

  getJavaScriptUsage() {
    // Estimate based on loaded modules
    return Array.from(this.loadedModules).reduce((total, moduleKey) => {
      const [category, moduleName] = moduleKey.split(':');
      const config = this.getModuleConfig(category, moduleName);
      return total + (config?.budget?.js || 20);
    }, 0);
  }

  async doLoadModule(moduleConfig, moduleKey, options) {
    const path = moduleConfig.path;
    
    try {
      // Dynamic import
      const module = await import(path);
      
      // Initialize module if it has an init function
      if (module.default && typeof module.default.init === 'function') {
        await module.default.init(options);
      } else if (module.init) {
        await module.init(options);
      }
      
      // Dispatch loaded event
      document.dispatchEvent(new CustomEvent('module-loaded', {
        detail: { moduleKey, path, options }
      }));
      
    } catch (error) {
      console.warn(`Failed to import module ${path}:`, error);
      throw error;
    }
  }

  setupRouteBasedLoading() {
    // Load modules based on current page
    const currentPath = window.location.pathname;
    const routeModules = this.moduleRegistry.routes;
    
    for (const [route, config] of Object.entries(routeModules)) {
      if (currentPath.includes(`/${route}`)) {
        this.loadModule('routes', route);
      }
    }
    
    // Preload modules for likely next pages
    this.preloadLikelyRoutes();
  }

  preloadLikelyRoutes() {
    // Simple heuristic: preload modules for links visible in viewport
    const visibleLinks = Array.from(document.querySelectorAll('a[href]'))
      .filter(link => {
        const rect = link.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
    
    visibleLinks.forEach(link => {
      const href = link.getAttribute('href');
      for (const route of Object.keys(this.moduleRegistry.routes)) {
        if (href.includes(`/${route}`)) {
          // Preload with low priority
          setTimeout(() => {
            this.loadModule('routes', route);
          }, 2000);
        }
      }
    });
  }

  setupIntersectionObservers() {
    // Load modules when related elements come into view
    const moduleElements = document.querySelectorAll('[data-requires-module]');
    
    if (moduleElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const moduleName = entry.target.dataset.requiresModule;
          const category = entry.target.dataset.moduleCategory || 'progressive';
          
          this.loadModule(category, moduleName);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '100px 0px',
      threshold: 0.1
    });
    
    moduleElements.forEach(element => observer.observe(element));
  }

  setupUserInteractionLoading() {
    // Load modules on first user interaction
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    let hasInteracted = false;
    
    const handleFirstInteraction = () => {
      if (hasInteracted) return;
      hasInteracted = true;
      
      // Remove listeners
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
      
      // Load interaction-dependent modules
      this.loadInteractionModules();
    };
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { passive: true });
    });
    
    // Also load after a delay for non-interactive users
    setTimeout(() => {
      if (!hasInteracted) {
        this.loadInteractionModules();
      }
    }, 5000);
  }

  loadInteractionModules() {
    // Load modules that enhance interactivity (only those we're keeping)
    const interactionModules = ['mandala-3d', 'animations'];

    interactionModules.forEach(module => {
      this.loadModule('progressive', module);
    });
  }

  // Public API methods
  async preloadModule(category, moduleName) {
    return this.loadModule(category, moduleName, { preload: true });
  }

  async loadModuleImmediate(category, moduleName) {
    return this.loadModule(category, moduleName, { immediate: true });
  }

  getLoadedModules() {
    return Array.from(this.loadedModules);
  }

  getPerformanceMetrics() {
    return {
      loadedModules: this.getLoadedModules(),
      jsUsage: this.getJavaScriptUsage(),
      budget: this.getDeviceBudget(),
      capabilities: this.deviceCapabilities
    };
  }

  fallbackToMonolithicLoading() {
    console.warn('Code splitting failed, loading all modules');
    
    // Load all critical modules immediately
    const criticalModules = [
      'accessibility',
      'basic-interactions',
      'social-sharing'
    ];
    
    criticalModules.forEach(module => {
      const script = document.createElement('script');
      script.src = `/js/fallback/${module}.js`;
      script.async = true;
      document.head.appendChild(script);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.codeSplittingManager = new CodeSplittingManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeSplittingManager;
}
