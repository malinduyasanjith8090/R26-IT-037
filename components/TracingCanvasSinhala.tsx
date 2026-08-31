// components/TracingCanvasSinhala.tsx – Full corrected version (safe array handling)
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
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
const CANVAS_SIZE = width - 40;
const TRACE_AREA_SIZE = CANVAS_SIZE;
const SVG_VIEWBOX = '0 0 400 400';

// ─── TYPES ───────────────────────────────────────────────────────
interface Letter {
  letter: string;
  sound: string;
  strokes: number;
  diff: string;
  tip: string;
  phases: string[];
  cat?: Category;
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  letters: Letter[];
}

interface HistoryItem {
  letter: string;
  score: number;
  cat: string;
  ts: number;
}

interface ScoreResult {
  score: number;
  grade: GradeResult;
}

interface GradeResult {
  label: string;
  sub: string;
  stars: number;
  symbol: string;
}

interface AlertLogItem {
  text: string;
  type: string;
  time: string;
}

// ─── FULL LETTER CATEGORIES (all 23 letters) ───────────────────
const LETTER_CATEGORIES: Category[] = [
  {
    id: 'vowels',
    name: 'ස්වර',
    nameEn: 'Vowels',
    letters: [
      {
        letter: 'අ', sound: 'a', strokes: 1, diff: 'Easy',
        tip: 'Start top-left, curve right and loop down',
        phases: ['Start at the top — curve right, then loop down into a round body'],
      },
      {
        letter: 'ආ', sound: 'aa', strokes: 1, diff: 'Easy',
        tip: 'Like අ with a long tail extending right',
        phases: ['Trace the round body of අ, then extend a long sweeping tail to the right'],
      },
      {
        letter: 'ඇ', sound: 'ae', strokes: 1, diff: 'Easy',
        tip: 'Round body with a small hook at top',
        phases: ['Begin at the top-left hook, curve right, then bring the loop down and close it'],
      },
      {
        letter: 'ඈ', sound: 'aee', strokes: 2, diff: 'Medium',
        tip: 'ඇ plus a long right extension stroke',
        phases: ['Draw the round body of ඇ', 'Now add a long horizontal stroke to the right'],
      },
      {
        letter: 'ඉ', sound: 'i', strokes: 1, diff: 'Easy',
        tip: 'Single flowing loop, like a backwards e',
        phases: ['Start at the right, curve up and left, then loop around'],
      },
      {
        letter: 'ඊ', sound: 'ii', strokes: 2, diff: 'Medium',
        tip: 'ඉ with a vertical bar on the right',
        phases: ['Draw the ඉ loop', 'Now add a short vertical bar on the right side'],
      },
      {
        letter: 'උ', sound: 'u', strokes: 1, diff: 'Easy',
        tip: 'Bowl shape opening upward',
        phases: ['Start at the left, sweep down and curve right — like drawing a bowl'],
      },
      {
        letter: 'ඌ', sound: 'uu', strokes: 2, diff: 'Medium',
        tip: 'උ with a curved extension below',
        phases: ['Draw the bowl shape of උ', 'Now add a curved extension below, hooking to the left'],
      },
    ],
  },
  {
    id: 'ka',
    name: 'ක වර්ගය',
    nameEn: 'Ka Group',
    letters: [
      {
        letter: 'ක', sound: 'ka', strokes: 2, diff: 'Medium',
        tip: 'Top horizontal bar, then curved body below',
        phases: ['Draw a horizontal bar across the top', 'Now curve down to form the body and close below'],
      },
      {
        letter: 'ග', sound: 'ga', strokes: 2, diff: 'Medium',
        tip: 'Open loop curving to the right',
        phases: ['Start at the top, sweep down and curve right — leave the loop open', 'Bring the stroke back up slightly'],
      },
      {
        letter: 'ච', sound: 'cha', strokes: 1, diff: 'Easy',
        tip: 'Single smooth flowing curve, like a fishhook',
        phases: ['One smooth stroke — start at the top-right, sweep left and curve downward'],
      },
      {
        letter: 'ජ', sound: 'ja', strokes: 2, diff: 'Medium',
        tip: 'Vertical drop with curved base and hook',
        phases: ['Start at the top — draw a vertical line downward', 'Curve the base to the left and add a small hook'],
      },
      {
        letter: 'ට', sound: 'ṭa', strokes: 1, diff: 'Easy',
        tip: 'Circle with a short right exit stroke',
        phases: ['Draw a full circle, then exit with a short stroke to the right'],
      },
      {
        letter: 'ත', sound: 'tha', strokes: 2, diff: 'Medium',
        tip: 'Two linked loops at different heights',
        phases: ['Draw the upper loop', 'Add the lower loop, slightly larger, with a small tail'],
      },
      {
        letter: 'ද', sound: 'da', strokes: 2, diff: 'Hard',
        tip: 'Reversed P shape with flat bottom',
        phases: ['Start at the top-right — curve left across the top like a reversed P', 'Bring the line down with a flat base'],
      },
      {
        letter: 'න', sound: 'na', strokes: 2, diff: 'Medium',
        tip: 'Dental n — arch with right foot',
        phases: ['Draw the arch — start left, curve up and over to the right, then come down', 'Add a small right-facing foot'],
      },
      {
        letter: 'ප', sound: 'pa', strokes: 2, diff: 'Medium',
        tip: 'P-like shape with circular head',
        phases: ['Draw the circular head — go clockwise to form a full circle', 'Bring a vertical stem straight down'],
      },
      {
        letter: 'ම', sound: 'ma', strokes: 2, diff: 'Medium',
        tip: 'Two connected humps — like m in shape',
        phases: ['Draw the first hump — curve up from the left then down', 'Draw the second hump with a tail sweeping right'],
      },
      {
        letter: 'ය', sound: 'ya', strokes: 2, diff: 'Hard',
        tip: 'Y-shaped starting stroke with curved body',
        phases: ['Draw a Y-shaped upper stroke', 'From that point, curve the body right and close into a loop'],
      },
      {
        letter: 'ර', sound: 'ra', strokes: 1, diff: 'Easy',
        tip: 'Single elegant loop — like a teardrop',
        phases: ['One elegant stroke — start at the top-right, curve left, then spiral inward'],
      },
      {
        letter: 'ල', sound: 'la', strokes: 2, diff: 'Medium',
        tip: 'Tall vertical stroke with curved base',
        phases: ['Draw a tall vertical stroke from top to bottom', 'Curve the base to the left — like adding a foot'],
      },
      {
        letter: 'ස', sound: 'sa', strokes: 2, diff: 'Hard',
        tip: 'S-shaped main body with base loop',
        phases: ['Draw the S-shaped main body', 'Add the small closing loop at the very base'],
      },
      {
        letter: 'හ', sound: 'ha', strokes: 2, diff: 'Medium',
        tip: 'H-like structure with curved crossbar',
        phases: ['Draw two vertical-ish strokes with a gap between', 'Connect them with a curved crossbar in the middle'],
      },
    ],
  },
];

