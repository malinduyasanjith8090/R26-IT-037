// components/learning/ShapesLearning.tsx (with Sounds & Haptics)
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
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { BorderRadius, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../hooks/useSound';

const { width } = Dimensions.get('window');

interface ShapeLesson {
  id: string;
  name: string;
  shape: React.ReactNode;
  color: string;
  description: string;
  examples: string[];
  corners: number;
}

const shapesData: ShapeLesson[] = [
  { 
    id: 'circle', 
    name: 'Circle', 
    shape: <Circle cx="100" cy="100" r="60" fill="#FF6B6B" />, 
    color: '#FF6B6B',
    description: 'Round shape with no corners', 
    examples: ['Ball', 'Sun', 'Clock', 'Wheel'],
    corners: 0
  },
  { 
    id: 'square', 
    name: 'Square', 
    shape: <Rect x="40" y="40" width="120" height="120" fill="#4ECDC4" />, 
    color: '#4ECDC4',
    description: 'Four equal sides and four corners', 
    examples: ['Box', 'Window', 'Tile', 'House'],
    corners: 4
  },
  { 
    id: 'triangle', 
    name: 'Triangle', 
    shape: <Polygon points="100,30 30,170 170,170" fill="#FFD166" />, 
    color: '#FFD166',
    description: 'Three sides and three corners', 
    examples: ['Pizza Slice', 'Roof', 'Pyramid', 'Mountain'],
    corners: 3
  },
  { 
    id: 'rectangle', 
    name: 'Rectangle', 
    shape: <Rect x="40" y="60" width="120" height="80" fill="#06D6A0" />, 
    color: '#06D6A0',
    description: 'Four sides with opposite sides equal', 
    examples: ['Door', 'Book', 'Phone', 'Table'],
    corners: 4
  },
  { 
    id: 'oval', 
    name: 'Oval', 
    shape: <Ellipse cx="100" cy="100" rx="80" ry="40" fill="#118AB2" />, 
    color: '#118AB2',
    description: 'Stretched circle, like an egg', 
    examples: ['Egg', 'Football', 'Mirror', 'Tummy'],
    corners: 0
  },
  { 
    id: 'heart', 
    name: 'Heart', 
    shape: <Path d="M 100 40 C 100 20, 60 20, 60 50 C 60 80, 100 120, 100 140 C 100 120, 140 80, 140 50 C 140 20, 100 20, 100 40 Z" fill="#EF476F" />, 
    color: '#EF476F',
    description: 'Symbol of love and friendship', 
    examples: ['Valentine', 'Love Symbol', 'Candy', 'Cards'],
    corners: 0
  },
  { 
    id: 'star', 
    name: 'Star', 
    shape: <Path d="M 100 20 L 120 70 L 180 70 L 130 100 L 150 160 L 100 130 L 50 160 L 70 100 L 20 70 L 80 70 Z" fill="#FFD166" />, 
    color: '#FFD166',
    description: 'Shining star with five points', 
    examples: ['Night Star', 'Decoration', 'Badge', 'Wish'],
    corners: 5
  },
];

export default function ShapesLearning({ onBack, onProgress }: any) {
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
  const [showActivityPrompt, setShowActivityPrompt] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentShape = shapesData[currentIndex];

  const getRandomRewardMessage = () => {
    const messages = [
      '🌟 Shape-tastic! 🌟',
      '🎉 Perfect Shape! 🎉',
      '⭐ Shape Master! ⭐',
      '🎈 Well Rounded! 🎈',
      '🏆 Sharp Skills! 🏆',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentShape.name;
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

        if (currentIndex < shapesData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / shapesData.length) * 100);
          await playSound('click', false);
        } else {
          await playCelebration();
          setShowRewardModal(true);
          setRewardMessage('🎉 Complete! You mastered all shapes! 🎉');
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
    const options = [currentShape.name];
    const otherShapes = shapesData.filter(s => s.name !== currentShape.name).map(s => s.name).slice(0, 3);
    options.push(...otherShapes);
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

  const showFunActivity = async () => {
    setShowActivityPrompt(true);
    await playSound('reward', false);
    setTimeout(() => setShowActivityPrompt(false), 3000);
  };

  // Calculate shape difficulty based on corners
  const getDifficultyLevel = () => {
    if (currentShape.corners === 0) return 'Easy';
    if (currentShape.corners <= 4) return 'Medium';
    return 'Challenge';
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
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / shapesData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {currentIndex + 1} of {shapesData.length} Shapes
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Shape Card */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleCardPress}
          >
            <View style={[styles.shapeCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.shapeSvgContainer, { backgroundColor: currentShape.color + '20' }]}>
                <Svg width={200} height={200} viewBox="0 0 200 200">
                  {currentShape.shape}
                </Svg>
              </View>
              <Text style={[styles.shapeName, { color: currentShape.color }]}>{currentShape.name}</Text>
              <TouchableOpacity 
                style={[styles.cornerBadge, { backgroundColor: currentShape.color }]}
                onPress={showFunActivity}
              >
                <MaterialIcons name="stars" size={16} color="#FFF" />
                <Text style={styles.cornerText}>{currentShape.corners} corners • {getDifficultyLevel()}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Shape Description */}
          <View style={[styles.descriptionContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="info" size={24} color={colors.primary} />
            <Text style={[styles.descriptionText, { color: colors.text }]}>{currentShape.description}</Text>
          </View>

          {/* Examples */}
          <View style={[styles.examplesContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.examplesTitle, { color: colors.text }]}>📦 Things that are {currentShape.name}s:</Text>
            <View style={styles.examplesList}>
              {currentShape.examples.map((example, idx) => (
                <View key={idx} style={[styles.exampleItem, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.exampleText, { color: colors.text }]}>{example}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 What shape is this? 🤔
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
                <View style={[styles.optionColor, { backgroundColor: shapesData.find(s => s.name === option)?.color || colors.primary }]} />
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
                ✗ Try again! The correct shape is {currentShape.name}! ✗
              </Text>
            </View>
          )}

          {/* Encouragement Message */}
          {score > 0 && score % 50 === 0 && score !== 0 && (
            <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="emoji-events" size={24} color={colors.success} />
              <Text style={[styles.encouragementText, { color: colors.success }]}>
                🎉 Great progress! You're becoming a shape master! 🎉
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Activity Prompt Notification */}
      {showActivityPrompt && (
        <Animated.View style={[styles.activityNotification, { backgroundColor: currentShape.color }]}>
          <MaterialIcons name="gesture" size={20} color="#FFF" />
          <Text style={styles.activityNotificationText}>
            Draw a {currentShape.name} in the air! ✋
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
              <Text style={styles.rewardEmoji}>⭐</Text>
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage.includes('Complete') ? (
                <>
                  <Text style={styles.rewardMessage}>🎉 You're a shape expert! 🎉</Text>
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
                  <Text style={styles.rewardMessage}>+10 points for learning {currentShape.name}!</Text>
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
  shapeCard: { 
    width: width - 80, 
    alignItems: 'center', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 5 
  },
  shapeSvgContainer: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  shapeName: { fontSize: 32, fontWeight: 'bold', marginTop: Spacing.sm },
  cornerBadge: { 
    marginTop: Spacing.md, 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.xs, 
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center'
  },
  cornerText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  descriptionContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg, 
    gap: Spacing.md, 
    width: '100%' 
  },
  descriptionText: { flex: 1, fontSize: 14, lineHeight: 20 },
  examplesContainer: { 
    width: '100%', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg 
  },
  examplesTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  examplesList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  exampleItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  exampleText: { fontSize: 14 },
  activityContainer: { 
    width: '100%', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg, 
    alignItems: 'center',
    gap: Spacing.sm
  },
  activityTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  activityText: { fontSize: 14, textAlign: 'center' },
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
  optionColor: { width: 40, height: 40, borderRadius: 20 },
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
  activityNotification: {
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
  },
  activityNotificationText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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