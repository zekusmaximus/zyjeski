// PROGRESSIVE ENHANCEMENT MAIN.JS
// Modern, capability-aware initialization system

document.addEventListener('DOMContentLoaded', function() {
  // Wait for progressive enhancement system to initialize
  if (window.ProgressiveEnhancement && window.ProgressiveEnhancement.initialized) {
    initEnhancedFeatures();
  } else {
    document.addEventListener('progressive-enhancement-ready', initEnhancedFeatures);
  }
  
  // Always initialize basic functionality
  initBasicFeatures();
});

function initBasicFeatures() {
  // Core functionality that works on all devices
  initKeyboardNavigation();
  initBasicAccessibility();
  initBasicAudioPlayers();
  initBasicFormHandling();
  initCyberpunkTextEffects(); // Keep legacy text effects for brand consistency
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
