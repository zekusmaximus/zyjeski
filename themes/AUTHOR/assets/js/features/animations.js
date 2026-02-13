/**
 * COMPLEX ANIMATIONS MODULE
 * Progressive enhancement for advanced animation effects
 */

export function initComplexAnimations(capabilities) {
  if (capabilities.motionPreference === 'reduce') return;
  
  const config = getAnimationConfig(capabilities);
  
  if (config.textEffects) {
    initTextEffects(config);
  }
  
  if (config.scrollAnimations) {
    initScrollAnimations(config);
  }
  
  if (config.hoverEffects) {
    initHoverEffects(config);
  }
  
  if (config.loadingAnimations) {
    initLoadingAnimations(config);
  }
}

function getAnimationConfig(capabilities) {
  const baseConfig = {
    textEffects: false,
    scrollAnimations: false,
    hoverEffects: false,
    loadingAnimations: false,
    duration: 300,
    easing: 'ease',
    stagger: 100
  };
  
  switch (capabilities.performance) {
    case 'high':
      return {
        ...baseConfig,
        textEffects: true,
        scrollAnimations: true,
        hoverEffects: !capabilities.touchSupport,
        loadingAnimations: true,
        duration: 500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        stagger: 50
      };
      
    case 'medium':
      return {
        ...baseConfig,
        textEffects: true,
        scrollAnimations: true,
        hoverEffects: !capabilities.touchSupport,
        loadingAnimations: false,
        duration: 300,
        easing: 'ease-out',
        stagger: 100
      };
      
    case 'low':
    default:
      return {
        ...baseConfig,
        textEffects: false,
        scrollAnimations: false,
        hoverEffects: false,
        loadingAnimations: false,
        duration: 150,
        easing: 'linear',
        stagger: 200
      };
  }
}

function initTextEffects(config) {
  // Glitch text effect for cyberpunk elements
  const glitchElements = document.querySelectorAll('.glitch-text, h1, h2, .mandala-item-title');
  
  glitchElements.forEach((element, index) => {
    setTimeout(() => {
      addGlitchEffect(element, config);
    }, index * config.stagger);
  });
  
  // Typewriter effect for specific elements
  const typewriterElements = document.querySelectorAll('.typewriter-text');
  typewriterElements.forEach((element, index) => {
    setTimeout(() => {
      addTypewriterEffect(element, config);
    }, index * config.stagger);
  });
}

function addGlitchEffect(element, config) {
  element.classList.add('glitch-enhanced');
  
  // Create data attributes for glitch layers
  element.setAttribute('data-text', element.textContent);
  
  // Add event listeners for interaction
  element.addEventListener('mouseenter', () => {
    element.classList.add('glitch-active');
    setTimeout(() => {
      element.classList.remove('glitch-active');
    }, config.duration);
  });
  
  element.addEventListener('focus', () => {
    element.classList.add('glitch-active');
    setTimeout(() => {
      element.classList.remove('glitch-active');
    }, config.duration);
  });
}

function addTypewriterEffect(element, config) {
  const text = element.textContent;
  element.textContent = '';
  element.classList.add('typewriter-enhanced');
  
  let i = 0;
  const typeInterval = setInterval(() => {
    element.textContent += text[i];
    i++;
    
    if (i >= text.length) {
      clearInterval(typeInterval);
      element.classList.add('typewriter-complete');
    }
  }, config.duration / text.length);
}

function initScrollAnimations(config) {
  // Create intersection observer for scroll-triggered animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerScrollAnimation(entry.target, config);
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate on scroll
  const animatedElements = document.querySelectorAll(
    '.mandala-item, .audio-content, .post-content, .book-card'
  );
  
  animatedElements.forEach((element, index) => {
    element.classList.add('scroll-animate');
    element.style.setProperty('--animation-delay', `${index * config.stagger}ms`);

    // Blog post bodies should never risk staying hidden if an observer callback
    // is delayed or skipped on mobile Safari.
    if (element.classList.contains('post-content')) {
      element.classList.add('scroll-animate-active');
      animateGenericElement(element, config);
      return;
    }

    observer.observe(element);
  });
  
  // Cleanup observer
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
}

function triggerScrollAnimation(element, config) {
  element.classList.add('scroll-animate-active');
  
  // Add specific animation based on element type
  if (element.classList.contains('mandala-item')) {
    animateMandalaItem(element, config);
  } else if (element.classList.contains('audio-content')) {
    animateContentBlock(element, config);
  } else {
    animateGenericElement(element, config);
  }
}

function animateMandalaItem(element, config) {
  element.style.transition = `all ${config.duration}ms ${config.easing}`;
  element.style.transform = 'translateY(0) scale(1)';
  element.style.opacity = '1';
}

function animateContentBlock(element, config) {
  element.style.transition = `all ${config.duration}ms ${config.easing}`;
  element.style.transform = 'translateX(0)';
  element.style.opacity = '1';
}

function animateGenericElement(element, config) {
  element.style.transition = `all ${config.duration}ms ${config.easing}`;
  element.style.transform = 'translateY(0)';
  element.style.opacity = '1';
}

function initHoverEffects(config) {
  // Enhanced hover effects for interactive elements
  const interactiveElements = document.querySelectorAll(
    '.mandala-item, button, .btn, a[class]'
  );
  
  interactiveElements.forEach(element => {
    addEnhancedHoverEffect(element, config);
  });
}

