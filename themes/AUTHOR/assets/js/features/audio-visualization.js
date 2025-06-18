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
    visualEffects: false
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
  
  // Create visualization container
  const visualizationContainer = createVisualizationContainer(config);
  player.appendChild(visualizationContainer);
  
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
    resetVisualization();
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
    updateVisualization(dataArray, config);
    
    rafId = requestAnimationFrame(animate);
  }
  
  function updateVisualization(frequencyData, config) {
    const bars = visualizationContainer.querySelectorAll('.visualization-bar');
    
    bars.forEach((bar, index) => {
      const dataIndex = Math.floor(index * frequencyData.length / bars.length);
      const value = frequencyData[dataIndex] / 255;
      
      // Update bar height
      bar.style.height = `${value * 100}%`;
      
      // Add color effects for high-performance devices
      if (config.visualEffects) {
        const hue = (value * 120) + 180; // Blue to purple range
        bar.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
        bar.style.boxShadow = `0 0 ${value * 10}px hsl(${hue}, 80%, 60%)`;
      }
    });
    
    // Update prayer wheel rotation based on audio
    if (config.visualEffects) {
      updatePrayerWheelVisualization(frequencyData);
    }
  }
  
  function updatePrayerWheelVisualization(frequencyData) {
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
  
  function resetVisualization() {
    const bars = visualizationContainer.querySelectorAll('.visualization-bar');
    bars.forEach(bar => {
      bar.style.height = '0%';
      bar.style.backgroundColor = '';
      bar.style.boxShadow = '';
    });
    
    const prayerWheel = player.querySelector('.prayer-wheel');
    if (prayerWheel) {
      prayerWheel.style.animationDuration = '';
      prayerWheel.style.transform = '';
    }
  }
}

function createVisualizationContainer(config) {
  const container = document.createElement('div');
  container.className = 'audio-visualization';
  container.setAttribute('aria-hidden', 'true');
  
  // Create visualization bars
  for (let i = 0; i < config.barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualization-bar';
    container.appendChild(bar);
  }
  
  return container;
}

// Enhanced spectrum analyzer for high-performance devices
function initSpectrumAnalyzer(player, config) {
  if (config.performance !== 'high') return;
  
  const canvas = document.createElement('canvas');
  canvas.className = 'spectrum-analyzer';
  canvas.width = 300;
  canvas.height = 150;
  canvas.setAttribute('aria-hidden', 'true');
  
  const ctx = canvas.getContext('2d');
  player.appendChild(canvas);
  
  let animationId;
  
  function drawSpectrum(frequencyData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvas.width / frequencyData.length;
    
    frequencyData.forEach((value, index) => {
      const barHeight = (value / 255) * canvas.height;
      const x = index * barWidth;
      const y = canvas.height - barHeight;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#6E0DD0');
      gradient.addColorStop(1, '#00F5D4');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }
  
  return {
    start: (analyser, dataArray) => {
      function animate() {
        analyser.getByteFrequencyData(dataArray);
        drawSpectrum(dataArray);
        animationId = requestAnimationFrame(animate);
      }
      animate();
    },
    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      height: 60px;
      margin: 1rem 0;
      padding: 0.5rem;
      background: rgba(0, 15, 8, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(110, 13, 208, 0.3);
      overflow: hidden;
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
    
    .spectrum-analyzer {
      margin: 1rem 0;
      border-radius: 8px;
      border: 1px solid rgba(110, 13, 208, 0.3);
      background: rgba(0, 15, 8, 0.5);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .audio-visualization {
        height: 40px;
      }
      
      .spectrum-analyzer {
        width: 100%;
        height: 100px;
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
      
      .spectrum-analyzer {
        display: none;
      }
    }
    
    /* Performance optimizations */
    .visualization-bar {
      will-change: height, background-color;
    }
    
    .spectrum-analyzer {
      will-change: contents;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize CSS when module loads
injectAudioVisualizationCSS();
