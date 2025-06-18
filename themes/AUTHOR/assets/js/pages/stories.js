/**
 * Stories Page Module
 * Handles stories page specific functionality
 */
export class StoriesPageModule {
  constructor() {
    this.init();
  }

  init() {
    if (!this.isCurrentPage()) return;
    
    this.setupStoryInteractions();
    this.setupStoryCategories();
    this.setupReadingProgress();
  }

  isCurrentPage() {
    return window.location.pathname.includes('/stories') || 
           document.body.classList.contains('page-stories');
  }

  setupStoryInteractions() {
    const storyItems = document.querySelectorAll('.story-item, .mandala-item[data-type="story"]');
    
    storyItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.handleStoryHover(item, true);
      });

      item.addEventListener('mouseleave', () => {
        this.handleStoryHover(item, false);
      });
    });
  }

  handleStoryHover(item, isHovering) {
    if (isHovering) {
      item.style.transform = 'translateY(-8px) rotateX(2deg)';
      item.style.boxShadow = '0 8px 32px rgba(110, 13, 208, 0.3)';
      item.style.transition = 'all 0.3s ease';
      item.classList.add('story-hovered');
    } else {
      item.style.transform = '';
      item.style.boxShadow = '';
      item.classList.remove('story-hovered');
    }
  }

  setupStoryCategories() {
    const categoryFilters = document.querySelectorAll('.story-category-filter');
    const stories = document.querySelectorAll('.story-item, .mandala-item[data-type="story"]');

    categoryFilters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        const category = filter.dataset.category;
        
        // Update active filter
        categoryFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        // Filter stories
        this.filterStoriesByCategory(stories, category);
      });
    });
  }

  filterStoriesByCategory(stories, category) {
    stories.forEach(story => {
      const storyCategory = story.dataset.category || 'all';
      const shouldShow = category === 'all' || storyCategory === category;
      
      if (shouldShow) {
        story.style.display = '';
        story.classList.remove('category-filtered');
        // Animate in
        setTimeout(() => {
          story.style.opacity = '1';
          story.style.transform = 'scale(1)';
        }, 50);
      } else {
        story.style.opacity = '0';
        story.style.transform = 'scale(0.9)';
        story.classList.add('category-filtered');
        // Hide after animation
        setTimeout(() => {
          story.style.display = 'none';
        }, 250);
      }
    });
  }

  setupReadingProgress() {
    // Track reading progress for long stories
    const storyContent = document.querySelector('.story-content');
    if (!storyContent) return;

    let progressBar = document.querySelector('.reading-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'reading-progress';
      progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
      document.body.appendChild(progressBar);
    }

    const progressFill = progressBar.querySelector('.reading-progress-fill');

    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      progressFill.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial update
  }
}

// Export for module loading
export default StoriesPageModule;
