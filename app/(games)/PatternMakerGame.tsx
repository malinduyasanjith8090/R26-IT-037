// app/(games)/PatternMakerGame.tsx (with Sinhala voice instruction)
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
  View
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

const { width } = Dimensions.get('window');

interface PatternItem {
  id: string;
  emoji: string;
  name: string;
}

interface Pattern {
  id: number;
  sequence: string[];
  missingIndex: number;
  options: string[];
}

interface Level {
  id: number;
  name: string;
  items: PatternItem[];
  patterns: Pattern[];
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Simple Patterns',
    items: [
      { id: 'red', emoji: '🔴', name: 'Red' },
      { id: 'blue', emoji: '🔵', name: 'Blue' },
      { id: 'green', emoji: '🟢', name: 'Green' },
    ],
    patterns: [
      { id: 1, sequence: ['🔴', '🔵', '🔴', '?'], missingIndex: 3, options: ['🔴', '🔵', '🟢'] },
      { id: 2, sequence: ['🔵', '🟢', '🔵', '?'], missingIndex: 3, options: ['🔴', '🔵', '🟢'] },
      { id: 3, sequence: ['🟢', '🔴', '🟢', '?'], missingIndex: 3, options: ['🔴', '🔵', '🟢'] },
    ],
  },
  {
    id: 2,
    name: 'Animal Patterns',
    items: [
      { id: 'lion', emoji: '🦁', name: 'Lion' },
      { id: 'monkey', emoji: '🐒', name: 'Monkey' },
      { id: 'elephant', emoji: '🐘', name: 'Elephant' },
    ],
    patterns: [
      { id: 1, sequence: ['🦁', '🐒', '🦁', '?'], missingIndex: 3, options: ['🦁', '🐒', '🐘'] },
      { id: 2, sequence: ['🐒', '🐘', '🐒', '?'], missingIndex: 3, options: ['🦁', '🐒', '🐘'] },
      { id: 3, sequence: ['🐘', '🦁', '🐘', '?'], missingIndex: 3, options: ['🦁', '🐒', '🐘'] },
    ],
  },
  {
    id: 3,
    name: 'Shape Patterns',
    items: [
      { id: 'circle', emoji: '⚪', name: 'Circle' },
      { id: 'square', emoji: '🟫', name: 'Square' },
      { id: 'triangle', emoji: '🔺', name: 'Triangle' },
    ],
    patterns: [
      { id: 1, sequence: ['⚪', '🟫', '⚪', '?'], missingIndex: 3, options: ['⚪', '🟫', '🔺'] },
      { id: 2, sequence: ['🟫', '🔺', '🟫', '?'], missingIndex: 3, options: ['⚪', '🟫', '🔺'] },
      { id: 3, sequence: ['🔺', '⚪', '🔺', '?'], missingIndex: 3, options: ['⚪', '🟫', '🔺'] },
    ],
  },
  {
    id: 4,
    name: 'Fruit Patterns',
    items: [
      { id: 'apple', emoji: '🍎', name: 'Apple' },
      { id: 'banana', emoji: '🍌', name: 'Banana' },
      { id: 'orange', emoji: '🍊', name: 'Orange' },
    ],
    patterns: [
      { id: 1, sequence: ['🍎', '🍌', '🍎', '?'], missingIndex: 3, options: ['🍎', '🍌', '🍊'] },
      { id: 2, sequence: ['🍌', '🍊', '🍌', '?'], missingIndex: 3, options: ['🍎', '🍌', '🍊'] },
      { id: 3, sequence: ['🍊', '🍎', '🍊', '?'], missingIndex: 3, options: ['🍎', '🍌', '🍊'] },
    ],
  },
  {
    id: 5,
    name: 'Complex Patterns',
    items: [
      { id: 'star', emoji: '⭐', name: 'Star' },
      { id: 'heart', emoji: '❤️', name: 'Heart' },
      { id: 'smile', emoji: '😊', name: 'Smile' },
    ],
    patterns: [
      { id: 1, sequence: ['⭐', '❤️', '⭐', '?'], missingIndex: 3, options: ['⭐', '❤️', '😊'] },
      { id: 2, sequence: ['❤️', '😊', '❤️', '?'], missingIndex: 3, options: ['⭐', '❤️', '😊'] },
      { id: 3, sequence: ['😊', '⭐', '😊', '?'], missingIndex: 3, options: ['⭐', '❤️', '😊'] },
    ],
  },
];

// ─── Sinhala external audio map ─────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/games/patternMakerinstruction.mp3'),
};