const ALL_LETTERS: Letter[] = LETTER_CATEGORIES.flatMap((cat) =>
  cat.letters.map((l) => ({ ...l, cat })),
);

const BRUSH_COLORS: { color: string; name: string }[] = [
  { color: '#111111', name: 'Black' },
  { color: '#444444', name: 'Charcoal' },
  { color: '#888888', name: 'Gray' },
  { color: '#1a56db', name: 'Blue' },
  { color: '#0e9f6e', name: 'Green' },
  { color: '#e02424', name: 'Red' },
  { color: '#9061f9', name: 'Purple' },
  { color: '#ff5a1f', name: 'Orange' },
];

const diffLabel = (d: string): string =>
  d === 'Easy' ? 'Easy' : d === 'Medium' ? 'Medium' : 'Hard';

const getGrade = (score: number): GradeResult => {
  if (score >= 90) return { label: 'Excellent', sub: 'Perfect tracing', stars: 3, symbol: '★★★' };
  if (score >= 75) return { label: 'Very Good', sub: 'Great technique', stars: 2, symbol: '★★☆' };
  if (score >= 60) return { label: 'Good', sub: 'Keep it up', stars: 2, symbol: '★★☆' };
  return { label: 'Try Again', sub: 'Practice more', stars: 1, symbol: '★☆☆' };
};

