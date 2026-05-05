// app/(games)/EmotionMatchGame.tsx (with Sounds & Haptics)
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useSound } from '../../hooks/useSound';

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

// Emotion coping strategy suggestions
const copingStrategies: { [key: string]: string } = {
  happy: 'Share your happiness with someone! 😊',
  sad: 'It\'s okay to cry. Talk to someone you trust. 🤗',
  angry: 'Take deep breaths. Count to 10. 🧘',
  surprised: 'Embrace the surprise! It\'s okay to be amazed. ✨',
  loved: 'You are loved! Give someone a hug. 💕',
  scared: 'You are safe. Ask for help if you need it. 🛡️',
  tired: 'Rest is important. Take a break. 😴',
  excited: 'Enjoy the excitement! Share it with others. 🎉',
  calm: 'Peaceful moments are wonderful. 🕊️',
  silly: 'Being silly is fun and healthy! 🤪',
  proud: 'Celebrate your achievements! You deserve it. 🏆',
  lonely: 'You are not alone. Reach out to someone. 💌',
};

export default function EmotionMatchGame() {
  const { colors } = useTheme();
  const { 
    playSound, 
    playCelebration, 
    playStarEarned, 
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled 
  } = useSound();
  
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
  const [levelEmotions, setLevelEmotions] = useState<Emotion[]>([]);
  const [showCopingTip, setShowCopingTip] = useState(false);
  const [copingMessage, setCopingMessage] = useState('');
  const scaleAnim = useState(new Animated.Value(1))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];
  const bounceAnim = useState(new Animated.Value(1))[0];

  const level = levels[currentLevel];

  useEffect(() => {
    initializeLevel();
  }, [currentLevel]);

  useEffect(() => {
    if (levelEmotions.length > 0 && questionCount < levelEmotions.length) {
      const current = levelEmotions[questionCount];
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
  }, [questionCount, levelEmotions]);

  const initializeLevel = () => {
    const shuffled = [...level.emotions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setLevelEmotions(shuffled);
    setQuestionCount(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(false);
  };

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

  const showCopingStrategy = (emotionId: string) => {
    const strategy = copingStrategies[emotionId] || 'Take a moment to understand your feelings. 💭';
    setCopingMessage(strategy);
    setShowCopingTip(true);
    setTimeout(() => setShowCopingTip(false), 4000);
  };

  const handleAnswer = async (selected: Emotion) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(selected.id);
    const correct = selected.id === currentEmotion?.id;
    setIsCorrect(correct);

    if (correct) {
      // Play correct answer sound
      await playCorrectAnswer();
      
      const newScore = score + 10;
      setScore(newScore);
      
      // Show coping strategy for the emotion
      showCopingStrategy(selected.id);
      
      // Play star sounds for extra delight
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        if (questionCount + 1 >= level.emotions.length) {
          const earnedStars = calculateStars();
          setStars(earnedStars);
          
          if (currentLevel === levels.length - 1) {
            playCelebration();
            setShowComplete(true);
          } else {
            setShowReward(true);
          }
        } else {
          setQuestionCount(questionCount + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
        }
      }, 1500);
    } else {
      await playSound('error', true);
      shakeAnimation();
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  const nextLevel = async () => {
    setShowReward(false);
    await playSound('click', false);
    setCurrentLevel(currentLevel + 1);
    setSelectedAnswer(null);
  };

  const resetGame = async () => {
    await playSound('click', false);
    setCurrentLevel(0);
    setScore(0);
    setShowComplete(false);
    setSelectedAnswer(null);
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

  if (!currentEmotion) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colors.text }]}>Emotion Match</Text>
        
        {/* Sound Toggle Button */}
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

      {/* Coping Strategy Tip */}
      {showCopingTip && (
        <Animated.View style={[styles.copingContainer, { backgroundColor: currentEmotion?.color }]}>
          <MaterialIcons name="favorite" size={20} color="#FFF" />
          <Text style={styles.copingText}>{copingMessage}</Text>
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
  copingContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  copingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
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