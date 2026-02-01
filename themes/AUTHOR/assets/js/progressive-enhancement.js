/**
 * PROGRESSIVE ENHANCEMENT SYSTEM
 * Device capability detection and feature loading strategy for Hugo Author Website
 * 
 * Features:
 * - Device performance assessment
 * - Progressive feature loading
 * - Graceful fallbacks
 * - Connection-aware enhancements
 * - Motion preference awareness
 */

class ProgressiveEnhancement {
  constructor() {
    this.capabilities = {
      performance: 'unknown',
      connection: 'unknown',
      screenSize: 'unknown',
      touchSupport: false,
      motionPreference: 'no-preference',
      batteryLevel: 1,
      gpuAcceleration: false,
      webGL: false
    };
    
    this.features = {
      mandala3D: false,
      complexAnimations: false,
      audioVisualization: false
    };
    
    this.loadingQueue = [];
    this.initialized = false;
    
    this.init();
  }

  async init() {
    try {
      await this.detectCapabilities();
      this.assessDevicePerformance();
      this.determineFeatureSet();
      this.applyBaselineEnhancements();
      this.progressivelyLoadFeatures();
      this.initialized = true;
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('progressive-enhancement-ready', {
        detail: { capabilities: this.capabilities, features: this.features }
      }));
    } catch (error) {
      console.warn('Progressive enhancement initialization failed:', error);
      this.fallbackMode();
    }
  }

  async detectCapabilities() {
    // Screen size detection
    this.capabilities.screenSize = this.getScreenSizeCategory();
    
    // Touch support
    this.capabilities.touchSupport = this.detectTouchSupport();
    
    // Motion preferences
    this.capabilities.motionPreference = this.getMotionPreference();
    
    // Network connection
    await this.detectConnection();
    
    // Battery status (if available)
    await this.detectBatteryStatus();
    
    // GPU capabilities
    this.capabilities.gpuAcceleration = this.detectGPUAcceleration();
    this.capabilities.webGL = this.detectWebGL();
  }

  getScreenSizeCategory() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'large-desktop';
  }

  detectTouchSupport() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches
    );
  }

  getMotionPreference() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'reduce';
    }
    return 'no-preference';
  }

  async detectConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      // Map connection types to performance categories
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          this.capabilities.connection = 'poor';
          break;
        case '3g':
          this.capabilities.connection = 'fair';
          break;
        case '4g':
          this.capabilities.connection = 'good';
          break;
        default:
          this.capabilities.connection = 'unknown';
      }
      
      // Also consider save-data preference
      if (connection.saveData) {
        this.capabilities.connection = 'poor';
      }
    } else {
      // Fallback: measure connection speed non-blocking
      this.capabilities.connection = 'unknown';
      this.measureConnectionSpeed().then(speed => {
        if (speed !== 'unknown' && speed !== this.capabilities.connection) {
          this.capabilities.connection = speed;
          this.reassessFeatures();
        }
      });
    }
  }

  async measureConnectionSpeed() {
    try {
      const startTime = performance.now();
      // Try to fetch a small test resource
      await fetch('/images/test-pixel.png?t=' + Date.now(), { 
        cache: 'no-cache',
        mode: 'no-cors'
      });
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 2000) return 'poor';
      if (duration > 1000) return 'fair';
      return 'good';
    } catch {
      return 'unknown';
    }
  }

  async detectBatteryStatus() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        this.capabilities.batteryLevel = battery.level;
        
        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          this.capabilities.batteryLevel = battery.level;
          this.reassessFeatures();
        });
      }
    } catch {
      // Battery API not available
      this.capabilities.batteryLevel = 1;
    }
  }

  detectGPUAcceleration() {
    // Check for CSS transform3d support
    const element = document.createElement('div');
    const transforms = [
      'transform',
      'WebkitTransform',
      'MozTransform',
      'msTransform',
      'OTransform'
    ];
    
    return transforms.some(transform => {
      if (element.style[transform] !== undefined) {
        element.style[transform] = 'translate3d(1px,1px,1px)';
        return element.style[transform] !== '';
      }
      return false;
    });
  }

  detectWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  assessDevicePerformance() {
    let score = 0;
    
    // Screen size scoring
    switch (this.capabilities.screenSize) {
      case 'mobile': score += 1; break;
      case 'tablet': score += 2; break;
      case 'desktop': score += 3; break;
      case 'large-desktop': score += 4; break;
    }
    
    // Connection scoring
    switch (this.capabilities.connection) {
      case 'poor': score += 0; break;
      case 'fair': score += 1; break;
      case 'good': score += 2; break;
      case 'unknown': score += 1; break;
    }
    
    // GPU capabilities
    if (this.capabilities.gpuAcceleration) score += 2;
    if (this.capabilities.webGL) score += 1;
    
    // Battery consideration
    if (this.capabilities.batteryLevel < 0.2) score -= 2;
    else if (this.capabilities.batteryLevel < 0.5) score -= 1;
    
    // Motion preference consideration
    if (this.capabilities.motionPreference === 'reduce') score -= 2;
    
    // Determine performance category
    if (score <= 2) this.capabilities.performance = 'low';
    else if (score <= 5) this.capabilities.performance = 'medium';
    else this.capabilities.performance = 'high';
  }

  determineFeatureSet() {
    const perf = this.capabilities.performance;
    const motion = this.capabilities.motionPreference;
    const touch = this.capabilities.touchSupport;
    const flags = window.FEATURE_FLAGS || {};

    // Base features (always enabled for accessibility)
    this.features.basicInteractivity = true;
    this.features.keyboardNavigation = true;
    this.features.focusManagement = true;

    // Progressive features based on capabilities AND feature flags
    switch (perf) {
      case 'high':
        // Enable all features on high-performance devices (if flags allow)

        // Mandala3D disabled on touch devices (!touch) because:
        // 1. 3D effects rely on mouse hover and parallax tracking (no touch equivalent)
        // 2. Touch interactions conflict with scroll gestures needed for parallax
        // 3. Mobile/tablet users get better experience with simplified grid
        this.features.mandala3D = flags.mandala3D !== false && motion !== 'reduce' && !touch;

        this.features.complexAnimations = flags.animations !== false && motion !== 'reduce';
        this.features.audioVisualization = flags.audioVisualization !== false;
        break;

      case 'medium':
        // Medium performance: animations only, no 3D
        this.features.mandala3D = false;
        this.features.complexAnimations = flags.animations !== false && motion !== 'reduce';
        this.features.audioVisualization = flags.audioVisualization !== false;
        break;

      case 'low':
        // Low performance: disable all enhancements
        this.features.mandala3D = false;
        this.features.complexAnimations = false;
        this.features.audioVisualization = false;
        break;
    }

    // Touch-specific adjustments
    if (touch) {
      this.features.hoverEffects = false;
      this.features.mouseParallax = false;
    } else {
      this.features.hoverEffects = true;
      this.features.mouseParallax = perf === 'high' && motion !== 'reduce';
    }
  }

  applyBaselineEnhancements() {
    // Apply CSS classes based on capabilities
    const body = document.body;
    
    body.classList.add(`performance-${this.capabilities.performance}`);
    body.classList.add(`screen-${this.capabilities.screenSize}`);
    body.classList.add(`connection-${this.capabilities.connection}`);
    
    if (this.capabilities.touchSupport) body.classList.add('touch-device');
    if (this.capabilities.motionPreference === 'reduce') body.classList.add('reduce-motion');
    if (this.capabilities.batteryLevel < 0.2) body.classList.add('low-battery');
    
    // Set CSS custom properties for dynamic adjustments
    document.documentElement.style.setProperty('--animation-duration', this.getAnimationDuration());
    document.documentElement.style.setProperty('--transition-duration', this.getTransitionDuration());
  }

  getAnimationDuration() {
    if (this.capabilities.motionPreference === 'reduce') return '0.01s';
    
    switch (this.capabilities.performance) {
      case 'low': return '0.1s';
      case 'medium': return '0.2s';
      case 'high': return '0.3s';
      default: return '0.2s';
    }
  }

  getTransitionDuration() {
    if (this.capabilities.motionPreference === 'reduce') return '0.01s';
    
    switch (this.capabilities.performance) {
      case 'low': return '0.1s';
      case 'medium': return '0.15s';
      case 'high': return '0.2s';
      default: return '0.15s';
    }
  }

  progressivelyLoadFeatures() {
    // Start all imports immediately for enabled features
    const imports = {};

    try {
      // Only import modules that are enabled
      if (this.features.mandala3D) {
        imports.mandala3D = import('./features/mandala-3d.js').catch(err => {
          console.warn('Failed to import mandala-3d.js:', err);
          return null;
        });
      }

      if (this.features.complexAnimations) {
        imports.complexAnimations = import('./features/animations.js').catch(err => {
          console.warn('Failed to import animations.js:', err);
          return null;
        });
      }

      if (this.features.audioVisualization) {
        imports.audioVisualization = import('./features/audio-visualization.js').catch(err => {
          console.warn('Failed to import audio-visualization.js:', err);
          return null;
        });
      }
    } catch (error) {
      console.warn('Error importing feature modules:', error);
    }

    // Load features in order of importance
    if (this.features.mandala3D && imports.mandala3D) {
      this.loadingQueue.push(() => this.loadMandala3D(imports.mandala3D));
    }

    if (this.features.complexAnimations && imports.complexAnimations) {
      this.loadingQueue.push(() => this.loadComplexAnimations(imports.complexAnimations));
    }

    if (this.features.audioVisualization && imports.audioVisualization) {
      this.loadingQueue.push(() => this.loadAudioVisualization(imports.audioVisualization));
    }

    // Process queue with throttling
    this.processLoadingQueue();
  }

  async processLoadingQueue() {
    const delay = this.capabilities.performance === 'low' ? 100 : 50;
    
    for (const loader of this.loadingQueue) {
      try {
        await loader();
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.warn('Feature loading failed:', error);
      }
    }
  }

  async loadMandala3D(importPromise) {
    const promise = importPromise || import('./features/mandala-3d.js');
    return new Promise((resolve) => {
      promise.then(module => {
        module.initMandala3D(this.capabilities);
        resolve();
      }).catch(() => {
        // Fallback to basic mandala
        this.loadBasicMandala();
        resolve();
      });
    });
  }

  async loadComplexAnimations(importPromise) {
    const promise = importPromise || import('./features/animations.js');
    return new Promise((resolve) => {
      promise.then(module => {
        if (module && module.initComplexAnimations) {
          module.initComplexAnimations(this.capabilities);
        }
        resolve();
      }).catch((error) => {
        console.warn('Complex animations failed to load:', error);
        resolve();
      });
    });
  }

  async loadAudioVisualization(importPromise) {
    const promise = importPromise || import('./features/audio-visualization.js');
    return new Promise((resolve) => {
      promise.then(module => {
        if (module && module.initAudioVisualization) {
          module.initAudioVisualization(this.capabilities);
        }
        resolve();
      }).catch((error) => {
        console.warn('Audio visualization failed to load:', error);
        resolve();
      });
    });
  }

  loadBasicMandala() {
    // Simple, accessible mandala grid without 3D effects
    const mandalaGrid = document.querySelector('.mandala-grid');
    if (mandalaGrid) {
      mandalaGrid.classList.add('basic-mandala');
    }
  }

  loadBasicAudioPlayer() {
    // Simple HTML5 audio player fallback
    const prayerWheels = document.querySelectorAll('.prayer-wheel-player');
    prayerWheels.forEach(player => {
      player.classList.add('basic-audio-player');
    });
  }

  reassessFeatures() {
    // Re-evaluate features if conditions change (e.g., battery level)
    this.assessDevicePerformance();
    this.determineFeatureSet();
    this.applyBaselineEnhancements();
  }

  fallbackMode() {
    // Ensure basic functionality works even if enhancement fails
    document.body.classList.add('enhancement-fallback');
    this.loadBasicMandala();
    this.loadBasicAudioPlayer();
  }

  // Public API methods
  getCapabilities() {
    return { ...this.capabilities };
  }

  getFeatures() {
    return { ...this.features };
  }

  isFeatureEnabled(featureName) {
    return this.features[featureName] || false;
  }
}

// Global instance
const progressiveEnhancement = new ProgressiveEnhancement();

// Export for use in other modules
window.ProgressiveEnhancement = progressiveEnhancement;
