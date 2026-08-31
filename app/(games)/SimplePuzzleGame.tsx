// app/(games)/SimplePuzzleGame.tsx (with Sinhala voice instruction)
// ─────────────────────────────────────────────────────────────
// Redesigned as an actual SLIDING-TILE PUZZLE (classic n-puzzle):
// a grid has one empty slot, and tapping a tile next to the empty
// slot slides it in. The grid grows harder each level (2x2 → 4x4).
// Same theme/colors/hooks as the original file.
// ─────────────────────────────────────────────────────────────
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

const { width } = Dimensions.get('window');

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Level / puzzle data ────────────────────────────────────────
// Each level defines a gridSize (N) and N*N - 1 unique emoji "pieces".
// The board is solved when piece with id `i` sits at index `i`,
// and the last cell (index N*N - 1) is empty.
interface Level {
  id: number;
  name: string;
  gridSize: number;
  pieces: string[]; // length = gridSize*gridSize - 1
  backgroundEmoji: string;
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Fruit Puzzle',
    gridSize: 2,
    pieces: ['🍎', '🍌', '🍊'],
    backgroundEmoji: '🍎',
  },
  {
    id: 2,
    name: 'Animal Puzzle',
    gridSize: 3,
    pieces: ['🦁', '🐘', '🐒', '🦒', '🦓', '🐊', '🦍', '🐆'],
    backgroundEmoji: '🦁',
  },
  {
    id: 3,
    name: 'Shape Puzzle',
    gridSize: 3,
    pieces: ['🔴', '🟦', '🔺', '⭐', '🟢', '🟣', '🔶', '🟡'],
    backgroundEmoji: '🔴',
  },
  {
    id: 4,
    name: 'Emoji Puzzle',
    gridSize: 3,
    pieces: ['😊', '😂', '🥰', '😎', '🤩', '🥳', '😇', '🤗'],
    backgroundEmoji: '😊',
  },
  {
    id: 5,
    name: 'Transport Puzzle',
    gridSize: 4,
    pieces: [
      '🚗', '🚌', '🚲', '✈️',
      '🚀', '🚁', '🚂', '🚤',
      '🚡', '🚜', '🏍️', '🚓',
      '🚑', '🚒', '⛵',
    ],
    backgroundEmoji: '🚗',
  },
];

const EMPTY = -1;

// ─── Sinhala external audio map ─────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/games/simplePuzzleinstruction.mp3'),
};
// NOTE: this audio file was recorded for the old "tap two pieces to
// swap" mechanic. The Sinhala fallback text below has been updated
// to describe the new sliding-tile mechanic, but the .mp3 itself
// should be re-recorded to match for the best experience.

