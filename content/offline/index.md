---
title: "Offline"
layout: "single"
---

<div class="offline-container">
  <div class="offline-content">
    <h1 class="offline-title">Connection Lost</h1>
    <div class="offline-mandala">
      <div class="mandala-symbol">⦿</div>
    </div>
    <p class="offline-message">
      You're currently offline, but the digital dharma continues within.
    </p>
    <p class="offline-description">
      While you're disconnected from the network, take a moment to reflect. 
      The wisdom you seek exists in the space between connections.
    </p>
    
    <div class="offline-navigation">
      <button onclick="window.history.back()" class="offline-btn">
        ← Return to Previous Page
      </button>
      <button onclick="window.location.reload()" class="offline-btn">
        ↻ Try Reconnecting
      </button>
    </div>
    
    <div class="offline-cached">
      <h3>Available Offline:</h3>
      <ul class="cached-pages">
        <li><a href="/">Home</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/books/">Books</a></li>
        <li><a href="/stories/">Stories</a></li>
      </ul>
    </div>
  </div>
</div>

<style>
.offline-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.offline-content {
  max-width: 600px;
  background: rgba(0, 15, 8, 0.9);
  border-radius: 12px;
  padding: 3rem 2rem;
  border: 2px solid var(--electric-indigo);
  box-shadow: 0 0 30px rgba(110, 13, 208, 0.3);
}

.offline-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.5rem;
  background: linear-gradient(90deg, var(--electric-indigo), var(--holographic-teal));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 2rem;
}

.offline-mandala {
  margin: 2rem 0;
  position: relative;
}

.mandala-symbol {
  font-size: 4rem;
  color: var(--saffron);
  animation: gentle-pulse 3s ease-in-out infinite;
  display: inline-block;
}

@keyframes gentle-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.offline-message {
  font-size: 1.3rem;
  color: var(--holographic-teal);
  margin-bottom: 1rem;
  font-style: italic;
}

.offline-description {
  color: var(--light-gray);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.offline-navigation {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.offline-btn {
  background: transparent;
  border: 2px solid var(--electric-indigo);
  color: var(--electric-indigo);
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-height: 44px;
}

.offline-btn:hover,
.offline-btn:focus {
  background: var(--electric-indigo);
  color: var(--flickering-white);
  box-shadow: 0 0 15px rgba(110, 13, 208, 0.5);
}

.offline-btn:active {
  transform: scale(0.98);
}

.offline-cached {
  border-top: 1px solid rgba(110, 13, 208, 0.3);
  padding-top: 2rem;
  margin-top: 2rem;
}

.offline-cached h3 {
  font-family: 'Orbitron', sans-serif;
  color: var(--saffron);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.cached-pages {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.cached-pages li {
  margin: 0;
}

.cached-pages a {
  color: var(--holographic-teal);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid var(--holographic-teal);
  border-radius: 4px;
  transition: all 0.3s ease;
  display: block;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.cached-pages a:hover,
.cached-pages a:focus {
  background: rgba(0, 245, 212, 0.1);
  border-color: var(--saffron);
  color: var(--saffron);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .offline-container {
    padding: 1rem;
    min-height: 70vh;
  }
  
  .offline-content {
    padding: 2rem 1rem;
  }
  
  .offline-title {
    font-size: 2rem;
  }
  
  .mandala-symbol {
    font-size: 3rem;
  }
  
  .offline-navigation {
    flex-direction: column;
    align-items: center;
  }
  
  .offline-btn {
    width: 100%;
    max-width: 250px;
  }
  
  .cached-pages {
    flex-direction: column;
    align-items: center;
  }
  
  .cached-pages a {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .mandala-symbol {
    animation: none;
  }
  
  .offline-btn,
  .cached-pages a {
    transition: none;
  }
}

/* High contrast */
@media (prefers-contrast: high) {
  .offline-content {
    border-width: 3px;
    background: #000000;
  }
  
  .offline-title {
    color: #ffffff;
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
  }
  
  .offline-message {
    color: #00ffff;
  }
  
  .offline-description {
    color: #ffffff;
  }
}
</style>

<script>
// Check if we're actually offline
if (navigator.onLine) {
  // If we're online, this might be a cached offline page
  // Show a message or redirect
  document.addEventListener('DOMContentLoaded', function() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 255, 212, 0.9);
      color: #000;
      padding: 1rem;
      border-radius: 6px;
      z-index: 1000;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.9rem;
    `;
    message.textContent = 'Connection restored!';
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  });
}

// Listen for online/offline events
window.addEventListener('online', function() {
  location.reload();
});

window.addEventListener('offline', function() {
  console.log('Connection lost');
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    window.history.back();
  } else if (e.key === 'r' || e.key === 'R') {
    window.location.reload();
  }
});
</script>
