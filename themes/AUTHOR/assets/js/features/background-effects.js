/**
 * BACKGROUND EFFECTS MODULE
 * Progressive enhancement for atmospheric background effects
 */

const NOISE_SIZE = 256;

export function initBackgroundEffects(capabilities) {
  if (capabilities.motionPreference === 'reduce') return;
  if (capabilities.performance === 'low') return;
  
  const config = getBackgroundEffectsConfig(capabilities);
  
  if (config.noiseOverlay) {
    initNoiseOverlay(config);
  }
  
  if (config.gradientAnimation) {
    initGradientAnimation(config);
  }
  
  if (config.geometricPatterns) {
    initGeometricPatterns(config);
  }
  
  if (config.parallaxLayers) {
    initParallaxLayers(config);
  }
}

function getBackgroundEffectsConfig(capabilities) {
  const baseConfig = {
    noiseOverlay: false,
    gradientAnimation: false,
    geometricPatterns: false,
    parallaxLayers: false,
    intensity: 0.3,
    animationDuration: 5000,
    layerCount: 3
  };
  
  switch (capabilities.performance) {
    case 'high':
      return {
        ...baseConfig,
        noiseOverlay: true,
        gradientAnimation: true,
        geometricPatterns: true,
        parallaxLayers: !capabilities.touchSupport,
        intensity: 0.5,
        animationDuration: 8000,
        layerCount: 5
      };
      
    case 'medium':
      return {
        ...baseConfig,
        noiseOverlay: true,
        gradientAnimation: true,
        geometricPatterns: false,
        parallaxLayers: false,
        intensity: 0.3,
        animationDuration: 6000,
        layerCount: 3
      };
      
    case 'low':
    default:
      return baseConfig;
  }
}

function initNoiseOverlay(config) {
  const noiseOverlay = document.createElement('div');
  noiseOverlay.className = 'noise-overlay';
  noiseOverlay.setAttribute('aria-hidden', 'true');
  
  // Create noise pattern using canvas
  const noiseCanvas = createNoiseCanvas(config);
  noiseOverlay.appendChild(noiseCanvas);
  
  document.body.appendChild(noiseOverlay);
  
  // Animate noise if high performance
  if (config.intensity > 0.4) {
    animateNoise(noiseCanvas, config);
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    noiseOverlay.remove();
  });
}

function createNoiseCanvas(config) {
  const canvas = document.createElement('canvas');
  canvas.width = NOISE_SIZE;
  canvas.height = NOISE_SIZE;
  canvas.className = 'noise-canvas';
  
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  
  // Generate noise pattern
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 255;
    imageData.data[i] = noise;     // Red
    imageData.data[i + 1] = noise; // Green
    imageData.data[i + 2] = noise; // Blue
    imageData.data[i + 3] = config.intensity * 255; // Alpha
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function animateNoise(canvas, config) {
  const ctx = canvas.getContext('2d');
  let animationFrame;
  
  // Pre-generate noise frames to improve performance
  const noiseFrames = 10;
  const noiseBuffer = createNoiseBuffer(config, noiseFrames);
  let currentFrame = 0;

  function updateNoise() {
    // Draw the pre-generated frame
    // Use drawImage which is much faster than putImageData with new random values
    const frameHeight = NOISE_SIZE;
    
    // Clear canvas to prevent alpha accumulation
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      noiseBuffer,
      0, currentFrame * frameHeight, NOISE_SIZE, frameHeight, // Source
      0, 0, canvas.width, canvas.height                // Destination
    );
    
    currentFrame = (currentFrame + 1) % noiseFrames;
    
    // Update every 100ms for performance
    setTimeout(() => {
      animationFrame = requestAnimationFrame(updateNoise);
    }, 100);
  }
  
  updateNoise();
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
}

