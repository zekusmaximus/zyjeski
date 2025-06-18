/**
 * Basic Interactions Module
 * Handles core interactive functionality
 */
export class BasicInteractionsModule {
  constructor() {
    this.init();
  }

  init() {
    this.setupHoverEffects();
    this.setupClickHandlers();
    this.setupTouchSupport();
    this.setupScrollEffects();
  }

  setupHoverEffects() {
    const items = document.querySelectorAll('.mandala-item');
    
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.handleItemHover(item, true);
      });

      item.addEventListener('mouseleave', () => {
        this.handleItemHover(item, false);
      });
    });
  }

  handleItemHover(item, isHovering) {
    if (isHovering) {
      item.style.transform = 'translateY(-5px) translateZ(10px)';
      item.style.transition = 'transform 0.3s ease';
      item.classList.add('hovered');
    } else {
      item.style.transform = '';
      item.classList.remove('hovered');
    }
  }

  setupClickHandlers() {
    const items = document.querySelectorAll('.mandala-item');
    
    items.forEach(item => {
      const link = item.querySelector('a');
      if (!link) return;

      item.addEventListener('click', (e) => {
        // If click is directly on the link, let it proceed normally
        if (e.target === link || link.contains(e.target)) {
          console.log(`Natural navigation to: ${link.href}`);
          return;
        }

        // Otherwise, prevent default and navigate manually
        e.preventDefault();
        console.log(`Manual navigation to: ${link.href}`);
        
        // Add visual feedback
        item.classList.add('clicked');
        setTimeout(() => {
          item.classList.remove('clicked');
          window.location.href = link.href;
        }, 150);
      });
    });
  }

  setupTouchSupport() {
    if (!('ontouchstart' in window)) return;

    const items = document.querySelectorAll('.mandala-item');
    
    items.forEach(item => {
      item.addEventListener('touchstart', () => {
        item.classList.add('touch-active');
      }, { passive: true });

      item.addEventListener('touchend', () => {
        item.classList.remove('touch-active');
      }, { passive: true });

      // Handle touch cancellation
      item.addEventListener('touchcancel', () => {
        item.classList.remove('touch-active');
      }, { passive: true });
    });
  }

  setupScrollEffects() {
    let ticking = false;

    const updateScrollEffects = () => {
      const scrollY = window.pageYOffset;
      const vh = window.innerHeight;
      const scrollProgress = Math.min(scrollY / vh, 1);

      // Apply parallax effect to mandala grid
      const grid = document.querySelector('.mandala-grid');
      if (grid) {
        const rotation = scrollProgress * 3; // Max 3 degrees rotation
        grid.style.transform = `${grid.style.transform.replace(/rotateZ\([^)]*\)/g, '')} rotateZ(${rotation}deg)`;
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    }, { passive: true });
  }
}

// Export for module loading
export default BasicInteractionsModule;
