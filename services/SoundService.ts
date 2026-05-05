// services/SoundService.ts
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

class SoundService {
  private soundObjects: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      await this.loadSounds();
      this.isInitialized = true;
      console.log('✅ Sound service ready');
      
      // Test sound
      await this.playSound('click', false);
    } catch (error) {
      console.log('Sound service error:', error);
      this.isInitialized = true;
    }
  }

  private async loadSounds() {
    // Create a simple beep sound using Audio API
    // This is a workaround - for real sounds, you need actual files
    
    // For now, we'll rely on haptics and console log
    // You'll need to add actual sound files to assets/sounds/
    
    console.log('Loading sounds from assets...');
    console.log('Place your sound files in: assets/sounds/');
    console.log('Required files: correct.mp3, error.mp3, click.mp3, star.mp3, reward.mp3, clap.mp3, cheer.mp3');
  }

  async playSound(type: SoundType, withHaptics: boolean = true) {
    if (!this.isEnabled) return;
    
    // Play haptic feedback first
    if (withHaptics) {
      this.playHaptic(type);
    }
    
    // Try to play actual sound
    try {
      // Attempt to load sound from assets
      const soundFile = this.getSoundFile(type);
      if (soundFile) {
        const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
        await sound.playAsync();
        // Auto unload after playing
        setTimeout(() => sound.unloadAsync(), 2000);
      } else {
        // Fallback: Use console to indicate sound would play
        console.log(`🔊 Sound effect: ${type}`);
      }
    } catch (error) {
      console.log(`Could not play ${type} sound:`, error);
    }
  }

  private getSoundFile(type: SoundType) {
    // Map sound types to actual file paths
    // Place your MP3 files in assets/sounds/
    const soundMap: Record<SoundType, any> = {
      correct: require('../assets/sounds/correct.mp3'),
      error: require('../assets/sounds/error.mp3'),
      click: require('../assets/sounds/click.mp3'),
      star: require('../assets/sounds/star.mp3'),
      reward: require('../assets/sounds/reward.mp3'),
      clap: require('../assets/sounds/clap.mp3'),
      cheer: require('../assets/sounds/cheer.mp3'),
      success: require('../assets/sounds/success.mp3'),
      levelUp: require('../assets/sounds/levelup.mp3'),
      complete: require('../assets/sounds/complete.mp3'),
      wrong: require('../assets/sounds/wrong.mp3'),
    };
    
    try {
      return soundMap[type];
    } catch {
      return null;
    }
  }

  private playHaptic(type: SoundType) {
    try {
      switch (type) {
        case 'correct':
        case 'success':
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
    setTimeout(() => this.playSound('star', true), 200);
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

export default new SoundService();