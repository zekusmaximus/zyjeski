/**
 * READER JOURNEY OPTIMIZATION SYSTEM
 * Comprehensive reader experience management for Neuro-Digital Enlightenment content
 */

class ReaderJourneyOptimizer {
  constructor() {
    this.storageKeys = {
      readingHistory: 'zyj_reading_history',
      preferences: 'zyj_reader_preferences',
      achievements: 'zyj_achievements',
      sessionData: 'zyj_session_data',
      mandalaInteractions: 'zyj_mandala_interactions'
    };
    
    this.contentTypes = {
      story: { weight: 1, category: 'narrative' },
      book: { weight: 2, category: 'literature' },
      audio: { weight: 1.5, category: 'listening' },
      post: { weight: 1, category: 'thoughts' },
      inquiry: { weight: 1.5, category: 'exploration' }
    };
    
    this.achievements = {
      firstVisit: { id: 'first_visit', name: 'Digital Wanderer', description: 'Began the journey' },
      storyExplorer: { id: 'story_explorer', name: 'Story Explorer', description: 'Read your first story' },
      deepListener: { id: 'deep_listener', name: 'Deep Listener', description: 'Experienced audio content' },
      bookworm: { id: 'bookworm', name: 'Digital Bookworm', description: 'Explored a book' },
      mandalaInteractor: { id: 'mandala_interactor', name: 'Mandala Navigator', description: 'Interacted with the homepage mandala' },
      serialReader: { id: 'serial_reader', name: 'Serial Reader', description: 'Read 5 pieces of content' },
      enlightenmentSeeker: { id: 'enlightenment_seeker', name: 'Enlightenment Seeker', description: 'Explored all content types' },
      returnVisitor: { id: 'return_visitor', name: 'Return Visitor', description: 'Came back for more' }
    };
    
    this.readingHistory = this.loadReadingHistory();
    this.preferences = this.loadPreferences();
    this.currentSession = this.initializeSession();
    
    this.init();
  }

  init() {
    this.trackPageView();
    this.setupScrollTracking();
    this.setupTimeTracking();
    this.setupMandalaTracking();
    this.initializeRecommendations();
    this.checkForNewReader();
    this.updateAchievements();
    this.bindEvents();
    
    console.log('Reader Journey Optimizer initialized');
  }

  // READING HISTORY MANAGEMENT
  loadReadingHistory() {
    const stored = localStorage.getItem(this.storageKeys.readingHistory);
    return stored ? JSON.parse(stored) : {
      pages: {},
      contentTypes: {},
      totalTime: 0,
      visitCount: 0,
      lastVisit: null,
      firstVisit: null
    };
  }

  saveReadingHistory() {
    localStorage.setItem(this.storageKeys.readingHistory, JSON.stringify(this.readingHistory));
  }

  loadPreferences() {
    const stored = localStorage.getItem(this.storageKeys.preferences);
    return stored ? JSON.parse(stored) : {
      favoriteContentTypes: [],
      readingSpeed: 'medium',
      preferredTime: 'any',
      interests: [],
      tourCompleted: false
    };
  }

  savePreferences() {
    localStorage.setItem(this.storageKeys.preferences, JSON.stringify(this.preferences));
  }

  initializeSession() {
    return {
      startTime: Date.now(),
      currentPage: window.location.pathname,
      scrollDepth: 0,
      timeOnPage: 0,
      interactions: [],
      referrer: document.referrer
    };
  }

  // PAGE TRACKING
  trackPageView() {
    const path = window.location.pathname;
    const contentType = this.detectContentType(path);
    
    // Update reading history
    if (!this.readingHistory.pages[path]) {
      this.readingHistory.pages[path] = {
        visits: 0,
        totalTime: 0,
        contentType: contentType,
        firstVisit: Date.now(),
        completed: false
      };
    }
    
    this.readingHistory.pages[path].visits++;
    this.readingHistory.pages[path].lastVisit = Date.now();
    
    // Update content type tracking
    if (!this.readingHistory.contentTypes[contentType]) {
      this.readingHistory.contentTypes[contentType] = {
        count: 0,
        totalTime: 0,
        preference: 0
      };
    }
    this.readingHistory.contentTypes[contentType].count++;
    
    // Update visit tracking
    this.readingHistory.visitCount++;
    if (!this.readingHistory.firstVisit) {
      this.readingHistory.firstVisit = Date.now();
    }
    this.readingHistory.lastVisit = Date.now();
    
    this.saveReadingHistory();
  }

