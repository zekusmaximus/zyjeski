#!/usr/bin/env node

/**
 * PERFORMANCE VALIDATION SCRIPT
 * Validates performance optimizations and generates reports
 * Usage: node validate-performance.js [options]
 */

const fs = require('fs');
const path = require('path');

class PerformanceValidator {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      outputFormat: options.format || 'json',
      threshold: options.threshold || 'mobile',
      ...options
    };

    this.results = {
      timestamp: new Date().toISOString(),
      summary: { passed: 0, failed: 0, warnings: 0 },
      tests: [],
      recommendations: [],
      budget: null
    };

    this.thresholds = {
      mobile: {
        css: 150,      // KB
        js: 500,       // KB
        images: 800,   // KB
        total: 1500,   // KB
        files: 50      // count
      },
      desktop: {
        css: 300,      // KB  
        js: 1200,      // KB
        images: 2000,  // KB
        total: 4000,   // KB
        files: 100     // count
      }
    };
  }

  /**
   * Run comprehensive performance validation
   */
  async validate() {
    console.log('🚀 Starting Performance Validation...\n');

    try {
      await this.loadPerformanceBudget();
      await this.validateCSS();
      await this.validateJavaScript();
      await this.validateImages();
      await this.validateHTML();
      await this.validateAssets();
      await this.validateAccessibility();
      await this.validateMobileOptimization();
      await this.validatePerformanceFeatures();
      
      this.generateSummary();
      this.generateRecommendations();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load performance budget from file
   */
  async loadPerformanceBudget() {
    const budgetPath = path.join(process.cwd(), 'performance-budget.json');
    
    if (fs.existsSync(budgetPath)) {
      try {
        const budgetContent = fs.readFileSync(budgetPath, 'utf8');
        this.results.budget = JSON.parse(budgetContent);
        this.log('✅ Performance budget loaded');
      } catch (error) {
        this.warn('⚠️  Failed to parse performance budget');
      }
    } else {
      this.warn('⚠️  Performance budget file not found');
    }
  }

  /**
   * Validate CSS performance
   */
  async validateCSS() {
    this.log('📄 Validating CSS...');
    
    const cssDir = path.join(process.cwd(), 'themes/AUTHOR/assets/css');
    const publicCssDir = path.join(process.cwd(), 'public/css');
    
    // Check source CSS
    if (fs.existsSync(cssDir)) {
      await this.analyzeCSSDirectory(cssDir, 'source');
    }
    
    // Check built CSS
    if (fs.existsSync(publicCssDir)) {
      await this.analyzeCSSDirectory(publicCssDir, 'built');
    }

    // Check for critical CSS
    const criticalCssPath = path.join(cssDir, 'critical.css');
    if (fs.existsSync(criticalCssPath)) {
      const criticalSize = this.getFileSize(criticalCssPath);
      this.addTest('critical-css-size', criticalSize < 15, {
        size: criticalSize,
        threshold: 15,
        message: 'Critical CSS should be under 15KB'
      });
    } else {
      this.addTest('critical-css-exists', false, {
        message: 'Critical CSS file not found'
      });
    }
  }

  /**
   * Analyze CSS directory
   */
  async analyzeCSSDirectory(dir, type) {
    const cssFiles = this.getFilesInDirectory(dir, '.css');
    const totalSize = cssFiles.reduce((sum, file) => sum + this.getFileSize(file), 0);
    const threshold = this.thresholds[this.options.threshold];
    
    this.addTest(`css-${type}-size`, totalSize <= threshold.css, {
      totalSize,
      threshold: threshold.css,
      fileCount: cssFiles.length,
      files: cssFiles.map(file => ({
        name: path.basename(file),
        size: this.getFileSize(file)
      }))
    });

    // Check for CSS optimization indicators
    cssFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for minification
      const isMinified = !content.includes('\n\n') && content.length > 1000;
      this.addTest(`css-minified-${path.basename(file)}`, isMinified, {
        file: path.basename(file),
        message: 'CSS should be minified in production'
      });

      // Check for unused CSS (basic check)
      const hasComments = content.includes('/*');
      if (hasComments && type === 'built') {
        this.warn(`CSS file ${path.basename(file)} contains comments in built version`);
      }
    });
  }

  /**
   * Validate JavaScript performance
   */
  async validateJavaScript() {
    this.log('📜 Validating JavaScript...');
    
    const jsDir = path.join(process.cwd(), 'themes/AUTHOR/assets/js');
    const publicJsDir = path.join(process.cwd(), 'public/js');
    
    // Check source JS
    if (fs.existsSync(jsDir)) {
      await this.analyzeJSDirectory(jsDir, 'source');
    }
    
    // Check built JS
    if (fs.existsSync(publicJsDir)) {
      await this.analyzeJSDirectory(publicJsDir, 'built');
    }

    // Check for performance-specific JS files
    const performanceFiles = [
      'lazy-loading.js',
      'performance-monitoring.js',
      'image-optimizer.js',
      'code-splitting.js'
    ];

    performanceFiles.forEach(fileName => {
      const filePath = path.join(jsDir, fileName);
      const exists = fs.existsSync(filePath);
      this.addTest(`performance-js-${fileName}`, exists, {
        file: fileName,
        message: `Performance optimization file should exist: ${fileName}`
      });
    });
  }

  /**
   * Analyze JavaScript directory
   */
  async analyzeJSDirectory(dir, type) {
    const jsFiles = this.getFilesInDirectory(dir, '.js');
    const totalSize = jsFiles.reduce((sum, file) => sum + this.getFileSize(file), 0);
    const threshold = this.thresholds[this.options.threshold];
    
    this.addTest(`js-${type}-size`, totalSize <= threshold.js, {
      totalSize,
      threshold: threshold.js,
      fileCount: jsFiles.length,
      files: jsFiles.map(file => ({
        name: path.basename(file),
        size: this.getFileSize(file)
      }))
    });

    // Check for JS optimization
    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for modern JS features
      const hasAsyncAwait = content.includes('async ') || content.includes('await ');
      const hasArrowFunctions = content.includes('=>');
      const hasModules = content.includes('export ') || content.includes('import ');
      
      this.addTest(`js-modern-${path.basename(file)}`, hasAsyncAwait || hasArrowFunctions, {
        file: path.basename(file),
        hasAsyncAwait,
        hasArrowFunctions,
        hasModules,
        message: 'JavaScript should use modern syntax for better performance'
      });

      // Check for performance anti-patterns
      const hasDocumentWrite = content.includes('document.write');
      const hasSyncXHR = content.includes('XMLHttpRequest') && content.includes('false');
      
      this.addTest(`js-no-antipatterns-${path.basename(file)}`, !hasDocumentWrite && !hasSyncXHR, {
        file: path.basename(file),
        hasDocumentWrite,
        hasSyncXHR,
        message: 'JavaScript should not use performance anti-patterns'
      });
    });
  }

  /**
   * Validate images
   */
  async validateImages() {
    this.log('🖼️  Validating Images...');
    
    const imageDirs = [
      path.join(process.cwd(), 'static/images'),
      path.join(process.cwd(), 'themes/AUTHOR/static/images'),
      path.join(process.cwd(), 'public/images')
    ];

    let totalImageSize = 0;
    let imageCount = 0;
    let largeImages = [];
    let unoptimizedImages = [];

    imageDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const images = this.getFilesInDirectory(dir, ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);
        
        images.forEach(imagePath => {
          const size = this.getFileSize(imagePath);
          const fileName = path.basename(imagePath);
          
          totalImageSize += size;
          imageCount++;
          
          // Check for large images
          if (size > 500) { // 500KB
            largeImages.push({ name: fileName, size });
          }
          
          // Check for unoptimized formats
          const ext = path.extname(imagePath).toLowerCase();
          if (['.bmp', '.tiff'].includes(ext)) {
            unoptimizedImages.push({ name: fileName, format: ext });
          }
        });
      }
    });

    const threshold = this.thresholds[this.options.threshold];
    
    this.addTest('image-total-size', totalImageSize <= threshold.images, {
      totalSize: totalImageSize,
      threshold: threshold.images,
      imageCount,
      largeImages: largeImages.slice(0, 5), // Top 5 largest
      unoptimizedImages
    });

    // Check for WebP support
    const hasWebP = imageDirs.some(dir => {
      if (!fs.existsSync(dir)) return false;
      return this.getFilesInDirectory(dir, '.webp').length > 0;
    });
    
    this.addTest('webp-support', hasWebP, {
      message: 'WebP images should be available for better compression'
    });
  }

  /**
   * Validate HTML structure
   */
  async validateHTML() {
    this.log('📝 Validating HTML...');
    
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      this.warn('Public directory not found - run build first');
      return;
    }

    const htmlFiles = this.getFilesInDirectory(publicDir, '.html');
    
    htmlFiles.slice(0, 5).forEach(htmlFile => { // Check first 5 HTML files
      const content = fs.readFileSync(htmlFile, 'utf8');
      const fileName = path.basename(htmlFile);
      
      // Check for performance optimizations
      const hasViewportMeta = content.includes('name="viewport"');
      const hasPreconnect = content.includes('rel="preconnect"');
      const hasPreload = content.includes('rel="preload"');
      const hasCriticalCSS = content.includes('<style>') && content.includes('critical');
      const hasLazyLoading = content.includes('loading="lazy"');
      
      this.addTest(`html-perf-${fileName}`, hasViewportMeta && hasPreconnect, {
        file: fileName,
        hasViewportMeta,
        hasPreconnect,
        hasPreload,
        hasCriticalCSS,
        hasLazyLoading,
        message: 'HTML should include performance optimizations'
      });

      // Check for accessibility features
      const hasSkipLinks = content.includes('skip-link');
      const hasLandmarks = content.includes('role="main"') || content.includes('<main');
      const hasAltText = !content.includes('<img') || content.includes('alt=');
      
      this.addTest(`html-a11y-${fileName}`, hasSkipLinks && hasLandmarks, {
        file: fileName,
        hasSkipLinks,
        hasLandmarks,
        hasAltText,
        message: 'HTML should include accessibility features'
      });
    });
  }

  /**
   * Validate static assets
   */
  async validateAssets() {
    this.log('📦 Validating Assets...');
    
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) return;

    // Check for service worker
    const swPath = path.join(publicDir, 'sw.js');
    const hasServiceWorker = fs.existsSync(swPath);
    this.addTest('service-worker', hasServiceWorker, {
      message: 'Service worker should be present for offline functionality'
    });

    // Check for manifest
    const manifestPath = path.join(publicDir, 'manifest.json');
    const hasManifest = fs.existsSync(manifestPath);
    this.addTest('web-manifest', hasManifest, {
      message: 'Web manifest should be present for PWA functionality'
    });

    // Check total asset size
    const totalSize = this.getDirectorySize(publicDir);
    const threshold = this.thresholds[this.options.threshold];
    
    this.addTest('total-asset-size', totalSize <= threshold.total, {
      totalSize,
      threshold: threshold.total,
      message: 'Total asset size should be within budget'
    });
  }

  /**
   * Validate accessibility features
   */
  async validateAccessibility() {
    this.log('♿ Validating Accessibility...');
    
    const cssDir = path.join(process.cwd(), 'themes/AUTHOR/assets/css');
    
    // Check for accessibility CSS
    const a11yFiles = [
      path.join(cssDir, '_accessibility.css'),
      path.join(cssDir, 'accessibility.css')
    ];

    const hasA11yCSS = a11yFiles.some(file => fs.existsSync(file));
    this.addTest('accessibility-css', hasA11yCSS, {
      message: 'Accessibility CSS should be present'
    });

    if (hasA11yCSS) {
      const a11yFile = a11yFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(a11yFile, 'utf8');
      
      // Check for specific accessibility features
      const hasSkipLinks = content.includes('skip-link');
      const hasFocusStyles = content.includes(':focus');
      const hasHighContrast = content.includes('high-contrast');
      const hasReducedMotion = content.includes('prefers-reduced-motion');
      
      this.addTest('a11y-features', hasSkipLinks && hasFocusStyles, {
        hasSkipLinks,
        hasFocusStyles,
        hasHighContrast,
        hasReducedMotion,
        message: 'Accessibility features should be implemented'
      });
    }
  }

  /**
   * Validate mobile optimization
   */
  async validateMobileOptimization() {
    this.log('📱 Validating Mobile Optimization...');
    
    const cssDir = path.join(process.cwd(), 'themes/AUTHOR/assets/css');
    const jsDir = path.join(process.cwd(), 'themes/AUTHOR/assets/js');
    
    // Check for mobile-specific files
    const mobileFiles = [
      path.join(cssDir, 'main-mobile-optimized.css'),
      path.join(cssDir, '_mobile-reading.css'),
      path.join(jsDir, 'main-mobile-optimized.js'),
      path.join(jsDir, 'mobile-reading.js')
    ];

    const hasMobileFiles = mobileFiles.some(file => fs.existsSync(file));
    this.addTest('mobile-optimization', hasMobileFiles, {
      message: 'Mobile-specific optimization files should exist'
    });

    // Check for responsive design
    const mainCSSPath = path.join(cssDir, 'main.css');
    if (fs.existsSync(mainCSSPath)) {
      const content = fs.readFileSync(mainCSSPath, 'utf8');
      const hasMediaQueries = content.includes('@media');
      const hasFlexbox = content.includes('display: flex');
      const hasGrid = content.includes('display: grid');
      
      this.addTest('responsive-design', hasMediaQueries, {
        hasMediaQueries,
        hasFlexbox,
        hasGrid,
        message: 'CSS should include responsive design features'
      });
    }
  }

  /**
   * Validate performance features
   */
  async validatePerformanceFeatures() {
    this.log('⚡ Validating Performance Features...');
    
    const jsDir = path.join(process.cwd(), 'themes/AUTHOR/assets/js');
    
    // Check for performance JavaScript features
    const performanceFeatures = [
      { file: 'lazy-loading.js', feature: 'Lazy Loading' },
      { file: 'image-optimizer.js', feature: 'Image Optimization' },
      { file: 'code-splitting.js', feature: 'Code Splitting' },
      { file: 'performance-monitoring.js', feature: 'Performance Monitoring' }
    ];

    performanceFeatures.forEach(({ file, feature }) => {
      const filePath = path.join(jsDir, file);
      const exists = fs.existsSync(filePath);
      
      this.addTest(`perf-feature-${file}`, exists, {
        feature,
        file,
        message: `${feature} implementation should exist`
      });

      if (exists) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasIntersectionObserver = content.includes('IntersectionObserver');
        const hasPerformanceAPI = content.includes('performance.');
        const hasAsync = content.includes('async ') || content.includes('await ');
        
        this.addTest(`perf-feature-quality-${file}`, hasAsync, {
          file,
          hasIntersectionObserver,
          hasPerformanceAPI,
          hasAsync,
          message: `${feature} should use modern performance APIs`
        });
      }
    });
  }

  /**
   * Add test result
   */
  addTest(name, passed, data = {}) {
    this.results.tests.push({
      name,
      passed,
      data,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.results.summary.passed++;
      if (this.options.verbose) {
        this.log(`  ✅ ${name}`);
      }
    } else {
      this.results.summary.failed++;
      this.log(`  ❌ ${name}: ${data.message || 'Failed'}`);
    }
  }

  /**
   * Generate summary
   */
  generateSummary() {
    const { passed, failed } = this.results.summary;
    const total = passed + failed;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    this.results.summary.total = total;
    this.results.summary.passRate = passRate;
    
    console.log('\n📊 Validation Summary:');
    console.log(`  Total Tests: ${total}`);
    console.log(`  Passed: ${passed} ✅`);
    console.log(`  Failed: ${failed} ❌`);
    console.log(`  Pass Rate: ${passRate}%`);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const failedTests = this.results.tests.filter(test => !test.passed);
    
    failedTests.forEach(test => {
      let priority = 'medium';
      let recommendation = test.data.message || `Fix ${test.name}`;
      
      // Determine priority based on test type
      if (test.name.includes('critical') || test.name.includes('a11y') || test.name.includes('perf')) {
        priority = 'high';
      } else if (test.name.includes('size') || test.name.includes('mobile')) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
      
      this.results.recommendations.push({
        test: test.name,
        priority,
        recommendation,
        data: test.data
      });
    });
  }

  /**
   * Generate report
   */
  generateReport() {
    const report = {
      ...this.results,
      options: this.options,
      thresholds: this.thresholds[this.options.threshold]
    };

    if (this.options.outputFormat === 'json') {
      return JSON.stringify(report, null, 2);
    } else if (this.options.outputFormat === 'html') {
      return this.generateHTMLReport(report);
    } else {
      return this.generateTextReport(report);
    }
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(report) {
    const { summary, tests, recommendations } = report;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 2rem; }
        .summary { background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        .test { padding: 0.5rem; margin: 0.5rem 0; border-radius: 4px; }
        .passed { background: #d4edda; border-left: 4px solid #28a745; }
        .failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .recommendations { margin-top: 2rem; }
        .high { border-left-color: #dc3545; }
        .medium { border-left-color: #ffc107; }
        .low { border-left-color: #17a2b8; }
    </style>
</head>
<body>
    <h1>Performance Validation Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Pass Rate: ${summary.passRate}% (${summary.passed}/${summary.total})</p>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <h2>Test Results</h2>
    ${tests.map(test => `
        <div class="test ${test.passed ? 'passed' : 'failed'}">
            <strong>${test.name}</strong>: ${test.passed ? 'PASS' : 'FAIL'}
            ${test.data.message ? `<br><em>${test.data.message}</em>` : ''}
        </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        ${recommendations.map(rec => `
            <div class="test ${rec.priority}">
                <strong>${rec.test}</strong> (${rec.priority}): ${rec.recommendation}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  /**
   * Generate text report
   */
  generateTextReport(report) {
    const { summary, tests, recommendations } = report;
    
    let text = `Performance Validation Report\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Summary:\n`;
    text += `  Pass Rate: ${summary.passRate}% (${summary.passed}/${summary.total})\n`;
    text += `  Generated: ${report.timestamp}\n\n`;
    
    text += `Test Results:\n`;
    text += `${'-'.repeat(30)}\n`;
    tests.forEach(test => {
      const status = test.passed ? 'PASS' : 'FAIL';
      text += `${status}: ${test.name}\n`;
      if (!test.passed && test.data.message) {
        text += `  → ${test.data.message}\n`;
      }
    });
    
    if (recommendations.length > 0) {
      text += `\nRecommendations:\n`;
      text += `${'-'.repeat(30)}\n`;
      recommendations.forEach(rec => {
        text += `[${rec.priority.toUpperCase()}] ${rec.test}: ${rec.recommendation}\n`;
      });
    }
    
    return text;
  }

  /**
   * Utility functions
   */
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return Math.round(stats.size / 1024); // KB
    } catch {
      return 0;
    }
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          walkDir(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    };
    
    try {
      walkDir(dirPath);
      return Math.round(totalSize / 1024); // KB
    } catch {
      return 0;
    }
  }

  getFilesInDirectory(dir, extensions) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const walkDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          walkDir(itemPath);
        } else {
          const ext = path.extname(itemPath).toLowerCase();
          const exts = Array.isArray(extensions) ? extensions : [extensions];
          if (exts.includes(ext)) {
            files.push(itemPath);
          }
        }
      });
    };
    
    walkDir(dir);
    return files;
  }

  log(message) {
    console.log(message);
  }

  warn(message) {
    console.warn(message);
    this.results.summary.warnings++;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    format: args.includes('--html') ? 'html' : args.includes('--text') ? 'text' : 'json',
    threshold: args.includes('--desktop') ? 'desktop' : 'mobile'
  };

  const validator = new PerformanceValidator(options);
  
  validator.validate()
    .then(report => {
      if (options.format === 'json') {
        console.log('\n' + report);
      }
      
      // Save report to file
      const filename = `performance-report-${Date.now()}.${options.format}`;
      fs.writeFileSync(filename, report);
      console.log(`\n📄 Report saved to: ${filename}`);
      
      // Exit with appropriate code
      const passRate = validator.results.summary.passRate;
      process.exit(passRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceValidator;
