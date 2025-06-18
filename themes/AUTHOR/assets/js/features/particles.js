/**
 * PARTICLE EFFECTS MODULE
 * Progressive enhancement for cyberpunk particle effects
 */

export function initParticles(capabilities) {
  if (capabilities.motionPreference === 'reduce') return;
  if (capabilities.performance === 'low') return;
  
  const config = getParticleConfig(capabilities);
  
  // Initialize different types of particle effects
  if (config.backgroundParticles) {
    initBackgroundParticles(config);
  }
  
  if (config.interactiveParticles) {
    initInteractiveParticles(config);
  }
  
  if (config.audioParticles) {
    initAudioParticles(config);
  }
}

function getParticleConfig(capabilities) {
  const baseConfig = {
    backgroundParticles: false,
    interactiveParticles: false,
    audioParticles: false,
    particleCount: 50,
    animationDuration: 2000,
    opacity: 0.6,
    size: 2
  };
  
  switch (capabilities.performance) {
    case 'high':
      return {
        ...baseConfig,
        backgroundParticles: true,
        interactiveParticles: true,
        audioParticles: true,
        particleCount: 100,
        animationDuration: 3000,
        opacity: 0.8,
        size: 3
      };
      
    case 'medium':
      return {
        ...baseConfig,
        backgroundParticles: true,
        interactiveParticles: false,
        audioParticles: true,
        particleCount: 50,
        animationDuration: 2000,
        opacity: 0.6,
        size: 2
      };
      
    case 'low':
    default:
      return baseConfig;
  }
}

function initBackgroundParticles(config) {
  const container = createParticleContainer('background-particles');
  
  for (let i = 0; i < config.particleCount; i++) {
    const particle = createParticle('background-particle', config);
    
    // Random starting position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    // Random animation delay
    particle.style.animationDelay = `${Math.random() * config.animationDuration}ms`;
    
    // Random movement direction
    const moveX = (Math.random() - 0.5) * 200;
    const moveY = (Math.random() - 0.5) * 200;
    
    particle.style.setProperty('--move-x', `${moveX}px`);
    particle.style.setProperty('--move-y', `${moveY}px`);
    
    container.appendChild(particle);
  }
  
  document.body.appendChild(container);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    container.remove();
  });
}

function initInteractiveParticles(config) {
  const container = createParticleContainer('interactive-particles');
  const particles = [];
  
  // Create particle pool
  for (let i = 0; i < 20; i++) {
    const particle = createParticle('interactive-particle', config);
    particle.style.display = 'none';
    container.appendChild(particle);
    particles.push({
      element: particle,
      active: false,
      startTime: 0
    });
  }
  
  document.body.appendChild(container);
  
  // Mouse interaction
  let rafId;
  
  function handleMouseMove(e) {
    const availableParticle = particles.find(p => !p.active);
    if (!availableParticle) return;
    
    activateParticle(availableParticle, e.clientX, e.clientY, config);
  }
  
  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      const availableParticle = particles.find(p => !p.active);
      if (availableParticle) {
        activateParticle(availableParticle, touch.clientX, touch.clientY, config);
      }
    }
  }
  
  // Throttle mouse events
  let lastMouseTime = 0;
  const throttledMouseMove = (e) => {
    const now = Date.now();
    if (now - lastMouseTime > 50) { // Throttle to ~20fps
      handleMouseMove(e);
      lastMouseTime = now;
    }
  };
  
  document.addEventListener('mousemove', throttledMouseMove, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  // Animation loop to deactivate particles
  function updateParticles() {
    const now = Date.now();
    particles.forEach(particle => {
      if (particle.active && now - particle.startTime > config.animationDuration) {
        deactivateParticle(particle);
      }
    });
    
    rafId = requestAnimationFrame(updateParticles);
  }
  
  updateParticles();
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    document.removeEventListener('mousemove', throttledMouseMove);
    document.removeEventListener('touchmove', handleTouchMove);
    if (rafId) cancelAnimationFrame(rafId);
    container.remove();
  });
}

