#!/bin/bash
# Build script for Hugo Author Website with critical CSS inlining
# Usage: ./build-optimized.sh

echo "🚀 Building Hugo Author Website with mobile optimizations..."

# Step 1: Build the Hugo site
echo "📦 Building Hugo site..."
hugo --minify --gc

# Step 2: Inline critical CSS
echo "⚡ Inlining critical CSS..."

# Read the critical CSS content
CRITICAL_CSS=$(cat themes/AUTHOR/assets/css/critical.css)

# Create a temporary file with the CSS inlined
TEMP_FILE=$(mktemp)

# Replace the critical CSS placeholder in the head partial
sed "s|<!-- Critical CSS - Load immediately for fastest rendering -->.*<!-- Production note:.*-->|<style id=\"critical-css\">\n${CRITICAL_CSS}\n</style>|g" \
    themes/AUTHOR/layouts/partials/head/mobile-optimized.html > "${TEMP_FILE}"

# Move the temporary file back
mv "${TEMP_FILE}" themes/AUTHOR/layouts/partials/head/mobile-optimized.html

# Step 3: Rebuild with inlined CSS
echo "🔨 Rebuilding with inlined critical CSS..."
hugo --minify --gc

# Step 4: Optimize images (if imagemin is available)
if command -v imagemin &> /dev/null; then
    echo "🖼️  Optimizing images..."
    imagemin static/images/* --out-dir=public/images/
fi

# Step 5: Generate PWA icons (if needed)
echo "📱 Checking PWA icons..."
if [ ! -f "static/images/icon-192.png" ]; then
    echo "⚠️  PWA icons not found. Please generate required icon sizes:"
    echo "   - icon-72.png, icon-96.png, icon-128.png, icon-144.png"
    echo "   - icon-152.png, icon-192.png, icon-384.png, icon-512.png"
fi

# Step 6: Validate performance
echo "📊 Performance validation..."
if command -v lighthouse &> /dev/null; then
    echo "🔍 Running Lighthouse audit (mobile)..."
    lighthouse http://localhost:1313 --preset=perf --form-factor=mobile --output=json --output-path=./lighthouse-mobile.json
    echo "🔍 Running Lighthouse audit (desktop)..."
    lighthouse http://localhost:1313 --preset=perf --form-factor=desktop --output=json --output-path=./lighthouse-desktop.json
else
    echo "💡 Install Lighthouse CLI for automated performance testing:"
    echo "   npm install -g lighthouse"
fi

echo "✅ Build complete! Site generated in ./public/"
echo "🎯 Performance targets:"
echo "   - Mobile LCP: < 2.5s"
echo "   - Mobile FID: < 100ms" 
echo "   - Mobile CLS: < 0.1"
echo "   - Bundle size: < 500KB"

# Step 7: Start development server (optional)
read -p "🌐 Start local server for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting Hugo server..."
    hugo server --bind 0.0.0.0 --port 1313
fi
