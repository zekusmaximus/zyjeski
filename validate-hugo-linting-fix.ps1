# Hugo Linting Fix Validation Script
# This script validates that Hugo linting errors have been resolved

Write-Host "🔧 Validating Hugo linting fixes..." -ForegroundColor Green

# Check VSCode settings
Write-Host "📋 Checking VSCode settings..." -ForegroundColor Blue

if (Test-Path ".vscode\settings.json") {
    $settings = Get-Content ".vscode\settings.json" -Raw
    
    if ($settings -like "*hugo*") {
        Write-Host "✅ Hugo file associations configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Hugo file associations missing" -ForegroundColor Red
    }
    
    if ($settings -like "*css.validate*") {
        Write-Host "✅ CSS validation settings configured" -ForegroundColor Green
    } else {
        Write-Host "❌ CSS validation settings missing" -ForegroundColor Red
    }
    
    if ($settings -like "*html.validate.styles*") {
        Write-Host "✅ HTML style validation disabled" -ForegroundColor Green
    } else {
        Write-Host "❌ HTML style validation not properly configured" -ForegroundColor Red
    }
} else {
    Write-Host "❌ VSCode settings file not found" -ForegroundColor Red
}

# Check Hugo custom data file
if (Test-Path ".vscode\hugo.html-data.json") {
    Write-Host "✅ Hugo custom data file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Hugo custom data file missing" -ForegroundColor Red
}

# Check for problematic template files
Write-Host "🔍 Checking for problematic Hugo template files..." -ForegroundColor Blue

$problematicFiles = @()
$templateFiles = Get-ChildItem -Path "themes" -Filter "*.html" -Recurse

foreach ($file in $templateFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match '<style>.*\{\{.*\}\}.*</style>') {
        $problematicFiles += $file.FullName
    }
}

if ($problematicFiles.Count -eq 0) {
    Write-Host "✅ No problematic template files found" -ForegroundColor Green
} else {
    Write-Host "⚠️ Found $($problematicFiles.Count) files with Hugo syntax in <style> blocks:" -ForegroundColor Yellow
    foreach ($file in $problematicFiles) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
    Write-Host "💡 These files may still cause linting errors" -ForegroundColor Yellow
}

# Recommendations
Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
Write-Host "  1. Restart VSCode to apply all settings changes" -ForegroundColor White
Write-Host "  2. Open a Hugo template file and check the language mode (bottom-right)" -ForegroundColor White
Write-Host "  3. Should show 'Hugo' instead of 'HTML'" -ForegroundColor White
Write-Host "  4. CSS linting errors should no longer appear in Hugo templates" -ForegroundColor White

if ($problematicFiles.Count -gt 0) {
    Write-Host "  5. Consider refactoring problematic files to use external CSS" -ForegroundColor White
    Write-Host "  6. Use build scripts for CSS inlining in production" -ForegroundColor White
}

Write-Host "`n✅ Validation complete!" -ForegroundColor Green
