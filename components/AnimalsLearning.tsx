// components/learning/AnimalsLearning.tsx (external Sinhala voice commands)
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../hooks/useSound';

const { width } = Dimensions.get('window');

interface AnimalLesson {
  id: string;
  name: string;
  nameKey: string;
  emoji: string;
  sound: string;
  funFact: string;
  color: string;
  habitat: string;
}

const animalsData: AnimalLesson[] = [
  { id: 'lion', name: 'Lion', nameKey: 'animal.lion', emoji: '🦁', sound: 'Roar!', funFact: 'Lions live in groups called prides', color: '#FFB74D', habitat: 'Savanna' },
  { id: 'elephant', name: 'Elephant', nameKey: 'animal.elephant', emoji: '🐘', sound: 'Trumpet!', funFact: 'Elephants are the largest land animals', color: '#90CAF9', habitat: 'Grasslands' },
  { id: 'monkey', name: 'Monkey', nameKey: 'animal.monkey', emoji: '🐒', sound: 'Ooh ooh ah ah!', funFact: 'Monkeys love to swing on trees', color: '#A1887F', habitat: 'Jungle' },
  { id: 'giraffe', name: 'Giraffe', nameKey: 'animal.giraffe', emoji: '🦒', sound: 'Hum!', funFact: 'Giraffes have very long necks', color: '#FFCC80', habitat: 'Savanna' },
  { id: 'panda', name: 'Panda', nameKey: 'animal.panda', emoji: '🐼', sound: 'Squeak!', funFact: 'Pandas eat bamboo all day', color: '#BDBDBD', habitat: 'Bamboo Forest' },
  { id: 'dolphin', name: 'Dolphin', nameKey: 'animal.dolphin', emoji: '🐬', sound: 'Click click!', funFact: 'Dolphins are very smart swimmers', color: '#81D4FA', habitat: 'Ocean' },
];

// ─── Sinhala external audio mapping ─────────────────────────────
// Add your own .mp3 files to assets/sounds/sinhala/
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../assets/sounds/sinhala/animalinstruction.mp3'),
  lion: require('../assets/sounds/sinhala/lion.mp3'),
  elephant: require('../assets/sounds/sinhala/elephant.mp3'),
  monkey: require('../assets/sounds/sinhala/monkey.mp3'),
  giraffe: require('../assets/sounds/sinhala/giraffe.mp3'),
  panda: require('../assets/sounds/sinhala/panda.mp3'),
  dolphin: require('../assets/sounds/sinhala/dolphin.mp3'),
};

