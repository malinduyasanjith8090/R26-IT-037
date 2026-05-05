// app/(games)/ThinkingGames.tsx (with Sounds & Haptics)
import { MaterialIcons } from '@expo/vector-icons';
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
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

const { width } = Dimensions.get('window');

interface ThinkingGame {
  id: string;
  title: string;
  titleSin: string;
  description: string;
  descriptionSin: string;
  icon: string;
  color: string;
  component: string;
}

const thinkingGames: ThinkingGame[] = [
  {
    id: 'odd-one-out',
    title: 'Odd One Out',
    titleSin: 'වෙනස් එක සොයන්න',
    description: 'Find which item doesn\'t belong',
    descriptionSin: 'නොගැලපෙන අයිතමය සොයන්න',
    icon: 'find-replace',
    color: '#FF6B6B',
    component: 'OddOneOut',
  },
  {
    id: 'what-comes-next',
    title: 'What Comes Next?',
    titleSin: 'ඊළඟට එන්නේ කුමක්ද?',
    description: 'Complete the sequence',
    descriptionSin: 'අනුක්‍රමය සම්පූර්ණ කරන්න',
    icon: 'timeline',
    color: '#4ECDC4',
    component: 'SequenceGame',
  },
  {
    id: 'sorting-game',
    title: 'Sorting Game',
    titleSin: 'වර්ගීකරණ ක්‍රීඩාව',
    description: 'Sort items into categories',
    descriptionSin: 'අයිතම කාණ්ඩගත කරන්න',
    icon: 'category',
    color: '#FFD166',
    component: 'SortingGame',
  },
  {
    id: 'analogy-game',
    title: 'Word Analogies',
    titleSin: 'වචන සාදෘශ්‍ය',
    description: 'Complete the analogy',
    descriptionSin: 'සාදෘශ්‍යය සම්පූර්ණ කරන්න',
    icon: 'compare-arrows',
    color: '#06D6A0',
    component: 'AnalogyGame',
  },
];

