// components/PersonalizedLearning.tsx (Updated - Fix line 315)
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ARLearning from './ARLearning';
// Import TracingGame instead of TracingCanvas
import TracingGame from './TracingCanvas';

const { width, height } = Dimensions.get('window');

// Define proper types
interface LetterItem {
  id: string;
  letter: string;
  word: string;
  image: string;
  color: string;
  difficulty: number;
}

interface NumberItem {
  id: number;
  number: string;
  word: string;
  image: string;
  color: string;
  difficulty: number;
  count: number;
}

type LearningItem = LetterItem | NumberItem;

// Learning content
const lettersData: LetterItem[] = [
  { id: 'A', letter: 'A', word: 'Apple', image: '🍎', color: '#FF6B6B', difficulty: 1 },
  { id: 'B', letter: 'B', word: 'Ball', image: '⚽', color: '#4ECDC4', difficulty: 1 },
  { id: 'C', letter: 'C', word: 'Cat', image: '🐱', color: '#FFD166', difficulty: 1 },
  { id: 'D', letter: 'D', word: 'Dog', image: '🐕', color: '#06D6A0', difficulty: 2 },
  { id: 'E', letter: 'E', word: 'Elephant', image: '🐘', color: '#118AB2', difficulty: 2 },
  { id: 'F', letter: 'F', word: 'Fish', image: '🐟', color: '#EF476F', difficulty: 2 },
];

const numbersData: NumberItem[] = [
  { id: 1, number: '1', word: 'One', image: '☝️', color: '#FF6B6B', difficulty: 1, count: 1 },
  { id: 2, number: '2', word: 'Two', image: '✌️', color: '#4ECDC4', difficulty: 1, count: 2 },
  { id: 3, number: '3', word: 'Three', image: '🤟', color: '#FFD166', difficulty: 1, count: 3 },
  { id: 4, number: '4', word: 'Four', image: '🖖', color: '#06D6A0', difficulty: 2, count: 4 },
  { id: 5, number: '5', word: 'Five', image: '🖐️', color: '#118AB2', difficulty: 2, count: 5 },
];

interface PersonalizedLearningProps {
  category: 'letters' | 'numbers';
  onBack: () => void;
}

// Type guard functions
function isLetterItem(item: LearningItem): item is LetterItem {
  return (item as LetterItem).letter !== undefined;
}

function isNumberItem(item: LearningItem): item is NumberItem {
  return (item as NumberItem).number !== undefined;
}

