// PROGRESSIVE ENHANCEMENT MAIN.JS
// Modern, capability-aware initialization system

// Global mobile detection function
function isMobileDevice() {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Mobile Reading Experience class - embedded for immediate availability
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

  setupControlsToggle() {
    const toggleBtn = document.querySelector('.reading-controls-toggle');
    const controls = document.querySelector('.mobile-reading-controls');
    if (!toggleBtn || !controls) return;

    toggleBtn.addEventListener('click', () => {
      this.controlsExpanded = !this.controlsExpanded;
      this.applyControlsState();
      this.saveUserPreferences();

      this.announceToScreenReader(
        this.controlsExpanded ? 'Reading controls expanded' : 'Reading controls collapsed'
      );
    });

    // Close controls when clicking outside
    document.addEventListener('click', (e) => {
      if (this.controlsExpanded &&
          !controls.contains(e.target) &&
          !toggleBtn.contains(e.target)) {
        this.controlsExpanded = false;
        this.applyControlsState();
        this.saveUserPreferences();
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

    window.addEventListener('scroll', requestTick, { passive: true });
    updateProgress();
  }

  setupReadingModeToggle() {
    const toggleBtn = document.querySelector('.reading-mode-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      this.readingMode = !this.readingMode;
      this.applyReadingMode();
      this.saveUserPreferences();
      
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

          this.announceToScreenReader(
            isExpanded ? 'Section collapsed' : 'Section expanded'
          );
        }
      });
    });
  }

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

      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
        if (deltaX > 0) {
          const prevLink = document.querySelector('.nav-prev');
          if (prevLink) {
            this.announceToScreenReader('Navigating to previous content');
            prevLink.click();
          }
        } else {
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

  saveUserPreferences() {
    try {
      const preferences = {
        readingMode: this.readingMode,
        fontSize: this.fontSize,
        controlsExpanded: this.controlsExpanded
      };
      localStorage.setItem('mobileReadingPreferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Unable to save reading preferences:', e);
    }
  }

  restoreUserPreferences() {
    try {
      const saved = localStorage.getItem('mobileReadingPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.readingMode = preferences.readingMode || false;
        this.fontSize = preferences.fontSize || 'normal';
        this.controlsExpanded = preferences.controlsExpanded || false;
        this.applyReadingMode();
        this.applyFontSize();
        this.applyControlsState();
      }
    } catch (e) {
      console.warn('Unable to restore reading preferences:', e);
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Global variable to access reading experience
let mobileReadingExperience;

// Disable mandala effects on mobile - run immediately
function disableMandalaEffectsOnMobile() {
  if (isMobileDevice()) {
    const mandalaGrid = document.querySelector('.mandala-grid');
    const mandalaContainer = document.querySelector('.mandala-container');
    
    if (mandalaGrid) {
      mandalaGrid.style.setProperty('transform', 'none', 'important');
      mandalaGrid.style.setProperty('perspective', 'none', 'important');
      mandalaGrid.style.setProperty('transform-style', 'flat', 'important');
    }
    
    if (mandalaContainer) {
      mandalaContainer.style.setProperty('perspective', 'none', 'important');
    }
    
    console.log('Mobile device detected - mandala 3D effects disabled');
    return true; // Mobile detected
  }
  return false; // Not mobile
}

// Run mobile check immediately when script loads
const isMobileInitially = disableMandalaEffectsOnMobile();

document.addEventListener('DOMContentLoaded', function() {
  // ALWAYS initialize basic features first (including links)
  initBasicFeatures();
  
  // Re-check mobile for 3D effects only
  if (disableMandalaEffectsOnMobile()) {
    return; // Exit early for mobile 3D effects only
  }
  
  // Initialize mandala 3D effects for desktop
  initBasicMandalaEffects();
  
  // Wait for progressive enhancement system to initialize
  if (window.ProgressiveEnhancement && window.ProgressiveEnhancement.initialized) {
    initEnhancedFeatures();
  } else {
    document.addEventListener('progressive-enhancement-ready', initEnhancedFeatures);
    
    // Fallback initialization after short delay if PE system doesn't load
    setTimeout(() => {
      if (!window.ProgressiveEnhancement || !window.ProgressiveEnhancement.initialized) {        console.log('Progressive enhancement system not available, using fallback');
        initFallbackMode();
      }
    }, 1000);
  }
});

// Global resize handler to disable effects when switching to mobile
window.addEventListener('resize', function() {
  disableMandalaEffectsOnMobile();
}, { passive: true });

function initBasicMandalaEffects() {
  const mandalaGrid = document.querySelector('.mandala-grid');
  const mandalaContainer = document.querySelector('.mandala-container');
  
  if (!mandalaGrid || !mandalaContainer) return;
  
  // Check if we're on a mobile device using the global function
  if (isMobileDevice()) {
    console.log('Mobile device detected - skipping mandala 3D effects');
    // Ensure no transforms are applied on mobile
    mandalaGrid.style.setProperty('transform', 'none', 'important');
    mandalaContainer.style.perspective = 'none';
    return; // Exit early for mobile devices
  }
  
  console.log('Initializing basic mandala effects');
  
  // Force enable perspective and remove limiting classes temporarily
  mandalaContainer.style.perspective = '1000px';
  mandalaGrid.style.transformStyle = 'preserve-3d';
  
  // Add basic 3D tilting effect
  let isAnimating = false;
  
  const handleMouseMove = (e) => {
    if (isAnimating) return;
    
    const rect = mandalaContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateY = (e.clientX - centerX) / (rect.width / 2) * 8;
    const rotateX = (e.clientY - centerY) / (rect.height / 2) * -8;
    
    const limitedRotateY = Math.max(-8, Math.min(8, rotateY));
    const limitedRotateX = Math.max(-8, Math.min(8, rotateX));
    
    requestAnimationFrame(() => {
      // Override any progressive enhancement restrictions for this effect
      mandalaGrid.style.setProperty('transform', `perspective(1000px) rotateX(${limitedRotateX}deg) rotateY(${limitedRotateY}deg)`, 'important');
      mandalaGrid.style.transition = 'transform 0.1s ease-out';
    });
  };
  
  const handleMouseLeave = () => {
    mandalaGrid.style.setProperty('transform', 'perspective(1000px) rotateX(0deg) rotateY(0deg)', 'important');
    mandalaGrid.style.transition = 'transform 0.5s ease-out';
  };
  
  mandalaContainer.addEventListener('mousemove', handleMouseMove);
  mandalaContainer.addEventListener('mouseleave', handleMouseLeave);
  // Add scroll-based rotation
  const handleScroll = () => {
    if (isAnimating) return;
    
    // Double-check we're not on mobile before applying scroll effects
    if (isMobileDevice()) return;
    
    const scrollY = window.pageYOffset;
    const scrollProgress = Math.min(scrollY / window.innerHeight, 1);
    const rotationAngle = scrollProgress * 3;
    
    requestAnimationFrame(() => {
      const currentTransform = mandalaGrid.style.transform || '';
      const baseTransform = currentTransform.replace(/rotateZ\([^)]*\)/g, '').trim();
      mandalaGrid.style.setProperty('transform', `${baseTransform} rotateZ(${rotationAngle}deg)`, 'important');
    });
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
    // Add resize handler to re-check mobile status
  const handleResize = () => {
    if (isMobileDevice()) {
      // If resized to mobile, disable effects
      mandalaGrid.style.setProperty('transform', 'none', 'important');
      mandalaContainer.style.perspective = 'none';
      // Remove event listeners
      mandalaContainer.removeEventListener('mousemove', handleMouseMove);
      mandalaContainer.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    }
  };
    window.addEventListener('resize', handleResize, { passive: true });
  
  console.log('Basic mandala effects initialized with forced 3D support');
}

function initMandalaLinks() {
  // Ensure mandala links work regardless of 3D effects or device type
  console.log('Starting mandala links initialization...');
  
  const mandalaItems = document.querySelectorAll('.mandala-item');
  
  console.log(`Found ${mandalaItems.length} mandala items`);
  
  if (mandalaItems.length === 0) {
    console.warn('No mandala items found - links initialization skipped');
    return;
  }
  
  console.log('Initializing mandala links for all devices');
  
  let linksInitialized = 0;
  
  mandalaItems.forEach((item, index) => {
    const link = item.querySelector('a');
    console.log(`Item ${index}: link found =`, !!link);
    
    if (link) {
      linksInitialized++;
      console.log(`Initializing link ${linksInitialized}: ${link.href}`);
      
      // Simple, robust click handler
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Item clicked - navigating to:', link.href);
        window.location.href = link.href;
      });
        // Touch events for mobile with scroll detection
      let touchStartTime = 0;
      let touchStartY = 0;
      let touchStartX = 0;
      
      item.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      
      item.addEventListener('touchend', (e) => {
        const touchEndTime = Date.now();
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistanceY = Math.abs(touchEndY - touchStartY);
        const touchDistanceX = Math.abs(touchEndX - touchStartX);
        const totalTouchDistance = Math.sqrt(touchDistanceX * touchDistanceX + touchDistanceY * touchDistanceY);
        
        // Only navigate if this was a tap (short duration, minimal movement)
        // and not a scroll gesture (longer distance)
        if (touchDuration < 500 && totalTouchDistance < 15) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Touch tap detected - navigating to:', link.href);
          window.location.href = link.href;
        } else {
          console.log('Touch scroll detected - not navigating');
        }
      }, { passive: false });
      
      // Visual feedback
      if (isMobileDevice()) {
        item.addEventListener('touchstart', () => {
          item.style.opacity = '0.7';
          item.style.transition = 'opacity 0.2s ease';
        });
        
        item.addEventListener('touchend', () => {
          setTimeout(() => {
            item.style.opacity = '';
          }, 200);
        });
      } else {
        // Desktop hover effects
        item.addEventListener('mouseenter', () => {
          item.style.transform = 'translateY(-2px)';
          item.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.transform = '';
        });
      }
      
      // Keyboard accessibility
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('Keyboard navigation to:', link.href);
          window.location.href = link.href;
        }
      });
    }
  });
  
  console.log(`Mandala links initialization complete. ${linksInitialized} links initialized.`);
}

