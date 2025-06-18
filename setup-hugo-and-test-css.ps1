# Hugo Installation and CSS Testing Script
# This script will install Hugo and test CSS loading

Write-Host "🚀 Setting up Hugo and testing CSS loading..." -ForegroundColor Green

# Step 1: Install Hugo if not already installed
Write-Host "📦 Checking Hugo installation..." -ForegroundColor Blue

try {
    $hugoVersion = hugo version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Hugo is already installed: $hugoVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "📥 Installing Hugo via Chocolatey..." -ForegroundColor Yellow
    choco install hugo-extended -y
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Hugo installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Hugo!" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Verify CSS files exist
Write-Host "🎨 Checking CSS file structure..." -ForegroundColor Blue

$cssPath = "themes\AUTHOR\assets\css"
$requiredCssFiles = @(
    "_variables.css",
    "_base.css", 
    "_typography.css",
    "_accessibility.css",
    "_header.css",
    "_mandala.css",
    "_animations.css",
    "_books.css",
    "_social.css",
    "_responsive.css",
    "critical.css",
    "consolidated.css",
    "main.css"
)

$missingFiles = @()
foreach ($file in $requiredCssFiles) {
    $fullPath = Join-Path $cssPath $file
    if (-not (Test-Path $fullPath)) {
        $missingFiles += $file
        Write-Host "⚠️  Missing: $file" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing CSS files detected. You may need to restore them." -ForegroundColor Red
    Write-Host "Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
}

# Step 3: Test Hugo build
Write-Host "🔧 Testing Hugo build..." -ForegroundColor Blue

try {
    hugo --buildDrafts --buildFuture --minify
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Hugo build successful!" -ForegroundColor Green
        
        # Step 4: Check if CSS was generated
        if (Test-Path "public\css\bundle.css") {
            Write-Host "✅ CSS bundle generated successfully!" -ForegroundColor Green
        } elseif (Test-Path "public\css\consolidated.css") {
            Write-Host "✅ Consolidated CSS generated successfully!" -ForegroundColor Green
        } elseif (Test-Path "public\css\main.css") {
            Write-Host "✅ Main CSS generated successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No CSS files found in public directory" -ForegroundColor Yellow
            Write-Host "CSS files in public:" -ForegroundColor Yellow
            Get-ChildItem "public" -Recurse -Filter "*.css" | ForEach-Object { Write-Host "  $($_.FullName)" }
        }
        
    } else {
        Write-Host "❌ Hugo build failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error during Hugo build: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Start development server
Write-Host "🌐 Starting Hugo development server..." -ForegroundColor Blue
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
hugo server --buildDrafts --buildFuture --disableFastRender --navigateToChanged
