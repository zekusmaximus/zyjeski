/**
 * MOBILE-OPTIMIZED HUGO AUTHOR WEBSITE JAVASCRIPT
 * Performance-focused, touch-first cyberpunk-mystical interactions
 * 
 * Features:
 * - Progressive enhancement from mobile to desktop
 * - Touch-first interaction design
 * - Performance budgets and battery-aware optimizations
 * - Reduced motion support
 * - Device-specific feature detection
 */

// Performance configuration
const PERFORMANCE_CONFIG = {
  // Animation durations based on device capability
  MOBILE_ANIMATION_DURATION: 150,
  DESKTOP_ANIMATION_DURATION: 300,
  
  // Battery-aware thresholds
  LOW_BATTERY_THRESHOLD: 0.2,
  CRITICAL_BATTERY_THRESHOLD: 0.1,
  
  // Network-aware settings
  SLOW_CONNECTION_THRESHOLD: 1000, // ms for slow 3G
  
  // Device capability detection
  REDUCED_MOTION_QUERY: '(prefers-reduced-motion: reduce)',
  HIGH_CONTRAST_QUERY: '(prefers-contrast: high)',
  MOBILE_QUERY: '(max-width: 767px)',
  TABLET_QUERY: '(min-width: 768px) and (max-width: 1023px)',
  TOUCH_QUERY: '(hover: none) and (pointer: coarse)',
};

// Global state management
const AppState = {
  isMobile: false,
  isTablet: false,
  isTouch: false,
  isReducedMotion: false,
  isLowBattery: false,
  isSlowConnection: false,
  isDarkMode: true,
  initialized: false
};

/**
 * Device and capability detection
 */
function detectDeviceCapabilities() {
  AppState.isMobile = window.matchMedia(PERFORMANCE_CONFIG.MOBILE_QUERY).matches;
  AppState.isTablet = window.matchMedia(PERFORMANCE_CONFIG.TABLET_QUERY).matches;
  AppState.isTouch = window.matchMedia(PERFORMANCE_CONFIG.TOUCH_QUERY).matches;
  AppState.isReducedMotion = window.matchMedia(PERFORMANCE_CONFIG.REDUCED_MOTION_QUERY).matches;
  
  // Battery API (if available)
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      AppState.isLowBattery = battery.level < PERFORMANCE_CONFIG.LOW_BATTERY_THRESHOLD;
      
      // Monitor battery changes
      battery.addEventListener('levelchange', () => {
        AppState.isLowBattery = battery.level < PERFORMANCE_CONFIG.LOW_BATTERY_THRESHOLD;
        updatePerformanceMode();
      });
    }).catch(() => {
      console.log('Battery API not available');
    });
  }
  
  // Network detection (if available)
  if ('connection' in navigator) {
    const connection = navigator.connection;
    const slowConnections = ['slow-2g', '2g', '3g'];
    AppState.isSlowConnection = slowConnections.includes(connection.effectiveType);
    
    connection.addEventListener('change', () => {
      AppState.isSlowConnection = slowConnections.includes(connection.effectiveType);
      updatePerformanceMode();
    });
  }
  
  // Listen for preference changes
  window.matchMedia(PERFORMANCE_CONFIG.REDUCED_MOTION_QUERY).addEventListener('change', (e) => {
    AppState.isReducedMotion = e.matches;
    updatePerformanceMode();
  });
}

/**
 * Update performance mode based on device capabilities
 */
function updatePerformanceMode() {
  const shouldReduceAnimations = AppState.isReducedMotion || 
                                AppState.isLowBattery || 
                                AppState.isSlowConnection ||
                                AppState.isMobile;
  
  document.body.classList.toggle('reduced-performance', shouldReduceAnimations);
  document.body.classList.toggle('touch-device', AppState.isTouch);
  document.body.classList.toggle('mobile-device', AppState.isMobile);
}

/**
 * Utility: Throttle function for performance
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Utility: Debounce function for performance
 */
