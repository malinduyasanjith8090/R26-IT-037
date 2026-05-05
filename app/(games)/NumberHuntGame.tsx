// app/(games)/NumberHuntGame.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

interface Level {
  id: number;
  name: string;
  numberRange: { min: number; max: number };
  questions: Question[];
}

interface Question {
  id: number;
  targetNumber: number;
  description: string;
  emoji: string;
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Numbers 1-5',
    numberRange: { min: 1, max: 5 },
    questions: [
      { id: 1, targetNumber: 1, description: 'Find number one', emoji: '☝️' },
      { id: 2, targetNumber: 2, description: 'Find number two', emoji: '✌️' },
      { id: 3, targetNumber: 3, description: 'Find number three', emoji: '👌' },
      { id: 4, targetNumber: 4, description: 'Find number four', emoji: '🖖' },
      { id: 5, targetNumber: 5, description: 'Find number five', emoji: '🖐️' },
    ],
  },
  {
    id: 2,
    name: 'Numbers 1-10',
    numberRange: { min: 1, max: 10 },
    questions: [
      { id: 1, targetNumber: 6, description: 'Find number six', emoji: '6️⃣' },
      { id: 2, targetNumber: 7, description: 'Find number seven', emoji: '7️⃣' },
      { id: 3, targetNumber: 8, description: 'Find number eight', emoji: '8️⃣' },
      { id: 4, targetNumber: 9, description: 'Find number nine', emoji: '9️⃣' },
      { id: 5, targetNumber: 10, description: 'Find number ten', emoji: '🔟' },
    ],
  },
  {
    id: 3,
    name: 'Counting Objects',
    numberRange: { min: 1, max: 5 },
    questions: [
      { id: 1, targetNumber: 1, description: 'How many apples?', emoji: '🍎' },
      { id: 2, targetNumber: 2, description: 'How many stars?', emoji: '⭐⭐' },
      { id: 3, targetNumber: 3, description: 'How many hearts?', emoji: '❤️❤️❤️' },
      { id: 4, targetNumber: 4, description: 'How many circles?', emoji: '🔴🔴🔴🔴' },
      { id: 5, targetNumber: 5, description: 'How many squares?', emoji: '🟦🟦🟦🟦🟦' },
    ],
  },
  {
    id: 4,
    name: 'Number Words',
    numberRange: { min: 1, max: 5 },
    questions: [
      { id: 1, targetNumber: 1, description: 'ONE', emoji: '🔢' },
      { id: 2, targetNumber: 2, description: 'TWO', emoji: '🔢' },
      { id: 3, targetNumber: 3, description: 'THREE', emoji: '🔢' },
      { id: 4, targetNumber: 4, description: 'FOUR', emoji: '🔢' },
      { id: 5, targetNumber: 5, description: 'FIVE', emoji: '🔢' },
    ],
  },
  {
    id: 5,
    name: 'Number Hunt',
    numberRange: { min: 1, max: 10 },
    questions: [
      { id: 1, targetNumber: 3, description: 'Find the hidden number 3', emoji: '🔍' },
      { id: 2, targetNumber: 7, description: 'Find the hidden number 7', emoji: '🔍' },
      { id: 3, targetNumber: 5, description: 'Find the hidden number 5', emoji: '🔍' },
      { id: 4, targetNumber: 9, description: 'Find the hidden number 9', emoji: '🔍' },
      { id: 5, targetNumber: 2, description: 'Find the hidden number 2', emoji: '🔍' },
    ],
  },
];

export default function NumberHuntGame() {
  const { colors } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const bounceAnim = useState(new Animated.Value(1))[0];

  const level = levels[currentLevel];
  const currentQuestion = level.questions[currentQuestionIndex];

  useEffect(() => {
    generateOptions();
  }, [currentQuestionIndex]);

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
      // For numbers 1-10 level
      return <Text style={styles.numberEmoji}>{emoji}</Text>;
    } else if (level.id === 3) {
      // For counting objects
      return (
        <View style={styles.objectsContainer}>
          {Array.from({ length: count }).map((_, i) => (
            <Text key={i} style={styles.objectEmoji}>{emoji}</Text>
          ))}
        </View>
      );
    } else if (level.id === 4) {
      // For number words
      return (
        <View style={styles.wordContainer}>
          <Text style={[styles.wordText, { color: colors.primary }]}>
            {currentQuestion.description}
          </Text>
        </View>
      );
    } else {
      // For regular numbers
      return (
        <View style={styles.numberDisplay}>
          <Text style={styles.numberEmoji}>{emoji}</Text>
          <Text style={[styles.numberDescription, { color: colors.text }]}>
            {currentQuestion.description}
          </Text>
        </View>
      );
    }
  };

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.targetNumber;
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
        if (currentQuestionIndex + 1 >= level.questions.length) {
          const earnedStars = calculateStars();
          setStars(earnedStars);
          
          if (currentLevel === levels.length - 1) {
            setShowComplete(true);
          } else {
            setShowReward(true);
          }
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
          generateOptions();
        }
      }, 1500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

  const nextLevel = () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    generateOptions();
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowComplete(false);
    setSelectedAnswer(null);
    generateOptions();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Number Hunt</Text>
        <View style={[styles.scoreBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          Question {currentQuestionIndex + 1} of {level.questions.length}
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

      {/* Feedback */}
      {selectedAnswer && !isCorrect && (
        <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="tips-and-updates" size={20} color={colors.error} />
          <Text style={[styles.feedbackText, { color: colors.error }]}>
            Try again! Count carefully.
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Great Counting!</Text>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Number Champion!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You mastered all numbers!
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
  wordContainer: {
    alignItems: 'center',
  },
  wordText: { fontSize: 36, fontWeight: 'bold', letterSpacing: 5 },
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