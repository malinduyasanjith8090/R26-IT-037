// app/(games)/MemoryMatchGame.tsx (with Sounds & Haptics)
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
    View
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

const { width } = Dimensions.get('window');

interface Card {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Level {
  id: number;
  name: string;
  theme: string;
  pairs: number;
  gridSize: number;
  cards: { emoji: string; name: string }[];
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Easy - Fruits',
    theme: 'fruits',
    pairs: 4,
    gridSize: 8,
    cards: [
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🍌', name: 'Banana' },
      { emoji: '🍊', name: 'Orange' },
      { emoji: '🍓', name: 'Strawberry' },
    ],
  },
  {
    id: 2,
    name: 'Easy - Animals',
    theme: 'animals',
    pairs: 4,
    gridSize: 8,
    cards: [
      { emoji: '🦁', name: 'Lion' },
      { emoji: '🐘', name: 'Elephant' },
      { emoji: '🐒', name: 'Monkey' },
      { emoji: '🦒', name: 'Giraffe' },
    ],
  },
  {
    id: 3,
    name: 'Easy - Shapes',
    theme: 'shapes',
    pairs: 4,
    gridSize: 8,
    cards: [
      { emoji: '🔴', name: 'Circle' },
      { emoji: '🟦', name: 'Square' },
      { emoji: '🔺', name: 'Triangle' },
      { emoji: '⭐', name: 'Star' },
    ],
  },
  {
    id: 4,
    name: 'Medium - Mixed',
    theme: 'mixed',
    pairs: 6,
    gridSize: 12,
    cards: [
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🦁', name: 'Lion' },
      { emoji: '🔴', name: 'Circle' },
      { emoji: '🍌', name: 'Banana' },
      { emoji: '🐘', name: 'Elephant' },
      { emoji: '🟦', name: 'Square' },
    ],
  },
  {
    id: 5,
    name: 'Hard - All Mixed',
    theme: 'all',
    pairs: 8,
    gridSize: 16,
    cards: [
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🦁', name: 'Lion' },
      { emoji: '🔴', name: 'Circle' },
      { emoji: '🍌', name: 'Banana' },
      { emoji: '🐘', name: 'Elephant' },
      { emoji: '🟦', name: 'Square' },
      { emoji: '🍊', name: 'Orange' },
      { emoji: '🐒', name: 'Monkey' },
    ],
  },
];

export default function MemoryMatchGame() {
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
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const [flipSoundPlayed, setFlipSoundPlayed] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));

  const level = levels[currentLevel];

  useEffect(() => {
    initializeGame();
  }, [currentLevel]);

  const initializeGame = async () => {
    const levelCards = level.cards;
    const deck = [...levelCards, ...levelCards].map((card, index) => ({
      id: index,
      emoji: card.emoji,
      name: card.name,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(shuffleArray(deck));
    setSelectedCard(null);
    setMoves(0);
    setMatchedPairs(0);
    setMatchCount(0);
    await playSound('click', false);
  };

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const calculateStars = () => {
    const maxMoves = level.pairs * 3;
    if (moves <= maxMoves) return 3;
    if (moves <= maxMoves * 1.5) return 2;
    return 1;
  };

  const handleCardPress = async (index: number) => {
    if (cards[index].isMatched || cards[index].isFlipped || selectedCard === index) return;

    // Play card flip sound
    await playSound('click', false);
    
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (selectedCard === null) {
      setSelectedCard(index);
    } else {
      setMoves(moves + 1);
      
      if (cards[selectedCard].emoji === cards[index].emoji) {
        // Match found
        await playSound('correct', true);
        
        newCards[selectedCard].isMatched = true;
        newCards[index].isMatched = true;
        setCards(newCards);
        setSelectedCard(null);
        
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        setMatchCount(matchCount + 1);
        
        // Play star sound for each match
        await playStarEarned();

        if (newMatchedPairs === level.pairs) {
          const earnedStars = calculateStars();
          setStars(earnedStars);
          
          // Play level complete celebration
          await playCelebration();
          
          if (currentLevel === levels.length - 1) {
            setShowGameComplete(true);
          } else {
            setShowLevelComplete(true);
          }
        }
      } else {
        // No match
        await playSound('error', true);
        
        setTimeout(async () => {
          const resetCards = [...cards];
          resetCards[selectedCard].isFlipped = false;
          resetCards[index].isFlipped = false;
          setCards(resetCards);
          setSelectedCard(null);
          await playSound('click', false);
        }, 800);
      }
    }
  };

  const nextLevel = async () => {
    setShowLevelComplete(false);
    setCurrentLevel(currentLevel + 1);
    await playSound('click', false);
  };

  const resetGame = async () => {
    setCurrentLevel(0);
    setShowGameComplete(false);
    initializeGame();
    await playSound('click', false);
  };

  const handleToggleSound = async () => {
    await playSound('click', false);
    toggleSound();
  };

  const getStarRating = (starCount: number) => {
    return (
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
  };

  const renderCard = (card: Card, index: number) => {
    const cardWidth = (width - 60) / Math.sqrt(level.gridSize);
    
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardWidth,
            backgroundColor: card.isMatched ? colors.success + '40' : colors.surface,
            borderColor: card.isFlipped || card.isMatched ? colors.primary : colors.primaryLight,
          },
        ]}
        onPress={() => handleCardPress(index)}
        disabled={card.isMatched}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {(card.isFlipped || card.isMatched) ? (
            <View style={styles.cardContent}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <Text style={[styles.cardName, { color: colors.text }]}>{card.name}</Text>
            </View>
          ) : (
            <MaterialIcons name="question-mark" size={40} color={colors.primary} />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
        
        <Text style={[styles.title, { color: colors.text }]}>Memory Match</Text>
        
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsText, { color: colors.text }]}>Moves: {moves}</Text>
          <Text style={[styles.statsText, { color: colors.text }]}>
            Matched: {matchedPairs}/{level.pairs}
          </Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelInfo, { backgroundColor: colors.primaryLight + '30' }]}>
        <MaterialIcons name="info" size={16} color={colors.primary} />
        <Text style={[styles.levelText, { color: colors.text }]}>
          Level {currentLevel + 1}: {level.name}
        </Text>
      </View>

      {/* Match Streak Indicator */}
      {matchCount > 0 && (
        <View style={[styles.streakContainer, { backgroundColor: colors.success + '20' }]}>
          <MaterialIcons name="whatshot" size={16} color={colors.success} />
          <Text style={[styles.streakText, { color: colors.success }]}>
            Match Streak: {matchCount}
          </Text>
        </View>
      )}

      {/* Game Board */}
      <ScrollView contentContainerStyle={styles.boardContainer}>
        <View style={styles.board}>
          {cards.map((card, index) => renderCard(card, index))}
        </View>
      </ScrollView>

      {/* Level Complete Modal */}
      <Modal visible={showLevelComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Level Complete!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You completed the level in {moves} moves!
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
      <Modal visible={showGameComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🏆</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Congratulations!</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                You mastered all levels!
              </Text>
              {getStarRating(stars)}
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
    flexWrap: 'wrap',
  },
  backButton: { padding: Spacing.sm },
  soundButton: { padding: Spacing.sm },
  title: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  statsText: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  levelText: { fontSize: Typography.fontSize.md, fontWeight: '600' },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
  },
  streakText: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  boardContainer: { padding: Spacing.md },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
    margin: 2,
  },
  cardContent: { alignItems: 'center' },
  cardEmoji: { fontSize: 32, marginBottom: 4 },
  cardName: { fontSize: 12, fontWeight: '600' },
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