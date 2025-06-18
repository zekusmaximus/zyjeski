/**
 * Enhanced Social Sharing Functionality for Neuro-Digital Enlightenment
 * Includes analytics tracking, advanced reading progress, and share optimization
 */

class NeuroDigitalSharing {
  constructor() {
    this.init();
  }

  init() {
    this.setupCopyToClipboard();
    this.setupReadingProgress();
    this.setupAnalytics();
    this.setupKeyboardNavigation();
    this.setupPerformanceOptimizations();
  }

  setupCopyToClipboard() {
    const copyBtns = document.querySelectorAll('.share-copy');
    
    copyBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.copyToClipboard(btn);
      });
    });
  }

  async copyToClipboard(btn) {
    const url = btn.dataset.url;
    const title = btn.dataset.title;
    const contentType = btn.closest('.social-share-container')?.dataset.contentType || 'insight';
    
    // Create content-specific sharing text
    const shareText = this.createShareText(title, url, contentType);
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers
        await this.fallbackCopyTextToClipboard(shareText);
      }
      
      this.showCopySuccess(btn);
      this.trackShareEvent('copy', contentType);
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
      this.showCopyError();
    }
  }

  createShareText(title, url, contentType) {
    const contentTypePrefixes = {
      koan: '🧘 Digital Koan',
      simulation: '🌊 Neural Simulation',
      transmission: '📡 Digital Transmission',
      manuscript: '📖 Digital Manuscript',
      insight: '✨ Neuro-Digital Insight'
    };
    
    const prefix = contentTypePrefixes[contentType] || contentTypePrefixes.insight;
    return `${prefix}: ${title}\n\n${url}\n\n#NeuroDigitalEnlightenment`;
  }

  fallbackCopyTextToClipboard(text) {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (err) {
        textArea.remove();
        reject(err);
      }
    });
  }

  showCopySuccess(btn) {
    // Update button state
    btn.classList.add('copied');
    const copyText = btn.querySelector('.copy-text');
    const originalText = copyText.textContent;
    copyText.textContent = 'Copied!';
    
    // Show notification
    this.showNotification('Link copied to clipboard!', 'success');
    
    // Reset button after delay
    setTimeout(() => {
      btn.classList.remove('copied');
      copyText.textContent = originalText;
    }, 2000);
  }

  showCopyError() {
    this.showNotification('Failed to copy link', 'error');
  }

  showNotification(message, type = 'success') {
    const notification = document.getElementById('copy-notification') || this.createNotification();
    const text = notification.querySelector('.notification-text');
    const icon = notification.querySelector('.notification-icon');
    
    text.textContent = message;
    icon.textContent = type === 'success' ? '✓' : '⚠️';
    
    notification.style.display = 'flex';
    notification.className = `copy-notification ${type}`;
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  createNotification() {
    const notification = document.createElement('div');
    notification.id = 'copy-notification';
    notification.className = 'copy-notification';
    notification.innerHTML = `
      <span class="notification-icon">✓</span>
      <span class="notification-text">Link copied to clipboard!</span>
    `;
    document.body.appendChild(notification);
    return notification;
  }

  setupReadingProgress() {
    const contentType = document.querySelector('.social-share-container')?.dataset.contentType;
    if (!contentType) return;

    this.readingTracker = new ReadingProgressTracker(contentType);
  }

  setupAnalytics() {
    // Track social share clicks
    document.querySelectorAll('.share-btn[href]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const platform = this.extractPlatformFromClass(btn.className);
        const contentType = btn.closest('.social-share-container')?.dataset.contentType;
        this.trackShareEvent(platform, contentType);
      });
    });
  }

  extractPlatformFromClass(className) {
    const platformMatch = className.match(/share-(\w+)/);
    return platformMatch ? platformMatch[1] : 'unknown';
  }

  trackShareEvent(platform, contentType) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: platform,
        content_type: contentType,
        item_id: window.location.pathname,
        custom_parameter_1: 'neuro_digital_enlightenment'
      });
    }

    // Plausible Analytics
    if (typeof plausible !== 'undefined') {
      plausible('Social Share', {
        props: {
          platform: platform,
          content_type: contentType,
          enlightenment_path: true
        }
      });
    }

    // Custom analytics endpoint (if available)
    if (window.customAnalytics) {
      window.customAnalytics.track('social_share', {
        platform,
        contentType,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  setupKeyboardNavigation() {
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  setupPerformanceOptimizations() {
    // Lazy load social sharing icons if not in viewport
    if ('IntersectionObserver' in window) {
      const shareContainers = document.querySelectorAll('.social-share-container');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadSocialIcons(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      shareContainers.forEach(container => {
        observer.observe(container);
      });
    }
  }

  loadSocialIcons(container) {
    // Icons are already inline SVG, but we could lazy load external assets here
    container.classList.add('loaded');
  }
}

class ReadingProgressTracker {
  constructor(contentType) {
    this.contentType = contentType;
    this.pageKey = `reading_progress_${window.location.pathname}`;
    this.visitKey = `visited_${window.location.pathname}`;
    this.setupProgressTracking();
    this.showProgressIndicatorIfReturning();
  }

  setupProgressTracking() {
    // Mark as visited
    localStorage.setItem(this.visitKey, Date.now().toString());
    
    let maxScrollPosition = 0;
    let ticking = false;

    const trackProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (scrollTop > maxScrollPosition) {
        maxScrollPosition = scrollTop;

        // Save progress every 10% increment and minimum 25%
        if (scrollPercent >= 25 && scrollPercent % 10 < 2) {
          this.saveProgress(scrollPercent, scrollTop);
        }
      }
    };

    // Throttled scroll tracking
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          trackProgress();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Save progress on page unload
    window.addEventListener('beforeunload', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      if (scrollPercent >= 10) {
        this.saveProgress(scrollPercent, scrollTop);
      }
    });
  }

  saveProgress(percentage, scrollPosition) {
    const progress = {
      percentage: Math.round(percentage),
      scrollPosition,
      timestamp: Date.now(),
      contentType: this.contentType
    };

    try {
      localStorage.setItem(this.pageKey, JSON.stringify(progress));
    } catch (e) {
      // Handle localStorage quota exceeded
      console.warn('Could not save reading progress:', e);
    }
  }

  showProgressIndicatorIfReturning() {
    const hasVisited = localStorage.getItem(this.visitKey);
    const savedProgress = localStorage.getItem(this.pageKey);
    const progressContainer = document.querySelector('.reading-progress-container');

    if (!progressContainer || !hasVisited || !savedProgress) return;

    try {
      const progress = JSON.parse(savedProgress);
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      // Show progress indicator if last visit was within a week and progress > 25%
      if ((now - progress.timestamp) < oneWeek && progress.percentage > 25 && progress.percentage < 90) {
        this.displayProgressIndicator(progressContainer, progress);
      }
    } catch (e) {
      console.warn('Could not parse saved progress:', e);
    }
  }

  displayProgressIndicator(container, progress) {
    container.style.display = 'block';
    
    // Update progress text
    const progressText = container.querySelector('.progress-text');
    if (progressText) {
      progressText.textContent = `Continue reading (${progress.percentage}% complete)`;
    }

    // Setup click handler to scroll to position
    const clickHandler = () => {
      window.scrollTo({
        top: progress.scrollPosition,
        behavior: 'smooth'
      });
      container.style.display = 'none';
      
      // Track continuation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'reading_continued', {
          content_type: this.contentType,
          progress_percentage: progress.percentage
        });
      }
    };

    container.addEventListener('click', clickHandler);

    // Setup dismiss handler
    const dismissBtn = container.querySelector('.progress-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        container.style.display = 'none';
        localStorage.removeItem(this.pageKey);
      });
    }

    // Auto-hide after 10 seconds if not interacted with
    setTimeout(() => {
      if (container.style.display !== 'none') {
        container.style.display = 'none';
      }
    }, 10000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NeuroDigitalSharing();
  });
} else {
  new NeuroDigitalSharing();
}

// Export for potential external use
window.NeuroDigitalSharing = NeuroDigitalSharing;
