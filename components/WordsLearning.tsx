// components/learning/WordsLearning.tsx (fixed category button height)
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
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
import { BorderRadius, Spacing } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../hooks/useSound';

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
  // FAMILY
  { id: 'mother', englishWord: 'Mother', sinhalaWord: 'අම්මා', englishSentence: 'My mother loves me', sinhalaSentence: 'මගේ අම්මා මට ආදරෙයි', emoji: '👩', category: 'Family', color: '#FF6B6B', visualHint: 'A caring woman with warm smile' },
  { id: 'father', englishWord: 'Father', sinhalaWord: 'තාත්තා', englishSentence: 'Father works hard', sinhalaSentence: 'තාත්තා වෙහෙස මහන්සි වී වැඩ කරයි', emoji: '👨', category: 'Family', color: '#4ECDC4', visualHint: 'A strong protective figure' },
  { id: 'brother', englishWord: 'Brother', sinhalaWord: 'සහෝදරයා', englishSentence: 'My brother plays with me', sinhalaSentence: 'මගේ සහෝදරයා මා සමඟ සෙල්ලම් කරයි', emoji: '👦', category: 'Family', color: '#FFD166', visualHint: 'A boy who shares toys' },
  { id: 'sister', englishWord: 'Sister', sinhalaWord: 'සහෝදරිය', englishSentence: 'Sister helps me learn', sinhalaSentence: 'සහෝදරිය මට ඉගෙන ගැනීමට උදව් කරයි', emoji: '👧', category: 'Family', color: '#06D6A0', visualHint: 'A girl who cares for you' },
  { id: 'grandmother', englishWord: 'Grandmother', sinhalaWord: 'ආච්චි', englishSentence: 'Grandmother tells stories', sinhalaSentence: 'ආච්චි කතා කියයි', emoji: '👵', category: 'Family', color: '#118AB2', visualHint: 'An elderly lady with wisdom' },
  { id: 'grandfather', englishWord: 'Grandfather', sinhalaWord: 'සීයා', englishSentence: 'Grandfather gives hugs', sinhalaSentence: 'සීයා වැළඳ ගනී', emoji: '👴', category: 'Family', color: '#EF476F', visualHint: 'An elderly man with kind eyes' },
  // ROUTINES
  { id: 'wakeup', englishWord: 'Wake Up', sinhalaWord: 'අවදි වන්න', englishSentence: 'I wake up in the morning', sinhalaSentence: 'මම උදේ අවදි වෙනවා', emoji: '🌅', category: 'Routines', color: '#FFB74D', visualHint: 'Sun rising, opening eyes' },
  { id: 'eat', englishWord: 'Eat', sinhalaWord: 'කන්න', englishSentence: 'Time to eat breakfast', sinhalaSentence: 'උදෑසන ආහාර ගැනීමට කාලයයි', emoji: '🍽️', category: 'Routines', color: '#FF8A65', visualHint: 'Food going into mouth' },
  { id: 'brush', englishWord: 'Brush Teeth', sinhalaWord: 'දත් මදින්න', englishSentence: 'Brush teeth to keep them clean', sinhalaSentence: 'දත් පිරිසිදුව තබා ගැනීමට මදින්න', emoji: '🪥', category: 'Routines', color: '#81D4FA', visualHint: 'Toothbrush moving on teeth' },
  { id: 'bath', englishWord: 'Take a Bath', sinhalaWord: 'නාන්න', englishSentence: 'Bath time makes me fresh', sinhalaSentence: 'නෑමෙන් මාව නැවුම් කරයි', emoji: '🛁', category: 'Routines', color: '#90CAF9', visualHint: 'Water splashing, bubbles' },
  { id: 'dress', englishWord: 'Get Dressed', sinhalaWord: 'ඇඳුම් අඳින්න', englishSentence: 'Choose clothes to wear', sinhalaSentence: 'ඇඳීමට ඇඳුම් තෝරා ගන්න', emoji: '👕', category: 'Routines', color: '#CE93D8', visualHint: 'Putting on clothes' },
  { id: 'school', englishWord: 'Go to School', sinhalaWord: 'පාසල් යන්න', englishSentence: 'Learning at school is fun', sinhalaSentence: 'පාසලේ ඉගෙනීම විනෝදජනකයි', emoji: '🏫', category: 'Routines', color: '#A5D6A7', visualHint: 'Walking to a building with books' },
  { id: 'play', englishWord: 'Play', sinhalaWord: 'සෙල්ලම් කරන්න', englishSentence: 'Playing makes me happy', sinhalaSentence: 'සෙල්ලම් කිරීම මා සතුටු කරයි', emoji: '🎮', category: 'Routines', color: '#FFCC80', visualHint: 'Hands holding toys' },
  { id: 'sleep', englishWord: 'Sleep', sinhalaWord: 'නිදාගන්න', englishSentence: 'Time to sleep at night', sinhalaSentence: 'රාත්‍රියේ නිදා ගැනීමට කාලයයි', emoji: '😴', category: 'Routines', color: '#B0BEC5', visualHint: 'Closed eyes, moon and stars' },
  // EMOTIONS
  { id: 'happy', englishWord: 'Happy', sinhalaWord: 'සතුටු', englishSentence: 'I feel happy when I play', sinhalaSentence: 'මම සෙල්ලම් කරන විට සතුටු වෙනවා', emoji: '😊', category: 'Emotions', color: '#FFD700', visualHint: 'Big smile, bright eyes' },
  { id: 'sad', englishWord: 'Sad', sinhalaWord: 'දුක', englishSentence: 'Sometimes I feel sad', sinhalaSentence: 'සමහර විට මට දුකක් දැනෙනවා', emoji: '😢', category: 'Emotions', color: '#6B8EFF', visualHint: 'Tears falling, frown face' },
  { id: 'angry', englishWord: 'Angry', sinhalaWord: 'තරහ', englishSentence: 'I take deep breaths when angry', sinhalaSentence: 'මට තරහ ගිය විට ගැඹුරු හුස්මක් ගන්නවා', emoji: '😠', category: 'Emotions', color: '#FF6B6B', visualHint: 'Red face, furrowed brows' },
  { id: 'scared', englishWord: 'Scared', sinhalaWord: 'බය', englishSentence: 'I ask for help when scared', sinhalaSentence: 'මට බය වුණාම උදව් ඉල්ලනවා', emoji: '😨', category: 'Emotions', color: '#9370DB', visualHint: 'Wide eyes, shaking hands' },
  { id: 'excited', englishWord: 'Excited', sinhalaWord: 'උද්යෝගිමත්', englishSentence: 'Birthday makes me excited', sinhalaSentence: 'උපන්දිනය මාව උද්යෝගිමත් කරයි', emoji: '🤩', category: 'Emotions', color: '#FF4500', visualHint: 'Jumping up, sparkly eyes' },
  { id: 'calm', englishWord: 'Calm', sinhalaWord: 'සන්සුන්', englishSentence: 'Quiet music makes me calm', sinhalaSentence: 'නිහඬ සංගීතය මාව සන්සුන් කරයි', emoji: '😌', category: 'Emotions', color: '#90EE90', visualHint: 'Peaceful face, gentle breathing' },
  { id: 'surprised', englishWord: 'Surprised', sinhalaWord: 'පුදුම', englishSentence: 'The gift was a surprise', sinhalaSentence: 'තෑග්ග පුදුමයක් විය', emoji: '😲', category: 'Emotions', color: '#FFB347', visualHint: 'Open mouth, raised eyebrows' },
  { id: 'tired', englishWord: 'Tired', sinhalaWord: 'වෙහෙසුණු', englishSentence: 'After playing, I feel tired', sinhalaSentence: 'සෙල්ලම් කිරීමෙන් පසු මට වෙහෙසක් දැනෙනවා', emoji: '😴', category: 'Emotions', color: '#A9A9A9', visualHint: 'Droopy eyes, yawning' },
  // FOOD
  { id: 'apple', englishWord: 'Apple', sinhalaWord: 'ඇපල්', englishSentence: 'An apple a day keeps doctor away', sinhalaSentence: 'දිනකට ඇපල් ගෙඩියක් වෛද්‍යවරයා ඉවතට තබයි', emoji: '🍎', category: 'Food', color: '#FF3B30', visualHint: 'Red round fruit with leaf' },
  { id: 'banana', englishWord: 'Banana', sinhalaWord: 'කෙසෙල්', englishSentence: 'Bananas give energy', sinhalaSentence: 'කෙසෙල් ශක්තිය ලබා දෙයි', emoji: '🍌', category: 'Food', color: '#FFCC00', visualHint: 'Yellow curved fruit' },
  { id: 'milk', englishWord: 'Milk', sinhalaWord: 'කිරි', englishSentence: 'Milk makes bones strong', sinhalaSentence: 'කිරි අස්ථි ශක්තිමත් කරයි', emoji: '🥛', category: 'Food', color: '#FFF9C4', visualHint: 'White liquid in glass' },
  { id: 'water', englishWord: 'Water', sinhalaWord: 'වතුර', englishSentence: 'Drink water every day', sinhalaSentence: 'සෑම දිනකම වතුර බොන්න', emoji: '💧', category: 'Food', color: '#4FC3F7', visualHint: 'Clear liquid, waves' },
  { id: 'bread', englishWord: 'Bread', sinhalaWord: 'පාන්', englishSentence: 'Bread with jam is tasty', sinhalaSentence: 'ජෑම් සහිත පාන් රසවත්', emoji: '🍞', category: 'Food', color: '#D7CCC8', visualHint: 'Brown loaf, sliced' },
  { id: 'rice', englishWord: 'Rice', sinhalaWord: 'බත්', englishSentence: 'Rice is eaten with curry', sinhalaSentence: 'බත් කරිය සමඟ අනුභව කරයි', emoji: '🍚', category: 'Food', color: '#FFF3E0', visualHint: 'White grains in bowl' },
  // NATURE
  { id: 'sun', englishWord: 'Sun', sinhalaWord: 'හිරු', englishSentence: 'The sun gives light', sinhalaSentence: 'හිරු ආලෝකය ලබා දෙයි', emoji: '☀️', category: 'Nature', color: '#FFD700', visualHint: 'Yellow circle with rays' },
  { id: 'moon', englishWord: 'Moon', sinhalaWord: 'සඳ', englishSentence: 'Moon shines at night', sinhalaSentence: 'සඳ රාත්‍රියේ බබළයි', emoji: '🌙', category: 'Nature', color: '#FFF176', visualHint: 'Crescent shape, stars around' },
  { id: 'star', englishWord: 'Star', sinhalaWord: 'තරුව', englishSentence: 'Stars twinkle in the sky', sinhalaSentence: 'තරු අහසේ බබළයි', emoji: '⭐', category: 'Nature', color: '#FFF59D', visualHint: 'Five-point shape, sparkling' },
  { id: 'rain', englishWord: 'Rain', sinhalaWord: 'වැස්ස', englishSentence: 'Rain makes flowers grow', sinhalaSentence: 'වැස්ස මල් වැඩෙන්න සලස්වයි', emoji: '🌧️', category: 'Nature', color: '#81D4FA', visualHint: 'Drops falling from cloud' },
  { id: 'flower', englishWord: 'Flower', sinhalaWord: 'මල', englishSentence: 'Flowers are beautiful', sinhalaSentence: 'මල් ලස්සනයි', emoji: '🌼', category: 'Nature', color: '#FFAB91', visualHint: 'Colorful petals, stem' },
  { id: 'tree', englishWord: 'Tree', sinhalaWord: 'ගස', englishSentence: 'Trees give us oxygen', sinhalaSentence: 'ගස් අපට ඔක්සිජන් ලබා දෙයි', emoji: '🌳', category: 'Nature', color: '#81C784', visualHint: 'Brown trunk, green leaves' },
  // ACTIONS
  { id: 'run', englishWord: 'Run', sinhalaWord: 'දුවන්න', englishSentence: 'I run in the park', sinhalaSentence: 'මම උද්‍යානයේ දුවනවා', emoji: '🏃', category: 'Actions', color: '#FFB74D', visualHint: 'Legs moving fast' },
  { id: 'jump', englishWord: 'Jump', sinhalaWord: 'පනින්න', englishSentence: 'Jumping is fun exercise', sinhalaSentence: 'පැනීම විනෝදජනක ව්‍යායාමයක්', emoji: '🤸', category: 'Actions', color: '#FF8A65', visualHint: 'Feet leaving ground' },
  { id: 'clap', englishWord: 'Clap', sinhalaWord: 'අත්පොළසන් දෙන්න', englishSentence: 'Clap your hands together', sinhalaSentence: 'ඔබේ අත් එකට ගසන්න', emoji: '👏', category: 'Actions', color: '#90CAF9', visualHint: 'Two hands hitting together' },
  { id: 'sit', englishWord: 'Sit', sinhalaWord: 'වාඩි වන්න', englishSentence: 'Please sit on the chair', sinhalaSentence: 'කරුණාකර පුටුවේ වාඩි වන්න', emoji: '🪑', category: 'Actions', color: '#CE93D8', visualHint: 'Body lowering onto seat' },
  { id: 'stand', englishWord: 'Stand', sinhalaWord: 'නැගිටින්න', englishSentence: 'Stand up straight', sinhalaSentence: 'කෙළින් නැගිටින්න', emoji: '🧍', category: 'Actions', color: '#A5D6A7', visualHint: 'Body upright on feet' },
  { id: 'read', englishWord: 'Read', sinhalaWord: 'කියවන්න', englishSentence: 'I read books every day', sinhalaSentence: 'මම හැමදාම පොත් කියවනවා', emoji: '📚', category: 'Actions', color: '#FFCC80', visualHint: 'Eyes looking at book' },
  // PLACES
  { id: 'home', englishWord: 'Home', sinhalaWord: 'නිවස', englishSentence: 'Home is where family lives', sinhalaSentence: 'නිවස යනු පවුල ජීවත් වන ස්ථානයයි', emoji: '🏠', category: 'Places', color: '#B0BEC5', visualHint: 'House with roof and door' },
  { id: 'school2', englishWord: 'School', sinhalaWord: 'පාසල', englishSentence: 'School is for learning', sinhalaSentence: 'පාසල ඉගෙනීම සඳහායි', emoji: '🏫', category: 'Places', color: '#81D4FA', visualHint: 'Building with flag' },
  { id: 'park', englishWord: 'Park', sinhalaWord: 'උද්‍යානය', englishSentence: 'Park has swings and slides', sinhalaSentence: 'උද්‍යානයේ පැද්දීම් සහ ස්ලයිඩ ඇත', emoji: '🌳', category: 'Places', color: '#A5D6A7', visualHint: 'Green grass, trees, playground' },
  { id: 'hospital', englishWord: 'Hospital', sinhalaWord: 'රෝහල', englishSentence: 'Hospital helps sick people', sinhalaSentence: 'රෝහල අසනීප පුද්ගලයන්ට උපකාර කරයි', emoji: '🏥', category: 'Places', color: '#EF9A9A', visualHint: 'Building with cross' },
  { id: 'shop', englishWord: 'Shop', sinhalaWord: 'සාප්පුව', englishSentence: 'Shop sells food and toys', sinhalaSentence: 'සාප්පුව ආහාර සහ සෙල්ලම් බඩු විකුණයි', emoji: '🏪', category: 'Places', color: '#FFCC80', visualHint: 'Building with shelves' },
  { id: 'temple', englishWord: 'Temple', sinhalaWord: 'පන්සල', englishSentence: 'Temple is for praying', sinhalaSentence: 'පන්සල යාච්ඤා කිරීම සඳහායි', emoji: '🛕', category: 'Places', color: '#CE93D8', visualHint: 'Building with spire' },
];

