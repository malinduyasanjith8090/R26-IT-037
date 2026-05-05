// components/learning/WordsLearning.tsx
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
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// ==================== TYPES ====================
interface WordLesson {
  id: string;
  englishWord: string;
  sinhalaWord: string;
  englishSentence: string;
  sinhalaSentence: string;
  emoji: string;
  category: string;
  color: string;
  visualHint: string;
}

interface WordsLearningProps {
  onBack: () => void;
  onProgress?: (progress: number) => void;
  category?: string;
}

// ==================== WORD DATA ====================
const wordsData: WordLesson[] = [
  // ========== FAMILY CATEGORY ==========
  { 
    id: 'mother', 
    englishWord: 'Mother', 
    sinhalaWord: 'අම්මා',
    englishSentence: 'My mother loves me',
    sinhalaSentence: 'මගේ අම්මා මට ආදරෙයි',
    emoji: '👩',
    category: 'Family',
    color: '#FF6B6B',
    visualHint: 'A caring woman with warm smile'
  },
  { 
    id: 'father', 
    englishWord: 'Father', 
    sinhalaWord: 'තාත්තා',
    englishSentence: 'Father works hard',
    sinhalaSentence: 'තාත්තා වෙහෙස මහන්සි වී වැඩ කරයි',
    emoji: '👨',
    category: 'Family',
    color: '#4ECDC4',
    visualHint: 'A strong protective figure'
  },
  { 
    id: 'brother', 
    englishWord: 'Brother', 
    sinhalaWord: 'සහෝදරයා',
    englishSentence: 'My brother plays with me',
    sinhalaSentence: 'මගේ සහෝදරයා මා සමඟ සෙල්ලම් කරයි',
    emoji: '👦',
    category: 'Family',
    color: '#FFD166',
    visualHint: 'A boy who shares toys'
  },
  { 
    id: 'sister', 
    englishWord: 'Sister', 
    sinhalaWord: 'සහෝදරිය',
    englishSentence: 'Sister helps me learn',
    sinhalaSentence: 'සහෝදරිය මට ඉගෙන ගැනීමට උදව් කරයි',
    emoji: '👧',
    category: 'Family',
    color: '#06D6A0',
    visualHint: 'A girl who cares for you'
  },
  { 
    id: 'grandmother', 
    englishWord: 'Grandmother', 
    sinhalaWord: 'ආච්චි',
    englishSentence: 'Grandmother tells stories',
    sinhalaSentence: 'ආච්චි කතා කියයි',
    emoji: '👵',
    category: 'Family',
    color: '#118AB2',
    visualHint: 'An elderly lady with wisdom'
  },
  { 
    id: 'grandfather', 
    englishWord: 'Grandfather', 
    sinhalaWord: 'සීයා',
    englishSentence: 'Grandfather gives hugs',
    sinhalaSentence: 'සීයා වැළඳ ගනී',
    emoji: '👴',
    category: 'Family',
    color: '#EF476F',
    visualHint: 'An elderly man with kind eyes'
  },

  // ========== DAILY ROUTINES CATEGORY ==========
  { 
    id: 'wakeup', 
    englishWord: 'Wake Up', 
    sinhalaWord: 'අවදි වන්න',
    englishSentence: 'I wake up in the morning',
    sinhalaSentence: 'මම උදේ අවදි වෙනවා',
    emoji: '🌅',
    category: 'Routines',
    color: '#FFB74D',
    visualHint: 'Sun rising, opening eyes'
  },
  { 
    id: 'eat', 
    englishWord: 'Eat', 
    sinhalaWord: 'කන්න',
    englishSentence: 'Time to eat breakfast',
    sinhalaSentence: 'උදෑසන ආහාර ගැනීමට කාලයයි',
    emoji: '🍽️',
    category: 'Routines',
    color: '#FF8A65',
    visualHint: 'Food going into mouth'
  },
  { 
    id: 'brush', 
    englishWord: 'Brush Teeth', 
    sinhalaWord: 'දත් මදින්න',
    englishSentence: 'Brush teeth to keep them clean',
    sinhalaSentence: 'දත් පිරිසිදුව තබා ගැනීමට මදින්න',
    emoji: '🪥',
    category: 'Routines',
    color: '#81D4FA',
    visualHint: 'Toothbrush moving on teeth'
  },
  { 
    id: 'bath', 
    englishWord: 'Take a Bath', 
    sinhalaWord: 'නාන්න',
    englishSentence: 'Bath time makes me fresh',
    sinhalaSentence: 'නෑමෙන් මාව නැවුම් කරයි',
    emoji: '🛁',
    category: 'Routines',
    color: '#90CAF9',
    visualHint: 'Water splashing, bubbles'
  },
  { 
    id: 'dress', 
    englishWord: 'Get Dressed', 
    sinhalaWord: 'ඇඳුම් අඳින්න',
    englishSentence: 'Choose clothes to wear',
    sinhalaSentence: 'ඇඳීමට ඇඳුම් තෝරා ගන්න',
    emoji: '👕',
    category: 'Routines',
    color: '#CE93D8',
    visualHint: 'Putting on clothes'
  },
  { 
    id: 'school', 
    englishWord: 'Go to School', 
    sinhalaWord: 'පාසල් යන්න',
    englishSentence: 'Learning at school is fun',
    sinhalaSentence: 'පාසලේ ඉගෙනීම විනෝදජනකයි',
    emoji: '🏫',
    category: 'Routines',
    color: '#A5D6A7',
    visualHint: 'Walking to a building with books'
  },
  { 
    id: 'play', 
    englishWord: 'Play', 
    sinhalaWord: 'සෙල්ලම් කරන්න',
    englishSentence: 'Playing makes me happy',
    sinhalaSentence: 'සෙල්ලම් කිරීම මා සතුටු කරයි',
    emoji: '🎮',
    category: 'Routines',
    color: '#FFCC80',
    visualHint: 'Hands holding toys'
  },
  { 
    id: 'sleep', 
    englishWord: 'Sleep', 
    sinhalaWord: 'නිදාගන්න',
    englishSentence: 'Time to sleep at night',
    sinhalaSentence: 'රාත්‍රියේ නිදා ගැනීමට කාලයයි',
    emoji: '😴',
    category: 'Routines',
    color: '#B0BEC5',
    visualHint: 'Closed eyes, moon and stars'
  },

  // ========== EMOTIONS CATEGORY ==========
  { 
    id: 'happy', 
    englishWord: 'Happy', 
    sinhalaWord: 'සතුටු',
    englishSentence: 'I feel happy when I play',
    sinhalaSentence: 'මම සෙල්ලම් කරන විට සතුටු වෙනවා',
    emoji: '😊',
    category: 'Emotions',
    color: '#FFD700',
    visualHint: 'Big smile, bright eyes'
  },
  { 
    id: 'sad', 
    englishWord: 'Sad', 
    sinhalaWord: 'දුක',
    englishSentence: 'Sometimes I feel sad',
    sinhalaSentence: 'සමහර විට මට දුකක් දැනෙනවා',
    emoji: '😢',
    category: 'Emotions',
    color: '#6B8EFF',
    visualHint: 'Tears falling, frown face'
  },
  { 
    id: 'angry', 
    englishWord: 'Angry', 
    sinhalaWord: 'තරහ',
    englishSentence: 'I take deep breaths when angry',
    sinhalaSentence: 'මට තරහ ගිය විට ගැඹුරු හුස්මක් ගන්නවා',
    emoji: '😠',
    category: 'Emotions',
    color: '#FF6B6B',
    visualHint: 'Red face, furrowed brows'
  },
  { 
    id: 'scared', 
    englishWord: 'Scared', 
    sinhalaWord: 'බය',
    englishSentence: 'I ask for help when scared',
    sinhalaSentence: 'මට බය වුණාම උදව් ඉල්ලනවා',
    emoji: '😨',
    category: 'Emotions',
    color: '#9370DB',
    visualHint: 'Wide eyes, shaking hands'
  },
  { 
    id: 'excited', 
    englishWord: 'Excited', 
    sinhalaWord: 'උද්යෝගිමත්',
    englishSentence: 'Birthday makes me excited',
    sinhalaSentence: 'උපන්දිනය මාව උද්යෝගිමත් කරයි',
    emoji: '🤩',
    category: 'Emotions',
    color: '#FF4500',
    visualHint: 'Jumping up, sparkly eyes'
  },
  { 
    id: 'calm', 
    englishWord: 'Calm', 
    sinhalaWord: 'සන්සුන්',
    englishSentence: 'Quiet music makes me calm',
    sinhalaSentence: 'නිහඬ සංගීතය මාව සන්සුන් කරයි',
    emoji: '😌',
    category: 'Emotions',
    color: '#90EE90',
    visualHint: 'Peaceful face, gentle breathing'
  },
  { 
    id: 'surprised', 
    englishWord: 'Surprised', 
    sinhalaWord: 'පුදුම',
    englishSentence: 'The gift was a surprise',
    sinhalaSentence: 'තෑග්ග පුදුමයක් විය',
    emoji: '😲',
    category: 'Emotions',
    color: '#FFB347',
    visualHint: 'Open mouth, raised eyebrows'
  },
  { 
    id: 'tired', 
    englishWord: 'Tired', 
    sinhalaWord: 'වෙහෙසුණු',
    englishSentence: 'After playing, I feel tired',
    sinhalaSentence: 'සෙල්ලම් කිරීමෙන් පසු මට වෙහෙසක් දැනෙනවා',
    emoji: '😴',
    category: 'Emotions',
    color: '#A9A9A9',
    visualHint: 'Droopy eyes, yawning'
  },

  // ========== FOOD CATEGORY ==========
  { 
    id: 'apple', 
    englishWord: 'Apple', 
    sinhalaWord: 'ඇපල්',
    englishSentence: 'An apple a day keeps doctor away',
    sinhalaSentence: 'දිනකට ඇපල් ගෙඩියක් වෛද්‍යවරයා ඉවතට තබයි',
    emoji: '🍎',
    category: 'Food',
    color: '#FF3B30',
    visualHint: 'Red round fruit with leaf'
  },
  { 
    id: 'banana', 
    englishWord: 'Banana', 
    sinhalaWord: 'කෙසෙල්',
    englishSentence: 'Bananas give energy',
    sinhalaSentence: 'කෙසෙල් ශක්තිය ලබා දෙයි',
    emoji: '🍌',
    category: 'Food',
    color: '#FFCC00',
    visualHint: 'Yellow curved fruit'
  },
  { 
    id: 'milk', 
    englishWord: 'Milk', 
    sinhalaWord: 'කිරි',
    englishSentence: 'Milk makes bones strong',
    sinhalaSentence: 'කිරි අස්ථි ශක්තිමත් කරයි',
    emoji: '🥛',
    category: 'Food',
    color: '#FFF9C4',
    visualHint: 'White liquid in glass'
  },
  { 
    id: 'water', 
    englishWord: 'Water', 
    sinhalaWord: 'වතුර',
    englishSentence: 'Drink water every day',
    sinhalaSentence: 'සෑම දිනකම වතුර බොන්න',
    emoji: '💧',
    category: 'Food',
    color: '#4FC3F7',
    visualHint: 'Clear liquid, waves'
  },
  { 
    id: 'bread', 
    englishWord: 'Bread', 
    sinhalaWord: 'පාන්',
    englishSentence: 'Bread with jam is tasty',
    sinhalaSentence: 'ජෑම් සහිත පාන් රසවත්',
    emoji: '🍞',
    category: 'Food',
    color: '#D7CCC8',
    visualHint: 'Brown loaf, sliced'
  },
  { 
    id: 'rice', 
    englishWord: 'Rice', 
    sinhalaWord: 'බත්',
    englishSentence: 'Rice is eaten with curry',
    sinhalaSentence: 'බත් කරිය සමඟ අනුභව කරයි',
    emoji: '🍚',
    category: 'Food',
    color: '#FFF3E0',
    visualHint: 'White grains in bowl'
  },

  // ========== NATURE CATEGORY ==========
  { 
    id: 'sun', 
    englishWord: 'Sun', 
    sinhalaWord: 'හිරු',
    englishSentence: 'The sun gives light',
    sinhalaSentence: 'හිරු ආලෝකය ලබා දෙයි',
    emoji: '☀️',
    category: 'Nature',
    color: '#FFD700',
    visualHint: 'Yellow circle with rays'
  },
  { 
    id: 'moon', 
    englishWord: 'Moon', 
    sinhalaWord: 'සඳ',
    englishSentence: 'Moon shines at night',
    sinhalaSentence: 'සඳ රාත්‍රියේ බබළයි',
    emoji: '🌙',
    category: 'Nature',
    color: '#FFF176',
    visualHint: 'Crescent shape, stars around'
  },
  { 
    id: 'star', 
    englishWord: 'Star', 
    sinhalaWord: 'තරුව',
    englishSentence: 'Stars twinkle in the sky',
    sinhalaSentence: 'තරු අහසේ බබළයි',
    emoji: '⭐',
    category: 'Nature',
    color: '#FFF59D',
    visualHint: 'Five-point shape, sparkling'
  },
  { 
    id: 'rain', 
    englishWord: 'Rain', 
    sinhalaWord: 'වැස්ස',
    englishSentence: 'Rain makes flowers grow',
    sinhalaSentence: 'වැස්ස මල් වැඩෙන්න සලස්වයි',
    emoji: '🌧️',
    category: 'Nature',
    color: '#81D4FA',
    visualHint: 'Drops falling from cloud'
  },
  { 
    id: 'flower', 
    englishWord: 'Flower', 
    sinhalaWord: 'මල',
    englishSentence: 'Flowers are beautiful',
    sinhalaSentence: 'මල් ලස්සනයි',
    emoji: '🌼',
    category: 'Nature',
    color: '#FFAB91',
    visualHint: 'Colorful petals, stem'
  },
  { 
    id: 'tree', 
    englishWord: 'Tree', 
    sinhalaWord: 'ගස',
    englishSentence: 'Trees give us oxygen',
    sinhalaSentence: 'ගස් අපට ඔක්සිජන් ලබා දෙයි',
    emoji: '🌳',
    category: 'Nature',
    color: '#81C784',
    visualHint: 'Brown trunk, green leaves'
  },

  // ========== ACTIONS CATEGORY ==========
  { 
    id: 'run', 
    englishWord: 'Run', 
    sinhalaWord: 'දුවන්න',
    englishSentence: 'I run in the park',
    sinhalaSentence: 'මම උද්‍යානයේ දුවනවා',
    emoji: '🏃',
    category: 'Actions',
    color: '#FFB74D',
    visualHint: 'Legs moving fast'
  },
  { 
    id: 'jump', 
    englishWord: 'Jump', 
    sinhalaWord: 'පනින්න',
    englishSentence: 'Jumping is fun exercise',
    sinhalaSentence: 'පැනීම විනෝදජනක ව්‍යායාමයක්',
    emoji: '🤸',
    category: 'Actions',
    color: '#FF8A65',
    visualHint: 'Feet leaving ground'
  },
  { 
    id: 'clap', 
    englishWord: 'Clap', 
    sinhalaWord: 'අත්පොළසන් දෙන්න',
    englishSentence: 'Clap your hands together',
    sinhalaSentence: 'ඔබේ අත් එකට ගසන්න',
    emoji: '👏',
    category: 'Actions',
    color: '#90CAF9',
    visualHint: 'Two hands hitting together'
  },
  { 
    id: 'sit', 
    englishWord: 'Sit', 
    sinhalaWord: 'වාඩි වන්න',
    englishSentence: 'Please sit on the chair',
    sinhalaSentence: 'කරුණාකර පුටුවේ වාඩි වන්න',
    emoji: '🪑',
    category: 'Actions',
    color: '#CE93D8',
    visualHint: 'Body lowering onto seat'
  },
  { 
    id: 'stand', 
    englishWord: 'Stand', 
    sinhalaWord: 'නැගිටින්න',
    englishSentence: 'Stand up straight',
    sinhalaSentence: 'කෙළින් නැගිටින්න',
    emoji: '🧍',
    category: 'Actions',
    color: '#A5D6A7',
    visualHint: 'Body upright on feet'
  },
  { 
    id: 'read', 
    englishWord: 'Read', 
    sinhalaWord: 'කියවන්න',
    englishSentence: 'I read books every day',
    sinhalaSentence: 'මම හැමදාම පොත් කියවනවා',
    emoji: '📚',
    category: 'Actions',
    color: '#FFCC80',
    visualHint: 'Eyes looking at book'
  },

  // ========== PLACES CATEGORY ==========
  { 
    id: 'home', 
    englishWord: 'Home', 
    sinhalaWord: 'නිවස',
    englishSentence: 'Home is where family lives',
    sinhalaSentence: 'නිවස යනු පවුල ජීවත් වන ස්ථානයයි',
    emoji: '🏠',
    category: 'Places',
    color: '#B0BEC5',
    visualHint: 'House with roof and door'
  },
  { 
    id: 'school', 
    englishWord: 'School', 
    sinhalaWord: 'පාසල',
    englishSentence: 'School is for learning',
    sinhalaSentence: 'පාසල ඉගෙනීම සඳහායි',
    emoji: '🏫',
    category: 'Places',
    color: '#81D4FA',
    visualHint: 'Building with flag'
  },
  { 
    id: 'park', 
    englishWord: 'Park', 
    sinhalaWord: 'උද්‍යානය',
    englishSentence: 'Park has swings and slides',
    sinhalaSentence: 'උද්‍යානයේ පැද්දීම් සහ ස්ලයිඩ ඇත',
    emoji: '🌳',
    category: 'Places',
    color: '#A5D6A7',
    visualHint: 'Green grass, trees, playground'
  },
  { 
    id: 'hospital', 
    englishWord: 'Hospital', 
    sinhalaWord: 'රෝහල',
    englishSentence: 'Hospital helps sick people',
    sinhalaSentence: 'රෝහල අසනීප පුද්ගලයන්ට උපකාර කරයි',
    emoji: '🏥',
    category: 'Places',
    color: '#EF9A9A',
    visualHint: 'Building with cross'
  },
  { 
    id: 'shop', 
    englishWord: 'Shop', 
    sinhalaWord: 'සාප්පුව',
    englishSentence: 'Shop sells food and toys',
    sinhalaSentence: 'සාප්පුව ආහාර සහ සෙල්ලම් බඩු විකුණයි',
    emoji: '🏪',
    category: 'Places',
    color: '#FFCC80',
    visualHint: 'Building with shelves'
  },
  { 
    id: 'temple', 
    englishWord: 'Temple', 
    sinhalaWord: 'පන්සල',
    englishSentence: 'Temple is for praying',
    sinhalaSentence: 'පන්සල යාච්ඤා කිරීම සඳහායි',
    emoji: '🛕',
    category: 'Places',
    color: '#CE93D8',
    visualHint: 'Building with spire'
  },
];

