// app/(games)/WordMatchGame.tsx (with Sounds & Haptics)
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
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

const { width } = Dimensions.get('window');

interface WordPair {
  id: string;
  englishWord: string;
  sinhalaWord: string;
  emoji: string;
  category: string;
  imageEmoji: string;
}

interface Level {
  id: number;
  name: string;
  nameSin: string;
  pairs: WordPair[];
}

const wordPairs: WordPair[] = [
  // Animals
  { id: 'cat', englishWord: 'Cat', sinhalaWord: 'බළලා', emoji: '🐱', category: 'Animals', imageEmoji: '🐱' },
  { id: 'dog', englishWord: 'Dog', sinhalaWord: 'බල්ලා', emoji: '🐶', category: 'Animals', imageEmoji: '🐶' },
  { id: 'bird', englishWord: 'Bird', sinhalaWord: 'කුරුල්ලා', emoji: '🐦', category: 'Animals', imageEmoji: '🐦' },
  { id: 'fish', englishWord: 'Fish', sinhalaWord: 'මාළුවා', emoji: '🐠', category: 'Animals', imageEmoji: '🐠' },
  { id: 'rabbit', englishWord: 'Rabbit', sinhalaWord: 'හාවා', emoji: '🐰', category: 'Animals', imageEmoji: '🐰' },
  
  // Fruits
  { id: 'apple', englishWord: 'Apple', sinhalaWord: 'ඇපල්', emoji: '🍎', category: 'Fruits', imageEmoji: '🍎' },
  { id: 'banana', englishWord: 'Banana', sinhalaWord: 'කෙසෙල්', emoji: '🍌', category: 'Fruits', imageEmoji: '🍌' },
  { id: 'orange', englishWord: 'Orange', sinhalaWord: 'දොඩම්', emoji: '🍊', category: 'Fruits', imageEmoji: '🍊' },
  { id: 'mango', englishWord: 'Mango', sinhalaWord: 'අඹ', emoji: '🥭', category: 'Fruits', imageEmoji: '🥭' },
  
  // Colors
  { id: 'red', englishWord: 'Red', sinhalaWord: 'රතු', emoji: '🔴', category: 'Colors', imageEmoji: '🔴' },
  { id: 'blue', englishWord: 'Blue', sinhalaWord: 'නිල්', emoji: '🔵', category: 'Colors', imageEmoji: '🔵' },
  { id: 'green', englishWord: 'Green', sinhalaWord: 'කොළ', emoji: '🟢', category: 'Colors', imageEmoji: '🟢' },
  { id: 'yellow', englishWord: 'Yellow', sinhalaWord: 'කහ', emoji: '🟡', category: 'Colors', imageEmoji: '🟡' },
  
  // Vehicles
  { id: 'car', englishWord: 'Car', sinhalaWord: 'කාර් එක', emoji: '🚗', category: 'Vehicles', imageEmoji: '🚗' },
  { id: 'bus', englishWord: 'Bus', sinhalaWord: 'බස් එක', emoji: '🚌', category: 'Vehicles', imageEmoji: '🚌' },
  { id: 'train', englishWord: 'Train', sinhalaWord: 'දුම්රිය', emoji: '🚂', category: 'Vehicles', imageEmoji: '🚂' },
  { id: 'airplane', englishWord: 'Airplane', sinhalaWord: 'ගුවන් යානය', emoji: '✈️', category: 'Vehicles', imageEmoji: '✈️' },
];

const levels: Level[] = [
  { id: 1, name: 'Animals', nameSin: 'සතුන්', pairs: wordPairs.filter(w => w.category === 'Animals').slice(0, 4) },
  { id: 2, name: 'Fruits', nameSin: 'පලතුරු', pairs: wordPairs.filter(w => w.category === 'Fruits').slice(0, 4) },
  { id: 3, name: 'Colors', nameSin: 'වර්ණ', pairs: wordPairs.filter(w => w.category === 'Colors') },
  { id: 4, name: 'Vehicles', nameSin: 'වාහන', pairs: wordPairs.filter(w => w.category === 'Vehicles') },
  { id: 5, name: 'Mixed', nameSin: 'මිශ්‍ර', pairs: wordPairs.slice(0, 8) },
];