// ==================== CONSTANTS ====================
const CATEGORIES = ['All', 'Family', 'Routines', 'Emotions', 'Food', 'Nature', 'Actions', 'Places'];
const REWARD_MESSAGES = [
  '🌟 Word Master! 🌟',
  '🎉 Amazing! 🎉',
  '⭐ Vocabulary Star! ⭐',
  '🎈 Fantastic! 🎈',
  "🏆 You're a Natural! 🏆",
  '💪 Keep Going! 💪',
  '📚 Language Learner! 📚',
];
type StudyMode = 'engToSin' | 'sinToEng' | 'emojiToWord';

// ==================== SINHALA AUDIO MAP ====================
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../assets/sounds/sinhala/words/wordsinstruction.mp3'),
  mother: require('../assets/sounds/sinhala/words/mother.mp3'),
  father: require('../assets/sounds/sinhala/words/father.mp3'),
  brother: require('../assets/sounds/sinhala/words/brother.mp3'),
  sister: require('../assets/sounds/sinhala/words/sister.mp3'),
  grandmother: require('../assets/sounds/sinhala/words/grandmother.mp3'),
  grandfather: require('../assets/sounds/sinhala/words/grandfather.mp3'),
  wakeup: require('../assets/sounds/sinhala/words/wakeup.mp3'),
  eat: require('../assets/sounds/sinhala/words/eat.mp3'),
  brush: require('../assets/sounds/sinhala/words/brush.mp3'),
  happy: require('../assets/sounds/sinhala/words/happy.mp3'),
  sad: require('../assets/sounds/sinhala/words/sad.mp3'),
  angry: require('../assets/sounds/sinhala/words/angry.mp3'),
  apple: require('../assets/sounds/sinhala/words/apple.mp3'),
  banana: require('../assets/sounds/sinhala/words/banana.mp3'),
  milk: require('../assets/sounds/sinhala/words/milk.mp3'),
  water: require('../assets/sounds/sinhala/words/water.mp3'),
  sun: require('../assets/sounds/sinhala/words/sun.mp3'),
  star: require('../assets/sounds/sinhala/words/star.mp3'),
  run: require('../assets/sounds/sinhala/words/run.mp3'),
  jump: require('../assets/sounds/sinhala/words/jump.mp3'),
  sit: require('../assets/sounds/sinhala/words/sit.mp3'),
};

