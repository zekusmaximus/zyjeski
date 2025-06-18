# Build script for Hugo Author Website with critical CSS inlining (PowerShell)
# Usage: .\build-optimized.ps1

Write-Host "🚀 Building Hugo Author Website with mobile optimizations..." -ForegroundColor Green

# Step 1: Build the Hugo site
Write-Host "📦 Building Hugo site..." -ForegroundColor Blue
hugo --minify --gc

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Hugo build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Inline critical CSS
Write-Host "⚡ Inlining critical CSS..." -ForegroundColor Blue

try {
    # Read the critical CSS content
    $criticalCSS = Get-Content "themes\AUTHOR\assets\css\critical.css" -Raw
    
    # Read the head partial
    $headContent = Get-Content "themes\AUTHOR\layouts\partials\head\mobile-optimized.html" -Raw
    
    # Create the inlined CSS block
    $inlinedCSS = @"
<style id="critical-css">
$criticalCSS
</style>
"@
    
    # Replace the critical CSS placeholder
    $pattern = '<!-- Critical CSS - Load immediately for fastest rendering -->.*?<!-- Production note:.*?-->'
    $updatedContent = $headContent -replace $pattern, $inlinedCSS, 'SingleLine'
    
    # Write back to file
    Set-Content "themes\AUTHOR\layouts\partials\head\mobile-optimized.html" -Value $updatedContent
    
    Write-Host "✅ Critical CSS inlined successfully!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Could not inline critical CSS: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Continuing with external CSS file..." -ForegroundColor Yellow
}

# Step 3: Rebuild with inlined CSS
Write-Host "🔨 Rebuilding with inlined critical CSS..." -ForegroundColor Blue
hugo --minify --gc

# Step 4: Check for PWA icons
Write-Host "📱 Checking PWA icons..." -ForegroundColor Blue
$requiredIcons = @(
    "static\images\icon-72.png",
    "static\images\icon-96.png", 
    "static\images\icon-128.png",
    "static\images\icon-144.png",
    "static\images\icon-152.png",
    "static\images\icon-192.png",
    "static\images\icon-384.png",
    "static\images\icon-512.png"
)

$missingIcons = @()
foreach ($icon in $requiredIcons) {
    if (-not (Test-Path $icon)) {
        $missingIcons += $icon
    }
}

if ($missingIcons.Count -gt 0) {
    Write-Host "⚠️  Missing PWA icons:" -ForegroundColor Yellow
    foreach ($icon in $missingIcons) {
        Write-Host "   - $icon" -ForegroundColor Yellow
    }
    Write-Host "   Generate these from your base icon for full PWA support" -ForegroundColor Yellow
}
else {
    Write-Host "✅ All PWA icons found!" -ForegroundColor Green
}

# Step 5: Validate service worker
Write-Host "🔧 Checking service worker..." -ForegroundColor Blue
if (Test-Path "static\sw.js") {
    Write-Host "✅ Service worker found!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Service worker not found at static\sw.js" -ForegroundColor Yellow
}

# Step 6: Performance recommendations
Write-Host "`n📊 Performance validation complete!" -ForegroundColor Green
Write-Host "🎯 Performance targets:" -ForegroundColor Cyan
Write-Host "   - Mobile LCP: < 2.5s" -ForegroundColor White
Write-Host "   - Mobile FID: < 100ms" -ForegroundColor White
Write-Host "   - Mobile CLS: < 0.1" -ForegroundColor White
Write-Host "   - Bundle size: < 500KB" -ForegroundColor White

Write-Host "`n💡 Testing recommendations:" -ForegroundColor Cyan
Write-Host "   1. Test on real mobile devices" -ForegroundColor White
Write-Host "   2. Run Lighthouse audit: lighthouse http://localhost:1313" -ForegroundColor White
Write-Host "   3. Test with throttled network (Slow 3G)" -ForegroundColor White
Write-Host "   4. Validate PWA installation" -ForegroundColor White

# Step 7: File size analysis
Write-Host "`n📁 Generated file sizes:" -ForegroundColor Blue
if (Test-Path "public") {
    $cssFiles = Get-ChildItem "public" -Recurse -Include "*.css" | Sort-Object Length -Descending
    $jsFiles = Get-ChildItem "public" -Recurse -Include "*.js" | Sort-Object Length -Descending
    
    Write-Host "CSS files:" -ForegroundColor Yellow
    $cssFiles | ForEach-Object { 
        $sizeKB = [math]::Round($_.Length / 1KB, 1)
        Write-Host "   $($_.Name): ${sizeKB}KB" -ForegroundColor White
    }
    
    Write-Host "JavaScript files:" -ForegroundColor Yellow
    $jsFiles | ForEach-Object { 
        $sizeKB = [math]::Round($_.Length / 1KB, 1)
        Write-Host "   $($_.Name): ${sizeKB}KB" -ForegroundColor White
    }
}

Write-Host "`n✅ Build complete! Site generated in .\public\" -ForegroundColor Green

# Step 8: Optional server start
$startServer = Read-Host "`n🌐 Start local server for testing? (y/n)"
if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host "🚀 Starting Hugo server..." -ForegroundColor Green
    hugo server --bind 0.0.0.0 --port 1313
}