function debounce(func, wait) {
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
 * Enhanced Mandala Grid Effects with mobile optimization
 */
class MandalaEffects {
  constructor() {
    this.mandalaGrid = document.querySelector('.mandala-grid');
    this.mandalaItems = document.querySelectorAll('.mandala-item');
    this.mandalaCenter = document.querySelector('.mandala-center');
    this.isAnimating = false;
    
    if (!this.mandalaGrid) return;
    
    this.init();
  }
  
  init() {
    this.setupGridEffects();
    this.setupItemInteractions();
    this.setupAccessibility();
  }
  
  setupGridEffects() {
    // Only add complex grid effects on desktop without reduced motion
    if (!AppState.isMobile && !AppState.isReducedMotion) {
      this.setupMouseTracking();
      this.setupScrollEffects();
    }
  }
  
  setupMouseTracking() {
    if (AppState.isTouch) return;
    
    const handleMouseMove = throttle((e) => {
      if (this.isAnimating) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate rotation with limits
      const xRotation = Math.max(-3, Math.min(3, (clientY - innerHeight / 2) / innerHeight * 6));
      const yRotation = Math.max(-3, Math.min(3, (clientX - innerWidth / 2) / innerWidth * -6));
      
      requestAnimationFrame(() => {
        if (this.mandalaGrid) {
          this.mandalaGrid.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
        }
      });
    }, 16); // ~60fps
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
      if (this.mandalaGrid) {
        this.mandalaGrid.style.transform = '';
      }
    });
  }
  
  setupScrollEffects() {
    if (AppState.isReducedMotion || AppState.isMobile) return;
    
    const handleScroll = throttle(() => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const scrollPercent = Math.min(scrollTop / windowHeight, 1);
      
      // Subtle rotation based on scroll
      const rotation = scrollPercent * 2;
      
      requestAnimationFrame(() => {
        if (this.mandalaGrid) {
          this.mandalaGrid.style.transform += ` rotateZ(${rotation}deg)`;
        }
      });
    }, 16);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  setupItemInteractions() {
    this.mandalaItems.forEach((item, index) => {
      this.setupItemEvents(item, index);
    });
    
    if (this.mandalaCenter) {
      this.setupCenterEvents();
    }
  }
  
  setupItemEvents(item, index) {
    const animationDelay = index * 50; // Stagger animations
    
    if (AppState.isTouch) {
      this.setupTouchEvents(item);
    } else {
      this.setupHoverEvents(item);
    }
    
    // Intersection observer for entrance animations
    if ('IntersectionObserver' in window && !AppState.isReducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, animationDelay);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(item);
    }
  }
  
  setupTouchEvents(item) {
    let touchStartTime = 0;
    let touchStartY = 0;
    
    item.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartY = e.touches[0].clientY;
      
      // Visual feedback for touch
      item.style.transform = 'scale(0.98)';
      item.style.transition = 'transform 0.1s ease';
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      // Dim other items
      this.dimOtherItems(item);
    }, { passive: true });
    
    item.addEventListener('touchend', (e) => {
      const touchEndTime = Date.now();
      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = touchEndTime - touchStartTime;
      const touchDistance = Math.abs(touchEndY - touchStartY);
      
      // Reset visual state
      item.style.transform = '';
      item.style.transition = '';
      
      // Check if this was a tap (not a scroll)
      if (touchDuration < 500 && touchDistance < 10) {
        this.handleItemActivation(item);
      }
      
      // Restore other items
      this.restoreOtherItems();
    }, { passive: true });
    
    item.addEventListener('touchcancel', () => {
      item.style.transform = '';
      item.style.transition = '';
      this.restoreOtherItems();
    }, { passive: true });
  }
  
  setupHoverEvents(item) {
    item.addEventListener('mouseenter', () => {
      if (!AppState.isReducedMotion) {
        this.createGlitchEffect(item);
      }
      this.dimOtherItems(item);
    });
    
    item.addEventListener('mouseleave', () => {
      this.stopGlitchEffect(item);
      this.restoreOtherItems();
    });
    
    item.addEventListener('click', () => {
      this.handleItemActivation(item);
    });
  }
  
  setupCenterEvents() {
    if (AppState.isTouch) {
      this.mandalaCenter.addEventListener('touchstart', () => {
        this.mandalaCenter.style.transform = 'scale(1.02)';
      }, { passive: true });
      
      this.mandalaCenter.addEventListener('touchend', () => {
        this.mandalaCenter.style.transform = '';
      }, { passive: true });
    }
  }
  
  dimOtherItems(activeItem) {
    this.mandalaItems.forEach(item => {
      if (item !== activeItem) {
        item.style.opacity = '0.6';
        item.style.transition = 'opacity 0.2s ease';
      }
    });
  }
  
  restoreOtherItems() {
    this.mandalaItems.forEach(item => {
      item.style.opacity = '';
      item.style.transition = '';
    });
  }
  
  handleItemActivation(item) {
    // Add activation effect
    if (!AppState.isReducedMotion) {
      item.classList.add('activated');
      setTimeout(() => {
        item.classList.remove('activated');
      }, 300);
    }
    
    // Handle navigation
    const link = item.querySelector('a');
    if (link) {
      // Add a small delay for visual feedback
      setTimeout(() => {
        window.location.href = link.href;
      }, 100);
    }
  }
  
  createGlitchEffect(element) {
    if (AppState.isReducedMotion || AppState.isLowBattery) return;
    
    element.classList.add('glitching');
    
    // Mobile gets simpler effect
    if (AppState.isMobile) {
      element.style.transform = 'translate(1px, -1px)';
      setTimeout(() => {
        element.style.transform = '';
        element.classList.remove('glitching');
      }, 200);
      return;
    }
    
    // Desktop gets full effect
    let glitchCount = 0;
    const maxGlitches = 5;
    
    const glitchInterval = setInterval(() => {
      if (glitchCount >= maxGlitches) {
        clearInterval(glitchInterval);
        element.style.transform = '';
        return;
      }
      
      const randX = (Math.random() - 0.5) * 4;
      const randY = (Math.random() - 0.5) * 4;
      const randSkew = (Math.random() - 0.5) * 4;
      
      element.style.transform = `translate(${randX}px, ${randY}px) skew(${randSkew}deg)`;
      
      setTimeout(() => {
        element.style.transform = '';
      }, 50);
      
      glitchCount++;
    }, 150);
    
    // Store interval for cleanup
    element.glitchInterval = glitchInterval;
  }
  
  stopGlitchEffect(element) {
    element.classList.remove('glitching');
    element.style.transform = '';
    
    if (element.glitchInterval) {
      clearInterval(element.glitchInterval);
      delete element.glitchInterval;
    }
  }
  
  setupAccessibility() {
    // Add ARIA labels and keyboard navigation
    this.mandalaItems.forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      
      const title = item.querySelector('.mandala-item-title');
      const subtitle = item.querySelector('.mandala-item-subtitle');
      
      if (title && subtitle) {
        const ariaLabel = `${title.textContent} - ${subtitle.textContent}`;
        item.setAttribute('aria-label', ariaLabel);
      }
      
      // Keyboard navigation
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleItemActivation(item);
        }
      });
      
      // Focus management
      item.addEventListener('focus', () => {
        if (!AppState.isReducedMotion) {
          item.style.outline = '2px solid var(--holographic-teal)';
          item.style.outlineOffset = '2px';
        }
      });
      
      item.addEventListener('blur', () => {
        item.style.outline = '';
        item.style.outlineOffset = '';
      });
    });
  }
}

