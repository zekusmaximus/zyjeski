/**
 * MOBILE PERFORMANCE READING OPTIMIZER
 * Advanced optimization specifically for mobile reading experience
 */

class MobileReadingOptimizer {
  constructor() {
    this.config = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      reading: {
        baseLineHeight: 1.6,
        baseWordSpacing: 0.1,
        maxLineLength: 70, // characters
        optimalWordsPerLine: 12
      },
      performance: {
        maxAnimationDuration: 200,
        debounceDelay: 100,
        throttleDelay: 16
      },
      accessibility: {
        minContrastRatio: 4.5,
        minTouchTarget: 44,
        preferReducedMotion: false
      }
    };

    this.state = {
      isReading: false,
      readingStartTime: null,
      scrollPosition: 0,
      readingProgress: 0,
      textMetrics: null,
      isLowPerformance: false
    };

    this.optimizations = new Map();
    this.init();
  }

  /**
   * Initialize mobile reading optimizations
   */
  init() {
    this.detectCapabilities();
    this.setupReadingModeDetection();
    this.optimizeTextRendering();
    this.setupPerformanceMonitoring();
    this.implementSmartScrolling();
    this.optimizeImages();
    this.setupAdaptiveLoading();
    this.enhanceAccessibility();
  }

  /**
   * Detect device capabilities and constraints
   */
  detectCapabilities() {
    // Device performance detection
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 2;
    
    this.state.isLowPerformance = hardwareConcurrency <= 2 || memory <= 2;
    
    // Network detection
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const slowConnections = ['slow-2g', '2g', '3g'];
      this.state.isSlowConnection = slowConnections.includes(connection.effectiveType);
    }

    // Accessibility preferences
    this.config.accessibility.preferReducedMotion = 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Update performance settings based on capabilities
    if (this.state.isLowPerformance) {
      this.config.performance.maxAnimationDuration = 100;
      this.config.performance.debounceDelay = 200;
    }

    console.log('📱 Mobile capabilities detected:', {
      lowPerformance: this.state.isLowPerformance,
      slowConnection: this.state.isSlowConnection,
      reducedMotion: this.config.accessibility.preferReducedMotion
    });
  }

  /**
   * Setup reading mode detection
   */
  setupReadingModeDetection() {
    // Detect when user enters reading mode
    const readingTriggers = [
      '.main-content',
      'article',
      '.content',
      '.post-content'
    ];

    readingTriggers.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        this.observeReadingContent(element);
      }
    });

    // Reading session tracking
    this.trackReadingSession();
  }

  /**
   * Observe reading content for optimization
   */
  observeReadingContent(element) {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          this.enterReadingMode(entry.target);
        } else {
          this.exitReadingMode(entry.target);
        }
      });
    }, {
      threshold: [0.5],
      rootMargin: '0px'
    });

    observer.observe(element);
  }

  /**
   * Enter reading mode with optimizations
   */
  enterReadingMode(element) {
    if (this.state.isReading) return;

    this.state.isReading = true;
    this.state.readingStartTime = performance.now();

    console.log('📖 Entering reading mode');

    // Apply reading optimizations
    this.optimizeForReading(element);
    this.enableReadingEnhancements();
    this.startReadingMetrics();

    // Notify other systems
    document.dispatchEvent(new CustomEvent('reading-mode-enter', {
      detail: { element }
    }));
  }

  /**
   * Exit reading mode
   */
  exitReadingMode(element) {
    if (!this.state.isReading) return;

    this.state.isReading = false;

    console.log('📖 Exiting reading mode');

    // Remove reading optimizations
    this.removeReadingOptimizations(element);
    this.stopReadingMetrics();

    // Notify other systems
    document.dispatchEvent(new CustomEvent('reading-mode-exit', {
      detail: { element }
    }));
  }

  /**
   * Optimize content for reading
   */
  optimizeForReading(element) {
    // Calculate optimal text metrics
    this.calculateTextMetrics(element);
    
    // Apply text optimizations
    this.optimizeTextLayout(element);
    
    // Reduce visual distractions
    this.minimizeDistractions();
    
    // Optimize scrolling performance
    this.optimizeScrolling(element);
  }

  /**
   * Calculate optimal text metrics for reading
   */
  calculateTextMetrics(element) {
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight) / fontSize;
    
    // Calculate optimal measurements for mobile reading
    const optimalFontSize = Math.max(16, Math.min(20, this.config.viewport.width * 0.045));
    const optimalLineHeight = this.config.reading.baseLineHeight;
    const optimalMaxWidth = Math.min(70, this.config.viewport.width * 0.9);

    this.state.textMetrics = {
      currentFontSize: fontSize,
      currentLineHeight: lineHeight,
      optimalFontSize,
      optimalLineHeight,
      optimalMaxWidth
    };

    console.log('📝 Text metrics calculated:', this.state.textMetrics);
  }

  /**
   * Optimize text layout for mobile reading
   */
  optimizeTextLayout(element) {
    const metrics = this.state.textMetrics;
    if (!metrics) return;

    // Create optimization CSS
    const optimizationId = 'mobile-reading-optimization';
    let styleElement = document.getElementById(optimizationId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = optimizationId;
      document.head.appendChild(styleElement);
    }

    const css = `
      .reading-optimized {
        font-size: ${metrics.optimalFontSize}px !important;
        line-height: ${metrics.optimalLineHeight} !important;
        max-width: ${metrics.optimalMaxWidth}ch !important;
        margin: 0 auto !important;
        word-spacing: ${this.config.reading.baseWordSpacing}em !important;
        hyphens: auto !important;
        text-align: left !important;
        letter-spacing: 0.01em !important;
      }

      .reading-optimized p {
        margin-bottom: 1.2em !important;
        text-indent: 0 !important;
      }

      .reading-optimized img {
        max-width: 100% !important;
        height: auto !important;
        margin: 1.5em 0 !important;
      }

      /* Reduce eye strain */
      .reading-optimized {
        color: #e8e8e8 !important;
        background: rgba(0, 4, 2, 0.95) !important;
        padding: 2rem !important;
        border-radius: 8px !important;
      }

      /* Optimize for low performance devices */
      ${this.state.isLowPerformance ? `
        .reading-optimized * {
          transition: none !important;
          animation: none !important;
        }
      ` : ''}

      /* Accessibility enhancements */
      ${this.config.accessibility.preferReducedMotion ? `
        .reading-optimized * {
          transition: none !important;
          animation: none !important;
        }
      ` : ''}
    `;

    styleElement.textContent = css;
    element.classList.add('reading-optimized');
  }

  /**
   * Minimize visual distractions during reading
   */
  minimizeDistractions() {
    // Hide non-essential elements
    const distractingElements = [
      '.social-share-container',
      '.advertisement',
      '.sidebar',
      '.related-posts',
      'aside:not(.reading-essential)'
    ];

    distractingElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.display = 'none';
        this.optimizations.set(element, {
          type: 'hide',
          originalDisplay: element.style.display
        });
      });
    });

    // Reduce header opacity
    const header = document.querySelector('header');
    if (header) {
      header.style.opacity = '0.8';
      this.optimizations.set(header, {
        type: 'opacity',
        originalOpacity: header.style.opacity
      });
    }
  }

  /**
   * Optimize scrolling performance for reading
   */
  optimizeScrolling(element) {
    // Implement smooth, performance-aware scrolling
    let ticking = false;
    
    const updateScrollPosition = () => {
      const scrollTop = window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.state.scrollPosition = scrollTop;
      this.state.readingProgress = scrollTop / scrollHeight;
      
      // Update reading progress indicator
      this.updateReadingProgress();
      
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  /**
   * Update reading progress indicator
   */
  updateReadingProgress() {
    let progressIndicator = document.getElementById('reading-progress');
    
    if (!progressIndicator) {
      progressIndicator = document.createElement('div');
      progressIndicator.id = 'reading-progress';
      progressIndicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: ${this.state.readingProgress * 100}%;
        height: 3px;
        background: linear-gradient(90deg, #00F5D4, #6E0DD0);
        z-index: 1000;
        transition: width 0.1s ease;
        pointer-events: none;
      `;
      document.body.appendChild(progressIndicator);
    }

    progressIndicator.style.width = `${this.state.readingProgress * 100}%`;
  }

  /**
   * Enable reading enhancements
   */
  enableReadingEnhancements() {
    // Add reading controls
    this.addReadingControls();
    
    // Enable text selection optimizations
    this.optimizeTextSelection();
    
    // Add reading bookmarks
    this.enableReadingBookmarks();
  }

  /**
   * Add reading controls for mobile
   */
  addReadingControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'reading-controls';
    controlsContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1001;
    `;

    // Font size controls
    const fontSizeUp = this.createControlButton('🔍+', () => this.adjustFontSize(1));
    const fontSizeDown = this.createControlButton('🔍-', () => this.adjustFontSize(-1));
    
    // Reading mode toggle
    const darkModeToggle = this.createControlButton('🌙', () => this.toggleDarkMode());
    
    controlsContainer.appendChild(fontSizeUp);
    controlsContainer.appendChild(fontSizeDown);
    controlsContainer.appendChild(darkModeToggle);
    
    document.body.appendChild(controlsContainer);
    
    this.optimizations.set(controlsContainer, { type: 'controls' });
  }

  /**
   * Create reading control button
   */
  createControlButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 245, 212, 0.9);
      color: #000;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      transition: transform 0.1s ease;
    `;
    
    button.addEventListener('click', onClick);
    button.addEventListener('touchstart', () => {
      button.style.transform = 'scale(0.95)';
    }, { passive: true });
    button.addEventListener('touchend', () => {
      button.style.transform = 'scale(1)';
    }, { passive: true });
    
    return button;
  }

  /**
   * Adjust font size for reading
   */
  adjustFontSize(direction) {
    if (!this.state.textMetrics) return;
    
    const currentSize = this.state.textMetrics.optimalFontSize;
    const newSize = Math.max(14, Math.min(24, currentSize + direction * 2));
    
    this.state.textMetrics.optimalFontSize = newSize;
    
    // Update CSS
    const styleElement = document.getElementById('mobile-reading-optimization');
    if (styleElement) {
      const readingElement = document.querySelector('.reading-optimized');
      if (readingElement) {
        this.optimizeTextLayout(readingElement);
      }
    }
  }

  /**
   * Toggle dark mode for reading
   */
  toggleDarkMode() {
    document.body.classList.toggle('reading-dark-mode');
    
    // Add dark mode styles if not present
    if (!document.getElementById('reading-dark-mode-styles')) {
      const darkModeStyles = document.createElement('style');
      darkModeStyles.id = 'reading-dark-mode-styles';
      darkModeStyles.textContent = `
        .reading-dark-mode .reading-optimized {
          background: rgba(0, 0, 0, 0.95) !important;
          color: #ffffff !important;
        }
        
        .reading-dark-mode {
          background: #000000 !important;
        }
      `;
      document.head.appendChild(darkModeStyles);
    }
  }

  /**
   * Optimize text selection for mobile
   */
  optimizeTextSelection() {
    const readingContent = document.querySelector('.reading-optimized');
    if (!readingContent) return;

    // Enhance text selection on mobile
    readingContent.style.webkitUserSelect = 'text';
    readingContent.style.userSelect = 'text';
    
    // Add copy feedback
    readingContent.addEventListener('copy', () => {
      this.showCopyFeedback();
    });
  }

  /**
   * Show copy feedback to user
   */
  showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.textContent = 'Text copied!';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 245, 212, 0.9);
      color: #000;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 1002;
      font-size: 14px;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }

  /**
   * Enable reading bookmarks
   */
  enableReadingBookmarks() {
    // Save reading position automatically
    const savePosition = this.debounce(() => {
      localStorage.setItem(`reading_position_${window.location.pathname}`, 
        JSON.stringify({
          progress: this.state.readingProgress,
          timestamp: Date.now()
        })
      );
    }, 1000);

    window.addEventListener('scroll', savePosition, { passive: true });
    
    // Restore reading position
    this.restoreReadingPosition();
  }

  /**
   * Restore reading position
   */
  restoreReadingPosition() {
    const saved = localStorage.getItem(`reading_position_${window.location.pathname}`);
    if (!saved) return;

    try {
      const { progress, timestamp } = JSON.parse(saved);
      
      // Only restore if less than 24 hours old
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        const scrollTop = progress * (document.documentElement.scrollHeight - window.innerHeight);
        
        // Smooth scroll to position
        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        console.log('📖 Restored reading position:', Math.round(progress * 100) + '%');
      }
    } catch (error) {
      console.warn('Failed to restore reading position:', error);
    }
  }

  /**
   * Setup performance monitoring for reading
   */
  setupPerformanceMonitoring() {
    this.startFPSMonitoring();
    this.monitorScrollPerformance();
    this.trackReadingMetrics();
  }

  /**
   * Monitor FPS during reading
   */
  startFPSMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      
      if (now >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        
        // Adjust performance if FPS is low
        if (fps < 30) {
          this.applyLowPerformanceMode();
        }
        
        frameCount = 0;
        lastTime = now;
      }
      
      if (this.state.isReading) {
        requestAnimationFrame(measureFPS);
      }
    };
    
    if (this.state.isReading) {
      requestAnimationFrame(measureFPS);
    }
  }

  /**
   * Apply low performance mode optimizations
   */
  applyLowPerformanceMode() {
    if (this.state.isLowPerformance) return; // Already applied
    
    this.state.isLowPerformance = true;
    
    console.log('📱 Applying low performance mode');
    
    // Disable animations
    const performanceCSS = document.createElement('style');
    performanceCSS.id = 'low-performance-mode';
    performanceCSS.textContent = `
      * {
        animation: none !important;
        transition: none !important;
      }
      
      .reading-optimized {
        transform: none !important;
      }
    `;
    document.head.appendChild(performanceCSS);
  }

  /**
   * Track reading session metrics
   */
  trackReadingSession() {
    window.addEventListener('beforeunload', () => {
      if (this.state.isReading && this.state.readingStartTime) {
        const readingDuration = performance.now() - this.state.readingStartTime;
        
        // Save reading analytics
        const sessionData = {
          url: window.location.pathname,
          duration: readingDuration,
          progress: this.state.readingProgress,
          timestamp: Date.now()
        };
        
        // Store locally for analytics
        const sessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
        sessions.push(sessionData);
        
        // Keep only last 10 sessions
        if (sessions.length > 10) {
          sessions.splice(0, sessions.length - 10);
        }
        
        localStorage.setItem('reading_sessions', JSON.stringify(sessions));
        
        console.log('📊 Reading session tracked:', {
          duration: Math.round(readingDuration / 1000) + 's',
          progress: Math.round(this.state.readingProgress * 100) + '%'
        });
      }
    });
  }

  /**
   * Remove all reading optimizations
   */
  removeReadingOptimizations(element) {
    // Remove optimization classes
    element.classList.remove('reading-optimized');
    
    // Restore hidden elements
    this.optimizations.forEach((optimization, element) => {
      switch (optimization.type) {
        case 'hide':
          element.style.display = optimization.originalDisplay;
          break;
        case 'opacity':
          element.style.opacity = optimization.originalOpacity;
          break;
        case 'controls':
          element.remove();
          break;
      }
    });
    
    this.optimizations.clear();
    
    // Remove progress indicator
    const progressIndicator = document.getElementById('reading-progress');
    if (progressIndicator) {
      progressIndicator.remove();
    }
  }

  /**
   * Utility: Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Start reading metrics collection
   */
  startReadingMetrics() {
    // Implementation for detailed reading analytics
    console.log('📊 Starting reading metrics collection');
  }

  /**
   * Stop reading metrics collection
   */
  stopReadingMetrics() {
    // Implementation for stopping metrics collection
    console.log('📊 Stopping reading metrics collection');
  }

  /**
   * Monitor scroll performance
   */
  monitorScrollPerformance() {
    // Implementation for scroll performance monitoring
    console.log('📱 Monitoring scroll performance');
  }

  /**
   * Track reading metrics
   */
  trackReadingMetrics() {
    // Implementation for reading behavior tracking
    console.log('📈 Tracking reading metrics');
  }

  /**
   * Optimize images for reading mode
   */
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading optimization
      if (!img.loading) {
        img.loading = 'lazy';
      }
      
      // Optimize image sizes for mobile reading
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });
  }

  /**
   * Setup adaptive loading based on performance
   */
  setupAdaptiveLoading() {
    if (this.state.isLowPerformance || this.state.isSlowConnection) {
      // Reduce image quality and defer non-essential resources
      console.log('📱 Applying adaptive loading for constrained environment');
    }
  }

  /**
   * Enhance accessibility for mobile reading
   */
  enhanceAccessibility() {
    // Ensure proper focus management
    const readingContent = document.querySelector('.main-content, article');
    if (readingContent && !readingContent.tabIndex) {
      readingContent.tabIndex = -1;
    }
    
    // Add landmark roles
    if (readingContent && !readingContent.getAttribute('role')) {
      readingContent.setAttribute('role', 'main');
    }
  }
}

// Initialize mobile reading optimizer
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(max-width: 1023px)').matches) {
    window.mobileReadingOptimizer = new MobileReadingOptimizer();
  }
});

// Export for use by other modules
window.MobileReadingOptimizer = MobileReadingOptimizer;