function createNoiseBuffer(config, frames) {
  const width = NOISE_SIZE;
  const height = NOISE_SIZE;
  const buffer = document.createElement('canvas');
  buffer.width = width;
  buffer.height = height * frames;

  const ctx = buffer.getContext('2d');
  const imageData = ctx.createImageData(width, height * frames);

  // Generate noise pattern for all frames at once
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 255;
    imageData.data[i] = noise;
    imageData.data[i + 1] = noise;
    imageData.data[i + 2] = noise;
    imageData.data[i + 3] = config.intensity * 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return buffer;
}

function initGradientAnimation(config) {
  const gradientOverlay = document.createElement('div');
  gradientOverlay.className = 'gradient-overlay';
  gradientOverlay.setAttribute('aria-hidden', 'true');
  
  // Set animation duration
  gradientOverlay.style.animationDuration = `${config.animationDuration}ms`;
  
  document.body.appendChild(gradientOverlay);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    gradientOverlay.remove();
  });
}

function initGeometricPatterns(config) {
  const patternContainer = document.createElement('div');
  patternContainer.className = 'geometric-patterns';
  patternContainer.setAttribute('aria-hidden', 'true');
  
  // Create SVG patterns
  const svg = createGeometricSVG(config);
  patternContainer.appendChild(svg);
  
  document.body.appendChild(patternContainer);
  
  // Animate patterns
  animateGeometricPatterns(svg, config);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    patternContainer.remove();
  });
}

function createGeometricSVG(config) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'geometric-svg');
  
  // Create pattern elements
  for (let i = 0; i < config.layerCount; i++) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `pattern-layer layer-${i}`);
    
    // Create geometric shapes
    const shapes = ['circle', 'rect', 'polygon'];
    const shapeType = shapes[i % shapes.length];
    
    for (let j = 0; j < 3; j++) {
      const shape = createGeometricShape(shapeType, i, j, config);
      group.appendChild(shape);
    }
    
    svg.appendChild(group);
  }
  
  return svg;
}

function createGeometricShape(type, layerIndex, shapeIndex, config) {
  const shape = document.createElementNS('http://www.w3.org/2000/svg', type);
  
  // Base attributes
  shape.setAttribute('fill', 'none');
  shape.setAttribute('stroke', layerIndex % 2 === 0 ? 'var(--electric-indigo)' : 'var(--holographic-teal)');
  shape.setAttribute('stroke-width', '0.5');
  shape.setAttribute('opacity', config.intensity);
  
  // Shape-specific attributes
  const x = (shapeIndex * 30) + 10;
  const y = (layerIndex * 20) + 10;
  
  switch (type) {
    case 'circle':
      shape.setAttribute('cx', x);
      shape.setAttribute('cy', y);
      shape.setAttribute('r', 5 + layerIndex * 2);
      break;
      
    case 'rect':
      shape.setAttribute('x', x);
      shape.setAttribute('y', y);
      shape.setAttribute('width', 8);
      shape.setAttribute('height', 8);
      break;
      
    case 'polygon':
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const px = x + Math.cos(angle) * 5;
        const py = y + Math.sin(angle) * 5;
        points.push(`${px},${py}`);
      }
      shape.setAttribute('points', points.join(' '));
      break;
  }
  
  return shape;
}

function animateGeometricPatterns(svg, config) {
  const layers = svg.querySelectorAll('.pattern-layer');
  
  layers.forEach((layer, index) => {
    layer.style.animationDuration = `${config.animationDuration + index * 1000}ms`;
    layer.style.animationDelay = `${index * 500}ms`;
  });
}

