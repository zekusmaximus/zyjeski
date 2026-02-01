/**
 * ADVANCED IMAGE OPTIMIZATION SYSTEM
 * Responsive images, format detection, lazy loading, and performance optimization
 */

class ImageOptimizer {
  constructor() {
    this.supportedFormats = {
      webp: null,
      avif: null,
      jp2: null
    };
    
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.connectionSpeed = this.getConnectionSpeed();
    this.performanceBudget = null;
    this.loadedImages = new Set();
    this.imageCache = new Map();
    
    this.breakpoints = {
      small: 480,
      medium: 768,
      large: 1024,
      xlarge: 1440,
      xxlarge: 1920
    };
    
    this.init();
  }

  async init() {
    await this.detectFormatSupport();
    await this.loadPerformanceBudget();
    this.setupImageProcessing();
    this.setupIntersectionObserver();
    this.setupConnectionMonitoring();
    this.setupImageErrorHandling();
    
    console.log('ImageOptimizer initialized', {
      formats: this.supportedFormats,
      dpr: this.devicePixelRatio,
      connection: this.connectionSpeed
    });
  }

  async detectFormatSupport() {
    const [webp, avif, jp2] = await Promise.all([
      this.testImageFormat('webp'),
      this.testImageFormat('avif'),
      this.testImageFormat('jp2')
    ]);

    this.supportedFormats.webp = webp;
    this.supportedFormats.avif = avif;
    this.supportedFormats.jp2 = jp2;
  }