export default function AnimalsLearning({ onBack, onProgress }: any) {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const {
    playSound,
    playCelebration,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled,
  } = useSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);
  const pendingInstruction = useRef(false);

  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});

  const currentAnimal = animalsData[currentIndex];

  // Load all Sinhala audio files and set soundsLoaded
  useEffect(() => {
    let isMounted = true;

    const loadSounds = async () => {
      const sounds: { [key: string]: Audio.Sound | null } = {};
      for (const key of Object.keys(sinhalaAudioMap)) {
        try {
          const { sound } = await Audio.Sound.createAsync(sinhalaAudioMap[key]);
          sounds[key] = sound;
        } catch (error) {
          console.warn(`Failed to load Sinhala audio: ${key}`, error);
          sounds[key] = null;
        }
      }
      if (isMounted) {
        sinhalaSounds.current = sounds;
        setSoundsLoaded(true);
      }
    };

    loadSounds();

    return () => {
      isMounted = false;
      Object.values(sinhalaSounds.current).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
    };
  }, []);

  // Speak or play external audio
  const speak = async (text: string, audioKey?: string) => {
    if (!soundEnabled) return;

    if (language === 'si' && audioKey && sinhalaSounds.current[audioKey]) {
      try {
        const sound = sinhalaSounds.current[audioKey];
        if (sound) await sound.replayAsync();
        return;
      } catch (error) {
        console.warn('Sinhala audio playback failed, falling back to TTS:', error);
      }
    }

    try {
      Speech.stop();
      Speech.speak(text, {
        language: language === 'si' ? 'si-LK' : 'en-US',
        pitch: language === 'si' ? 1.15 : 1.05,
        rate: language === 'si' ? 0.75 : 0.85,
        onError: (error) => {
          console.warn('TTS error:', error);
          if (language === 'si') {
            Speech.speak(text, { language: 'en-US', pitch: 1.05, rate: 0.85 });
          }
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => Speech.stop();
  }, []);

  // ✅ MAIN INSTRUCTION EFFECT – waits for soundsLoaded if needed
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      const instructionText = language === 'si'
        ? t('animal.instruction') || 'ආයුබෝවන්! අපි අද සතුන් ගැන ඉගෙන ගමු. පහතින් පෙන්නන සත්වයා තෝරන්න.'
        : t('animal.instruction') || 'Hello! Let\'s learn about animals today. Choose the animal shown below.';

      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }

      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentAnimal.nameKey), currentAnimal.id);
      }, 4000); // Wait for instruction to finish
      return () => clearTimeout(timer);
    }

    // On animal change
    speak(t(currentAnimal.nameKey), currentAnimal.id);
  }, [currentIndex, language]);

  // ✅ PENDING INSTRUCTION EFFECT – fires when sounds become ready
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const instructionText = language === 'si'
        ? t('animal.instruction') || 'ආයුබෝවන්! අපි අද සතුන් ගැන ඉගෙන ගමු. පහතින් පෙන්නන සත්වයා තෝරන්න.'
        : t('animal.instruction') || 'Hello! Let\'s learn about animals today. Choose the animal shown below.';
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentAnimal.nameKey), currentAnimal.id);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [soundsLoaded]);

  const getRandomRewardMessage = () => {
    const messages = [
      '🌟 Wild! 🌟',
      '🎉 Awesome! 🎉',
      '⭐ Animal Expert! ⭐',
      '🎈 Fantastic! 🎈',
      '🏆 You\'re a Natural! 🏆',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === t(currentAnimal.nameKey);
    setIsCorrect(correct);

    if (correct) {
      await playCorrectAnswer();
      const newScore = score + 10;
      setScore(newScore);
      setRewardMessage(getRandomRewardMessage());
      setShowRewardModal(true);
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(async () => {
        setShowRewardModal(false);
        setSelectedAnswer(null);
        setIsCorrect(false);

        if (currentIndex < animalsData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / animalsData.length) * 100);
          await playSound('click', false);
        } else {
          await playCelebration();
          setShowRewardModal(true);
          setRewardMessage('🎉 Complete! You mastered all animals! 🎉');
        }
      }, 2000);
    } else {
      await playSound('error', true);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  const getOptions = () => {
    const currentName = t(currentAnimal.nameKey);
    const options = [currentName];
    const otherNames = animalsData
      .filter(a => a.nameKey !== currentAnimal.nameKey)
      .map(a => t(a.nameKey))
      .slice(0, 3);
    options.push(...otherNames);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  const handleToggleSound = async () => {
    await playSound('click', false);
    toggleSound();
  };

  const handleCardPress = async () => {
    await playSound('click', false);
  };

  const handlePlayAnimalSound = async () => {
    await playSound('click', false);
    speak(currentAnimal.sound);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.soundButton} onPress={handleToggleSound}>
          <MaterialIcons
            name={soundEnabled ? "volume-up" : "volume-off"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / animalsData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {currentIndex + 1} of {animalsData.length} Animals
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Animal Card */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
            <View style={[styles.animalCard, { backgroundColor: currentAnimal.color + '20' }]}>
              <Text style={styles.animalEmoji}>{currentAnimal.emoji}</Text>
              <Text style={[styles.animalName, { color: colors.text }]}>
                {t(currentAnimal.nameKey)}
              </Text>
              <TouchableOpacity
                style={[styles.soundBadge, { backgroundColor: currentAnimal.color }]}
                onPress={handlePlayAnimalSound}
              >
                <MaterialIcons name="volume-up" size={20} color="#FFF" />
                <Text style={styles.soundText}>{currentAnimal.sound}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Fun Fact */}
          <View style={[styles.factContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="lightbulb" size={24} color={colors.accentYellow} />
            <Text style={[styles.factText, { color: colors.text }]}>
              Did you know? {currentAnimal.funFact}
            </Text>
          </View>

          {/* Habitat Info */}
          <View style={[styles.habitatContainer, { backgroundColor: colors.primaryLight + '20' }]}>
            <MaterialIcons name="location-on" size={20} color={currentAnimal.color} />
            <Text style={[styles.habitatText, { color: colors.text }]}>
              Habitat: {currentAnimal.habitat}
            </Text>
          </View>

          {/* Animal Action */}
          <View style={[styles.actionContainer, { backgroundColor: colors.primaryLight + '30' }]}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>🦁 Animal Action! 🦁</Text>
            <Text style={[styles.actionText, { color: colors.textLight }]}>
              Can you make the sound? {currentAnimal.sound}
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 What animal is this? 🤔
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {getOptions().map((option, idx) => {
              const animal = animalsData.find(a => t(a.nameKey) === option);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: selectedAnswer === option
                        ? (isCorrect ? colors.success : colors.error)
                        : colors.primaryLight,
                      borderWidth: 3,
                    }
                  ]}
                  onPress={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={styles.optionEmoji}>
                    {animal?.emoji || '🐾'}
                  </Text>
                  <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                  {selectedAnswer === option && (
                    <MaterialIcons
                      name={isCorrect ? "check-circle" : "cancel"}
                      size={28}
                      color={isCorrect ? colors.success : colors.error}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback */}
          {selectedAnswer && !isCorrect && (
            <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
              <MaterialIcons name="sentiment-dissatisfied" size={24} color={colors.error} />
              <Text style={[styles.feedbackText, { color: colors.error }]}>
                ✗ Try again! The correct animal is {t(currentAnimal.nameKey)}! ✗
              </Text>
            </View>
          )}

          {/* Encouragement Message */}
          {score > 0 && score % 50 === 0 && score !== 0 && (
            <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="emoji-events" size={24} color={colors.success} />
              <Text style={[styles.encouragementText, { color: colors.success }]}>
                🎉 Great progress! You're becoming an animal expert! 🎉
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Reward Modal */}
      <Modal
        visible={showRewardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🦁</Text>
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage.includes('Complete') ? (
                <>
                  <Text style={styles.rewardMessage}>🎉 You're an animal expert! 🎉</Text>
                  <TouchableOpacity
                    style={[styles.rewardButton, { backgroundColor: colors.primary }]}
                    onPress={async () => {
                      setShowRewardModal(false);
                      await playSound('goodbye', false);
                      if (onBack) onBack();
                    }}
                  >
                    <Text style={styles.rewardButtonText}>Back to Menu</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.rewardMessage}>+10 points for {t(currentAnimal.nameKey)}!</Text>
                  <View style={styles.starContainer}>
                    {[...Array(3)].map((_, i) => (
                      <Text key={i} style={styles.star}>⭐</Text>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowRewardModal(false)}
                  >
                    <Text style={styles.continueButtonText}>Continue →</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.xl
  },
  backButton: { padding: Spacing.sm },
  soundButton: { padding: Spacing.sm },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs
  },
  scoreText: { fontWeight: 'bold', fontSize: 18 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.xs },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },
  content: { alignItems: 'center', padding: Spacing.lg },
  animalCard: {
    width: width - 80,
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg
  },
  animalEmoji: { fontSize: 80, marginBottom: Spacing.md },
  animalName: { fontSize: 28, fontWeight: 'bold' },
  soundBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center'
  },
  soundText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  factContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    width: '100%'
  },
  factText: { flex: 1, fontSize: 14, lineHeight: 20 },
  habitatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center'
  },
  habitatText: { fontSize: 14, fontWeight: '500' },
  actionContainer: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center'
  },
  actionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  actionText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  questionContainer: { marginVertical: Spacing.md },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  optionsContainer: { width: '100%', gap: Spacing.md, marginBottom: Spacing.md },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md
  },
  optionEmoji: { fontSize: 32 },
  optionText: { flex: 1, fontSize: 18, fontWeight: '600' },
  feedbackContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center'
  },
  feedbackText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  encouragementContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center'
  },
  encouragementText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rewardContent: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minWidth: 280
  },
  rewardEmoji: { fontSize: 60, textAlign: 'center' },
  rewardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: Spacing.md,
    textAlign: 'center'
  },
  rewardMessage: {
    fontSize: 18,
    color: '#333',
    marginTop: Spacing.sm,
    textAlign: 'center'
  },
  starContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  star: { fontSize: 30 },
  rewardButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md
  },
  rewardButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  continueButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 150,
    alignItems: 'center',
  },
  continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});