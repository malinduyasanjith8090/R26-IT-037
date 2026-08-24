// app/(games)/SimplePuzzleGame.tsx (with Sinhala voice instruction)
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

// ─── Sinhala external audio map ─────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/games/simplePuzzleinstruction.mp3'),
};

export default function SimplePuzzleGame() {
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
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const successAnim = useState(new Animated.Value(1))[0];

  // ─── Sinhala voice state ──────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

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
        ? 'මෙම ක්‍රීඩාවේදී, අපි පෙන්වන රූපයට කෑලි නිවැරදි අනුපිළිවෙලට සකස් කරන්න. කෑල්ලක් තට්ටු කර, පසුව තවත් කෑල්ලක් තට්ටු කර ඒවා මාරු කරන්න.'
        : 'In this game, arrange the pieces in the correct order to match the shown image. Tap a piece, then tap another piece to swap them.';

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
        ? 'මෙම ක්‍රීඩාවේදී, අපි පෙන්වන රූපයට කෑලි නිවැරදි අනුපිළිවෙලට සකස් කරන්න. කෑල්ලක් තට්ටු කර, පසුව තවත් කෑල්ලක් තට්ටු කර ඒවා මාරු කරන්න.'
        : 'In this game, arrange the pieces in the correct order to match the shown image. Tap a piece, then tap another piece to swap them.';
      speak(instructionText, 'instruction');
    }
  }, [soundsLoaded]);

  const calculateStars = () => {
    const minMoves = level.pieces.length;
    if (moves <= minMoves + 2) return 3;
    if (moves <= minMoves + 5) return 2;
    return 1;
  };

  const checkComplete = async () => {
    const isComplete = pieces.every(
      (piece, index) => piece.id === pieces[index]?.id
    );

    if (isComplete) {
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
    }
  };

  const handlePiecePress = async (index: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
      await playSound('click', true);
    } else if (selectedPiece !== index) {
      const newPieces = [...pieces];
      const temp = newPieces[selectedPiece];
      newPieces[selectedPiece] = newPieces[index];
      newPieces[index] = temp;

      setPieces(newPieces);
      setMoves(moves + 1);

      await playSound('click', true);

      setSelectedPiece(null);
      await checkComplete();
    } else {
      setSelectedPiece(null);
      await playSound('click', false);
    }
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

  const renderPiece = (piece: PuzzlePiece, index: number) => {
    const pieceSize = (width - 80) / 2;
    const isSelected = selectedPiece === index;
    const isCorrect = piece.id === index && !showReward;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.piece,
          {
            width: pieceSize,
            height: pieceSize,
            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
            borderColor: isCorrect ? colors.success : colors.primaryLight,
            borderWidth: isCorrect ? 4 : 2,
          },
        ]}
        onPress={() => handlePiecePress(index)}
      >
        <Animated.View style={{ transform: [{ scale: isSelected ? 1.1 : 1 }] }}>
          <Text style={styles.pieceEmoji}>{piece.emoji}</Text>
          {isCorrect && (
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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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