// PROGRESSIVE ENHANCEMENT MAIN.JS
// Modern, capability-aware initialization system

// Global mobile detection function
function isMobileDevice() {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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
      if (!window.ProgressiveEnhancement || !window.ProgressiveEnhancement.initialized) {
        console.log('Progressive enhancement system not available, using fallback');
        initFallbackMode();
      }
    }, 1000);
  }
    // Always initialize basic functionality
  initBasicFeatures();
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
      
      // Touch events for mobile
      item.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Touch end - navigating to:', link.href);
        window.location.href = link.href;
      });
      
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
  initBasicFormHandling();
  initCyberpunkTextEffects(); // Keep legacy text effects for brand consistency
  initMandalaLinks(); // Ensure mandala links work on all devices
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