  detectContentType(path) {
    if (path.includes('/stories/')) return 'story';
    if (path.includes('/books/')) return 'book';
    if (path.includes('/audio/')) return 'audio';
    if (path.includes('/posts/')) return 'post';
    if (path.includes('/inquiries/')) return 'inquiry';
    if (path === '/' || path === '') return 'homepage';
    return 'other';
  }

  // SCROLL TRACKING
  setupScrollTracking() {
    let maxScroll = 0;
    let lastScrollTime = Date.now();
    
    const throttledScrollTracker = this.throttle(() => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = total > 0 ? (scrolled / total) * 100 : 0;
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.currentSession.scrollDepth = Math.round(scrollPercent);
      }
      
      lastScrollTime = Date.now();
      
      // Track reading completion
      if (scrollPercent > 80) {
        this.markPageAsCompleted(window.location.pathname);
      }
    }, 250);
    
    window.addEventListener('scroll', throttledScrollTracker);
  }

  markPageAsCompleted(path) {
    if (this.readingHistory.pages[path] && !this.readingHistory.pages[path].completed) {
      this.readingHistory.pages[path].completed = true;
      this.saveReadingHistory();
      this.checkAchievement('completion');
    }
  }

  // TIME TRACKING
  setupTimeTracking() {
    setInterval(() => {
      const timeOnPage = Date.now() - this.currentSession.startTime;
      this.currentSession.timeOnPage = timeOnPage;
      
      const path = window.location.pathname;
      if (this.readingHistory.pages[path]) {
        this.readingHistory.pages[path].totalTime += 1000; // Add 1 second
      }
      
      const contentType = this.detectContentType(path);
      if (this.readingHistory.contentTypes[contentType]) {
        this.readingHistory.contentTypes[contentType].totalTime += 1000;
      }
      
      this.readingHistory.totalTime += 1000;
      
      // Save every 10 seconds
      if (timeOnPage % 10000 === 0) {
        this.saveReadingHistory();
      }
    }, 1000);
  }

  // MANDALA INTERACTION TRACKING
  setupMandalaTracking() {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      this.trackMandalaInteractions();
    }
  }

  trackMandalaInteractions() {
    const mandalaElements = document.querySelectorAll('.mandala-section, .content-grid-item, .mandala-nav');
    
    mandalaElements.forEach((element, index) => {
      element.addEventListener('click', (e) => {
        this.recordMandalaInteraction(element, index);
      });
      
      element.addEventListener('mouseenter', (e) => {
        this.recordMandalaHover(element, index);
      });
    });
  }

  recordMandalaInteraction(element, index) {
    const interaction = {
      type: 'click',
      element: element.className,
      index: index,
      timestamp: Date.now(),
      target: element.href || element.dataset.target
    };
    
    let mandalaHistory = JSON.parse(localStorage.getItem(this.storageKeys.mandalaInteractions) || '[]');
    mandalaHistory.push(interaction);
    
    // Keep only last 100 interactions
    if (mandalaHistory.length > 100) {
      mandalaHistory = mandalaHistory.slice(-100);
    }
    
    localStorage.setItem(this.storageKeys.mandalaInteractions, JSON.stringify(mandalaHistory));
    this.checkAchievement('mandala_interactor');
  }

  recordMandalaHover(element, index) {
    // Track hover patterns for heat mapping
    const hover = {
      type: 'hover',
      element: element.className,
      index: index,
      timestamp: Date.now()
    };
    
    this.currentSession.interactions.push(hover);
  }

  // RECOMMENDATION SYSTEM
  initializeRecommendations() {
    if (this.shouldShowRecommendations()) {
      this.generateRecommendations();
    }
  }

  shouldShowRecommendations() {
    return this.readingHistory.visitCount > 1 || 
           Object.keys(this.readingHistory.pages).length > 2;
  }

  generateRecommendations() {
    const recommendations = this.calculateRecommendations();
    this.displayRecommendations(recommendations);
  }

  calculateRecommendations() {
    const preferences = this.analyzeReadingPreferences();
    const unreadContent = this.getUnreadContent();
    const recommendations = [];
    
    // Score content based on preferences
    unreadContent.forEach(content => {
      let score = 0;
      
      // Content type preference
      const typePreference = preferences.contentTypes[content.type] || 0;
      score += typePreference * 10;
      
      // Similar content bonus
      const similarContent = this.findSimilarContent(content);
      score += similarContent.length * 2;
      
      // Recency bonus (newer content gets slight boost)
      const ageInDays = (Date.now() - content.publishDate) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 30 - ageInDays) * 0.1;
      
      recommendations.push({
        ...content,
        score: score,
        reason: this.generateRecommendationReason(content, preferences)
      });
    });
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  analyzeReadingPreferences() {
    const contentTypes = {};
    const totalReads = Object.keys(this.readingHistory.pages).length;
    
    Object.entries(this.readingHistory.contentTypes).forEach(([type, data]) => {
      const preference = (data.count / totalReads) * (data.totalTime / 60000); // Time in minutes
      contentTypes[type] = preference;
    });
    
    return { contentTypes };
  }

  getUnreadContent() {
    // This would be populated from Hugo's content data
    // For now, return mock data structure
    return [
      {
        title: "The Recursive Mirror",
        url: "/stories/recursive-mirror/",
        type: "story",
        publishDate: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        description: "A tale of digital consciousness"
      },
      {
        title: "Audio Meditation Series",
        url: "/audio/meditation-series/",
        type: "audio",
        publishDate: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        description: "Guided journey through digital mindfulness"
      }
    ];
  }

  generateRecommendationReason(content, preferences) {
    const topType = Object.keys(preferences.contentTypes)
      .sort((a, b) => preferences.contentTypes[b] - preferences.contentTypes[a])[0];
    
    if (content.type === topType) {
      return `Based on your interest in ${topType} content`;
    }
    
    return "Recommended for exploration";
  }

  // ACHIEVEMENT SYSTEM
  checkAchievement(trigger) {
    const earned = JSON.parse(localStorage.getItem(this.storageKeys.achievements) || '[]');
    
    Object.values(this.achievements).forEach(achievement => {
      if (earned.includes(achievement.id)) return;
      
      if (this.hasEarnedAchievement(achievement, trigger)) {
        this.awardAchievement(achievement);
      }
    });
  }

  hasEarnedAchievement(achievement, trigger) {
    switch (achievement.id) {
      case 'first_visit':
        return this.readingHistory.visitCount === 1;
      case 'story_explorer':
        return this.readingHistory.contentTypes.story?.count > 0;
      case 'deep_listener':
        return this.readingHistory.contentTypes.audio?.count > 0;
      case 'bookworm':
        return this.readingHistory.contentTypes.book?.count > 0;
      case 'mandala_interactor':
        const mandalaInteractions = JSON.parse(localStorage.getItem(this.storageKeys.mandalaInteractions) || '[]');
        return mandalaInteractions.length > 0;
      case 'serial_reader':
        return Object.keys(this.readingHistory.pages).length >= 5;
      case 'enlightenment_seeker':
        const typesExplored = Object.keys(this.readingHistory.contentTypes).length;
        return typesExplored >= 3;
      case 'return_visitor':
        return this.readingHistory.visitCount > 1;
      default:
        return false;
    }
  }

  awardAchievement(achievement) {
    const earned = JSON.parse(localStorage.getItem(this.storageKeys.achievements) || '[]');
    earned.push(achievement.id);
    localStorage.setItem(this.storageKeys.achievements, JSON.stringify(earned));
    
    this.showAchievementNotification(achievement);
  }

  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  updateAchievements() {
    this.checkAchievement('page_load');
  }

  // NEW READER ONBOARDING
  checkForNewReader() {
    if (this.readingHistory.visitCount === 1 && !this.preferences.tourCompleted) {
      setTimeout(() => this.startOnboardingTour(), 2000);
    }
  }

  startOnboardingTour() {
    if (document.querySelector('.onboarding-overlay')) return; // Already showing
    
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = this.getOnboardingHTML();
    
    document.body.appendChild(overlay);
    
    this.currentTourStep = 0;
    this.setupTourNavigation();
    
    setTimeout(() => overlay.classList.add('show'), 100);
  }

  getOnboardingHTML() {
    return `
      <div class="onboarding-modal">
        <div class="onboarding-header">
          <h2>Welcome to the Neuro-Digital Enlightenment</h2>
          <button class="onboarding-close">&times;</button>
        </div>
        <div class="onboarding-content">
          <div class="onboarding-step active" data-step="0">
            <div class="step-icon">🌟</div>
            <h3>Begin Your Journey</h3>
            <p>Welcome to a space where technology meets consciousness. This is your gateway to stories, audio experiences, and digital explorations.</p>
          </div>
          <div class="onboarding-step" data-step="1">
            <div class="step-icon">📚</div>
            <h3>Explore Content Types</h3>
            <p>Discover <strong>Stories</strong> (narrative fiction), <strong>Books</strong> (longer works), <strong>Audio</strong> (spoken experiences), and <strong>Posts</strong> (reflections).</p>
          </div>
          <div class="onboarding-step" data-step="2">
            <div class="step-icon">🎯</div>
            <h3>Personalized Experience</h3>
            <p>As you read and explore, we'll learn your preferences and suggest content that matches your interests - all stored privately on your device.</p>
          </div>
          <div class="onboarding-step" data-step="3">
            <div class="step-icon">🏆</div>
            <h3>Achievement System</h3>
            <p>Unlock achievements as you explore different content types and engage with the digital mandala of stories and ideas.</p>
          </div>
        </div>
        <div class="onboarding-navigation">
          <button class="onboarding-prev" disabled>Previous</button>
          <div class="onboarding-dots">
            <span class="dot active" data-step="0"></span>
            <span class="dot" data-step="1"></span>
            <span class="dot" data-step="2"></span>
            <span class="dot" data-step="3"></span>
          </div>
          <button class="onboarding-next">Next</button>
        </div>
      </div>
    `;
  }

  setupTourNavigation() {
    const overlay = document.querySelector('.onboarding-overlay');
    const prevBtn = overlay.querySelector('.onboarding-prev');
    const nextBtn = overlay.querySelector('.onboarding-next');
    const closeBtn = overlay.querySelector('.onboarding-close');
    const dots = overlay.querySelectorAll('.dot');
    
    let currentStep = 0;
    const totalSteps = 4;
    
    const updateStep = (step) => {
      // Update steps
      overlay.querySelectorAll('.onboarding-step').forEach((el, i) => {
        el.classList.toggle('active', i === step);
      });
      
      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === step);
      });
      
      // Update buttons
      prevBtn.disabled = step === 0;
      nextBtn.textContent = step === totalSteps - 1 ? 'Start Exploring' : 'Next';
      
      currentStep = step;
    };
    
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) updateStep(currentStep - 1);
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps - 1) {
        updateStep(currentStep + 1);
      } else {
        this.completeTour();
      }
    });
    
    closeBtn.addEventListener('click', () => this.completeTour());
    
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => updateStep(i));
    });
  }

  completeTour() {
    this.preferences.tourCompleted = true;
    this.savePreferences();
    
    const overlay = document.querySelector('.onboarding-overlay');
    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    }
    
    this.checkAchievement('tour_completed');
  }

  // UTILITY FUNCTIONS
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  bindEvents() {
    // Listen for page navigation
    window.addEventListener('beforeunload', () => {
      this.saveReadingHistory();
    });
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveReadingHistory();
      }
    });
  }

  /**
   * Finds similar content based on overlapping tags.
   * @param {Object} content - The content object to find similarities for.
   * @returns {Array} - An array of similar content objects.
   */
  findSimilarContent(content) {
    const allContent = this.getAllContent(); // Assume this method retrieves all content items.
    const similarContent = allContent.filter(item => {
      if (item.id === content.id) return false; // Exclude the same content.
      const sharedTags = item.tags.filter(tag => content.tags.includes(tag));
      return sharedTags.length > 0; // Include items with overlapping tags.
    });
    return similarContent;
  }

  // PUBLIC API
  getReadingStats() {
    return {
      totalTime: this.readingHistory.totalTime,
      pagesRead: Object.keys(this.readingHistory.pages).length,
      favoriteType: this.getFavoriteContentType(),
      achievements: JSON.parse(localStorage.getItem(this.storageKeys.achievements) || '[]').length
    };
  }

  getFavoriteContentType() {
    const types = this.readingHistory.contentTypes;
    return Object.keys(types).reduce((a, b) => types[a]?.count > types[b]?.count ? a : b, 'story');
  }

  getRecommendations() {
    return this.calculateRecommendations();
  }

  // Export data for privacy/transparency
  exportData() {
    return {
      readingHistory: this.readingHistory,
      preferences: this.preferences,
      achievements: JSON.parse(localStorage.getItem(this.storageKeys.achievements) || '[]'),
      mandalaInteractions: JSON.parse(localStorage.getItem(this.storageKeys.mandalaInteractions) || '[]')
    };
  }

  // Clear all data
  clearData() {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    location.reload();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.readerJourney = new ReaderJourneyOptimizer();
  });
} else {
  window.readerJourney = new ReaderJourneyOptimizer();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReaderJourneyOptimizer;
}
