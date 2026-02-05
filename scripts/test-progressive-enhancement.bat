@echo off
REM Progressive Enhancement Build & Test Script for Windows
REM Run from project root directory

echo 🚀 Building Progressive Enhancement System...

REM Check if Hugo is available
hugo version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Hugo not found. Please install Hugo first.
    exit /b 1
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist public rmdir /s /q public

REM Build the site
echo 🔨 Building Hugo site...
hugo --minify --gc

REM Check if build was successful
if %errorlevel% neq 0 (
    echo ❌ Hugo build failed!
    exit /b 1
)

echo ✅ Hugo build successful!

REM Copy test page to public directory for easy testing
echo 📋 Copying test page...
copy progressive-enhancement-test.html public\test.html >nul

REM Display test information
echo 🌐 Starting Hugo development server...
echo.
echo 📱 Test URLs:
echo    - Main site: http://localhost:1313/
echo    - Test page: http://localhost:1313/test.html
echo.
echo 🔧 Test different device types:
echo    - Desktop: Full screen, mouse
echo    - Mobile: DevTools mobile emulation
echo    - Slow connection: DevTools network throttling
echo    - Low performance: DevTools CPU throttling
echo.
echo ♿ Accessibility testing:
echo    - Tab navigation only
echo    - Screen reader simulation
echo    - High contrast mode
echo    - Reduced motion preferences
echo.

REM Start server
hugo server --bind=0.0.0.0 --baseURL=http://localhost:1313
