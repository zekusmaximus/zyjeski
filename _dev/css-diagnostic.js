// CSS Bundle Diagnostic Script
// Analyzes what's missing from the CSS bundle and why images aren't showing

console.log('🔍 Starting CSS Bundle Diagnostic...');

const fs = require('fs');
const path = require('path');

// Check if mandala CSS exists in bundle
const bundlePath = path.join(__dirname, 'public/css/bundle.css');
const bundleCSS = fs.readFileSync(bundlePath, 'utf8');

console.log('📊 Bundle Analysis:');
console.log(`  - Bundle size: ${bundleCSS.length} characters`);
console.log(`  - Contains .mandala-photo: ${bundleCSS.includes('.mandala-photo')}`);
console.log(`  - Contains .mandala-grid: ${bundleCSS.includes('.mandala-grid')}`);
console.log(`  - Contains .photo-item: ${bundleCSS.includes('.photo-item')}`);
console.log(`  - Contains mandala styles: ${bundleCSS.includes('mandala')}`);

// Check source files
const sourceDir = path.join(__dirname, 'themes/AUTHOR/assets/css');
const mandalaSourcePath = path.join(sourceDir, '_mandala.css');

if (fs.existsSync(mandalaSourcePath)) {
  const mandalaSource = fs.readFileSync(mandalaSourcePath, 'utf8');
  console.log('\n📁 Source Files:');
  console.log(`  - _mandala.css exists: ✅`);
  console.log(`  - _mandala.css size: ${mandalaSource.length} characters`);
  console.log(`  - Contains .mandala-photo: ${mandalaSource.includes('.mandala-photo')}`);
} else {
  console.log('\n❌ _mandala.css source file missing!');
}

// Check CSS loading template
const cssTemplatePath = path.join(__dirname, 'themes/AUTHOR/layouts/partials/head/css.html');
if (fs.existsSync(cssTemplatePath)) {
  const cssTemplate = fs.readFileSync(cssTemplatePath, 'utf8');
  console.log('\n🏗️ CSS Template:');
  console.log(`  - css.html exists: ✅`);
  console.log(`  - References _mandala.css: ${cssTemplate.includes('_mandala.css')}`);
  console.log(`  - Bundle concatenation: ${cssTemplate.includes('Concat')}`);
} else {
  console.log('\n❌ CSS template missing!');
}

// Check images
const imagesDir = path.join(__dirname, 'public/images');
const imagesToCheck = [
  'cyber-bg-1.jpg',
  'cyber-bg-2.jpg', 
  'cyber-bg-3.jpg',
  'mandala-center.jpg'
];

console.log('\n🖼️ Image Files:');
imagesToCheck.forEach(img => {
  const imgPath = path.join(imagesDir, img);
  const exists = fs.existsSync(imgPath);
  if (exists) {
    const stats = fs.statSync(imgPath);
    console.log(`  - ${img}: ✅ (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`  - ${img}: ❌ MISSING`);
  }
});

// Check for CSS build issues
console.log('\n🔧 Potential Issues:');

if (!bundleCSS.includes('mandala')) {
  console.log('  ⚠️ CRITICAL: No mandala styles in bundle');
  console.log('     → CSS concatenation may have failed');
  console.log('     → Check Hugo build process');
}

if (!bundleCSS.includes('grid')) {
  console.log('  ⚠️ WARNING: No grid styles detected');
}

if (bundleCSS.length < 1000) {
  console.log('  ⚠️ WARNING: Bundle seems too small');
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('  1. Rebuild CSS bundle with Hugo');
console.log('  2. Check CSS file paths in template');
console.log('  3. Verify _mandala.css is included in bundle');
console.log('  4. Use emergency hotfix CSS until resolved');

console.log('\n✅ Diagnostic complete!');
