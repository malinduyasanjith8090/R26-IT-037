// app/(games)/HandWashingGame.tsx
import { Ionicons } from '@expo/vector-icons';
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
// IMAGE SOURCES — assets/handwashgame. Filenames kept exactly as they exist
// on disk (note the trailing space in "wipe hands .png" — required verbatim
// or the bundler won't find the file).
// ---------------------------------------------------------------------------
const doneEating = require('../../assets/handwashgame/done eating.png');
const washHands = require('../../assets/handwashgame/washhands.png');
const walkAwayWithoutWiping = require('../../assets/handwashgame/walk away without wiping.png');
const wipeHands = require('../../assets/handwashgame/wipe hands .png');
const wipeHandsWithRice = require('../../assets/handwashgame/wipe hands with rice.png');
const allComplete = require('../../assets/handwashgame/all complete.png');

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
    id: 'wash',
    promptKey: 'handWashGame.step1.prompt',
    correct: { key: 'wash_hands', source: washHands },
    incorrect: { key: 'walk_away_without_wiping', source: walkAwayWithoutWiping },
  },
  {
    id: 'wipe',
    promptKey: 'handWashGame.step2.prompt',
    correct: { key: 'wipe_hands', source: wipeHands },
    incorrect: { key: 'wipe_hands_with_rice', source: wipeHandsWithRice },
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
}: {
  source: ImageSourcePropType;
  state: CardState;
  disabled: boolean;
  onPress: () => void;
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
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled} style={cic.touchable}>
      <Animated.View style={{ transform: [{ translateX }, { scale }] }}>
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

export default function HandWashingGameScreen() {
  const { t } = useLanguage();

  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [displayOrder, setDisplayOrder] = useState<
    Array<{ key: string; source: ImageSourcePropType; isCorrect: boolean }>
  >([]);
  const [locked, setLocked] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

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

      setTimeout(() => {
        const nextIndex = stepIndex + 1;

        if (nextIndex >= STEPS.length) {
          setPhase('complete');
        } else {
          setStepIndex(nextIndex);
        }

        setLocked(false);
      }, 700);
    } else {
      // Gentle nudge only — no lock-out, child can immediately try the
      // other picture.
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
          <Text style={s.headerTitle}>{t('handWashGame.title')}</Text>
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
          <Text style={s.instruction}>{t('handWashGame.introPrompt')}</Text>

          <View style={s.introImageWrap}>
            <Image source={doneEating} style={s.introImage} resizeMode="cover" />
          </View>

          <TouchableOpacity style={s.nextBtn} onPress={handleStart}>
            <Text style={s.nextBtnText}>{t('handWashGame.next')}</Text>
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
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* --------------------------- COMPLETE ------------------------------ */}
      {phase === 'complete' && (
        <View style={s.center}>
          <Text style={s.completeTitle}>{t('handWashGame.allDone')} 🎉</Text>

          <View style={s.introImageWrap}>
            <Image source={allComplete} style={s.introImage} resizeMode="cover" />
          </View>

          <Text style={s.completeSubtitle}>{t('handWashGame.allDoneSubtitle')}</Text>

          <View style={s.completeBtnRow}>
            <TouchableOpacity style={s.secondaryBtn} onPress={handlePlayAgain}>
              <Ionicons name="refresh" size={18} color={C.tealDark} />
              <Text style={s.secondaryBtnText}>{t('handWashGame.playAgain')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.nextBtn} onPress={() => router.back()}>
              <Text style={s.nextBtnText}>{t('handWashGame.backToGames')}</Text>
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