#!/bin/bash

# Progressive Enhancement Build & Test Script
# Run from project root directory

echo "🚀 Building Progressive Enhancement System..."

# Check if Hugo is available
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo not found. Please install Hugo first."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf public/

# Build the site
echo "🔨 Building Hugo site..."
hugo --minify --gc

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Hugo build successful!"
else
    echo "❌ Hugo build failed!"
    exit 1
fi

# Copy test page to public directory for easy testing
echo "📋 Copying test page..."
cp progressive-enhancement-test.html public/test.html

# Start Hugo server for testing
echo "🌐 Starting Hugo development server..."
echo "📱 Test URLs:"
echo "   - Main site: http://localhost:1313/"
echo "   - Test page: http://localhost:1313/test.html"
echo ""
echo "🔧 Test different device types:"
echo "   - Desktop: Full screen, mouse"
echo "   - Mobile: DevTools mobile emulation"
echo "   - Slow connection: DevTools network throttling"
echo "   - Low performance: DevTools CPU throttling"
echo ""
echo "♿ Accessibility testing:"
echo "   - Tab navigation only"
echo "   - Screen reader simulation"
echo "   - High contrast mode"
echo "   - Reduced motion preferences"
echo ""

# Start server
hugo server --bind=0.0.0.0 --baseURL=http://localhost:1313
