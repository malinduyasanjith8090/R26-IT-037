// components/TracingCanvas.tsx (English letters & numbers with Sinhala voice guidance)
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../hooks/useSound';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 80;
const TRACE_AREA_SIZE = CANVAS_SIZE * 0.75;

interface TracingPoint {
  x: number;
  y: number;
}

interface TracingGameProps {
  type: 'letters' | 'numbers';
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

// ENGLISH Letter paths – optimized for viewBox 0 0 400 300
const letterPaths: { [key: string]: string } = {
  'A': 'M 200 60 L 140 250 L 170 250 L 185 200 L 215 200 L 230 250 L 260 250 Z M 190 170 L 210 170',
  'B': 'M 150 60 L 210 60 C 240 60, 250 80, 250 100 C 250 120, 240 140, 210 150 L 150 150 L 150 60 M 150 150 L 220 150 C 250 150, 260 170, 260 200 C 260 230, 250 250, 220 250 L 150 250 L 150 150',
  'C': 'M 250 80 C 200 60, 150 60, 150 150 C 150 240, 200 250, 250 230',
  'D': 'M 150 60 L 190 60 C 240 60, 260 100, 260 155 C 260 210, 240 250, 190 250 L 150 250 L 150 60',
  'E': 'M 230 60 L 150 60 L 150 250 L 230 250 M 150 155 L 210 155',
  'F': 'M 230 60 L 150 60 L 150 250 M 150 155 L 200 155',
  'G': 'M 250 80 C 200 60, 150 60, 150 150 C 150 240, 200 250, 250 230 L 250 180 L 210 180',
  'H': 'M 150 60 L 150 250 M 250 60 L 250 250 M 150 155 L 250 155',
  'I': 'M 170 60 L 230 60 M 200 60 L 200 250 M 170 250 L 230 250',
  'J': 'M 230 60 L 230 220 C 230 250, 200 260, 170 250 L 160 230',
  'K': 'M 150 60 L 150 250 M 150 150 L 230 60 M 150 150 L 230 250',
  'L': 'M 150 60 L 150 250 L 250 250',
  'M': 'M 150 250 L 150 60 L 200 150 L 250 60 L 250 250',
  'N': 'M 150 250 L 150 60 L 250 250 L 250 60',
  'O': 'M 200 60 C 150 60, 140 100, 140 155 C 140 210, 150 250, 200 250 C 250 250, 260 210, 260 155 C 260 100, 250 60, 200 60',
  'P': 'M 150 60 L 150 250 M 150 60 L 200 60 C 240 60, 250 100, 200 120 L 150 120',
  'Q': 'M 200 60 C 150 60, 140 100, 140 155 C 140 210, 150 250, 200 250 C 250 250, 260 210, 260 155 C 260 100, 250 60, 200 60 M 200 200 L 250 260',
  'R': 'M 150 60 L 150 250 M 150 60 L 200 60 C 240 60, 250 100, 200 120 L 150 120 M 180 120 L 250 250',
  'S': 'M 230 80 C 200 60, 160 60, 150 100 C 140 140, 250 160, 250 200 C 250 240, 200 260, 160 240',
  'T': 'M 150 60 L 250 60 M 200 60 L 200 250',
  'U': 'M 150 60 L 150 220 C 150 250, 250 250, 250 220 L 250 60',
  'V': 'M 150 60 L 200 250 L 250 60',
  'W': 'M 150 60 L 160 250 L 200 180 L 240 250 L 250 60',
  'X': 'M 150 60 L 250 250 M 250 60 L 150 250',
  'Y': 'M 150 60 L 200 155 M 250 60 L 200 155 L 200 250',
  'Z': 'M 150 60 L 250 60 L 150 250 L 250 250',
  '1': 'M 180 80 L 200 60 L 200 250 M 170 250 L 230 250',
  '2': 'M 160 100 C 160 60, 240 60, 240 100 C 240 140, 150 160, 150 250 L 250 250',
  '3': 'M 160 70 C 250 70, 250 120, 200 150 C 250 180, 250 230, 160 240',
  '4': 'M 220 60 L 150 180 L 250 180 M 220 60 L 220 250',
  '5': 'M 230 60 L 160 60 L 150 150 C 250 150, 250 250, 150 250',
  '6': 'M 220 70 C 150 70, 140 150, 150 230 C 160 250, 240 250, 240 180 C 240 140, 180 140, 180 180',
  '7': 'M 150 60 L 250 60 L 180 250',
  '8': 'M 200 150 C 150 150, 150 60, 200 60 C 250 60, 250 150, 200 150 C 150 150, 150 250, 200 250 C 250 250, 250 150, 200 150',
  '9': 'M 200 160 C 250 160, 260 80, 200 80 C 150 80, 140 160, 140 200 C 140 240, 200 250, 240 230',
  '0': 'M 200 60 C 150 60, 140 100, 140 210 C 140 250, 260 250, 260 100 C 260 60, 250 60, 200 60'
};

// Key points for accuracy checking (within 400x300 viewBox)
const getKeyPointsForLetter = (char: string): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];

  switch (char) {
    case 'A':
      points.push({ x: 200, y: 60 }, { x: 140, y: 250 }, { x: 170, y: 250 }, { x: 185, y: 200 }, { x: 215, y: 200 }, { x: 230, y: 250 }, { x: 260, y: 250 }, { x: 190, y: 170 }, { x: 210, y: 170 });
      break;
    case 'B':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 230, y: 60 }, { x: 250, y: 120 }, { x: 220, y: 155 }, { x: 250, y: 190 }, { x: 230, y: 250 });
      break;
    case 'C':
      points.push({ x: 230, y: 70 }, { x: 140, y: 60 }, { x: 130, y: 250 }, { x: 230, y: 250 });
      break;
    case 'D':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 250, y: 60 }, { x: 260, y: 250 }, { x: 150, y: 250 });
      break;
    case 'E':
      points.push({ x: 150, y: 60 }, { x: 230, y: 60 }, { x: 150, y: 250 }, { x: 150, y: 155 }, { x: 210, y: 155 }, { x: 230, y: 250 });
      break;
    case 'F':
      points.push({ x: 150, y: 60 }, { x: 230, y: 60 }, { x: 150, y: 250 }, { x: 150, y: 155 }, { x: 200, y: 155 });
      break;
    case 'G':
      points.push({ x: 230, y: 70 }, { x: 140, y: 60 }, { x: 130, y: 250 }, { x: 230, y: 250 }, { x: 270, y: 250 }, { x: 270, y: 200 }, { x: 230, y: 200 }, { x: 190, y: 200 });
      break;
    case 'H':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 250, y: 60 }, { x: 250, y: 250 }, { x: 150, y: 155 }, { x: 250, y: 155 });
      break;
    case 'I':
      points.push({ x: 150, y: 60 }, { x: 250, y: 60 }, { x: 200, y: 60 }, { x: 200, y: 250 }, { x: 150, y: 250 }, { x: 250, y: 250 });
      break;
    case 'J':
      points.push({ x: 250, y: 60 }, { x: 250, y: 200 }, { x: 160, y: 260 }, { x: 150, y: 60 }, { x: 210, y: 60 });
      break;
    case 'K':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 250, y: 60 }, { x: 150, y: 155 }, { x: 250, y: 250 });
      break;
    case 'L':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 250, y: 250 });
      break;
    case 'M':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 200, y: 150 }, { x: 250, y: 60 }, { x: 250, y: 250 });
      break;
    case 'N':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 250, y: 250 }, { x: 250, y: 60 });
      break;
    case 'O':
      points.push({ x: 200, y: 60 }, { x: 120, y: 60 }, { x: 120, y: 250 }, { x: 200, y: 250 }, { x: 280, y: 250 }, { x: 280, y: 60 });
      break;
    case 'P':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 240, y: 60 }, { x: 240, y: 155 }, { x: 150, y: 155 });
      break;
    case 'Q':
      points.push({ x: 200, y: 60 }, { x: 120, y: 60 }, { x: 120, y: 250 }, { x: 200, y: 250 }, { x: 280, y: 250 }, { x: 280, y: 60 }, { x: 240, y: 210 }, { x: 270, y: 240 });
      break;
    case 'R':
      points.push({ x: 150, y: 60 }, { x: 150, y: 250 }, { x: 240, y: 60 }, { x: 240, y: 155 }, { x: 150, y: 155 }, { x: 250, y: 250 });
      break;
    case 'S':
      points.push({ x: 230, y: 60 }, { x: 150, y: 60 }, { x: 130, y: 110 }, { x: 190, y: 155 }, { x: 250, y: 200 }, { x: 230, y: 250 }, { x: 150, y: 250 });
      break;
    case 'T':
      points.push({ x: 150, y: 60 }, { x: 250, y: 60 }, { x: 200, y: 60 }, { x: 200, y: 250 });
      break;
    case 'U':
      points.push({ x: 150, y: 60 }, { x: 150, y: 200 }, { x: 250, y: 200 }, { x: 250, y: 60 });
      break;
    case 'V':
      points.push({ x: 150, y: 60 }, { x: 200, y: 250 }, { x: 250, y: 60 });
      break;
    case 'W':
      points.push({ x: 150, y: 60 }, { x: 170, y: 250 }, { x: 200, y: 140 }, { x: 230, y: 250 }, { x: 250, y: 60 });
      break;
    case 'X':
      points.push({ x: 150, y: 60 }, { x: 250, y: 250 }, { x: 250, y: 60 }, { x: 150, y: 250 });
      break;
    case 'Y':
      points.push({ x: 150, y: 60 }, { x: 200, y: 150 }, { x: 250, y: 60 }, { x: 200, y: 150 }, { x: 200, y: 250 });
      break;
    case 'Z':
      points.push({ x: 150, y: 60 }, { x: 250, y: 60 }, { x: 150, y: 250 }, { x: 250, y: 250 });
      break;
    default:
      points.push({ x: 200, y: 60 }, { x: 200, y: 155 }, { x: 200, y: 250 });
  }

  return points;
};

