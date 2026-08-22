// app/(games)/NumberHuntGame.tsx (with Sinhala voice instruction)
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

const { width } = Dimensions.get('window');

interface Level {
  id: number;
  nameKey: string;
  numberRange: { min: number; max: number };
  questions: Question[];
}

interface Question {
  id: number;
  targetNumber: number;
  descKey: string;
  emoji: string;
}

const levels: Level[] = [
  {
    id: 1,
    nameKey: 'numberHunt.level1.name',
    numberRange: { min: 1, max: 5 },
    questions: [
      { id: 1, targetNumber: 1, descKey: 'numberHunt.level1.q1', emoji: '☝️' },
      { id: 2, targetNumber: 2, descKey: 'numberHunt.level1.q2', emoji: '✌️' },
      { id: 3, targetNumber: 3, descKey: 'numberHunt.level1.q3', emoji: '👌' },
      { id: 4, targetNumber: 4, descKey: 'numberHunt.level1.q4', emoji: '🖖' },
      { id: 5, targetNumber: 5, descKey: 'numberHunt.level1.q5', emoji: '🖐️' },
    ],
  },
  {
    id: 2,
    nameKey: 'numberHunt.level2.name',
    numberRange: { min: 1, max: 10 },
    questions: [
      { id: 1, targetNumber: 6, descKey: 'numberHunt.level2.q1', emoji: '6️⃣' },
      { id: 2, targetNumber: 7, descKey: 'numberHunt.level2.q2', emoji: '7️⃣' },
      { id: 3, targetNumber: 8, descKey: 'numberHunt.level2.q3', emoji: '8️⃣' },
      { id: 4, targetNumber: 9, descKey: 'numberHunt.level2.q4', emoji: '9️⃣' },
      { id: 5, targetNumber: 10, descKey: 'numberHunt.level2.q5', emoji: '🔟' },
    ],
  },
  {
    id: 3,
    nameKey: 'numberHunt.level3.name',
    numberRange: { min: 1, max: 5 },
    questions: [
      { id: 1, targetNumber: 1, descKey: 'numberHunt.level3.q1', emoji: '🍎' },
      { id: 2, targetNumber: 2, descKey: 'numberHunt.level3.q2', emoji: '⭐⭐' },
      { id: 3, targetNumber: 3, descKey: 'numberHunt.level3.q3', emoji: '❤️❤️❤️' },
      { id: 4, targetNumber: 4, descKey: 'numberHunt.level3.q4', emoji: '🔴🔴🔴🔴' },
      { id: 5, targetNumber: 5, descKey: 'numberHunt.level3.q5', emoji: '🟦🟦🟦🟦🟦' },
    ],
  },
  {
    id: 4,
    nameKey: 'numberHunt.level4.name',
    numberRange: { min: 1, max: 5 },
    questions: [
      { id: 1, targetNumber: 1, descKey: 'numberHunt.level4.q1', emoji: '🔢' },
      { id: 2, targetNumber: 2, descKey: 'numberHunt.level4.q2', emoji: '🔢' },
      { id: 3, targetNumber: 3, descKey: 'numberHunt.level4.q3', emoji: '🔢' },
      { id: 4, targetNumber: 4, descKey: 'numberHunt.level4.q4', emoji: '🔢' },
      { id: 5, targetNumber: 5, descKey: 'numberHunt.level4.q5', emoji: '🔢' },
    ],
  },
  {
    id: 5,
    nameKey: 'numberHunt.level5.name',
    numberRange: { min: 1, max: 10 },
    questions: [
      { id: 1, targetNumber: 3, descKey: 'numberHunt.level5.q1', emoji: '🔍' },
      { id: 2, targetNumber: 7, descKey: 'numberHunt.level5.q2', emoji: '🔍' },
      { id: 3, targetNumber: 5, descKey: 'numberHunt.level5.q3', emoji: '🔍' },
      { id: 4, targetNumber: 9, descKey: 'numberHunt.level5.q4', emoji: '🔍' },
      { id: 5, targetNumber: 2, descKey: 'numberHunt.level5.q5', emoji: '🔍' },
    ],
  },
];

// ─── Sinhala external audio map ─────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/games/numberHuntinstruction.mp3'),
};

