// Add this to themes/AUTHOR/assets/js/main.js

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the mandala grid effects
  initMandalaEffects();
  
  // Add cyberpunk text effects
  initCyberpunkTextEffects();
});

function initMandalaEffects() {
  const mandalaGrid = document.querySelector('.mandala-grid');
  
  if (!mandalaGrid) return;
  
  // Add 3D rotation effect on mouse move
  document.addEventListener('mousemove', function(e) {
    if (!mandalaGrid) return;
    
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    
    mandalaGrid.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  });
  
  // Reset on mouse leave
  document.addEventListener('mouseleave', function() {
    if (!mandalaGrid) return;
    mandalaGrid.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
  
  // Add subtle rotation on scroll
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const rotationAngle = (scrollPosition / window.innerHeight) * 5; // Max 5 degrees
    
    if (mandalaGrid && rotationAngle <= 5) {
      mandalaGrid.style.transform = `rotateX(${rotationAngle}deg) rotateZ(${rotationAngle/2}deg)`;
    }
  });
  
  // Add hover effects to mandala items
  const mandalaItems = document.querySelectorAll('.mandala-item');
  
  mandalaItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      // Create glitch effect
      createGlitchEffect(this);
      
      // Add glow to other items
      mandalaItems.forEach(otherItem => {
        if (otherItem !== this) {
          otherItem.style.opacity = '0.7';
        }
      });
    });
    
    item.addEventListener('mouseleave', function() {
      // Remove effects
      this.classList.remove('glitching');
      
      // Reset other items
      mandalaItems.forEach(otherItem => {
        otherItem.style.opacity = '1';
      });
    });
  });
}

function createGlitchEffect(element) {
  element.classList.add('glitching');
  
  // Create random glitch movements
  const glitchAnimation = setInterval(() => {
    const randX = Math.random() * 4 - 2; // -2 to 2px
    const randY = Math.random() * 4 - 2; // -2 to 2px
    const randSkew = Math.random() * 4 - 2; // -2 to 2 degrees
    
    element.style.transform = `translate(${randX}px, ${randY}px) skew(${randSkew}deg)`;
    
    setTimeout(() => {
      element.style.transform = 'translate(0, 0) skew(0)';
    }, 50);
  }, 200);
  
  // Stop after 2 seconds
  setTimeout(() => {
    clearInterval(glitchAnimation);
    element.style.transform = '';
  }, 2000);
}

function initCyberpunkTextEffects() {
  // Add glitch effect to titles
  const titles = document.querySelectorAll('.site-title, .mandala-item-title');
  
  titles.forEach(title => {
    const text = title.textContent;
    title.setAttribute('data-text', text);
    
    title.addEventListener('mouseenter', function() {
      this.classList.add('text-glitch');
      setTimeout(() => {
        this.classList.remove('text-glitch');
      }, 1000);
    });
  });
  
  // Add digital noise to the author name on hover
  const authorName = document.querySelector('.author-name');
  if (authorName) {
    authorName.addEventListener('mouseenter', function() {
      const originalText = this.textContent;
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      let iterations = 0;
      
      const interval = setInterval(() => {
        this.textContent = originalText
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
          
        if (iterations >= originalText.length) {
          clearInterval(interval);
          this.textContent = originalText;
        }
        
        iterations += 1/3;
      }, 30);
    });
  }
}

// Add some digital rain effect to the background on special pages
function createDigitalRain() {
  // Check if we're on a special page that should have the effect
  const isSpecialPage = document.body.classList.contains('digital-rain-bg');
  if (!isSpecialPage) return;
  
  const canvas = document.createElement('canvas');
  canvas.classList.add('digital-rain');
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const columns = Math.floor(canvas.width / 20);
  const drops = [];
  
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }
  
  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0f0';
    ctx.font = '15px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * 20, drops[i] * 20);
      
      if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      
      drops[i]++;
    }
  }
  
  setInterval(draw, 33);
}

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', createDigitalRain);