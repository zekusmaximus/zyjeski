# CSS Architecture Documentation

## Overview
The CSS has been refactored from a single large file into a modular, maintainable structure. This approach prevents redundancy, makes it easier to find and edit specific functionality, and reduces the chance of introducing errors.

## File Structure

```
assets/css/
├── main.css              # Main file that imports all modules
├── _variables.css        # CSS custom properties and color palette
├── _base.css            # Base styles, layout foundations, fonts
├── _typography.css      # All text styling, headings, links, etc.
├── _accessibility.css   # Screen readers, focus states, high contrast
├── _header.css          # Header, navigation, mobile menu
├── _mandala.css         # Mandala grid system and components
├── _animations.css      # All keyframe animations and effects
├── _books.css           # Book/protocol specific layouts
├── _social.css          # Social sharing components
├── _responsive.css      # Media queries and responsive design
└── main-old.css         # Backup of original monolithic file
```

## Module Responsibilities

### 1. `_variables.css`
- CSS custom properties (--variable-name)
- Color palette definitions
- Shared values used across modules

### 2. `_base.css`
- Font imports
- HTML/body base styles
- Container classes
- Footer and social links
- Background patterns and effects

### 3. `_typography.css`
- All heading styles (h1-h6)
- Paragraph and text formatting
- Link styles and hover effects
- Blockquotes and code blocks
- Table styling
- Tag styling
- Article layouts

### 4. `_accessibility.css`
- Screen reader only classes (.sr-only)
- Skip links for keyboard navigation
- Focus management and outlines
- High contrast mode styles
- Reduced motion preferences
- Enhanced focus mode
- Accessibility control buttons

### 5. `_header.css`
- Header layout and positioning
- Site title and branding
- Author name and glitch effects
- Navigation menu styles
- Mobile menu toggle
- Responsive header behavior

### 6. `_mandala.css`
- Mandala grid layout system
- Individual mandala item styling
- Photo item specific styles
- Center mandala component
- Overlay text styling
- Grid accessibility features
- External link indicators

### 7. `_animations.css`
- All @keyframes definitions
- Glitch effects (multiple variants)
- Content-type specific animations
- Progress stripe animations
- Hover and interaction effects

### 8. `_books.css`
- Book/protocol page layouts
- Cover image styling
- Meta information display
- AI dialogue formatting
- Purchase button styling
- Review section layouts

### 9. `_social.css`
- Social sharing components
- Share button effects
- Copy notifications
- Reading progress indicators
- Print media hiding
- Dark mode enhancements

### 10. `_responsive.css`
- All media query breakpoints
- Mobile-specific adjustments
- Tablet layout modifications
- Desktop enhancements
- Touch target optimizations

## Benefits of This Structure

### 1. **Maintainability**
- Easy to locate specific functionality
- Changes are isolated to relevant modules
- Reduced risk of unintended side effects

### 2. **Scalability**
- New features can be added as separate modules
- Existing modules can be extended independently
- Unused modules can be easily removed

### 3. **Debugging**
- Faster identification of problematic code
- Smaller files are easier to review
- Clear separation of concerns

### 4. **Collaboration**
- Multiple developers can work on different modules
- Merge conflicts are less likely
- Code review is more focused

### 5. **Performance**
- Unused modules can be excluded from builds
- Better caching strategies possible
- Easier to identify optimization opportunities

## Usage Guidelines

### Making Changes
1. **Always edit the modular files**, never the main.css directly
2. **Keep changes within the appropriate module**
3. **Update this documentation** if you add new modules

### Adding New Features
1. Determine which existing module the feature belongs to
2. If it doesn't fit any existing module, create a new one
3. Add the new module import to main.css
4. Update this documentation

### Testing Changes
1. Test the functionality in the appropriate context
2. Check responsive behavior across breakpoints
3. Verify accessibility features still work
4. Test in multiple browsers

## Import Order
The import order in main.css is intentional:
1. **Variables** - Must be first for other modules to use
2. **Base** - Foundation styles and resets
3. **Typography** - Text and content styling
4. **Accessibility** - Overlay accessibility enhancements
5. **Header** - Site navigation and branding
6. **Mandala** - Core layout system
7. **Animations** - Visual effects and interactions
8. **Books** - Content-specific layouts
9. **Social** - Interactive components
10. **Responsive** - Media queries override previous styles

## Migration Notes
- The original main.css has been backed up as main-old.css
- All functionality should be preserved in the modular structure
- Debug borders are temporarily active for testing
- Remove debug styles from main.css once testing is complete

## Future Improvements
- Consider adding a build process to combine modules
- Add CSS minification for production
- Implement CSS custom property fallbacks for older browsers
- Consider using CSS modules or similar scoping strategies