// Odd One Out Component
function OddOneOut({ colors, onComplete }: any) {
  const { playSound, playCorrectAnswer, playStarEarned, isEnabled } = useSound();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const questions = [
    { items: ['🍎', '🍌', '🍊', '🚗'], oddIndex: 3, explanation: 'Car is not a fruit' },
    { items: ['🐱', '🐶', '🐦', '✈️'], oddIndex: 3, explanation: 'Airplane is not an animal' },
    { items: ['🔴', '🔵', '🟢', '🍎'], oddIndex: 3, explanation: 'Apple is not a color' },
    { items: ['😊', '😢', '🚗', '😠'], oddIndex: 2, explanation: 'Car is not an emotion' },
    { items: ['1', '2', '3', 'A'], oddIndex: 3, explanation: 'A is a letter, not a number' },
    { items: ['🐶', '🐱', '🐭', '🍕'], oddIndex: 3, explanation: 'Pizza is not a pet' },
    { items: ['📚', '✏️', '📖', '🍔'], oddIndex: 3, explanation: 'Burger is not school supply' },
  ];

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const correct = index === currentQuestion.oddIndex;
    setIsCorrect(correct);

    if (correct) {
      await playCorrectAnswer();
      const newScore = score + 10;
      setScore(newScore);
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          setShowReward(true);
          setTimeout(() => {
            onComplete(newScore);
          }, 2000);
        } else {
          setCurrentIndex(currentIndex + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
        }
      }, 1500);
    } else {
      await playSound('error', true);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameQuestion, { color: colors.text }]}>Which one is different?</Text>
      <View style={styles.itemsContainer}>
        {currentQuestion.items.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.surface,
                borderColor: selectedAnswer === idx
                  ? (isCorrect && idx === currentQuestion.oddIndex ? colors.success : colors.error)
                  : colors.primaryLight,
                borderWidth: 3,
              },
            ]}
            onPress={() => handleAnswer(idx)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.itemEmoji}>{item}</Text>
            {selectedAnswer === idx && isCorrect && idx === currentQuestion.oddIndex && (
              <View style={styles.correctBadge}>
                <MaterialIcons name="check-circle" size={24} color={colors.success} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {selectedAnswer !== null && !isCorrect && (
        <View style={[styles.explanationContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="lightbulb" size={20} color={colors.error} />
          <Text style={[styles.explanationText, { color: colors.error }]}>
            Hint: {currentQuestion.explanation}
          </Text>
        </View>
      )}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🎉</Text>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>Great Thinking!</Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>You found the odd one out!</Text>
              <View style={styles.starContainer}>
                {[...Array(3)].map((_, i) => (
                  <Text key={i} style={styles.star}>⭐</Text>
                ))}
              </View>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Sequence Game Component
function SequenceGame({ colors, onComplete }: any) {
  const { playSound, playCorrectAnswer, playStarEarned, playCelebration } = useSound();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const questions = [
    { sequence: ['🔴', '🔵', '🔴', '?'], options: ['🔴', '🔵', '🟢'], correct: '🔴' },
    { sequence: ['⭐', '❤️', '⭐', '?'], options: ['⭐', '❤️', '💙'], correct: '⭐' },
    { sequence: ['🍎', '🍌', '🍎', '?'], options: ['🍎', '🍌', '🍊'], correct: '🍎' },
    { sequence: ['1', '2', '3', '?'], options: ['4', '5', '6'], correct: '4' },
    { sequence: ['😊', '😊', '😢', '?'], options: ['😢', '😊', '😠'], correct: '😢' },
    { sequence: ['🟦', '🟩', '🟦', '?'], options: ['🟦', '🟩', '🟨'], correct: '🟦' },
    { sequence: ['🌞', '🌙', '🌞', '?'], options: ['🌞', '🌙', '⭐'], correct: '🌞' },
  ];

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correct;
    setIsCorrect(correct);

    if (correct) {
      await playCorrectAnswer();
      const newScore = score + 10;
      setScore(newScore);
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(async () => {
        if (currentIndex + 1 >= questions.length) {
          await playCelebration();
          setShowReward(true);
          setTimeout(() => {
            onComplete(newScore);
          }, 2000);
        } else {
          setCurrentIndex(currentIndex + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
        }
      }, 1500);
    } else {
      await playSound('error', true);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameQuestion, { color: colors.text }]}>What comes next in the pattern?</Text>
      <View style={styles.sequenceContainer}>
        {currentQuestion.sequence.map((item, idx) => (
          <View key={idx} style={[
            styles.sequenceItem, 
            { backgroundColor: colors.surface },
            idx === currentQuestion.sequence.length - 1 && styles.missingItem
          ]}>
            <Text style={styles.sequenceEmoji}>{item}</Text>
          </View>
        ))}
      </View>
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.sequenceOption,
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
            <Text style={styles.optionEmoji}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedAnswer && !isCorrect && (
        <View style={[styles.explanationContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="tips-and-updates" size={20} color={colors.error} />
          <Text style={[styles.explanationText, { color: colors.error }]}>
            Look at the pattern! It repeats every two items.
          </Text>
        </View>
      )}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🎉</Text>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>Pattern Master!</Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>You completed the sequence!</Text>
              <View style={styles.starContainer}>
                {[...Array(3)].map((_, i) => (
                  <Text key={i} style={styles.star}>⭐</Text>
                ))}
              </View>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Main Thinking Games Component
export default function ThinkingGames() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { playSound, toggleSound, isEnabled, playCelebration } = useSound();
  const [selectedGame, setSelectedGame] = useState<ThinkingGame | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleGameComplete = async (score: number) => {
    setGameScore(score);
    setShowGameComplete(true);
    await playCelebration();
    setTimeout(() => {
      setShowGameComplete(false);
      setSelectedGame(null);
    }, 2500);
  };

  const handleToggleSound = async () => {
    await playSound('click', false);
    toggleSound();
  };

  const renderGame = () => {
    if (!selectedGame) return null;
    
    switch (selectedGame.component) {
      case 'OddOneOut':
        return <OddOneOut colors={colors} onComplete={handleGameComplete} />;
      case 'SequenceGame':
        return <SequenceGame colors={colors} onComplete={handleGameComplete} />;
      default:
        return (
          <View style={styles.comingSoonContainer}>
            <MaterialIcons name="build" size={60} color={colors.primaryLight} />
            <Text style={[styles.comingSoonText, { color: colors.text }]}>Coming Soon!</Text>
            <Text style={[styles.comingSoonSubtext, { color: colors.textLight }]}>
              More thinking games are being developed
            </Text>
          </View>
        );
    }
  };

  if (selectedGame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            playSound('click', false);
            setSelectedGame(null);
          }} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {language === 'en' ? selectedGame.title : selectedGame.titleSin}
          </Text>
          <TouchableOpacity onPress={handleToggleSound} style={styles.soundButton}>
            <MaterialIcons 
              name={isEnabled ? "volume-up" : "volume-off"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
          <View style={[styles.scoreBadge, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="stars" size={20} color={colors.primary} />
            <Text style={[styles.scoreText, { color: colors.text }]}>{gameScore}</Text>
          </View>
        </View>
        {renderGame()}
        <Modal visible={showGameComplete} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.completeModal, { backgroundColor: colors.surface }]}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Text style={styles.completeEmoji}>🏆</Text>
                <Text style={[styles.completeTitle, { color: colors.text }]}>Challenge Complete!</Text>
                <Text style={[styles.completeMessage, { color: colors.textLight }]}>
                  You're getting smarter every day!
                </Text>
                <Text style={[styles.completeScore, { color: colors.primary }]}>Score: {gameScore}</Text>
                <View style={styles.starContainer}>
                  {[...Array(3)].map((_, i) => (
                    <Text key={i} style={styles.star}>⭐</Text>
                  ))}
                </View>
              </Animated.View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          playSound('click', false);
          router.back();
        }} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'en' ? 'Thinking Games' : 'චින්තන ක්‍රීඩා'}
        </Text>
        <TouchableOpacity onPress={handleToggleSound} style={styles.soundButton}>
          <MaterialIcons 
            name={isEnabled ? "volume-up" : "volume-off"} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Brain Training Banner */}
      <View style={[styles.brainBanner, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="psychology" size={32} color={colors.primary} />
        <Text style={[styles.brainText, { color: colors.text }]}>
          🧠 Train your brain with fun logic puzzles! 🧠
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.gamesList}>
        {thinkingGames.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, { backgroundColor: colors.surface, borderColor: game.color }]}
            onPress={async () => {
              await playSound('click', false);
              setSelectedGame(game);
            }}
          >
            <View style={[styles.gameIcon, { backgroundColor: game.color + '20' }]}>
              <MaterialIcons name={game.icon as any} size={40} color={game.color} />
            </View>
            <Text style={[styles.gameTitle, { color: colors.text }]}>
              {language === 'en' ? game.title : game.titleSin}
            </Text>
            <Text style={[styles.gameDescription, { color: colors.textLight }]}>
              {language === 'en' ? game.description : game.descriptionSin}
            </Text>
            <View style={[styles.playBadge, { backgroundColor: game.color }]}>
              <MaterialIcons name="play-arrow" size={16} color="#FFF" />
              <Text style={styles.playBadgeText}>Play Now</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tip Section */}
      <View style={[styles.tipContainer, { backgroundColor: colors.primaryLight + '20', margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg }]}>
        <MaterialIcons name="lightbulb" size={24} color={colors.accentYellow} />
        <Text style={[styles.tipText, { color: colors.textLight, flex: 1, marginLeft: Spacing.sm }]}>
          💡 Tip: Take your time and look for patterns. Every puzzle helps your brain grow stronger!
        </Text>
      </View>
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
  brainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  brainText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  gamesList: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  gameCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  gameIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gameTitle: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', marginBottom: Spacing.xs },
  gameDescription: { fontSize: Typography.fontSize.sm, textAlign: 'center', marginBottom: Spacing.sm },
  playBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    gap: 4,
    marginTop: Spacing.sm,
  },
  playBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  gameContainer: { flex: 1, padding: Spacing.md },
  gameQuestion: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: Spacing.xl },
  itemsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  itemCard: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative',
  },
  itemEmoji: { fontSize: 50 },
  correctBadge: { position: 'absolute', top: -10, right: -10 },
  sequenceContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.xl, flexWrap: 'wrap' },
  sequenceItem: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingItem: {
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  sequenceEmoji: { fontSize: 40 },
  optionsContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginTop: Spacing.lg, flexWrap: 'wrap' },
  sequenceOption: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  optionEmoji: { fontSize: 40 },
  explanationContainer: { 
    marginTop: Spacing.lg, 
    padding: Spacing.md, 
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  explanationText: { fontSize: 14, textAlign: 'center', flex: 1 },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  comingSoonText: { fontSize: 24, fontWeight: 'bold' },
  comingSoonSubtext: { fontSize: 14, textAlign: 'center' },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  tipText: { fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardModal: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 280,
  },
  rewardEmoji: { fontSize: 60 },
  rewardTitle: { fontSize: 24, fontWeight: 'bold', marginTop: Spacing.md },
  rewardMessage: { fontSize: 16, marginTop: Spacing.sm, textAlign: 'center' },
  starContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  star: { fontSize: 30 },
  completeModal: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 280,
  },
  completeEmoji: { fontSize: 60 },
  completeTitle: { fontSize: 24, fontWeight: 'bold', marginTop: Spacing.md },
  completeMessage: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
  completeScore: { fontSize: 18, marginTop: Spacing.md, fontWeight: 'bold' },
});