// ─── FULL KEYPOINTS (all letters) ────────────────────────────
const CUSTOM_KEYPOINTS: Record<string, { x: number; y: number }[]> = {
  'අ': [
    { x: 130, y: 120 }, { x: 180, y: 100 }, { x: 215, y: 140 },
    { x: 135, y: 160 }, { x: 155, y: 220 }, { x: 220, y: 230 },
    { x: 270, y: 210 }, { x: 220, y: 260 }, { x: 220, y: 285 },
    { x: 220, y: 310 }, { x: 220, y: 180 }, { x: 260, y: 100 },
    { x: 255, y: 130 }, { x: 270, y: 160 },
  ],
  'ආ': [
    { x: 80, y: 115 }, { x: 175, y: 135 }, { x: 95, y: 155 },
    { x: 110, y: 215 }, { x: 220, y: 210 }, { x: 175, y: 250 },
    { x: 175, y: 280 }, { x: 175, y: 180 }, { x: 210, y: 110 },
    { x: 230, y: 150 }, { x: 210, y: 170 }, { x: 275, y: 100 },
    { x: 310, y: 160 }, { x: 275, y: 230 },
  ],
  'ඇ': [
    { x: 95, y: 120 }, { x: 200, y: 400 }, { x: 160, y: 170 },
    { x: 220, y: 160 }, { x: 220, y: 220 }, { x: 180, y: 260 },
    { x: 140, y: 260 }, { x: 160, y: 310 }, { x: 200, y: 300 },
    { x: 100, y: 140 }, { x: 150, y: 190 }, { x: 190, y: 280 },
    { x: 130, y: 200 }, { x: 170, y: 130 },
  ],
  'ඈ': [
    { x: 170, y: 100 }, { x: 210, y: 80 }, { x: 230, y: 120 },
    { x: 180, y: 150 }, { x: 150, y: 200 }, { x: 170, y: 240 },
    { x: 220, y: 250 }, { x: 250, y: 220 }, { x: 290, y: 200 },
    { x: 330, y: 200 }, { x: 200, y: 140 }, { x: 250, y: 180 },
    { x: 310, y: 200 }, { x: 270, y: 160 },
  ],
  'ඉ': [
    { x: 260, y: 90 }, { x: 220, y: 100 }, { x: 180, y: 130 },
    { x: 160, y: 170 }, { x: 170, y: 220 }, { x: 200, y: 260 },
    { x: 240, y: 270 }, { x: 270, y: 240 }, { x: 280, y: 190 },
    { x: 280, y: 140 }, { x: 210, y: 150 }, { x: 190, y: 190 },
    { x: 230, y: 250 }, { x: 260, y: 260 },
  ],
  'ඊ': [
    { x: 260, y: 90 }, { x: 220, y: 100 }, { x: 180, y: 130 },
    { x: 160, y: 170 }, { x: 170, y: 220 }, { x: 200, y: 260 },
    { x: 240, y: 270 }, { x: 270, y: 240 }, { x: 280, y: 190 },
    { x: 300, y: 240 }, { x: 210, y: 150 }, { x: 190, y: 190 },
    { x: 230, y: 250 }, { x: 260, y: 260 },
  ],
  'උ': [
    { x: 140, y: 140 }, { x: 180, y: 110 }, { x: 220, y: 110 },
    { x: 260, y: 140 }, { x: 260, y: 200 }, { x: 240, y: 250 },
    { x: 200, y: 260 }, { x: 140, y: 250 }, { x: 120, y: 200 },
    { x: 150, y: 180 }, { x: 200, y: 130 }, { x: 240, y: 150 },
    { x: 230, y: 230 }, { x: 170, y: 240 },
  ],
  'ඌ': [
    { x: 140, y: 140 }, { x: 180, y: 110 }, { x: 220, y: 110 },
    { x: 260, y: 140 }, { x: 260, y: 200 }, { x: 240, y: 250 },
    { x: 200, y: 260 }, { x: 140, y: 250 }, { x: 120, y: 200 },
    { x: 170, y: 200 }, { x: 200, y: 130 }, { x: 240, y: 150 },
    { x: 230, y: 230 }, { x: 170, y: 240 },
  ],
  'ක': [
    { x: 110, y: 120 }, { x: 160, y: 130 }, { x: 210, y: 140 },
    { x: 240, y: 180 }, { x: 230, y: 220 }, { x: 190, y: 220 },
    { x: 175, y: 190 }, { x: 160, y: 220 }, { x: 120, y: 220 },
    { x: 125, y: 180 }, { x: 100, y: 170 }, { x: 220, y: 100 },
    { x: 295, y: 160 }, { x: 260, y: 225 },
  ],
  'ග': [
    { x: 170, y: 100 }, { x: 120, y: 140 }, { x: 125, y: 200 },
    { x: 170, y: 230 }, { x: 215, y: 200 }, { x: 220, y: 160 },
    { x: 200, y: 140 }, { x: 180, y: 160 }, { x: 200, y: 110 },
    { x: 250, y: 110 }, { x: 275, y: 140 }, { x: 275, y: 180 },
    { x: 260, y: 210 }, { x: 240, y: 225 },
  ],
  'ච': [
    { x: 280, y: 90 }, { x: 240, y: 100 }, { x: 200, y: 130 },
    { x: 170, y: 170 }, { x: 160, y: 220 }, { x: 180, y: 270 },
    { x: 210, y: 310 }, { x: 250, y: 320 }, { x: 280, y: 290 },
    { x: 290, y: 240 }, { x: 220, y: 150 }, { x: 180, y: 200 },
    { x: 200, y: 260 }, { x: 250, y: 280 },
  ],
  'ජ': [
    { x: 200, y: 80 }, { x: 200, y: 140 }, { x: 200, y: 200 },
    { x: 200, y: 260 }, { x: 180, y: 300 }, { x: 150, y: 320 },
    { x: 130, y: 300 }, { x: 140, y: 260 }, { x: 170, y: 250 },
    { x: 200, y: 240 }, { x: 180, y: 160 }, { x: 180, y: 220 },
    { x: 160, y: 280 }, { x: 190, y: 290 },
  ],
  'ට': [
    { x: 200, y: 100 }, { x: 150, y: 120 }, { x: 130, y: 170 },
    { x: 150, y: 220 }, { x: 200, y: 240 }, { x: 250, y: 220 },
    { x: 270, y: 170 }, { x: 250, y: 120 }, { x: 220, y: 130 },
    { x: 290, y: 170 }, { x: 170, y: 150 }, { x: 180, y: 200 },
    { x: 230, y: 200 }, { x: 250, y: 160 },
  ],
  'ත': [
    { x: 200, y: 90 }, { x: 160, y: 110 }, { x: 140, y: 150 },
    { x: 160, y: 200 }, { x: 200, y: 220 }, { x: 240, y: 200 },
    { x: 220, y: 250 }, { x: 180, y: 280 }, { x: 150, y: 310 },
    { x: 130, y: 340 }, { x: 180, y: 140 }, { x: 190, y: 190 },
    { x: 210, y: 240 }, { x: 170, y: 270 },
  ],
  'ද': [
    { x: 280, y: 90 }, { x: 230, y: 90 }, { x: 180, y: 100 },
    { x: 140, y: 130 }, { x: 130, y: 180 }, { x: 140, y: 240 },
    { x: 160, y: 280 }, { x: 190, y: 300 }, { x: 230, y: 300 },
    { x: 280, y: 280 }, { x: 170, y: 140 }, { x: 150, y: 200 },
    { x: 170, y: 260 }, { x: 220, y: 290 },
  ],
  'න': [
    { x: 140, y: 100 }, { x: 120, y: 150 }, { x: 140, y: 200 },
    { x: 180, y: 220 }, { x: 230, y: 210 }, { x: 260, y: 170 },
    { x: 260, y: 120 }, { x: 240, y: 100 }, { x: 200, y: 100 },
    { x: 280, y: 170 }, { x: 160, y: 160 }, { x: 190, y: 200 },
    { x: 240, y: 180 }, { x: 250, y: 140 },
  ],
  'ප': [
    { x: 200, y: 80 }, { x: 160, y: 100 }, { x: 140, y: 140 },
    { x: 160, y: 200 }, { x: 200, y: 220 }, { x: 240, y: 200 },
    { x: 260, y: 140 }, { x: 240, y: 100 }, { x: 200, y: 180 },
    { x: 200, y: 300 }, { x: 180, y: 160 }, { x: 220, y: 180 },
    { x: 240, y: 160 }, { x: 200, y: 260 },
  ],
  'ම': [
    { x: 140, y: 100 }, { x: 120, y: 150 }, { x: 140, y: 200 },
    { x: 180, y: 230 }, { x: 220, y: 210 }, { x: 220, y: 280 },
    { x: 180, y: 310 }, { x: 140, y: 310 }, { x: 120, y: 280 },
    { x: 160, y: 290 }, { x: 170, y: 180 }, { x: 200, y: 250 },
    { x: 190, y: 290 }, { x: 150, y: 270 },
  ],
  'ය': [
    { x: 200, y: 80 }, { x: 160, y: 100 }, { x: 130, y: 140 },
    { x: 130, y: 190 }, { x: 160, y: 230 }, { x: 210, y: 240 },
    { x: 250, y: 210 }, { x: 260, y: 170 }, { x: 240, y: 150 },
    { x: 200, y: 130 }, { x: 150, y: 160 }, { x: 170, y: 200 },
    { x: 220, y: 220 }, { x: 240, y: 190 },
  ],
  'ර': [
    { x: 280, y: 90 }, { x: 250, y: 110 }, { x: 220, y: 140 },
    { x: 200, y: 180 }, { x: 190, y: 230 }, { x: 210, y: 270 },
    { x: 240, y: 290 }, { x: 270, y: 270 }, { x: 280, y: 230 },
    { x: 270, y: 190 }, { x: 230, y: 130 }, { x: 200, y: 150 },
    { x: 210, y: 210 }, { x: 240, y: 250 },
  ],
  'ල': [
    { x: 200, y: 80 }, { x: 200, y: 150 }, { x: 200, y: 220 },
    { x: 200, y: 280 }, { x: 180, y: 310 }, { x: 150, y: 320 },
    { x: 130, y: 300 }, { x: 140, y: 260 }, { x: 170, y: 250 },
    { x: 190, y: 240 }, { x: 200, y: 100 }, { x: 200, y: 180 },
    { x: 200, y: 250 }, { x: 180, y: 290 },
  ],
  'ස': [
    { x: 200, y: 90 }, { x: 150, y: 110 }, { x: 130, y: 150 },
    { x: 170, y: 190 }, { x: 220, y: 210 }, { x: 260, y: 230 },
    { x: 280, y: 270 }, { x: 250, y: 300 }, { x: 200, y: 320 },
    { x: 150, y: 310 }, { x: 160, y: 140 }, { x: 190, y: 180 },
    { x: 240, y: 220 }, { x: 260, y: 260 },
  ],
  'හ': [
    { x: 140, y: 90 }, { x: 140, y: 160 }, { x: 140, y: 240 },
    { x: 140, y: 300 }, { x: 170, y: 310 }, { x: 220, y: 280 },
    { x: 260, y: 240 }, { x: 290, y: 200 }, { x: 270, y: 160 },
    { x: 230, y: 150 }, { x: 170, y: 130 }, { x: 200, y: 200 },
    { x: 230, y: 270 }, { x: 190, y: 270 },
  ],
};

