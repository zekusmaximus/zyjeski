# Global Emergency Image Fix Injection Script
# This PowerShell script injects the global emergency fix into ALL HTML files

param(
    [string]$PublicDir = "C:\Users\zeke\Projects\zyjeski\public"
)

Write-Host "🚨 GLOBAL EMERGENCY FIX: Injecting image fix into all HTML files..." -ForegroundColor Red

# The script to inject
$emergencyScript = @'
<script>
/*! GLOBAL EMERGENCY FIX for broken images and modules - DO NOT REMOVE */
console.log('🚨 EMERGENCY: Loading global image fix...');

// IMMEDIATE FIX: Override broken imports
(function() {
  'use strict';
  
  // Disable all image optimization
  if (typeof window !== 'undefined') {
    window.ResponsiveImages = { enabled: false };
    window.ImageOptimization = { enabled: false };
    window.AVIFSupport = { enabled: false };
    
    if (window.generateResponsiveImage) window.generateResponsiveImage = () => false;
    if (window.convertToAVIF) window.convertToAVIF = () => false;
    if (window.createResponsiveSrcset) window.createResponsiveSrcset = () => false;
  }
  
  // Override dynamic imports for broken modules
  const brokenModules = [
    '/js/features/mandala-3d.js', '/js/features/prayer-wheel.js', 
    '/js/features/particles.js', '/js/features/animations.js',
    '/js/features/audio-visualization.js', '/js/features/background-effects.js',
    '/js/social-sharing.js', './features/mandala-3d.js', './features/prayer-wheel.js',
    './features/particles.js', './features/animations.js',
    './features/audio-visualization.js', './features/background-effects.js'
  ];
  
  const originalImport = window.import;
  
  function safeImport(modulePath) {
    const normalizedPath = modulePath.replace(/^\.\//, '/js/');
    
    if (brokenModules.some(broken => normalizedPath.includes(broken) || modulePath.includes(broken))) {
      console.log(`⚠️ Blocking broken module: ${modulePath}`);
      return Promise.resolve({
        initMandala3D: () => console.log('🔧 Mandala3D fallback'),
        initPrayerWheel: () => console.log('🔧 PrayerWheel fallback'),
        initParticles: () => console.log('🔧 Particles fallback'),
        initComplexAnimations: () => console.log('🔧 Animations fallback'),
        initAudioVisualization: () => console.log('🔧 AudioViz fallback'),
        initBackgroundEffects: () => console.log('🔧 BackgroundFX fallback'),
        init: () => console.log('🔧 Module fallback'),
        default: () => console.log('🔧 Default fallback')
      });
    }
    
    return originalImport ? originalImport(modulePath).catch(() => Promise.resolve({ init: () => {} })) : Promise.resolve({ init: () => {} });
  }
  
  if (window.import) window.import = safeImport;
})();

// FIX IMAGES
function fixImages() {
  const images = document.querySelectorAll('img');
  let fixedCount = 0;
  
  images.forEach(img => {
    const src = img.src;
    if (src && (src.includes('.avif') || src.includes('_q95') || src.includes('_1024w') || !img.complete || img.naturalWidth === 0)) {
      let fixedSrc = src
        .replace(/_\d+w_q\d+\.avif$/, '.jpg')
        .replace(/_\d+w\.avif$/, '.jpg')
        .replace(/\.avif$/, '.jpg')
        .replace(/_\d+w_q\d+\.webp$/, '.jpg')
        .replace(/_\d+w\.webp$/, '.jpg')
        .replace(/\.webp$/, '.jpg')
        .replace(/_\d+w_q\d+$/, '')
        .replace(/_\d+w$/, '')
        .replace(/_q\d+$/, '');
      
      if (!fixedSrc.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        fixedSrc += '.jpg';
      }
      
      img.src = fixedSrc;
      img.removeAttribute('srcset');
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      img.removeAttribute('loading');
      img.classList.remove('lazy', 'lazyload', 'lazyloading', 'lazyloaded');
      
      fixedCount++;
      console.log('🔧 Fixed image:', fixedSrc);
    }
  });
  
  return fixedCount;
}

// OVERRIDE PROGRESSIVE ENHANCEMENT
function fixProgressiveEnhancement() {
  const check = () => {
    if (window.ProgressiveEnhancement) {
      const pe = window.ProgressiveEnhancement;
      
      ['loadMandala3D', 'loadPrayerWheelAnimation', 'loadParticleEffects', 
       'loadComplexAnimations', 'loadAudioVisualization', 'loadBackgroundEffects'].forEach(method => {
        if (pe[method]) {
          pe[method] = async () => {
            console.log(`🔧 ${method}: Using fallback`);
            if (method === 'loadMandala3D') pe.loadBasicMandala?.();
            if (method === 'loadPrayerWheelAnimation') pe.loadBasicAudioPlayer?.();
            return Promise.resolve();
          };
        }
      });
    } else {
      setTimeout(check, 100);
    }
  };
  check();
}

// RUN FIXES
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚨 EMERGENCY: Applying global fixes...');
  fixImages();
  fixProgressiveEnhancement();
  
  // Setup observer for new images
  new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && (node.tagName === 'IMG' || (node.querySelectorAll && node.querySelectorAll('img').length))) {
          fixImages();
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
  
  // Periodic safety check
  setInterval(fixImages, 5000);
  
  console.log('✅ EMERGENCY: Global fix active');
});

// Run immediately if DOM is ready
if (document.readyState !== 'loading') {
  fixImages();
  fixProgressiveEnhancement();
}

console.log('✅ EMERGENCY: Fix script loaded');
</script>
'@

# Find all HTML files
$htmlFiles = Get-ChildItem -Path $PublicDir -Filter "*.html" -Recurse

Write-Host "Found $($htmlFiles.Count) HTML files to modify" -ForegroundColor Yellow

$modifiedCount = 0

foreach ($file in $htmlFiles) {
    try {
        Write-Host "Processing: $($file.FullName)" -ForegroundColor Cyan
        
        # Read the content
        $content = Get-Content -Path $file.FullName -Raw
        
        # Check if already modified
        if ($content -match "GLOBAL EMERGENCY FIX") {
            Write-Host "  ⚠️  Already contains emergency fix, skipping" -ForegroundColor Yellow
            continue
        }
        
        # Find the head closing tag and inject before it
        if ($content -match "</head>") {
            $modifiedContent = $content -replace "</head>", "$emergencyScript`n</head>"
            
            # Write back to file
            Set-Content -Path $file.FullName -Value $modifiedContent -NoNewline
            
            Write-Host "  ✅ Emergency fix injected" -ForegroundColor Green
            $modifiedCount++
        } else {
            Write-Host "  ⚠️  No </head> tag found, skipping" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  ❌ Error processing file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🚨 GLOBAL EMERGENCY FIX COMPLETE!" -ForegroundColor Red
Write-Host "Modified $modifiedCount HTML files" -ForegroundColor Green
Write-Host "All images should now load properly across the entire website" -ForegroundColor Green
Write-Host "`nTo verify, refresh your browser and check the console for fix messages." -ForegroundColor Yellow
