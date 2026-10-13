
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
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
  private isEnabled = true;
  private isInitialized = false;
  private activePlayers = new Set<ReturnType<typeof createAudioPlayer>>();

  async initialize() {
    if (this.isInitialized) return;

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
    } catch (error) {
      console.log('Audio initialization error:', error);
    } finally {
      this.isInitialized = true;
    }
  }

  private getSoundFile(type: SoundType): number | null {
    const soundMap: Partial<Record<SoundType, number>> = {
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

    return soundMap[type] ?? null;
  }

  async playSound(type: SoundType, withHaptics = true) {
    if (!this.isEnabled) return;

    if (withHaptics) {
      void this.playHaptic(type);
    }

    try {
      await this.initialize();

      const soundFile = this.getSoundFile(type);

      if (soundFile === null) {
        console.log(`Sound effect: ${type}`);
        return;
      }

      const player = createAudioPlayer(soundFile);
      this.activePlayers.add(player);

      player.addListener('playbackStatusUpdate', status => {
        if (status.didJustFinish) {
          player.remove();
          this.activePlayers.delete(player);
        }
      });

      player.play();
    } catch (error) {
      console.log(`Could not play ${type} sound:`, error);
    }
  }

  private async playHaptic(type: SoundType) {
    try {
      switch (type) {
        case 'correct':
        case 'success':
        case 'reward':
        case 'star':
        case 'levelUp':
        case 'complete':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          break;

        case 'error':
        case 'wrong':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          break;

        case 'click':
        case 'clap':
        case 'cheer':
          await Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Light
          );
          break;
      }
    } catch (error) {
      console.log('Haptic feedback unavailable:', error);
    }
  }

  async playCelebration() {
    await this.playSound('reward', false);
    setTimeout(() => void this.playSound('cheer', false), 300);
    setTimeout(() => void this.playSound('clap', false), 600);
  }

  async playStarEarned() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => void this.playSound('star', false), i * 200);
    }
  }

  async playCorrectAnswer() {
    await this.playSound('correct', true);
    setTimeout(() => void this.playSound('star', true), 200);
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

export default new SoundService();