function generateKeyPointsForLetter(letter: string): { x: number; y: number }[] {
  return CUSTOM_KEYPOINTS[letter] || [];
}

// ─── Sinhala audio mapping ─────────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../assets/sounds/sinhala/tracingsinhalainstruction.mp3'),
  'අ': require('../assets/sounds/sinhala/අ.mp3'),
  'ආ': require('../assets/sounds/sinhala/ආ.mp3'),
  'ඊ': require('../assets/sounds/sinhala/ඊ.mp3'),
  // Others fallback to TTS
};

// ─── ANIMATED COUNTER ──────────────────────────────────────────
interface AnimatedCounterProps { value: number; }
function AnimatedCounter({ value }: AnimatedCounterProps) {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else { setCount(current); }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <Text style={styles.counterText}>{count}</Text>;
}

// ─── LETTER GRID ───────────────────────────────────────────────
interface LetterGridProps {
  currentLetter: Letter | null;
  masteredSet: Set<string>;
  progressMap: Record<string, number>;
  onSelect: (letter: Letter) => void;
}
function LetterGrid({ currentLetter, masteredSet, onSelect }: LetterGridProps) {
  const { colors } = useTheme();
  const [openCat, setOpenCat] = useState<number>(-1);
  return (
    <View style={[styles.letterGrid, { backgroundColor: colors.background }]}>
      {LETTER_CATEGORIES.map((cat, ci) => {
        const catDone = cat.letters.filter((l) => masteredSet.has(l.letter)).length;
        const isOpen = openCat === ci;
        return (
          <View key={cat.id} style={styles.categoryContainer}>
            <TouchableOpacity onPress={() => setOpenCat(isOpen ? -1 : ci)} style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: isOpen ? colors.primary : colors.textLight }]}>
                {cat.nameEn}
              </Text>
              <Text style={[styles.categoryCount, { color: colors.textLight }]}>
                {catDone}/{cat.letters.length}
              </Text>
            </TouchableOpacity>
            {isOpen && (
              <View style={styles.lettersGrid}>
                {cat.letters.map((l) => {
                  const isMastered = masteredSet.has(l.letter);
                  const isCurrent = currentLetter?.letter === l.letter;
                  return (
                    <TouchableOpacity key={l.letter} onPress={() => onSelect(l)}
                      style={[
                        styles.letterButton,
                        { backgroundColor: colors.surface, borderColor: colors.primaryLight },
                        isCurrent && { backgroundColor: colors.primary, borderColor: colors.primary },
                        isMastered && !isCurrent && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                    >
                      <Text style={[styles.letterButtonText, { color: colors.primary }, isCurrent && { color: colors.background }, isMastered && !isCurrent && { color: colors.primary }]}>
                        {l.letter}
                      </Text>
                      {isMastered && !isCurrent && (
                        <View style={[styles.masteredBadge, { backgroundColor: colors.primary }]}>
                          <Text style={[styles.masteredBadgeText, { color: colors.background }]}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── SCORE OVERLAY ─────────────────────────────────────────────
interface ScoreOverlayProps {
  score: number;
  grade: GradeResult;
  onNext: () => void;
  onRetry: () => void;
  isLast: boolean;
}
function ScoreOverlay({ score, grade, onNext, onRetry, isLast }: ScoreOverlayProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.overlay, { backgroundColor: colors.background + 'F5' }]}>
      <View style={styles.overlayContent}>
        <Text style={[styles.overlayScore, { color: colors.primary }]}>{score}%</Text>
        <Text style={[styles.overlayLabel, { color: colors.primary }]}>{grade.label}</Text>
        <Text style={[styles.overlaySub, { color: colors.textLight }]}>{grade.sub}</Text>
        <Text style={[styles.overlaySymbol, { color: colors.primary }]}>{grade.symbol}</Text>
        <View style={styles.overlayButtons}>
          <TouchableOpacity onPress={onRetry} style={[styles.overlayButton, styles.retryButton, { borderColor: colors.primaryLight, backgroundColor: colors.surface }]}>
            <Text style={[styles.retryButtonText, { color: colors.primary }]}>Clear &amp; Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={[styles.overlayButton, styles.nextButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[styles.nextButtonText, { color: colors.background }]}>{isLast ? 'Finish' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
interface LetterTracingPageProps { lang?: 'en'; }

export default function TracingCanvasSinhala({ lang = 'en' }: LetterTracingPageProps) {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { playSound, playStarEarned, playCorrectAnswer, playCelebration, isEnabled: soundEnabled } = useSound();

  const [allLetters] = useState<Letter[]>(() => ALL_LETTERS);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [brushColor, setBrushColor] = useState<string>('#111111');
  const [points, setPoints] = useState<number>(0);
  const [masteredSet, setMasteredSet] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [showMilestone, setMilestone] = useState<boolean>(false);
  const [milestoneCount, setMilestoneCount] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [alertLog, setAlertLog] = useState<AlertLogItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // TRACING STATE
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [validTracePoints, setValidTracePoints] = useState<{ x: number; y: number }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollEnabled = useRef(true);

  // AUDIO LOADING
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  const current = allLetters[currentIdx];
  const cat = current?.cat;
  const total = allLetters.length;
  const pct = Math.round(((currentIdx + 1) / total) * 100);
  const bestScore = current ? (progressMap[current.letter] ?? 0) : 0;
  const accuracy = history.length > 0
    ? Math.round(history.slice(0, 10).reduce((a, h) => a + h.score, 0) / Math.min(history.length, 10))
    : 0;

  const keyPoints = generateKeyPointsForLetter(current.letter);

  const isPointNearKeyPoint = (point: { x: number; y: number }, tolerance = 35) => {
    return keyPoints.some(
      (kp) => Math.sqrt((point.x - kp.x) ** 2 + (point.y - kp.y) ** 2) <= tolerance,
    );
  };

  // Load Sinhala audio files
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

  useEffect(() => {
    return () => Speech.stop();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const instructionText = language === 'si'
        ? 'ආයුබෝවන්! අපි දැන් සිංහල අකුරු ලියන ආකාරය ඉගෙන ගමු. තිරයේ පෙන්වන අකුර දෙස බලා, ඔබේ ඇඟිල්ලෙන් එය මත අඳින්න. ලකුණු අනුගමනය කරමින් සෙමින් අඳින්න. සෑම අකුරක්ම සාර්ථකව ලිවීමට උත්සාහ කරන්න.'
        : 'Hello! Let\'s learn how to trace Sinhala letters. Look at the letter shown on the screen and draw over it with your finger. Follow the dots and trace slowly. Try to write each letter successfully.';
      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(current.letter), current.letter);
      }, 6000);
      return () => clearTimeout(timer);
    }
    speak(t(current.letter), current.letter);
  }, [currentIdx, language]);

  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      const instructionText = language === 'si'
        ? 'ආයුබෝවන්! අපි දැන් සිංහල අකුරු ලියන ආකාරය ඉගෙන ගමු. තිරයේ පෙන්වන අකුර දෙස බලා, ඔබේ ඇඟිල්ලෙන් එය මත අඳින්න. ලකුණු අනුගමනය කරමින් සෙමින් අඳින්න. සෑම අකුරක්ම සාර්ථකව ලිවීමට උත්සාහ කරන්න.'
        : 'Hello! Let\'s learn how to trace Sinhala letters. Look at the letter shown on the screen and draw over it with your finger. Follow the dots and trace slowly. Try to write each letter successfully.';
      speak(instructionText, 'instruction');
      const timer = setTimeout(() => {
        speak(t(current.letter), current.letter);
      }, 18000);
      return () => clearTimeout(timer);
    }
  }, [soundsLoaded]);

  useEffect(() => {
    if (validTracePoints.length > 0 && !isComplete) {
      const covered = new Set<number>();
      validTracePoints.forEach((tp) => {
        keyPoints.forEach((kp, idx) => {
          if (Math.sqrt((tp.x - kp.x) ** 2 + (tp.y - kp.y) ** 2) <= 35) {
            covered.add(idx);
          }
        });
      });
      let percentage = (covered.size / keyPoints.length) * 100;
      percentage = Math.min(100, percentage + validTracePoints.length * 0.02);
      setTraceProgress(percentage);
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 200,
        useNativeDriver: false,
      }).start();
      if (percentage >= 95 && validTracePoints.length > 20 && !isComplete) {
        handleCorrect();
      }
    }
  }, [validTracePoints]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          scrollEnabled.current = false;
          return true;
        }
        return false;
      },
      onPanResponderGrant: async (evt) => {
        scrollEnabled.current = false;
        const { locationX, locationY } = evt.nativeEvent;
        const x = (locationX / CANVAS_SIZE) * 400;
        const y = (locationY / TRACE_AREA_SIZE) * 400;
        const newPoint = { x, y };

        // ✅ FIX: use prev ?? [] to avoid undefined spread
        setStrokes(prev => [...(prev ?? []), [newPoint]]);
        setHasDrawn(true);
        setIsTracing(true);
        await playSound('click', false);
        if (isPointNearKeyPoint(newPoint)) {
          setValidTracePoints(prev => [...(prev ?? []), newPoint]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          await playSound('star', false);
        }
      },
      onPanResponderMove: async (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const x = (locationX / CANVAS_SIZE) * 400;
        const y = (locationY / TRACE_AREA_SIZE) * 400;
        const newPoint = { x, y };

        // ✅ FIX: handle undefined prev and missing last stroke
        setStrokes(prev => {
          const current = prev ?? [];
          if (current.length === 0) {
            return [[newPoint]];
          }
          const updated = [...current];
          updated[current.length - 1] = [...(updated[current.length - 1] ?? []), newPoint];
          return updated;
        });

        if (isPointNearKeyPoint(newPoint)) {
          setValidTracePoints(prev => [...(prev ?? []), newPoint]);
          if (validTracePoints.length % 10 === 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await playSound('star', false);
          }
        }
      },
      onPanResponderRelease: () => {
        scrollEnabled.current = true;
        setIsTracing(false);
      },
    }),
  ).current;

  const handleCorrect = async () => {
    if (isComplete) return;
    setIsComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await playCorrectAnswer();
    await playStarEarned();
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setPoints((prev) => prev + 10);
    setTimeout(async () => {
      setIsComplete(false);
      setStrokes([]);
      setValidTracePoints([]);
      setTraceProgress(0);
      if (currentIdx < allLetters.length - 1) {
        setCurrentIdx(currentIdx + 1);
        await playSound('click', false);
      } else {
        await playCelebration();
        setCurrentIdx(0);
      }
    }, 1500);
  };

  const handleClear = async () => {
    setStrokes([]);
    setValidTracePoints([]);
    setHasDrawn(false);
    setScoreResult(null);
    setIsComplete(false);
    setTraceProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound('click', false);
  };

  const handleCheck = async () => {
    if (!hasDrawn || isComplete) return;
    const hitsPerKeypoint = new Array(keyPoints.length).fill(0);
    validTracePoints.forEach((tp) => {
      keyPoints.forEach((kp, idx) => {
        if (Math.sqrt((tp.x - kp.x) ** 2 + (tp.y - kp.y) ** 2) <= 35) {
          hitsPerKeypoint[idx]++;
        }
      });
    });
    const wellTraced = hitsPerKeypoint.filter(hits => hits >= 3).length;
    const raw = (wellTraced / keyPoints.length) * 100;
    const grade = getGrade(raw);
    setScoreResult({ score: Math.round(raw), grade });
    setPoints((p) => p + Math.round(raw / 8));
    if (current) {
      setProgressMap((pm) => ({ ...pm, [current.letter]: Math.max(pm[current.letter] ?? 0, raw) }));
      setHistory((h) =>
        [{ letter: current.letter, score: Math.round(raw), cat: cat?.nameEn || '', ts: Date.now() }, ...h].slice(0, 50),
      );
    }
    if (raw >= 80) {
      await playCelebration();
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1600);
      if (!masteredSet.has(current.letter)) {
        const nm = new Set([...masteredSet, current.letter]);
        setMasteredSet(nm);
        if (nm.size % 5 === 0) {
          setMilestoneCount(nm.size);
          setMilestone(true);
          await playSound('reward', false);
          setTimeout(() => setMilestone(false), 3500);
        }
      }
    } else {
      await playSound('error', false);
    }
  };

  const handleNext = async () => {
    await playSound('click', false);
    handleClear();
    setCurrentIdx((i) => (i < total - 1 ? i + 1 : 0));
  };

  const handlePrev = async () => {
    if (currentIdx > 0) {
      await playSound('click', false);
      handleClear();
      setCurrentIdx((i) => i - 1);
    }
  };

  const handleRetry = async () => {
    await playSound('click', false);
    handleClear();
    setScoreResult(null);
  };

  const handleSelectLetter = async (letter: Letter) => {
    const idx = allLetters.findIndex((l) => l.letter === letter.letter);
    if (idx !== -1) {
      await playSound('click', false);
      handleClear();
      setCurrentIdx(idx);
    }
    setSidebarOpen(false);
  };

  const handleToggleGuide = async () => {
    await playSound('click', false);
    setShowGuide(!showGuide);
  };

  const handleBrushColorChange = async (color: string) => {
    if (brushColor !== color) {
      await playSound('click', false);
      setBrushColor(color);
    }
  };

  const progressStats = [
    { label: 'Points', value: points },
    { label: 'Mastered', value: masteredSet.size },
    { label: 'Accuracy', value: accuracy },
  ];

  if (!current) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textLight }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.background, borderBottomColor: colors.primaryLight }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressText, { color: colors.textLight }]}>Letter {currentIdx + 1} of {total}</Text>
          <Text style={[styles.progressText, { color: colors.textLight }]}>{pct}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.statsRow}>
          {progressStats.map(({ label, value }) => (
            <View key={label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroContainer, { borderBottomColor: colors.primaryLight }]}>
        <View style={styles.heroTextContainer}>
          <View style={[styles.categoryBadge, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>{cat?.nameEn} — Letter {currentIdx + 1}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.primary }]}>
            Practice{' '}<Text style={[styles.heroLetter, { color: colors.primary }]}>{current.letter}</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textLight }]}>
            /{current.sound}/ · {current.strokes} stroke{current.strokes > 1 ? 's' : ''} · {current.diff}
          </Text>
        </View>
        <View style={[styles.bigLetterContainer, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }]}>
          <Text style={[styles.bigLetter, { color: colors.primary }]}>{current.letter}</Text>
          {masteredSet.has(current.letter) && (
            <View style={[styles.masteredBigBadge, { backgroundColor: colors.success }]}>
              <Text style={[styles.masteredBigBadgeText, { color: colors.background }]}>✓</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled.current}
        onMoveShouldSetResponder={() => scrollEnabled.current}
      >
        {/* Navigation */}
        <View style={styles.navRow}>
          <View style={styles.navButtons}>
            <TouchableOpacity onPress={handlePrev} style={[styles.navButton, { borderColor: colors.primaryLight, backgroundColor: colors.surface }, currentIdx === 0 && styles.navButtonDisabled]}>
              <Text style={[styles.navButtonText, { color: colors.textLight }]}>← Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={[styles.navButton, { borderColor: colors.primaryLight, backgroundColor: colors.surface }]}>
              <Text style={[styles.navButtonText, { color: colors.textLight }]}>Next →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.guideControls}>
            {bestScore > 0 && (
              <Text style={[styles.bestScore, { color: colors.textLight }]}>
                Best: <Text style={[styles.bestScoreValue, { color: colors.primary }]}>{bestScore}%</Text>
              </Text>
            )}
            <TouchableOpacity onPress={handleToggleGuide} style={[styles.guideToggle, { borderColor: colors.primaryLight, backgroundColor: showGuide ? colors.primary : colors.surface }]}>
              <Text style={[styles.guideToggleText, { color: showGuide ? colors.background : colors.textLight }]}>
                {showGuide ? 'Guide on' : 'Guide off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trace Progress */}
        <View style={styles.traceProgressContainer}>
          <Text style={[styles.traceProgressLabel, { color: colors.textLight }]}>Live Guide: {Math.floor(traceProgress)}%</Text>
          <View style={[styles.traceProgressBar, { backgroundColor: colors.primaryLight }]}>
            <Animated.View style={[styles.traceProgressFill,
            {
              width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: traceProgress >= 95 ? colors.success : colors.primary,
            }
            ]} />
          </View>
          {traceProgress >= 95 && !isComplete && (
            <Text style={[styles.completeMessage, { color: colors.success }]}>✓ Excellent! Moving to next...</Text>
          )}
        </View>

        {/* Tracing Canvas */}
        <Animated.View style={[styles.tracingArea, { backgroundColor: colors.surface, transform: [{ scale: scaleAnim }] }]}>
          <Svg width={CANVAS_SIZE} height={TRACE_AREA_SIZE} viewBox={SVG_VIEWBOX} style={styles.svgContainer}>
            <SvgText x="200" y="240" fontSize="300" fontWeight="bold" fill={colors.primaryLight} textAnchor="middle" opacity={0.15}>
              {current.letter}
            </SvgText>

            {keyPoints.map((kp, idx) => {
              const covered = validTracePoints.some(
                (tp) => Math.sqrt((tp.x - kp.x) ** 2 + (tp.y - kp.y) ** 2) <= 30,
              );
              return (
                <React.Fragment key={idx}>
                  <Circle cx={kp.x} cy={kp.y} r="10" fill={covered ? colors.success : colors.primaryLight} opacity={covered ? 0.8 : 0.4} />
                  <SvgText x={kp.x} y={kp.y + 4} fontSize="12" fontWeight="bold" textAnchor="middle" fill={covered ? '#166534' : colors.primary}>
                    {idx + 1}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {strokes.map((stroke, i) => {
              if (stroke.length < 2) return null;
              const d = `M ${stroke[0].x} ${stroke[0].y} ` +
                stroke.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
              return (
                <Path
                  key={i}
                  d={d}
                  stroke={brushColor}
                  strokeWidth={brushSize}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.7}
                />
              );
            })}
          </Svg>

          <View {...panResponder.panHandlers} style={styles.touchArea} />

          {isTracing && (
            <View style={[styles.tracingIndicator, { backgroundColor: colors.primary }]}>
              <Text style={styles.tracingIndicatorText}>✍️ Tracing...</Text>
            </View>
          )}
        </Animated.View>

        <View style={[styles.canvasActions, { borderTopColor: colors.primaryLight }]}>
          <TouchableOpacity onPress={handleClear} style={[styles.clearButton, { borderColor: colors.primaryLight, backgroundColor: colors.surface }]}>
            <Text style={[styles.clearButtonText, { color: colors.textLight }]}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCheck} disabled={!hasDrawn || isComplete}
            style={[styles.checkButton, (!hasDrawn || isComplete) && styles.checkButtonDisabled, hasDrawn && !isComplete && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={[styles.checkButtonText, (!hasDrawn || isComplete) && { color: colors.textLight }, hasDrawn && !isComplete && { color: colors.background }]}>
              Check My Work →
            </Text>
          </TouchableOpacity>
        </View>

        {scoreResult && (
          <ScoreOverlay score={scoreResult.score} grade={scoreResult.grade} onNext={() => { setScoreResult(null); handleNext(); }} onRetry={handleRetry} isLast={currentIdx === total - 1} />
        )}

        <View style={[styles.voiceContainer, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
          <View style={styles.voiceHeader}><Text style={[styles.voiceTitle, { color: colors.textLight }]}>🎤 Voice Guidance</Text></View>
          <View style={styles.voiceLog}>
            {alertLog.slice(-3).map((a, i) => (
              <Text key={i} style={[styles.voiceLogEntry, { color: colors.textLight }]}>→ {a.text}</Text>
            ))}
          </View>
        </View>

        {history.length > 0 && (
          <View style={[styles.recentContainer, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Recent attempts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
              {history.slice(0, 6).map((h, i) => (
                <View key={i} style={styles.recentItem}>
                  <View style={[styles.recentLetter, { borderColor: colors.primaryLight, backgroundColor: colors.background }, h.score >= 80 && { backgroundColor: colors.success, borderColor: colors.success }]}>
                    <Text style={[styles.recentLetterText, { color: colors.primary }, h.score >= 80 && { color: colors.background }]}>{h.letter}</Text>
                  </View>
                  <Text style={[styles.recentScore, { color: colors.textLight }]}>{h.score}%</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.brushContainer, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Brush Settings</Text>
          <View style={styles.brushSizeControl}>
            <Text style={[styles.brushSizeLabel, { color: colors.textLight }]}>Size: {brushSize}px</Text>
            <View style={styles.brushSizePreview}>
              <View style={[styles.brushPreview, { backgroundColor: brushColor, width: brushSize, height: brushSize }]} />
            </View>
          </View>
          <View style={styles.colorGrid}>
            {BRUSH_COLORS.map((b) => (
              <TouchableOpacity key={b.color} onPress={() => handleBrushColorChange(b.color)}
                style={[styles.colorButton, { backgroundColor: b.color }, brushColor === b.color && styles.colorButtonActive]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={sidebarOpen} animationType="slide" transparent={true} onRequestClose={() => setSidebarOpen(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.primary + '80' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>Menu</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <Text style={[styles.modalCloseText, { color: colors.primary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <LetterGrid currentLetter={current} masteredSet={masteredSet} progressMap={progressMap} onSelect={handleSelectLetter} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={() => setSidebarOpen(true)} style={[styles.menuButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.menuButtonText, { color: colors.background }]}>☰</Text>
      </TouchableOpacity>

      {showMilestone && (
        <View style={[styles.milestoneToast, { backgroundColor: colors.success }]}>
          <Text style={styles.milestoneIcon}>★</Text>
          <View>
            <Text style={[styles.milestoneTitle, { color: colors.background }]}>Milestone!</Text>
            <Text style={[styles.milestoneSubtitle, { color: colors.background + 'CC' }]}>{milestoneCount} letters mastered</Text>
          </View>
          <Text style={styles.milestoneIcon}>★</Text>
        </View>
      )}
    </View>
  );
}

// ─── STYLES (same as before, kept for completeness) ─────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  progressContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 0.5 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 11, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  progressBar: { height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', fontFamily: Platform.select({ ios: 'Playfair Display', android: 'serif' }) },
  statLabel: { fontSize: 10, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }), textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  counterText: { fontSize: 18, fontWeight: '800', fontFamily: Platform.select({ ios: 'Playfair Display', android: 'serif' }) },
  heroContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 0.5 },
  heroTextContainer: { flex: 1 },
  categoryBadge: { alignSelf: 'flex-start', borderWidth: 0.5, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  categoryBadgeText: { fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  heroTitle: { fontSize: 32, fontWeight: '800', fontFamily: Platform.select({ ios: 'Playfair Display', android: 'serif' }), marginBottom: 6 },
  heroLetter: { fontStyle: 'italic' },
  heroSubtitle: { fontSize: 13, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  bigLetterContainer: { width: 80, height: 80, borderRadius: 16, borderWidth: 0.5, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  bigLetter: { fontSize: 48, fontWeight: '900', fontFamily: Platform.select({ ios: 'Noto Sans Sinhala', android: 'sans-serif' }) },
  masteredBigBadge: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  masteredBigBadgeText: { fontSize: 10, fontWeight: 'bold' },
  mainContent: { flex: 1, paddingHorizontal: 16 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16, flexWrap: 'wrap', gap: 10 },
  navButtons: { flexDirection: 'row', gap: 8 },
  navButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 0.5 },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { fontSize: 13, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  guideControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bestScore: { fontSize: 13, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  bestScoreValue: { fontWeight: '600' },
  guideToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  guideToggleText: { fontSize: 12, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  traceProgressContainer: { marginBottom: 20, paddingHorizontal: 10 },
  traceProgressLabel: { fontSize: 12, marginBottom: 5, textAlign: 'center' },
  traceProgressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  traceProgressFill: { height: '100%', borderRadius: 4 },
  completeMessage: { fontSize: 12, textAlign: 'center', marginTop: 5, fontWeight: 'bold' },
  tracingArea: { borderRadius: 16, overflow: 'hidden', position: 'relative', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, alignSelf: 'center', width: CANVAS_SIZE, height: TRACE_AREA_SIZE },
  svgContainer: { backgroundColor: 'transparent' },
  touchArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  tracingIndicator: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, opacity: 0.9 },
  tracingIndicatorText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  canvasActions: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 0.5 },
  clearButton: { flex: 0, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, borderWidth: 0.5 },
  clearButtonText: { fontSize: 13, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  checkButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  checkButtonDisabled: { backgroundColor: '#f0f0f0' },
  checkButtonText: { fontSize: 14, fontWeight: '500', textAlign: 'center', fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  voiceContainer: { borderWidth: 0.5, borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  voiceHeader: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'transparent' },
  voiceTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  voiceLog: { padding: 12, maxHeight: 100 },
  voiceLogEntry: { fontSize: 11, marginBottom: 4, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  recentContainer: { borderWidth: 0.5, borderRadius: 12, padding: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 12, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  recentScroll: { flexGrow: 0 },
  recentItem: { alignItems: 'center', marginRight: 12 },
  recentLetter: { width: 36, height: 36, borderRadius: 8, borderWidth: 0.5, justifyContent: 'center', alignItems: 'center' },
  recentLetterText: { fontSize: 18, fontWeight: '900', fontFamily: Platform.select({ ios: 'Noto Sans Sinhala', android: 'sans-serif' }) },
  recentScore: { fontSize: 10, marginTop: 4 },
  brushContainer: { borderWidth: 0.5, borderRadius: 12, padding: 16, marginBottom: 16 },
  brushSizeControl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  brushSizeLabel: { fontSize: 12, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  brushSizePreview: { alignItems: 'center' },
  brushPreview: { borderRadius: 50 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorButton: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  colorButtonActive: { borderColor: '#fff', borderWidth: 2.5, transform: [{ scale: 1.05 }] },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  overlayContent: { alignItems: 'center', paddingHorizontal: 24 },
  overlayScore: { fontSize: 80, fontWeight: '800', fontFamily: Platform.select({ ios: 'Playfair Display', android: 'serif' }), marginBottom: 8 },
  overlayLabel: { fontSize: 22, fontWeight: '600', fontFamily: Platform.select({ ios: 'Playfair Display', android: 'serif' }), marginBottom: 6 },
  overlaySub: { fontSize: 13, fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }), marginBottom: 8 },
  overlaySymbol: { fontSize: 20, letterSpacing: 6, marginBottom: 28 },
  overlayButtons: { flexDirection: 'row', gap: 10 },
  overlayButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  retryButton: { borderWidth: 0.5 },
  retryButtonText: { fontSize: 13, fontWeight: '500', fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  nextButton: { borderWidth: 0.5 },
  nextButtonText: { fontSize: 13, fontWeight: '500', fontFamily: Platform.select({ ios: 'DM Sans', android: 'sans-serif' }) },
  letterGrid: { gap: 8 },
  categoryContainer: { marginBottom: 8 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: 'transparent' },
  categoryName: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  categoryCount: { fontSize: 11 },
  lettersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 10, paddingBottom: 14 },
  letterButton: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  letterButtonText: { fontSize: 18, fontWeight: '700', fontFamily: Platform.select({ ios: 'Noto Sans Sinhala', android: 'sans-serif' }) },
  masteredBadge: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  masteredBadgeText: { fontSize: 9 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: Platform.select({ ios: 'Playfair Display', android: 'serif' }) },
  modalCloseText: { fontSize: 24 },
  menuButton: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  menuButtonText: { fontSize: 24 },
  milestoneToast: { position: 'absolute', bottom: 80, left: 20, right: 20, borderRadius: 100, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  milestoneIcon: { fontSize: 18, color: '#fff' },
  milestoneTitle: { fontSize: 14, fontWeight: '700' },
  milestoneSubtitle: { fontSize: 11 },
});