// Background music file (looping)
const backgroundMusic = require('../assets/sounds/calm_background.mp3');

export default function WordsLearning({ onBack, onProgress, category }: WordsLearningProps) {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const {
    playSound,
    playCelebration,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled,
  } = useSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState(category || 'All');
  const [studyMode, setStudyMode] = useState<StudyMode>('engToSin');
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState<Audio.Sound | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);
  const pendingInstruction = useRef(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});

  const filteredWords = currentCategory === 'All' ? wordsData : wordsData.filter(w => w.category === currentCategory);
  const currentWord = filteredWords[currentIndex];

  // ─── Load Sinhala Audio Files ────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadSounds = async () => {
      const sounds: { [key: string]: Audio.Sound | null } = {};
      for (const key of Object.keys(sinhalaAudioMap)) {
        try {
          const { sound } = await Audio.Sound.createAsync(sinhalaAudioMap[key]);
          sounds[key] = sound;
        } catch (error) {
          console.warn(`Failed to load Sinhala audio: ${key}`, error);
          sounds[key] = null;
        }
      }
      if (isMounted) {
        sinhalaSounds.current = sounds;
        setSoundsLoaded(true);
      }
    };
    loadSounds();
    return () => {
      isMounted = false;
      Object.values(sinhalaSounds.current).forEach(s => s && s.unloadAsync());
    };
  }, []);

  // ─── Speak / Play Audio ─────────────────────────────────────
  const speak = async (text: string, audioKey?: string) => {
    if (!soundEnabled) return;
    if (language === 'si' && audioKey && sinhalaSounds.current[audioKey]) {
      try {
        const sound = sinhalaSounds.current[audioKey];
        if (sound) await sound.replayAsync();
        return;
      } catch (error) {
        console.warn('Sinhala audio failed, falling back to TTS:', error);
      }
    }
    try {
      Speech.stop();
      Speech.speak(text, {
        language: language === 'si' ? 'si-LK' : 'en-US',
        pitch: language === 'si' ? 1.15 : 1.05,
        rate: language === 'si' ? 0.75 : 0.85,
        onError: (err) => {
          console.warn('TTS error:', err);
          if (language === 'si') {
            Speech.speak(text, { language: 'en-US', pitch: 1.05, rate: 0.85 });
          }
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  // ─── Letter-by-letter pronunciation ─────────────────────────
  const spellWord = (word: string) => {
    if (!soundEnabled) return;
    Speech.stop();
    word.split('').forEach((char, idx) => {
      setTimeout(() => {
        Speech.speak(char, {
          language: language === 'si' ? 'si-LK' : 'en-US',
          pitch: 1.1,
          rate: 0.6,
        });
      }, idx * 700);
    });
  };

  // ─── Instruction Effect ─────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const instructionText = language === 'si'
        ? 'වචන ඉගෙන ගමු. පහතින් පෙන්නන වචනය තෝරන්න.'
        : "Let's learn some words. Choose the word shown below.";
      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => speak(currentWord.sinhalaWord, currentWord.id), 4000);
      return () => clearTimeout(timer);
    }
    speak(currentWord.sinhalaWord, currentWord.id);
  }, [currentIndex, language]);

  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const instructionText = language === 'si'
        ? 'වචන ඉගෙන ගමු. පහතින් පෙන්නන වචනය තෝරන්න.'
        : "Let's learn some words. Choose the word shown below.";
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => speak(currentWord.sinhalaWord, currentWord.id), 4000);
      return () => clearTimeout(timer);
    }
  }, [soundsLoaded]);

  // ─── Background music toggle ────────────────────────────────
  const toggleBackgroundMusic = async () => {
    if (isMusicPlaying) {
      await backgroundSound?.pauseAsync();
      setIsMusicPlaying(false);
    } else {
      if (!backgroundSound) {
        const { sound } = await Audio.Sound.createAsync(backgroundMusic, { isLooping: true });
        setBackgroundSound(sound);
        await sound.playAsync();
      } else {
        await backgroundSound.playAsync();
      }
      setIsMusicPlaying(true);
    }
  };

  // ─── Schedule a word review notification ────────────────────
  const scheduleWordReview = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bloom Word Review',
        body: `Let's review: ${currentWord.englishWord} - ${currentWord.sinhalaWord}`,
        sound: true,
      },
      trigger: { seconds: 60 }, // 1 minute later
    });
  };

  // ─── Get correct answer ─────────────────────────────────────
  const getCorrectAnswer = (): string => {
    if (studyMode === 'engToSin') return currentWord.sinhalaWord;
    if (studyMode === 'sinToEng') return currentWord.englishWord;
    return currentWord.englishWord;
  };

  const getOptions = () => {
    const correct = getCorrectAnswer();
    const options = [correct];
    const others = filteredWords
      .filter(w => (studyMode === 'engToSin' ? w.sinhalaWord !== correct : w.englishWord !== correct))
      .map(w => studyMode === 'engToSin' ? w.sinhalaWord : w.englishWord)
      .slice(0, 3);
    options.push(...others);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === getCorrectAnswer();
    setIsCorrect(correct);
    if (correct) {
      await playCorrectAnswer();
      setScore(s => s + 10);
      setRewardMessage(REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)]);
      setShowRewardModal(true);
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      await playStarEarned();
      setTimeout(() => {
        setShowRewardModal(false);
        setSelectedAnswer(null);
        setIsCorrect(false);
        if (currentIndex < filteredWords.length - 1) {
          setCurrentIndex(i => i + 1);
          if (onProgress) onProgress(((currentIndex + 1) / filteredWords.length) * 100);
        } else {
          setShowRewardModal(true);
          setRewardMessage('🎉 Complete! You mastered all words! 🎉');
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

  const handleCategoryChange = (cat: string) => {
    setCurrentCategory(cat);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(false);
  };

  const handleModeChange = (mode: StudyMode) => {
    if (mode === studyMode) return;
    setStudyMode(mode);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(false);
  };

  const handleToggleSound = () => {
    toggleSound();
  };

  const handlePlayWord = () => {
    speak(currentWord.sinhalaWord, currentWord.id);
  };

  const handleSpellWord = () => {
    const word = studyMode === 'engToSin' || studyMode === 'emojiToWord' ? currentWord.sinhalaWord : currentWord.englishWord;
    spellWord(word);
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.soundButton} onPress={handleToggleSound}>
          <MaterialIcons name={soundEnabled ? "volume-up" : "volume-off"} size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.soundButton} onPress={toggleBackgroundMusic}>
          <MaterialIcons name={isMusicPlaying ? "music-off" : "music-note"} size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeContainer}>
        {(['engToSin', 'sinToEng', 'emojiToWord'] as StudyMode[]).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.modeButton, studyMode === mode && { backgroundColor: colors.primary }]}
            onPress={() => handleModeChange(mode)}
          >
            <Text style={[styles.modeButtonText, { color: studyMode === mode ? '#FFF' : colors.text }]}>
              {mode === 'engToSin' ? 'EN→සිං' : mode === 'sinToEng' ? 'සිං→EN' : '🎯'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, { backgroundColor: currentCategory === cat ? colors.primary : colors.surface, borderColor: colors.primaryLight }]}
            onPress={() => handleCategoryChange(cat)}
          >
            <Text style={[styles.categoryText, { color: currentCategory === cat ? '#FFF' : colors.text }]} numberOfLines={1}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / filteredWords.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {currentIndex + 1} of {filteredWords.length}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Word Card */}
          <View style={[styles.wordCard, { backgroundColor: currentWord.color + '20' }]}>
            {studyMode === 'emojiToWord' && <Text style={styles.wordEmoji}>{currentWord.emoji}</Text>}
            {studyMode !== 'emojiToWord' && (
              <Text style={[styles.studyWord, { color: colors.text }]}>
                {studyMode === 'engToSin' ? currentWord.englishWord : currentWord.sinhalaWord}
              </Text>
            )}
            <View style={styles.wordInfoRow}>
              <TouchableOpacity onPress={handlePlayWord} style={[styles.soundIcon, { backgroundColor: currentWord.color }]}>
                <MaterialIcons name="volume-up" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSpellWord} style={[styles.soundIcon, { backgroundColor: currentWord.color }]}>
                <MaterialIcons name="spellcheck" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.wordTranslation, { color: colors.text }]}>
              {studyMode === 'engToSin' ? currentWord.sinhalaWord : currentWord.englishWord}
            </Text>
          </View>

          {/* Example Sentence */}
          <View style={[styles.sentenceContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sentenceLabel, { color: colors.primary }]}>📖 Example</Text>
            <Text style={[styles.sentenceText, { color: colors.text }]}>
              {language === 'en' ? currentWord.englishSentence : currentWord.sinhalaSentence}
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {studyMode === 'engToSin'
                ? `What is the Sinhala word for ${currentWord.englishWord}?`
                : studyMode === 'sinToEng'
                  ? `What is the English word for ${currentWord.sinhalaWord}?`
                  : `What is this? ${currentWord.emoji}`}
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
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                {selectedAnswer === option && (
                  <MaterialIcons
                    name={isCorrect ? "check-circle" : "cancel"}
                    size={24}
                    color={isCorrect ? colors.success : colors.error}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback */}
          {selectedAnswer && !isCorrect && (
            <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
              <MaterialIcons name="sentiment-dissatisfied" size={20} color={colors.error} />
              <Text style={[styles.feedbackText, { color: colors.error }]}>
                Try again! Correct answer: {getCorrectAnswer()}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Reward Modal */}
      <Modal visible={showRewardModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>📚</Text>
              <Text style={styles.rewardTitle}>{rewardMessage}</Text>
              {rewardMessage.includes('Complete') ? (
                <>
                  <Text style={styles.rewardMessage}>You mastered all words!</Text>
                  <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowRewardModal(false);
                      onBack();
                    }}
                  >
                    <Text style={styles.continueButtonText}>Back to Menu</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.rewardMessage}>+10 points!</Text>
                  <View style={styles.starContainer}>
                    {[...Array(3)].map((_, i) => <Text key={i} style={styles.star}>⭐</Text>)}
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

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  backButton: { padding: Spacing.sm },
  soundButton: { padding: Spacing.sm },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: 6,
  },
  scoreText: { fontWeight: 'bold', fontSize: 18 },
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
  modeButtonText: { fontSize: 12, fontWeight: '600' },
  categoryContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    flexGrow: 0,
    height: 50,      // 🔥 FIXED: added explicit height
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,   // 🔥 FIXED: removed vertical padding (was 10)
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center', // 🔥 FIXED: added for vertical centering
    height: 40,      // 🔥 FIXED: explicit height
  },
  categoryText: { fontSize: 12, fontWeight: '600', numberOfLines: 1 }, // 🔥 FIXED: ensure single line
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, textAlign: 'center', marginTop: 4 },
  scrollContent: { paddingBottom: Spacing.xxl },
  content: { alignItems: 'center', padding: Spacing.md },
  wordCard: {
    width: width - 80,
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  wordEmoji: { fontSize: 70, marginBottom: Spacing.md },
  studyWord: { fontSize: 40, fontWeight: 'bold', marginBottom: Spacing.md, textAlign: 'center' },
  wordInfoRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.sm },
  soundIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordTranslation: { fontSize: 22, fontWeight: '600', marginBottom: Spacing.md },
  sentenceContainer: {
    width: '100%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  sentenceLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  sentenceText: { fontSize: 13, lineHeight: 18 },
  questionContainer: { marginVertical: Spacing.md },
  questionText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  optionsContainer: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.md },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  optionText: { flex: 1, fontSize: 16, fontWeight: '500' },
  feedbackContainer: {
    marginTop: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  feedbackText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minWidth: 280,
  },
  rewardEmoji: { fontSize: 50, textAlign: 'center' },
  rewardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  rewardMessage: {
    fontSize: 16,
    color: '#333',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  starContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: 6 },
  star: { fontSize: 28 },
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