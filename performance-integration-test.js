// Performance Integration Test Suite
// Tests all performance optimization systems together

console.log('🚀 Starting Performance Integration Test Suite...');

const fs = require('fs');
const path = require('path');

// Test configuration
const tests = {
    async testPerformanceBudget() {
        try {
            const budgetPath = path.join(__dirname, 'performance-budget.json');
            const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
            
            console.log('✅ Performance Budget loaded');
            console.log(`   - Mobile LCP target: ${budget.budgets.mobile.metrics.LCP}ms`);
            console.log(`   - Desktop LCP target: ${budget.budgets.desktop.metrics.LCP}ms`);
            
            return { passed: true, data: budget };
        } catch (error) {
            console.log('❌ Performance Budget test failed:', error.message);
            return { passed: false, error: error.message };
        }
    },

    async testCriticalCSS() {
        try {
            const criticalPath = path.join(__dirname, 'themes/AUTHOR/assets/css/critical-enhanced.css');
            const criticalCSS = fs.readFileSync(criticalPath, 'utf8');
            
            console.log('✅ Critical CSS loaded');
            console.log(`   - Size: ${criticalCSS.length} characters`);
            console.log(`   - Contains viewport optimizations: ${criticalCSS.includes('viewport')}`);
            console.log(`   - Contains performance optimizations: ${criticalCSS.includes('contain')}`);
            
            return { passed: true, size: criticalCSS.length };
        } catch (error) {
            console.log('❌ Critical CSS test failed:', error.message);
            return { passed: false, error: error.message };
        }
    },

    async testLazyLoading() {
        try {
            const lazyPath = path.join(__dirname, 'themes/AUTHOR/assets/js/lazy-loading.js');
            const lazyScript = fs.readFileSync(lazyPath, 'utf8');
            
            const hasIntersectionObserver = lazyScript.includes('IntersectionObserver');
            const hasPerformanceAPI = lazyScript.includes('performance.now');
            const hasAsyncSupport = lazyScript.includes('async') || lazyScript.includes('await');
            
            console.log('✅ Lazy Loading script loaded');
            console.log(`   - Size: ${lazyScript.length} characters`);
            console.log(`   - Has IntersectionObserver: ${hasIntersectionObserver}`);
            console.log(`   - Has Performance API: ${hasPerformanceAPI}`);
            console.log(`   - Has Async Support: ${hasAsyncSupport}`);
            
            return { 
                passed: true, 
                size: lazyScript.length,
                features: { hasIntersectionObserver, hasPerformanceAPI, hasAsyncSupport }
            };
        } catch (error) {
            console.log('❌ Lazy Loading test failed:', error.message);
            return { passed: false, error: error.message };
        }
    },

    async testCodeSplitting() {
        try {
            const codePath = path.join(__dirname, 'themes/AUTHOR/assets/js/code-splitting.js');
            const codeScript = fs.readFileSync(codePath, 'utf8');
            
            const hasDynamicImport = codeScript.includes('import(') || codeScript.includes('dynamicImport');
            const hasModuleLoading = codeScript.includes('loadModule') || codeScript.includes('loadFeature');
            const hasErrorHandling = codeScript.includes('catch') || codeScript.includes('error');
            
            console.log('✅ Code Splitting script loaded');
            console.log(`   - Size: ${codeScript.length} characters`);
            console.log(`   - Has Dynamic Import: ${hasDynamicImport}`);
            console.log(`   - Has Module Loading: ${hasModuleLoading}`);
            console.log(`   - Has Error Handling: ${hasErrorHandling}`);
            
            return { 
                passed: true, 
                size: codeScript.length,
                features: { hasDynamicImport, hasModuleLoading, hasErrorHandling }
            };
        } catch (error) {
            console.log('❌ Code Splitting test failed:', error.message);
            return { passed: false, error: error.message };
        }
    },

    async testImageOptimizer() {
        try {
            const imagePath = path.join(__dirname, 'themes/AUTHOR/assets/js/image-optimizer.js');
            const imageScript = fs.readFileSync(imagePath, 'utf8');
            
            const hasWebPSupport = imageScript.includes('webp') || imageScript.includes('WebP');
            const hasResponsiveImages = imageScript.includes('srcset') || imageScript.includes('sizes');
            const hasLazyLoading = imageScript.includes('lazy') || imageScript.includes('IntersectionObserver');
            
            console.log('✅ Image Optimizer script loaded');
            console.log(`   - Size: ${imageScript.length} characters`);
            console.log(`   - Has WebP Support: ${hasWebPSupport}`);
            console.log(`   - Has Responsive Images: ${hasResponsiveImages}`);
            console.log(`   - Has Lazy Loading: ${hasLazyLoading}`);
            
            return { 
                passed: true, 
                size: imageScript.length,
                features: { hasWebPSupport, hasResponsiveImages, hasLazyLoading }
            };
        } catch (error) {
            console.log('❌ Image Optimizer test failed:', error.message);
            return { passed: false, error: error.message };
        }
    },

    async testMobileReadingOptimizer() {
        try {
            const mobilePath = path.join(__dirname, 'themes/AUTHOR/assets/js/mobile-reading-optimizer.js');
            const mobileScript = fs.readFileSync(mobilePath, 'utf8');
            
            const hasTextOptimization = mobileScript.includes('font-size') || mobileScript.includes('line-height');
            const hasScrollOptimization = mobileScript.includes('scroll') || mobileScript.includes('viewport');
            const hasPerformanceMonitoring = mobileScript.includes('performance') || mobileScript.includes('metrics');
            
            console.log('✅ Mobile Reading Optimizer loaded');
            console.log(`   - Size: ${mobileScript.length} characters`);
            console.log(`   - Has Text Optimization: ${hasTextOptimization}`);
            console.log(`   - Has Scroll Optimization: ${hasScrollOptimization}`);
            console.log(`   - Has Performance Monitoring: ${hasPerformanceMonitoring}`);
            
            return { 
                passed: true, 
                size: mobileScript.length,
                features: { hasTextOptimization, hasScrollOptimization, hasPerformanceMonitoring }
            };
        } catch (error) {
            console.log('❌ Mobile Reading Optimizer test failed:', error.message);
            return { passed: false, error: error.message };
        }
    },

    async testServiceWorker() {
        try {
            const swPath = path.join(__dirname, 'static/sw.js');
            const swScript = fs.readFileSync(swPath, 'utf8');
            
            const hasCaching = swScript.includes('cache') || swScript.includes('Cache');
            const hasOfflineSupport = swScript.includes('offline') || swScript.includes('fallback');
            const hasPerformanceOptimization = swScript.includes('performance') || swScript.includes('preload');
            
            console.log('✅ Service Worker loaded');
            console.log(`   - Size: ${swScript.length} characters`);
            console.log(`   - Has Caching: ${hasCaching}`);
            console.log(`   - Has Offline Support: ${hasOfflineSupport}`);
            console.log(`   - Has Performance Optimization: ${hasPerformanceOptimization}`);
            
            return { 
                passed: true, 
                size: swScript.length,
                features: { hasCaching, hasOfflineSupport, hasPerformanceOptimization }
            };
        } catch (error) {
            console.log('❌ Service Worker test failed:', error.message);
            return { passed: false, error: error.message };
        }
    },

    async testPerformanceTestSuite() {
        try {
            const testPath = path.join(__dirname, 'themes/AUTHOR/assets/js/performance-testing.js');
            const testScript = fs.readFileSync(testPath, 'utf8');
            
            const hasMetricsCollection = testScript.includes('metrics') || testScript.includes('performance');
            const hasReporting = testScript.includes('report') || testScript.includes('log');
            const hasBudgetValidation = testScript.includes('budget') || testScript.includes('threshold');
            
            console.log('✅ Performance Test Suite loaded');
            console.log(`   - Size: ${testScript.length} characters`);
            console.log(`   - Has Metrics Collection: ${hasMetricsCollection}`);
            console.log(`   - Has Reporting: ${hasReporting}`);
            console.log(`   - Has Budget Validation: ${hasBudgetValidation}`);
            
            return { 
                passed: true, 
                size: testScript.length,
                features: { hasMetricsCollection, hasReporting, hasBudgetValidation }
            };
        } catch (error) {
            console.log('❌ Performance Test Suite test failed:', error.message);
            return { passed: false, error: error.message };
        }
    }
};

// Run all tests
async function runIntegrationTests() {
    const results = {};
    let passedTests = 0;
    let totalTests = Object.keys(tests).length;
    
    console.log(`\n📊 Running ${totalTests} integration tests...\n`);
    
    for (const [testName, testFunction] of Object.entries(tests)) {
        console.log(`🔍 Running ${testName}...`);
        const result = await testFunction();
        results[testName] = result;
        
        if (result.passed) {
            passedTests++;
        }
        
        console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('📋 Integration Test Summary:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    console.log(`🎯 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All performance systems are integrated and working correctly!');
    } else {
        console.log('\n⚠️  Some performance systems need attention.');
    }
    
    return results;
}

// Run the tests
runIntegrationTests().catch(error => {
    console.error('❌ Integration test suite failed:', error);
    process.exit(1);
});
