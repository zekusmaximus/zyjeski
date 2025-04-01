// Complete main.js with mobile optimizations

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the mandala grid effects
  initMandalaEffects();
  
  // Add cyberpunk text effects
  initCyberpunkTextEffects();
  
  // Create digital rain effect if needed
  createDigitalRain();
});

function initMandalaEffects() {
  const mandalaGrid = document.querySelector('.mandala-grid');
  
  if (!mandalaGrid) return;
  
  // Check if device is mobile/tablet using a reliable method
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  
  // Add 3D rotation effect on mouse move, but only for non-touch devices
  if (!isTouch && !isMobile) {
    document.addEventListener('mousemove', function(e) {
      if (!mandalaGrid) return;
      
      const xAxis = (window.innerWidth / 2 - e.pageX) / 50; // Reduced intensity (was 25)
      const yAxis = (window.innerHeight / 2 - e.pageY) / 50; // Reduced intensity
      
      // Apply rotation with limits to prevent extreme angles
      mandalaGrid.style.transform = `rotateY(${Math.max(-5, Math.min(5, xAxis))}deg) rotateX(${Math.max(-5, Math.min(5, yAxis))}deg)`;
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', function() {
      if (!mandalaGrid) return;
      mandalaGrid.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
    
    // Add subtle rotation on scroll, again only for non-touch devices
    window.addEventListener('scroll', function() {
      if (isMobile || isTouch) return; // Skip for mobile/touch devices
      
      const scrollPosition = window.scrollY;
      const rotationAngle = (scrollPosition / window.innerHeight) * 3; // Reduced max angle
      
      if (mandalaGrid && rotationAngle <= 3) {
        mandalaGrid.style.transform = `rotateX(${rotationAngle}deg) rotateZ(${rotationAngle/4}deg)`;
      }
    });
  }
  
  // Add hover/touch effects to mandala items
  const mandalaItems = document.querySelectorAll('.mandala-item');
  
  mandalaItems.forEach(item => {
    // Different handling for touch vs non-touch
    if (isTouch) {
      // For touch devices, use touch events instead of hover
      item.addEventListener('touchstart', function(e) {
        // Only add subtle effects for touch
        this.style.transform = 'translateY(-3px)';
        this.style.borderColor = 'rgba(0, 255, 255, 0.7)';
        
        // Highlight this item and dim others
        mandalaItems.forEach(otherItem => {
          if (otherItem !== this) {
            otherItem.style.opacity = '0.7';
          }
        });
      });
      
      // Reset on touch end
      item.addEventListener('touchend', function() {
        // Reset this item
        this.style.transform = '';
        this.style.borderColor = '';
        
        // Reset other items
        mandalaItems.forEach(otherItem => {
          otherItem.style.opacity = '1';
        });
      });
    } else {
      // For non-touch devices, use hover effects
      item.addEventListener('mouseenter', function() {
        // Only add glitch effect on desktop
        if (!isMobile) {
          createGlitchEffect(this);
        }
        
        // Add glow to other items
        mandalaItems.forEach(otherItem => {
          if (otherItem !== this) {
            otherItem.style.opacity = '0.7';
          }
        });
      });
      
      item.addEventListener('mouseleave', function() {
        // Remove effects
        this.classList.remove('glitching');
        
        // Reset other items
        mandalaItems.forEach(otherItem => {
          otherItem.style.opacity = '1';
        });
      });
    }
  });
  
  // Add special handling for the mandala center item
  const mandalaCenter = document.querySelector('.mandala-center');
  if (mandalaCenter) {
    // Use simpler effects on mobile
    if (isMobile || isTouch) {
      mandalaCenter.addEventListener('touchstart', function() {
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
      });
      
      mandalaCenter.addEventListener('touchend', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    }
  }
}

// Create a less resource-intensive glitch effect for mobile
function createGlitchEffect(element) {
  // Check if we're on mobile
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  element.classList.add('glitching');
  
  if (isMobile) {
    // Simpler effect for mobile - just a single transform
    element.style.transform = 'translate(1px, -1px)';
    
    setTimeout(() => {
      element.style.transform = '';
      element.classList.remove('glitching');
    }, 300);
    
    return;
  }
  
  // Full effect for desktop
  const glitchAnimation = setInterval(() => {
    const randX = Math.random() * 4 - 2; // -2 to 2px
    const randY = Math.random() * 4 - 2; // -2 to 2px
    const randSkew = Math.random() * 4 - 2; // -2 to 2 degrees
    
    element.style.transform = `translate(${randX}px, ${randY}px) skew(${randSkew}deg)`;
    
    setTimeout(() => {
      element.style.transform = 'translate(0, 0) skew(0)';
    }, 50);
  }, 200);
  
  // Stop after 2 seconds
  setTimeout(() => {
    clearInterval(glitchAnimation);
    element.style.transform = '';
  }, 2000);
}

function initCyberpunkTextEffects() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Glitch effect for site title
  const siteTitle = document.querySelector('.site-title');
  if (siteTitle && !isMobile) {
    siteTitle.addEventListener('mouseenter', function() {
      this.classList.add('text-glitch');
      setTimeout(() => {
        this.classList.remove('text-glitch');
      }, 1000);
    });
  }

  // Symbol effect for author name
  const authorName = document.querySelector('.author-name');
  if (authorName && !isMobile) {
    authorName.addEventListener('mouseenter', function() {
      const originalText = this.getAttribute('data-text');
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      let iterations = 0;

      const interval = setInterval(() => {
        this.textContent = originalText
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        if (iterations >= originalText.length) {
          clearInterval(interval);
          this.textContent = originalText;
        }

        iterations += 1 / 3;
      }, 30);
    });

    authorName.addEventListener('mouseleave', function() {
      this.textContent = this.getAttribute('data-text'); // Reset to original text
    });
  }
}

// Add some digital rain effect to the background on special pages
function createDigitalRain() {
  // Check if we're on a special page that should have the effect
  const isSpecialPage = document.body.classList.contains('digital-rain-bg');
  if (!isSpecialPage) return;
  
  // Skip on mobile for performance
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return;
  
  const canvas = document.createElement('canvas');
  canvas.classList.add('digital-rain');
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const columns = Math.floor(canvas.width / 20);
  const drops = [];
  
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }
  
  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0f0';
    ctx.font = '15px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * 20, drops[i] * 20);
      
      if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      
      drops[i]++;
    }
  }
  
  // Use requestAnimationFrame for better performance
  let animationId;
  function animate() {
    draw();
    animationId = requestAnimationFrame(animate);
  }
  
  animate();
  
  // Handle window resize
  window.addEventListener('resize', throttle(function() {
    // Cancel the previous animation
    cancelAnimationFrame(animationId);
    
    // Update canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Recalculate columns
    const newColumns = Math.floor(canvas.width / 20);
    
    // Adjust drops array
    if (newColumns > columns) {
      // Add new drops
      for (let i = columns; i < newColumns; i++) {
        drops[i] = Math.random() * -100;
      }
    } else if (newColumns < columns) {
      // Remove excess drops
      drops.length = newColumns;
    }
    
    // Restart animation
    animate();
  }, 200), { passive: true });
  
  // Clean up on page unload
  window.addEventListener('beforeunload', function() {
    cancelAnimationFrame(animationId);
  });
}

// Detect if device supports touch events for better interaction handling
function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}

// Custom function for better performance on mobile
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Add lazy loading for images
function initLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  } else {
    // Fallback for browsers that don't support native lazy loading
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers without IntersectionObserver
      // Load all images immediately
      images.forEach(img => {
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
      });
    }
  }
}

// Initialize lazy loading on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initLazyLoading);

// Add debounce function for scroll and resize events
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Detect when animations and transitions end
function whichAnimationEvent() {
  const el = document.createElement('fakeelement');
  const animations = {
    'animation': 'animationend',
    'OAnimation': 'oAnimationEnd',
    'MozAnimation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd'
  };

  for (const a in animations) {
    if (el.style[a] !== undefined) {
      return animations[a];
    }
  }
}

function whichTransitionEvent() {
  const el = document.createElement('fakeelement');
  const transitions = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
  };

  for (const t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
}
