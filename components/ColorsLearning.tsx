// components/learning/ColorsLearning.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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

const { width } = Dimensions.get('window');

interface ColorLesson {
  id: string;
  name: string;
  colorCode: string;
  icon: string;
  objects: string[];
}

const colorsData: ColorLesson[] = [
  { id: 'red', name: 'Red', colorCode: '#FF0000', icon: '🔴', objects: ['Apple', 'Rose', 'Ball'] },
  { id: 'blue', name: 'Blue', colorCode: '#0000FF', icon: '🔵', objects: ['Sky', 'Ocean', 'Blueberry'] },
  { id: 'green', name: 'Green', colorCode: '#00FF00', icon: '🟢', objects: ['Grass', 'Tree', 'Leaf'] },
  { id: 'yellow', name: 'Yellow', colorCode: '#FFFF00', icon: '🟡', objects: ['Sun', 'Banana', 'Star'] },
  { id: 'orange', name: 'Orange', colorCode: '#FFA500', icon: '🟠', objects: ['Orange Fruit', 'Pumpkin', 'Carrot'] },
  { id: 'purple', name: 'Purple', colorCode: '#800080', icon: '🟣', objects: ['Grapes', 'Eggplant', 'Lavender'] },
  { id: 'pink', name: 'Pink', colorCode: '#FFC0CB', icon: '🌸', objects: ['Flower', 'Cotton Candy', 'Pig'] },
  { id: 'brown', name: 'Brown', colorCode: '#8B4513', icon: '🟤', objects: ['Chocolate', 'Tree Trunk', 'Bear'] },
  { id: 'black', name: 'Black', colorCode: '#000000', icon: '⚫', objects: ['Night Sky', 'Penguin', 'Tire'] },
  { id: 'white', name: 'White', colorCode: '#FFFFFF', icon: '⚪', objects: ['Cloud', 'Snow', 'Milk'] },
];

export default function ColorsLearning({ onBack, onProgress }: any) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentColor = colorsData[currentIndex];

  const getRandomRewardMessage = () => {
    const messages = [
      '🌟 Amazing! 🌟',
      '🎉 Great Job! 🎉',
      '⭐ You\'re a Star! ⭐',
      '🎈 Fantastic! 🎈',
      '🏆 Excellent! 🏆',
      '💪 Keep Going! 💪',
      '🌈 Beautiful! 🌈',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentColor.name;
    setIsCorrect(correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newScore = score + 10;
      setScore(newScore);
      setRewardMessage(getRandomRewardMessage());
      setShowRewardModal(true);

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setShowRewardModal(false);
        setSelectedAnswer(null);
        setIsCorrect(false);

        if (currentIndex < colorsData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / colorsData.length) * 100);
        } else {
          setShowRewardModal(true);
          setRewardMessage('🎉 Complete! You mastered all colors! 🎉');
        }
      }, 2000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  const getOptions = () => {
    const options = [currentColor.name];
    const otherColors = colorsData
      .filter(c => c.name !== currentColor.name)
      .map(c => c.name)
      .slice(0, 3);
    options.push(...otherColors);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / colorsData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {currentIndex + 1} of {colorsData.length} Colors
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Color Display Card */}
          <View style={[styles.colorCard, { backgroundColor: currentColor.colorCode }]}>
            <View style={styles.colorIconContainer}>
              <Text style={styles.colorIcon}>{currentColor.icon}</Text>
            </View>
            <Text style={styles.colorName}>{currentColor.name}</Text>
          </View>

          {/* Example Objects */}
          <View style={[styles.objectsContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.objectsTitle, { color: colors.text }]}>Things that are {currentColor.name}:</Text>
            <View style={styles.objectsList}>
              {currentColor.objects.map((obj, idx) => (
                <View key={idx} style={[styles.objectItem, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.objectText, { color: colors.text }]}>{obj}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 What color is this? 🤔
            </Text>
          </View>

          {/* Options - Fixed to ensure all display properly */}
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
                <View style={[styles.optionColor, { backgroundColor: colorsData.find(c => c.name === option)?.colorCode || colors.primary }]} />
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
              <Text style={[styles.feedbackText, { color: colors.error }]}>
                ✗ Try again! You can do it! ✗
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

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
              <MaterialIcons name="emoji-events" size={80} color="#FFD700" />
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage.includes('Complete') ? (
                <>
                  <Text style={styles.rewardMessage}>🎉 You're a color master! 🎉</Text>
                  <TouchableOpacity 
                    style={[styles.rewardButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowRewardModal(false);
                      if (onBack) onBack();
                    }}
                  >
                    <Text style={styles.rewardButtonText}>Back to Menu</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.rewardMessage}>+10 points for {currentColor.name}!</Text>
                  <View style={styles.starContainer}>
                    {[...Array(3)].map((_, i) => (
                      <Text key={i} style={styles.star}>⭐</Text>
                    ))}
                  </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, paddingTop: Spacing.xl },
  backButton: { padding: Spacing.sm },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, gap: Spacing.xs },
  scoreText: { fontWeight: 'bold', fontSize: 18 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.xs },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },
  content: { alignItems: 'center', padding: Spacing.lg },
  colorCard: { width: width - 80, height: 180, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  colorIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  colorIcon: { fontSize: 48 },
  colorName: { fontSize: 32, fontWeight: 'bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  objectsContainer: { width: '100%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  objectsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  objectsList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  objectItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  objectText: { fontSize: 14 },
  mixingContainer: { width: '100%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, alignItems: 'center' },
  mixingTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  mixingIcons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.sm },
  mixingIcon: { fontSize: 32 },
  mixingArrow: { fontSize: 24, fontWeight: 'bold' },
  mixingResult: { fontSize: 40 },
  mixingText: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm },
  questionContainer: { marginVertical: Spacing.md },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  optionsContainer: { width: '100%', gap: Spacing.md, marginBottom: Spacing.md },
  optionButton: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.md, gap: Spacing.md },
  optionColor: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  optionText: { flex: 1, fontSize: 18, fontWeight: '600' },
  feedbackContainer: { marginTop: Spacing.md, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, width: '100%' },
  feedbackText: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  rewardContent: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.lg, minWidth: 280 },
  rewardTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginTop: Spacing.md, textAlign: 'center' },
  rewardMessage: { fontSize: 18, color: '#333', marginTop: Spacing.sm, textAlign: 'center' },
  starContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  star: { fontSize: 30 },
  rewardButton: { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  rewardButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});