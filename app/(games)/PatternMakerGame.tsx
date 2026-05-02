// app/(games)/PatternMakerGame.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';

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

export default function PatternMakerGame() {
  const { colors } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const bounceAnim = useState(new Animated.Value(1))[0];

  const level = levels[currentLevel];
  const currentPattern = level.patterns[currentPatternIndex];

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

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correctAnswer = getCorrectAnswer();
    const correct = answer === correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newScore = score + 10;
      setScore(newScore);
      
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        if (currentPatternIndex + 1 >= level.patterns.length) {
          const earnedStars = calculateStars();
          setStars(earnedStars);
          
          if (currentLevel === levels.length - 1) {
            setShowComplete(true);
          } else {
            setShowReward(true);
          }
        } else {
          setCurrentPatternIndex(currentPatternIndex + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
        }
      }, 1500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  const nextLevel = () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
    setCurrentPatternIndex(0);
    setScore(0);
    setSelectedAnswer(null);
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setCurrentPatternIndex(0);
    setScore(0);
    setShowComplete(false);
    setSelectedAnswer(null);
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
  title: { fontSize: Typography.fontSize.lg, fontWeight: 'bold' },
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
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