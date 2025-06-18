/**
 * Books Page Module
 * Handles books page specific functionality
 */
export class BooksPageModule {
  constructor() {
    this.init();
  }

  init() {
    if (!this.isCurrentPage()) return;
    
    this.setupBookInteractions();
    this.setupBookFilters();
    this.setupBookSearch();
  }

  isCurrentPage() {
    return window.location.pathname.includes('/books') || 
           document.body.classList.contains('page-books');
  }

  setupBookInteractions() {
    const bookItems = document.querySelectorAll('.book-item, .mandala-item[data-type="book"]');
    
    bookItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.handleBookHover(item, true);
      });

      item.addEventListener('mouseleave', () => {
        this.handleBookHover(item, false);
      });
    });
  }

  handleBookHover(item, isHovering) {
    const cover = item.querySelector('.book-cover, .mandala-item-image');
    if (!cover) return;

    if (isHovering) {
      cover.style.transform = 'scale(1.05) rotateY(5deg)';
      cover.style.transition = 'transform 0.3s ease';
      item.classList.add('book-hovered');
    } else {
      cover.style.transform = '';
      item.classList.remove('book-hovered');
    }
  }

  setupBookFilters() {
    const filters = document.querySelectorAll('.book-filter');
    const books = document.querySelectorAll('.book-item, .mandala-item[data-type="book"]');

    filters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        const filterType = filter.dataset.filter;
        
        // Update active filter
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        // Filter books
        this.filterBooks(books, filterType);
      });
    });
  }

  filterBooks(books, filterType) {
    books.forEach(book => {
      const bookType = book.dataset.bookType || 'all';
      const shouldShow = filterType === 'all' || bookType === filterType;
      
      if (shouldShow) {
        book.style.display = '';
        book.classList.remove('filtered-out');
        // Animate in
        setTimeout(() => {
          book.style.opacity = '1';
          book.style.transform = 'scale(1)';
        }, 50);
      } else {
        book.style.opacity = '0';
        book.style.transform = 'scale(0.8)';
        book.classList.add('filtered-out');
        // Hide after animation
        setTimeout(() => {
          book.style.display = 'none';
        }, 300);
      }
    });
  }

  setupBookSearch() {
    const searchInput = document.querySelector('.book-search');
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.toLowerCase().trim();
      
      searchTimeout = setTimeout(() => {
        this.searchBooks(query);
      }, 300);
    });
  }

  searchBooks(query) {
    const books = document.querySelectorAll('.book-item, .mandala-item[data-type="book"]');
    
    books.forEach(book => {
      const title = book.querySelector('.book-title, .mandala-item-title')?.textContent.toLowerCase();
      const description = book.querySelector('.book-description, .mandala-item-description')?.textContent.toLowerCase();
      const author = book.querySelector('.book-author')?.textContent.toLowerCase();
      
      const searchText = `${title || ''} ${description || ''} ${author || ''}`;
      const matches = !query || searchText.includes(query);
      
      if (matches) {
        book.style.display = '';
        book.classList.remove('search-hidden');
      } else {
        book.style.display = 'none';
        book.classList.add('search-hidden');
      }
    });
  }
}

// Export for module loading
export default BooksPageModule;
