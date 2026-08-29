// app/(games)/NumberHuntGame.tsx (with plain numbers, no emojis for numerals)
// ─────────────────────────────────────────────────────────────
// Redesigned as an actual HUNT: a clue is shown at the top, then
// several number tiles are scattered around the screen (with a
// gentle random tilt/position, like a seek-and-find). The player
// taps the tile that matches the clue before the timer runs out.
// Wrong taps just fade out of the hunt — they don't end the round,
// so kids can keep exploring until they find the right one.
// Same theme/colors/hooks as the original file.
// ─────────────────────────────────────────────────────────────
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
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

type HuntType = 'fingers' | 'digits' | 'objects' | 'word' | 'speed';

interface Question {
  id: number;
  targetNumber: number;
  descKey: string;
  clueEmoji: string;
  unitEmoji?: string; // only used by the 'objects' hunt type
}

interface Level {
  id: number;
  nameKey: string;
  huntType: HuntType;
  pool: number[]; // every value that may appear as a tile in this level
  tileCount: number;
  timeLimit: number; // seconds per round
  questions: Question[];
}

interface HuntTile {
  id: string;
  value: number;
  isTarget: boolean;
  top: number;
  left: number;
  rotate: number;
}

// Emoji maps are kept but no longer used in rendering
const FINGER_EMOJI: Record<number, string> = {
  1: '☝️', 2: '✌️', 3: '👌', 4: '🖖', 5: '🖐️',
};
const DIGIT_EMOJI: Record<number, string> = {
  1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
  6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣', 10: '🔟',
};

const TILE_SIZE = 72;

const levels: Level[] = [
  {
    id: 1,
    nameKey: 'numberHunt.level1.name',
    huntType: 'fingers',
    pool: [1, 2, 3, 4, 5],
    tileCount: 6,
    timeLimit: 16,
    questions: [
      { id: 1, targetNumber: 1, descKey: 'numberHunt.level1.q1', clueEmoji: '☝️' },
      { id: 2, targetNumber: 2, descKey: 'numberHunt.level1.q2', clueEmoji: '✌️' },
      { id: 3, targetNumber: 3, descKey: 'numberHunt.level1.q3', clueEmoji: '👌' },
      { id: 4, targetNumber: 4, descKey: 'numberHunt.level1.q4', clueEmoji: '🖖' },
      { id: 5, targetNumber: 5, descKey: 'numberHunt.level1.q5', clueEmoji: '🖐️' },
    ],
  },
  {
    id: 2,
    nameKey: 'numberHunt.level2.name',
    huntType: 'digits',
    pool: [6, 7, 8, 9, 10],
    tileCount: 7,
    timeLimit: 14,
    questions: [
      { id: 1, targetNumber: 6, descKey: 'numberHunt.level2.q1', clueEmoji: '6️⃣' },
      { id: 2, targetNumber: 7, descKey: 'numberHunt.level2.q2', clueEmoji: '7️⃣' },
      { id: 3, targetNumber: 8, descKey: 'numberHunt.level2.q3', clueEmoji: '8️⃣' },
      { id: 4, targetNumber: 9, descKey: 'numberHunt.level2.q4', clueEmoji: '9️⃣' },
      { id: 5, targetNumber: 10, descKey: 'numberHunt.level2.q5', clueEmoji: '🔟' },
    ],
  },
  {
    id: 3,
    nameKey: 'numberHunt.level3.name',
    huntType: 'objects',
    pool: [1, 2, 3, 4, 5],
    tileCount: 6,
    timeLimit: 18,
    questions: [
      { id: 1, targetNumber: 1, descKey: 'numberHunt.level3.q1', clueEmoji: '🍎', unitEmoji: '🍎' },
      { id: 2, targetNumber: 2, descKey: 'numberHunt.level3.q2', clueEmoji: '⭐', unitEmoji: '⭐' },
      { id: 3, targetNumber: 3, descKey: 'numberHunt.level3.q3', clueEmoji: '❤️', unitEmoji: '❤️' },
      { id: 4, targetNumber: 4, descKey: 'numberHunt.level3.q4', clueEmoji: '🔴', unitEmoji: '🔴' },
      { id: 5, targetNumber: 5, descKey: 'numberHunt.level3.q5', clueEmoji: '🟦', unitEmoji: '🟦' },
    ],
  },
  {
    id: 4,
    nameKey: 'numberHunt.level4.name',
    huntType: 'word',
    pool: [1, 2, 3, 4, 5],
    tileCount: 6,
    timeLimit: 14,
    questions: [
      { id: 1, targetNumber: 1, descKey: 'numberHunt.level4.q1', clueEmoji: '🔤' },
      { id: 2, targetNumber: 2, descKey: 'numberHunt.level4.q2', clueEmoji: '🔤' },
      { id: 3, targetNumber: 3, descKey: 'numberHunt.level4.q3', clueEmoji: '🔤' },
      { id: 4, targetNumber: 4, descKey: 'numberHunt.level4.q4', clueEmoji: '🔤' },
      { id: 5, targetNumber: 5, descKey: 'numberHunt.level4.q5', clueEmoji: '🔤' },
    ],
  },
  {
    id: 5,
    nameKey: 'numberHunt.level5.name',
    huntType: 'speed',
    pool: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    tileCount: 9,
    timeLimit: 10,
    questions: [
      { id: 1, targetNumber: 3, descKey: 'numberHunt.level5.q1', clueEmoji: '🔍' },
      { id: 2, targetNumber: 7, descKey: 'numberHunt.level5.q2', clueEmoji: '🔍' },
      { id: 3, targetNumber: 5, descKey: 'numberHunt.level5.q3', clueEmoji: '🔍' },
      { id: 4, targetNumber: 9, descKey: 'numberHunt.level5.q4', clueEmoji: '🔍' },
      { id: 5, targetNumber: 2, descKey: 'numberHunt.level5.q5', clueEmoji: '🔍' },
    ],
  },
];

