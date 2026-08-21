// components/learning/FruitsLearning.tsx (with external Sinhala voice commands)
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

interface FruitLesson {
  id: string;
  emoji: string;
  color: string;
  nameKey: string;
  tasteKey: string;
  benefitKey: string;
}

const fruitsData: FruitLesson[] = [
  { id: 'apple', emoji: '🍎', color: '#FF3B30', nameKey: 'fruit.apple', tasteKey: 'fruit.apple.taste', benefitKey: 'fruit.apple.benefit' },
  { id: 'banana', emoji: '🍌', color: '#FFCC00', nameKey: 'fruit.banana', tasteKey: 'fruit.banana.taste', benefitKey: 'fruit.banana.benefit' },
  { id: 'orange', emoji: '🍊', color: '#FF9500', nameKey: 'fruit.orange', tasteKey: 'fruit.orange.taste', benefitKey: 'fruit.orange.benefit' },
  { id: 'strawberry', emoji: '🍓', color: '#FF3B30', nameKey: 'fruit.strawberry', tasteKey: 'fruit.strawberry.taste', benefitKey: 'fruit.strawberry.benefit' },
  { id: 'grape', emoji: '🍇', color: '#5856D6', nameKey: 'fruit.grape', tasteKey: 'fruit.grape.taste', benefitKey: 'fruit.grape.benefit' },
  { id: 'watermelon', emoji: '🍉', color: '#34C759', nameKey: 'fruit.watermelon', tasteKey: 'fruit.watermelon.taste', benefitKey: 'fruit.watermelon.benefit' },
  { id: 'pineapple', emoji: '🍍', color: '#FF9500', nameKey: 'fruit.pineapple', tasteKey: 'fruit.pineapple.taste', benefitKey: 'fruit.pineapple.benefit' },
  { id: 'mango', emoji: '🥭', color: '#FF9500', nameKey: 'fruit.mango', tasteKey: 'fruit.mango.taste', benefitKey: 'fruit.mango.benefit' },
  { id: 'peach', emoji: '🍑', color: '#FF6B6B', nameKey: 'fruit.peach', tasteKey: 'fruit.peach.taste', benefitKey: 'fruit.peach.benefit' },
  { id: 'cherry', emoji: '🍒', color: '#FF3B30', nameKey: 'fruit.cherry', tasteKey: 'fruit.cherry.taste', benefitKey: 'fruit.cherry.benefit' },
];

// ─── Sinhala external audio mapping ─────────────────────────────
// Add your own .mp3 files to assets/sounds/sinhala/
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../assets/sounds/sinhala/fruitinstruction.mp3'),
  apple: require('../assets/sounds/sinhala/apple.mp3'),
  banana: require('../assets/sounds/sinhala/banana.mp3'),
  orange: require('../assets/sounds/sinhala/fruitorange.mp3'),
  strawberry: require('../assets/sounds/sinhala/strawberry.mp3'),
  grape: require('../assets/sounds/sinhala/grape.mp3'),
  watermelon: require('../assets/sounds/sinhala/watermelon.mp3'),
  pineapple: require('../assets/sounds/sinhala/pineapple.mp3'),
  mango: require('../assets/sounds/sinhala/mango.mp3'),
  peach: require('../assets/sounds/sinhala/peach.mp3'),
};

