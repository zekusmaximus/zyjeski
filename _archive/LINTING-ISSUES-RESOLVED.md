# Resolving CSS Linting Issues in Hugo Templates

## Problem
VS Code's CSS linter is interpreting Hugo template files (`.html` files containing `{{ }}` syntax) as CSS files, causing "at-rule or selector expected" errors when Hugo template syntax appears within `<style>` blocks.

## Root Cause
The issue occurs when:
1. Hugo template syntax (`{{- ... -}}`) is used inside `<style>` tags
2. VS Code doesn't properly recognize the file as a Hugo template
3. The CSS linter tries to parse Hugo template syntax as CSS

## Solutions Implemented

### 1. File Type Association Fix
Updated `.vscode/settings.json` to properly identify Hugo template files:

```json
{
  "files.associations": {
    "themes/**/*.html": "hugo",
    "layouts/**/*.html": "hugo", 
    "partials/**/*.html": "hugo"
  }
}
```

### 2. Removed Template Syntax from Style Blocks
Instead of using Hugo template syntax inside `<style>` tags:
```html
<!-- PROBLEMATIC - Causes linting errors -->
<style>
{{- $critical := resources.Get "css/critical.css" -}}
{{- $critical.Content | safeCSS -}}
</style>
```

We use external CSS files:
```html
<!-- SOLUTION - No linting errors -->
<link rel="stylesheet" href="/css/critical.css" media="all">
```

### 3. Build-Time CSS Inlining
For production optimization, use the build scripts to inline CSS:

**PowerShell (Windows):**
```powershell
.\build-optimized.ps1
```

**Bash (Unix/Linux/Mac):**
```bash
./build-optimized.sh
```

These scripts automatically:
- Read critical CSS content
- Replace external links with inlined CSS
- Rebuild the site with optimizations

## File Structure Solutions

### Development Approach (No Linting Issues)
```
themes/AUTHOR/layouts/partials/head/
├── critical-simple.html          # Simple external CSS approach
└── mobile-optimized.html         # Main head partial
```

**Usage in templates:**
```html
{{ partial "head/critical-simple.html" . }}
```

### Production Approach (Optimal Performance)
```
themes/AUTHOR/layouts/partials/head/
├── critical-inlined.html         # CSS inlined by build script
└── mobile-optimized.html         # Main head partial
```

## VS Code Configuration

### Required Extensions
1. **Hugo Language Support**: `budparr.language-hugo-vscode`
2. **CSS Peek**: `ms-vscode.vscode-css-peek`

### Settings Applied
```json
{
  "css.validate": true,
  "html.validate.styles": false,
  "css.lint.unknownAtRules": "ignore",
  "[hugo]": {
    "editor.quickSuggestions": {
      "other": true,
      "comments": false,
      "strings": true
    }
  }
}
```

## Implementation Options

### Option 1: Simple (No Build Process)
1. Use `critical-simple.html` partial
2. CSS loads as external file
3. Slightly slower but no complexity
4. No linting errors

### Option 2: Optimized (With Build Process)
1. Use build scripts for production
2. CSS gets inlined automatically
3. Optimal performance
4. No linting errors in development

## Testing the Fix

### 1. Check File Recognition
- Open any Hugo template file
- Look at bottom-right corner of VS Code
- Should show "Hugo" instead of "HTML"

### 2. Verify CSS Linting
- Open `main-mobile-optimized.css`
- Should not show any template-related errors
- Only actual CSS issues should be highlighted

### 3. Test Template Syntax
- Hugo template syntax should have proper highlighting
- Auto-completion should work for Hugo functions
- No CSS linting errors in template files

## Best Practices

### 1. Separate Concerns
- Keep CSS in `.css` files
- Keep Hugo templates in `.html` files
- Use build scripts for optimization

### 2. Development vs Production
- **Development**: External CSS for simplicity
- **Production**: Inlined CSS for performance

### 3. File Organization
```
assets/css/
├── critical.css              # Above-the-fold styles
├── main-mobile-optimized.css # Full stylesheet
└── components/               # Component-specific styles

layouts/partials/head/
├── critical-simple.html      # Development approach
├── critical-inlined.html     # Production approach  
└── mobile-optimized.html     # Main head partial
```

## Troubleshooting

### If Linting Errors Persist
1. Restart VS Code
2. Check file associations in settings
3. Install Hugo language extension
4. Verify no Hugo syntax in `<style>` blocks

### If Performance Issues
1. Use build scripts for production
2. Monitor Core Web Vitals
3. Test on real devices
4. Use Lighthouse audits

### If Build Scripts Fail
1. Check file paths in scripts
2. Ensure critical.css exists
3. Verify Hugo is installed
4. Check PowerShell execution policy (Windows)

## Conclusion

The linting issues are resolved by:
1. Proper file type associations
2. Avoiding Hugo template syntax in CSS contexts
3. Using build-time optimization for performance
4. Maintaining clean separation of concerns

This approach provides both development convenience and production performance without CSS linting conflicts.
