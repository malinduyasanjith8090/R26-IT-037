// components/learning/FruitsLearning.tsx (with Sounds)
import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
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
import { BorderRadius, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../hooks/useSound';

const { width } = Dimensions.get('window');

interface FruitLesson {
  id: string;
  name: string;
  emoji: string;
  color: string;
  taste: string;
  benefit: string;
}

const fruitsData: FruitLesson[] = [
  { id: 'apple', name: 'Apple', emoji: '🍎', color: '#FF3B30', taste: 'Sweet and crispy', benefit: '🍎 An apple a day keeps the doctor away!' },
  { id: 'banana', name: 'Banana', emoji: '🍌', color: '#FFCC00', taste: 'Soft and sweet', benefit: '⚡ Gives you energy to play all day!' },
  { id: 'orange', name: 'Orange', emoji: '🍊', color: '#FF9500', taste: 'Juicy and tangy', benefit: '💪 Vitamin C makes you strong!' },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', color: '#FF3B30', taste: 'Sweet and juicy', benefit: '❤️ Good for your heart!' },
  { id: 'grape', name: 'Grape', emoji: '🍇', color: '#5856D6', taste: 'Sweet and fun to eat', benefit: '🧠 Helps you remember things better!' },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', color: '#34C759', taste: 'Refreshing and sweet', benefit: '💧 Keeps you hydrated on sunny days!' },
  { id: 'pineapple', name: 'Pineapple', emoji: '🍍', color: '#FF9500', taste: 'Sweet and tropical', benefit: '🦷 Helps your digestion!' },
  { id: 'mango', name: 'Mango', emoji: '🥭', color: '#FF9500', taste: 'Sweet and creamy', benefit: '👀 Good for your eyesight!' },
  { id: 'peach', name: 'Peach', emoji: '🍑', color: '#FF6B6B', taste: 'Soft and sweet', benefit: '✨ Makes your skin healthy and glow!' },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', color: '#FF3B30', taste: 'Sweet and tart', benefit: '😴 Helps you sleep well at night!' },
];

export default function FruitsLearning({ onBack, onProgress }: any) {
  const { colors } = useTheme();
  const { 
    playSound, 
    playCelebration, 
    playStarEarned, 
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled 
  } = useSound();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [showNutritionTip, setShowNutritionTip] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentFruit = fruitsData[currentIndex];

  const getRandomRewardMessage = () => {
    const messages = [
      '🌟 Yummy! 🌟',
      '🎉 Fruit Master! 🎉',
      '⭐ Sweet Job! ⭐',
      '🎈 Delicious! 🎈',
      '🏆 Berry Good! 🏆',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentFruit.name;
    setIsCorrect(correct);

    if (correct) {
      // Play correct answer sound
      await playCorrectAnswer();
      
      const newScore = score + 10;
      setScore(newScore);
      setRewardMessage(getRandomRewardMessage());
      setShowRewardModal(true);
      
      // Play star sounds for extra delight
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(async () => {
        setShowRewardModal(false);
        setSelectedAnswer(null);
        setIsCorrect(false);

        if (currentIndex < fruitsData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / fruitsData.length) * 100);
          await playSound('click', false);
        } else {
          await playCelebration();
          setShowRewardModal(true);
          setRewardMessage('🎉 Complete! You mastered all fruits! 🎉');
        }
      }, 2000);
    } else {
      await playSound('error', true);
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  const getOptions = () => {
    const options = [currentFruit.name];
    const otherFruits = fruitsData.filter(f => f.name !== currentFruit.name).map(f => f.name).slice(0, 3);
    options.push(...otherFruits);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  const handleToggleSound = async () => {
    await playSound('click', false);
    toggleSound();
  };

  const handleCardPress = async () => {
    await playSound('click', false);
  };

  const showNutritionBenefit = async () => {
    setShowNutritionTip(true);
    await playSound('reward', false);
    setTimeout(() => setShowNutritionTip(false), 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
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
        
        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / fruitsData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {currentIndex + 1} of {fruitsData.length} Fruits
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Fruit Card */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleCardPress}
          >
            <View style={[styles.fruitCard, { backgroundColor: currentFruit.color + '20' }]}>
              <Text style={styles.fruitEmoji}>{currentFruit.emoji}</Text>
              <Text style={[styles.fruitName, { color: colors.text }]}>{currentFruit.name}</Text>
              <TouchableOpacity 
                style={[styles.tasteBadge, { backgroundColor: currentFruit.color }]}
                onPress={showNutritionBenefit}
              >
                <MaterialIcons name="info" size={16} color="#FFF" />
                <Text style={styles.tasteText}>{currentFruit.taste}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Health Benefit */}
          <View style={[styles.benefitContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="favorite" size={24} color={colors.success} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              {currentFruit.benefit}
            </Text>
          </View>

          {/* Fun Nutrition Fact */}
          <View style={[styles.nutritionContainer, { backgroundColor: colors.primaryLight + '30' }]}>
            <MaterialIcons name="restaurant" size={20} color={currentFruit.color} />
            <Text style={[styles.nutritionText, { color: colors.text }]}>
              {currentFruit.name}s are {currentFruit.taste.toLowerCase()}!
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 What fruit is this? 🤔
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {getOptions().map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selectedAnswer === option
                      ? (isCorrect ? colors.success : colors.error)
                      : colors.primaryLight,
                    borderWidth: 3,
                  }
                ]}
                onPress={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.optionEmoji}>
                  {fruitsData.find(f => f.name === option)?.emoji || '🍎'}
                </Text>
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
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
              <MaterialIcons name="sentiment-dissatisfied" size={24} color={colors.error} />
              <Text style={[styles.feedbackText, { color: colors.error }]}>
                ✗ Try again! The correct fruit is {currentFruit.name}! ✗
              </Text>
            </View>
          )}

          {/* Encouragement Message */}
          {score > 0 && score % 50 === 0 && score !== 0 && (
            <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="emoji-events" size={24} color={colors.success} />
              <Text style={[styles.encouragementText, { color: colors.success }]}>
                🎉 Great progress! You're becoming a fruit expert! 🎉
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Nutrition Tip Notification */}
      {showNutritionTip && (
        <Animated.View style={[styles.tipNotification, { backgroundColor: currentFruit.color }]}>
          <MaterialIcons name="favorite" size={20} color="#FFF" />
          <Text style={styles.tipNotificationText}>
            {currentFruit.benefit}
          </Text>
        </Animated.View>
      )}

      {/* Reward Modal */}
      <Modal
        visible={showRewardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🍎</Text>
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage.includes('Complete') ? (
                <>
                  <Text style={styles.rewardMessage}>🎉 You're a fruit expert! 🎉</Text>
                  <TouchableOpacity 
                    style={[styles.rewardButton, { backgroundColor: colors.primary }]}
                    onPress={async () => {
                      setShowRewardModal(false);
                      await playSound('goodbye', false);
                      if (onBack) onBack();
                    }}
                  >
                    <Text style={styles.rewardButtonText}>Back to Menu</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.rewardMessage}>+10 points for {currentFruit.name}!</Text>
                  <View style={styles.starContainer}>
                    {[...Array(3)].map((_, i) => (
                      <Text key={i} style={styles.star}>⭐</Text>
                    ))}
                  </View>
                  <TouchableOpacity 
                    style={[styles.continueButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowRewardModal(false)}
                  >
                    <Text style={styles.continueButtonText}>Continue →</Text>
                  </TouchableOpacity>
                </>
              )}
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: Spacing.md, 
    paddingTop: Spacing.xl 
  },
  backButton: { padding: Spacing.sm },
  soundButton: { padding: Spacing.sm },
  scoreBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.sm, 
    borderRadius: BorderRadius.round, 
    gap: Spacing.xs 
  },
  scoreText: { fontWeight: 'bold', fontSize: 18 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.xs },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },
  content: { alignItems: 'center', padding: Spacing.lg },
  fruitCard: { 
    width: width - 80, 
    alignItems: 'center', 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg 
  },
  fruitEmoji: { fontSize: 80, marginBottom: Spacing.md },
  fruitName: { fontSize: 28, fontWeight: 'bold' },
  tasteBadge: { 
    marginTop: Spacing.md, 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm, 
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center'
  },
  tasteText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  benefitContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.sm, 
    gap: Spacing.md, 
    width: '100%' 
  },
  benefitText: { flex: 1, fontSize: 14, lineHeight: 20 },
  nutritionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center'
  },
  nutritionText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  questionContainer: { marginVertical: Spacing.md },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  optionsContainer: { width: '100%', gap: Spacing.md, marginBottom: Spacing.md },
  optionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.md, 
    gap: Spacing.md 
  },
  optionEmoji: { fontSize: 32 },
  optionText: { flex: 1, fontSize: 18, fontWeight: '600' },
  feedbackContainer: { 
    marginTop: Spacing.md, 
    alignItems: 'center', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.md, 
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center'
  },
  feedbackText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  encouragementContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center'
  },
  encouragementText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  tipNotification: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: width - 40,
  },
  tipNotificationText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  rewardContent: { 
    alignItems: 'center', 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg, 
    minWidth: 280 
  },
  rewardEmoji: { fontSize: 60, textAlign: 'center' },
  rewardTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FFD700', 
    marginTop: Spacing.md, 
    textAlign: 'center' 
  },
  rewardMessage: { 
    fontSize: 18, 
    color: '#333', 
    marginTop: Spacing.sm, 
    textAlign: 'center' 
  },
  starContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  star: { fontSize: 30 },
  rewardButton: { 
    marginTop: Spacing.lg, 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.md, 
    borderRadius: BorderRadius.md 
  },
  rewardButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  continueButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 150,
    alignItems: 'center',
  },
  continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});