export default function NumberHuntGame() {
  const { colors } = useTheme();
  const { t, language } = useLanguage(); // ← language
  const {
    playSound,
    playCelebration,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled
  } = useSound();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const bounceAnim = useState(new Animated.Value(1))[0];

  const level = levels[currentLevel];
  const currentQuestion = level.questions[currentQuestionIndex];

  // ─── Sinhala voice state ──────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    generateOptions();
    playSound('click', false);
  }, [currentQuestionIndex]);

  // Load Sinhala instruction audio
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

  // Speak function (external audio for Sinhala, TTS for English)
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

  // Speak instruction when the game opens
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const instructionText = language === 'si'
        ? 'මෙම ක්‍රීඩාවේදී, තිරයේ පෙන්වන ඉලක්කම් ගණන් කර, නිවැරදි පිළිතුර තෝරන්න. සෑම ප්‍රශ්නයකටම නිවැරදිව පිළිතුරු දී, ජයග්‍රහණය කිරීමට උත්සාහ කරන්න.'
        : 'In this game, count the numbers shown on the screen and choose the correct answer. Try to answer every question correctly.';

      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }
      speak(instructionText, 'instruction');
    }
  }, [language]);

  // Pending instruction effect
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const instructionText = language === 'si'
        ? 'මෙම ක්‍රීඩාවේදී, තිරයේ පෙන්වන ඉලක්කම් ගණන් කර, නිවැරදි පිළිතුර තෝරන්න. සෑම ප්‍රශ්නයකටම නිවැරදිව පිළිතුරු දී, ජයග්‍රහණය කිරීමට උත්සාහ කරන්න.'
        : 'In this game, count the numbers shown on the screen and choose the correct answer. Try to answer every question correctly.';
      speak(instructionText, 'instruction');
    }
  }, [soundsLoaded]);

  const generateOptions = () => {
    const numbers = [];
    for (let i = level.numberRange.min; i <= level.numberRange.max; i++) {
      numbers.push(i);
    }
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setOptions(numbers.slice(0, 4));
  };

  const calculateStars = () => {
    const correctCount = Math.floor(score / 10);
    if (correctCount === level.questions.length) return 3;
    if (correctCount >= level.questions.length - 1) return 2;
    return 1;
  };

  const getObjectsDisplay = () => {
    const count = currentQuestion.targetNumber;
    const emoji = currentQuestion.emoji;
    if (level.id === 2) {
      return <Text style={styles.numberEmoji}>{emoji}</Text>;
    } else if (level.id === 3) {
      return (
        <View style={styles.objectsContainer}>
          {Array.from({ length: count }).map((_, i) => (
            <Text key={i} style={styles.objectEmoji}>{emoji}</Text>
          ))}
        </View>
      );
    } else if (level.id === 4) {
      return (
        <View style={styles.wordContainer}>
          <Text style={[styles.wordText, { color: colors.primary }]}>
            {t(currentQuestion.descKey)}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.numberDisplay}>
          <Text style={styles.numberEmoji}>{emoji}</Text>
          <Text style={[styles.numberDescription, { color: colors.text }]}>
            {t(currentQuestion.descKey)}
          </Text>
        </View>
      );
    }
  };

  const showHintMessage = async () => {
    setShowHint(true);
    await playSound('click', false);
    setTimeout(() => setShowHint(false), 3000);
  };

  const handleAnswer = async (answer: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.targetNumber;
    setIsCorrect(correct);

    if (correct) {
      await playCorrectAnswer();
      const newScore = score + 10;
      setScore(newScore);
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(async () => {
        if (currentQuestionIndex + 1 >= level.questions.length) {
          const earnedStars = calculateStars();
          setStars(earnedStars);

          if (currentLevel === levels.length - 1) {
            await playCelebration();
            setShowComplete(true);
          } else {
            await playSound('levelUp', false);
            setShowReward(true);
          }
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
          generateOptions();
          await playSound('click', false);
        }
      }, 1500);
    } else {
      await playSound('wrong', true);

      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  const nextLevel = async () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    generateOptions();
    await playSound('click', false);
  };

  const resetGame = async () => {
    setCurrentLevel(0);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowComplete(false);
    setSelectedAnswer(null);
    generateOptions();
    await playSound('click', false);
  };

  const handleToggleSound = async () => {
    await playSound('click', false);
    toggleSound();
  };

  const getStarRating = (starCount: number) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= starCount ? 'star' : 'star-border'}
          size={40}
          color="#FFD700"
        />
      ))}
    </View>
  );

  const getEncouragementMessage = () => {
    if (score === 0) return t('numberHunt.encouragement.start');
    if (score < 30) return t('numberHunt.encouragement.greatStart');
    if (score < 60) return t('numberHunt.encouragement.amazing');
    return t('numberHunt.encouragement.champion');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('numberHunt.title')}</Text>

        <TouchableOpacity style={styles.soundButton} onPress={handleToggleSound}>
          <MaterialIcons name={soundEnabled ? "volume-up" : "volume-off"} size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={[styles.scoreBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>{t(level.nameKey)}</Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          {t('question')} {currentQuestionIndex + 1} {t('of')} {level.questions.length}
        </Text>
      </View>

      {/* Encouragement Message */}
      <View style={[styles.encouragementContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="emoji-emotions" size={20} color={colors.primary} />
        <Text style={[styles.encouragementText, { color: colors.text }]}>
          {getEncouragementMessage()}
        </Text>
      </View>

      {/* Question Display */}
      <Animated.View
        style={[
          styles.questionContainer,
          { backgroundColor: colors.surface },
          { transform: [{ scale: bounceAnim }] }
        ]}
      >
        {getObjectsDisplay()}
      </Animated.View>

      {/* Hint Button */}
      <TouchableOpacity
        style={[styles.hintButton, { backgroundColor: colors.primaryLight }]}
        onPress={showHintMessage}
      >
        <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
        <Text style={[styles.hintButtonText, { color: colors.primary }]}>{t('numberHunt.hintButton')}</Text>
      </TouchableOpacity>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.numberOption,
              {
                backgroundColor: colors.surface,
                borderColor: selectedAnswer === option
                  ? (isCorrect ? colors.success : colors.error)
                  : colors.primaryLight,
                borderWidth: 3,
              },
            ]}
            onPress={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
          >
            <Text style={[styles.numberText, { color: colors.text }]}>{option}</Text>
            {selectedAnswer === option && (
              <MaterialIcons
                name={isCorrect ? "check-circle" : "cancel"}
                size={28}
                color={isCorrect ? colors.success : colors.error}
                style={styles.answerIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Hint Popup */}
      {showHint && (
        <Animated.View style={[styles.hintPopup, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="lightbulb" size={24} color={colors.accentYellow || '#FFD700'} />
          <Text style={[styles.hintPopupText, { color: colors.text }]}>
            {t('numberHunt.hintMessage', { number: currentQuestion.targetNumber })}
          </Text>
        </Animated.View>
      )}

      {/* Feedback for wrong answer */}
      {selectedAnswer && !isCorrect && (
        <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="tips-and-updates" size={20} color={colors.error} />
          <Text style={[styles.feedbackText, { color: colors.error }]}>
            {t('numberHunt.feedbackWrong', { number: currentQuestion.targetNumber })}
          </Text>
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIndex) / level.questions.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Level Reward Modal */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('numberHunt.reward.title')}</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                {t('numberHunt.reward.message', { levelName: t(level.nameKey) })}
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                {t('score')}: {score} {t('points')}
              </Text>
              {getStarRating(stars)}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={nextLevel}
              >
                <Text style={styles.modalButtonText}>{t('numberHunt.nextLevel')} →</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>

      {/* Game Complete Modal */}
      <Modal visible={showComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🏆</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('numberHunt.complete.title')}</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                {t('numberHunt.complete.message')}
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                {t('totalScore')}: {score} {t('points')}
              </Text>
              {getStarRating(3)}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={resetGame}
                >
                  <Text style={styles.modalButtonText}>{t('playAgain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.modalButtonText}>{t('backToMenu')}</Text>
                </TouchableOpacity>
              </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  backButton: { padding: Spacing.sm },
  soundButton: { padding: Spacing.sm },
  title: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
  },
  scoreText: { fontSize: Typography.fontSize.md, fontWeight: 'bold' },
  levelContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  levelName: { fontSize: Typography.fontSize.md, fontWeight: 'bold' },
  levelProgress: { fontSize: Typography.fontSize.sm, marginTop: Spacing.xs },
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  encouragementText: { fontSize: Typography.fontSize.sm, fontWeight: '500' },
  questionContainer: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  numberDisplay: { alignItems: 'center' },
  numberEmoji: { fontSize: 80, marginBottom: Spacing.md },
  numberDescription: { fontSize: 24, fontWeight: 'bold' },
  objectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  objectEmoji: { fontSize: 50 },
  wordContainer: { alignItems: 'center' },
  wordText: { fontSize: 36, fontWeight: 'bold', letterSpacing: 5 },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  hintButtonText: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  numberOption: {
    width: (width - 80) / 2,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    position: 'relative',
  },
  numberText: { fontSize: 48, fontWeight: 'bold' },
  answerIcon: { position: 'absolute', bottom: 8, right: 8 },
  hintPopup: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  hintPopupText: { fontSize: Typography.fontSize.md, fontWeight: '500', flex: 1, textAlign: 'center' },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  feedbackText: { fontSize: Typography.fontSize.sm, flex: 1 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginVertical: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 280,
  },
  modalEmoji: { fontSize: 60, textAlign: 'center' },
  modalTitle: { fontSize: 28, fontWeight: 'bold', marginTop: Spacing.md },
  modalMessage: { fontSize: 16, marginTop: Spacing.sm, textAlign: 'center' },
  modalScore: { fontSize: 18, fontWeight: 'bold', marginTop: Spacing.md },
  starsContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.xs },
  modalButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 150,
    alignItems: 'center',
  },
  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});