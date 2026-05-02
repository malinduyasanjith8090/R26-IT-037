// app/(games)/EmotionMatchGame.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

interface Emotion {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: string;
}

interface Level {
  id: number;
  name: string;
  emotions: Emotion[];
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Basic Emotions',
    emotions: [
      { id: 'happy', emoji: '😊', name: 'Happy', description: 'Feeling good and smiling', color: '#FFD700' },
      { id: 'sad', emoji: '😢', name: 'Sad', description: 'Feeling down with tears', color: '#6B8EFF' },
      { id: 'angry', emoji: '😠', name: 'Angry', description: 'Feeling upset and frustrated', color: '#FF6B6B' },
      { id: 'surprised', emoji: '😲', name: 'Surprised', description: 'Unexpected surprise!', color: '#FFB347' },
    ],
  },
  {
    id: 2,
    name: 'More Feelings',
    emotions: [
      { id: 'loved', emoji: '🥰', name: 'Loved', description: 'Feeling cared for', color: '#FF69B4' },
      { id: 'scared', emoji: '😨', name: 'Scared', description: 'Feeling afraid', color: '#9370DB' },
      { id: 'tired', emoji: '😴', name: 'Tired', description: 'Need to rest', color: '#A9A9A9' },
      { id: 'excited', emoji: '🤩', name: 'Excited', description: 'Can\'t wait!', color: '#FF4500' },
    ],
  },
  {
    id: 3,
    name: 'Advanced Emotions',
    emotions: [
      { id: 'calm', emoji: '😌', name: 'Calm', description: 'Peaceful and relaxed', color: '#90EE90' },
      { id: 'silly', emoji: '😜', name: 'Silly', description: 'Playful and funny', color: '#FFA500' },
      { id: 'proud', emoji: '🦸', name: 'Proud', description: 'Happy with achievement', color: '#FFD700' },
      { id: 'lonely', emoji: '🥺', name: 'Lonely', description: 'Wanting company', color: '#B0C4DE' },
    ],
  },
];

export default function EmotionMatchGame() {
  const { colors } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [options, setOptions] = useState<Emotion[]>([]);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stars, setStars] = useState(3);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  const level = levels[currentLevel];

  const initializeLevel = () => {
    const shuffled = [...level.emotions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuestionCount(0);
    nextQuestion(shuffled);
  };

  const nextQuestion = (emotionsList: Emotion[]) => {
    if (questionCount < level.emotions.length) {
      const current = emotionsList[questionCount];
      setCurrentEmotion(current);
      
      // Generate options (current + 3 random others)
      const otherEmotions = level.emotions.filter(e => e.id !== current.id);
      const shuffledOthers = [...otherEmotions];
      for (let i = shuffledOthers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOthers[i], shuffledOthers[j]] = [shuffledOthers[j], shuffledOthers[i]];
      }
      const optionList = [current, ...shuffledOthers.slice(0, 3)];
      for (let i = optionList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionList[i], optionList[j]] = [optionList[j], optionList[i]];
      }
      setOptions(optionList);
    }
  };

  useEffect(() => {
    initializeLevel();
  }, [currentLevel]);

  const calculateStars = () => {
    const correctAnswers = Math.floor(score / 10);
    if (correctAnswers === level.emotions.length) return 3;
    if (correctAnswers >= level.emotions.length - 1) return 2;
    return 1;
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = (selected: Emotion) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(selected.id);
    const correct = selected.id === currentEmotion?.id;
    setIsCorrect(correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newScore = score + 10;
      setScore(newScore);
      
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        if (questionCount + 1 >= level.emotions.length) {
          const earnedStars = calculateStars();
          setStars(earnedStars);
          
          if (currentLevel === levels.length - 1) {
            setShowComplete(true);
          } else {
            setShowReward(true);
          }
        } else {
          setQuestionCount(questionCount + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
          const remainingEmotions = [...level.emotions];
          nextQuestion(remainingEmotions);
        }
      }, 1500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeAnimation();
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  const nextLevel = () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
    setScore(0);
    setSelectedAnswer(null);
  };

  const resetGame = () => {
    setCurrentLevel(0);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Emotion Match</Text>
        <View style={[styles.scoreBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          Question {questionCount + 1} of {level.emotions.length}
        </Text>
      </View>

      {/* Current Emotion Display */}
      {currentEmotion && (
        <Animated.View 
          style={[
            styles.emotionCard, 
            { 
              backgroundColor: currentEmotion.color + '20',
              transform: [{ translateX: shakeAnim }]
            }
          ]}
        >
          <Text style={styles.emotionEmoji}>{currentEmotion.emoji}</Text>
          <Text style={[styles.emotionDescription, { color: colors.text }]}>
            {currentEmotion.description}
          </Text>
        </Animated.View>
      )}

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          How is this person feeling?
        </Text>
      </View>

      {/* Options */}
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              {
                backgroundColor: colors.surface,
                borderColor: selectedAnswer === option.id
                  ? (isCorrect && option.id === currentEmotion?.id ? colors.success : colors.error)
                  : colors.primaryLight,
                borderWidth: 3,
              },
            ]}
            onPress={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionName, { color: colors.text }]}>{option.name}</Text>
              <Text style={[styles.optionDescription, { color: colors.textLight }]}>
                {option.description}
              </Text>
            </View>
            {selectedAnswer === option.id && (
              <MaterialIcons
                name={isCorrect && option.id === currentEmotion?.id ? "check-circle" : "cancel"}
                size={28}
                color={isCorrect && option.id === currentEmotion?.id ? colors.success : colors.error}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((questionCount) / level.emotions.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Tip */}
      <View style={[styles.tipContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="emoji-emotions" size={20} color={colors.primary} />
        <Text style={[styles.tipText, { color: colors.textLight }]}>
          Tip: Look at the face and think about how they feel!
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
                You understand {level.name} well!
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Emotion Master!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You understand all emotions!
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
  emotionCard: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  emotionEmoji: { fontSize: 80, marginBottom: Spacing.md },
  emotionDescription: { fontSize: 18, textAlign: 'center' },
  questionContainer: { alignItems: 'center', marginVertical: Spacing.md },
  questionText: { fontSize: Typography.fontSize.lg, fontWeight: 'bold' },
  optionsContainer: { padding: Spacing.md },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  optionEmoji: { fontSize: 40 },
  optionTextContainer: { flex: 1 },
  optionName: { fontSize: 18, fontWeight: 'bold' },
  optionDescription: { fontSize: 12, marginTop: 4 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginVertical: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipText: { fontSize: Typography.fontSize.sm, flex: 1 },
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

function useEffect(arg0: () => void, arg1: number[]) {
    throw new Error('Function not implemented.');
}
