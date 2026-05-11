// app/(games)/ColorSortingGame.tsx (with Sounds, Haptics & Full i18n)
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';

const { width } = Dimensions.get('window');
const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const ITEM_SIZE = width * 0.17;

// ─── Level config (now using translation keys) ─────────────────────────────────
const LEVELS = [
  {
    level: 1,
    nameKey: 'game.colorSorting.level1.name',
    colors: ['#FF3B30', '#34C759', '#007AFF'],
    colorNameKeys: ['color.red', 'color.green', 'color.blue'],
    timeLimit: 60,
    descKey: 'game.colorSorting.level1.desc',
  },
  {
    level: 2,
    nameKey: 'game.colorSorting.level2.name',
    colors: ['#FF9500', '#FF2D55', '#FFCC00'],
    colorNameKeys: ['color.orange', 'color.pink', 'color.yellow'],
    timeLimit: 65,
    descKey: 'game.colorSorting.level2.desc',
  },
  {
    level: 3,
    nameKey: 'game.colorSorting.level3.name',
    colors: ['#5AC8FA', '#5856D6', '#34C759'],
    colorNameKeys: ['color.sky', 'color.purple', 'color.green'],
    timeLimit: 65,
    descKey: 'game.colorSorting.level3.desc',
  },
  {
    level: 4,
    nameKey: 'game.colorSorting.level4.name',
    colors: ['#FFB6C1', '#ADD8E6', '#90EE90', '#FFD700'],
    colorNameKeys: ['color.pink', 'color.blue', 'color.mint', 'color.gold'],
    timeLimit: 75,
    descKey: 'game.colorSorting.level4.desc',
  },
  {
    level: 5,
    nameKey: 'game.colorSorting.level5.name',
    colors: ['#FF1493', '#00DDAA', '#FF4500', '#00BFFF', '#AAEE00'],
    colorNameKeys: ['color.deepPink', 'color.aqua', 'color.redOrange', 'color.cerulean', 'color.lime'],
    timeLimit: 90,
    descKey: 'game.colorSorting.level5.desc',
  },
  {
    level: 6,
    nameKey: 'game.colorSorting.level6.name',
    colors: ['#8B4513', '#556B2F', '#CD853F', '#6B8E23', '#A0522D'],
    colorNameKeys: ['color.brown', 'color.olive', 'color.tan', 'color.fern', 'color.sienna'],
    timeLimit: 90,
    descKey: 'game.colorSorting.level6.desc',
  },
  {
    level: 7,
    nameKey: 'game.colorSorting.level7.name',
    colors: ['#FF0000', '#FF7F00', '#DDDD00', '#00CC00', '#0000FF', '#8B00FF'],
    colorNameKeys: ['color.red', 'color.orange', 'color.yellow', 'color.green', 'color.blue', 'color.violet'],
    timeLimit: 105,
    descKey: 'game.colorSorting.level7.desc',
  },
  {
    level: 8,
    nameKey: 'game.colorSorting.level8.name',
    colors: ['#DC143C', '#1E90FF', '#228B22', '#9400D3', '#FF8C00'],
    colorNameKeys: ['color.ruby', 'color.sapphire', 'color.emerald', 'color.amethyst', 'color.topaz'],
    timeLimit: 90,
    descKey: 'game.colorSorting.level8.desc',
  },
  {
    level: 9,
    nameKey: 'game.colorSorting.level9.name',
    colors: ['#FF69B4', '#00CED1', '#FF6347', '#32CD32', '#9370DB', '#FFD700', '#1E90FF'],
    colorNameKeys: ['color.hotPink', 'color.turquoise', 'color.tomato', 'color.lime', 'color.violet', 'color.gold', 'color.dodger'],
    timeLimit: 120,
    descKey: 'game.colorSorting.level9.desc',
  },
  {
    level: 10,
    nameKey: 'game.colorSorting.level10.name',
    colors: [
      '#DC143C', '#00CC88', '#1E90FF', '#FF8C00', '#9932CC',
      '#2E8B57', '#DA70D6', '#CD5C5C', '#48D1CC', '#FF6B35',
    ],
    colorNameKeys: [
      'color.crimson', 'color.spring', 'color.dodger', 'color.dOrange', 'color.dOrchid',
      'color.seaGreen', 'color.orchid', 'color.indian', 'color.turquoise', 'color.tangerine',
    ],
    timeLimit: 150,
    descKey: 'game.colorSorting.level10.desc',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface GameItem {
  id: string;
  color: string;
  colorNameKey: string;
  matched: boolean;
  dragXY: Animated.ValueXY;
  homeXY: Animated.ValueXY;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

interface BinLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BinMap {
  [color: string]: GameItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

function pointInRect(px: number, py: number, rect: BinLayout): boolean {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}

// ─── DraggableItem ────────────────────────────────────────────────────────────
interface DraggableItemProps {
  item: GameItem;
  onDragStart: (item: GameItem) => void;
  onDragMove: (item: GameItem, px: number, py: number) => void;
  onDragEnd: (item: GameItem, px: number, py: number) => void;
  isDragging: boolean;
  isDisabled: boolean;
  t: (key: string) => string;
}

function DraggableItem({
  item,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
  isDisabled,
  t,
}: DraggableItemProps) {
  const viewRef = useRef<View>(null);
  const homeAbsolute = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isDisabled && !item.matched,
      onMoveShouldSetPanResponder: () => !isDisabled && !item.matched,

      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        dragStart.current = { x: pageX, y: pageY };
        item.dragXY.setValue({
          x: homeAbsolute.current.x,
          y: homeAbsolute.current.y,
        });
        onDragStart(item);
        Animated.spring(item.scale, {
          toValue: 1.25,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        item.dragXY.setValue({
          x: homeAbsolute.current.x + (pageX - dragStart.current.x),
          y: homeAbsolute.current.y + (pageY - dragStart.current.y),
        });
        onDragMove(item, pageX, pageY);
      },

      onPanResponderRelease: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        Animated.spring(item.scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }).start();
        onDragEnd(item, pageX, pageY);
      },

      onPanResponderTerminate: (evt) => {
        Animated.spring(item.scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }).start();
        onDragEnd(item, evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      },
    })
  ).current;

  const spin = item.rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  if (item.matched) {
    return (
      <Animated.View
        style={[
          styles.item,
          {
            backgroundColor: item.color,
            opacity: item.opacity,
            transform: [
              { scale: item.scale },
              { rotate: spin },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.itemInnerDot} />
      </Animated.View>
    );
  }

  return (
    <View
      ref={viewRef}
      onLayout={() => {
        viewRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
          homeAbsolute.current = { x: pageX, y: pageY };
        });
      }}
      style={styles.itemWrapper}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.item,
          { backgroundColor: item.color },
          isDragging && styles.itemDragging,
          {
            opacity: isDragging ? 0.35 : item.opacity,
            transform: [{ scale: isDragging ? 1 : item.scale }],
          },
        ]}
      >
        <View style={styles.itemInnerDot} />
        {isDragging && (
          <View style={[styles.itemRing, { borderColor: item.color + 'BB' }]} />
        )}
      </Animated.View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ColorSortingGame() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { 
    playSound, 
    playCelebration, 
    playStarEarned, 
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled 
  } = useSound();

  const [levelIdx, setLevelIdx] = useState(0);
  const [items, setItems] = useState<GameItem[]>([]);
  const [bins, setBins] = useState<BinMap>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].timeLimit);
  const [status, setStatus] = useState<'playing' | 'completed' | 'failed'>('playing');

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredBin, setHoveredBin] = useState<string | null>(null);

  const ghostXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ghostScale = useRef(new Animated.Value(1)).current;
  const ghostColor = useRef('#000');
  const [ghostVisible, setGhostVisible] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerBarAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;
  const wrongFlashAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const binLayouts = useRef<{ [color: string]: BinLayout }>({});
  const binRefs = useRef<{ [color: string]: View | null }>({});

  const level = LEVELS[levelIdx];
  const totalItems = level.colors.length * 3;
  const isLast = levelIdx === LEVELS.length - 1;

  const scoreRef = useRef(0);
  scoreRef.current = score;

  // ── Init level ──────────────────────────────────────────────────────────────
  const initLevel = useCallback(async (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const lvl = LEVELS[idx];
    const newItems: GameItem[] = [];

    lvl.colors.forEach((color, ci) => {
      for (let k = 0; k < 3; k++) {
        newItems.push({
          id: `${color}-${ci}-${k}`,
          color,
          colorNameKey: lvl.colorNameKeys[ci],
          matched: false,
          dragXY: new Animated.ValueXY({ x: 0, y: 0 }),
          homeXY: new Animated.ValueXY({ x: 0, y: 0 }),
          scale: new Animated.Value(1),
          opacity: new Animated.Value(1),
          rotation: new Animated.Value(0),
        });
      }
    });

    const newBins: BinMap = {};
    lvl.colors.forEach(c => { newBins[c] = []; });

    binLayouts.current = {};
    setItems(shuffle(newItems));
    setBins(newBins);
    setScore(0);
    setDraggingId(null);
    setHoveredBin(null);
    setGhostVisible(false);
    setTimeLeft(lvl.timeLimit);
    setStatus('playing');
    setLevelIdx(idx);

    overlayOpacity.setValue(0);
    overlayScale.setValue(0.8);
    wrongFlashAnim.setValue(0);
    timerBarAnim.setValue(1);
    progressAnim.setValue(0);
    
    await playSound('click', false);
  }, [overlayOpacity, overlayScale, wrongFlashAnim, timerBarAnim, progressAnim, playSound]);

  useEffect(() => { initLevel(0); }, []);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing') return;

    Animated.timing(timerBarAnim, {
      toValue: 0,
      duration: timeLeft * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatus('failed');
          playSound('error', true);
          showOverlay();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, levelIdx, playSound]);

  // ── Back handler ────────────────────────────────────────────────────────────
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (status === 'playing') {
        Alert.alert(t('game.exitGame'), t('game.exitConfirm'), [
          { text: t('game.cancel'), style: 'cancel' },
          { text: t('game.exit'), style: 'destructive', onPress: () => router.back() },
        ]);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [status, t]);

  // ── Shared animations ────────────────────────────────────────────────────────
  const showOverlay = () => {
    Animated.parallel([
      Animated.spring(overlayOpacity, { toValue: 1, useNativeDriver: true }),
      Animated.spring(overlayScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
    ]).start();
  };

  const animateMatch = (item: GameItem, cb?: () => void) => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(item.scale, { toValue: 1.4, friction: 3, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(item.scale, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(item.opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(item.rotation, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
    ]).start(() => cb?.());
  };

  const animateWrong = () => {
    playSound('error', true);
    Animated.sequence([
      Animated.timing(wrongFlashAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
      Animated.timing(wrongFlashAnim, { toValue: 0, duration: 320, useNativeDriver: false }),
    ]).start();
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 9, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const animateProgress = (newScore: number, total: number) => {
    Animated.spring(progressAnim, {
      toValue: newScore / total,
      friction: 5,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  // ── Drag callbacks ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback(async (item: GameItem) => {
    if (status !== 'playing') return;
    ghostColor.current = item.color;
    ghostXY.setValue({ x: 0, y: 0 });
    ghostScale.setValue(1.25);
    setGhostVisible(true);
    setDraggingId(item.id);
    await playSound('click', false);
  }, [status, ghostXY, ghostScale, playSound]);

  const handleDragMove = useCallback((item: GameItem, pageX: number, pageY: number) => {
    if (status !== 'playing') return;
    ghostXY.setValue({
      x: pageX - ITEM_SIZE / 2,
      y: pageY - ITEM_SIZE / 2,
    });

    let found: string | null = null;
    for (const [color, rect] of Object.entries(binLayouts.current)) {
      if (pointInRect(pageX, pageY, rect)) {
        found = color;
        break;
      }
    }
    setHoveredBin(found);
  }, [status, ghostXY]);

  const handleDragEnd = useCallback(async (item: GameItem, pageX: number, pageY: number) => {
    if (status !== 'playing') {
      setGhostVisible(false);
      setDraggingId(null);
      setHoveredBin(null);
      return;
    }

    setGhostVisible(false);
    setHoveredBin(null);

    let droppedColor: string | null = null;
    for (const [color, rect] of Object.entries(binLayouts.current)) {
      if (pointInRect(pageX, pageY, rect)) {
        droppedColor = color;
        break;
      }
    }

    if (droppedColor && droppedColor === item.color) {
      await playCorrectAnswer();
      await playStarEarned();
      
      const newScore = scoreRef.current + 1;
      animateMatch(item, () => {
        setItems(prev =>
          prev.map(it => it.id === item.id ? { ...it, matched: true } : it)
        );
      });
      setScore(newScore);
      animateProgress(newScore, level.colors.length * 3);
      setBins(prev => ({
        ...prev,
        [droppedColor!]: [...prev[droppedColor!], item],
      }));

      if (newScore >= level.colors.length * 3) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('completed');
        await playCelebration();
        setTimeout(showOverlay, 500);
      }
    } else if (droppedColor) {
      animateWrong();
      Animated.sequence([
        Animated.spring(item.scale, { toValue: 1.15, friction: 4, useNativeDriver: true }),
        Animated.spring(item.scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }

    setDraggingId(null);
  }, [status, level, playCorrectAnswer, playStarEarned, playCelebration]);

  // ── Bin layout measurement ──────────────────────────────────────────────────
  const measureBin = (color: string) => {
    const ref = binRefs.current[color];
    if (!ref) return;
    ref.measure((_x, _y, w, h, pageX, pageY) => {
      binLayouts.current[color] = { x: pageX, y: pageY, width: w, height: h };
    });
  };

  // ── Interpolations ──────────────────────────────────────────────────────────
  const timerBarWidth = timerBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const timerBarColor = timerBarAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: ['#FF3B30', '#FF9500', '#FFCC00', '#34C759'],
  });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const wrongBg = wrongFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,59,48,0)', 'rgba(255,59,48,0.22)'],
  });

  // ── Render bin ──────────────────────────────────────────────────────────────
  const renderBin = (color: string, colorNameKey: string) => {
    const binItems = bins[color] || [];
    const isFull = binItems.length >= 3;
    const isHovered = hoveredBin === color;
    const draggingItem = draggingId ? items.find(i => i.id === draggingId) : null;
    const isCorrectTarget = draggingItem?.color === color;

    return (
      <View
        key={color}
        ref={ref => { binRefs.current[color] = ref; }}
        onLayout={() => measureBin(color)}
        style={[
          styles.bin,
          {
            borderColor: isFull ? '#34C759' : color,
            backgroundColor: isHovered && isCorrectTarget
              ? color + '44'
              : color + '18',
          },
          isFull && styles.binFull,
          isHovered && isCorrectTarget && styles.binHoverCorrect,
          isHovered && !isCorrectTarget && styles.binHoverWrong,
        ]}
      >
        <View
          style={[
            styles.binHeader,
            { backgroundColor: isFull ? '#34C759' : isHovered && isCorrectTarget ? color + 'EE' : color },
          ]}
        >
          <Text style={styles.binHeaderText} numberOfLines={1}>
            {isFull ? '✓ ' : ''}{t(colorNameKey)}
          </Text>
        </View>
        <View style={styles.binBody}>
          {binItems.map((it, idx) => (
            <View key={it.id + idx} style={[styles.binDot, { backgroundColor: it.color }]} />
          ))}
        </View>
        <Text style={[styles.binCount, { color: isFull ? '#34C759' : color }]}>
          {binItems.length}/3
        </Text>
      </View>
    );
  };

  // ── Overlay ─────────────────────────────────────────────────────────────────
  const renderOverlay = () => {
    if (status === 'playing') return null;
    const won = status === 'completed';
    const total = level.colors.length * 3;

    return (
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Animated.View
          style={[
            styles.overlayCard,
            { backgroundColor: colors.surface },
            { transform: [{ scale: overlayScale }] },
          ]}
        >
          <Text style={styles.overlayEmoji}>{won ? '🎉' : '⏰'}</Text>
          <Text style={[styles.overlayTitle, { color: colors.text }]}>
            {won ? t('game.levelComplete') : t('game.timesUp')}
          </Text>
          <Text style={[styles.overlaySubtitle, { color: colors.textLight }]}>
            {won
              ? t('game.colorSorting.completeMessage', { total, levelName: t(level.nameKey) })
              : t('game.colorSorting.failedMessage', { score, total })}
          </Text>

          {won && !isLast && (
            <TouchableOpacity
              style={[styles.overlayBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                await playSound('click', false);
                initLevel(levelIdx + 1);
              }}
            >
              <Text style={styles.overlayBtnText}>{t('game.nextLevel')} →</Text>
            </TouchableOpacity>
          )}
          {won && isLast && (
            <TouchableOpacity
              style={[styles.overlayBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                await playSound('click', false);
                initLevel(0);
              }}
            >
              <Text style={styles.overlayBtnText}>{t('game.playAgain')} 🎊</Text>
            </TouchableOpacity>
          )}
          {!won && (
            <TouchableOpacity
              style={[styles.overlayBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                await playSound('click', false);
                initLevel(levelIdx);
              }}
            >
              <Text style={styles.overlayBtnText}>{t('game.tryAgain')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.overlayBtnSecondary, { borderColor: colors.textLight }]}
            onPress={async () => {
              await playSound('goodbye', false);
              router.back();
            }}
          >
            <Text style={[styles.overlayBtnSecondaryText, { color: colors.textLight }]}>
              {t('game.backToGames')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  const draggingItem = draggingId ? items.find(i => i.id === draggingId) : null;

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Wrong-match red flash */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: wrongBg, zIndex: 5 }]}
      />

      <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={async () => {
              await playSound('click', false);
              router.back();
            }} 
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          {/* Sound Toggle Button */}
          <TouchableOpacity 
            style={styles.soundBtn}
            onPress={async () => {
              await playSound('click', false);
              toggleSound();
            }}
          >
            <MaterialIcons 
              name={soundEnabled ? "volume-up" : "volume-off"} 
              size={22} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          <View style={styles.levelInfo}>
            <Text style={[styles.levelLabel, { color: colors.textLight }]}>
              {t('game.level')} {level.level} / {LEVELS.length}
            </Text>
            <Text style={[styles.levelName, { color: colors.primary }]}>{t(level.nameKey)}</Text>
          </View>
          <View style={styles.scoreBox}>
            <MaterialIcons name="star" size={18} color="#FFCC00" />
            <Text style={[styles.scoreText, { color: colors.text }]}>
              {score}/{totalItems}
            </Text>
          </View>
        </View>

        {/* Timer bar */}
        <View style={[styles.timerBarTrack, { backgroundColor: colors.surface }]}>
          <Animated.View
            style={[styles.timerBarFill, { width: timerBarWidth, backgroundColor: timerBarColor }]}
          />
        </View>

        {/* Time + Progress */}
        <View style={styles.statsRow}>
          <View style={styles.timerBadge}>
            <MaterialIcons name="timer" size={16} color={timeLeft < 10 ? '#FF3B30' : colors.text} />
            <Text style={[styles.timerText, { color: timeLeft < 10 ? '#FF3B30' : colors.text }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth, backgroundColor: '#34C759' }]}
            />
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.desc, { color: colors.textLight }]}>{t(level.descKey)}</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!draggingId}
        >
          {/* Items */}
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
            {draggingId
              ? t('game.colorSorting.dropHint')
              : t('game.colorSorting.dragHint', { remaining: totalItems - score })}
          </Text>
          <View style={styles.itemsGrid}>
            {items.map(item => (
              <DraggableItem
                key={item.id}
                item={item}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                isDragging={draggingId === item.id}
                isDisabled={status !== 'playing'}
                t={t}
              />
            ))}
          </View>

          {/* Bins */}
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t('game.colorSorting.sortingBins')}</Text>
          <View style={styles.binsGrid}>
            {level.colors.map((c, i) => renderBin(c, level.colorNameKeys[i]))}
          </View>
        </ScrollView>

        {/* Instruction pill */}
        <View style={[styles.instructionPill, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="info-outline" size={14} color={colors.primary} />
          <Text style={[styles.instructionText, { color: colors.textLight }]}>
            {t('game.colorSorting.instruction')}
          </Text>
        </View>
      </Animated.View>

      {/* Floating drag ghost */}
      {ghostVisible && draggingItem && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ghost,
            {
              backgroundColor: draggingItem.color,
              transform: [
                ...ghostXY.getTranslateTransform(),
                { scale: ghostScale },
              ],
              shadowColor: draggingItem.color,
              zIndex: 100,
            },
          ]}
        >
          <View style={styles.itemInnerDot} />
        </Animated.View>
      )}

      {renderOverlay()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.xl + 8 : Spacing.xl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.sm, borderRadius: 20 },
  soundBtn: { padding: Spacing.sm, borderRadius: 20, marginRight: Spacing.sm },
  levelInfo: { alignItems: 'center', flex: 1 },
  levelLabel: { fontSize: 12, opacity: 0.7 },
  levelName: { fontSize: 17, fontWeight: '700' },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  scoreText: { fontSize: 15, fontWeight: '700' },

  timerBarTrack: { height: 6, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.sm },
  timerBarFill: { height: '100%', borderRadius: 4 },

  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 58 },
  timerText: { fontSize: 17, fontWeight: '700' },
  progressTrack: { flex: 1, height: 6, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  desc: { fontSize: 13, textAlign: 'center', marginBottom: Spacing.md },
  scrollContent: { paddingBottom: Spacing.xl },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    minHeight: 70,
  },

  itemWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },

  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  itemDragging: {
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  itemInnerDot: {
    width: '38%',
    height: '38%',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  itemRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 100,
    borderWidth: 3,
  },

  ghost: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 20,
    top: 0,
    left: 0,
  },

  binsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  bin: {
    width: width * 0.27,
    minHeight: 100,
    borderWidth: 2,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  binFull: { borderWidth: 2.5, borderColor: '#34C759' },
  binHoverCorrect: {
    borderWidth: 2.5,
    transform: [{ scale: 1.05 }],
  },
  binHoverWrong: {
    borderWidth: 2,
    opacity: 0.6,
  },
  binHeader: { width: '100%', paddingVertical: 6, alignItems: 'center', marginBottom: 4 },
  binHeaderText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  binBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    justifyContent: 'center',
    paddingHorizontal: 4,
    minHeight: 48,
    alignContent: 'center',
  },
  binDot: { width: 22, height: 22, borderRadius: 11 },
  binCount: { fontSize: 10, fontWeight: '700', paddingBottom: 5, marginTop: 3 },

  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  instructionText: { fontSize: 12, flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 20,
  },
  overlayCard: {
    width: width * 0.82,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  overlayEmoji: { fontSize: 60, marginBottom: Spacing.md },
  overlayTitle: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.sm, textAlign: 'center' },
  overlaySubtitle: { fontSize: 15, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  overlayBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  overlayBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  overlayBtnSecondary: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  overlayBtnSecondaryText: { fontSize: 15, fontWeight: '600' },
});