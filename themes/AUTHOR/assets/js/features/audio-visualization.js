/**
 * AUDIO VISUALIZATION MODULE
 * Progressive enhancement for audio analysis and visualization
 */

export function initAudioVisualization(capabilities) {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  
  const config = getAudioVisualizationConfig(capabilities);
  
  const audioPlayers = document.querySelectorAll('.prayer-wheel-player');
  audioPlayers.forEach(player => {
    initSingleAudioVisualization(player, config);
  });
}

function getAudioVisualizationConfig(capabilities) {
  const baseConfig = {
    enabled: false,
    barCount: 32,
    smoothing: 0.8,
    minDecibels: -90,
    maxDecibels: -10,
    updateInterval: 60,
    visualEffects: false,
    performance: capabilities.performance // Include performance capability
  };
  
  switch (capabilities.performance) {
    case 'high':
      return {
        ...baseConfig,
        enabled: true,
        barCount: 64,
        smoothing: 0.9,
        updateInterval: 60,
        visualEffects: true
      };
      
    case 'medium':
      return {
        ...baseConfig,
        enabled: true,
        barCount: 32,
        smoothing: 0.8,
        updateInterval: 30,
        visualEffects: false
      };
      
    case 'low':
    default:
      return {
        ...baseConfig,
        enabled: false
      };
  }
}

function initSingleAudioVisualization(player, config) {
  if (!config.enabled) return;
  
  const audioFile = player.dataset.audio;
  if (!audioFile) return;
  
  let audioContext;
  let analyser;
  let dataArray;
  let rafId;
  let isVisualizationActive = false;
  
  // Create visualization strategy (Canvas or DOM)
  const visualization = createVisualizationStrategy(player, config);
  player.appendChild(visualization.element);
  
  // Listen for audio events
  player.addEventListener('audio-play', (e) => {
    const audioElement = e.detail?.audioElement;
    if (audioElement) {
      startVisualization(audioElement);
    }
  });
  
  player.addEventListener('audio-pause', () => {
    stopVisualization();
  });
  
  player.addEventListener('audio-ended', () => {
    stopVisualization();
  });
  
  function startVisualization(audioElement) {
    if (isVisualizationActive) return;
    
    try {
      initAudioContext(audioElement);
      isVisualizationActive = true;
      animate();
    } catch (error) {
      console.warn('Audio visualization failed:', error);
    }
  }
  
  function stopVisualization() {
    isVisualizationActive = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    visualization.reset();
  }
  
  function initAudioContext(audioElement) {
    if (audioContext) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    
    // Create analyser
    analyser = audioContext.createAnalyser();
    analyser.fftSize = config.barCount * 2;
    analyser.smoothingTimeConstant = config.smoothing;
    analyser.minDecibels = config.minDecibels;
    analyser.maxDecibels = config.maxDecibels;
    
    // Connect audio source
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Create data array
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }
  
  function animate() {
    if (!isVisualizationActive) return;
    
    analyser.getByteFrequencyData(dataArray);
    visualization.update(dataArray);
    
    // Update prayer wheel separately as it is outside the visualization container
    if (config.visualEffects) {
        updatePrayerWheelVisualization(player, dataArray);
    }
    
    rafId = requestAnimationFrame(animate);
  }
}

function updatePrayerWheelVisualization(player, frequencyData) {
  const prayerWheel = player.querySelector('.prayer-wheel');
  if (!prayerWheel) return;
  
  // Calculate average frequency
  const average = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
  const normalizedAverage = average / 255;

  // Apply rotation speed based on audio intensity
  const rotationSpeed = 1 + normalizedAverage * 2;
  prayerWheel.style.animationDuration = `${2000 / rotationSpeed}ms`;
  
  // Apply scale effect
  const scale = 1 + normalizedAverage * 0.1;
  prayerWheel.style.transform = `scale(${scale})`;
}