const isPointNearLetter = (point: { x: number; y: number }, char: string, tolerance = 25): boolean => {
  const keyPoints = getKeyPointsForLetter(char);
  return keyPoints.some(kp =>
    Math.sqrt(Math.pow(point.x - kp.x, 2) + Math.pow(point.y - kp.y, 2)) <= tolerance
  );
};

const numbersList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const lettersList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// ─── Sinhala external audio mapping (English letters & numbers) ─
const sinhalaAudioMap: { [key: string]: any } = {
  // Instruction for letters
  instruction_letters: require('../../assets/sounds/sinhala/english/letters/englishlettersinstruction.mp3'),
  // Instruction for numbers
  instruction_numbers: require('../../assets/sounds/sinhala/numbers/sinhalanumbersinstruction.mp3'),
  // Letters
  // Numbers
  '1': require('../../assets/sounds/sinhala/numbers/1.mp3'),
  '2': require('../../assets/sounds/sinhala/numbers/2.mp3'),
  '3': require('../../assets/sounds/sinhala/numbers/3.mp3'),
  '4': require('../../assets/sounds/sinhala/numbers/4.mp3'),
  '5': require('../../assets/sounds/sinhala/numbers/5.mp3'),
  '6': require('../../assets/sounds/sinhala/numbers/6.mp3'),
  '7': require('../../assets/sounds/sinhala/numbers/7.mp3'),
  '8': require('../../assets/sounds/sinhala/numbers/8.mp3'),
  '9': require('../../assets/sounds/sinhala/numbers/9.mp3'),
  '0': require('../../assets/sounds/sinhala/numbers/0.mp3'),
};

