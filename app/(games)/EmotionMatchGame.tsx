// app/(games)/EmotionMatchGame.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';
import { updateStats } from '../../services/api';

interface Emotion {
  id: string;
  emoji: string;
  nameKey: string;
  descKey: string;
  color: string;
}

interface Level {
  id: number;
  nameKey: string;
  emotions: Emotion[];
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

const levels: Level[] = [
  {
    id: 1,
    nameKey: 'emotion.level.basic',
    emotions: [
      { id: 'happy', emoji: '😊', nameKey: 'emotion.happy', descKey: 'emotion.desc.happy', color: '#FFD700' },
      { id: 'sad', emoji: '😢', nameKey: 'emotion.sad', descKey: 'emotion.desc.sad', color: '#6B8EFF' },
      { id: 'angry', emoji: '😠', nameKey: 'emotion.angry', descKey: 'emotion.desc.angry', color: '#FF6B6B' },
      { id: 'surprised', emoji: '😲', nameKey: 'emotion.surprised', descKey: 'emotion.desc.surprised', color: '#FFB347' },
    ],
  },
  {
    id: 2,
    nameKey: 'emotion.level.more',
    emotions: [
      { id: 'loved', emoji: '🥰', nameKey: 'emotion.loved', descKey: 'emotion.desc.loved', color: '#FF69B4' },
      { id: 'scared', emoji: '😨', nameKey: 'emotion.scared', descKey: 'emotion.desc.scared', color: '#9370DB' },
      { id: 'tired', emoji: '😴', nameKey: 'emotion.tired', descKey: 'emotion.desc.tired', color: '#A9A9A9' },
      { id: 'excited', emoji: '🤩', nameKey: 'emotion.excited', descKey: 'emotion.desc.excited', color: '#FF4500' },
    ],
  },
  {
    id: 3,
    nameKey: 'emotion.level.advanced',
    emotions: [
      { id: 'calm', emoji: '😌', nameKey: 'emotion.calm', descKey: 'emotion.desc.calm', color: '#90EE90' },
      { id: 'silly', emoji: '😜', nameKey: 'emotion.silly', descKey: 'emotion.desc.silly', color: '#FFA500' },
      { id: 'proud', emoji: '🦸', nameKey: 'emotion.proud', descKey: 'emotion.desc.proud', color: '#FFD700' },
      { id: 'lonely', emoji: '🥺', nameKey: 'emotion.lonely', descKey: 'emotion.desc.lonely', color: '#B0C4DE' },
    ],
  },
];

const copingStrategyKeys: { [key: string]: string } = {
  happy: 'coping.shareHappiness',
  sad: 'coping.cryAndTalk',
  angry: 'coping.deepBreaths',
  surprised: 'coping.embraceSurprise',
  loved: 'coping.youAreLoved',
  scared: 'coping.youAreSafe',
  tired: 'coping.restImportant',
  excited: 'coping.enjoyExcitement',
  calm: 'coping.peacefulMoments',
  silly: 'coping.sillyFun',
  proud: 'coping.celebrateAchievements',
  lonely: 'coping.notAlone',
};

const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/games/emotionMatchinstruction.mp3'),
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function EmotionMatchGame() {
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

  const [currentLevel, setCurrentLevel] = useState(0);
  const [leftEmotions, setLeftEmotions] = useState<Emotion[]>([]);
  const [rightEmotions, setRightEmotions] = useState<Emotion[]>([]);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>([]);
  const [score, setScore] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const [showCopingTip, setShowCopingTip] = useState(false);
  const [copingMessage, setCopingMessage] = useState('');
  const [copingColor, setCopingColor] = useState('#6B8EFF');

  // Drag-a-line state
  const [dragFromId, setDragFromId] = useState<string | null>(null);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ from: Point; to: Point } | null>(null);
  const [leftLayouts, setLeftLayouts] = useState<{ [id: string]: Rect }>({});
  const [rightLayouts, setRightLayouts] = useState<{ [id: string]: Rect }>({});
  const [colLeftLayout, setColLeftLayout] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [colRightLayout, setColRightLayout] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [matchAreaOffset, setMatchAreaOffset] = useState<Point>({ x: 0, y: 0 });