function addEnhancedHoverEffect(element, config) {
  element.classList.add('hover-enhanced');
  
  let hoverTimeout;
  
  element.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
    element.classList.add('hover-active');
    
    // Add ripple effect for buttons
    if (element.matches('button, .btn')) {
      addRippleEffect(element, config);
    }
    
    // Add glow effect for mandala items
    if (element.classList.contains('mandala-item')) {
      addGlowEffect(element, config);
    }
  });
  
  element.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(() => {
      element.classList.remove('hover-active');
    }, config.duration / 2);
  });
  
  // Focus events for keyboard navigation
  element.addEventListener('focus', () => {
    element.classList.add('focus-active');
  });
  
  element.addEventListener('blur', () => {
    element.classList.remove('focus-active');
  });
}

function addRippleEffect(element, config) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, config.duration);
}

function addGlowEffect(element, config) {
  const originalBoxShadow = element.style.boxShadow;
  element.style.transition = `box-shadow ${config.duration}ms ${config.easing}`;
  element.style.boxShadow = '0 0 20px var(--holographic-teal), 0 0 40px var(--electric-indigo)';
  
  setTimeout(() => {
    element.style.boxShadow = originalBoxShadow;
  }, config.duration * 2);
}

function initLoadingAnimations(config) {
  // Progressive loading animations for content
  const contentSections = document.querySelectorAll('main, article, section');
  
  contentSections.forEach((section, index) => {
    section.classList.add('loading-animate');
    section.style.setProperty('--loading-delay', `${index * config.stagger}ms`);
    
    // Trigger loading animation
    setTimeout(() => {
      section.classList.add('loading-complete');
    }, 100 + index * config.stagger);
  });
}

// CSS injection for complex animations
export function injectComplexAnimationCSS() {
  if (document.getElementById('complex-animations')) return;
  
  const style = document.createElement('style');
  style.id = 'complex-animations';
  style.textContent = `
    /* Glitch Effects */
    .glitch-enhanced {
      position: relative;
      color: var(--flickering-white);
    }
    
    .glitch-enhanced::before,
    .glitch-enhanced::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      overflow: hidden;
      clip: rect(0, 900px, 0, 0);
    }
    
    .glitch-enhanced::before {
      left: 2px;
      text-shadow: -2px 0 var(--electric-indigo);
      animation: glitch-anim-1 2s infinite linear alternate-reverse;
    }
    
    .glitch-enhanced::after {
      left: -2px;
      text-shadow: -2px 0 var(--holographic-teal);
      animation: glitch-anim-2 2s infinite linear alternate-reverse;
    }
    
    .glitch-enhanced.glitch-active::before,
    .glitch-enhanced.glitch-active::after {
      animation-duration: 0.2s;
    }
    
    @keyframes glitch-anim-1 {
      0% {
        clip: rect(42px, 9999px, 44px, 0);
        transform: skew(0.85deg);
      }
      10% {
        clip: rect(40px, 9999px, 36px, 0);
        transform: skew(0.15deg);
      }
      20% {
        clip: rect(25px, 9999px, 99px, 0);
        transform: skew(0.30deg);
      }
      100% {
        clip: rect(70px, 9999px, 71px, 0);
        transform: skew(0.05deg);
      }
    }
    
    @keyframes glitch-anim-2 {
      0% {
        clip: rect(65px, 9999px, 119px, 0);
        transform: skew(0.15deg);
      }
      15% {
        clip: rect(54px, 9999px, 21px, 0);
        transform: skew(0.85deg);
      }
      45% {
        clip: rect(17px, 9999px, 85px, 0);
        transform: skew(0.50deg);
      }
      100% {
        clip: rect(91px, 9999px, 61px, 0);
        transform: skew(0.05deg);
      }
    }
    
    /* Typewriter Effect */
    .typewriter-enhanced {
      border-right: 2px solid var(--holographic-teal);
      animation: typewriter-cursor 1s infinite;
    }
    
    .typewriter-complete {
      border-right: none;
    }
    
    @keyframes typewriter-cursor {
      0%, 50% { border-color: var(--holographic-teal); }
      51%, 100% { border-color: transparent; }
    }
    
    /* Scroll Animations */
    .scroll-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: all var(--animation-duration, 300ms) var(--animation-easing, ease-out);
      transition-delay: var(--animation-delay, 0ms);
    }
    
    .scroll-animate-active {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Hover Effects */
    .hover-enhanced {
      transition: all var(--transition-duration, 200ms) ease;
    }
    
    .hover-active {
      transform: translateY(-2px);
      filter: brightness(1.1);
    }
    
    .focus-active {
      outline: 3px solid var(--focus-outline-color);
      outline-offset: 2px;
    }
    
    /* Ripple Effect */
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      animation: ripple 600ms linear;
      transform: scale(0);
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      margin-top: -10px;
    }
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    /* Loading Animations */
    .loading-animate {
      opacity: 0;
      transform: scale(0.95);
      transition: all 400ms ease-out;
      transition-delay: var(--loading-delay, 0ms);
    }
    
    .loading-complete {
      opacity: 1;
      transform: scale(1);
    }
    
    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      .glitch-enhanced::before,
      .glitch-enhanced::after {
        animation: none;
      }
      
      .typewriter-enhanced {
        border-right: none;
        animation: none;
      }
      
      .scroll-animate,
      .loading-animate {
        opacity: 1;
        transform: none;
        transition: none;
      }
      
      .hover-enhanced {
        transition: none;
      }
      
      .ripple-effect {
        display: none;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize CSS when module loads
injectComplexAnimationCSS();