export default function FruitsLearning({ onBack, onProgress }: any) {
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
  const [showNutritionTip, setShowNutritionTip] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);
  const pendingInstruction = useRef(false);

  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});

  const currentFruit = fruitsData[currentIndex];

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
        ? t('fruit.instruction') || 'ආයුබෝවන්! අපි අද පලතුරු ගැන ඉගෙන ගමු. පහතින් පෙන්නන පලතුර තෝරන්න.'
        : t('fruit.instruction') || 'Hello! Let\'s learn about fruits today. Choose the fruit shown below.';

      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }

      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentFruit.nameKey), currentFruit.id);
      }, 4000); // Wait for instruction to finish
      return () => clearTimeout(timer);
    }

    // On fruit change
    speak(t(currentFruit.nameKey), currentFruit.id);
  }, [currentIndex, language]);

  // ✅ PENDING INSTRUCTION EFFECT – fires when sounds become ready
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const instructionText = language === 'si'
        ? t('fruit.instruction') || 'ආයුබෝවන්! අපි අද පලතුරු ගැන ඉගෙන ගමු. පහතින් පෙන්නන පලතුර තෝරන්න.'
        : t('fruit.instruction') || 'Hello! Let\'s learn about fruits today. Choose the fruit shown below.';
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentFruit.nameKey), currentFruit.id);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [soundsLoaded]);

  const getRandomRewardMessageKey = () => {
    const messageKeys = [
      'reward.yummy',
      'reward.fruitMaster',
      'reward.sweetJob',
      'reward.delicious',
      'reward.berryGood',
    ];
    return messageKeys[Math.floor(Math.random() * messageKeys.length)];
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === t(currentFruit.nameKey);
    setIsCorrect(correct);

    if (correct) {
      await playCorrectAnswer();

      const newScore = score + 10;
      setScore(newScore);
      setRewardMessage(t(getRandomRewardMessageKey()));
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

        if (currentIndex < fruitsData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / fruitsData.length) * 100);
          await playSound('click', false);
        } else {
          await playCelebration();
          setShowRewardModal(true);
          setRewardMessage(t('reward.completeAllFruits'));
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
    const currentName = t(currentFruit.nameKey);
    const options = [currentName];
    const otherNames = fruitsData
      .filter(f => f.id !== currentFruit.id)
      .map(f => t(f.nameKey))
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

  const showNutritionBenefit = async () => {
    setShowNutritionTip(true);
    await playSound('reward', false);
    setTimeout(() => setShowNutritionTip(false), 3000);
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
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / fruitsData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {t('progress.of', { current: currentIndex + 1, total: fruitsData.length, item: t('fruits') })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Fruit Card */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
            <View style={[styles.fruitCard, { backgroundColor: currentFruit.color + '20' }]}>
              <Text style={styles.fruitEmoji}>{currentFruit.emoji}</Text>
              <Text style={[styles.fruitName, { color: colors.text }]}>{t(currentFruit.nameKey)}</Text>
              <TouchableOpacity
                style={[styles.tasteBadge, { backgroundColor: currentFruit.color }]}
                onPress={showNutritionBenefit}
              >
                <MaterialIcons name="info" size={16} color="#FFF" />
                <Text style={styles.tasteText}>{t(currentFruit.tasteKey)}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Health Benefit */}
          <View style={[styles.benefitContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="favorite" size={24} color={colors.success} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              {t(currentFruit.benefitKey)}
            </Text>
          </View>

          {/* Fun Nutrition Fact */}
          <View style={[styles.nutritionContainer, { backgroundColor: colors.primaryLight + '30' }]}>
            <MaterialIcons name="restaurant" size={20} color={currentFruit.color} />
            <Text style={[styles.nutritionText, { color: colors.text }]}>
              {t('fruit.nutritionFact', { fruit: t(currentFruit.nameKey), taste: t(currentFruit.tasteKey).toLowerCase() })}
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 {t('fruit.whatFruitIsThis')} 🤔
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {getOptions().map((option, idx) => {
              const fruitEntry = fruitsData.find(f => t(f.nameKey) === option);
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
                    {fruitEntry?.emoji || '🍎'}
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

          {/* Feedback for wrong answer */}
          {selectedAnswer && !isCorrect && (
            <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
              <MaterialIcons name="sentiment-dissatisfied" size={24} color={colors.error} />
              <Text style={[styles.feedbackText, { color: colors.error }]}>
                {t('fruit.tryAgainCorrectIs', { fruit: t(currentFruit.nameKey) })}
              </Text>
            </View>
          )}

          {/* Encouragement Message */}
          {score > 0 && score % 50 === 0 && score !== 0 && (
            <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="emoji-events" size={24} color={colors.success} />
              <Text style={[styles.encouragementText, { color: colors.success }]}>
                🎉 {t('reward.greatProgressFruit')} 🎉
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Nutrition Tip Notification */}
      {showNutritionTip && (
        <Animated.View style={[styles.tipNotification, { backgroundColor: currentFruit.color }]}>
          <MaterialIcons name="favorite" size={20} color="#FFF" />
          <Text style={styles.tipNotificationText}>
            {t(currentFruit.benefitKey)}
          </Text>
        </Animated.View>
      )}

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
              <Text style={styles.rewardEmoji}>🍎</Text>
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage === t('reward.completeAllFruits') ? (
                <>
                  <Text style={styles.rewardMessage}>{t('reward.youAreFruitExpert')}</Text>
                  <TouchableOpacity
                    style={[styles.rewardButton, { backgroundColor: colors.primary }]}
                    onPress={async () => {
                      setShowRewardModal(false);
                      await playSound('goodbye', false);
                      if (onBack) onBack();
                    }}
                  >
                    <Text style={styles.rewardButtonText}>{t('common.backToMenu')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.rewardMessage}>
                    {t('reward.pointsForFruit', { points: 10, fruit: t(currentFruit.nameKey) })}
                  </Text>
                  <View style={styles.starContainer}>
                    {[...Array(3)].map((_, i) => (
                      <Text key={i} style={styles.star}>⭐</Text>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowRewardModal(false)}
                  >
                    <Text style={styles.continueButtonText}>{t('common.continue')} →</Text>
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
  scrollContent: { paddingBottom: Spacing.xxl || 40 },
  content: { alignItems: 'center', padding: Spacing.lg },
  fruitCard: {
    width: width - 80,
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg
  },
  fruitEmoji: { fontSize: 80, marginBottom: Spacing.md },
  fruitName: { fontSize: 28, fontWeight: 'bold' },
  tasteBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center'
  },
  tasteText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    width: '100%'
  },
  benefitText: { flex: 1, fontSize: 14, lineHeight: 20 },
  nutritionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center'
  },
  nutritionText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
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
  tipNotification: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: width - 40,
  },
  tipNotificationText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
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