function initBasicFeatures() {
  // Core functionality that works on all devices
  console.log('Initializing basic features...');
  initKeyboardNavigation();
  initBasicAccessibility();
  initBasicAudioPlayers();
  initBasicFormHandling();  initCyberpunkTextEffects(); // Keep legacy text effects for brand consistency
  initMandalaLinks(); // Ensure mandala links work on all devices
  
  // Initialize mobile reading experience for font size and reading mode controls
  if (!mobileReadingExperience) {
    mobileReadingExperience = new MobileReadingExperience();
  }
  
  console.log('Basic features initialization complete');
}

function initEnhancedFeatures(event) {
  const capabilities = event?.detail?.capabilities || window.ProgressiveEnhancement?.getCapabilities();
  const features = event?.detail?.features || window.ProgressiveEnhancement?.getFeatures();
  
  if (!capabilities || !features) {
    console.warn('Progressive enhancement data not available, using fallback');
    initFallbackMode();
    return;
  }
  
  console.log('Initializing enhanced features:', features);
  
  // Initialize features based on what's enabled
  if (features.basicInteractivity) {
    initEnhancedInteractivity(capabilities);
  }
  
  if (features.mandala3D) {
    console.log('3D Mandala effects enabled');
  }
  
  if (features.prayerWheelAnimation) {
    console.log('Prayer wheel animations enabled');
  }
  
  if (features.audioVisualization) {
    console.log('Audio visualization enabled');
  }
}