function initAudioParticles(config) {
  const audioPlayers = document.querySelectorAll('.prayer-wheel-player');
  
  audioPlayers.forEach(player => {
    const audioFile = player.dataset.audio;
    if (!audioFile) return;
    
    const container = createParticleContainer('audio-particles');
    const particles = [];
    
    // Create particles for audio visualization
    for (let i = 0; i < Math.floor(config.particleCount / 2); i++) {
      const particle = createParticle('audio-particle', config);
      container.appendChild(particle);
      particles.push(particle);
    }
    
    player.appendChild(container);
    
    // Listen for audio events
    player.addEventListener('audio-play', () => {
      animateAudioParticles(particles, true, config);
    });
    
    player.addEventListener('audio-pause', () => {
      animateAudioParticles(particles, false, config);
    });
  });
}

function createParticleContainer(className) {
  const container = document.createElement('div');
  container.className = `particle-container ${className}`;
  container.setAttribute('aria-hidden', 'true');
  container.style.pointerEvents = 'none';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '1';
  container.style.overflow = 'hidden';
  
  return container;
}

function createParticle(className, config) {
  const particle = document.createElement('div');
  particle.className = `particle ${className}`;
  
  // Base styles
  particle.style.position = 'absolute';
  particle.style.width = `${config.size}px`;
  particle.style.height = `${config.size}px`;
  particle.style.borderRadius = '50%';
  particle.style.background = 'var(--holographic-teal)';
  particle.style.opacity = config.opacity;
  particle.style.pointerEvents = 'none';
  
  // Add glow effect for high-performance devices
  if (config.size > 2) {
    particle.style.boxShadow = `0 0 ${config.size * 2}px var(--holographic-teal)`;
  }
  
  return particle;
}

function activateParticle(particleObj, x, y, config) {
  const particle = particleObj.element;
  
  particle.style.display = 'block';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.opacity = config.opacity;
  
  // Add animation
  particle.style.animation = `particleFade ${config.animationDuration}ms ease-out forwards`;
  
  particleObj.active = true;
  particleObj.startTime = Date.now();
}

function deactivateParticle(particleObj) {
  particleObj.element.style.display = 'none';
  particleObj.element.style.animation = '';
  particleObj.active = false;
}

function animateAudioParticles(particles, isPlaying, config) {
  particles.forEach((particle, index) => {
    if (isPlaying) {
      const delay = index * 100;
      setTimeout(() => {
        particle.style.animation = `audioParticlePulse ${config.animationDuration}ms ease-in-out infinite`;
        particle.style.animationDelay = `${Math.random() * 1000}ms`;
      }, delay);
    } else {
      particle.style.animation = '';
    }
  });
}

// CSS Animation definitions (to be added to CSS)
export function injectParticleCSS() {
  if (document.getElementById('particle-animations')) return;
  
  const style = document.createElement('style');
  style.id = 'particle-animations';
  style.textContent = `
    @keyframes particleFade {
      0% {
        opacity: var(--particle-opacity, 0.8);
        transform: translate(0, 0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(var(--move-x, 0), var(--move-y, 0)) scale(0);
      }
    }
    
    @keyframes audioParticlePulse {
      0%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.2);
      }
    }
    
    @keyframes backgroundParticleFloat {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: var(--particle-opacity, 0.6);
      }
      90% {
        opacity: var(--particle-opacity, 0.6);
      }
      100% {
        transform: translate(var(--move-x, 0), var(--move-y, 0)) rotate(360deg);
        opacity: 0;
      }
    }
    
    .background-particle {
      animation: backgroundParticleFloat var(--animation-duration, 2000ms) ease-in-out infinite;
    }
    
    .particle-container {
      mix-blend-mode: screen;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .particle-container {
        display: none !important;
      }
    }
    
    /* Performance optimizations */
    .particle {
      will-change: transform, opacity;
      transform-origin: center;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize CSS when module loads
injectParticleCSS();
