/**
 * MANDALA 3D EFFECTS MODULE
 * Progressive enhancement for mandala grid 3D interactions
 */

export function initMandala3D(capabilities) {
  const mandalaGrid = document.querySelector('.mandala-grid');
  const mandalaContainer = document.querySelector('.mandala-container');
  
  if (!mandalaGrid || !mandalaContainer) return;
  
  // Add 3D capability class
  mandalaContainer.classList.add('mandala-3d-enhanced');
  
  // Configure 3D effects based on device performance
  const config = get3DConfig(capabilities);
  
  if (config.mouseParallax && !capabilities.touchSupport) {
    initMouseParallax(mandalaGrid, config);
  }
  
  if (config.scrollEffects) {
    initScrollEffects(mandalaGrid, config);
  }
  
  if (config.itemAnimations) {
    initItemAnimations(mandalaGrid, config);
  }
  
  if (config.depthEffects) {
    initDepthEffects(mandalaGrid, config);
  }
}

function get3DConfig(capabilities) {
  const baseConfig = {
    mouseParallax: false,
    scrollEffects: false,
    itemAnimations: false,
    depthEffects: false,
    maxRotation: 5,
    animationDuration: 300,
    dampening: 0.1
  };
  
  switch (capabilities.performance) {
    case 'high':
      return {
        ...baseConfig,
        mouseParallax: true,
        scrollEffects: true,
        itemAnimations: true,
        depthEffects: true,
        maxRotation: 8,
        animationDuration: 400,
        dampening: 0.15
      };
      
    case 'medium':
      return {
        ...baseConfig,
        mouseParallax: true,
        scrollEffects: true,
        itemAnimations: false,
        depthEffects: false,
        maxRotation: 5,
        animationDuration: 250,
        dampening: 0.1
      };
      
    case 'low':
    default:
      return {
        ...baseConfig,
        mouseParallax: false,
        scrollEffects: false,
        itemAnimations: false,
        depthEffects: false
      };
  }
}

function initMouseParallax(mandalaGrid, config) {
  let rafId;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  
  function updateParallax() {
    // Smooth interpolation
    currentX += (targetX - currentX) * config.dampening;
    currentY += (targetY - currentY) * config.dampening;
    
    const rotateY = Math.max(-config.maxRotation, Math.min(config.maxRotation, currentX));
    const rotateX = Math.max(-config.maxRotation, Math.min(config.maxRotation, currentY));
    
    mandalaGrid.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    
    // Continue animation if there's still movement
    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      rafId = requestAnimationFrame(updateParallax);
    }
  }
  
  function handleMouseMove(e) {
    const rect = mandalaGrid.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    targetX = (e.clientX - centerX) / (rect.width / 2) * config.maxRotation;
    targetY = (e.clientY - centerY) / (rect.height / 2) * config.maxRotation;
    
    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  }
  
  function handleMouseLeave() {
    targetX = 0;
    targetY = 0;
    
    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  }
  
  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  mandalaGrid.addEventListener('mouseleave', handleMouseLeave, { passive: true });
  
  // Cleanup function
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    mandalaGrid.removeEventListener('mouseleave', handleMouseLeave);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}

function initScrollEffects(mandalaGrid, config) {
  let rafId;
  let lastScrollY = window.scrollY;
  
  function updateScrollEffect() {
    const scrollY = window.scrollY;
    const scrollProgress = Math.min(scrollY / window.innerHeight, 1);
    const rotationAngle = scrollProgress * config.maxRotation;
    
    // Apply scroll-based rotation
    const currentTransform = mandalaGrid.style.transform || '';
    const baseTransform = currentTransform.replace(/rotateZ\([^)]*\)/g, '').trim();
    
    mandalaGrid.style.transform = `${baseTransform} rotateZ(${rotationAngle}deg)`;
    
    lastScrollY = scrollY;
    rafId = null;
  }
  
  function handleScroll() {
    if (!rafId) {
      rafId = requestAnimationFrame(updateScrollEffect);
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}

function initItemAnimations(mandalaGrid, config) {
  const items = mandalaGrid.querySelectorAll('.mandala-item');
  
  items.forEach((item, index) => {
    // Stagger initial animation
    item.style.animationDelay = `${index * 0.1}s`;
    item.classList.add('mandala-item-3d-enhanced');
    
    // Add hover effects
    const handleMouseEnter = () => {
      item.style.transform = 'translateZ(20px) scale(1.05)';
      item.style.transition = `transform ${config.animationDuration}ms ease-out`;
    };
    
    const handleMouseLeave = () => {
      item.style.transform = 'translateZ(0) scale(1)';
    };
    
    const handleFocus = () => {
      item.style.transform = 'translateZ(20px) scale(1.05)';
      item.style.transition = `transform ${config.animationDuration}ms ease-out`;
    };
    
    const handleBlur = () => {
      item.style.transform = 'translateZ(0) scale(1)';
    };
    
    item.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    item.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    item.addEventListener('focus', handleFocus, { passive: true });
    item.addEventListener('blur', handleBlur, { passive: true });
  });
}

function initDepthEffects(mandalaGrid, config) {
  const items = mandalaGrid.querySelectorAll('.mandala-item');
  
  // Create depth layers
  items.forEach((item, index) => {
    const depth = (index % 3) * 10; // Vary depth based on position
    item.style.transform = `translateZ(${depth}px)`;
    item.style.transition = `transform ${config.animationDuration}ms ease`;
  });
  
  // Add intersection observer for progressive reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('mandala-item-revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  items.forEach(item => observer.observe(item));
  
  return () => {
    observer.disconnect();
  };
}

// Fallback for basic mandala without 3D effects
export function initBasicMandala() {
  const mandalaGrid = document.querySelector('.mandala-grid');
  if (!mandalaGrid) return;
  
  mandalaGrid.classList.add('basic-mandala-fallback');
  
  // Simple focus management
  const items = mandalaGrid.querySelectorAll('.mandala-item');
  items.forEach(item => {
    item.addEventListener('focus', () => {
      item.style.transform = 'scale(1.02)';
      item.style.transition = 'transform 0.2s ease';
    });
    
    item.addEventListener('blur', () => {
      item.style.transform = 'scale(1)';
    });
  });
}
