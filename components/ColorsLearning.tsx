// components/learning/ColorsLearning.tsx (fixed overlap: instruction fully plays first)
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

interface ColorLesson {
  id: string;
  nameKey: string;
  colorCode: string;
  icon: string;
  objectKeys: string[];
}

const colorsData: ColorLesson[] = [
  { id: 'red', nameKey: 'color.red', colorCode: '#FF0000', icon: '🔴', objectKeys: ['object.apple', 'object.rose', 'object.ball'] },
  { id: 'blue', nameKey: 'color.blue', colorCode: '#0000FF', icon: '🔵', objectKeys: ['object.sky', 'object.ocean', 'object.blueberry'] },
  { id: 'green', nameKey: 'color.green', colorCode: '#00FF00', icon: '🟢', objectKeys: ['object.grass', 'object.tree', 'object.leaf'] },
  { id: 'yellow', nameKey: 'color.yellow', colorCode: '#FFFF00', icon: '🟡', objectKeys: ['object.sun', 'object.banana', 'object.star'] },
  { id: 'orange', nameKey: 'color.orange', colorCode: '#FFA500', icon: '🟠', objectKeys: ['object.orangeFruit', 'object.pumpkin', 'object.carrot'] },
  { id: 'purple', nameKey: 'color.purple', colorCode: '#800080', icon: '🟣', objectKeys: ['object.grapes', 'object.eggplant', 'object.lavender'] },
  { id: 'pink', nameKey: 'color.pink', colorCode: '#FFC0CB', icon: '🌸', objectKeys: ['object.flower', 'object.cottonCandy', 'object.pig'] },
  { id: 'brown', nameKey: 'color.brown', colorCode: '#8B4513', icon: '🟤', objectKeys: ['object.chocolate', 'object.treeTrunk', 'object.bear'] },
  { id: 'black', nameKey: 'color.black', colorCode: '#000000', icon: '⚫', objectKeys: ['object.nightSky', 'object.penguin', 'object.tire'] },
  { id: 'white', nameKey: 'color.white', colorCode: '#FFFFFF', icon: '⚪', objectKeys: ['object.cloud', 'object.snow', 'object.milk'] },
];

// ─── Sinhala external audio mapping ─────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../assets/sounds/sinhala/instruction.mp3'),
  red: require('../assets/sounds/sinhala/red.mp3'),
  blue: require('../assets/sounds/sinhala/blue.mp3'),
  green: require('../assets/sounds/sinhala/green.mp3'),
  yellow: require('../assets/sounds/sinhala/yellow.mp3'),
  orange: require('../assets/sounds/sinhala/orange.mp3'),
  purple: require('../assets/sounds/sinhala/purple.mp3'),
  pink: require('../assets/sounds/sinhala/pink.mp3'),
  brown: require('../assets/sounds/sinhala/brown.mp3'),
  black: require('../assets/sounds/sinhala/black.mp3'),
  white: require('../assets/sounds/sinhala/white.mp3'),
};