  const scaleAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const shakeAnims = useRef<{ [id: string]: Animated.Value }>({});

  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);
  const matchAreaRef = useRef<View>(null);
  const mounted = useRef(true);

  const level = levels[currentLevel];

  // ─── Sinhala audio load ────────────────────────────────────
  useEffect(() => {
    mounted.current = true;
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
      mounted.current = false;
      Object.values(sinhalaSounds.current).forEach((sound) => {
        if (sound) sound.unloadAsync();
      });
      // Clean up animations
      Object.values(shakeAnims.current).forEach(anim => anim.stopAnimation?.());
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

  const instructionText =
    language === 'si'
      ? 'මෙම ක්‍රීඩාවේදී, වම් පස ඇති සෑම මුහුණකින්ම දකුණු පස ඇති ගැලපෙන හැඟීමට රේඛාවක් ඇද සම්බන්ධ කරන්න. සියල්ල නිවැරදිව ගැලපීමට උත්සාහ කරන්න!'
      : 'In this game, drag a line from each face on the left to the feeling it matches on the right. Try to connect them all correctly!';

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

  useEffect(() => {
    if (pendingInstruction.current && soundsLoaded) {
      pendingInstruction.current = false;
      speak(instructionText, 'instruction');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundsLoaded]);

  // ─── Level setup ────────────────────────────────────────────
  const initializeLevel = () => {
    const left = shuffleArray(level.emotions);
    let right = shuffleArray(level.emotions);
    let attempts = 0;
    while (attempts < 5 && right.every((e, i) => e.id === left[i].id)) {
      right = shuffleArray(level.emotions);
      attempts++;
    }
    setLeftEmotions(left);
    setRightEmotions(right);
    setMatches([]);
    setScore(0);
    setLeftLayouts({});
    setRightLayouts({});
    shakeAnims.current = {};
    level.emotions.forEach((e) => {
      shakeAnims.current[e.id] = new Animated.Value(0);
    });

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  useEffect(() => {
    initializeLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  // ─── Geometry helpers ───────────────────────────────────────
  const leftAnchor = (id: string): Point | null => {
    const r = leftLayouts[id];
    if (!r) return null;
    return { x: colLeftLayout.x + r.x + r.width - 6, y: colLeftLayout.y + r.y + r.height / 2 };
  };

  const rightAnchor = (id: string): Point | null => {
    const r = rightLayouts[id];
    if (!r) return null;
    return { x: colRightLayout.x + r.x + 6, y: colRightLayout.y + r.y + r.height / 2 };
  };

  const pointInRightCard = (id: string, x: number, y: number): boolean => {
    const r = rightLayouts[id];
    if (!r) return false;
    const rx = colRightLayout.x + r.x;
    const ry = colRightLayout.y + r.y;
    return x >= rx && x <= rx + r.width && y >= ry && y <= ry + r.height;
  };

  const relativePoint = (pageX: number, pageY: number): Point => ({
    x: pageX - matchAreaOffset.x,
    y: pageY - matchAreaOffset.y,
  });

  // ─── Gameplay ───────────────────────────────────────────────
  const matchedLeftIds = new Set(matches.map((m) => m.leftId));
  const matchedRightIds = new Set(matches.map((m) => m.rightId));

  const calculateStarsFrom = (finalScore: number) => {
    const correctAnswers = Math.floor(finalScore / 10);
    if (correctAnswers === level.emotions.length) return 3;
    if (correctAnswers >= level.emotions.length - 1) return 2;
    return 1;
  };

  const showCopingStrategy = (emotionId: string, color: string) => {
    const key = copingStrategyKeys[emotionId] || 'coping.default';
    setCopingMessage(t(key));
    setCopingColor(color);
    setShowCopingTip(true);
    setTimeout(() => setShowCopingTip(false), 4000);
  };

  const triggerShake = (id: string) => {
    const anim = shakeAnims.current[id];
    if (!anim) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const finishLevelIfDone = (newMatches: { leftId: string; rightId: string }[], newScore: number) => {
    if (newMatches.length < level.emotions.length) return;

    setTimeout(() => {
      const earnedStars = calculateStarsFrom(newScore);
      setStars(earnedStars);

      const newProgress = Math.min(100, ((currentLevel + 1) / levels.length) * 100);
      console.log('Updating behavioral to:', newProgress);
      updateStats({ behavioral: newProgress })
        .then(() => console.log('Stats updated successfully'))
        .catch((err) => console.error('Failed to update stats:', err));

      if (currentLevel === levels.length - 1) {
        playCelebration();
        setShowComplete(true);
      } else {
        setShowReward(true);
      }
    }, 1200);
  };

  const attemptMatch = async (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      const emotion = level.emotions.find((e) => e.id === leftId)!;
      const newMatches = [...matches, { leftId, rightId }];
      const newScore = score + 10;

      setMatches(newMatches);
      setScore(newScore);

      await playCorrectAnswer();
      showCopingStrategy(leftId, emotion.color);
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 180, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();

      finishLevelIfDone(newMatches, newScore);
    } else {
      const from = leftAnchor(leftId);
      const to = rightAnchor(rightId);
      if (from && to) setWrongFlash({ from, to });
      triggerShake(rightId);
      await playSound('error', true);
      setTimeout(() => setWrongFlash(null), 500);
    }
  };

  const handleDrop = (leftId: string, x: number, y: number) => {
    const hit = rightEmotions.find(
      (e) => !matchedRightIds.has(e.id) && pointInRightCard(e.id, x, y)
    );
    if (hit) {
      attemptMatch(leftId, hit.id);
    }
  };

  const createResponderFor = (emotion: Emotion) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !matchedLeftIds.has(emotion.id),
      onMoveShouldSetPanResponder: () => !matchedLeftIds.has(emotion.id),
      onPanResponderGrant: (evt) => {
        setDragFromId(emotion.id);
        setDragPoint(relativePoint(evt.nativeEvent.pageX, evt.nativeEvent.pageY));
      },
      onPanResponderMove: (evt) => {
        setDragPoint(relativePoint(evt.nativeEvent.pageX, evt.nativeEvent.pageY));
      },
      onPanResponderRelease: (evt) => {
        const p = relativePoint(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
        handleDrop(emotion.id, p.x, p.y);
        setDragFromId(null);
        setDragPoint(null);
      },
      onPanResponderTerminate: () => {
        setDragFromId(null);
        setDragPoint(null);
      },
    });

  const nextLevel = async () => {
    setShowReward(false);
    await playSound('click', false);
    setCurrentLevel(currentLevel + 1);
  };

  const resetGame = async () => {
    await playSound('click', false);
    setShowComplete(false);
    setCurrentLevel(0);
  };

  const handleToggleSound = async () => {
    await playSound('click', false);
    toggleSound();
  };

  const getStarRating = (starCount: number) => (
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

  // Safe layout callback: persist event and check for layout
  const handleLeftCardLayout = (id: string, event: any) => {
    event.persist?.(); // prevent synthetic event pooling
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout) {
      setLeftLayouts((prev) => ({ ...prev, [id]: nativeEvent.layout }));
    }
  };

  const handleRightCardLayout = (id: string, event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout) {
      setRightLayouts((prev) => ({ ...prev, [id]: nativeEvent.layout }));
    }
  };

  const handleColLeftLayout = (event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout) {
      setColLeftLayout(nativeEvent.layout);
    }
  };

  const handleColRightLayout = (event: any) => {
    event.persist?.();
    const { nativeEvent } = event;
    if (nativeEvent && nativeEvent.layout) {
      setColRightLayout(nativeEvent.layout);
    }
  };

  if (leftEmotions.length === 0 || rightEmotions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>{t('game.emotionMatch.title')}</Text>

        <TouchableOpacity style={styles.soundButton} onPress={handleToggleSound}>
          <MaterialIcons name={soundEnabled ? 'volume-up' : 'volume-off'} size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={[styles.scoreBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.levelContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.levelName, { color: colors.text }]}>{t(level.nameKey)}</Text>
        <Text style={[styles.levelProgress, { color: colors.textLight }]}>
          {matches.length} / {level.emotions.length} matched
        </Text>
      </View>

      {/* Instruction */}
      <View style={[styles.tipContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="gesture" size={20} color={colors.primary} />
        <Text style={[styles.tipText, { color: colors.textLight }]}>
          {t('game.emotionMatch.tip')}
        </Text>
      </View>

      {/* Matching area */}
      <Animated.View
        ref={matchAreaRef}
        style={[styles.matchArea, { opacity: fadeAnim }]}
        onLayout={() => {
          matchAreaRef.current?.measureInWindow((x, y) => {
            if (mounted.current) setMatchAreaOffset({ x, y });
          });
        }}
      >
        {/* Left column: faces */}
        <View style={styles.column} onLayout={handleColLeftLayout}>
          {leftEmotions.map((emotion) => {
            const isMatched = matchedLeftIds.has(emotion.id);
            const responder = createResponderFor(emotion);
            const shake = shakeAnims.current[emotion.id] ?? new Animated.Value(0);
            return (
              <Animated.View
                key={emotion.id}
                {...responder.panHandlers}
                onLayout={(e) => handleLeftCardLayout(emotion.id, e)}
                style={[
                  styles.faceCard,
                  {
                    backgroundColor: emotion.color + '25',
                    borderColor: isMatched ? colors.success : emotion.color,
                    transform: [{ translateX: shake }],
                    opacity: isMatched ? 0.6 : 1,
                  },
                ]}
              >
                <Text style={styles.faceEmoji}>{emotion.emoji}</Text>
                {isMatched && (
                  <View style={styles.matchedBadge}>
                    <MaterialIcons name="check-circle" size={18} color={colors.success} />
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Center connector graphics */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {matches.map((m) => {
            const from = leftAnchor(m.leftId);
            const to = rightAnchor(m.rightId);
            if (!from || !to) return null;
            return (
              <Line
                key={`${m.leftId}-${m.rightId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={colors.success}
                strokeWidth={4}
                strokeLinecap="round"
              />
            );
          })}
          {wrongFlash && (
            <Line
              x1={wrongFlash.from.x}
              y1={wrongFlash.from.y}
              x2={wrongFlash.to.x}
              y2={wrongFlash.to.y}
              stroke={colors.error}
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
          {dragFromId && dragPoint && leftAnchor(dragFromId) && (
            <Line
              x1={leftAnchor(dragFromId)!.x}
              y1={leftAnchor(dragFromId)!.y}
              x2={dragPoint.x}
              y2={dragPoint.y}
              stroke={colors.primary}
              strokeWidth={4}
              strokeDasharray="7,5"
              strokeLinecap="round"
            />
          )}
          {leftEmotions.map((e) => {
            const a = leftAnchor(e.id);
            if (!a) return null;
            return (
              <Circle
                key={`la-${e.id}`}
                cx={a.x}
                cy={a.y}
                r={6}
                fill={matchedLeftIds.has(e.id) ? colors.success : colors.primary}
              />
            );
          })}
          {rightEmotions.map((e) => {
            const a = rightAnchor(e.id);
            if (!a) return null;
            return (
              <Circle
                key={`ra-${e.id}`}
                cx={a.x}
                cy={a.y}
                r={6}
                fill={matchedRightIds.has(e.id) ? colors.success : colors.primaryLight}
              />
            );
          })}
        </Svg>

        {/* Right column: feelings */}
        <View style={styles.column} onLayout={handleColRightLayout}>
          {rightEmotions.map((emotion) => {
            const isMatched = matchedRightIds.has(emotion.id);
            return (
              <View
                key={emotion.id}
                onLayout={(e) => handleRightCardLayout(emotion.id, e)}
                style={[
                  styles.feelingCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isMatched ? colors.success : colors.primaryLight,
                    opacity: isMatched ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={[styles.feelingName, { color: colors.text }]}>{t(emotion.nameKey)}</Text>
                <Text style={[styles.feelingDesc, { color: colors.textLight }]} numberOfLines={2}>
                  {t(emotion.descKey)}
                </Text>
                {isMatched && (
                  <View style={styles.matchedBadgeRight}>
                    <MaterialIcons name="check-circle" size={18} color={colors.success} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(matches.length / level.emotions.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Coping Strategy Tip */}
      {showCopingTip && (
        <Animated.View style={[styles.copingContainer, { backgroundColor: copingColor }]}>
          <MaterialIcons name="favorite" size={20} color="#FFF" />
          <Text style={styles.copingText}>{copingMessage}</Text>
        </Animated.View>
      )}

      {/* Level Reward Modal */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('game.emotionMatch.greatJob')}</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                {t('game.emotionMatch.understandLevel', { levelName: t(level.nameKey) })}
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                {t('game.emotionMatch.scorePoints', { score })}
              </Text>
              {getStarRating(stars)}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={nextLevel}
              >
                <Text style={styles.modalButtonText}>{t('game.emotionMatch.nextLevel')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>

      {/* Game Complete Modal */}
      <Modal visible={showComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🏆</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('game.emotionMatch.emotionMaster')}</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                {t('game.emotionMatch.understandAll')}
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                {t('game.emotionMatch.totalScore', { score })}
              </Text>
              {getStarRating(3)}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={resetGame}
                >
                  <Text style={styles.modalButtonText}>{t('game.emotionMatch.playAgain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.modalButtonText}>{t('game.emotionMatch.backToMenu')}</Text>
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
  levelContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  levelName: { fontSize: Typography.fontSize.md, fontWeight: 'bold' },
  levelProgress: { fontSize: Typography.fontSize.sm, marginTop: Spacing.xs },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipText: { fontSize: Typography.fontSize.sm, flex: 1 },
  matchArea: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    position: 'relative',
  },
  column: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.sm,
  },
  faceCard: {
    height: 76,
    marginVertical: Spacing.xs,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceEmoji: { fontSize: 38 },
  matchedBadge: { position: 'absolute', top: -6, right: -6 },
  matchedBadgeRight: { position: 'absolute', top: -6, left: -6 },
  feelingCard: {
    minHeight: 76,
    marginVertical: Spacing.xs,
    marginLeft: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  feelingName: { fontSize: 16, fontWeight: 'bold' },
  feelingDesc: { fontSize: 12, marginTop: 2 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginVertical: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  copingContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  copingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
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
  modalScore: { fontSize: 18, fontWeight: 'bold', marginTop: Spacing.md },
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