export default function PatternMakerGame() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const {
    playSound,
    playCelebration,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled
  } = useSound();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const bounceAnim = useState(new Animated.Value(1))[0];

  // ─── Sinhala voice state ──────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  const level = levels[currentLevel];
  const currentPattern = level.patterns[currentPatternIndex];

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
        ? 'මෙම ක්‍රීඩාවේදී, රටාව දෙස බලා නැතිවූ කොටුව සඳහා නිවැරදි අයිතමය තෝරන්න. රටාව හොඳින් අනුගමනය කරමින් සියලුම ප්‍රශ්නවලට පිළිතුරු සපයන්න.'
        : 'In this game, look at the pattern and choose the correct item for the missing box. Follow the pattern carefully to answer all questions.';

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
        ? 'මෙම ක්‍රීඩාවේදී, රටාව දෙස බලා නැතිවූ කොටුව සඳහා නිවැරදි අයිතමය තෝරන්න. රටාව හොඳින් අනුගමනය කරමින් සියලුම ප්‍රශ්නවලට පිළිතුරු සපයන්න.'
        : 'In this game, look at the pattern and choose the correct item for the missing box. Follow the pattern carefully to answer all questions.';
      speak(instructionText, 'instruction');
    }
  }, [soundsLoaded]);

  const getCorrectAnswer = () => {
    const sequence = currentPattern.sequence;
    const pattern = sequence.slice(0, -1);
    if (pattern[0] === pattern[2]) {
      return pattern[0];
    }
    return pattern[1];
  };

  const calculateStars = () => {
    const correctCount = Math.floor(score / 10);
    if (correctCount === level.patterns.length) return 3;
    if (correctCount >= level.patterns.length - 1) return 2;
    return 1;
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correctAnswer = getCorrectAnswer();
    const correct = answer === correctAnswer;
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
        if (currentPatternIndex + 1 >= level.patterns.length) {
          const earnedStars = calculateStars();
          setStars(earnedStars);

          if (currentLevel === levels.length - 1) {
            await playCelebration();
            setShowComplete(true);
          } else {
            setShowReward(true);
          }
        } else {
          setCurrentPatternIndex(currentPatternIndex + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
          await playSound('click', false);
        }
      }, 1500);
    } else {
      await playSound('error', true);
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      setShowHint(true);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
        setShowHint(false);
      }, 1000);
    }
  };

  const nextLevel = async () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
    setCurrentPatternIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    await playSound('levelUp', false);
  };

  const resetGame = async () => {
    setCurrentLevel(0);
    setCurrentPatternIndex(0);
    setScore(0);
    setShowComplete(false);
    setSelectedAnswer(null);
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

  const renderSequence = () => {
    return (
      <View style={styles.sequenceContainer}>
        {currentPattern.sequence.map((item, index) => (
          <View key={index} style={styles.sequenceItem}>
            {item === '?' ? (
              <View style={[styles.missingBox, { backgroundColor: colors.primaryLight + '40' }]}>
                <Text style={styles.questionMark}>?</Text>
              </View>
            ) : (
              <View style={[styles.sequenceBox, { backgroundColor: colors.surface }]}>
                <Text style={styles.sequenceEmoji}>{item}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soundButton}
          onPress={handleToggleSound}
        >
          <MaterialIcons
            name={soundEnabled ? "volume-up" : "volume-off"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Pattern Maker</Text>

        <View style={[styles.scoreBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          Pattern {currentPatternIndex + 1} of {level.patterns.length}
        </Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={[styles.instructionText, { color: colors.text }]}>
          🧩 What comes next in the pattern?
        </Text>
      </View>

      {/* Pattern Display */}
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        {renderSequence()}
      </Animated.View>

      {/* Hint Button */}
      <TouchableOpacity
        style={[styles.hintButton, { backgroundColor: colors.primaryLight + '30' }]}
        onPress={async () => {
          await playSound('click', false);
          setShowHint(true);
          setTimeout(() => setShowHint(false), 2000);
        }}
      >
        <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
        <Text style={[styles.hintButtonText, { color: colors.primary }]}>Need a Hint?</Text>
      </TouchableOpacity>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentPattern?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
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
            <Text style={styles.optionEmoji}>{option}</Text>
            <Text style={[styles.optionText, { color: colors.text }]}>
              {level.items.find(i => i.emoji === option)?.name || option}
            </Text>
            {selectedAnswer === option && (
              <MaterialIcons
                name={isCorrect ? "check-circle" : "cancel"}
                size={28}
                color={isCorrect ? colors.success : colors.error}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback */}
      {selectedAnswer && !isCorrect && (
        <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="tips-and-updates" size={20} color={colors.error} />
          <Text style={[styles.feedbackText, { color: colors.error }]}>
            Look at the pattern! It repeats every two items.
          </Text>
        </View>
      )}

      {/* Hint Popup */}
      {showHint && !selectedAnswer && (
        <Animated.View style={[styles.hintPopup, { backgroundColor: colors.primary + 'E6' }]}>
          <MaterialIcons name="lightbulb" size={24} color="#FFF" />
          <Text style={styles.hintPopupText}>
            Hint: Look for the repeating pattern! 🔄
          </Text>
        </Animated.View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentPatternIndex) / level.patterns.length) * 100}%`,
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Pattern Master!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You completed {level.name}!
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                Score: {score} points
              </Text>
              {getStarRating(stars)}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={nextLevel}
              >
                <Text style={styles.modalButtonText}>Next Level →</Text>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Pattern Champion!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You mastered all patterns!
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                Total Score: {score} points
              </Text>
              {getStarRating(3)}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={resetGame}
                >
                  <Text style={styles.modalButtonText}>Play Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.modalButtonText}>Back to Menu</Text>
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
  instructionContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  instructionText: { fontSize: Typography.fontSize.lg, fontWeight: 'bold' },
  sequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  sequenceItem: { alignItems: 'center' },
  sequenceBox: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sequenceEmoji: { fontSize: 48 },
  missingBox: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  questionMark: { fontSize: 40, fontWeight: 'bold', color: '#FFD700' },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
    marginVertical: Spacing.md,
  },
  hintButtonText: { fontSize: 14, fontWeight: '600' },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    flexWrap: 'wrap',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    minWidth: 120,
    justifyContent: 'center',
  },
  optionEmoji: { fontSize: 32 },
  optionText: { fontSize: 16, fontWeight: '600' },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  feedbackText: { fontSize: Typography.fontSize.sm, flex: 1 },
  hintPopup: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  hintPopupText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
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
  modalButtons: { flexDirection: 'row', gap: Spacing.md },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});