export default function SimplePuzzleGame() {
  const { colors } = useTheme();
  const { t, language } = useLanguage(); // ← language
  const {
    playSound,
    playCelebration,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled,
  } = useSound();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const successAnim = useState(new Animated.Value(1))[0];
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ─── Sinhala voice state ──────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  const level = levels[currentLevel];
  const totalCells = level.gridSize * level.gridSize;

  // ─── Puzzle helpers ─────────────────────────────────────────
  const getNeighbors = (index: number, gridSize: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(index - gridSize); // up
    if (row < gridSize - 1) neighbors.push(index + gridSize); // down
    if (col > 0) neighbors.push(index - 1); // left
    if (col < gridSize - 1) neighbors.push(index + 1); // right
    return neighbors;
  };

  const isSolved = (b: number[]) =>
    b.every((value, index) =>
      index === b.length - 1 ? value === EMPTY : value === index
    );

  const initializePuzzle = () => {
    const size = level.gridSize * level.gridSize;
    const solved: number[] = Array.from({ length: size }, (_, i) =>
      i === size - 1 ? EMPTY : i
    );

    let working = [...solved];
    let blankIndex = size - 1;
    let lastMoveFrom = -1;

    // Shuffle by making a long chain of valid, non-reversing slides.
    // This guarantees the resulting board is always solvable.
    const shuffleSteps = size * 25;
    for (let step = 0; step < shuffleSteps; step++) {
      const neighbors = getNeighbors(blankIndex, level.gridSize).filter(
        (n) => n !== lastMoveFrom
      );
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      working[blankIndex] = working[pick];
      working[pick] = EMPTY;
      lastMoveFrom = blankIndex;
      blankIndex = pick;
    }

    // Safety net: if the shuffle happened to land on a solved board
    // (extremely rare), nudge it with one more move.
    if (isSolved(working)) {
      const neighbors = getNeighbors(blankIndex, level.gridSize);
      const pick = neighbors[0];
      working[blankIndex] = working[pick];
      working[pick] = EMPTY;
    }

    setBoard(working);
    setMoves(0);
  };

  useEffect(() => {
    initializePuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

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
      Object.values(sinhalaSounds.current).forEach((sound) => {
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

  const instructionText =
    language === 'si'
      ? 'මෙම ක්‍රීඩාවේදී, රූපය සම්පූර්ණ කිරීමට කැබලි නිවැරදි අනුපිළිවෙලට සකස් කරන්න. හිස් තැනට යාබද කැබැල්ලක් තට්ටු කර එය එහි ලිස්සා යවන්න.'
      : 'In this game, slide the tiles to put them back in order and complete the picture. Tap a tile next to the empty space to slide it in.';

  // Speak instruction when the game opens
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }
      speak(instructionText, 'instruction');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Pending instruction effect
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      speak(instructionText, 'instruction');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundsLoaded]);

  const calculateStars = () => {
    const optimalMoves = (totalCells - 1) * 3;
    if (moves <= optimalMoves) return 3;
    if (moves <= optimalMoves * 1.6) return 2;
    return 1;
  };

  const checkComplete = async (finalBoard: number[]) => {
    if (!isSolved(finalBoard)) return;

    const earnedStars = calculateStars();
    setStars(earnedStars);

    await playCorrectAnswer();
    await playStarEarned();

    setShowSuccessAnimation(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setTimeout(() => setShowSuccessAnimation(false), 1000);

    if (currentLevel === levels.length - 1) {
      await playCelebration();
      setShowComplete(true);
    } else {
      await playSound('reward', false);
      setShowReward(true);
    }
  };

  const shakeInvalidTap = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleTilePress = async (index: number) => {
    const blankIndex = board.indexOf(EMPTY);
    const neighbors = getNeighbors(blankIndex, level.gridSize);

    if (!neighbors.includes(index)) {
      shakeInvalidTap();
      await playSound('click', false);
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newBoard = [...board];
    newBoard[blankIndex] = newBoard[index];
    newBoard[index] = EMPTY;

    setBoard(newBoard);
    setMoves((m) => m + 1);
    await playSound('click', true);

    await checkComplete(newBoard);
  };

  const nextLevel = async () => {
    setShowReward(false);
    await playSound('click', false);
    setCurrentLevel(currentLevel + 1);
  };

  const resetGame = async () => {
    setShowComplete(false);
    await playSound('click', false);
    setCurrentLevel(0);
  };

  const handleReshuffle = async () => {
    await playSound('click', false);
    initializePuzzle();
  };

  const handleBack = async () => {
    await playSound('click', false);
    router.back();
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

  // ─── Board sizing ───────────────────────────────────────────
  const GAP = 6;
  const boardOuterWidth = width - Spacing.lg * 2 - Spacing.md * 2;
  const tileSize = (boardOuterWidth - GAP * (level.gridSize - 1)) / level.gridSize;
  const tileFontSize = Math.max(20, tileSize * 0.42);

  const renderTile = (value: number, index: number) => {
    if (value === EMPTY) {
      return (
        <View
          key={`empty-${index}`}
          style={[
            styles.tile,
            styles.emptyTile,
            {
              width: tileSize,
              height: tileSize,
              marginRight: (index + 1) % level.gridSize === 0 ? 0 : GAP,
              marginBottom: GAP,
              borderColor: colors.primaryLight,
              backgroundColor: colors.background,
            },
          ]}
        />
      );
    }

    const isCorrect = value === index;

    return (
      <TouchableOpacity
        // key by piece id so LayoutAnimation can animate it sliding
        // to its new position when the board re-renders
        key={`piece-${value}`}
        activeOpacity={0.75}
        style={[
          styles.tile,
          {
            width: tileSize,
            height: tileSize,
            marginRight: (index + 1) % level.gridSize === 0 ? 0 : GAP,
            marginBottom: GAP,
            backgroundColor: colors.surface,
            borderColor: isCorrect ? colors.success : colors.primaryLight,
            borderWidth: isCorrect ? 3 : 2,
          },
        ]}
        onPress={() => handleTilePress(index)}
      >
        <Text style={[styles.pieceEmoji, { fontSize: tileFontSize }]}>
          {level.pieces[value]}
        </Text>
        {isCorrect && (
          <View style={styles.correctBadge}>
            <MaterialIcons name="check-circle" size={18} color={colors.success} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.soundButton} onPress={handleToggleSound}>
          <MaterialIcons
            name={soundEnabled ? 'volume-up' : 'volume-off'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Slide Puzzle</Text>
        <View style={[styles.movesBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="swap-horiz" size={20} color={colors.primary} />
          <Text style={[styles.movesText, { color: colors.text }]}>{moves}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>
          {level.backgroundEmoji} {level.name}
        </Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          Level {currentLevel + 1} of {levels.length} · {level.gridSize}×{level.gridSize} grid
        </Text>
      </View>

      {/* Target preview */}
      <View style={[styles.targetContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.targetLabel, { color: colors.text }]}>Complete this picture:</Text>
        <View style={[styles.previewGrid, { width: level.gridSize * 26 }]}>
          {level.pieces.map((emoji, i) => (
            <View key={i} style={styles.previewCell}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
          ))}
          <View style={[styles.previewCell, styles.previewEmptyCell, { borderColor: colors.primaryLight }]} />
        </View>
      </View>

      {/* Puzzle Board */}
      <Animated.View
        style={[
          styles.board,
          {
            width: boardOuterWidth,
            transform: [
              {
                translateX: shakeAnim.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-6, 6],
                }),
              },
            ],
          },
        ]}
      >
        {board.map((value, index) => renderTile(value, index))}
      </Animated.View>

      {/* Reshuffle */}
      <TouchableOpacity
        style={[styles.reshuffleButton, { borderColor: colors.primaryLight }]}
        onPress={handleReshuffle}
      >
        <MaterialIcons name="shuffle" size={18} color={colors.primary} />
        <Text style={[styles.reshuffleText, { color: colors.primary }]}>Reshuffle</Text>
      </TouchableOpacity>

      {/* Hint */}
      <View style={[styles.hintContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="lightbulb" size={20} color={colors.accentYellow} />
        <Text style={[styles.hintText, { color: colors.textLight }]}>
          Tap a tile next to the empty space to slide it into place!
        </Text>
      </View>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <Animated.View style={[styles.successOverlay, { transform: [{ scale: successAnim }] }]}>
          <View style={[styles.successContent, { backgroundColor: colors.success }]}>
            <MaterialIcons name="check-circle" size={60} color="#FFF" />
            <Text style={styles.successText}>Perfect Match!</Text>
          </View>
        </Animated.View>
      )}

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
                  onPress={handleBack}
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
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewCell: {
    width: 24,
    height: 24,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewEmptyCell: {
    borderWidth: 1,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  previewEmoji: { fontSize: 16 },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  emptyTile: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  pieceEmoji: { fontSize: 40 },
  correctBadge: { position: 'absolute', top: -8, right: -8 },
  reshuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
  },
  reshuffleText: { fontSize: Typography.fontSize.sm, fontWeight: 'bold' },
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
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContent: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  successText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
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