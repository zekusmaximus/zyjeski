# Manual CSS Build Script (No Hugo Required)
# This script concatenates all CSS files manually

Write-Host "Building CSS manually without Hugo..." -ForegroundColor Green

# Create public directory if it doesn't exist
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" -Force
}
if (-not (Test-Path "public\css")) {
    New-Item -ItemType Directory -Path "public\css" -Force
}

$cssPath = "themes\AUTHOR\assets\css"
$outputPath = "public\css"

# CSS files in correct order
$cssFiles = @(
    "_variables.css",
    "_base.css",
    "_typography.css",
    "_accessibility.css",
    "_header.css",
    "_mandala.css",
    "_animations.css",
    "_books.css",
    "_social.css",
    "_responsive.css"
)

Write-Host "Concatenating CSS files..." -ForegroundColor Blue

$combinedCSS = ""

foreach ($file in $cssFiles) {
    $filePath = Join-Path $cssPath $file
    if (Test-Path $filePath) {
        Write-Host "Adding: $file" -ForegroundColor Green
        $content = Get-Content $filePath -Raw
        $combinedCSS += "/* === $file === */`n"
        $combinedCSS += $content
        $combinedCSS += "`n`n"
    } else {
        Write-Host "Missing: $file" -ForegroundColor Yellow
    }
}

# Write the combined CSS
$bundlePath = Join-Path $outputPath "bundle.css"
$combinedCSS | Out-File -FilePath $bundlePath -Encoding UTF8
Write-Host "Created: $bundlePath" -ForegroundColor Green

# Also copy individual files for fallback
Write-Host "Copying individual CSS files..." -ForegroundColor Blue

foreach ($file in (Get-ChildItem $cssPath -Filter "*.css")) {
    $destPath = Join-Path $outputPath $file.Name
    Copy-Item $file.FullName $destPath -Force
    Write-Host "Copied: $($file.Name)" -ForegroundColor Green
}

# Copy critical CSS
$criticalSrc = Join-Path $cssPath "critical.css"
$criticalDest = Join-Path $outputPath "critical.css"
if (Test-Path $criticalSrc) {
    Copy-Item $criticalSrc $criticalDest -Force    Write-Host "Copied: critical.css" -ForegroundColor Green
}

# Copy consolidated CSS
$consolidatedSrc = Join-Path $cssPath "consolidated.css"
$consolidatedDest = Join-Path $outputPath "consolidated.css"
if (Test-Path $consolidatedSrc) {
    Copy-Item $consolidatedSrc $consolidatedDest -Force
    Write-Host "Copied: consolidated.css" -ForegroundColor Green
}

Write-Host "CSS build complete!" -ForegroundColor Green
Write-Host "Files created in: public\css\" -ForegroundColor Blue

# List what was created
Get-ChildItem "public\css" | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "  $($_.Name) - $size KB" -ForegroundColor Cyan
}
