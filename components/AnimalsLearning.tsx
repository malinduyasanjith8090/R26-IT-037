// components/learning/AnimalsLearning.tsx (with Sounds)
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

interface AnimalLesson {
  id: string;
  name: string;
  emoji: string;
  sound: string;
  funFact: string;
  color: string;
  habitat: string;
}

const animalsData: AnimalLesson[] = [
  { id: 'lion', name: 'Lion', emoji: '🦁', sound: 'Roar!', funFact: 'Lions live in groups called prides', color: '#FFB74D', habitat: 'Savanna' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', sound: 'Trumpet!', funFact: 'Elephants are the largest land animals', color: '#90CAF9', habitat: 'Grasslands' },
  { id: 'monkey', name: 'Monkey', emoji: '🐒', sound: 'Ooh ooh ah ah!', funFact: 'Monkeys love to swing on trees', color: '#A1887F', habitat: 'Jungle' },
  { id: 'giraffe', name: 'Giraffe', emoji: '🦒', sound: 'Hum!', funFact: 'Giraffes have very long necks', color: '#FFCC80', habitat: 'Savanna' },
  { id: 'panda', name: 'Panda', emoji: '🐼', sound: 'Squeak!', funFact: 'Pandas eat bamboo all day', color: '#BDBDBD', habitat: 'Bamboo Forest' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬', sound: 'Click click!', funFact: 'Dolphins are very smart swimmers', color: '#81D4FA', habitat: 'Ocean' },
];

// Animal sound effects mapping
const animalSoundEffects: { [key: string]: string } = {
  'Lion': '🦁 Roar!',
  'Elephant': '🐘 Trumpet!',
  'Monkey': '🐒 Ooh ooh ah ah!',
  'Giraffe': '🦒 Hum!',
  'Panda': '🐼 Squeak!',
  'Dolphin': '🐬 Click click!',
};

export default function AnimalsLearning({ onBack, onProgress }: any) {
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
  const [showAnimalSound, setShowAnimalSound] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentAnimal = animalsData[currentIndex];

  const getRandomRewardMessage = () => {
    const messages = [
      '🌟 Wild! 🌟',
      '🎉 Awesome! 🎉',
      '⭐ Animal Expert! ⭐',
      '🎈 Fantastic! 🎈',
      '🏆 You\'re a Natural! 🏆',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Play animal sound effect
  const playAnimalSoundEffect = async () => {
    setShowAnimalSound(true);
    await playSound('click', false);
    setTimeout(() => setShowAnimalSound(false), 2000);
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentAnimal.name;
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

        if (currentIndex < animalsData.length - 1) {
          setCurrentIndex(currentIndex + 1);
          if (onProgress) onProgress(((currentIndex + 1) / animalsData.length) * 100);
          await playSound('click', false);
        } else {
          await playCelebration();
          setShowRewardModal(true);
          setRewardMessage('🎉 Complete! You mastered all animals! 🎉');
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
    const options = [currentAnimal.name];
    const otherAnimals = animalsData.filter(a => a.name !== currentAnimal.name).map(a => a.name).slice(0, 3);
    options.push(...otherAnimals);
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

  // Play animal sound action
  const handlePlayAnimalSound = async () => {
    await playSound('click', false);
    // You could add actual animal sound effects here
    console.log(`Playing ${currentAnimal.name} sound: ${currentAnimal.sound}`);
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
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / animalsData.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {currentIndex + 1} of {animalsData.length} Animals
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Animal Card */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleCardPress}
          >
            <View style={[styles.animalCard, { backgroundColor: currentAnimal.color + '20' }]}>
              <Text style={styles.animalEmoji}>{currentAnimal.emoji}</Text>
              <Text style={[styles.animalName, { color: colors.text }]}>{currentAnimal.name}</Text>
              <TouchableOpacity 
                style={[styles.soundBadge, { backgroundColor: currentAnimal.color }]}
                onPress={handlePlayAnimalSound}
              >
                <MaterialIcons name="volume-up" size={20} color="#FFF" />
                <Text style={styles.soundText}>{currentAnimal.sound}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Fun Fact */}
          <View style={[styles.factContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="lightbulb" size={24} color={colors.accentYellow} />
            <Text style={[styles.factText, { color: colors.text }]}>
              Did you know? {currentAnimal.funFact}
            </Text>
          </View>

          {/* Habitat Info */}
          <View style={[styles.habitatContainer, { backgroundColor: colors.primaryLight + '20' }]}>
            <MaterialIcons name="location-on" size={20} color={currentAnimal.color} />
            <Text style={[styles.habitatText, { color: colors.text }]}>
              Habitat: {currentAnimal.habitat}
            </Text>
          </View>

          {/* Animal Action */}
          <View style={[styles.actionContainer, { backgroundColor: colors.primaryLight + '30' }]}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>🦁 Animal Action! 🦁</Text>
            <Text style={[styles.actionText, { color: colors.textLight }]}>
              Can you make the sound? {currentAnimal.sound}
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              🤔 What animal is this? 🤔
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
                  {animalsData.find(a => a.name === option)?.emoji || '🐾'}
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
                ✗ Try again! The correct animal is {currentAnimal.name}! ✗
              </Text>
            </View>
          )}

          {/* Encouragement Message */}
          {score > 0 && score % 50 === 0 && score !== 0 && (
            <View style={[styles.encouragementContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="emoji-events" size={24} color={colors.success} />
              <Text style={[styles.encouragementText, { color: colors.success }]}>
                🎉 Great progress! You're becoming an animal expert! 🎉
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Animal Sound Notification */}
      {showAnimalSound && (
        <Animated.View style={[styles.soundNotification, { backgroundColor: currentAnimal.color }]}>
          <Text style={styles.soundNotificationText}>
            🔊 {currentAnimal.sound} 🔊
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
              <Text style={styles.rewardEmoji}>🦁</Text>
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage.includes('Complete') ? (
                <>
                  <Text style={styles.rewardMessage}>🎉 You're an animal expert! 🎉</Text>
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
                  <Text style={styles.rewardMessage}>+10 points for {currentAnimal.name}!</Text>
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
  animalCard: { 
    width: width - 80, 
    alignItems: 'center', 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg 
  },
  animalEmoji: { fontSize: 80, marginBottom: Spacing.md },
  animalName: { fontSize: 28, fontWeight: 'bold' },
  soundBadge: { 
    marginTop: Spacing.md, 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm, 
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center'
  },
  soundText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  factContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.sm, 
    gap: Spacing.md, 
    width: '100%' 
  },
  factText: { flex: 1, fontSize: 14, lineHeight: 20 },
  habitatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center'
  },
  habitatText: { fontSize: 14, fontWeight: '500' },
  actionContainer: { 
    width: '100%', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg, 
    alignItems: 'center' 
  },
  actionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  actionText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
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
  soundNotification: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  soundNotificationText: {
    color: '#FFF',
    fontSize: 18,
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