// ─── Sinhala external audio map ─────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/games/numberHuntinstruction.mp3'),
};
// NOTE: this audio was recorded for the old "pick from 4 options"
// mechanic. The Sinhala fallback text below has been rewritten to
// describe the new hunt-and-timer mechanic — the .mp3 should ideally
// be re-recorded by a native speaker to match.

export default function NumberHuntGame() {
  const { colors } = useTheme();
  const { t, language } = useLanguage(); // ← language
  const {
    playSound,
    playCelebration,
    playStarEarned,
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled,
  } = useSound();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tiles, setTiles] = useState<HuntTile[]>([]);
  const [fieldHeight, setFieldHeight] = useState(240);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'timeout'>('playing');
  const [wrongTileIds, setWrongTileIds] = useState<Set<string>>(new Set());
  const [resultTileId, setResultTileId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(3);
  const [hintGlowId, setHintGlowId] = useState<string | null>(null);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const bounceAnim = useState(new Animated.Value(1))[0];
  const timerAnim = useRef(new Animated.Value(1)).current;

  const level = levels[currentLevel];
  const currentQuestion = level.questions[currentQuestionIndex];

  // ─── Sinhala voice state ──────────────────────────────────────
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  // Per-tile shake animations, rebuilt each round
  const shakeAnims = useRef<{ [id: string]: Animated.Value }>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Layout helpers ─────────────────────────────────────────
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const buildTiles = (lvl: Level, question: Question): { tiles: HuntTile[]; height: number } => {
    const decoyPool = lvl.pool.filter((n) => n !== question.targetNumber);
    const values: number[] = [question.targetNumber];
    while (values.length < lvl.tileCount) {
      values.push(decoyPool[Math.floor(Math.random() * decoyPool.length)]);
    }
    const shuffledValues = shuffle(values);

    const fieldWidth = width - Spacing.lg * 2;
    const cols = lvl.tileCount >= 9 ? 4 : 3;
    const rows = Math.ceil(lvl.tileCount / cols);
    const cellW = fieldWidth / cols;
    const cellH = 92;

    const newTiles: HuntTile[] = shuffledValues.map((value, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const centerX = col * cellW + cellW / 2;
      const centerY = row * cellH + cellH / 2;
      const jitterX = (Math.random() - 0.5) * cellW * 0.35;
      const jitterY = (Math.random() - 0.5) * cellH * 0.35;
      const rotate = (Math.random() - 0.5) * 20;

      return {
        id: `tile-${index}-${value}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        value,
        isTarget: value === question.targetNumber,
        left: Math.max(0, Math.min(fieldWidth - TILE_SIZE, centerX + jitterX - TILE_SIZE / 2)),
        top: centerY + jitterY - TILE_SIZE / 2,
        rotate,
      };
    });

    return { tiles: newTiles, height: rows * cellH + TILE_SIZE / 2 };
  };

  const startQuestion = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const { tiles: newTiles, height } = buildTiles(level, currentQuestion);
    shakeAnims.current = {};
    newTiles.forEach((tile) => {
      shakeAnims.current[tile.id] = new Animated.Value(0);
    });

    setTiles(newTiles);
    setFieldHeight(height);
    setStatus('playing');
    setWrongTileIds(new Set());
    setResultTileId(null);
    setHintGlowId(null);

    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: level.timeLimit * 1000,
      useNativeDriver: false,
    }).start();

    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, level.timeLimit * 1000);

    playSound('click', false);
  };

  useEffect(() => {
    startQuestion();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, currentQuestionIndex]);

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

  const instructionText =
    language === 'si'
      ? 'මෙම ක්‍රීඩාවේදී, ඉහළ පෙන්වන ඉඟිය බලා, ඊට ගැලපෙන අංකය පහත ඇති කැබලි අතරින් සොයා තට්ටු කරන්න. කාලය අවසන් වීමට පෙර නිවැරදි පිළිතුර සොයාගන්න!'
      : "In this game, look at the clue at the top, then hunt for the matching tile hiding among the choices below and tap it before time runs out!";

  // Speak instruction when the game opens
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

  const calculateStars = () => {
    const correctCount = Math.floor(score / 10);
    if (correctCount === level.questions.length) return 3;
    if (correctCount >= level.questions.length - 1) return 2;
    return 1;
  };

  const proceedNext = async () => {
    if (currentQuestionIndex + 1 >= level.questions.length) {
      const earnedStars = calculateStars();
      setStars(earnedStars);

      if (currentLevel === levels.length - 1) {
        await playCelebration();
        setShowComplete(true);
      } else {
        await playSound('levelUp', false);
        setShowReward(true);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleTimeout = async () => {
    setStatus((prev) => {
      if (prev !== 'playing') return prev;
      return 'timeout';
    });
    const target = tiles.find((tile) => tile.isTarget);
    if (target) setResultTileId(target.id);
    await playSound('wrong', false);
    setTimeout(() => {
      proceedNext();
    }, 1600);
  };

  const triggerShake = (id: string) => {
    const anim = shakeAnims.current[id];
    if (!anim) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleTilePress = async (tile: HuntTile) => {
    if (status !== 'playing' || wrongTileIds.has(tile.id)) return;

    if (tile.isTarget) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timerAnim.stopAnimation();
      setStatus('correct');
      setResultTileId(tile.id);

      await playCorrectAnswer();
      const newScore = score + 10;
      setScore(newScore);
      await playStarEarned();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        proceedNext();
      }, 1300);
    } else {
      setWrongTileIds((prev) => new Set(prev).add(tile.id));
      triggerShake(tile.id);
      await playSound('wrong', true);

      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  const showHint = async () => {
    const target = tiles.find((tile) => tile.isTarget);
    if (!target) return;
    await playSound('click', false);
    setHintGlowId(target.id);
    setTimeout(() => setHintGlowId(null), 1800);
  };

  const nextLevel = async () => {
    setShowReward(false);
    setCurrentLevel(currentLevel + 1);
    setCurrentQuestionIndex(0);
    setScore(0);
    await playSound('click', false);
  };

  const resetGame = async () => {
    setCurrentLevel(0);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowComplete(false);
    await playSound('click', false);
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

  const getEncouragementMessage = () => {
    if (score === 0) return t('numberHunt.encouragement.start');
    if (score < 30) return t('numberHunt.encouragement.greatStart');
    if (score < 60) return t('numberHunt.encouragement.amazing');
    return t('numberHunt.encouragement.champion');
  };

  // ─── Clue banner (now shows the target number as a plain digit) ───────
  const renderClue = () => {
    return (
      <View style={styles.clueSimpleWrap}>
        <Text style={styles.clueNumber}>
          {currentQuestion.targetNumber}
        </Text>
        <Text style={[styles.clueText, { color: colors.text }]}>{t(currentQuestion.descKey)}</Text>
      </View>
    );
  };

  // ─── Tile content: plain number instead of emoji ──────────────────
  const renderTileContent = (tile: HuntTile) => {
    return <Text style={[styles.tileNumeral, { color: colors.text }]}>{tile.value}</Text>;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('numberHunt.title')}</Text>

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
          {t('question')} {currentQuestionIndex + 1} {t('of')} {level.questions.length}
        </Text>
      </View>

      {/* Encouragement Message */}
      <View style={[styles.encouragementContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <MaterialIcons name="emoji-emotions" size={20} color={colors.primary} />
        <Text style={[styles.encouragementText, { color: colors.text }]}>
          {getEncouragementMessage()}
        </Text>
      </View>

      {/* Clue */}
      <Animated.View
        style={[
          styles.clueContainer,
          { backgroundColor: colors.surface },
          { transform: [{ scale: bounceAnim }] },
        ]}
      >
        <View style={styles.clueTag}>
          <MaterialIcons name="search" size={16} color={colors.primary} />
          <Text style={[styles.clueTagText, { color: colors.primary }]}>Your clue</Text>
        </View>
        {renderClue()}
      </Animated.View>

      {/* Timer bar */}
      <View style={styles.timerTrack}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              backgroundColor: colors.primary,
              width: timerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Hint Button */}
      <TouchableOpacity
        style={[styles.hintButton, { backgroundColor: colors.primaryLight }]}
        onPress={showHint}
      >
        <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
        <Text style={[styles.hintButtonText, { color: colors.primary }]}>{t('numberHunt.hintButton')}</Text>
      </TouchableOpacity>

      {/* Hunt field */}
      <View style={[styles.huntField, { height: fieldHeight }]}>
        {tiles.map((tile) => {
          const isWrong = wrongTileIds.has(tile.id);
          const isResult = resultTileId === tile.id;
          const isHinted = hintGlowId === tile.id;
          const shake = shakeAnims.current[tile.id] ?? new Animated.Value(0);

          return (
            <Animated.View
              key={tile.id}
              style={{
                position: 'absolute',
                top: tile.top,
                left: tile.left,
                opacity: isWrong ? 0.35 : 1,
                transform: [
                  { rotate: `${tile.rotate}deg` },
                  {
                    translateX: shake.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-8, 8],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={isWrong || status !== 'playing'}
                onPress={() => handleTilePress(tile)}
                style={[
                  styles.huntTile,
                  {
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: colors.surface,
                    borderColor: isResult
                      ? colors.success
                      : isHinted
                        ? colors.accentYellow || '#FFD700'
                        : colors.primaryLight,
                    borderWidth: isResult || isHinted ? 3 : 2,
                  },
                ]}
              >
                {renderTileContent(tile)}
                {isResult && (
                  <View style={styles.tileCheck}>
                    <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Timeout feedback */}
      {status === 'timeout' && (
        <View style={[styles.feedbackContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="tips-and-updates" size={20} color={colors.error} />
          <Text style={[styles.feedbackText, { color: colors.error }]}>
            {t('numberHunt.feedbackWrong', { number: currentQuestion.targetNumber })}
          </Text>
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(currentQuestionIndex / level.questions.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Level Reward Modal */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('numberHunt.reward.title')}</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                {t('numberHunt.reward.message', { levelName: t(level.nameKey) })}
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                {t('score')}: {score} {t('points')}
              </Text>
              {getStarRating(stars)}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={nextLevel}
              >
                <Text style={styles.modalButtonText}>{t('numberHunt.nextLevel')} →</Text>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('numberHunt.complete.title')}</Text>
              <Text style={[styles.modalMessage, { color: colors.textLight }]}>
                {t('numberHunt.complete.message')}
              </Text>
              <Text style={[styles.modalScore, { color: colors.primary }]}>
                {t('totalScore')}: {score} {t('points')}
              </Text>
              {getStarRating(3)}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={resetGame}
                >
                  <Text style={styles.modalButtonText}>{t('playAgain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.modalButtonText}>{t('backToMenu')}</Text>
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
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  encouragementText: { fontSize: Typography.fontSize.sm, fontWeight: '500' },
  clueContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  clueTag: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clueTagText: { fontSize: Typography.fontSize.sm, fontWeight: '700' },
  clueSimpleWrap: { alignItems: 'center' },
  clueNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: Spacing.xs,
  },
  clueEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  clueText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  clueObjectsWrap: { alignItems: 'center' },
  clueObjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  clueObjectEmoji: { fontSize: 34 },
  clueWordWrap: { alignItems: 'center' },
  clueWordText: { fontSize: 32, fontWeight: 'bold', letterSpacing: 4, marginTop: Spacing.xs },
  timerTrack: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: 4 },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  hintButtonText: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  huntField: {
    marginHorizontal: Spacing.lg,
    position: 'relative',
  },
  huntTile: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  tileEmoji: { fontSize: 34 },
  tileNumeral: { fontSize: 30, fontWeight: 'bold' },
  tileClusterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: TILE_SIZE - 16,
  },
  tileClusterEmoji: { fontSize: 13, margin: 1 },
  tileCheck: { position: 'absolute', top: -8, right: -8 },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  feedbackText: { fontSize: Typography.fontSize.sm, flex: 1 },
  progressContainer: { paddingHorizontal: Spacing.lg, marginVertical: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
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
  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});