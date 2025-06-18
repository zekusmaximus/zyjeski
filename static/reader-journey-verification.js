/**
 * Reader Journey System Verification Script
 * Run in browser console to verify all features are working
 */

(function() {
    'use strict';
    
    console.log('🚀 Reader Journey System Verification Starting...\n');
    
    // Test 1: Check if ReaderJourneyOptimizer is available
    console.log('1. Testing ReaderJourneyOptimizer availability...');
    if (typeof ReaderJourneyOptimizer !== 'undefined') {
        console.log('✅ ReaderJourneyOptimizer class is available');
    } else {
        console.log('❌ ReaderJourneyOptimizer class not found');
        return;
    }
    
    // Test 2: Check if system is initialized
    console.log('\n2. Testing system initialization...');
    if (window.readerJourney && window.readerJourney instanceof ReaderJourneyOptimizer) {
        console.log('✅ Reader journey system is initialized');
    } else {
        console.log('❌ Reader journey system not initialized');
        return;
    }
    
    // Test 3: Check localStorage functionality
    console.log('\n3. Testing localStorage functionality...');
    try {
        const testData = { test: 'value', timestamp: Date.now() };
        localStorage.setItem('rj_test', JSON.stringify(testData));
        const retrieved = JSON.parse(localStorage.getItem('rj_test'));
        localStorage.removeItem('rj_test');
        
        if (retrieved && retrieved.test === 'value') {
            console.log('✅ localStorage is working correctly');
        } else {
            console.log('❌ localStorage test failed');
        }
    } catch (e) {
        console.log('❌ localStorage error:', e.message);
    }
    
    // Test 4: Check reader journey data structure
    console.log('\n4. Testing reader journey data structure...');
    const data = window.readerJourney.data;
    if (data && data.readingHistory && data.preferences && data.achievements) {
        console.log('✅ Data structure is valid');
        console.log('   - Reading history entries:', data.readingHistory.length);
        console.log('   - Achievements unlocked:', data.achievements.length);
        console.log('   - Preferences set:', Object.keys(data.preferences).length);
    } else {
        console.log('❌ Data structure is invalid');
    }
    
    // Test 5: Check UI elements
    console.log('\n5. Testing UI elements...');
    const uiElements = [
        { name: 'Onboarding System', selector: '#onboarding-system' },
        { name: 'Recommendations Widget', selector: '#recommendations-widget' },
        { name: 'Progress Tracker', selector: '#progress-tracker' },
        { name: 'Achievement System', selector: '#achievement-system' },
        { name: 'Contextual Navigation', selector: '#contextual-nav' }
    ];
    
    uiElements.forEach(element => {
        const el = document.querySelector(element.selector);
        if (el) {
            console.log(`✅ ${element.name} found`);
        } else {
            console.log(`❌ ${element.name} not found`);
        }
    });
    
    // Test 6: Check mandala grid integration
    console.log('\n6. Testing mandala grid integration...');
    const mandalaItems = document.querySelectorAll('.mandala-item');
    if (mandalaItems.length > 0) {
        console.log(`✅ Found ${mandalaItems.length} mandala items`);
        
        // Check if tracking is set up
        let hasEventListeners = false;
        mandalaItems.forEach(item => {
            // Check for data attributes that indicate tracking setup
            if (item.dataset.contentType || item.dataset.contentId) {
                hasEventListeners = true;
            }
        });
        
        if (hasEventListeners) {
            console.log('✅ Mandala items have tracking attributes');
        } else {
            console.log('⚠️  Mandala items may not have tracking setup');
        }
    } else {
        console.log('⚠️  No mandala items found (may not be on homepage)');
    }
    
    // Test 7: Check CSS integration
    console.log('\n7. Testing CSS integration...');
    const stylesheets = Array.from(document.styleSheets);
    let hasReaderJourneyCSS = false;
    
    for (let sheet of stylesheets) {
        try {
            if (sheet.href && sheet.href.includes('bundle.css')) {
                // Check if reader journey CSS variables are available
                const styles = getComputedStyle(document.documentElement);
                const readerPrimary = styles.getPropertyValue('--reader-primary');
                if (readerPrimary) {
                    hasReaderJourneyCSS = true;
                    break;
                }
            }
        } catch (e) {
            // CORS errors are expected for external stylesheets
        }
    }
    
    if (hasReaderJourneyCSS) {
        console.log('✅ Reader journey CSS is loaded');
    } else {
        console.log('❌ Reader journey CSS may not be loaded');
    }
    
    // Test 8: Test core functionality
    console.log('\n8. Testing core functionality...');
    try {
        // Test tracking
        window.readerJourney.trackInteraction('test-content', 'verification-test', {
            type: 'verification',
            timestamp: Date.now()
        });
        console.log('✅ Interaction tracking works');
        
        // Test recommendations
        const recommendations = window.readerJourney.getRecommendations();
        if (Array.isArray(recommendations)) {
            console.log(`✅ Recommendations working (${recommendations.length} items)`);
        } else {
            console.log('❌ Recommendations not working');
        }
        
        // Test achievements
        window.readerJourney.checkAchievements();
        console.log('✅ Achievement checking works');
        
    } catch (e) {
        console.log('❌ Core functionality error:', e.message);
    }
    
    // Test 9: Performance check
    console.log('\n9. Testing performance...');
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        const domReady = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
        
        console.log(`✅ Page load time: ${loadTime.toFixed(2)}ms`);
        console.log(`✅ DOM ready time: ${domReady.toFixed(2)}ms`);
        
        if (loadTime < 1000) {
            console.log('✅ Performance is good');
        } else {
            console.log('⚠️  Page load time could be improved');
        }
    }
    
    // Final summary
    console.log('\n🎉 Reader Journey System Verification Complete!');
    console.log('\nTo test specific features:');
    console.log('- window.readerJourney.showOnboarding() - Show onboarding');
    console.log('- window.readerJourney.clearData() - Clear all data');
    console.log('- window.readerJourney.exportData() - Export user data');
    console.log('- window.readerJourney.getRecommendations() - Get recommendations');
    console.log('- window.readerJourney.data - View current data');
    
    // Return the reader journey instance for further testing
    return window.readerJourney;
})();