export default function TracingGame({ type, onComplete, onProgress }: TracingGameProps) {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const {
    playSound,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled
  } = useSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [strokes, setStrokes] = useState<TracingPoint[][]>([]);
  const [validTracePoints, setValidTracePoints] = useState<TracingPoint[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [traceProgress, setTraceProgress] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ─── VOICE STATE ────────────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  const items = type === 'letters' ? lettersList : numbersList;
  const currentChar = items[currentIndex];
  const targetPath = letterPaths[currentChar];
  const keyPoints = getKeyPointsForLetter(currentChar);

  // Load all Sinhala audio files
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
      Object.values(sinhalaSounds.current).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
    };
  }, []);

  // Speak function (external audio for Sinhala, TTS for English)
  const speak = async (text: string, audioKey?: string) => {
    if (!soundEnabled) return;
    if (language === 'si' && audioKey && sinhalaSounds.current[audioKey]) {
      try {
        const sound = sinhalaSounds.current[audioKey];
        if (sound) await sound.replayAsync();
        return;
      } catch (error) {
        console.warn('Sinhala audio playback failed, falling back to TTS:', error);
      }
    }
    try {
      Speech.stop();
      Speech.speak(text, {
        language: language === 'si' ? 'si-LK' : 'en-US',
        pitch: language === 'si' ? 1.15 : 1.05,
        rate: language === 'si' ? 0.75 : 0.85,
        onError: (error) => {
          console.warn('TTS error:', error);
          if (language === 'si') {
            Speech.speak(text, { language: 'en-US', pitch: 1.05, rate: 0.85 });
          }
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => Speech.stop();
  }, []);

  // Main instruction effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const isLetters = type === 'letters';
      const audioKey = isLetters ? 'instruction_letters' : 'instruction_numbers';
      const instructionText = language === 'si'
        ? (isLetters
          ? 'අපි දැන් ඉංග්‍රීසි අකුරු ලියන ආකාරය ඉගෙන ගමු. තිරයේ පෙන්වන අකුර දෙස බලා, ඔබේ ඇඟිල්ලෙන් එය මත අඳින්න. ලකුණු අනුගමනය කරමින් සෙමින් අඳින්න.'
          : 'අපි දැන් ඉලක්කම් ලියන ආකාරය ඉගෙන ගමු. තිරයේ පෙන්වන ඉලක්කම දෙස බලා, ඔබේ ඇඟිල්ලෙන් එය මත අඳින්න. ලකුණු අනුගමනය කරමින් සෙමින් අඳින්න.')
        : (isLetters
          ? 'Hello! Let\'s learn how to trace English letters. Look at the letter shown on the screen and draw over it with your finger. Follow the dots and trace slowly.'
          : 'Hello! Let\'s learn how to trace numbers. Look at the number shown on the screen and draw over it with your finger. Follow the dots and trace slowly.');

      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }
      speak(instructionText, audioKey);
      const timer = setTimeout(() => {
        speak(currentChar, currentChar);
      }, 6000); // Give time for long instruction
      return () => clearTimeout(timer);
    }

    // On item change, speak the letter/number
    speak(currentChar, currentChar);
  }, [currentIndex, language, type]);

  // Pending instruction effect
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const isLetters = type === 'letters';
      const audioKey = isLetters ? 'instruction_letters' : 'instruction_numbers';
      const instructionText = language === 'si'
        ? (isLetters
          ? 'අපි දැන් ඉංග්‍රීසි අකුරු ලියන ආකාරය ඉගෙන ගමු. තිරයේ පෙන්වන අකුර දෙස බලා, ඔබේ ඇඟිල්ලෙන් එය මත අඳින්න. ලකුණු අනුගමනය කරමින් සෙමින් අඳින්න.'
          : 'අපි දැන් ඉලක්කම් ලියන ආකාරය ඉගෙන ගමු. තිරයේ පෙන්වන ඉලක්කම දෙස බලා, ඔබේ ඇඟිල්ලෙන් එය මත අඳින්න. ලකුණු අනුගමනය කරමින් සෙමින් අඳින්න.')
        : (isLetters
          ? 'Hello! Let\'s learn how to trace English letters. Look at the letter shown on the screen and draw over it with your finger. Follow the dots and trace slowly.'
          : 'Hello! Let\'s learn how to trace numbers. Look at the number shown on the screen and draw over it with your finger. Follow the dots and trace slowly.');
      speak(instructionText, audioKey);
      const timer = setTimeout(() => {
        speak(currentChar, currentChar);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [soundsLoaded]);

  // Play sound on successful trace completion
  useEffect(() => {
    if (isComplete) {
      playCorrectAnswer();
    }
  }, [isComplete]);

  // Recalculate progress whenever valid points change
  useEffect(() => {
    if (validTracePoints.length > 0 && !isComplete) {
      const coveredKeyPoints = new Set<number>();

      validTracePoints.forEach(point => {
        keyPoints.forEach((keyPoint, idx) => {
          const distance = Math.sqrt(
            Math.pow(point.x - keyPoint.x, 2) + Math.pow(point.y - keyPoint.y, 2)
          );
          if (distance <= 25) {
            coveredKeyPoints.add(idx);
          }
        });
      });

      let percentage = (coveredKeyPoints.size / keyPoints.length) * 100;
      const pointBonus = Math.min(20, (validTracePoints.length / 200) * 20);
      percentage = Math.min(100, percentage + pointBonus);

      setTraceProgress(percentage);

      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 200,
        useNativeDriver: false,
      }).start();

      if (percentage >= 80 && validTracePoints.length > 40 && !isComplete) {
        handleCorrect();
      }
    }
  }, [validTracePoints]);

  const handleCorrect = () => {
    if (isComplete) return;

    setIsComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const newScore = score + 10;
    setScore(newScore);
    playStarEarned();

    const progress = ((currentIndex + 1) / items.length) * 100;
    if (onProgress) onProgress(progress);

    setTimeout(() => {
      setIsComplete(false);
      setStrokes([]);
      setValidTracePoints([]);
      setTraceProgress(0);

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        playSound('click', false);
      } else {
        if (onComplete) onComplete();
        playSound('complete', false);
      }
    }, 1500);
  };

  const resetTrace = async () => {
    setStrokes([]);
    setValidTracePoints([]);
    setIsComplete(false);
    setShowHint(false);
    setTraceProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound('click', false);
  };

  const showHintHandler = async () => {
    setShowHint(true);
    await playSound('click', false);
    setTimeout(() => setShowHint(false), 3000);
  };

  const handleToggleSound = async () => {
    await playSound('click', false);
    toggleSound();
  };

  // PanResponder for touch tracing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: async (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const svgX = (locationX / CANVAS_SIZE) * 400;
        const svgY = (locationY / TRACE_AREA_SIZE) * 300;
        const newPoint = { x: svgX, y: svgY };

        setStrokes(prev => [...prev, [newPoint]]);

        if (isPointNearLetter(newPoint, currentChar, 30)) {
          setValidTracePoints(prev => [...prev, newPoint]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          await playSound('click', false);
        }
        setIsTracing(true);
      },
      onPanResponderMove: async (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const svgX = (locationX / CANVAS_SIZE) * 400;
        const svgY = (locationY / TRACE_AREA_SIZE) * 300;
        const newPoint = { x: svgX, y: svgY };

        setStrokes(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = [...updated[updated.length - 1], newPoint];
          return updated;
        });

        if (isPointNearLetter(newPoint, currentChar, 30)) {
          setValidTracePoints(prev => [...prev, newPoint]);
          if (validTracePoints.length % 10 === 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await playSound('star', false);
          }
        }
      },
      onPanResponderRelease: () => {
        setIsTracing(false);

        if (validTracePoints.length < 20 && validTracePoints.length > 0 && !isComplete && traceProgress < 30) {
          setShowHint(true);
          setTimeout(() => setShowHint(false), 2000);
        } else if (validTracePoints.length === 0 && strokes.length > 0 && strokes.reduce((sum, s) => sum + s.length, 0) > 10) {
          setShowHint(true);
          setTimeout(() => setShowHint(false), 2000);
        }
      },
    })
  ).current;

  const isKeyPointCovered = (point: { x: number; y: number }): boolean => {
    return validTracePoints.some(tp =>
      Math.abs(tp.x - point.x) < 25 && Math.abs(tp.y - point.y) < 25
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.scoreCard, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>

        {/* Sound Toggle Button */}
        <TouchableOpacity style={styles.soundButton} onPress={handleToggleSound}>
          <MaterialIcons
            name={soundEnabled ? "volume-up" : "volume-off"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex) / items.length) * 100}%`,
                  backgroundColor: colors.primary
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textLight }]}>
            {currentIndex + 1} of {items.length}
          </Text>
        </View>
      </View>

      <View style={[styles.charContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.charDisplay, { color: colors.primary }]}>
          {currentChar}
        </Text>
        <Text style={[styles.charHint, { color: colors.textLight }]}>
          Trace EXACTLY on the dotted lines
        </Text>
      </View>

      <View style={styles.traceProgressContainer}>
        <Text style={[styles.traceProgressLabel, { color: colors.textLight }]}>
          Accuracy: {Math.floor(traceProgress)}%
        </Text>
        <View style={[styles.traceProgressBar, { backgroundColor: colors.primaryLight }]}>
          <Animated.View
            style={[
              styles.traceProgressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: traceProgress >= 80 ? colors.success : colors.primary
              }
            ]}
          />
        </View>
        {traceProgress >= 80 && !isComplete && validTracePoints.length > 40 && (
          <Text style={[styles.completeMessage, { color: colors.success }]}>
            ✓ Excellent! Moving to next...
          </Text>
        )}
      </View>

      <Animated.View
        style={[
          styles.tracingArea,
          {
            backgroundColor: colors.surface,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Svg
          width={CANVAS_SIZE}
          height={TRACE_AREA_SIZE}
          viewBox="0 0 400 300"
          style={styles.svgContainer}
        >
          {/* Dotted guide letter */}
          <Path
            d={targetPath}
            stroke={colors.primaryLight}
            strokeWidth={6}
            strokeDasharray="12,12"
            strokeLinecap="round"
            fill="none"
          />

          {/* Render each stroke as a separate Path */}
          {strokes.map((stroke, strokeIndex) => {
            if (stroke.length < 2) return null;
            const pathData = `M ${stroke[0].x} ${stroke[0].y} ` +
              stroke.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
            return (
              <Path
                key={strokeIndex}
                d={pathData}
                stroke={colors.primary}
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.7}
              />
            );
          })}

          {/* Key points (circles) */}
          {keyPoints.map((point, idx) => {
            const isCovered = isKeyPointCovered(point);
            return (
              <Circle
                key={idx}
                cx={point.x}
                cy={point.y}
                r="6"
                fill={isCovered ? colors.success : colors.primaryLight}
                opacity={isCovered ? 0.8 : 0.3}
              />
            );
          })}

          <Circle cx="200" cy="50" r="10" fill={colors.accentYellow} stroke={colors.surface} strokeWidth={2} />
          <SvgText
            x="175"
            y="35"
            fontSize="12"
            fill={colors.textLight}
            fontWeight="bold"
          >
            START
          </SvgText>
        </Svg>

        <View {...panResponder.panHandlers} style={styles.touchArea} />

        {isTracing && (
          <View style={[styles.tracingIndicator, { backgroundColor: colors.primary }]}>
            <Text style={styles.tracingIndicatorText}>✍️ Tracing...</Text>
          </View>
        )}
      </Animated.View>

      {showHint && (
        <View style={[styles.hintContainer, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="info" size={20} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.primary }]}>
            {validTracePoints.length === 0 ? "Trace exactly on the dotted lines!" : "Keep following the dotted line exactly!"}
          </Text>
        </View>
      )}

      {isComplete && (
        <View style={[styles.successContainer, { backgroundColor: colors.success }]}>
          <MaterialIcons name="check-circle" size={24} color="#FFF" />
          <Text style={styles.successText}>Perfect! +10 points</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
          onPress={resetTrace}
        >
          <MaterialIcons name="refresh" size={20} color={colors.primary} />
          <Text style={[styles.controlText, { color: colors.primary }]}>Clear Trace</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
          onPress={showHintHandler}
        >
          <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
          <Text style={[styles.controlText, { color: colors.primary }]}>Show Hint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  soundButton: {
    paddingHorizontal: 12,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 15,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  charContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  charDisplay: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  charHint: {
    fontSize: 14,
    marginTop: 10,
  },
  traceProgressContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  traceProgressLabel: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  traceProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  traceProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completeMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  tracingArea: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignSelf: 'center',
  },
  svgContainer: {
    backgroundColor: 'transparent',
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tracingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    opacity: 0.9,
  },
  tracingIndicatorText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  successText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
  },
});