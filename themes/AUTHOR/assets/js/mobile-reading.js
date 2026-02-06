/**
 * Mobile Reading Experience Enhancements
 * Provides reading mode, font size controls, progress tracking, and accessibility features
 */

class MobileReadingExperience {
  constructor() {
    this.readingMode = false;
    this.fontSize = 'normal';
    this.controlsExpanded = false;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupFeatures());
    } else {
      this.setupFeatures();
    }
  }

  setupFeatures() {
    this.setupReadingProgress();
    this.setupControlsToggle();
    this.setupReadingModeToggle();
    this.setupFontSizeToggle();
    this.setupExpandableContent();
    this.setupKeyboardNavigation();
    this.setupGestureSupport();
    this.restoreUserPreferences();
  }

  /**
   * Controls Toggle (Show/Hide Reading Options)
   */
  setupControlsToggle() {
    const toggleBtn = document.querySelector('.reading-controls-toggle');
    const controls = document.querySelector('.mobile-reading-controls');
    if (!toggleBtn || !controls) return;

    let autoHideTimer = null;

    const startAutoHideTimer = () => {
      // Clear any existing timer
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }

      // Set new timer to auto-hide after 3 seconds
      if (this.controlsExpanded) {
        autoHideTimer = setTimeout(() => {
          this.controlsExpanded = false;
          this.applyControlsState();
          this.saveUserPreferences();
        }, 3000);
      }
    };

    const cancelAutoHide = () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        autoHideTimer = null;
      }
    };

    toggleBtn.addEventListener('click', () => {
      this.controlsExpanded = !this.controlsExpanded;
      this.applyControlsState();
      this.saveUserPreferences();

      // Announce to screen readers
      this.announceToScreenReader(
        this.controlsExpanded ? 'Reading controls expanded' : 'Reading controls collapsed'
      );

      // Start auto-hide timer when expanded
      if (this.controlsExpanded) {
        startAutoHideTimer();
      } else {
        cancelAutoHide();
      }
    });

    // Cancel auto-hide when hovering over controls
    controls.addEventListener('mouseenter', cancelAutoHide);
    controls.addEventListener('mouseleave', startAutoHideTimer);

    // Cancel auto-hide when interacting with controls
    controls.addEventListener('click', () => {
      // Keep controls open briefly after interaction
      cancelAutoHide();
      startAutoHideTimer();
    });

    // Close controls when clicking outside
    document.addEventListener('click', (e) => {
      if (this.controlsExpanded &&
          !controls.contains(e.target) &&
          !toggleBtn.contains(e.target)) {
        this.controlsExpanded = false;
        this.applyControlsState();
        this.saveUserPreferences();
        cancelAutoHide();
      }
    });
  }

  applyControlsState() {
    const toggleBtn = document.querySelector('.reading-controls-toggle');
    const controls = document.querySelector('.mobile-reading-controls');

    if (this.controlsExpanded) {
      controls?.classList.remove('collapsed');
      controls?.setAttribute('aria-hidden', 'false');
      toggleBtn?.setAttribute('aria-expanded', 'true');
    } else {
      controls?.classList.add('collapsed');
      controls?.setAttribute('aria-hidden', 'true');
      toggleBtn?.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Reading Progress Indicator
   */
  setupReadingProgress() {
    const progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) return;

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    let ticking = false;

    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      
      progressBar.style.width = `${scrollPercent}%`;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Throttled scroll listener for better performance
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial update
    updateProgress();
  }

  /**
   * Reading Mode Toggle
   */
  setupReadingModeToggle() {
    const toggleBtn = document.querySelector('.reading-mode-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      this.readingMode = !this.readingMode;
      this.applyReadingMode();
      this.saveUserPreferences();
      
      // Announce to screen readers
      this.announceToScreenReader(
        this.readingMode ? 'Reading mode enabled' : 'Reading mode disabled'
      );
    });
  }

  applyReadingMode() {
    const body = document.body;
    const toggleBtn = document.querySelector('.reading-mode-toggle');
    
    if (this.readingMode) {
      body.classList.add('reading-mode');
      toggleBtn?.setAttribute('aria-pressed', 'true');
    } else {
      body.classList.remove('reading-mode');
      toggleBtn?.setAttribute('aria-pressed', 'false');
    }
  }

  /**
   * Font Size Toggle
   */
  setupFontSizeToggle() {
    const toggleBtn = document.querySelector('.font-size-toggle');
    if (!toggleBtn) return;

    const fontSizes = ['small', 'normal', 'large'];
    let currentIndex = 1; // Start with 'normal'

    toggleBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % fontSizes.length;
      this.fontSize = fontSizes[currentIndex];
      this.applyFontSize();
      this.saveUserPreferences();
      
      // Announce to screen readers
      this.announceToScreenReader(`Font size changed to ${this.fontSize}`);
    });
  }

  applyFontSize() {
    const body = document.body;
    
    // Remove all font size classes
    body.classList.remove('font-size-small', 'font-size-large');
    
    // Apply current font size
    if (this.fontSize !== 'normal') {
      body.classList.add(`font-size-${this.fontSize}`);
    }
  }

  /**
   * Expandable Content Sections
   */
  setupExpandableContent() {
    const toggles = document.querySelectorAll('.transcript-toggle, .section-toggle');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const targetId = toggle.getAttribute('aria-controls');
        const content = document.getElementById(targetId);
        
        if (content) {
          toggle.setAttribute('aria-expanded', !isExpanded);
          content.setAttribute('aria-hidden', isExpanded);
          
          if (isExpanded) {
            content.classList.remove('expanded');
          } else {
            content.classList.add('expanded');
          }
          
          // Announce to screen readers
          this.announceToScreenReader(
            isExpanded ? 'Section collapsed' : 'Section expanded'
          );
        }
      });
    });
  }

  /**
   * Keyboard Navigation Enhancement
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Controls toggle with 'O' key (Options)
      if (e.key.toLowerCase() === 'o' && e.ctrlKey) {
        e.preventDefault();
        const toggleBtn = document.querySelector('.reading-controls-toggle');
        if (toggleBtn) toggleBtn.click();
      }

      // Reading mode toggle with 'R' key
      if (e.key.toLowerCase() === 'r' && e.ctrlKey) {
        e.preventDefault();
        const toggleBtn = document.querySelector('.reading-mode-toggle');
        if (toggleBtn) toggleBtn.click();
      }

      // Font size toggle with 'F' key
      if (e.key.toLowerCase() === 'f' && e.ctrlKey) {
        e.preventDefault();
        const toggleBtn = document.querySelector('.font-size-toggle');
        if (toggleBtn) toggleBtn.click();
      }

      // Navigate between sections with arrow keys
      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        const prevLink = document.querySelector('.nav-prev');
        if (prevLink) prevLink.click();
      }

      if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        const nextLink = document.querySelector('.nav-next');
        if (nextLink) nextLink.click();
      }
    });
  }

  /**
   * Touch Gesture Support
   */
  setupGestureSupport() {
    if (!('ontouchstart' in window)) return;

    let startX = 0;
    let startY = 0;
    const minSwipeDistance = 100;
    const maxVerticalDistance = 150;

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    mainContent.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Check if it's a horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
        if (deltaX > 0) {
          // Swipe right - previous content
          const prevLink = document.querySelector('.nav-prev');
          if (prevLink) {
            this.announceToScreenReader('Navigating to previous content');
            prevLink.click();
          }
        } else {
          // Swipe left - next content
          const nextLink = document.querySelector('.nav-next');
          if (nextLink) {
            this.announceToScreenReader('Navigating to next content');
            nextLink.click();
          }
        }
      }
      
      startX = 0;
      startY = 0;
    }, { passive: true });
  }

  /**
   * User Preferences Management
   */
  saveUserPreferences() {
    const preferences = {
      readingMode: this.readingMode,
      fontSize: this.fontSize
      // Note: controlsExpanded is intentionally NOT saved - always start collapsed
    };

    try {
      localStorage.setItem('mobileReadingPreferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Could not save reading preferences:', e);
    }
  }

  restoreUserPreferences() {
    try {
      const saved = localStorage.getItem('mobileReadingPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.readingMode = preferences.readingMode || false;
        this.fontSize = preferences.fontSize || 'normal';
        // Always start with controls collapsed
        this.controlsExpanded = false;

        this.applyReadingMode();
        this.applyFontSize();
        this.applyControlsState();
      }
    } catch (e) {
      console.warn('Could not restore reading preferences:', e);
    }
  }

  /**
   * Screen Reader Announcements
   */
  announceToScreenReader(message) {
    let announcer = document.getElementById('reading-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'reading-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }

  /**
   * Performance Monitoring
   */
  monitorPerformance() {
    if ('performance' in window && 'measure' in performance) {
      // Monitor reading interactions
      const startTime = performance.now();
      
      window.addEventListener('beforeunload', () => {
        const endTime = performance.now();
        const readingTime = endTime - startTime;
        
        // Log reading session (could send to analytics)
        console.log(`Reading session: ${Math.round(readingTime / 1000)}s`);
      });
    }
  }

  /**
   * Accessibility Enhancements
   */
  enhanceAccessibility() {
    // Add skip link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only';
    skipLink.style.cssText = `
      position: fixed;
      top: -40px;
      left: 6px;
      background: var(--holographic-teal);
      color: var(--ink-black);
      padding: 8px;
      text-decoration: none;
      z-index: 9999;
      border-radius: 4px;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  /**
   * Error Handling
   */
  handleError(error, context) {
    console.error(`Mobile Reading Experience Error (${context}):`, error);
    
    // Graceful degradation - ensure basic functionality still works
    if (context === 'preferences') {
      this.readingMode = false;
      this.fontSize = 'normal';
    }
  }
}

// Initialize when the script loads
try {
  const mobileReading = new MobileReadingExperience();
  
  // Make it globally available for debugging
  window.mobileReading = mobileReading;
  
} catch (error) {
  console.error('Failed to initialize Mobile Reading Experience:', error);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileReadingExperience;
}