function initParallaxLayers(config) {
  if (config.touchSupport) return; // Skip on touch devices
  
  const parallaxContainer = document.createElement('div');
  parallaxContainer.className = 'parallax-background';
  parallaxContainer.setAttribute('aria-hidden', 'true');
  
  // Create parallax layers
  for (let i = 0; i < config.layerCount; i++) {
    const layer = document.createElement('div');
    layer.className = `parallax-layer layer-${i}`;
    layer.style.setProperty('--layer-speed', (i + 1) * 0.1);
    parallaxContainer.appendChild(layer);
  }
  
  document.body.appendChild(parallaxContainer);
  
  // Add mouse parallax effect
  let rafId;
  
  function handleMouseMove(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    
    parallaxContainer.style.setProperty('--mouse-x', x);
    parallaxContainer.style.setProperty('--mouse-y', y);
  }
  
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    document.removeEventListener('mousemove', handleMouseMove);
    parallaxContainer.remove();
  });
}

// CSS injection for background effects
export function injectBackgroundEffectsCSS() {
  if (document.getElementById('background-effects-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'background-effects-styles';
  style.textContent = `
    /* Noise Overlay */
    .noise-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      mix-blend-mode: overlay;
    }
    
    .noise-canvas {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.3;
    }
    
    /* Gradient Animation */
    .gradient-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      background: linear-gradient(
        45deg,
        rgba(110, 13, 208, 0.1),
        rgba(0, 245, 212, 0.1),
        rgba(110, 13, 208, 0.1)
      );
      background-size: 400% 400%;
      animation: gradientShift infinite ease-in-out;
    }
    
    @keyframes gradientShift {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
    
    /* Geometric Patterns */
    .geometric-patterns {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.3;
    }
    
    .geometric-svg {
      width: 100%;
      height: 100%;
    }
    
    .pattern-layer {
      animation: patternFloat infinite ease-in-out alternate;
      transform-origin: center;
    }
    
    .layer-0 {
      animation-direction: normal;
    }
    
    .layer-1 {
      animation-direction: reverse;
    }
    
    .layer-2 {
      animation-direction: alternate;
    }
    
    @keyframes patternFloat {
      0% {
        transform: translate(0, 0) rotate(0deg);
      }
      50% {
        transform: translate(5px, -5px) rotate(5deg);
      }
      100% {
        transform: translate(-5px, 5px) rotate(-5deg);
      }
    }
    
    /* Parallax Background */
    .parallax-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      --mouse-x: 0;
      --mouse-y: 0;
    }
    
    .parallax-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: translate(
        calc(var(--mouse-x) * var(--layer-speed) * 10px),
        calc(var(--mouse-y) * var(--layer-speed) * 10px)
      );
      transition: transform 0.1s ease-out;
    }
    
    .parallax-layer.layer-0 {
      background: radial-gradient(
        circle at 20% 30%,
        rgba(110, 13, 208, 0.1) 0%,
        transparent 50%
      );
    }
    
    .parallax-layer.layer-1 {
      background: radial-gradient(
        circle at 80% 70%,
        rgba(0, 245, 212, 0.1) 0%,
        transparent 50%
      );
    }
    
    .parallax-layer.layer-2 {
      background: radial-gradient(
        circle at 50% 50%,
        rgba(255, 153, 51, 0.05) 0%,
        transparent 60%
      );
    }
    
    /* Performance optimizations */
    .noise-overlay,
    .gradient-overlay,
    .geometric-patterns,
    .parallax-background {
      will-change: auto;
    }
    
    .pattern-layer {
      will-change: transform;
    }
    
    .parallax-layer {
      will-change: transform;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .noise-overlay,
      .gradient-overlay,
      .geometric-patterns,
      .parallax-background {
        display: none !important;
      }
      
      .pattern-layer {
        animation: none;
      }
      
      .parallax-layer {
        transform: none;
        transition: none;
      }
    }
    
    /* Low battery mode */
    .low-battery .noise-overlay,
    .low-battery .gradient-overlay,
    .low-battery .geometric-patterns {
      display: none;
    }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      .noise-overlay {
        opacity: 0.5;
      }
      
      .geometric-patterns {
        opacity: 0.2;
      }
      
      .parallax-background {
        display: none;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize CSS when module loads
injectBackgroundEffectsCSS();
