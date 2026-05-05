// services/SoundServiceWithFiles.ts
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export type SoundType = 
  | 'success' 
  | 'error' 
  | 'click' 
  | 'reward' 
  | 'star' 
  | 'clap' 
  | 'cheer' 
  | 'levelUp'
  | 'complete'
  | 'correct'
  | 'wrong';

class SoundServiceWithFiles {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isLoaded: boolean = false;

  async initialize() {
    if (this.isLoaded) return;
    
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await this.loadSounds();
      this.isLoaded = true;
      console.log('✅ Sound service initialized');
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
      // Fallback to haptics only
      this.isLoaded = true;
    }
  }

  private async loadSounds() {
    // You need to add actual sound files to your assets/sounds folder
    // Download free sounds from: https://pixabay.com/sound-effects/
    
    const soundFiles = [
      { type: 'success' as SoundType, file: require('../../assets/sounds/success.mp3') },
      { type: 'error' as SoundType, file: require('../../assets/sounds/error.mp3') },
      { type: 'click' as SoundType, file: require('../../assets/sounds/click.mp3') },
      { type: 'reward' as SoundType, file: require('../../assets/sounds/reward.mp3') },
      { type: 'star' as SoundType, file: require('../../assets/sounds/star.mp3') },
      { type: 'clap' as SoundType, file: require('../../assets/sounds/clap.mp3') },
      { type: 'cheer' as SoundType, file: require('../../assets/sounds/cheer.mp3') },
      { type: 'levelUp' as SoundType, file: require('../../assets/sounds/levelup.mp3') },
      { type: 'complete' as SoundType, file: require('../../assets/sounds/complete.mp3') },
      { type: 'correct' as SoundType, file: require('../../assets/sounds/correct.mp3') },
      { type: 'wrong' as SoundType, file: require('../../assets/sounds/wrong.mp3') },
    ];

    for (const { type, file } of soundFiles) {
      try {
        const { sound } = await Audio.Sound.createAsync(file);
        this.sounds.set(type, sound);
      } catch (error) {
        console.warn(`Failed to load sound ${type}, using fallback:`, error);
      }
    }
  }

  async playSound(type: SoundType, withHaptics: boolean = true) {
    if (!this.isEnabled) return;
    
    if (withHaptics) {
      this.playHaptic(type);
    }

    const sound = this.sounds.get(type);
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        try {
          await sound.playFromPositionAsync(0);
        } catch (e) {
          console.error(`Failed to play sound ${type}:`, e);
        }
      }
    } else {
      // Fallback to beep
      this.playFallbackBeep(type);
    }
  }

  private playFallbackBeep(type: SoundType) {
    // Simple beep using Audio API
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      let frequency = 660;
      let duration = 0.1;
      
      switch (type) {
        case 'success':
        case 'correct':
          frequency = 880;
          duration = 0.2;
          break;
        case 'error':
        case 'wrong':
          frequency = 440;
          duration = 0.3;
          break;
        case 'star':
          frequency = 1046;
          duration = 0.15;
          break;
        default:
          frequency = 660;
          duration = 0.1;
      }
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  }

  private playHaptic(type: SoundType) {
    try {
      switch (type) {
        case 'success':
        case 'correct':
        case 'reward':
        case 'star':
        case 'levelUp':
        case 'complete':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
        case 'wrong':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'click':
        case 'clap':
        case 'cheer':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      // Haptics not available
    }
  }

  async playCelebration() {
    await this.playSound('reward', false);
    setTimeout(() => this.playSound('cheer', false), 300);
    setTimeout(() => this.playSound('clap', false), 600);
  }

  async playStarEarned() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playSound('star', false), i * 200);
    }
  }

  async playCorrectAnswer() {
    await this.playSound('correct', true);
    setTimeout(() => this.playSound('star', false), 200);
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  async unloadSounds() {
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
    this.sounds.clear();
    this.isLoaded = false;
  }
}

export default new SoundServiceWithFiles();