// ==================== CATEGORIES ====================
const CATEGORIES = ['All', 'Family', 'Routines', 'Emotions', 'Food', 'Nature', 'Actions', 'Places'];

// ==================== REWARD MESSAGES ====================
const REWARD_MESSAGES = [
  '🌟 Word Master! 🌟',
  '🎉 Amazing! 🎉',
  '⭐ Vocabulary Star! ⭐',
  '🎈 Fantastic! 🎈',
  '🏆 You\'re a Natural! 🏆',
  '💪 Keep Going! 💪',
  '📚 Language Learner! 📚',
];

// ==================== MAIN COMPONENT ====================
export default function WordsLearning({ onBack, onProgress, category }: WordsLearningProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  
  // State Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState(category || 'All');
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Filtered Words based on selected category
  const filteredWords = currentCategory === 'All' 
    ? wordsData 
    : wordsData.filter(w => w.category === currentCategory);
  
  const currentWord = filteredWords[currentIndex];

  // ==================== HELPER FUNCTIONS ====================
  const getRandomRewardMessage = () => {
    return REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)];
  };

  const getQuestionText = () => {
    if (language === 'en') {
      return `What is the English word for ${currentWord.emoji}?`;
    }
    return `${currentWord.emoji} සඳහා සිංහල වචනය කුමක්ද?`;
  };

  const getOptions = () => {
    const correctAnswer = language === 'en' ? currentWord.englishWord : currentWord.sinhalaWord;
    const options = [correctAnswer];
    
    const otherWords = filteredWords
      .filter(w => (language === 'en' ? w.englishWord : w.sinhalaWord) !== correctAnswer)
      .map(w => language === 'en' ? w.englishWord : w.sinhalaWord)
      .slice(0, 3);
    
    options.push(...otherWords);
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  };

  const playSuccessAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleNextWord = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (onProgress) onProgress(((currentIndex + 1) / filteredWords.length) * 100);
    } else {
      setShowRewardModal(true);
      setRewardMessage('🎉 Complete! You mastered all words! 🎉');
    }
  };

  // ==================== ANSWER HANDLER ====================
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === (language === 'en' ? currentWord.englishWord : currentWord.sinhalaWord);
    setIsCorrect(correct);

    if (correct) {
      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newScore = score + 10;
      setScore(newScore);
      setRewardMessage(getRandomRewardMessage());
      setShowRewardModal(true);
      playSuccessAnimation();

      // Move to next word after delay
      setTimeout(() => {
        setShowRewardModal(false);
        setSelectedAnswer(null);
        setIsCorrect(false);
        handleNextWord();
      }, 2000);
    } else {
      // Error feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(false);
      }, 1000);
    }
  };

  // ==================== CATEGORY CHANGE HANDLER ====================
  const handleCategoryChange = (cat: string) => {
    setCurrentCategory(cat);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(false);
  };

  // ==================== RENDER HELPERS ====================
  const renderCategoryButtons = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categoryContainer}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.categoryButton,
            {
              backgroundColor: currentCategory === cat ? colors.primary : colors.surface,
              borderColor: colors.primaryLight,
            }
          ]}
          onPress={() => handleCategoryChange(cat)}
        >
          <Text style={[styles.categoryText, { color: currentCategory === cat ? '#FFF' : colors.text }]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWordCard = () => (
    <View style={[styles.wordCard, { backgroundColor: currentWord.color + '20' }]}>
      <Text style={styles.wordEmoji}>{currentWord.emoji}</Text>
      <View style={[styles.wordInfo, { backgroundColor: currentWord.color }]}>
        <Text style={styles.englishWord}>{currentWord.englishWord}</Text>
        <Text style={styles.sinhalaWord}>{currentWord.sinhalaWord}</Text>
      </View>
    </View>
  );

  const renderVisualHint = () => (
    <View style={[styles.hintContainer, { backgroundColor: colors.surface }]}>
      <MaterialIcons name="lightbulb" size={24} color={colors.accentYellow} />
      <Text style={[styles.hintText, { color: colors.text }]}>
        Visual Hint: {currentWord.visualHint}
      </Text>
    </View>
  );

  const renderExampleSentence = () => (
    <View style={[styles.sentenceContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sentenceLabel, { color: colors.primary }]}>📖 Example:</Text>
      <Text style={[styles.sentenceText, { color: colors.text }]}>
        {language === 'en' ? currentWord.englishSentence : currentWord.sinhalaSentence}
      </Text>
    </View>
  );

  const renderCategoryBadge = () => (
    <View style={[styles.categoryBadge, { backgroundColor: currentWord.color + '30' }]}>
      <Text style={[styles.categoryLabel, { color: currentWord.color }]}>
        Category: {currentWord.category}
      </Text>
    </View>
  );

  const renderQuestion = () => (
    <View style={styles.questionContainer}>
      <Text style={[styles.questionText, { color: colors.text }]}>
        {getQuestionText()}
      </Text>
    </View>
  );

  const renderOptions = () => (
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
  );

  const renderFeedback = () => {
    if (!selectedAnswer || isCorrect) return null;
    
    return (
      <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
        <Text style={[styles.feedbackText, { color: colors.error }]}>
          ✗ Try again! The {language === 'en' ? 'English' : 'Sinhala'} word is{' '}
          {language === 'en' ? currentWord.englishWord : currentWord.sinhalaWord} ✗
        </Text>
      </View>
    );
  };

  const renderRewardModal = () => (
    <Modal
      visible={showRewardModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRewardModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.rewardContent, { backgroundColor: colors.surface }]}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Text style={styles.rewardEmoji}>📚</Text>
            <Text style={styles.rewardTitle}>{rewardMessage}</Text>
            
            {rewardMessage.includes('Complete') ? (
              <>
                <Text style={styles.rewardMessage}>🎉 You're a vocabulary expert! 🎉</Text>
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
                <Text style={styles.rewardMessage}>
                  +10 points for learning {currentWord.englishWord}!
                </Text>
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
  );

  // ==================== MAIN RENDER ====================
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

      {/* Category Filter */}
      {renderCategoryButtons()}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / filteredWords.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {currentIndex + 1} of {filteredWords.length} Words
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {renderWordCard()}
          {renderVisualHint()}
          {renderExampleSentence()}
          {renderCategoryBadge()}
          {renderQuestion()}
          {renderOptions()}
          {renderFeedback()}
        </Animated.View>
      </ScrollView>

      {/* Reward Modal */}
      {renderRewardModal()}
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header Styles
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: Spacing.md, 
    paddingTop: Spacing.xl 
  },
  backButton: { padding: Spacing.sm },
  scoreBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.sm, 
    borderRadius: BorderRadius.round, 
    gap: Spacing.xs 
  },
  scoreText: { fontWeight: 'bold', fontSize: 18 },
  
  // Category Styles
  categoryContainer: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  categoryButton: { 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm, 
    borderRadius: BorderRadius.round, 
    marginRight: Spacing.sm, 
    borderWidth: 1 
  },
  categoryText: { fontSize: 14, fontWeight: '600' },
  
  // Progress Styles
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.xs },
  
  // ScrollView Styles
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },
  content: { alignItems: 'center', padding: Spacing.lg },
  
  // Word Card Styles
  wordCard: { 
    width: width - 80, 
    alignItems: 'center', 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg 
  },
  wordEmoji: { fontSize: 80, marginBottom: Spacing.md },
  wordInfo: { 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm, 
    borderRadius: BorderRadius.round, 
    alignItems: 'center' 
  },
  englishWord: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  sinhalaWord: { color: '#FFF', fontSize: 18, marginTop: 4 },
  
  // Hint Styles
  hintContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.sm, 
    gap: Spacing.md, 
    width: '100%' 
  },
  hintText: { flex: 1, fontSize: 14 },
  
  // Sentence Styles
  sentenceContainer: { 
    width: '100%', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.sm 
  },
  sentenceLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: Spacing.xs },
  sentenceText: { fontSize: 14, lineHeight: 20 },
  
  // Category Badge Styles
  categoryBadge: { 
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.xs, 
    borderRadius: BorderRadius.round, 
    marginBottom: Spacing.md 
  },
  categoryLabel: { fontSize: 12, fontWeight: '600' },
  
  // Question Styles
  questionContainer: { marginVertical: Spacing.md },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  
  // Options Styles
  optionsContainer: { width: '100%', gap: Spacing.md, marginBottom: Spacing.md },
  optionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.md 
  },
  optionText: { flex: 1, fontSize: 18, fontWeight: '600' },
  
  // Feedback Styles
  feedbackContainer: { 
    marginTop: Spacing.md, 
    alignItems: 'center', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.md, 
    width: '100%' 
  },
  feedbackText: { fontSize: 16, fontWeight: 'bold' },
  
  // Modal Styles
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
});