// src/utils/SoundManager.js

// Import audio files
import hoverbtn from '../components/assets/music/click-hover.wav';
import click from '../components/assets/music/click.wav';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.audioContext = null;
    this.isInitialized = false;
    this.isLoading = false;
    this.loadPromises = {};
  }

  // Inisialisasi AudioContext
  init() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      console.log('✅ AudioContext initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AudioContext:', error);
    }
  }

  // Load single sound
  async loadSound(name, url) {
    if (this.loadPromises[name]) {
      return this.loadPromises[name];
    }

    if (this.sounds[name]) {
      return this.sounds[name];
    }

    this.loadPromises[name] = (async () => {
      try {
        if (!this.audioContext) this.init();
        
        console.log(`📥 Loading sound: ${name}`);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
        console.log(`✅ Sound loaded: ${name}`);
        delete this.loadPromises[name];
        return audioBuffer;
      } catch (error) {
        console.error(`❌ Failed to load sound ${name}:`, error);
        delete this.loadPromises[name];
        throw error;
      }
    })();

    return this.loadPromises[name];
  }

  // Load multiple sounds
  async loadSounds(soundMap) {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      this.init();
      
      const loadPromises = Object.entries(soundMap).map(([name, url]) => 
        this.loadSound(name, url)
      );
      
      await Promise.all(loadPromises);
      console.log('✅ All sounds loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load sounds:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Play sound dengan volume control
  playSound(name, volume = 0.3, options = {}) {
    if (!this.audioContext || !this.sounds[name]) {
      console.warn(`⚠️ Sound "${name}" not loaded or AudioContext not initialized`);
      return;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const pannerNode = this.audioContext.createStereoPanner ? 
        this.audioContext.createStereoPanner() : null;

      source.buffer = this.sounds[name];
      gainNode.gain.value = volume;

      if (pannerNode && options.pan !== undefined) {
        pannerNode.pan.value = options.pan;
      }

      source.connect(gainNode);
      if (pannerNode) {
        gainNode.connect(pannerNode);
        pannerNode.connect(this.audioContext.destination);
      } else {
        gainNode.connect(this.audioContext.destination);
      }

      source.start(0);
      
      const playId = Date.now() + Math.random();
      
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
        if (pannerNode) pannerNode.disconnect();
      };

      return {
        id: playId,
        source,
        stop: () => {
          try {
            source.stop();
            source.disconnect();
            gainNode.disconnect();
            if (pannerNode) pannerNode.disconnect();
          } catch (e) {
            // Ignore errors if already stopped
          }
        }
      };
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Play hover sound
  playHover(volume = 0.3) {
    return this.playSound('hover', volume);
  }

  // Play click sound
  playClick(volume = 0.3) {
    return this.playSound('click', volume);
  }

  // Preload semua sounds
  async preloadSounds() {
    const soundMap = {
      hover: hoverbtn,
      click: click
    };
    
    await this.loadSounds(soundMap);
  }

  // Resume AudioContext
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      console.log('✅ AudioContext resumed');
    }
  }

  // Suspend AudioContext
  suspend() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
      console.log('⏸️ AudioContext suspended');
    }
  }

  // Get status
  getStatus() {
    return {
      initialized: this.isInitialized,
      state: this.audioContext ? this.audioContext.state : 'not initialized',
      loadedSounds: Object.keys(this.sounds),
      totalSounds: Object.keys(this.sounds).length
    };
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export functions for easy use
export const preloadSounds = async () => {
  await soundManager.preloadSounds();
};

export const playHoverSound = (volume = 0.3) => {
  return soundManager.playHover(volume);
};

export const playClickSound = (volume = 0.3) => {
  return soundManager.playClick(volume);
};

export const resumeAudio = () => {
  soundManager.resume();
};

export const getAudioStatus = () => {
  return soundManager.getStatus();
};

export default soundManager;