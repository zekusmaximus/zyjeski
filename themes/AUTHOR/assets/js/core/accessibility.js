/**
 * Core Accessibility Module
 * Provides enhanced accessibility features
 */
export class AccessibilityModule {
  constructor() {
    this.announcer = null;
    this.init();
  }

  init() {
    this.setupAnnouncer();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAriaLabels();
  }

  setupAnnouncer() {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.id = 'accessibility-announcer';
    document.body.appendChild(this.announcer);
  }

  announce(message, priority = 'polite') {
    if (this.announcer) {
      this.announcer.setAttribute('aria-live', priority);
      this.announcer.textContent = message;
      
      // Clear the message after a delay
      setTimeout(() => {
        this.announcer.textContent = '';
      }, 1000);
    }
  }

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for mandala grid
    const grid = document.querySelector('.mandala-grid');
    if (!grid) return;

    const items = grid.querySelectorAll('.mandala-item');
    let currentIndex = 0;

    grid.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          currentIndex = Math.min(currentIndex + 1, items.length - 1);
          items[currentIndex].focus();
          this.announce(`Focused on ${this.getItemDescription(items[currentIndex])}`);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          currentIndex = Math.max(currentIndex - 1, 0);
          items[currentIndex].focus();
          this.announce(`Focused on ${this.getItemDescription(items[currentIndex])}`);
          break;
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          items[currentIndex].focus();
          this.announce('Moved to first item');
          break;
        case 'End':
          e.preventDefault();
          currentIndex = items.length - 1;
          items[currentIndex].focus();
          this.announce('Moved to last item');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const link = items[currentIndex].querySelector('a');
          if (link) {
            this.announce(`Navigating to ${link.textContent}`);
            link.click();
          }
          break;
      }
    });
  }

  setupFocusManagement() {
    // Ensure focus is visible and properly managed
    document.addEventListener('focusin', (e) => {
      e.target.classList.add('focused');
    });

    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('focused');
    });
  }

  setupAriaLabels() {
    // Add missing ARIA labels
    const mandalaitems = document.querySelectorAll('.mandala-item');
    mandalaitems.forEach((item, index) => {
      if (!item.getAttribute('aria-label')) {
        const title = item.querySelector('.mandala-item-title')?.textContent;
        const description = item.querySelector('.mandala-item-description')?.textContent;
        const label = title ? `${title}. ${description || ''}` : `Navigation item ${index + 1}`;
        item.setAttribute('aria-label', label.trim());
      }
    });
  }

  getItemDescription(item) {
    const title = item.querySelector('.mandala-item-title')?.textContent;
    const description = item.querySelector('.mandala-item-description')?.textContent;
    return title || description || 'navigation item';
  }
}

// Export for module loading
export default AccessibilityModule;