function createVisualizationStrategy(player, config) {
  // Use Canvas for high performance or when visual effects are enabled (to avoid expensive box-shadow)
  if (config.performance === 'high' || config.visualEffects) {
    return createCanvasVisualization(config);
  } else {
    return createDomVisualization(config);
  }
}

function createCanvasVisualization(config) {
  const canvas = document.createElement('canvas');
  canvas.className = 'audio-visualization-canvas'; // Use new class or reuse existing
  canvas.width = 300;
  canvas.height = 60; // Match CSS height of .audio-visualization
  canvas.setAttribute('aria-hidden', 'true');
  
  // Copy styles from .audio-visualization if possible, or set basic styles
  // We'll rely on CSS to style the canvas container-like properties
  canvas.classList.add('audio-visualization');
  
  const ctx = canvas.getContext('2d');
  
  return {
    element: canvas,
    update: (frequencyData) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barCount = config.barCount; // Use configured bar count
      const barWidth = canvas.width / barCount;
      
      // We need to sample frequencyData to match barCount
      // Note: Data sampling is handled by calculation inside the loop

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * frequencyData.length / barCount);
        const value = frequencyData[dataIndex] / 255;
        const barHeight = value * canvas.height;
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        if (config.visualEffects) {
             const hue = (value * 120) + 180;

             // Simulating glow with a semi-transparent larger rect is much faster than shadowBlur
             ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
             ctx.fillRect(x - 1, y - 2, barWidth + 1, barHeight + 4);

             ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        } else {
             // Fallback colors if effects disabled
             ctx.fillStyle = i % 2 === 0 ? '#6E0DD0' : '#00F5D4'; // Approximation of CSS vars
        }

        ctx.fillRect(x, y, barWidth - 1, barHeight);
      }
    },
    reset: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
}

function createDomVisualization(config) {
  const container = document.createElement('div');
  container.className = 'audio-visualization';
  container.setAttribute('aria-hidden', 'true');

  // Create visualization bars
  for (let i = 0; i < config.barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualization-bar';
    container.appendChild(bar);
  }
  
  const bars = container.querySelectorAll('.visualization-bar');

  return {
    element: container,
    update: (frequencyData) => {
      bars.forEach((bar, index) => {
        const dataIndex = Math.floor(index * frequencyData.length / bars.length);
        const value = frequencyData[dataIndex] / 255;

        bar.style.height = `${value * 100}%`;

        // No expensive effects in DOM mode (since we route effects to Canvas)
        bar.style.backgroundColor = '';
        bar.style.boxShadow = '';
      });
    },
    reset: () => {
      bars.forEach(bar => {
        bar.style.height = '0%';
        bar.style.backgroundColor = '';
        bar.style.boxShadow = '';
      });
    }
  };
}


// CSS injection for audio visualization
export function injectAudioVisualizationCSS() {
  if (document.getElementById('audio-visualization-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'audio-visualization-styles';
  style.textContent = `
    .audio-visualization {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      width: 100%;
      height: 60px;
      margin: 1rem 0;
      padding: 0.5rem;
      background: rgba(0, 15, 8, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(110, 13, 208, 0.3);
      overflow: hidden;
      box-sizing: border-box; /* Ensure padding doesn't affect dimensions calculation */
    }

    .audio-visualization-canvas {
       /* Inherits .audio-visualization styles */
    }
    
    .visualization-bar {
      flex: 1;
      margin: 0 1px;
      background: var(--holographic-teal);
      border-radius: 2px;
      transition: height 0.1s ease, background-color 0.2s ease;
      min-height: 2px;
      opacity: 0.8;
    }
    
    .visualization-bar:nth-child(even) {
      background: var(--electric-indigo);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .audio-visualization {
        height: 40px;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .visualization-bar {
        transition: none;
      }
      
      .audio-visualization {
        display: none;
      }
    }
    
    /* Performance optimizations */
    .visualization-bar {
      will-change: height;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize CSS when module loads
injectAudioVisualizationCSS();
