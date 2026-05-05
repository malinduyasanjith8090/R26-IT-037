// hooks/useSound.ts
import { useEffect, useState } from 'react';
import SoundService from '../services/SoundService';

type SoundType = Parameters<typeof SoundService.playSound>[0];

export const useSound = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    initializeSound();

    // Cleanup on unmount
    return () => {
      // No cleanup method available on SoundService
    };
  }, []);

  const initializeSound = async () => {
    try {
      await SoundService.initialize();
      setIsInitialized(true);
      console.log('✅ Sound hook initialized');
      
      // Play welcome sound to test
      await SoundService.playSound('welcome' as SoundType, false);
    } catch (error) {
      console.error('Failed to initialize sound:', error);
      setIsInitialized(true);
    }
  };

  const playSound = async (type: string, withHaptics = true) => {
    if (!isInitialized) {
      console.log('Sound not initialized yet');
      return;
    }
    await SoundService.playSound(type as any, withHaptics);
  };

  const playCelebration = async () => {
    await SoundService.playCelebration();
  };

  const playStarEarned = async () => {
    await SoundService.playStarEarned();
  };

  const playCorrectAnswer = async () => {
    await SoundService.playCorrectAnswer();
  };

  const toggleSound = () => {
    const enabled = SoundService.toggleSound();
    setIsEnabled(enabled);
    return enabled;
  };

  return {
    playSound,
    playCelebration,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled,
    isInitialized,
  };
};