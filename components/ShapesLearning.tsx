// components/learning/ShapesLearning.tsx (with external Sinhala voice commands)
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
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { BorderRadius, Spacing } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../hooks/useSound';

const { width } = Dimensions.get('window');

interface ShapeLesson {
  id: string;
  nameKey: string;
  shape: React.ReactNode;
  color: string;
  descKey: string;
  exampleKeys: string[];
  corners: number;
}

const shapesData: ShapeLesson[] = [
  {
    id: 'circle',
    nameKey: 'shape.circle',
    shape: <Circle cx="100" cy="100" r="60" fill="#FF6B6B" />,
    color: '#FF6B6B',
    descKey: 'shape.circle.desc',
    exampleKeys: ['shape.circle.ex1', 'shape.circle.ex2', 'shape.circle.ex3', 'shape.circle.ex4'],
    corners: 0
  },
  {
    id: 'square',
    nameKey: 'shape.square',
    shape: <Rect x="40" y="40" width="120" height="120" fill="#4ECDC4" />,
    color: '#4ECDC4',
    descKey: 'shape.square.desc',
    exampleKeys: ['shape.square.ex1', 'shape.square.ex2', 'shape.square.ex3', 'shape.square.ex4'],
    corners: 4
  },
  {
    id: 'triangle',
    nameKey: 'shape.triangle',
    shape: <Polygon points="100,30 30,170 170,170" fill="#FFD166" />,
    color: '#FFD166',
    descKey: 'shape.triangle.desc',
    exampleKeys: ['shape.triangle.ex1', 'shape.triangle.ex2', 'shape.triangle.ex3', 'shape.triangle.ex4'],
    corners: 3
  },
  {
    id: 'rectangle',
    nameKey: 'shape.rectangle',
    shape: <Rect x="40" y="60" width="120" height="80" fill="#06D6A0" />,
    color: '#06D6A0',
    descKey: 'shape.rectangle.desc',
    exampleKeys: ['shape.rectangle.ex1', 'shape.rectangle.ex2', 'shape.rectangle.ex3', 'shape.rectangle.ex4'],
    corners: 4
  },
  {
    id: 'oval',
    nameKey: 'shape.oval',
    shape: <Ellipse cx="100" cy="100" rx="80" ry="40" fill="#118AB2" />,
    color: '#118AB2',
    descKey: 'shape.oval.desc',
    exampleKeys: ['shape.oval.ex1', 'shape.oval.ex2', 'shape.oval.ex3', 'shape.oval.ex4'],
    corners: 0
  },
  {
    id: 'heart',
    nameKey: 'shape.heart',
    shape: <Path d="M 100 40 C 100 20, 60 20, 60 50 C 60 80, 100 120, 100 140 C 100 120, 140 80, 140 50 C 140 20, 100 20, 100 40 Z" fill="#EF476F" />,
    color: '#EF476F',
    descKey: 'shape.heart.desc',
    exampleKeys: ['shape.heart.ex1', 'shape.heart.ex2', 'shape.heart.ex3', 'shape.heart.ex4'],
    corners: 0
  },
  {
    id: 'star',
    nameKey: 'shape.star',
    shape: <Path d="M 100 20 L 120 70 L 180 70 L 130 100 L 150 160 L 100 130 L 50 160 L 70 100 L 20 70 L 80 70 Z" fill="#FFD166" />,
    color: '#FFD166',
    descKey: 'shape.star.desc',
    exampleKeys: ['shape.star.ex1', 'shape.star.ex2', 'shape.star.ex3', 'shape.star.ex4'],
    corners: 5
  },
];

// ─── Sinhala external audio mapping ─────────────────────────────
// Add your own .mp3 files to assets/sounds/sinhala/
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../assets/sounds/sinhala/shapesinstruction.mp3'),
  circle: require('../assets/sounds/sinhala/circle.mp3'),
  square: require('../assets/sounds/sinhala/square.mp3'),
  triangle: require('../assets/sounds/sinhala/triangle.mp3'),
  rectangle: require('../assets/sounds/sinhala/rectangle.mp3'),
  oval: require('../assets/sounds/sinhala/oval.mp3'),
  heart: require('../assets/sounds/sinhala/heart.mp3'),
  star: require('../assets/sounds/sinhala/star.mp3'),
};

