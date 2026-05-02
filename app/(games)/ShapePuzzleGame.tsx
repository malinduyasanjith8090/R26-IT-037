// app/(games)/ShapePuzzleGame.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

interface ShapePiece {
  id: string;
  shape: React.ReactNode;
  name: string;
  color: string;
}

interface Level {
  id: number;
  name: string;
  pieces: ShapePiece[];
  targetShape: string;
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Basic Shapes',
    pieces: [
      { id: 'circle', shape: <Circle cx="50" cy="50" r="40" fill="#FF6B6B" />, name: 'Circle', color: '#FF6B6B' },
      { id: 'square', shape: <Rect x="15" y="15" width="70" height="70" fill="#4ECDC4" />, name: 'Square', color: '#4ECDC4' },
      { id: 'triangle', shape: <Polygon points="50,20 20,80 80,80" fill="#FFD166" />, name: 'Triangle', color: '#FFD166' },
    ],
    targetShape: 'Match the shape!',
  },
  {
    id: 2,
    name: 'Advanced Shapes',
    pieces: [
      { id: 'rectangle', shape: <Rect x="15" y="25" width="70" height="50" fill="#06D6A0" />, name: 'Rectangle', color: '#06D6A0' },
      { id: 'oval', shape: <Ellipse cx="50" cy="50" rx="45" ry="30" fill="#118AB2" />, name: 'Oval', color: '#118AB2' },
      { id: 'heart', shape: <Path d="M 50 20 C 50 10, 30 10, 30 25 C 30 40, 50 60, 50 70 C 50 60, 70 40, 70 25 C 70 10, 50 10, 50 20 Z" fill="#EF476F" />, name: 'Heart', color: '#EF476F' },
    ],
    targetShape: 'Find the matching shape!',
  },
  {
    id: 3,
    name: 'Star Shapes',
    pieces: [
      { id: 'star', shape: <Path d="M 50 10 L 60 35 L 85 35 L 65 50 L 75 75 L 50 60 L 25 75 L 35 50 L 15 35 L 40 35 Z" fill="#FFD166" />, name: 'Star', color: '#FFD166' },
      { id: 'circle', shape: <Circle cx="50" cy="50" r="40" fill="#FF6B6B" />, name: 'Circle', color: '#FF6B6B' },
      { id: 'square', shape: <Rect x="15" y="15" width="70" height="70" fill="#4ECDC4" />, name: 'Square', color: '#4ECDC4' },
    ],
    targetShape: 'Find the star!',
  },
];

export default function ShapePuzzleGame() {
  const { colors } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pieces, setPieces] = useState<ShapePiece[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ShapePiece | null>(null);
  const [score, setScore] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const level = levels[currentLevel];

  const initializeGame = () => {
    const shuffled = [...level.pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPieces(shuffled);
    setQuestionCount(0);
    setScore(0);
    nextQuestion(shuffled);
  };

  const nextQuestion = (currentPieces: ShapePiece[]) => {
    if (questionCount < level.pieces.length) {
      setCurrentQuestion(currentPieces[questionCount]);
    }
  };

  useEffect(() => {
    initializeGame();
  }, [currentLevel]);

  const handleAnswer = (selectedPiece: ShapePiece) => {
    if (selectedPiece.id === currentQuestion?.id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newScore = score + 10;
      setScore(newScore);
      
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      if (questionCount + 1 >= level.pieces.length) {
        const earnedStars = Math.floor(score / 30) + 1;
        setStars(earnedStars > 3 ? 3 : earnedStars);
        
        if (currentLevel === levels.length - 1) {
          setShowComplete(true);
        } else {
          setShowReward(true);
        }
      } else {
        setQuestionCount(questionCount + 1);
        const remainingPieces = [...pieces];
        nextQuestion(remainingPieces);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  const nextLevel = () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setShowComplete(false);
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

  const renderShape = (shape: React.ReactNode, size: number) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {shape}
    </Svg>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Shape Puzzle</Text>
        <View style={[styles.scoreBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          Question {questionCount + 1} of {level.pieces.length}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>Find the:</Text>
        <Animated.View style={[styles.targetShape, { transform: [{ scale: scaleAnim }] }]}>
          {currentQuestion && renderShape(currentQuestion.shape, 150)}
          <Text style={[styles.shapeName, { color: currentQuestion?.color }]}>
            {currentQuestion?.name}
          </Text>
        </Animated.View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {pieces.map((piece, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionCard, { backgroundColor: colors.surface }]}
            onPress={() => handleAnswer(piece)}
          >
            {renderShape(piece.shape, 80)}
            <Text style={[styles.optionName, { color: colors.text }]}>{piece.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((questionCount) / level.pieces.length) * 100}%`,
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Level Complete!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You scored {score} points!
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Shape Master!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You identified all shapes!
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
  questionContainer: { alignItems: 'center', padding: Spacing.xl },
  questionText: { fontSize: Typography.fontSize.lg, marginBottom: Spacing.lg },
  targetShape: { alignItems: 'center' },
  shapeName: { fontSize: 24, fontWeight: 'bold', marginTop: Spacing.md },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: (width - 60) / 2,
  },
  optionName: { fontSize: Typography.fontSize.sm, marginTop: Spacing.sm },
  progressContainer: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
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