function initKeyboardNavigation() {
  // Enhanced keyboard navigation for mandala grid
  const mandalaGrid = document.querySelector('.mandala-grid');
  if (!mandalaGrid) return;
  
  const items = mandalaGrid.querySelectorAll('.mandala-item[tabindex]');
  let currentIndex = 0;
  
  mandalaGrid.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        items[currentIndex].focus();
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        items[currentIndex].focus();
        break;
        
      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        items[currentIndex].focus();
        break;
        
      case 'End':
        e.preventDefault();
        currentIndex = items.length - 1;
        items[currentIndex].focus();
        break;
    }
  });
}

function initBasicAccessibility() {
  // Announce important changes to screen readers
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = 'live-announcements';
  document.body.appendChild(liveRegion);
  
  // Store reference for other functions to use
  window.announceToScreenReader = (message) => {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  };
}

function initBasicAudioPlayers() {
  // Initialize basic HTML5 audio for prayer wheels without enhancements
  const prayerWheels = document.querySelectorAll('.prayer-wheel-player');
  
  prayerWheels.forEach(player => {
    const audioFile = player.dataset.audio;
    if (!audioFile) return;
    
    const playButton = player.querySelector('.play-pause-btn');
    const progressBar = player.querySelector('.progress-bar');
    const timeDisplay = player.querySelector('.time-display');
    
    if (!playButton) return;
    
    // Create audio element
    const audio = new Audio(audioFile);
    audio.preload = 'metadata';
    
    let isPlaying = false;
    
    // Basic play/pause functionality
    playButton.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayButton(playButton, false);
        // Dispatch custom event for enhanced features
        player.dispatchEvent(new CustomEvent('audio-pause'));
      } else {
        audio.play().then(() => {
          isPlaying = true;
          updatePlayButton(playButton, true);
          // Dispatch custom event for enhanced features
          player.dispatchEvent(new CustomEvent('audio-play', { 
            detail: { audioElement: audio } 
          }));
        }).catch(e => {
          console.warn('Audio playback failed:', e);
          window.announceToScreenReader?.('Audio playback failed');
        });
      }
    });
    
    // Basic progress tracking
    if (progressBar && timeDisplay) {
      audio.addEventListener('timeupdate', () => {
        updateBasicProgress(audio, progressBar, timeDisplay);
      });
    }
    
    audio.addEventListener('ended', () => {
      isPlaying = false;
      updatePlayButton(playButton, false);
      player.dispatchEvent(new CustomEvent('audio-ended'));
    });
  });
}

