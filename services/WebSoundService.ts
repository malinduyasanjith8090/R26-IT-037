// services/WebSoundService.ts
class WebSoundService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (typeof window !== 'undefined' && !this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        await this.audioContext.resume();
        this.isInitialized = true;
        console.log('✅ Web Sound Service initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize web audio:', error);
    }
  }

  private createOscillator(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Fade in and out for softer sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration);

    oscillator.start();
    oscillator.stop(now + duration);
  }

  playSuccess() {
    this.createOscillator(880, 0.2);
    setTimeout(() => this.createOscillator(1177, 0.2), 200);
  }

  playError() {
    this.createOscillator(440, 0.3, 'square');
  }

  playClick() {
    this.createOscillator(660, 0.05);
  }

  playReward() {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((note, i) => {
      setTimeout(() => this.createOscillator(note, 0.2), i * 150);
    });
  }

  playStar() {
    this.createOscillator(1046.5, 0.15);
    setTimeout(() => this.createOscillator(1318.52, 0.15), 100);
    setTimeout(() => this.createOscillator(1567.98, 0.15), 200);
  }

  playClap() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createOscillator(100, 0.05, 'sawtooth');
      }, i * 100);
    }
  }

  playCheer() {
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 987.77];
    notes.forEach((note, i) => {
      setTimeout(() => this.createOscillator(note, 0.15), i * 120);
    });
  }

  playLevelComplete() {
    this.playCheer();
    setTimeout(() => this.playClap(), 500);
  }

  playComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((note, i) => {
      setTimeout(() => this.createOscillator(note, 0.3), i * 200);
    });
  }

  playCorrect() {
    this.createOscillator(880, 0.2);
    setTimeout(() => this.createOscillator(1046.5, 0.2), 150);
  }

  playWrong() {
    this.createOscillator(440, 0.3, 'sawtooth');
    setTimeout(() => this.createOscillator(349.23, 0.3, 'sawtooth'), 200);
  }

  playWelcome() {
    const notes = [523.25, 659.25, 783.99, 880];
    notes.forEach((note, i) => {
      setTimeout(() => this.createOscillator(note, 0.25), i * 150);
    });
  }

  playGoodbye() {
    const notes = [880, 783.99, 659.25, 523.25];
    notes.forEach((note, i) => {
      setTimeout(() => this.createOscillator(note, 0.25), i * 150);
    });
  }

  async playCelebration() {
    this.playCheer();
    setTimeout(() => this.playClap(), 300);
    setTimeout(() => this.playStar(), 600);
  }

  async playStarEarned() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playStar(), i * 200);
    }
  }

  async playCorrectAnswer() {
    this.playCorrect();
    setTimeout(() => this.playStar(), 200);
  }

  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.resumeAudioContext();
    }
    return this.isEnabled;
  }
}

export default new WebSoundService();