export default function WordMatchGame() {
  const { colors } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { 
    playSound, 
    playCelebration, 
    playStarEarned, 
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled 
  } = useSound();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentPair, setCurrentPair] = useState<WordPair | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stars, setStars] = useState(3);
  const [levelPairs, setLevelPairs] = useState<WordPair[]>([]);
  const [matchMode, setMatchMode] = useState<'engToSin' | 'sinToEng' | 'emojiToWord'>('engToSin');
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  const level = levels[currentLevel];

  useEffect(() => {
    initializeLevel();
  }, [currentLevel, matchMode]);

  useEffect(() => {
    if (levelPairs.length > 0 && questionCount < levelPairs.length) {
      const current = levelPairs[questionCount];
      setCurrentPair(current);
      generateOptions(current);
    }
  }, [questionCount, levelPairs]);

  const initializeLevel = () => {
    const shuffled = [...level.pairs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setLevelPairs(shuffled);
    setQuestionCount(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(false);
  };

  const generateOptions = (current: WordPair) => {
    const otherPairs = levelPairs.filter(p => p.id !== current.id);
    const shuffledOthers = [...otherPairs];
    for (let i = shuffledOthers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOthers[i], shuffledOthers[j]] = [shuffledOthers[j], shuffledOthers[i]];
    }
    
    let optionValues: string[] = [];
    if (matchMode === 'engToSin') {
      optionValues = [current.sinhalaWord, ...shuffledOthers.slice(0, 3).map(p => p.sinhalaWord)];
    } else if (matchMode === 'sinToEng') {
      optionValues = [current.englishWord, ...shuffledOthers.slice(0, 3).map(p => p.englishWord)];
    } else {
      optionValues = [current.englishWord, ...shuffledOthers.slice(0, 3).map(p => p.englishWord)];
    }
    
    for (let i = optionValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionValues[i], optionValues[j]] = [optionValues[j], optionValues[i]];
    }
    setOptions(optionValues);
  };

  const calculateStars = () => {
    const correctCount = Math.floor(score / 10);
    if (correctCount === level.pairs.length) return 3;
    if (correctCount >= level.pairs.length - 1) return 2;
    return 1;
  };

  const getQuestionText = () => {
    if (!currentPair) return '';
    if (matchMode === 'engToSin') {
      return `${currentPair.englishWord} ${currentPair.emoji} means?`;
    } else if (matchMode === 'sinToEng') {
      return `${currentPair.sinhalaWord} ${currentPair.emoji} means?`;
    } else {
      return `What is this? ${currentPair.emoji}`;
    }
  };

  const getCorrectAnswer = (): string => {
    if (!currentPair) return '';
    if (matchMode === 'engToSin') return currentPair.sinhalaWord;
    if (matchMode === 'sinToEng') return currentPair.englishWord;
    return currentPair.englishWord;
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === getCorrectAnswer();
    setIsCorrect(correct);

    if (correct) {
      // Play correct answer sound with star effects
      await playCorrectAnswer();
      
      const newScore = score + 10;
      setScore(newScore);
      
      // Play additional star sounds
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(async () => {
        if (questionCount + 1 >= level.pairs.length) {
          const earnedStars = calculateStars();
          setStars(earnedStars);
          
          if (currentLevel === levels.length - 1) {
            await playCelebration();
            setShowComplete(true);
          } else {
            await playSound('reward', false);
            setShowReward(true);
          }
        } else {
          setQuestionCount(questionCount + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
          await playSound('click', false);
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
    setCurrentLevel(currentLevel + 1);
    setSelectedAnswer(null);
    await playSound('click', false);
  };

  const resetGame = async () => {
    setCurrentLevel(0);
    setScore(0);
    setShowComplete(false);
    setSelectedAnswer(null);
    await playSound('click', false);
  };

  const handleModeChange = async (mode: 'engToSin' | 'sinToEng' | 'emojiToWord') => {
    await playSound('click', false);
    setMatchMode(mode);
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

  if (!currentPair) {
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
        
        <Text style={[styles.title, { color: colors.text }]}>Word Match</Text>
        
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

      {/* Mode Selector */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, matchMode === 'engToSin' && { backgroundColor: colors.primary }]}
          onPress={() => handleModeChange('engToSin')}
        >
          <Text style={[styles.modeButtonText, { color: matchMode === 'engToSin' ? '#FFF' : colors.text }]}>
            English → සිංහල
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, matchMode === 'sinToEng' && { backgroundColor: colors.primary }]}
          onPress={() => handleModeChange('sinToEng')}
        >
          <Text style={[styles.modeButtonText, { color: matchMode === 'sinToEng' ? '#FFF' : colors.text }]}>
            සිංහල → English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, matchMode === 'emojiToWord' && { backgroundColor: colors.primary }]}
          onPress={() => handleModeChange('emojiToWord')}
        >
          <Text style={[styles.modeButtonText, { color: matchMode === 'emojiToWord' ? '#FFF' : colors.text }]}>
            🎯 Picture Match
          </Text>
        </TouchableOpacity>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>
          {language === 'en' ? level.name : level.nameSin}
        </Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          {t('question')} {questionCount + 1} of {level.pairs.length}
        </Text>
      </View>

      {/* Question Card */}
      <Animated.View 
        style={[
          styles.questionCard,
          { backgroundColor: colors.surface },
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        {matchMode === 'emojiToWord' && (
          <Text style={styles.questionEmoji}>{currentPair.emoji}</Text>
        )}
        <Text style={[styles.questionText, { color: colors.text }]}>
          {getQuestionText()}
        </Text>
      </Animated.View>

      {/* Options */}
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {options.map((option, index) => (
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
            <Text style={[styles.optionText, { color: colors.text, fontSize: matchMode === 'emojiToWord' ? 18 : 20 }]}>
              {option}
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
      </ScrollView>

      {/* Encouragement Message */}
      {score > 0 && score % 100 === 0 && score !== 0 && (
        <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20', marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.sm, borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }]}>
          <MaterialIcons name="emoji-events" size={20} color={colors.success} />
          <Text style={[styles.encouragementText, { color: colors.success, fontSize: 12 }]}>
            🎉 Amazing progress! Keep learning! 🎉
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
                width: `${((questionCount) / level.pairs.length) * 100}%`,
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Great Job!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You completed {language === 'en' ? level.name : level.nameSin}!
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Word Master!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You learned so many words in both languages!
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
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  modeButtonText: { fontSize: Typography.fontSize.xs, fontWeight: '600' },
  levelContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  levelName: { fontSize: Typography.fontSize.md, fontWeight: 'bold' },
  levelProgress: { fontSize: Typography.fontSize.sm, marginTop: Spacing.xs },
  questionCard: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  questionEmoji: { fontSize: 80, marginBottom: Spacing.md },
  questionText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  optionsContainer: { padding: Spacing.md },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  optionText: { fontSize: 18, fontWeight: '600', flex: 1 },
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  encouragementText: { fontSize: 12, fontWeight: '600' },
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