// app/(games)/ThinkingGames.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
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
  titleKey: string;
  descKey: string;
  icon: string;
  color: string;
  component: string;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const thinkingGames: ThinkingGame[] = [
  {
    id: 'odd-one-out',
    titleKey: 'thinkingGames.oddOneOut.title',
    descKey: 'thinkingGames.oddOneOut.desc',
    icon: 'find-replace',
    color: '#FF6B6B',
    component: 'OddOneOut',
  },
  {
    id: 'what-comes-next',
    titleKey: 'thinkingGames.sequence.title',
    descKey: 'thinkingGames.sequence.desc',
    icon: 'timeline',
    color: '#4ECDC4',
    component: 'SequenceGame',
  },
  {
    id: 'sorting-game',
    titleKey: 'thinkingGames.sorting.title',
    descKey: 'thinkingGames.sorting.desc',
    icon: 'category',
    color: '#FFD166',
    component: 'SortingGame',
  },
  {
    id: 'analogy-game',
    titleKey: 'thinkingGames.analogy.title',
    descKey: 'thinkingGames.analogy.desc',
    icon: 'compare-arrows',
    color: '#06D6A0',
    component: 'AnalogyGame',
  },
];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ─────────────────────────────────────────────────────────────
// ODD ONE OUT — tap to spot the odd tile among scattered ones
// ─────────────────────────────────────────────────────────────
function OddOneOut({ colors, onComplete }: any) {
  const { playSound, playCorrectAnswer, playStarEarned } = useSound();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongIdx, setWrongIdx] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<'playing' | 'correct'>('playing');
  const [showReward, setShowReward] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const tileAnims = useRef<Animated.Value[]>([]).current;
  const shakeAnims = useRef<Animated.Value[]>([]).current;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const questions = [
    { items: ['🍎', '🍌', '🍊', '🚗'], oddIndex: 3, explanationKey: 'thinkingGames.oddOneOut.explain.fruit' },
    { items: ['🐱', '🐶', '🐦', '✈️'], oddIndex: 3, explanationKey: 'thinkingGames.oddOneOut.explain.animal' },
    { items: ['🔴', '🔵', '🟢', '🍎'], oddIndex: 3, explanationKey: 'thinkingGames.oddOneOut.explain.color' },
    { items: ['😊', '😢', '🚗', '😠'], oddIndex: 2, explanationKey: 'thinkingGames.oddOneOut.explain.emotion' },
    { items: ['1', '2', '3', 'A'], oddIndex: 3, explanationKey: 'thinkingGames.oddOneOut.explain.letter' },
    { items: ['🐶', '🐱', '🐭', '🍕'], oddIndex: 3, explanationKey: 'thinkingGames.oddOneOut.explain.pet' },
    { items: ['📚', '✏️', '📖', '🍔'], oddIndex: 3, explanationKey: 'thinkingGames.oddOneOut.explain.school' },
  ];

  const currentQuestion = questions[currentIndex];

  const TILE_SIZE = 92;
  const fieldWidth = width - Spacing.md * 2;
  const layout = React.useMemo(() => {
    const cols = 2;
    const cellW = fieldWidth / cols;
    const cellH = 120;
    return currentQuestion.items.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const jitterX = (Math.random() - 0.5) * cellW * 0.3;
      const jitterY = (Math.random() - 0.5) * cellH * 0.3;
      const rotate = (Math.random() - 0.5) * 16;
      return {
        left: col * cellW + cellW / 2 + jitterX - TILE_SIZE / 2,
        top: row * cellH + cellH / 2 + jitterY - TILE_SIZE / 2,
        rotate,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    setWrongIdx(new Set());
    setStatus('playing');
    tileAnims.length = 0;
    shakeAnims.length = 0;
    currentQuestion.items.forEach(() => {
      tileAnims.push(new Animated.Value(0));
      shakeAnims.push(new Animated.Value(0));
    });
    const anims = tileAnims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 280, delay: i * 90, useNativeDriver: true })
    );
    Animated.stagger(60, anims).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const triggerShake = (idx: number) => {
    const anim = shakeAnims[idx];
    if (!anim) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleTap = async (idx: number) => {
    if (status !== 'playing' || wrongIdx.has(idx)) return;

    if (idx === currentQuestion.oddIndex) {
      setStatus('correct');
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
          setTimeout(() => onComplete(newScore), 2000);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, 1300);
    } else {
      setWrongIdx((prev) => new Set(prev).add(idx));
      triggerShake(idx);
      await playSound('error', true);
    }
  };

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameQuestion, { color: colors.text }]}>{t('thinkingGames.oddOneOut.question')}</Text>
      <View style={[styles.scatterField, { height: 260 }]}>
        {currentQuestion.items.map((item, idx) => {
          const pos = layout[idx];
          const enter = tileAnims[idx] ?? new Animated.Value(1);
          const shake = shakeAnims[idx] ?? new Animated.Value(0);
          const isWrong = wrongIdx.has(idx);
          const isCorrectTile = status === 'correct' && idx === currentQuestion.oddIndex;
          return (
            <Animated.View
              key={`${currentIndex}-${idx}`}
              style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                opacity: isWrong ? 0.35 : enter,
                transform: [
                  { scale: enter },
                  { rotate: `${pos.rotate}deg` },
                  {
                    translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={isWrong || status !== 'playing'}
                onPress={() => handleTap(idx)}
                style={[
                  styles.itemCard,
                  {
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: colors.surface,
                    borderColor: isCorrectTile ? colors.success : colors.primaryLight,
                    borderWidth: isCorrectTile ? 4 : 3,
                  },
                ]}
              >
                <Text style={styles.itemEmoji}>{item}</Text>
                {isCorrectTile && (
                  <View style={styles.correctBadge}>
                    <MaterialIcons name="check-circle" size={22} color={colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      {wrongIdx.size > 0 && status === 'playing' && (
        <View style={[styles.explanationContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="lightbulb" size={20} color={colors.error} />
          <Text style={[styles.explanationText, { color: colors.error }]}>
            {t('thinkingGames.hint')}: {t(currentQuestion.explanationKey)}
          </Text>
        </View>
      )}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🎉</Text>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>{t('thinkingGames.reward.oddOneOut.title')}</Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>{t('thinkingGames.reward.oddOneOut.message')}</Text>
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

// ─────────────────────────────────────────────────────────────
// SEQUENCE GAME — drag the missing piece into the empty slot
// ─────────────────────────────────────────────────────────────
function SequenceGame({ colors, onComplete }: any) {
  const { playSound, playCorrectAnswer, playStarEarned, playCelebration } = useSound();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [wrongPulse, setWrongPulse] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const slotShake = useRef(new Animated.Value(0)).current;
  const [showReward, setShowReward] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

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

  const [rowLayout, setRowLayout] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [trayLayout, setTrayLayout] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [slotLocal, setSlotLocal] = useState<Rect | null>(null);
  const [tileLocals, setTileLocals] = useState<{ [opt: string]: Rect }>({});
  const pans = useRef<{ [opt: string]: Animated.ValueXY }>({});
  const shuffledOptions = React.useMemo(() => shuffleArray(currentQuestion.options), [currentIndex]);

  useEffect(() => {
    setPlaced(false);
    setWrongPulse(false);
    setSlotLocal(null);
    setTileLocals({});
    pans.current = {};
    currentQuestion.options.forEach((opt) => {
      pans.current[opt] = new Animated.ValueXY({ x: 0, y: 0 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const shakeSlot = () => {
    slotShake.setValue(0);
    Animated.sequence([
      Animated.timing(slotShake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(slotShake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(slotShake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(slotShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const proceed = (newScore: number) => {
    setTimeout(async () => {
      if (currentIndex + 1 >= questions.length) {
        await playCelebration();
        setShowReward(true);
        setTimeout(() => onComplete(newScore), 2000);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1300);
  };

  const handleDrop = async (option: string, dx: number, dy: number) => {
    const tileLocal = tileLocals[option];
    if (!tileLocal || !slotLocal) {
      Animated.spring(pans.current[option], { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      return;
    }
    const centerX = trayLayout.x + tileLocal.x + tileLocal.width / 2 + dx;
    const centerY = trayLayout.y + tileLocal.y + tileLocal.height / 2 + dy;
    const slotX = rowLayout.x + slotLocal.x;
    const slotY = rowLayout.y + slotLocal.y;
    const hit =
      centerX >= slotX &&
      centerX <= slotX + slotLocal.width &&
      centerY >= slotY &&
      centerY <= slotY + slotLocal.height;

    if (hit && option === currentQuestion.correct) {
      setPlaced(true);
      await playCorrectAnswer();
      const newScore = score + 10;
      setScore(newScore);
      await playStarEarned();
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      proceed(newScore);
    } else {
      Animated.spring(pans.current[option], { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      if (hit) {
        setWrongPulse(true);
        shakeSlot();
        await playSound('error', true);
        setTimeout(() => setWrongPulse(false), 500);
      }
    }
  };

  const createResponder = (option: string) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !placed,
      onMoveShouldSetPanResponder: () => !placed,
      onPanResponderMove: (_, gesture) => {
        pans.current[option]?.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        handleDrop(option, gesture.dx, gesture.dy);
      },
      onPanResponderTerminate: () => {
        Animated.spring(pans.current[option], { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    });

  // Safe layout helpers
  const handleRowLayout = (event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setRowLayout(nativeEvent.layout);
    }
  };

  const handleSlotLayout = (event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setSlotLocal(nativeEvent.layout);
    }
  };

  const handleTrayLayout = (event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setTrayLayout(nativeEvent.layout);
    }
  };

  const handleTileLayout = (option: string, event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setTileLocals((prev) => ({ ...prev, [option]: nativeEvent.layout }));
    }
  };

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameQuestion, { color: colors.text }]}>{t('thinkingGames.sequence.question')}</Text>

      <View onLayout={handleRowLayout} style={styles.sequenceContainer}>
        {currentQuestion.sequence.map((item, idx) => {
          const isTarget = idx === currentQuestion.sequence.length - 1;
          return (
            <Animated.View
              key={idx}
              onLayout={isTarget ? handleSlotLayout : undefined}
              style={[
                styles.sequenceItem,
                { backgroundColor: colors.surface },
                isTarget && [
                  styles.missingItem,
                  {
                    borderColor: wrongPulse ? colors.error : placed ? colors.success : '#FFD700',
                    transform: [
                      {
                        translateX: slotShake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] }),
                      },
                    ],
                  },
                ],
              ]}
            >
              <Text style={styles.sequenceEmoji}>{isTarget ? (placed ? currentQuestion.correct : '') : item}</Text>
              {isTarget && placed && (
                <View style={styles.correctBadge}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>

      <Text style={[styles.trayLabel, { color: colors.textLight }]}>
        {t('thinkingGames.sequence.dragHint') || 'Drag a piece into the empty space:'}
      </Text>

      <View onLayout={handleTrayLayout} style={styles.optionsContainer}>
        {shuffledOptions.map((option) => {
          if (placed && option === currentQuestion.correct) return <View key={option} style={styles.sequenceOptionGhost} />;
          const pan = pans.current[option] ?? new Animated.ValueXY();
          const responder = createResponder(option);
          return (
            <Animated.View
              key={option}
              {...responder.panHandlers}
              onLayout={(e) => handleTileLayout(option, e)}
              style={{ transform: pan.getTranslateTransform(), zIndex: 2 }}
            >
              <View
                style={[
                  styles.sequenceOption,
                  { backgroundColor: colors.surface, borderColor: colors.primaryLight, borderWidth: 3 },
                ]}
              >
                <Text style={styles.optionEmoji}>{option}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🎉</Text>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>{t('thinkingGames.reward.sequence.title')}</Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>{t('thinkingGames.reward.sequence.message')}</Text>
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

// ─────────────────────────────────────────────────────────────
// SORTING GAME — drag each item into the correct bin
// ─────────────────────────────────────────────────────────────
interface SortItem {
  emoji: string;
  category: string;
}
interface SortRound {
  bins: { key: string; label: string; icon: string; color: string }[];
  items: SortItem[];
}

function SortingGame({ colors, onComplete }: any) {
  const { playSound, playCorrectAnswer, playStarEarned, playCelebration } = useSound();
  const { t } = useLanguage();

  const rounds: SortRound[] = [
    {
      bins: [
        { key: 'fruit', label: 'Fruits', icon: '🍎', color: '#FF6B6B' },
        { key: 'animal', label: 'Animals', icon: '🐶', color: '#4ECDC4' },
      ],
      items: [
        { emoji: '🍎', category: 'fruit' },
        { emoji: '🍌', category: 'fruit' },
        { emoji: '🍊', category: 'fruit' },
        { emoji: '🐶', category: 'animal' },
        { emoji: '🐱', category: 'animal' },
        { emoji: '🐘', category: 'animal' },
      ],
    },
    {
      bins: [
        { key: 'vehicle', label: 'Vehicles', icon: '🚗', color: '#06D6A0' },
        { key: 'food', label: 'Food', icon: '🍕', color: '#FFD166' },
      ],
      items: [
        { emoji: '🚗', category: 'vehicle' },
        { emoji: '🚌', category: 'vehicle' },
        { emoji: '✈️', category: 'vehicle' },
        { emoji: '🍕', category: 'food' },
        { emoji: '🍔', category: 'food' },
        { emoji: '🍟', category: 'food' },
      ],
    },
    {
      bins: [
        { key: 'big', label: 'Big', icon: '🐘', color: '#FF6B6B' },
        { key: 'small', label: 'Small', icon: '🐜', color: '#4ECDC4' },
      ],
      items: [
        { emoji: '🐘', category: 'big' },
        { emoji: '🦒', category: 'big' },
        { emoji: '🐋', category: 'big' },
        { emoji: '🐜', category: 'small' },
        { emoji: '🐭', category: 'small' },
        { emoji: '🐝', category: 'small' },
      ],
    },
  ];

  const [roundIndex, setRoundIndex] = useState(0);
  const [tray, setTray] = useState<SortItem[]>([]);
  const [binCounts, setBinCounts] = useState<{ [key: string]: number }>({});
  const [score, setScore] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const [binRowLayout, setBinRowLayout] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [trayLayout, setTrayLayout] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [binLocals, setBinLocals] = useState<{ [key: string]: Rect }>({});
  const [itemLocals, setItemLocals] = useState<{ [emoji: string]: Rect }>({});
  const pans = useRef<{ [emoji: string]: Animated.ValueXY }>({});
  const binShake = useRef<{ [key: string]: Animated.Value }>({}).current;

  const round = rounds[roundIndex];

  const setupRound = () => {
    const items = shuffleArray(round.items);
    setTray(items);
    const counts: { [key: string]: number } = {};
    round.bins.forEach((b) => {
      counts[b.key] = 0;
      binShake[b.key] = new Animated.Value(0);
    });
    setBinCounts(counts);
    pans.current = {};
    items.forEach((item) => {
      pans.current[item.emoji] = new Animated.ValueXY({ x: 0, y: 0 });
    });
    setItemLocals({});
  };

  useEffect(() => {
    setupRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  const shakeBin = (key: string) => {
    const anim = binShake[key];
    if (!anim) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const finishRound = (newScore: number) => {
    setTimeout(async () => {
      if (roundIndex + 1 >= rounds.length) {
        await playCelebration();
        setShowReward(true);
        setTimeout(() => onComplete(newScore), 2000);
      } else {
        setRoundIndex(roundIndex + 1);
      }
    }, 900);
  };

  const handleDrop = async (item: SortItem, dx: number, dy: number) => {
    const itemLocal = itemLocals[item.emoji];
    if (!itemLocal) return;

    const centerX = trayLayout.x + itemLocal.x + itemLocal.width / 2 + dx;
    const centerY = trayLayout.y + itemLocal.y + itemLocal.height / 2 + dy;

    const hitBin = round.bins.find((bin) => {
      const r = binLocals[bin.key];
      if (!r) return false;
      const bx = binRowLayout.x + r.x;
      const by = binRowLayout.y + r.y;
      return centerX >= bx && centerX <= bx + r.width && centerY >= by && centerY <= by + r.height;
    });

    if (!hitBin) {
      Animated.spring(pans.current[item.emoji], { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      return;
    }

    if (hitBin.key === item.category) {
      await playCorrectAnswer();
      const newScore = score + 10;
      setScore(newScore);
      await playStarEarned();
      setBinCounts((prev) => ({ ...prev, [hitBin.key]: (prev[hitBin.key] ?? 0) + 1 }));
      const newTray = tray.filter((t) => t.emoji !== item.emoji || t.category !== item.category);
      setTray(newTray);

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      if (newTray.length === 0) finishRound(newScore);
    } else {
      Animated.spring(pans.current[item.emoji], { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      shakeBin(hitBin.key);
      await playSound('error', true);
    }
  };

  const createResponder = (item: SortItem) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        pans.current[item.emoji]?.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        handleDrop(item, gesture.dx, gesture.dy);
      },
      onPanResponderTerminate: () => {
        Animated.spring(pans.current[item.emoji], { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    });

  // Safe layout helpers
  const handleBinRowLayout = (event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setBinRowLayout(nativeEvent.layout);
    }
  };

  const handleBinLayout = (key: string, event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setBinLocals((prev) => ({ ...prev, [key]: nativeEvent.layout }));
    }
  };

  const handleTrayLayout = (event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setTrayLayout(nativeEvent.layout);
    }
  };

  const handleItemLayout = (emoji: string, event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout && mounted.current) {
      setItemLocals((prev) => ({ ...prev, [emoji]: nativeEvent.layout }));
    }
  };

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameQuestion, { color: colors.text }]}>
        {t('thinkingGames.sorting.question') || 'Drag each item into the correct group!'}
      </Text>

      <View onLayout={handleBinRowLayout} style={styles.binRow}>
        {round.bins.map((bin) => {
          const shake = binShake[bin.key] ?? new Animated.Value(0);
          return (
            <Animated.View
              key={bin.key}
              onLayout={(e) => handleBinLayout(bin.key, e)}
              style={[
                styles.binCard,
                {
                  backgroundColor: bin.color + '20',
                  borderColor: bin.color,
                  transform: [
                    { translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] }) },
                  ],
                },
              ]}
            >
              <Text style={styles.binIcon}>{bin.icon}</Text>
              <Text style={[styles.binLabel, { color: colors.text }]}>{bin.label}</Text>
              <View style={[styles.binCountBadge, { backgroundColor: bin.color }]}>
                <Text style={styles.binCountText}>{binCounts[bin.key] ?? 0}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <Text style={[styles.trayLabel, { color: colors.textLight }]}>
        {t('thinkingGames.sorting.trayHint') || 'Items to sort:'}
      </Text>

      <View onLayout={handleTrayLayout} style={styles.sortTray}>
        {tray.map((item) => {
          const pan = pans.current[item.emoji] ?? new Animated.ValueXY();
          const responder = createResponder(item);
          return (
            <Animated.View
              key={item.emoji}
              {...responder.panHandlers}
              onLayout={(e) => handleItemLayout(item.emoji, e)}
              style={{ transform: pan.getTranslateTransform(), zIndex: 2 }}
            >
              <View style={[styles.sortItem, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
                <Text style={styles.sortItemEmoji}>{item.emoji}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🎉</Text>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>
                {t('thinkingGames.reward.sorting.title') || 'Great Sorting!'}
              </Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>
                {t('thinkingGames.reward.sorting.message') || 'You sorted everything correctly!'}
              </Text>
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

// ─────────────────────────────────────────────────────────────
// ANALOGY GAME — flip face-down cards to reveal the answer
// ─────────────────────────────────────────────────────────────
function AnalogyGame({ colors, onComplete }: any) {
  const { playSound, playCorrectAnswer, playStarEarned, playCelebration } = useSound();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState<{ [opt: string]: 'correct' | 'wrong' }>({});
  const [status, setStatus] = useState<'playing' | 'correct'>('playing');
  const [showReward, setShowReward] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const flipAnims = useRef<{ [opt: string]: Animated.Value }>({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const questions = [
    { a: '🐶', b: '🐾', c: '🐦', correct: '🪶', options: ['🪶', '🐟', '🚗'] },
    { a: '🐔', b: '🥚', c: '🐄', correct: '🥛', options: ['🥛', '🍕', '🚗'] },
    { a: '🕷️', b: '🕸️', c: '🐝', correct: '🍯', options: ['🍯', '🍕', '🚗'] },
    { a: '🐟', b: '🌊', c: '🐦', correct: '☁️', options: ['☁️', '🚗', '🍕'] },
    { a: '✋', b: '🧤', c: '🦶', correct: '🧦', options: ['🧦', '🎩', '🚗'] },
  ];

  const currentQuestion = questions[currentIndex];
  const shuffledOptions = React.useMemo(() => shuffleArray(currentQuestion.options), [currentIndex]);

  useEffect(() => {
    setRevealed({});
    setStatus('playing');
    flipAnims.current = {};
    currentQuestion.options.forEach((opt) => {
      flipAnims.current[opt] = new Animated.Value(1); // 1 = face down (full width)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const flipCard = (opt: string, onMid: () => void) => {
    const anim = flipAnims.current[opt];
    if (!anim) return;
    Animated.timing(anim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      onMid();
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }).start();
    });
  };

  const handleFlip = async (opt: string) => {
    if (status !== 'playing' || revealed[opt]) return;

    if (opt === currentQuestion.correct) {
      flipCard(opt, () => setRevealed((prev) => ({ ...prev, [opt]: 'correct' })));
      setStatus('correct');
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
          playCelebration();
          setShowReward(true);
          setTimeout(() => onComplete(newScore), 2000);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, 1300);
    } else {
      flipCard(opt, () => setRevealed((prev) => ({ ...prev, [opt]: 'wrong' })));
      await playSound('error', true);
    }
  };

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameQuestion, { color: colors.text }]}>
        {t('thinkingGames.analogy.question') || 'Which one completes the pattern?'}
      </Text>

      <View style={[styles.analogyPromptRow, { backgroundColor: colors.surface }]}>
        <Text style={styles.analogyEmoji}>{currentQuestion.a}</Text>
        <MaterialIcons name="arrow-forward" size={22} color={colors.primary} />
        <Text style={styles.analogyEmoji}>{currentQuestion.b}</Text>
        <Text style={[styles.analogyColon, { color: colors.textLight }]}>::</Text>
        <Text style={styles.analogyEmoji}>{currentQuestion.c}</Text>
        <MaterialIcons name="arrow-forward" size={22} color={colors.primary} />
        <View style={[styles.analogyBlank, { borderColor: colors.primaryLight }]}>
          <Text style={[styles.analogyBlankText, { color: colors.textLight }]}>?</Text>
        </View>
      </View>

      <Text style={[styles.trayLabel, { color: colors.textLight }]}>
        {t('thinkingGames.analogy.tapHint') || 'Tap a card to flip it over:'}
      </Text>

      <View style={styles.flipRow}>
        {shuffledOptions.map((opt) => {
          const anim = flipAnims.current[opt] ?? new Animated.Value(1);
          const result = revealed[opt];
          const borderColor =
            result === 'correct' ? colors.success : result === 'wrong' ? colors.error : colors.primaryLight;
          return (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.8}
              disabled={!!result || status !== 'playing'}
              onPress={() => handleFlip(opt)}
            >
              <Animated.View
                style={[
                  styles.flipCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor,
                    borderWidth: result ? 4 : 3,
                    transform: [{ scaleX: anim }],
                  },
                ]}
              >
                {result ? (
                  <>
                    <Text style={styles.flipCardEmoji}>{opt}</Text>
                    {result === 'correct' && (
                      <View style={styles.correctBadge}>
                        <MaterialIcons name="check-circle" size={20} color={colors.success} />
                      </View>
                    )}
                    {result === 'wrong' && (
                      <View style={styles.correctBadge}>
                        <MaterialIcons name="cancel" size={20} color={colors.error} />
                      </View>
                    )}
                  </>
                ) : (
                  <MaterialIcons name="help-outline" size={34} color={colors.primaryLight} />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>🎉</Text>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>
                {t('thinkingGames.reward.analogy.title') || 'Analogy Ace!'}
              </Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>
                {t('thinkingGames.reward.analogy.message') || 'You figured out every pattern!'}
              </Text>
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

// ─────────────────────────────────────────────────────────────
// Main Thinking Games Hub
// ─────────────────────────────────────────────────────────────
export default function ThinkingGames() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { playSound, toggleSound, isEnabled, playCelebration } = useSound();
  const [selectedGame, setSelectedGame] = useState<ThinkingGame | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // ─── Sinhala voice state ──────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  const sinhalaAudioMap = {
    instruction: require('../../assets/sounds/sinhala/games/thinkingGamesinstruction.mp3'),
  };

  // Load Sinhala instruction audio
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
      Object.values(sinhalaSounds.current).forEach((sound) => {
        if (sound) sound.unloadAsync();
      });
    };
  }, []);

  // Speak function (external audio for Sinhala, TTS for English)
  const speak = async (text: string, audioKey?: string) => {
    if (!isEnabled) return;
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

  const instructionText =
    language === 'si'
      ? 'මෙම තිරයේ විවිධ චින්තන ක්‍රීඩා ඇත. සමහරක් තට්ටු කිරීමෙන්ද, සමහරක් අදින්නෙන්ද, තවත් සමහරක් කාඩ්පත් පෙරළීමෙන්ද ක්‍රීඩා කරයි. ඔබට කැමති ක්‍රීඩාවක් තෝරාගෙන එහි උපදෙස් අනුගමනය කරන්න.'
      : 'Here are different thinking games. Some are played by tapping, some by dragging, and some by flipping cards. Choose a game you like and follow its instructions.';

  // Speak instruction when the main screen opens
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (language === 'si' && !soundsLoaded) {
        pendingInstruction.current = true;
        return;
      }
      speak(instructionText, 'instruction');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Pending instruction effect
  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      speak(instructionText, 'instruction');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundsLoaded]);

  const handleGameComplete = async (score: number) => {
    setGameScore(score);
    setShowGameComplete(true);
    await playCelebration();
    setTimeout(() => {
      if (mounted.current) {
        setShowGameComplete(false);
        setSelectedGame(null);
      }
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
      case 'SortingGame':
        return <SortingGame colors={colors} onComplete={handleGameComplete} />;
      case 'AnalogyGame':
        return <AnalogyGame colors={colors} onComplete={handleGameComplete} />;
      default:
        return (
          <View style={styles.comingSoonContainer}>
            <MaterialIcons name="build" size={60} color={colors.primaryLight} />
            <Text style={[styles.comingSoonText, { color: colors.text }]}>{t('thinkingGames.comingSoon')}</Text>
            <Text style={[styles.comingSoonSubtext, { color: colors.textLight }]}>
              {t('thinkingGames.comingSoonMessage')}
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
            {t(selectedGame.titleKey)}
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
                <Text style={[styles.completeTitle, { color: colors.text }]}>{t('thinkingGames.complete.title')}</Text>
                <Text style={[styles.completeMessage, { color: colors.textLight }]}>
                  {t('thinkingGames.complete.message')}
                </Text>
                <Text style={[styles.completeScore, { color: colors.primary }]}>
                  {t('score')}: {gameScore}
                </Text>
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
          {t('thinkingGames.mainTitle')}
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
          {t('thinkingGames.brainBanner')}
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
              {t(game.titleKey)}
            </Text>
            <Text style={[styles.gameDescription, { color: colors.textLight }]}>
              {t(game.descKey)}
            </Text>
            <View style={[styles.playBadge, { backgroundColor: game.color }]}>
              <MaterialIcons name="play-arrow" size={16} color="#FFF" />
              <Text style={styles.playBadgeText}>{t('thinkingGames.playNow')}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tip Section */}
      <View style={[styles.tipContainer, { backgroundColor: colors.primaryLight + '20', margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg }]}>
        <MaterialIcons name="lightbulb" size={24} color="#FFD700" />
        <Text style={[styles.tipText, { color: colors.textLight, flex: 1, marginLeft: Spacing.sm }]}>
          {t('thinkingGames.tip')}
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
  gameQuestion: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: Spacing.lg },
  scatterField: { position: 'relative', marginBottom: Spacing.md },
  itemsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  itemCard: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemEmoji: { fontSize: 44 },
  correctBadge: { position: 'absolute', top: -10, right: -10 },
  sequenceContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  sequenceItem: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  missingItem: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  sequenceEmoji: { fontSize: 40 },
  trayLabel: { fontSize: Typography.fontSize.sm, textAlign: 'center', marginBottom: Spacing.sm, fontWeight: '600' },
  optionsContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, marginTop: Spacing.sm, flexWrap: 'wrap' },
  sequenceOption: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sequenceOptionGhost: { width: 80, height: 80 },
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
  // Sorting game
  binRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  binCard: {
    width: (width - Spacing.md * 2 - Spacing.lg) / 2,
    minHeight: 110,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  binIcon: { fontSize: 34 },
  binLabel: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  binCountBadge: {
    marginTop: Spacing.xs,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  binCountText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  sortTray: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  sortItem: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortItemEmoji: { fontSize: 32 },
  // Analogy game
  analogyPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  analogyEmoji: { fontSize: 36 },
  analogyColon: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 2 },
  analogyBlank: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analogyBlankText: { fontSize: 26, fontWeight: 'bold' },
  flipRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, flexWrap: 'wrap' },
  flipCard: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  flipCardEmoji: { fontSize: 40 },
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