export default function PersonalizedLearning({ category, onBack }: PersonalizedLearningProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showTracing, setShowTracing] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  
  const confettiRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentData = category === 'letters' ? lettersData : numbersData;
  const currentItem = currentData[currentIndex];

  // Get display text based on type
  const getDisplayText = () => {
    if (isLetterItem(currentItem)) {
      return currentItem.letter;
    }
    return currentItem.number;
  };

  // Get item ID for tracking
  const getItemId = () => {
    if (isLetterItem(currentItem)) {
      return currentItem.letter;
    }
    return currentItem.number;
  };

  // Play reward sound
  const playRewardSound = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('Playing reward sound');
    } catch (error) {
      console.log('Sound error:', error);
    }
  };

  // Handle trace complete - FIXED: removed 'success' parameter
  const handleTraceComplete = () => {
    setShowReward(true);
    playRewardSound();
    
    // Trigger confetti
    if (confettiRef.current) {
      confettiRef.current.start();
    }
    
    // Add to completed items
    const itemId = getItemId();
    if (!completedItems.includes(itemId)) {
      setCompletedItems([...completedItems, itemId]);
      setScore(score + 10);
    }
    
    // Animate success
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => {
      setShowReward(false);
      setShowTracing(false);
      
      // Move to next item
      if (currentIndex < currentData.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All completed
        alert('🎉 Amazing! You completed all lessons! 🎉');
      }
    }, 2000);
  };

  // Show AR feature
  const handleShowAR = () => {
    setShowAR(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Start tracing - FIXED: This now opens the tracing modal with the correct type
  const handleStartTracing = () => {
    setShowTracing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Confetti Cannon */}
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        explosionSpeed={350}
        fallSpeed={300}
      />

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
      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / currentData.length) * 100}%`,
                backgroundColor: colors.primary
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressCount, { color: colors.textLight }]}>
          {currentIndex + 1} of {currentData.length}
        </Text>
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Letter/Number Display */}
        <View style={[styles.displayCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.letterCircle, { backgroundColor: currentItem.color + '20' }]}>
            <Text style={[styles.letterText, { color: currentItem.color }]}>
              {getDisplayText()}
            </Text>
          </View>
          
          <Text style={[styles.wordText, { color: colors.text }]}>
            {currentItem.word}
          </Text>
          
          <Text style={styles.imageEmoji}>
            {currentItem.image}
          </Text>

          {isNumberItem(currentItem) && (
            <View style={styles.countContainer}>
              {Array.from({ length: currentItem.count }).map((_, i) => (
                <Text key={i} style={styles.countStar}>⭐</Text>
              ))}
            </View>
          )}
        </View>

        {/* Video/Animation Preview */}
        <TouchableOpacity 
          style={[styles.videoPreview, { backgroundColor: colors.primaryLight }]}
          onPress={() => alert('Video coming soon!')}
        >
          <MaterialIcons name="play-circle-filled" size={48} color={colors.primary} />
          <Text style={[styles.videoText, { color: colors.text }]}>
            Watch how to say {currentItem.word}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleStartTracing}
          >
            <MaterialIcons name="create" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>
              Trace {category === 'letters' ? 'Letter' : 'Number'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.accentBlue }]}
            onPress={handleShowAR}
          >
            <MaterialIcons name="3d-rotation" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>AR Experience</Text>
          </TouchableOpacity>
        </View>

        {/* Practice Words */}
        <View style={styles.practiceSection}>
          <Text style={[styles.practiceTitle, { color: colors.text }]}>
            Practice Words:
          </Text>
          <View style={styles.practiceWords}>
            {[
              currentItem.word, 
              currentItem.word.toLowerCase(), 
              category === 'letters' 
                ? `${getDisplayText()} is for ${currentItem.word}` 
                : `Number ${getDisplayText()}`
            ].map((word, index) => (
              <View key={index} style={[styles.practiceWord, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.practiceWordText, { color: colors.primary }]}>
                  {word}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Tracing Modal - FIXED: Now passes 'type' instead of 'letter' */}
      <Modal
        visible={showTracing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTracing(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowTracing(false)}
            >
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            
            {/* FIXED: Pass 'type' prop instead of 'letter' */}
            <TracingGame
              type={category}
              onComplete={handleTraceComplete}
              onProgress={(progress: number) => {
                console.log('Tracing progress:', progress);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* AR Modal */}
      {showAR && (
        <ARLearning
          item={currentItem}
          onClose={() => setShowAR(false)}
        />
      )}

      {/* Reward Animation */}
      {showReward && (
        <Animated.View style={[styles.rewardOverlay, { opacity: fadeAnim }]}>
          <View style={styles.rewardContent}>
            <MaterialIcons name="emoji-events" size={80} color="#FFD700" />
            <Text style={styles.rewardTitle}>Excellent! 🌟</Text>
            <Text style={styles.rewardMessage}>You did a great job tracing!</Text>
            <View style={styles.rewardStars}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={styles.rewardStar}>⭐</Text>
              ))}
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressCount: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  displayCard: {
    width: width - 80,
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  letterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  letterText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  countContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  countStar: {
    fontSize: 24,
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    gap: 15,
  },
  videoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    gap: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  practiceSection: {
    marginTop: 30,
    width: '100%',
  },
  practiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  practiceWords: {
    gap: 10,
  },
  practiceWord: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  practiceWordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    height: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeModalButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  rewardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  rewardContent: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 20,
  },
  rewardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 10,
  },
  rewardMessage: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
  rewardStars: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 5,
  },
  rewardStar: {
    fontSize: 30,
  },
});