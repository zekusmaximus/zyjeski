#!/usr/bin/env pwsh
# Performance-Optimized Build Script for Hugo Author Website
# Handles CSS bundling, JavaScript optimization, and image processing

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'production',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipImageOptimization,
      [Parameter(Mandatory=$false)]
    [switch]$VerboseOutput,
    
    [Parameter(Mandatory=$false)]
    [switch]$Watch
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Configuration
$Config = @{
    SourceDir = $PSScriptRoot
    OutputDir = Join-Path $PSScriptRoot "public"
    ThemeDir = Join-Path $PSScriptRoot "themes\AUTHOR"
    AssetDir = Join-Path $PSScriptRoot "themes\AUTHOR\assets"
    StaticDir = Join-Path $PSScriptRoot "static"
    Environment = $Environment
}

# Performance budget thresholds (in KB)
$PerformanceBudget = @{
    CSS = @{
        Critical = 14
        Total = 100
    }
    JavaScript = @{
        Critical = 50
        Total = 300
    }
    Images = @{
        PerPage = 500
        Total = 2000
    }
}

function Write-PerformanceLog {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-PerformanceLog "Checking prerequisites..."
    
    # Check if Hugo is installed
    try {
        $hugoVersion = hugo version
        Write-PerformanceLog "Hugo found: $hugoVersion" "SUCCESS"
    }
    catch {
        Write-PerformanceLog "Hugo not found. Please install Hugo." "ERROR"
        exit 1
    }
    
    # Check Node.js for additional optimizations (optional)
    try {        $nodeVersion = node --version
        Write-PerformanceLog "Node.js found: $nodeVersion" "SUCCESS"
        return $true
    }
    catch {
        Write-PerformanceLog "Node.js not found. Some optimizations will be skipped." "WARN"
        return $false
    }
}

function Test-NodeAvailable {
    try {
        $null = node --version
        return $true
    }
    catch {
        return $false
    }
}

function Optimize-CSS {
    Write-PerformanceLog "Optimizing CSS..."
    
    $cssDir = Join-Path $Config.AssetDir "css"
    $outputCssDir = Join-Path $Config.OutputDir "css"
    
    # Ensure output directory exists
    if (!(Test-Path $outputCssDir)) {
        New-Item -ItemType Directory -Path $outputCssDir -Force | Out-Null
    }
    
    # Critical CSS optimization
    $criticalCss = Join-Path $cssDir "critical-enhanced.css"
    if (Test-Path $criticalCss) {
        $criticalContent = Get-Content $criticalCss -Raw
        $criticalSize = [System.Text.Encoding]::UTF8.GetByteCount($criticalContent) / 1KB
        
        if ($criticalSize -gt $PerformanceBudget.CSS.Critical) {
            Write-PerformanceLog "WARNING: Critical CSS exceeds budget: ${criticalSize}KB > $($PerformanceBudget.CSS.Critical)KB" "WARN"
        } else {
            Write-PerformanceLog "Critical CSS within budget: ${criticalSize}KB" "SUCCESS"
        }
    }
      # Minify CSS files if Node.js is available
    if ((Test-NodeAvailable) -and ($Config.Environment -ne 'development')) {
        Write-PerformanceLog "Minifying CSS files..."
        
        Get-ChildItem $cssDir -Filter "*.css" | ForEach-Object {
            $inputFile = $_.FullName
            $outputFile = Join-Path $outputCssDir $_.Name
            
            try {
                # Use cssnano via npx if available
                npx cssnano $inputFile $outputFile 2>$null
                if ($LASTEXITCODE -eq 0) {
                    $originalSize = (Get-Item $inputFile).Length / 1KB
                    $minifiedSize = (Get-Item $outputFile).Length / 1KB
                    $savings = [math]::Round((($originalSize - $minifiedSize) / $originalSize) * 100, 1)
                    Write-PerformanceLog "Minified $($_.Name): ${originalSize}KB → ${minifiedSize}KB ($savings% reduction)"
                } else {
                    # Fallback: just copy the file
                    Copy-Item $inputFile $outputFile
                }
            }
            catch {
                # Fallback: just copy the file
                Copy-Item $inputFile $outputFile
            }
        }
    }
}

