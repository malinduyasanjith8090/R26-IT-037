// app/(games)/SimplePuzzleGame.tsx
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

interface PuzzlePiece {
  id: number;
  emoji: string;
  correctPosition: number;
  currentPosition: number;
}

interface Level {
  id: number;
  name: string;
  pieces: PuzzlePiece[];
  image: string;
  backgroundEmoji: string;
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Fruit Puzzle',
    pieces: [
      { id: 0, emoji: '🍎', correctPosition: 0, currentPosition: 0 },
      { id: 1, emoji: '🍌', correctPosition: 1, currentPosition: 1 },
      { id: 2, emoji: '🍊', correctPosition: 2, currentPosition: 2 },
      { id: 3, emoji: '🍓', correctPosition: 3, currentPosition: 3 },
    ],
    image: '🍎🍌🍊🍓',
    backgroundEmoji: '🍎',
  },
  {
    id: 2,
    name: 'Animal Puzzle',
    pieces: [
      { id: 0, emoji: '🦁', correctPosition: 0, currentPosition: 0 },
      { id: 1, emoji: '🐘', correctPosition: 1, currentPosition: 1 },
      { id: 2, emoji: '🐒', correctPosition: 2, currentPosition: 2 },
      { id: 3, emoji: '🦒', correctPosition: 3, currentPosition: 3 },
    ],
    image: '🦁🐘🐒🦒',
    backgroundEmoji: '🦁',
  },
  {
    id: 3,
    name: 'Shape Puzzle',
    pieces: [
      { id: 0, emoji: '🔴', correctPosition: 0, currentPosition: 0 },
      { id: 1, emoji: '🟦', correctPosition: 1, currentPosition: 1 },
      { id: 2, emoji: '🔺', correctPosition: 2, currentPosition: 2 },
      { id: 3, emoji: '⭐', correctPosition: 3, currentPosition: 3 },
    ],
    image: '🔴🟦🔺⭐',
    backgroundEmoji: '🔴',
  },
  {
    id: 4,
    name: 'Emoji Puzzle',
    pieces: [
      { id: 0, emoji: '😊', correctPosition: 0, currentPosition: 0 },
      { id: 1, emoji: '😂', correctPosition: 1, currentPosition: 1 },
      { id: 2, emoji: '🥰', correctPosition: 2, currentPosition: 2 },
      { id: 3, emoji: '😎', correctPosition: 3, currentPosition: 3 },
    ],
    image: '😊😂🥰😎',
    backgroundEmoji: '😊',
  },
  {
    id: 5,
    name: 'Transport Puzzle',
    pieces: [
      { id: 0, emoji: '🚗', correctPosition: 0, currentPosition: 0 },
      { id: 1, emoji: '🚌', correctPosition: 1, currentPosition: 1 },
      { id: 2, emoji: '🚲', correctPosition: 2, currentPosition: 2 },
      { id: 3, emoji: '✈️', correctPosition: 3, currentPosition: 3 },
    ],
    image: '🚗🚌🚲✈️',
    backgroundEmoji: '🚗',
  },
];

export default function SimplePuzzleGame() {
  const { colors } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const level = levels[currentLevel];

  const initializePuzzle = () => {
    const shuffled = [...level.pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      shuffled[i].currentPosition = i;
      shuffled[j].currentPosition = j;
    }
    setPieces(shuffled);
    setSelectedPiece(null);
    setMoves(0);
  };

  useEffect(() => {
    initializePuzzle();
  }, [currentLevel]);

  const calculateStars = () => {
    const minMoves = level.pieces.length;
    if (moves <= minMoves + 2) return 3;
    if (moves <= minMoves + 5) return 2;
    return 1;
  };

  const checkComplete = () => {
    const isComplete = pieces.every(
      (piece, index) => piece.id === pieces[index]?.id
    );
    
    if (isComplete) {
      const earnedStars = calculateStars();
      setStars(earnedStars);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (currentLevel === levels.length - 1) {
        setShowComplete(true);
      } else {
        setShowReward(true);
      }
    }
  };

  const handlePiecePress = (index: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      const newPieces = [...pieces];
      const temp = newPieces[selectedPiece];
      newPieces[selectedPiece] = newPieces[index];
      newPieces[index] = temp;
      
      setPieces(newPieces);
      setMoves(moves + 1);
      setSelectedPiece(null);
      
      checkComplete();
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

  const renderPiece = (piece: PuzzlePiece, index: number) => {
    const pieceSize = (width - 80) / 2;
    const isSelected = selectedPiece === index;
    const isCorrect = piece.id === index;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.piece,
          {
            width: pieceSize,
            height: pieceSize,
            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
            borderColor: isCorrect && !showReward ? colors.success : colors.primaryLight,
            borderWidth: isCorrect && !showReward ? 4 : 2,
          },
        ]}
        onPress={() => handlePiecePress(index)}
      >
        <Animated.View style={{ transform: [{ scale: isSelected ? 1.1 : 1 }] }}>
          <Text style={styles.pieceEmoji}>{piece.emoji}</Text>
          {isCorrect && !showReward && (
            <View style={styles.correctBadge}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Simple Puzzle</Text>
        <View style={[styles.movesBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="swap-horiz" size={20} color={colors.primary} />
          <Text style={[styles.movesText, { color: colors.text }]}>{moves}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          Level {currentLevel + 1} of {levels.length}
        </Text>
      </View>

      {/* Target Image */}
      <View style={[styles.targetContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.targetLabel, { color: colors.text }]}>Complete this puzzle:</Text>
        <Text style={styles.targetImage}>{level.image}</Text>
      </View>

      {/* Puzzle Board */}
      <View style={styles.board}>
        {pieces.map((piece, index) => renderPiece(piece, index))}
      </View>

      {/* Hint */}
      <View style={[styles.hintContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="lightbulb" size={20} color={colors.accentYellow} />
        <Text style={[styles.hintText, { color: colors.textLight }]}>
          Tap a piece, then tap another piece to swap them!
        </Text>
      </View>

      {/* Level Reward Modal */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Great Job!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You completed {level.name} in {moves} moves!
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Puzzle Master!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You solved all the puzzles!
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
  movesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
  },
  movesText: { fontSize: Typography.fontSize.md, fontWeight: 'bold' },
  levelContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  levelName: { fontSize: Typography.fontSize.md, fontWeight: 'bold' },
  levelProgress: { fontSize: Typography.fontSize.sm, marginTop: Spacing.xs },
  targetContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  targetLabel: { fontSize: Typography.fontSize.sm, marginBottom: Spacing.sm },
  targetImage: { fontSize: 40 },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  piece: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    margin: 4,
  },
  pieceEmoji: { fontSize: 48 },
  correctBadge: { position: 'absolute', top: -10, right: -10 },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  hintText: { fontSize: Typography.fontSize.sm },
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