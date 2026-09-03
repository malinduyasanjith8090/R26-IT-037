// app/(games)/FaceWashGame.tsx
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    ImageSourcePropType,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useLanguage } from '../../context/LanguageContext';

const { width: SW } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// IMAGE SOURCES — assets/washfacegame. Filenames kept exactly as they exist
// on disk, including the "brushteath..." typo (must match verbatim or the
// bundler won't find the file).
// ---------------------------------------------------------------------------
const wakeUp = require('../../assets/washfacegames/wakeup.png');
const goingToBathroom = require('../../assets/washfacegames/goingtobathroom.png');
const notGoingToBathroom = require('../../assets/washfacegames/notgoingtobathroom.png');
const washFaceHappy = require('../../assets/washfacegames/washfacehappy.png');
const washFaceUnhappy = require('../../assets/washfacegames/washfaceunhappy.png');
const brushTeethHappy = require('../../assets/washfacegames/brushteethhappy.png');
const brushTeethUnhappy = require('../../assets/washfacegames/brushteathunhappy.png');
const allComplete = require('../../assets/washfacegames/fashwashactivitycomplete.png');

// ---------------------------------------------------------------------------
// SOUND SOURCES — assets/washfacegame/sounds. Short (~2s) feedback clips —
// rename these require() paths if your files are named differently.
// ---------------------------------------------------------------------------
const correctSound = require('../../assets/sounds/sounds-b/correct.mp3');
const incorrectSound = require('../../assets/sounds/sounds-b/incorrect.mp3');
const completeSound = require('../../assets/sounds/sounds-b/completed.mp3');

// Source art is landscape 3:2 — matches the ratio used across the other
// picture-choice games so cards stay visually consistent.
const IMAGE_RATIO = 3 / 2;
const CARD_RADIUS = 24;
const H_PAD = 22;

// ---------------------------------------------------------------------------
// STEP CONFIG — each step is a two-way choice; tapping the `correct` image
// advances, tapping `incorrect` gives a gentle nudge and lets the child try
// again (no punishing red, no lock-out — matches the calm/autism-friendly
// tone used across the other games in this app).
// ---------------------------------------------------------------------------
type Step = {
  id: string;
  promptKey: string;
  correct: { key: string; source: ImageSourcePropType };
  incorrect: { key: string; source: ImageSourcePropType };
};

const STEPS: Step[] = [
  {
    id: 'bathroom',
    promptKey: 'faceWashGame.step1.prompt',
    correct: { key: 'going_to_bathroom', source: goingToBathroom },
    incorrect: { key: 'not_going_to_bathroom', source: notGoingToBathroom },
  },
  {
    id: 'washface',
    promptKey: 'faceWashGame.step2.prompt',
    correct: { key: 'wash_face_happy', source: washFaceHappy },
    incorrect: { key: 'wash_face_unhappy', source: washFaceUnhappy },
  },
  {
    id: 'brushteeth',
    promptKey: 'faceWashGame.step3.prompt',
    correct: { key: 'brush_teeth_happy', source: brushTeethHappy },
    incorrect: { key: 'brush_teeth_unhappy', source: brushTeethUnhappy },
  },
];

// Fisher–Yates shuffle — used so the correct picture doesn't always land
// in the same position (top/first), removing any position bias.
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// COLOUR PALETTE — same calm/warm tokens used elsewhere in the app.
// ---------------------------------------------------------------------------
const C = {
  bg: '#F8F5F1',
  bgDeep: '#EFEAE3',
  warmWhite: '#FFFDF9',

  ink: '#2A2420',
  inkMid: '#4E443B',
  inkSoft: '#7C7168',

  teal: '#2FB6A0',
  tealLight: '#D6F3EC',
  tealDark: '#1F8E7C',

  amber: '#EFAA3C',
  amberLight: '#FCF1DC',

  coral: '#F0876B',
  coralLight: '#FBEAE3',

  heroA: '#2FB6A0',
  heroB: '#2B8FAA',
};

const shadow = (depth = 8, color = '#000', opacity = 0.06) =>
  Platform.select({
    web: {
      boxShadow: `0 ${depth / 2}px ${depth * 2.5}px rgba(0,0,0,${opacity})`,
    },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: depth,
      shadowOffset: { width: 0, height: depth / 2 },
      elevation: Math.round(depth / 2),
    },
  });

