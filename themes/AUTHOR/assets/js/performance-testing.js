/**
 * PERFORMANCE TESTING AND VALIDATION SUITE
 * Comprehensive testing for the Hugo Author Website
 */

class PerformanceTestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      scores: {},
      recommendations: [],
      budget: null
    };
    
    this.budget = null;
    this.thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTI: { good: 3800, poor: 7300 }
    };
    
    this.init();
  }

  async init() {
    await this.loadPerformanceBudget();
    this.setupPerformanceObservers();
    this.scheduleTests();
  }

  /**
   * Load performance budget configuration
   */
  async loadPerformanceBudget() {
    try {
      const response = await fetch('/performance-budget.json');
      this.budget = await response.json();
      console.log('Performance budget loaded:', this.budget);
    } catch (error) {
      console.warn('Could not load performance budget:', error);
      this.budget = this.getDefaultBudget();
    }
  }

  /**
   * Get default performance budget
   */
  getDefaultBudget() {
    return {
      budgets: {
        mobile: {
          metrics: { LCP: 2500, FID: 100, CLS: 0.1 },
          resources: { totalSize: 1500, cssSize: 150, jsSize: 500 }
        },
        desktop: {
          metrics: { LCP: 1500, FID: 50, CLS: 0.05 },
          resources: { totalSize: 4000, cssSize: 300, jsSize: 1200 }
        }
      }
    };
  }

  /**
   * Setup performance observers for real-time monitoring
   */
  setupPerformanceObservers() {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    // Core Web Vitals observer
    try {
      const vitalsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordVital(entry);
        }
      });

      vitalsObserver.observe({ 
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    } catch (error) {
      console.warn('Could not setup vitals observer:', error);
    }

    // Resource timing observer
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeResource(entry);
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Could not setup resource observer:', error);
    }
  }

  /**
   * Record Core Web Vital
   */
  recordVital(entry) {
    const vital = {
      name: entry.name || entry.entryType,
      value: entry.value || entry.startTime,
      timestamp: performance.now(),
      url: window.location.pathname
    };

    // Calculate score
    vital.score = this.calculateVitalScore(vital.name, vital.value);
    
    this.results.tests.push({
      type: 'vital',
      data: vital,
      passed: vital.score === 'good'
    });

    // Update aggregated scores
    this.results.scores[vital.name] = vital;

    console.log(`📊 ${vital.name}: ${vital.value}ms (${vital.score})`);
  }

  /**
   * Calculate vital score (good/needs-improvement/poor)
   */
  calculateVitalScore(name, value) {
    const thresholds = this.thresholds[name.toUpperCase()];
    if (!thresholds) return 'unknown';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Analyze resource performance
   */
  analyzeResource(entry) {
    const resource = {
      name: entry.name,
      type: entry.initiatorType,
      size: entry.transferSize || 0,
      duration: entry.responseEnd - entry.requestStart,
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0
    };

    // Flag slow resources
    if (resource.duration > 1000) {
      this.results.recommendations.push({
        type: 'slow-resource',
        message: `Slow resource: ${resource.name} (${resource.duration}ms)`,
        priority: 'high'
      });
    }

    // Flag large resources
    if (resource.size > 500 * 1024) { // 500KB
      this.results.recommendations.push({
        type: 'large-resource',
        message: `Large resource: ${resource.name} (${Math.round(resource.size / 1024)}KB)`,
        priority: 'medium'
      });
    }

    this.results.tests.push({
      type: 'resource',
      data: resource,
      passed: resource.duration < 1000 && resource.size < 500 * 1024
    });
  }

  /**
   * Schedule comprehensive tests
   */
  scheduleTests() {
    // Test immediately
    setTimeout(() => this.runConnectivityTests(), 1000);
    setTimeout(() => this.runAccessibilityTests(), 2000);
    setTimeout(() => this.runCompatibilityTests(), 3000);
    
    // Test after user interactions
    this.setupInteractionTests();
    
    // Test periodically
    setInterval(() => this.runPeriodicTests(), 30000);
  }

  /**
   * Test network connectivity impact
   */
  async runConnectivityTests() {
    const connection = navigator.connection;
    if (!connection) return;

    const connectionTest = {
      type: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };

    // Simulate slow connection behavior
    if (['slow-2g', '2g'].includes(connection.effectiveType)) {
      this.results.recommendations.push({
        type: 'slow-connection',
        message: 'Slow connection detected - consider reducing resource sizes',
        priority: 'high'
      });
    }

    this.results.tests.push({
      type: 'connectivity',
      data: connectionTest,
      passed: !['slow-2g', '2g'].includes(connection.effectiveType)
    });
  }

  /**
   * Test accessibility performance impact
   */
  runAccessibilityTests() {
    const tests = [
      {
        name: 'skip-links',
        test: () => document.querySelector('.skip-link') !== null,
        impact: 'high'
      },
      {
        name: 'alt-text',
        test: () => {
          const images = document.querySelectorAll('img');
          return Array.from(images).every(img => img.alt !== undefined);
        },
        impact: 'medium'
      },
      {
        name: 'focus-visible',
        test: () => document.querySelector(':focus-visible') !== null,
        impact: 'medium'
      },
      {
        name: 'reduced-motion',
        test: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        impact: 'low'
      }
    ];

    tests.forEach(test => {
      const passed = test.test();
      this.results.tests.push({
        type: 'accessibility',
        data: { name: test.name, impact: test.impact },
        passed
      });

      if (!passed && test.impact === 'high') {
        this.results.recommendations.push({
          type: 'accessibility',
          message: `Accessibility issue: ${test.name}`,
          priority: 'high'
        });
      }
    });
  }

  /**
   * Test browser compatibility
   */
  runCompatibilityTests() {
    const features = [
      {
        name: 'IntersectionObserver',
        test: () => 'IntersectionObserver' in window,
        fallback: 'Polyfill or fallback needed'
      },
      {
        name: 'WebP',
        test: () => this.supportsWebP(),
        fallback: 'Use JPEG/PNG fallbacks'
      },
      {
        name: 'ServiceWorker',
        test: () => 'serviceWorker' in navigator,
        fallback: 'No offline functionality'
      },
      {
        name: 'PerformanceObserver',
        test: () => 'PerformanceObserver' in window,
        fallback: 'Limited performance monitoring'
      }
    ];

    features.forEach(feature => {
      const supported = feature.test();
      this.results.tests.push({
        type: 'compatibility',
        data: { name: feature.name, fallback: feature.fallback },
        passed: supported
      });

      if (!supported) {
        this.results.recommendations.push({
          type: 'compatibility',
          message: `${feature.name} not supported - ${feature.fallback}`,
          priority: 'medium'
        });
      }
    });
  }

  /**
   * Test WebP support
   */
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Setup interaction-based tests
   */
  setupInteractionTests() {
    let firstInteraction = false;
    
    const interactionHandler = () => {
      if (!firstInteraction) {
        firstInteraction = true;
        setTimeout(() => this.runInteractionTests(), 100);
      }
    };

    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, interactionHandler, { 
        once: true, 
        passive: true 
      });
    });
  }

  /**
   * Test performance after first interaction
   */
  runInteractionTests() {
    // Test input latency
    const inputElements = document.querySelectorAll('input, textarea, button');
    inputElements.forEach(element => {
      this.testInputLatency(element);
    });

    // Test scroll performance
    this.testScrollPerformance();
  }

  /**
   * Test input latency
   */
  testInputLatency(element) {
    let startTime;
    
    element.addEventListener('pointerdown', () => {
      startTime = performance.now();
    }, { passive: true });
    
    element.addEventListener('pointerup', () => {
      if (startTime) {
        const latency = performance.now() - startTime;
        this.results.tests.push({
          type: 'input-latency',
          data: { element: element.tagName, latency },
          passed: latency < 100
        });
      }
    }, { passive: true });
  }

  /**
   * Test scroll performance
   */
  testScrollPerformance() {
    let frameCount = 0;
    let startTime = performance.now();
    
    const measureFrame = () => {
      frameCount++;
      requestAnimationFrame(measureFrame);
    };
    
    measureFrame();
    
    setTimeout(() => {
      const duration = performance.now() - startTime;
      const fps = (frameCount / duration) * 1000;
      
      this.results.tests.push({
        type: 'scroll-performance',
        data: { fps, frameCount, duration },
        passed: fps >= 30
      });
      
      if (fps < 30) {
        this.results.recommendations.push({
          type: 'scroll-performance',
          message: `Low scroll FPS: ${fps.toFixed(1)}`,
          priority: 'medium'
        });
      }
    }, 1000);
  }

  /**
   * Run periodic performance tests
   */
  runPeriodicTests() {
    this.testMemoryUsage();
    this.testCacheEffectiveness();
    this.generateReport();
  }

  /**
   * Test memory usage
   */
  testMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const memoryTest = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };

      this.results.tests.push({
        type: 'memory',
        data: memoryTest,
        passed: memoryTest.percentage < 80
      });

      if (memoryTest.percentage > 80) {
        this.results.recommendations.push({
          type: 'memory',
          message: `High memory usage: ${memoryTest.percentage.toFixed(1)}%`,
          priority: 'high'
        });
      }
    }
  }

  /**
   * Test cache effectiveness
   */
  testCacheEffectiveness() {
    const resourceEntries = performance.getEntriesByType('resource');
    const cachedResources = resourceEntries.filter(entry => 
      entry.transferSize === 0 && entry.decodedBodySize > 0
    );
    
    const cacheHitRate = cachedResources.length / resourceEntries.length;
    
    this.results.tests.push({
      type: 'cache-effectiveness',
      data: { 
        hitRate: cacheHitRate,
        cached: cachedResources.length,
        total: resourceEntries.length
      },
      passed: cacheHitRate > 0.7
    });

    if (cacheHitRate < 0.5) {
      this.results.recommendations.push({
        type: 'cache',
        message: `Low cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`,
        priority: 'medium'
      });
    }
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const report = {
      ...this.results,
      summary: this.generateSummary(),
      budget: this.budget,
      compliance: this.checkBudgetCompliance()
    };

    // Log to console
    console.group('🎯 Performance Test Report');
    console.log('Summary:', report.summary);
    console.log('Budget Compliance:', report.compliance);
    console.log('Recommendations:', report.recommendations);
    console.groupEnd();

    // Send to analytics or monitoring service
    this.sendReport(report);

    return report;
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    const total = this.results.tests.length;
    const passed = this.results.tests.filter(t => t.passed).length;
    const failed = total - passed;

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      score: this.calculateOverallScore()
    };
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore() {
    const vitalScores = Object.values(this.results.scores);
    if (vitalScores.length === 0) return 0;

    const goodCount = vitalScores.filter(v => v.score === 'good').length;
    return (goodCount / vitalScores.length) * 100;
  }

  /**
   * Check budget compliance
   */
  checkBudgetCompliance() {
    if (!this.budget) return null;

    const deviceType = this.detectDeviceType();
    const budgetConfig = this.budget.budgets[deviceType];
    
    if (!budgetConfig) return null;

    const compliance = {
      device: deviceType,
      metrics: {},
      resources: {},
      overall: true
    };

    // Check metric compliance
    Object.entries(budgetConfig.metrics).forEach(([metric, threshold]) => {
      const actual = this.results.scores[metric.toLowerCase()]?.value || 0;
      const compliant = actual <= threshold;
      
      compliance.metrics[metric] = {
        threshold,
        actual,
        compliant,
        percentage: (actual / threshold) * 100
      };
      
      if (!compliant) compliance.overall = false;
    });

    return compliance;
  }

  /**
   * Detect device type for budget checking
   */
  detectDeviceType() {
    if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
    return 'desktop';
  }

  /**
   * Send report to monitoring service
   */
  sendReport(report) {
    // Example: Send to analytics or monitoring endpoint
    if (navigator.sendBeacon && this.budget?.monitoring?.enabled) {
      const data = JSON.stringify({
        type: 'performance-report',
        data: report,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });

      navigator.sendBeacon('/api/performance', data);
    }
  }

  /**
   * Export report data
   */
  exportReport(format = 'json') {
    const report = this.generateReport();
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'csv':
        return this.convertToCSV(report);
      default:
        return report;
    }
  }

  /**
   * Convert report to CSV format
   */
  convertToCSV(report) {
    const headers = ['Type', 'Name', 'Value', 'Passed', 'Timestamp'];
    const rows = [headers.join(',')];

    report.tests.forEach(test => {
      const row = [
        test.type,
        test.data.name || test.data.element || 'N/A',
        test.data.value || test.data.duration || test.data.latency || 'N/A',
        test.passed,
        new Date().toISOString()
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }
}

// Initialize performance testing on page load
document.addEventListener('DOMContentLoaded', () => {
  window.performanceTestSuite = new PerformanceTestSuite();
});

// Export for manual testing
window.PerformanceTestSuite = PerformanceTestSuite;