function Optimize-JavaScript {
    Write-PerformanceLog "Optimizing JavaScript..."
    
    $jsDir = Join-Path $Config.AssetDir "js"
    $outputJsDir = Join-Path $Config.OutputDir "js"
    
    # Ensure output directory exists
    if (!(Test-Path $outputJsDir)) {
        New-Item -ItemType Directory -Path $outputJsDir -Force | Out-Null
    }
      # Bundle and minify JavaScript files
    if ((Test-NodeAvailable) -and ($Config.Environment -ne 'development')) {
        Write-PerformanceLog "Bundling and minifying JavaScript..."
        
        # Critical JavaScript files that should be bundled together
        $criticalJs = @(
            "environment-optimizer.js",
            "lazy-loading.js",
            "image-optimizer.js"
        )
        
        $criticalJsFiles = $criticalJs | ForEach-Object {
            $file = Join-Path $jsDir $_
            if (Test-Path $file) { $file }
        }
        
        if ($criticalJsFiles.Count -gt 0) {
            $bundleFile = Join-Path $outputJsDir "critical-bundle.js"
            
            # Concatenate critical files
            $bundleContent = $criticalJsFiles | ForEach-Object {
                Get-Content $_ -Raw
            } | Join-String -Separator "`n`n"
            
            Set-Content $bundleFile $bundleContent
            
            # Minify the bundle
            try {
                npx terser $bundleFile --output $bundleFile --compress --mangle 2>$null
                if ($LASTEXITCODE -eq 0) {
                    $bundleSize = (Get-Item $bundleFile).Length / 1KB
                    Write-PerformanceLog "Created critical JS bundle: ${bundleSize}KB"
                    
                    if ($bundleSize -gt $PerformanceBudget.JavaScript.Critical) {
                        Write-PerformanceLog "WARNING: Critical JS exceeds budget: ${bundleSize}KB > $($PerformanceBudget.JavaScript.Critical)KB" "WARN"
                    }
                }
            }
            catch {
                Write-PerformanceLog "JavaScript minification failed, using unminified bundle" "WARN"
            }
        }
        
        # Process other JavaScript files
        Get-ChildItem $jsDir -Filter "*.js" -Recurse | ForEach-Object {
            if ($criticalJs -notcontains $_.Name) {
                $relativePath = $_.FullName.Replace($jsDir, "").TrimStart("\")
                $outputFile = Join-Path $outputJsDir $relativePath
                $outputDir = Split-Path $outputFile -Parent
                
                if (!(Test-Path $outputDir)) {
                    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
                }
                
                try {
                    npx terser $_.FullName --output $outputFile --compress --mangle 2>$null
                    if ($LASTEXITCODE -ne 0) {
                        Copy-Item $_.FullName $outputFile
                    }
                }
                catch {
                    Copy-Item $_.FullName $outputFile
                }
            }
        }
    }
}

function Optimize-Images {
    if ($SkipImageOptimization) {
        Write-PerformanceLog "Skipping image optimization (--SkipImageOptimization flag set)"
        return
    }
    
    Write-PerformanceLog "Optimizing images..."
    
    $imageExtensions = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp")
    $totalOriginalSize = 0
    $totalOptimizedSize = 0
    $processedCount = 0
    
    # Process images in static directory
    foreach ($ext in $imageExtensions) {
        Get-ChildItem $Config.StaticDir -Filter $ext -Recurse | ForEach-Object {
            $inputFile = $_.FullName
            $originalSize = $_.Length
            $totalOriginalSize += $originalSize
            
            # Simple optimization using PowerShell (basic)
            # In a real scenario, you'd use ImageMagick, Sharp, or similar
            try {
                if ((Test-NodeAvailable) -and ($Config.Environment -eq 'production')) {
                    # Use imagemin if available
                    $relativePath = $_.FullName.Replace($Config.StaticDir, "").TrimStart("\")
                    $outputPath = Join-Path $Config.OutputDir $relativePath
                    $outputDir = Split-Path $outputPath -Parent
                    
                    if (!(Test-Path $outputDir)) {
                        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
                    }
                    
                    # For now, just copy the file (placeholder for actual image optimization)
                    Copy-Item $inputFile $outputPath
                    $optimizedSize = (Get-Item $outputPath).Length
                } else {
                    # Development: just copy files
                    $relativePath = $_.FullName.Replace($Config.StaticDir, "").TrimStart("\")
                    $outputPath = Join-Path $Config.OutputDir $relativePath
                    $outputDir = Split-Path $outputPath -Parent
                    
                    if (!(Test-Path $outputDir)) {
                        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
                    }
                    
                    Copy-Item $inputFile $outputPath
                    $optimizedSize = $originalSize
                }
                
                $totalOptimizedSize += $optimizedSize
                $processedCount++
                
                if ($VerboseOutput) {
                    $savings = if ($originalSize -gt 0) { 
                        [math]::Round((($originalSize - $optimizedSize) / $originalSize) * 100, 1) 
                    } else { 0 }
                    Write-PerformanceLog "Processed $($_.Name): $([math]::Round($originalSize/1KB, 1))KB → $([math]::Round($optimizedSize/1KB, 1))KB ($savings% reduction)"
                }
            }
            catch {
                Write-PerformanceLog "Failed to optimize $($_.Name): $($_.Exception.Message)" "WARN"
                
                # Fallback: copy original
                $relativePath = $_.FullName.Replace($Config.StaticDir, "").TrimStart("\")
                $outputPath = Join-Path $Config.OutputDir $relativePath
                Copy-Item $inputFile $outputPath -Force
                $totalOptimizedSize += $originalSize
            }
        }
    }
    
    if ($processedCount -gt 0) {
        $totalSavings = if ($totalOriginalSize -gt 0) { 
            [math]::Round((($totalOriginalSize - $totalOptimizedSize) / $totalOriginalSize) * 100, 1) 
        } else { 0 }
        Write-PerformanceLog "Image optimization complete: $processedCount files, $([math]::Round($totalOptimizedSize/1MB, 1))MB total ($totalSavings% reduction)" "SUCCESS"
        
        $totalImagesMB = $totalOptimizedSize / 1MB
        if ($totalImagesMB -gt ($PerformanceBudget.Images.Total / 1024)) {
            Write-PerformanceLog "WARNING: Total image size exceeds budget: $([math]::Round($totalImagesMB, 1))MB > $($PerformanceBudget.Images.Total / 1024)MB" "WARN"
        }
    }
}

function Invoke-HugoBuild {
    Write-PerformanceLog "Building Hugo site..."
    
    $hugoArgs = @()
    
    if ($Config.Environment -eq 'production') {
        $hugoArgs += "--environment", "production"
        $hugoArgs += "--minify"
    } elseif ($Config.Environment -eq 'development') {
        $hugoArgs += "--environment", "development"
        $hugoArgs += "--buildDrafts"
        $hugoArgs += "--buildFuture"
    }
    
    if ($VerboseOutput) {
        $hugoArgs += "--verbose"
    }
    
    if ($Watch) {
        $hugoArgs += "--watch"
        Write-PerformanceLog "Starting Hugo in watch mode..."
    }
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        if ($Watch) {
            hugo server @hugoArgs
        } else {
            hugo @hugoArgs
        }
        
        $stopwatch.Stop()
        
        if ($LASTEXITCODE -eq 0) {
            Write-PerformanceLog "Hugo build completed in $($stopwatch.ElapsedMilliseconds)ms" "SUCCESS"
        } else {
            Write-PerformanceLog "Hugo build failed" "ERROR"
            exit 1
        }
    }
    catch {
        Write-PerformanceLog "Hugo build error: $($_.Exception.Message)" "ERROR"
        exit 1
    }
}

function Test-PerformanceBudget {
    Write-PerformanceLog "Checking performance budget..."
    
    $outputDir = $Config.OutputDir
    $violations = @()
    
    # Check CSS budget
    $cssFiles = Get-ChildItem (Join-Path $outputDir "css") -Filter "*.css" -ErrorAction SilentlyContinue
    if ($cssFiles) {
        $totalCssSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum / 1KB
        if ($totalCssSize -gt $PerformanceBudget.CSS.Total) {
            $violations += "CSS exceeds budget: $([math]::Round($totalCssSize, 1))KB > $($PerformanceBudget.CSS.Total)KB"
        } else {
            Write-PerformanceLog "CSS within budget: $([math]::Round($totalCssSize, 1))KB" "SUCCESS"
        }
    }
    
    # Check JavaScript budget
    $jsFiles = Get-ChildItem (Join-Path $outputDir "js") -Filter "*.js" -ErrorAction SilentlyContinue
    if ($jsFiles) {
        $totalJsSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum / 1KB
        if ($totalJsSize -gt $PerformanceBudget.JavaScript.Total) {
            $violations += "JavaScript exceeds budget: $([math]::Round($totalJsSize, 1))KB > $($PerformanceBudget.JavaScript.Total)KB"
        } else {
            Write-PerformanceLog "JavaScript within budget: $([math]::Round($totalJsSize, 1))KB" "SUCCESS"
        }
    }
    
    # Report violations
    if ($violations.Count -gt 0) {
        Write-PerformanceLog "PERFORMANCE BUDGET VIOLATIONS:" "ERROR"
        $violations | ForEach-Object {
            Write-PerformanceLog "  - $_" "ERROR"
        }
        
        if ($Config.Environment -eq 'production') {
            Write-PerformanceLog "Performance budget violations detected in production build!" "ERROR"
            # Uncomment the next line to fail the build on budget violations
            # exit 1
        }
    } else {
        Write-PerformanceLog "All performance budgets met!" "SUCCESS"
    }
}

function New-PerformanceReport {
    Write-PerformanceLog "Generating performance report..."
    
    $reportFile = Join-Path $Config.OutputDir "performance-report.json"
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        environment = $Config.Environment
        budget = $PerformanceBudget
        assets = @{}
    }
    
    # Analyze CSS
    $cssDir = Join-Path $Config.OutputDir "css"
    if (Test-Path $cssDir) {
        $cssFiles = Get-ChildItem $cssDir -Filter "*.css"
        $report.assets.css = @{
            count = $cssFiles.Count
            totalSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum
            files = $cssFiles | ForEach-Object {
                @{
                    name = $_.Name
                    size = $_.Length
                    path = $_.FullName.Replace($Config.OutputDir, "")
                }
            }
        }
    }
    
    # Analyze JavaScript
    $jsDir = Join-Path $Config.OutputDir "js"
    if (Test-Path $jsDir) {
        $jsFiles = Get-ChildItem $jsDir -Filter "*.js" -Recurse
        $report.assets.javascript = @{
            count = $jsFiles.Count
            totalSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
            files = $jsFiles | ForEach-Object {
                @{
                    name = $_.Name
                    size = $_.Length
                    path = $_.FullName.Replace($Config.OutputDir, "")
                }
            }
        }
    }
    
    # Analyze Images
    $imageExtensions = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp", "*.svg")
    $allImages = @()
    foreach ($ext in $imageExtensions) {
        $allImages += Get-ChildItem $Config.OutputDir -Filter $ext -Recurse -ErrorAction SilentlyContinue
    }
    
    if ($allImages.Count -gt 0) {
        $report.assets.images = @{
            count = $allImages.Count
            totalSize = ($allImages | Measure-Object -Property Length -Sum).Sum
            files = $allImages | ForEach-Object {
                @{
                    name = $_.Name
                    size = $_.Length
                    path = $_.FullName.Replace($Config.OutputDir, "")
                }
            }
        }
    }
    
    # Save report
    $report | ConvertTo-Json -Depth 4 | Set-Content $reportFile -Encoding UTF8
    Write-PerformanceLog "Performance report saved to: $reportFile" "SUCCESS"
}

# Main execution
function Main {
    Write-PerformanceLog "Starting performance-optimized build for $($Config.Environment) environment" "SUCCESS"
    
    Test-Prerequisites
      if (!$Watch) {
        Optimize-CSS
        Optimize-JavaScript
        Optimize-Images
    }
    
    Invoke-HugoBuild
    
    if (!$Watch) {
        Test-PerformanceBudget
        New-PerformanceReport
        
        Write-PerformanceLog "Build completed successfully!" "SUCCESS"
    }
}

# Execute main function
Main