/**
 * Cyberpunk Text Effects with performance optimization
 */
class CyberpunkTextEffects {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupTitleEffects();
    this.setupAuthorNameEffects();
  }
  
  setupTitleEffects() {
    const siteTitle = document.querySelector('.site-title, h1');
    if (!siteTitle || AppState.isMobile || AppState.isReducedMotion) return;
    
    siteTitle.addEventListener('mouseenter', () => {
      this.createTextGlitch(siteTitle);
    });
  }
  
  setupAuthorNameEffects() {
    const authorName = document.querySelector('.author-name');
    if (!authorName || AppState.isMobile || AppState.isReducedMotion) return;
    
    authorName.addEventListener('mouseenter', () => {
      this.createMatrixEffect(authorName);
    });
  }
  
  createTextGlitch(element) {
    const originalText = element.textContent;
    element.classList.add('text-glitch');
    
    setTimeout(() => {
      element.classList.remove('text-glitch');
      element.textContent = originalText;
    }, 600);
  }
  
  createMatrixEffect(element) {
    if (!element.dataset.originalText) {
      element.dataset.originalText = element.textContent;
    }
    
    const originalText = element.dataset.originalText;
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    let iterations = 0;
    
    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      if (iterations >= originalText.length) {
        clearInterval(interval);
      }
      
      iterations += 1/3;
    }, 60);
  }
}

/**
 * Performance monitoring and optimization
 */
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    
    this.init();
  }
  
  init() {
    this.measureFPS();
    this.setupPerformanceObserver();
  }
  
  measureFPS() {
    const now = performance.now();
    this.frameCount++;
    
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      
      // Adjust performance based on FPS
      if (this.fps < 30) {
        document.body.classList.add('low-performance');
      } else {
        document.body.classList.remove('low-performance');
      }
    }
    
    requestAnimationFrame(() => this.measureFPS());
  }
  
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.duration > 100) {
            console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
    }
  }
}

/**
 * Lazy loading and image optimization
 */
class ImageOptimizer {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.setupLazyLoading();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }
  
  setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    this.images.forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  loadAllImages() {
    this.images.forEach(img => {
      img.classList.add('loaded');
    });
  }
}

/**
 * Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
  // Detect device capabilities first
  detectDeviceCapabilities();
  updatePerformanceMode();
  
  // Mark as initialized
  AppState.initialized = true;
  
  // Initialize modules based on device capabilities
  if (!AppState.isReducedMotion) {
    new MandalaEffects();
    new CyberpunkTextEffects();
  }
  
  new ImageOptimizer();
  
  // Only start performance monitoring on desktop
  if (!AppState.isMobile) {
    new PerformanceMonitor();
  }
  
  // Add loaded class to body for CSS hooks
  document.body.classList.add('js-loaded');
  
  console.log('🚀 Hugo Author Website loaded with optimizations:', {
    isMobile: AppState.isMobile,
    isTouch: AppState.isTouch,
    isReducedMotion: AppState.isReducedMotion,
    isLowBattery: AppState.isLowBattery
  });
});

/**
 * Service Worker registration for PWA capabilities
 */
if ('serviceWorker' in navigator && !AppState.isMobile) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

/**
 * Export for testing and debugging
 */
window.AuthorWebsite = {
  AppState,
  detectDeviceCapabilities,
  updatePerformanceMode
};