// ---------------------------------------------------------------------------
// ProgressDots — one dot per step, filled as the child completes each one.
// ---------------------------------------------------------------------------
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={pd.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            pd.dot,
            i < current && pd.dotDone,
            i === current && pd.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const pd = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.bgDeep,
  },
  dotActive: {
    backgroundColor: C.teal,
    width: 22,
  },
  dotDone: {
    backgroundColor: C.tealLight,
  },
});

// ---------------------------------------------------------------------------
// ChoiceImageCard — a single tappable picture. `state` drives the visual
// treatment: neutral / correct (teal ring + check) / incorrect (soft coral
// wobble, no red, no cross icon — just an invitation to try the other one).
// ---------------------------------------------------------------------------
type CardState = 'idle' | 'correct' | 'incorrect';

function ChoiceImageCard({
  source,
  state,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  source: ImageSourcePropType;
  state: CardState;
  disabled: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const shake = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'incorrect') {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
    if (state === 'correct') {
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [state, shake, scale]);

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  const borderColor =
    state === 'correct' ? C.teal : state === 'incorrect' ? C.coral : 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={cic.touchable}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={{ transform: [{ translateX }, { scale }], opacity: disabled && state === 'idle' ? 0.6 : 1 }}>
        <View style={[cic.card, { borderColor }]}>
          <Image source={source} style={cic.image} resizeMode="cover" />

          {state === 'correct' && (
            <View style={cic.badge}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const cic = StyleSheet.create({
  touchable: { width: '100%', alignItems: 'center' },
  card: {
    width: Math.min(SW * 0.78, 320),
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: C.warmWhite,
    borderWidth: 3,
    ...shadow(10, '#000', 0.08),
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: IMAGE_RATIO,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.teal,
    ...shadow(6, '#000', 0.2),
  },
});

// ---------------------------------------------------------------------------
// Main screen — three phases: intro -> steps -> complete.
// ---------------------------------------------------------------------------
type Phase = 'intro' | 'steps' | 'complete';

export default function FaceWashGameScreen() {
  const { t } = useLanguage();

  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [displayOrder, setDisplayOrder] = useState<
    Array<{ key: string; source: ImageSourcePropType; isCorrect: boolean }>
  >([]);
  const [locked, setLocked] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // -------------------------------------------------------------------------
  // AUDIO — preload once on mount so playback is instant (no load-then-play
  // lag on the child's first correct/incorrect tap), unload on unmount.
  // -------------------------------------------------------------------------
  const correctSoundRef = useRef<Audio.Sound | null>(null);
  const incorrectSoundRef = useRef<Audio.Sound | null>(null);
  const completeSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});

    (async () => {
      const [{ sound: correct }, { sound: incorrect }, { sound: complete }] = await Promise.all([
        Audio.Sound.createAsync(correctSound),
        Audio.Sound.createAsync(incorrectSound),
        Audio.Sound.createAsync(completeSound),
      ]);

      if (!isMounted) {
        correct.unloadAsync();
        incorrect.unloadAsync();
        complete.unloadAsync();
        return;
      }

      correctSoundRef.current = correct;
      incorrectSoundRef.current = incorrect;
      completeSoundRef.current = complete;
    })();

    return () => {
      isMounted = false;
      correctSoundRef.current?.unloadAsync();
      incorrectSoundRef.current?.unloadAsync();
      completeSoundRef.current?.unloadAsync();
    };
  }, []);

  const playSound = useCallback((ref: React.MutableRefObject<Audio.Sound | null>) => {
    // Fire-and-forget — audio is a nice-to-have and should never block or
    // break the game if a clip is missing or fails to load.
    ref.current?.replayAsync().catch(() => {});
  }, []);

  const currentStep = STEPS[stepIndex];

  const fadeIn = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Re-shuffle which side the correct picture appears on every time the
  // step changes, so it isn't predictably first/top each time.
  useEffect(() => {
    if (phase !== 'steps' || !currentStep) return;

    setDisplayOrder(
      shuffleArray([
        { key: currentStep.correct.key, source: currentStep.correct.source, isCorrect: true },
        { key: currentStep.incorrect.key, source: currentStep.incorrect.source, isCorrect: false },
      ]),
    );
    setCardStates({});
    fadeIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stepIndex]);

  const handleStart = () => {
    setPhase('steps');
    setStepIndex(0);
    setCardStates({});
  };

  const handlePick = (key: string, isCorrect: boolean) => {
    if (locked) return;

    if (isCorrect) {
      setLocked(true);
      setCardStates({ [key]: 'correct' });

      const nextIndex = stepIndex + 1;
      const isLastStep = nextIndex >= STEPS.length;

      // On the final step play the "activity complete" clip instead of the
      // regular correct-answer clip; otherwise play the normal correct cue.
      playSound(isLastStep ? completeSoundRef : correctSoundRef);

      setTimeout(() => {
        if (isLastStep) {
          setPhase('complete');
        } else {
          setStepIndex(nextIndex);
        }

        setLocked(false);
      }, 700);
    } else {
      // Gentle nudge only — no lock-out, child can immediately try the
      // other picture.
      playSound(incorrectSoundRef);
      setCardStates(prev => ({ ...prev, [key]: 'incorrect' }));
      setTimeout(() => {
        setCardStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 500);
    }
  };

  const handlePlayAgain = () => {
    setPhase('intro');
    setStepIndex(0);
    setCardStates({});
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={[C.heroA, C.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          accessibilityLabel={t('back')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{t('faceWashGame.title')}</Text>
        </View>

        <View style={{ width: 44 }} />
      </LinearGradient>

      {phase === 'steps' && (
        <View style={s.progressWrap}>
          <ProgressDots total={STEPS.length} current={stepIndex} />
        </View>
      )}

      {/* ----------------------------- INTRO ----------------------------- */}
      {phase === 'intro' && (
        <View style={s.center}>
          <Text style={s.instruction}>{t('faceWashGame.introPrompt')}</Text>

          <View style={s.introImageWrap}>
            <Image source={wakeUp} style={s.introImage} resizeMode="cover" />
          </View>

          <TouchableOpacity style={s.nextBtn} onPress={handleStart}>
            <Text style={s.nextBtnText}>{t('faceWashGame.next')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* ----------------------------- STEPS ------------------------------ */}
      {phase === 'steps' && currentStep && (
        <Animated.View style={[s.stepsWrap, { opacity: fadeAnim }]}>
          <Text style={s.instruction}>{t(currentStep.promptKey)} 👆</Text>

          <View style={s.choicesRow}>
            {displayOrder.map(item => (
              <ChoiceImageCard
                key={item.key}
                source={item.source}
                state={cardStates[item.key] || 'idle'}
                disabled={locked}
                onPress={() => handlePick(item.key, item.isCorrect)}
                accessibilityLabel={t(`faceWashGame.option.${item.key}`)}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* --------------------------- COMPLETE ------------------------------ */}
      {phase === 'complete' && (
        <View style={s.center}>
          <Text style={s.completeTitle}>{t('faceWashGame.allDone')} 🎉</Text>

          <View style={s.introImageWrap}>
            <Image source={allComplete} style={s.introImage} resizeMode="cover" />
          </View>

          <Text style={s.completeSubtitle}>{t('faceWashGame.allDoneSubtitle')}</Text>

          <View style={s.completeBtnRow}>
            <TouchableOpacity style={s.secondaryBtn} onPress={handlePlayAgain}>
              <Ionicons name="refresh" size={18} color={C.tealDark} />
              <Text style={s.secondaryBtnText}>{t('faceWashGame.playAgain')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.nextBtn} onPress={() => router.back()}>
              <Text style={s.nextBtnText}>{t('faceWashGame.backToGames')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 18,
    paddingHorizontal: H_PAD,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow(10, '#000', 0.12),
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: '800' },

  progressWrap: { paddingTop: 16, paddingBottom: 4, paddingHorizontal: H_PAD },

  center: { flex: 1, alignItems: 'center', paddingHorizontal: H_PAD, paddingTop: 24 },

  instruction: {
    fontSize: 20,
    fontWeight: '800',
    color: C.ink,
    textAlign: 'center',
    marginBottom: 18,
  },

  introImageWrap: {
    width: Math.min(SW * 0.82, 340),
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: C.warmWhite,
    ...shadow(12, '#000', 0.1),
  },
  introImage: { width: '100%', height: undefined, aspectRatio: IMAGE_RATIO },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.teal,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 26,
    ...shadow(10, '#000', 0.12),
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  stepsWrap: { flex: 1, alignItems: 'center', paddingHorizontal: H_PAD, paddingTop: 20 },
  choicesRow: { gap: 18, alignItems: 'center', marginTop: 6 },

  completeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.ink,
    textAlign: 'center',
    marginBottom: 18,
  },
  completeSubtitle: {
    fontSize: 15,
    color: C.inkMid,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  completeBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.tealLight,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  secondaryBtnText: { color: C.tealDark, fontSize: 15, fontWeight: '700' },
});