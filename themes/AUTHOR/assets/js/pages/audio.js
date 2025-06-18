/**
 * Audio Page Module
 * Handles audio page specific functionality
 */
export class AudioPageModule {
  constructor() {
    this.currentPlayer = null;
    this.playlist = [];
    this.init();
  }

  init() {
    if (!this.isCurrentPage()) return;
    
    this.setupAudioPlayers();
    this.setupPlaylist();
    this.setupAudioVisualization();
  }

  isCurrentPage() {
    return window.location.pathname.includes('/audio') || 
           document.body.classList.contains('page-audio');
  }

  setupAudioPlayers() {
    const audioItems = document.querySelectorAll('.audio-item, .mandala-item[data-type="audio"]');
    
    audioItems.forEach((item, index) => {
      const audioSrc = item.dataset.audio;
      if (!audioSrc) return;

      const playButton = item.querySelector('.audio-play-btn, .play-pause-btn');
      const progressBar = item.querySelector('.audio-progress, .progress-bar');
      const timeDisplay = item.querySelector('.audio-time, .time-display');
      
      if (!playButton) return;

      const audio = new Audio(audioSrc);
      audio.preload = 'metadata';
      
      // Store reference for playlist functionality
      this.playlist.push({
        audio,
        item,
        index,
        title: item.querySelector('.audio-title, .mandala-item-title')?.textContent || `Track ${index + 1}`
      });

      let isPlaying = false;

      playButton.addEventListener('click', () => {
        if (isPlaying) {
          this.pauseAudio(audio, playButton, item);
        } else {
          this.playAudio(audio, playButton, item, index);
        }
        isPlaying = !isPlaying;
      });

      // Update progress
      if (progressBar && timeDisplay) {
        audio.addEventListener('timeupdate', () => {
          this.updateProgress(audio, progressBar, timeDisplay);
        });
      }

      // Handle audio end
      audio.addEventListener('ended', () => {
        isPlaying = false;
        this.resetPlayer(playButton, item);
        this.playNext(index);
      });

      // Handle audio errors
      audio.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        isPlaying = false;
        this.resetPlayer(playButton, item);
      });
    });
  }

  playAudio(audio, button, item, index) {
    // Pause any currently playing audio
    if (this.currentPlayer && this.currentPlayer !== audio) {
      this.currentPlayer.pause();
      // Reset previous player UI
      const prevItem = this.playlist.find(p => p.audio === this.currentPlayer)?.item;
      if (prevItem) {
        this.resetPlayer(prevItem.querySelector('.audio-play-btn, .play-pause-btn'), prevItem);
      }
    }

    this.currentPlayer = audio;
    
    audio.play().then(() => {
      this.updatePlayButton(button, true);
      item.classList.add('playing');
      
      // Dispatch custom event
      item.dispatchEvent(new CustomEvent('audio-play', {
        detail: { audioElement: audio, index }
      }));
    }).catch(error => {
      console.warn('Audio playback failed:', error);
      this.resetPlayer(button, item);
    });
  }

  pauseAudio(audio, button, item) {
    audio.pause();
    this.updatePlayButton(button, false);
    item.classList.remove('playing');
    
    item.dispatchEvent(new CustomEvent('audio-pause', {
      detail: { audioElement: audio }
    }));
  }

  resetPlayer(button, item) {
    this.updatePlayButton(button, false);
    item.classList.remove('playing');
  }

  updatePlayButton(button, isPlaying) {
    const playIcon = button.querySelector('.play-icon');
    const pauseIcon = button.querySelector('.pause-icon');
    const btnText = button.querySelector('.btn-state-text');

    if (isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline';
      if (btnText) btnText.textContent = 'Pause';
      button.setAttribute('aria-pressed', 'true');
    } else {
      if (playIcon) playIcon.style.display = 'inline';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (btnText) btnText.textContent = 'Play';
      button.setAttribute('aria-pressed', 'false');
    }
  }

  updateProgress(audio, progressBar, timeDisplay) {
    if (!audio.duration) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    const progressFill = progressBar.querySelector('.progress-fill');
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    
    progressBar.setAttribute('aria-valuenow', Math.round(progress));

    // Update time display
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }

  playNext(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.playlist.length;
    const nextTrack = this.playlist[nextIndex];
    
    if (nextTrack) {
      const playButton = nextTrack.item.querySelector('.audio-play-btn, .play-pause-btn');
      if (playButton) {
        setTimeout(() => {
          this.playAudio(nextTrack.audio, playButton, nextTrack.item, nextIndex);
        }, 1000); // Brief pause between tracks
      }
    }
  }

  setupPlaylist() {
    // Create playlist controls if needed
    const playlistContainer = document.querySelector('.audio-playlist');
    if (!playlistContainer || this.playlist.length === 0) return;

    const playlistElement = document.createElement('div');
    playlistElement.className = 'playlist-controls';
    playlistElement.innerHTML = `
      <button class="playlist-prev" aria-label="Previous track">⏮</button>
      <button class="playlist-next" aria-label="Next track">⏭</button>
      <button class="playlist-shuffle" aria-label="Shuffle playlist">🔀</button>
    `;

    playlistContainer.appendChild(playlistElement);

    // Add event listeners
    playlistElement.querySelector('.playlist-prev').addEventListener('click', () => {
      this.playPrevious();
    });

    playlistElement.querySelector('.playlist-next').addEventListener('click', () => {
      this.playNext(this.getCurrentIndex());
    });
  }

  playPrevious() {
    const currentIndex = this.getCurrentIndex();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.playlist.length - 1;
    const prevTrack = this.playlist[prevIndex];
    
    if (prevTrack) {
      const playButton = prevTrack.item.querySelector('.audio-play-btn, .play-pause-btn');
      if (playButton) {
        this.playAudio(prevTrack.audio, playButton, prevTrack.item, prevIndex);
      }
    }
  }

  getCurrentIndex() {
    if (!this.currentPlayer) return 0;
    return this.playlist.findIndex(track => track.audio === this.currentPlayer);
  }

  setupAudioVisualization() {
    // Basic audio visualization setup
    if (!this.currentPlayer || !window.AudioContext) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(this.currentPlayer);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      // Simple visualization could be added here
      console.log('Audio visualization setup complete');
    } catch (error) {
      console.warn('Audio visualization not available:', error);
    }
  }
}

// Export for module loading
export default AudioPageModule;