  testImageFormat(format) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 1, 1);
      
      const formats = {
        webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
        jp2: canvas.toDataURL('image/jp2')
      };
      
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = formats[format];
      
      // Timeout fallback
      setTimeout(() => resolve(false), 100);
    });
  }

  getConnectionSpeed() {
    if (navigator.connection) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow';
        case '3g':
          return 'medium';
        case '4g':
          return 'fast';
        default:
          return 'medium';
      }
    }
    return 'medium';
  }

  async loadPerformanceBudget() {
    try {
      const response = await fetch('/performance-budget.json');
      this.performanceBudget = await response.json();
    } catch {
      this.performanceBudget = {
        optimization: {
          images: {
            qualities: { mobile: 75, tablet: 85, desktop: 90 },
            sizes: { thumbnail: 300, medium: 800, large: 1200, xlarge: 1600 }
          }
        }
      };
    }
  }

  setupImageProcessing() {
    // Process all images on the page
    this.processExistingImages();
    
    // Watch for new images added to DOM
    this.observeNewImages();
  }

  processExistingImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => this.processImage(img));
  }

  observeNewImages() {
    if (!window.MutationObserver) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'IMG') {
              this.processImage(node);
            } else {
              const images = node.querySelectorAll?.('img');
              images?.forEach(img => this.processImage(img));
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processImage(img) {
    if (img.dataset.optimized) return;
    
    // Mark as processed
    img.dataset.optimized = 'true';
    
    // Setup responsive image
    this.setupResponsiveImage(img);
    
    // Setup lazy loading
    this.setupImageLazyLoading(img);
    
    // Optimize image format
    this.optimizeImageFormat(img);
    
    // Setup error handling
    this.setupImageErrorHandling(img);
  }

  setupResponsiveImage(img) {
    const originalSrc = img.src || img.dataset.src;
    if (!originalSrc) return;
    
    // Generate responsive image URLs
    const responsiveImages = this.generateResponsiveUrls(originalSrc);
    
    // Create srcset
    const srcset = this.createSrcset(responsiveImages);
    if (srcset) {
      img.srcset = srcset;
    }
    
    // Create sizes attribute
    const sizes = this.createSizesAttribute(img);
    if (sizes) {
      img.sizes = sizes;
    }
    
    // Store original for fallback
    img.dataset.originalSrc = originalSrc;
  }

  generateResponsiveUrls(originalSrc) {
    const urls = new Map();
    const basePath = originalSrc.replace(/\.[^/.]+$/, '');
    const extension = originalSrc.match(/\.([^/.]+)$/)?.[1] || 'jpg';
    
    // Generate different sizes
    Object.entries(this.breakpoints).forEach(([name, width]) => {
      // Adjust for device pixel ratio
      const actualWidth = width * Math.min(this.devicePixelRatio, 2);
      
      // Choose quality based on connection and device
      const quality = this.getQualityForDevice();
      
      // Generate optimized URL
      const optimizedUrl = this.generateOptimizedUrl(basePath, extension, actualWidth, quality);
      urls.set(actualWidth, optimizedUrl);
    });
    
    return urls;
  }

  generateOptimizedUrl(basePath, extension, width, quality) {
    // This would integrate with your image optimization service
    // Examples: Cloudinary, ImageKit, custom Hugo image processing
    
    // For Hugo's built-in image processing:
    const params = new URLSearchParams({
      width: width.toString(),
      quality: quality.toString(),
      format: this.getBestFormat(extension)
    });
    
    return `${basePath}_${width}w_q${quality}.${this.getBestFormat(extension)}`;
  }

  getBestFormat(originalFormat) {
    // Return best supported format
    if (this.supportedFormats.avif && this.connectionSpeed !== 'slow') {
      return 'avif';
    } else if (this.supportedFormats.webp) {
      return 'webp';
    } else if (this.supportedFormats.jp2 && originalFormat === 'jpg') {
      return 'jp2';
    }
    return originalFormat;
  }

  getQualityForDevice() {
    const deviceType = this.getDeviceType();
    const qualities = this.performanceBudget?.optimization?.images?.qualities || {
      mobile: 75,
      tablet: 85,
      desktop: 90
    };
    
    let quality = qualities[deviceType] || 85;
    
    // Adjust for connection speed
    if (this.connectionSpeed === 'slow') {
      quality = Math.max(60, quality - 15);
    } else if (this.connectionSpeed === 'fast') {
      quality = Math.min(95, quality + 5);
    }
    
    return quality;
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < this.breakpoints.medium) return 'mobile';
    if (width < this.breakpoints.large) return 'tablet';
    return 'desktop';
  }

  createSrcset(responsiveImages) {
    const srcsetArray = [];
    
    responsiveImages.forEach((url, width) => {
      srcsetArray.push(`${url} ${width}w`);
    });
    
    return srcsetArray.join(', ');
  }

  createSizesAttribute(img) {
    // Determine image size based on layout
    const container = img.closest('.container, .section, main');
    const containerWidth = container ? container.offsetWidth : window.innerWidth;
    
    // Default responsive sizes
    const sizes = [
      `(max-width: ${this.breakpoints.small}px) 100vw`,
      `(max-width: ${this.breakpoints.medium}px) 50vw`,
      `(max-width: ${this.breakpoints.large}px) 33vw`,
      '25vw'
    ];
    
    // Check for specific image classes or data attributes
    if (img.classList.contains('full-width') || img.dataset.fullWidth) {
      return '100vw';
    } else if (img.classList.contains('half-width')) {
      return '(max-width: 768px) 100vw, 50vw';
    }
    
    return sizes.join(', ');
  }

  setupImageLazyLoading(img) {
    // Only setup if not already handled by global lazy loader
    if (img.loading === 'lazy' || img.dataset.lazyLoaded) return;
    
    // Determine if image should be lazy loaded
    const shouldLazyLoad = this.shouldLazyLoadImage(img);
    
    if (shouldLazyLoad) {
      // Setup lazy loading
      img.loading = 'lazy';
      
      // Create placeholder if needed
      if (!img.src && img.dataset.src) {
        img.src = this.createImagePlaceholder(img);
        img.dataset.lazySrc = img.dataset.src;
      }
      
      // Setup intersection observer for enhanced lazy loading
      this.observeImageForLazyLoading(img);
    }
  }

  shouldLazyLoadImage(img) {
    // Don't lazy load critical images
    if (img.dataset.critical || img.classList.contains('critical')) {
      return false;
    }
    
    // Don't lazy load images in viewport
    const rect = img.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    
    return !inViewport;
  }

  createImagePlaceholder(img) {
    const width = parseInt(img.dataset.width) || 400;
    const height = parseInt(img.dataset.height) || 300;
    const aspectRatio = height / width;
    
    // Create SVG placeholder with aspect ratio
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6E0DD0" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#00F5D4" stop-opacity="0.1"/>
          </linearGradient>
          <pattern id="dots-${Date.now()}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#6E0DD0" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad-${Date.now()})"/>
        <rect width="100%" height="100%" fill="url(#dots-${Date.now()})"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#00F5D4" font-family="Orbitron, monospace" font-size="12" opacity="0.7">
          Loading...
        </text>
      </svg>
    `.trim();
    
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  setupIntersectionObserver() {
    if (!window.IntersectionObserver) return;
    
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
  }

  observeImageForLazyLoading(img) {
    if (this.imageObserver) {
      this.imageObserver.observe(img);
    }
  }

  async loadImage(img) {
    if (img.dataset.loaded || this.loadedImages.has(img)) return;
    
    const src = img.dataset.lazySrc || img.dataset.src || img.src;
    if (!src) return;
    
    try {
      // Mark as loading
      img.classList.add('image-loading');
      
      // Check cache first
      if (this.imageCache.has(src)) {
        this.applyLoadedImage(img, src);
        return;
      }
      
      // Load image
      await this.preloadImage(src);
      
      // Cache successful load
      this.imageCache.set(src, true);
      
      // Apply loaded image
      this.applyLoadedImage(img, src);
      
    } catch (error) {
      console.warn('Failed to load image:', src, error);
      this.handleImageError(img, error);
    }
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      
      // Set timeout for slow connections
      const timeout = this.connectionSpeed === 'slow' ? 15000 : 8000;
      setTimeout(() => reject(new Error('Image load timeout')), timeout);
      
      img.src = src;
    });
  }

  applyLoadedImage(img, src) {
    // Remove loading state
    img.classList.remove('image-loading');
    img.classList.add('image-loaded');
    
    // Apply image
    img.src = src;
    img.dataset.loaded = 'true';
    
    // Mark as loaded
    this.loadedImages.add(img);
    
    // Unobserve
    if (this.imageObserver) {
      this.imageObserver.unobserve(img);
    }
    
    // Trigger load animation
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });
  }

  handleImageError(img, error) {
    img.classList.remove('image-loading');
    img.classList.add('image-error');
    
    // Try fallback formats
    this.tryFallbackFormats(img);
  }

  async tryFallbackFormats(img) {
    const originalSrc = img.dataset.originalSrc || img.dataset.lazySrc;
    if (!originalSrc) return;
    
    const fallbackFormats = ['jpg', 'png', 'gif'];
    
    for (const format of fallbackFormats) {
      try {
        const fallbackSrc = originalSrc.replace(/\.[^/.]+$/, `.${format}`);
        await this.preloadImage(fallbackSrc);
        
        this.applyLoadedImage(img, fallbackSrc);
        return;
      } catch {
        continue;
      }
    }
    
    // All fallbacks failed
    this.showImageErrorPlaceholder(img);
  }

  showImageErrorPlaceholder(img) {
    const placeholder = this.createErrorPlaceholder();
    img.src = placeholder;
    img.alt = img.alt || 'Image failed to load';
  }

  createErrorPlaceholder() {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="100%" height="100%" fill="#2D0F54" opacity="0.3"/>
        <path d="M100 100 L300 100 L300 200 L100 200 Z M120 120 L280 120 L280 180 L120 180 Z" fill="none" stroke="#6E0DD0" stroke-width="2" stroke-dasharray="5,5"/>
        <circle cx="150" cy="140" r="8" fill="#6E0DD0" opacity="0.5"/>
        <text x="200" y="170" text-anchor="middle" fill="#00F5D4" font-family="Orbitron, monospace" font-size="12">
          Image not available
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  setupConnectionMonitoring() {
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        const newSpeed = this.getConnectionSpeed();
        if (newSpeed !== this.connectionSpeed) {
          this.connectionSpeed = newSpeed;
          this.adjustImageQuality();
        }
      });
    }
  }

  adjustImageQuality() {
    // Re-process images with new quality settings
    const images = document.querySelectorAll('img[data-optimized]');
    images.forEach(img => {
      if (!img.dataset.loaded) {
        this.optimizeImageFormat(img);
      }
    });
  }

  optimizeImageFormat(img) {
    const src = img.src || img.dataset.src;
    if (!src) return;
    
    // Generate optimized URL with best format
    const optimizedSrc = this.generateOptimizedImageUrl(src);
    if (optimizedSrc !== src) {
      if (img.dataset.lazySrc) {
        img.dataset.lazySrc = optimizedSrc;
      } else {
        img.src = optimizedSrc;
      }
    }
  }

  generateOptimizedImageUrl(originalUrl) {
    // This would integrate with your actual image optimization pipeline
    const url = new URL(originalUrl, window.location.origin);
    const params = new URLSearchParams(url.search);
    
    // Set optimal format
    const format = this.getBestFormat('jpg');
    params.set('format', format);
    
    // Set quality
    const quality = this.getQualityForDevice();
    params.set('quality', quality.toString());
    
    url.search = params.toString();
    return url.toString();
  }

  setupImageErrorHandling(img) {
    if (img.dataset.errorHandled) return;
    
    img.addEventListener('error', (event) => {
      this.handleImageError(img, event);
    });
    
    img.dataset.errorHandled = 'true';
  }

  // Public API
  processNewImage(img) {
    this.processImage(img);
  }

  preloadImages(urls) {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  getOptimizedImageUrl(originalUrl, options = {}) {
    return this.generateOptimizedImageUrl(originalUrl);
  }

  // Cleanup
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    this.imageCache.clear();
    this.loadedImages.clear();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.imageOptimizer = new ImageOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}
