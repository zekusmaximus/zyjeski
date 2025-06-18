/**
 * PRAYER WHEEL ANIMATION MODULE
 * Progressive enhancement for prayer wheel audio player
 */

export function initPrayerWheel(capabilities) {
  const prayerWheels = document.querySelectorAll('.prayer-wheel-player');
  
  if (!prayerWheels.length) return;
  
  const config = getPrayerWheelConfig(capabilities);
  
  prayerWheels.forEach(player => {
    initSinglePrayerWheel(player, config);
  });
}

function getPrayerWheelConfig(capabilities) {
  const baseConfig = {
    animationDuration: 1000,
    rotationSpeed: 1,
    visualEffects: false,
    smoothRotation: false,
    particleEffects: false,
    glowEffects: false
  };
  
  switch (capabilities.performance) {
    case 'high':
      return {
        ...baseConfig,
        animationDuration: 1200,
        rotationSpeed: 1.2,
        visualEffects: true,
        smoothRotation: true,
        particleEffects: capabilities.motionPreference !== 'reduce',
        glowEffects: true
      };
      
    case 'medium':
      return {
        ...baseConfig,
        animationDuration: 800,
        rotationSpeed: 1,
        visualEffects: true,
        smoothRotation: true,
        particleEffects: false,
        glowEffects: false
      };
      
    case 'low':
    default:
      return {
        ...baseConfig,
        animationDuration: 500,
        rotationSpeed: 0.8,
        visualEffects: false,
        smoothRotation: false,
        particleEffects: false,
        glowEffects: false
      };
  }
}

function initSinglePrayerWheel(player, config) {
  const audioFile = player.dataset.audio;
  if (!audioFile) return;
  
  const wheel = player.querySelector('.prayer-wheel');
  const playButton = player.querySelector('.play-pause-btn');
  const progressBar = player.querySelector('.progress-bar');
  const progressFill = player.querySelector('.progress-fill');
  const timeDisplay = player.querySelector('.time-display');
  
  if (!wheel || !playButton) return;
  
  // Create audio element
  const audio = new Audio(audioFile);
  audio.preload = 'metadata';
  
  // State management
  let isPlaying = false;
  let rotationAngle = 0;
  let animationFrame;
  
  // Enhanced wheel setup
  setupWheelEnhancements(wheel, config);
  
  // Audio event listeners
  audio.addEventListener('loadedmetadata', () => {
    updateTimeDisplay(0, audio.duration);
  });
  
  audio.addEventListener('timeupdate', () => {
    updateProgress(audio.currentTime, audio.duration);
    updateTimeDisplay(audio.currentTime, audio.duration);
  });
  
  audio.addEventListener('ended', () => {
    stopWheelAnimation();
    updatePlayButton(false);
    isPlaying = false;
  });
  
  audio.addEventListener('error', (e) => {
    console.warn('Audio loading failed:', e);
    showAudioError(player);
  });
  
  // Play button event listener
  playButton.addEventListener('click', () => {
    togglePlayback();
  });
  
  // Keyboard support
  playButton.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePlayback();
    }
  });
  
  // Progress bar interaction
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * audio.duration;
      audio.currentTime = newTime;
    });
    
    // Keyboard support for progress bar
    progressBar.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.key === 'ArrowLeft' ? -5 : 5;
        audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + step));
      }
    });
  }
  
  function togglePlayback() {
    if (isPlaying) {
      audio.pause();
      stopWheelAnimation();
      isPlaying = false;
    } else {
      audio.play().then(() => {
        startWheelAnimation();
        isPlaying = true;
      }).catch(e => {
        console.warn('Audio playback failed:', e);
        showAudioError(player);
      });
    }
    updatePlayButton(isPlaying);
  }
  
  function startWheelAnimation() {
    if (config.smoothRotation) {
      startSmoothRotation();
    } else {
      startBasicRotation();
    }
  }
  
  function stopWheelAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
  
  function startSmoothRotation() {
    function animate() {
      if (isPlaying) {
        rotationAngle += config.rotationSpeed;
        wheel.style.transform = `rotate(${rotationAngle}deg)`;
        
        // Add glow effects if enabled
        if (config.glowEffects) {
          const intensity = 0.5 + Math.sin(rotationAngle * 0.01) * 0.3;
          wheel.style.filter = `drop-shadow(0 0 ${intensity * 10}px var(--holographic-teal))`;
        }
        
        animationFrame = requestAnimationFrame(animate);
      }
    }
    animate();
  }
  
  function startBasicRotation() {
    wheel.style.animation = `spin ${config.animationDuration}ms linear infinite`;
  }
  
  function updateProgress(currentTime, duration) {
    if (!progressFill || !progressBar) return;
    
    const percent = (currentTime / duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(percent));
  }
  
  function updateTimeDisplay(currentTime, duration) {
    if (!timeDisplay) return;
    
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration || 0)}`;
  }
  
  function updatePlayButton(playing) {
    const playIcon = playButton.querySelector('.play-icon');
    const pauseIcon = playButton.querySelector('.pause-icon');
    const stateText = playButton.querySelector('.btn-state-text');
    
    if (playing) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline';
      if (stateText) stateText.textContent = 'Pause';
      playButton.setAttribute('aria-pressed', 'true');
    } else {
      if (playIcon) playIcon.style.display = 'inline';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (stateText) stateText.textContent = 'Play';
      playButton.setAttribute('aria-pressed', 'false');
    }
  }
  
  function showAudioError(player) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'audio-error';
    errorMsg.textContent = 'Audio could not be loaded. Please check your connection.';
    errorMsg.setAttribute('role', 'alert');
    player.appendChild(errorMsg);
  }
}

function setupWheelEnhancements(wheel, config) {
  wheel.classList.add('wheel-enhanced');
  
  if (config.visualEffects) {
    wheel.classList.add('wheel-visual-effects');
  }
  
  if (config.particleEffects) {
    createParticleEffects(wheel);
  }
  
  // Add touch interaction for mobile
  if ('ontouchstart' in window) {
    wheel.addEventListener('touchstart', (e) => {
      e.preventDefault();
      wheel.classList.add('wheel-touched');
    }, { passive: false });
    
    wheel.addEventListener('touchend', () => {
      wheel.classList.remove('wheel-touched');
    }, { passive: true });
  }
}

function createParticleEffects(wheel) {
  const particleContainer = document.createElement('div');
  particleContainer.className = 'wheel-particles';
  particleContainer.setAttribute('aria-hidden', 'true');
  
  // Create particles
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'wheel-particle';
    particle.style.animationDelay = `${i * 0.2}s`;
    particleContainer.appendChild(particle);
  }
  
  wheel.appendChild(particleContainer);
}

// Fallback for basic audio player
export function initBasicAudioPlayer() {
  const prayerWheels = document.querySelectorAll('.prayer-wheel-player');
  
  prayerWheels.forEach(player => {
    const audioFile = player.dataset.audio;
    if (!audioFile) return;
    
    // Replace complex player with simple HTML5 audio
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    audio.src = audioFile;
    audio.className = 'fallback-audio-player';
    
    // Add accessibility label
    const label = document.createElement('div');
    label.textContent = 'Audio Player';
    label.className = 'audio-player-label';
    
    const container = document.createElement('div');
    container.className = 'basic-audio-container';
    container.appendChild(label);
    container.appendChild(audio);
    
    player.parentNode.replaceChild(container, player);
  });
}