export default function ShapesLearning({ onBack, onProgress }: any) {
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
  const [showActivityPrompt, setShowActivityPrompt] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);
  const pendingInstruction = useRef(false);

  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});

  const currentShape = shapesData[currentIndex];

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
        ? t('shape.instruction') || 'ආයුබෝවන්! අපි අද හැඩතල ගැන ඉගෙන ගමු. පහතින් පෙන්නන හැඩය තෝරන්න.'
        : t('shape.instruction') || 'Hello! Let\'s learn about shapes today. Choose the shape shown below.';

      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }

      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentShape.nameKey), currentShape.id);
      }, 4000); // Wait for instruction to finish
      return () => clearTimeout(timer);
    }

    // On shape change
    speak(t(currentShape.nameKey), currentShape.id);
  }, [currentIndex, language]);

  // ✅ PENDING INSTRUCTION EFFECT – fires when sounds become ready
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const instructionText = language === 'si'
        ? t('shape.instruction') || 'ආයුබෝවන්! අපි අද හැඩතල ගැන ඉගෙන ගමු. පහතින් පෙන්නන හැඩය තෝරන්න.'
        : t('shape.instruction') || 'Hello! Let\'s learn about shapes today. Choose the shape shown below.';
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentShape.nameKey), currentShape.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [soundsLoaded]);

  const getRandomRewardMessageKey = () => {
    const messageKeys = [
      'reward.shapeTastic',
      'reward.perfectShape',
      'reward.shapeMaster',
      'reward.wellRounded',
      'reward.sharpSkills',
    ];
    return messageKeys[Math.floor(Math.random() * messageKeys.length)];
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === t(currentShape.nameKey);
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

        if (currentIndex < shapesData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / shapesData.length) * 100);
          await playSound('click', false);
        } else {
          await playCelebration();
          setShowRewardModal(true);
          setRewardMessage(t('reward.completeAllShapes'));
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
    const currentName = t(currentShape.nameKey);
    const options = [currentName];
    const otherNames = shapesData
      .filter(s => s.id !== currentShape.id)
      .map(s => t(s.nameKey))
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

  const showFunActivity = async () => {
    setShowActivityPrompt(true);
    await playSound('reward', false);
    setTimeout(() => setShowActivityPrompt(false), 3000);
  };

  const getDifficultyLevel = () => {
    if (currentShape.corners === 0) return t('shape.difficulty.easy');
    if (currentShape.corners <= 4) return t('shape.difficulty.medium');
    return t('shape.difficulty.challenge');
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
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / shapesData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {t('progress.of', { current: currentIndex + 1, total: shapesData.length, item: t('shapes') })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Shape Card */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
            <View style={[styles.shapeCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.shapeSvgContainer, { backgroundColor: currentShape.color + '20' }]}>
                <Svg width={200} height={200} viewBox="0 0 200 200">
                  {currentShape.shape}
                </Svg>
              </View>
              <Text style={[styles.shapeName, { color: currentShape.color }]}>{t(currentShape.nameKey)}</Text>
              <TouchableOpacity
                style={[styles.cornerBadge, { backgroundColor: currentShape.color }]}
                onPress={showFunActivity}
              >
                <MaterialIcons name="stars" size={16} color="#FFF" />
                <Text style={styles.cornerText}>
                  {t('shape.corners', { count: currentShape.corners })} • {getDifficultyLevel()}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Shape Description */}
          <View style={[styles.descriptionContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="info" size={24} color={colors.primary} />
            <Text style={[styles.descriptionText, { color: colors.text }]}>{t(currentShape.descKey)}</Text>
          </View>

          {/* Examples */}
          <View style={[styles.examplesContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.examplesTitle, { color: colors.text }]}>
              {t('shape.thingsThatAre', { shape: t(currentShape.nameKey) })}:
            </Text>
            <View style={styles.examplesList}>
              {currentShape.exampleKeys.map((exKey, idx) => (
                <View key={idx} style={[styles.exampleItem, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.exampleText, { color: colors.text }]}>{t(exKey)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 {t('shape.whatShapeIsThis')} 🤔
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {getOptions().map((option, idx) => {
              const shapeEntry = shapesData.find(s => t(s.nameKey) === option);
              const optionColor = shapeEntry?.color || colors.primary;
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
                  <View style={[styles.optionColor, { backgroundColor: optionColor }]} />
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
                {t('shape.tryAgainCorrectIs', { shape: t(currentShape.nameKey) })}
              </Text>
            </View>
          )}

          {/* Encouragement */}
          {score > 0 && score % 50 === 0 && score !== 0 && (
            <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="emoji-events" size={24} color={colors.success} />
              <Text style={[styles.encouragementText, { color: colors.success }]}>
                🎉 {t('reward.greatProgressShape')} 🎉
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Activity Prompt Notification */}
      {showActivityPrompt && (
        <Animated.View style={[styles.activityNotification, { backgroundColor: currentShape.color }]}>
          <MaterialIcons name="gesture" size={20} color="#FFF" />
          <Text style={styles.activityNotificationText}>
            {t('shape.drawInAir', { shape: t(currentShape.nameKey) })}
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
              <Text style={styles.rewardEmoji}>⭐</Text>
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage === t('reward.completeAllShapes') ? (
                <>
                  <Text style={styles.rewardMessage}>{t('reward.youAreShapeExpert')}</Text>
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
                    {t('reward.pointsForShape', { points: 10, shape: t(currentShape.nameKey) })}
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
  shapeCard: {
    width: width - 80,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  shapeSvgContainer: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  shapeName: { fontSize: 32, fontWeight: 'bold', marginTop: Spacing.sm },
  cornerBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center'
  },
  cornerText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    width: '100%'
  },
  descriptionText: { flex: 1, fontSize: 14, lineHeight: 20 },
  examplesContainer: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg
  },
  examplesTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  examplesList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  exampleItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  exampleText: { fontSize: 14 },
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
  optionColor: { width: 40, height: 40, borderRadius: 20 },
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
  activityNotification: {
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
  },
  activityNotificationText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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