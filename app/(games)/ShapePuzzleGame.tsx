// app/(games)/ShapePuzzleGame.tsx (with Sinhala voice instruction)
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
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

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

// ─── Sinhala external audio map ─────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/games/shapePuzzle/instruction.mp3'),
};

export default function ShapePuzzleGame() {
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
  const [pieces, setPieces] = useState<ShapePiece[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ShapePiece | null>(null);
  const [score, setScore] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  const level = levels[currentLevel];

  // ─── Sinhala voice state ──────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  const initializeGame = () => {
    const shuffled = [...level.pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPieces(shuffled);
    setQuestionCount(0);
    setScore(0);
    setSelectedAnswerId(null);
    nextQuestion(shuffled);
  };

  const nextQuestion = (currentPieces: ShapePiece[]) => {
    if (questionCount < level.pieces.length) {
      setCurrentQuestion(currentPieces[questionCount]);
      setSelectedAnswerId(null);
    }
  };

  useEffect(() => {
    initializeGame();
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
        ? 'මෙම ක්‍රීඩාවේදී, ඉහළින් පෙන්වන හැඩයට ගැලපෙන නිවැරදි කොටස තෝරන්න. සියලුම ප්‍රශ්නවලට නිවැරදිව පිළිතුරු දී ජයග්‍රහණය කරන්න.'
        : 'In this game, choose the correct piece that matches the shape shown above. Answer all questions correctly to win.';

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
        ? 'මෙම ක්‍රීඩාවේදී, ඉහළින් පෙන්වන හැඩයට ගැලපෙන නිවැරදි කොටස තෝරන්න. සියලුම ප්‍රශ්නවලට නිවැරදිව පිළිතුරු දී ජයග්‍රහණය කරන්න.'
        : 'In this game, choose the correct piece that matches the shape shown above. Answer all questions correctly to win.';
      speak(instructionText, 'instruction');
    }
  }, [soundsLoaded]);

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = async (selectedPiece: ShapePiece) => {
    if (selectedAnswerId !== null) return;

    setSelectedAnswerId(selectedPiece.id);
    const isCorrect = selectedPiece.id === currentQuestion?.id;

    if (isCorrect) {
      await playCorrectAnswer();

      const newScore = score + 10;
      setScore(newScore);
      setShowCorrectFeedback(true);

      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(async () => {
        setShowCorrectFeedback(false);

        if (questionCount + 1 >= level.pieces.length) {
          const earnedStars = Math.floor((score + 10) / 30) + 1;
          setStars(earnedStars > 3 ? 3 : earnedStars);

          if (currentLevel === levels.length - 1) {
            await playCelebration();
            setShowComplete(true);
          } else {
            await playSound('levelUp', false);
            setShowReward(true);
          }
        } else {
          setQuestionCount(questionCount + 1);
          const remainingPieces = [...pieces];
          nextQuestion(remainingPieces);
          await playSound('click', false);
        }
        setSelectedAnswerId(null);
      }, 1500);
    } else {
      await playSound('error', true);
      shakeAnimation();

      setTimeout(() => {
        setSelectedAnswerId(null);
      }, 800);
    }
  };

  const nextLevel = async () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
    await playSound('click', false);
  };

  const resetGame = async () => {
    setCurrentLevel(0);
    setShowComplete(false);
    setScore(0);
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
            style={[
              styles.optionCard,
              {
                backgroundColor: colors.surface,
                transform: [{ translateX: selectedAnswerId === piece.id && selectedAnswerId !== currentQuestion?.id ? shakeAnim : 0 }]
              }
            ]}
            onPress={() => handleAnswer(piece)}
            disabled={selectedAnswerId !== null}
          >
            {renderShape(piece.shape, 80)}
            <Text style={[styles.optionName, { color: colors.text }]}>{piece.name}</Text>
            {selectedAnswerId === piece.id && (
              <MaterialIcons
                name={piece.id === currentQuestion?.id ? "check-circle" : "cancel"}
                size={24}
                color={piece.id === currentQuestion?.id ? colors.success : colors.error}
                style={styles.answerIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Correct Answer Feedback */}
      {showCorrectFeedback && (
        <Animated.View style={[styles.correctFeedback, { transform: [{ scale: scaleAnim }] }]}>
          <MaterialIcons name="check-circle" size={32} color={colors.success} />
          <Text style={[styles.correctFeedbackText, { color: colors.success }]}>
            Correct! +10 points
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
                width: `${((questionCount) / level.pieces.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Hint Section */}
      <View style={[styles.hintContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="lightbulb" size={20} color={colors.accentYellow} />
        <Text style={[styles.hintText, { color: colors.textLight }]}>
          Tip: Look at the shape's outline and color!
        </Text>
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
              <Text style={[styles.finalScore, { color: colors.primary }]}>
                Final Score: {score} points
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
    position: 'relative',
  },
  optionName: { fontSize: Typography.fontSize.sm, marginTop: Spacing.sm },
  answerIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  correctFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  correctFeedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  hintText: { fontSize: Typography.fontSize.sm, flex: 1 },
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
  finalScore: { fontSize: 18, fontWeight: 'bold', marginTop: Spacing.md },
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