export default function ColorsLearning({ onBack, onProgress }: any) {
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

  const currentColor = colorsData[currentIndex];

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

  // ✅ MAIN INSTRUCTION EFFECT – 4-second delay prevents overlap
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      const instructionText = language === 'si'
        ? t('color.instruction') || 'ආයුබෝවන්! අපි අද වර්ණ ගැන ඉගෙන ගමු. පහතින් පෙන්නන වර්ණය තෝරන්න.'
        : t('color.instruction') || 'Hello! Let\'s learn about colors today. Choose the color shown below.';

      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }

      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentColor.nameKey), currentColor.id);
      }, 4000);  // ⏱️ Increased from 2500 to 4000
      return () => clearTimeout(timer);
    }

    // On colour change (not first render)
    speak(t(currentColor.nameKey), currentColor.id);
  }, [currentIndex, language]);

  // ✅ PENDING INSTRUCTION EFFECT – same 4-second delay
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const instructionText = language === 'si'
        ? t('color.instruction') || 'ආයුබෝවන්! අපි අද වර්ණ ගැන ඉගෙන ගමු. පහතින් පෙන්නන වර්ණය තෝරන්න.'
        : t('color.instruction') || 'Hello! Let\'s learn about colors today. Choose the color shown below.';
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(currentColor.nameKey), currentColor.id);
      }, 6500);  // ⏱️ Increased from 2500 to 4000
      return () => clearTimeout(timer);
    }
  }, [soundsLoaded]);

  // rest of component unchanged...
  const getRandomRewardMessageKey = () => {
    const messageKeys = [
      'reward.amazing', 'reward.greatJob', 'reward.youreAStar',
      'reward.fantastic', 'reward.excellent', 'reward.keepGoing', 'reward.beautiful',
    ];
    return messageKeys[Math.floor(Math.random() * messageKeys.length)];
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === t(currentColor.nameKey);
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

        if (currentIndex < colorsData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / colorsData.length) * 100);
          await playSound('click', false);
        } else {
          await playCelebration();
          setShowRewardModal(true);
          setRewardMessage(t('reward.completeAllColors'));
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
    const currentName = t(currentColor.nameKey);
    const options = [currentName];
    const otherNames = colorsData
      .filter(c => c.id !== currentColor.id)
      .map(c => t(c.nameKey))
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

  const handleColorPress = async () => {
    await playSound('click', false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.soundButton} onPress={handleToggleSound}>
          <MaterialIcons name={soundEnabled ? "volume-up" : "volume-off"} size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / colorsData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {t('progress.of', { current: currentIndex + 1, total: colorsData.length, item: t('colors') })}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Color Display Card */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleColorPress}>
            <View style={[styles.colorCard, { backgroundColor: currentColor.colorCode }]}>
              <View style={styles.colorIconContainer}>
                <Text style={styles.colorIcon}>{currentColor.icon}</Text>
              </View>
              <Text style={styles.colorName}>{t(currentColor.nameKey)}</Text>
            </View>
          </TouchableOpacity>

          {/* Example Objects */}
          <View style={[styles.objectsContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.objectsTitle, { color: colors.text }]}>
              {t('color.thingsThatAre', { color: t(currentColor.nameKey) })}:
            </Text>
            <View style={styles.objectsList}>
              {currentColor.objectKeys.map((objKey, idx) => (
                <View key={idx} style={[styles.objectItem, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.objectText, { color: colors.text }]}>{t(objKey)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 {t('color.whatColorIsThis')} 🤔
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {getOptions().map((option, idx) => {
              const colorEntry = colorsData.find(c => t(c.nameKey) === option);
              const optionColorCode = colorEntry?.colorCode || colors.primary;
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
                  <View style={[styles.optionColor, { backgroundColor: optionColorCode }]} />
                  <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                  {selectedAnswer === option && (
                    <MaterialIcons name={isCorrect ? "check-circle" : "cancel"} size={28} color={isCorrect ? colors.success : colors.error} />
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
                ✗ {t('color.tryAgainCorrectIs', { color: t(currentColor.nameKey) })} ✗
              </Text>
            </View>
          )}

          {/* Encouragement Message */}
          {score > 0 && score % 50 === 0 && score !== 0 && (
            <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="emoji-events" size={24} color={colors.success} />
              <Text style={[styles.encouragementText, { color: colors.success }]}>
                🎉 {t('reward.greatProgress')} 🎉
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Reward Modal */}
      <Modal visible={showRewardModal} transparent={true} animationType="fade" onRequestClose={() => setShowRewardModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <MaterialIcons name="emoji-events" size={80} color="#FFD700" />
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage === t('reward.completeAllColors') ? (
                <>
                  <Text style={styles.rewardMessage}>{t('reward.youAreColorMaster')}</Text>
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
                    {t('reward.pointsForColor', { points: 10, color: t(currentColor.nameKey) })}
                  </Text>
                  <View style={styles.starContainer}>
                    {[...Array(3)].map((_, i) => <Text key={i} style={styles.star}>⭐</Text>)}
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

// ─── STYLES (unchanged) ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, paddingTop: Spacing.xl },
  backButton: { padding: Spacing.sm },
  soundButton: { padding: Spacing.sm },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, gap: Spacing.xs },
  scoreText: { fontWeight: 'bold', fontSize: 18 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.xs },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl || 40 },
  content: { alignItems: 'center', padding: Spacing.lg },
  colorCard: { width: width - 80, height: 180, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  colorIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  colorIcon: { fontSize: 48 },
  colorName: { fontSize: 32, fontWeight: 'bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  objectsContainer: { width: '100%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  objectsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  objectsList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  objectItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  objectText: { fontSize: 14 },
  questionContainer: { marginVertical: Spacing.md },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  optionsContainer: { width: '100%', gap: Spacing.md, marginBottom: Spacing.md },
  optionButton: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.md, gap: Spacing.md },
  optionColor: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  optionText: { flex: 1, fontSize: 18, fontWeight: '600' },
  feedbackContainer: { marginTop: Spacing.md, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, width: '100%', flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  feedbackText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  encouragementContainer: { marginTop: Spacing.md, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, width: '100%', flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  encouragementText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  rewardContent: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.lg, minWidth: 280 },
  rewardTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginTop: Spacing.md, textAlign: 'center' },
  rewardMessage: { fontSize: 18, color: '#333', marginTop: Spacing.sm, textAlign: 'center' },
  starContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  star: { fontSize: 30 },
  rewardButton: { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  rewardButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  continueButton: { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, minWidth: 150, alignItems: 'center' },
  continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});