function updatePlayButton(button, isPlaying) {
  const playIcon = button.querySelector('.play-icon');
  const pauseIcon = button.querySelector('.pause-icon');
  const stateText = button.querySelector('.btn-state-text');
  
  if (isPlaying) {
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'inline';
    if (stateText) stateText.textContent = 'Pause';
    button.setAttribute('aria-pressed', 'true');
  } else {
    if (playIcon) playIcon.style.display = 'inline';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (stateText) stateText.textContent = 'Play';
    button.setAttribute('aria-pressed', 'false');
  }
}

function updateBasicProgress(audio, progressBar, timeDisplay) {
  if (!audio.duration) return;
  
  const percent = (audio.currentTime / audio.duration) * 100;
  const progressFill = progressBar.querySelector('.progress-fill');
  
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
  
  progressBar.setAttribute('aria-valuenow', Math.round(percent));
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
}

function initBasicFormHandling() {
  // Basic form enhancements
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
      }
    });
  });
}

function initEnhancedInteractivity(capabilities) {
  // Enhanced interactions based on device capabilities
  const mandalaItems = document.querySelectorAll('.mandala-item');
  
  mandalaItems.forEach(item => {
    // Add enhanced focus effects
    item.addEventListener('focus', () => {
      window.announceToScreenReader?.(`Focused on ${item.querySelector('.mandala-item-title')?.textContent || 'navigation item'}`);
    });
    
    // Add touch feedback for touch devices
    if (capabilities.touchSupport) {
      item.addEventListener('touchstart', () => {
        item.classList.add('touch-active');
      }, { passive: true });
      
      item.addEventListener('touchend', () => {
        item.classList.remove('touch-active');
      }, { passive: true });
    }
  });
}

function initFallbackMode() {
  console.log('Initializing fallback mode');
  document.body.classList.add('enhancement-fallback');
  
  // Ensure basic mandala grid works
  const mandalaGrid = document.querySelector('.mandala-grid');
  if (mandalaGrid) {
    mandalaGrid.classList.add('basic-mandala-fallback');
  }
}

// Legacy cyberpunk text effects (simplified for compatibility)
function initCyberpunkTextEffects() {
  const glitchTargets = document.querySelectorAll('h1, h2, .glitch-text');
  
  glitchTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      if (window.ProgressiveEnhancement?.isFeatureEnabled('complexAnimations')) {
        target.classList.add('glitch-active');
        setTimeout(() => {
          target.classList.remove('glitch-active');
        }, 500);
      }
    });
  });
}

// Error handling and reporting
window.addEventListener('error', (e) => {
  console.warn('JavaScript error:', e.error);
  // Ensure fallback mode if critical errors occur
  if (!document.body.classList.contains('enhancement-fallback')) {
    initFallbackMode();
  }
});

// Progressive loading indicator
function showLoadingState() {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.setAttribute('aria-label', 'Loading enhanced features');
  loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
  
  document.body.appendChild(loadingIndicator);
  
  // Remove after enhancement loads or timeout
  setTimeout(() => {
    loadingIndicator.remove();
  }, 3000);
  
  document.addEventListener('progressive-enhancement-ready', () => {
    loadingIndicator.remove();
  }, { once: true });
}
