import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useChild } from '../../context/ChildContext';
import { getTranslation, useLanguage } from '../../context/LanguageContext';

import {
  getNextBehaviourScenario,
  startSession,
  submitBehaviourTrial,
} from '../../services/apiService';

// Pulled out into its own file — see components/behaviour/BehaviourImage.js
// for the asset map (assetKey -> require()'d image) and the fallback
// placeholder rendering.
import BehaviourImage from '../../components/behaviour/BehaviourImage';

const { width: SW, height: SH } = Dimensions.get('window');

const H_PAD = 22;
const CARD_RADIUS = 24;
const TRIALS_PER_SESSION = 13;

// Your source images are 1536 × 1024 (landscape 3:2), not square.
// This ratio drives every image/card dimension below — if you ever
// re-export the art at a different size, just update this one constant.
const IMAGE_W = 1536;
const IMAGE_H = 1024;
const IMAGE_RATIO = IMAGE_W / IMAGE_H; // 1.5

// ---------------------------------------------------------------------------
// RESEARCH INSTRUMENTATION CONSTANTS
// ---------------------------------------------------------------------------
// Response-time thresholds (ms) used to classify each trial into one of four
// behavioural-signal buckets. These thresholds are a starting point — tune
// them once you have pilot data on typical response times for this age group.
// NOTE: these only affect the research data recorded, never the visible UI —
// a child never sees a "fast/slow" judgement, so there is no time pressure.
const FAST_RESPONSE_MS = 2000;   // below this = fast / confident tap
const SLOW_RESPONSE_MS = 6000;   // above this = hesitant / uncertain tap

/**
 * Classifies a single trial into an interpretable behavioural-signal category.
 *
 * IMPORTANT — this is now a PREFERENCE-READ classifier, not an accuracy
 * classifier. The game no longer tells the child which picture is "correct",
 * so `isCorrect` here means "did the child spontaneously choose the picture
 * that shows the encouraged/typical behaviour" — a signal about the child's
 * natural inclination, not a test result. This still turns raw choice +
 * response time into an interpretable research signal:
 *   - mastered            : fast + chose the encouraged behaviour -> strong, confident preference
 *   - uncertain_but_correct: slow + chose the encouraged behaviour -> got there, but deliberated
 *   - impulsive            : fast + chose the other behaviour -> quick pull toward that behaviour
 *   - confused             : slow + chose the other behaviour -> genuine uncertainty/difference in preference
 *
 * Kept as a pure, simple, auditable function (not a black-box model) so it
 * can be explained to parents/therapists and cited directly in the report.
 */
function classifyTrial(isCorrect, responseTimeMs) {
  const isFast = responseTimeMs < FAST_RESPONSE_MS;
  const isSlow = responseTimeMs > SLOW_RESPONSE_MS;

  if (isCorrect && isFast) return 'mastered';
  if (isCorrect && (isSlow || !isFast)) return 'uncertain_but_correct';
  if (!isCorrect && isFast) return 'impulsive';
  return 'confused';
}

// Fisher–Yates shuffle for a 2-item (or n-item) array — used so the
// encouraged-behaviour picture doesn't always land on the same side,
// removing any left/right position bias in the child's choice.
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// COLOUR PALETTE — softened for sensory-friendliness.
// Autism-friendly design notes:
//  - Avoided high-saturation alarm red for "incorrect" states (can feel
//    punishing / overstimulating). Swapped to a muted warm coral instead.
//  - Kept overall contrast high enough for legibility without harsh
//    pure-black text or pure-white glare.
//  - Background stays a calm, low-saturation warm neutral throughout.
// ---------------------------------------------------------------------------
const C = {
  bg: '#F8F5F1',
  bgDeep: '#EFEAE3',
  sand: '#C4A882',
  sandLight: '#EAE2D6',
  cream: '#FBF8F4',
  warmWhite: '#FFFDF9',

  ink: '#2A2420',
  inkMid: '#4E443B',
  inkSoft: '#7C7168',
  inkFaint: '#A79D94',

  teal: '#2FB6A0',
  tealLight: '#D6F3EC',
  tealDark: '#1F8E7C',

  coral: '#F0876B',
  coralLight: '#FBEAE3',

  amber: '#EFAA3C',
  amberLight: '#FCF1DC',

  plum: '#8570AA',
  plumLight: '#EFE8F7',

  sky: '#5CA6D6',
  skyLight: '#E1F1FA',

  heroA: '#2FB6A0',
  heroB: '#2B8FAA',
  heroC: '#1E6488',
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
      shadowOffset: {
        width: 0,
        height: depth / 2,
      },
      elevation: Math.round(depth / 2),
    },
  });

// ---------------------------------------------------------------------------
// FeedbackOverlay — REDESIGNED for a preference-based (not quiz-based) game:
//  - Always the SAME neutral, warm acknowledgment regardless of which
//    picture was chosen. The child is never told "right" or "wrong" —
//    this keeps every future choice a genuine, unprompted preference
//    rather than something learned from feedback.
//  - Lower-opacity backdrop so the change of scene isn't jarring.
//  - Slow, calm animation (no snappy spring bounce).
//  - Tappable to continue immediately — gives the child control over pacing.
//
//  Text is now driven by the app-wide language setting (t()) instead of a
//  hardcoded English + Sinhala pair, so Tamil users see the right text too.
// ---------------------------------------------------------------------------
function FeedbackOverlay({
  visible,
  onDone,
}) {
  const { t } = useLanguage();

  const scale =
    useRef(new Animated.Value(0.85)).current;

  const opacity =
    useRef(new Animated.Value(0)).current;

  const timerRef = useRef(null);

  const finish = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDone();
    });
  }, [onDone, opacity, scale]);

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();

    // Extra time (1.6s) so nothing feels rushed — still auto-advances so a
    // child never gets stuck waiting for input.
    timerRef.current = setTimeout(finish, 1600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        fs.overlay,
        {
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        activeOpacity={1}
        onPress={finish}
        accessibilityLabel="Continue"
      >
        <View style={fs.centerWrap}>
          <Animated.View
            style={[
              fs.bubble,
              {
                backgroundColor: C.teal,

                transform: [
                  {
                    scale,
                  },
                ],
              },
            ]}
          >
            <Text style={fs.emoji}>⭐</Text>

            <Text style={fs.feedbackTitle}>
              {t('behaviourGame.nicePick')}
            </Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const fs = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,26,22,0.28)',
    zIndex: 100,
  },

  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bubble: {
    width: 240,
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    ...shadow(20, '#000', 0.18),
  },

  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },

  feedbackTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
});

function ProgressBar({
  current,
  total,
}) {
  const anim =
    useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: current / total,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [current, total, anim]);

  return (
    <View style={pb.track}>
      <Animated.View
        style={[
          pb.fill,
          {
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const pb = StyleSheet.create({
  track: {
    height: 10,
    backgroundColor: C.sandLight,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },

  fill: {
    height: 10,
    backgroundColor: C.teal,
    borderRadius: 10,
  },
});

// ---------------------------------------------------------------------------
// ChoiceCard — REDESIGNED for a preference-based (not quiz-based) game:
//  - No correct/incorrect colour coding, no check/heart badge that reveals
//    which picture was "right". Selecting a card just shows a single
//    neutral highlight (teal) so the child sees "this is what I picked",
//    nothing more.
//  - Large touch target, calm (non-bouncy) selection animation.
//
//  UI/UX + shadow notes:
//  - RN cannot cast a visible shadow on a view that also has
//    `overflow: 'hidden'` — the clip cuts the shadow off too. So the shadow
//    now lives on an OUTER wrapper (no clipping) and the image clipping /
//    border-radius lives on a separate INNER wrapper. This is what makes
//    the cards actually look lifted off the background instead of flat.
//  - Selecting a card animates its shadow (softly deeper + tealtinted) in
//    addition to the existing scale-down + checkmark badge + border ring,
//    so the "this is what I picked" feedback reads clearly at a glance.
//  - Images are 1536×1024 (3:2 landscape) — IMAGE_RATIO drives the card's
//    aspect ratio so the photos display uncropped-feeling and consistent.
// ---------------------------------------------------------------------------
function ChoiceCard({
  image,
  onPress,
  selected,
  disabled,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: selected ? 0.97 : 1,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: selected ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // shadow/elevation props can't use native driver
      }),
    ]).start();
  }, [selected, scale, lift]);

  const shadowOpacity = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.09, 0.22],
  });

  const shadowRadius = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 16],
  });

  const elevation = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 9],
  });

  // IMPORTANT: `scale` is animated with useNativeDriver: true (it only ever
  // drives `transform`), while `lift` is animated with useNativeDriver:
  // false (it drives shadowOpacity/shadowRadius/elevation, which the native
  // driver can't touch). RN will throw "Attempting to run JS driven
  // animation on animated node that has been moved to native" if a native-
  // driven value and a JS-driven value land on style props of the *same*
  // Animated.View — the native driver takes over that node's whole style
  // graph. So we use two separate Animated.View nodes: the outer one only
  // ever receives the JS-driven shadow style, the inner one only ever
  // receives the native-driven transform.
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      style={cc.touchable}
    >
      {/* OUTER — JS-driven shadow ONLY. Never gets overflow:hidden (that
          would clip the shadow) and never gets a native-driven style. */}
      <Animated.View
        style={[
          cc.shadowWrap,
          Platform.OS === 'web'
            ? null
            : {
                shadowColor: selected ? C.teal : '#2A2420',
                shadowOpacity,
                shadowRadius,
                elevation,
              },
        ]}
      >
        {/* MIDDLE — native-driven transform ONLY. */}
        <Animated.View style={{ transform: [{ scale }] }}>
          {/* INNER — owns clipping + rounded corners + selection border.
              Never gets a shadow style, or it'll be clipped invisible. */}
          <View
            style={[
              cc.imageCard,
              selected && cc.imageCardSelected,
            ]}
          >
            <BehaviourImage
              assetKey={image.assetKey}
              style={cc.image}
            />

            {/* Subtle bottom scrim so the checkmark badge stays legible
                over busy photo backgrounds without darkening the whole
                image. */}
            <View style={cc.scrim} pointerEvents="none" />

            {selected && (
              <View style={cc.badge}>
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#fff"
                />
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  touchable: {
    width: '100%',
    alignItems: 'center',
  },

  // Shadow lives here — NOT clipped.
  shadowWrap: {
    width: Math.min(SW * 0.78, 320),
    borderRadius: CARD_RADIUS,
    backgroundColor: 'transparent',

    ...Platform.select({
      web: {
        boxShadow: '0 8px 22px rgba(42,36,32,0.10)',
        transition: 'box-shadow 180ms ease',
      },
      default: {
        // base values; animated shadowOpacity/shadowRadius/elevation above
        // override these once `selected` toggles.
        shadowColor: '#2A2420',
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },

  // Clipping + border lives here — NOT shadowed.
  imageCard: {
    width: '100%',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: C.warmWhite,
    borderWidth: 2.5,
    borderColor: 'transparent',
  },

  imageCardSelected: {
    borderColor: C.teal,
  },

  image: {
    width: '100%',
    height: undefined,
    aspectRatio: IMAGE_RATIO, // 1536 × 1024 → 1.5 (landscape 3:2)
  },

  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
    backgroundColor: 'rgba(20,16,12,0.10)',
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

    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      },
    }),
  },
});

// Available language options for the parent-info modal's OWN toggle. This is
// deliberately independent from the app-wide language (a parent may want to
// read the guidance in a different language than the child's app is set
// to), so it isn't driven by useLanguage()'s `language` — it uses
// getTranslation(lang, key) directly instead.
const PARENT_INFO_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ta', label: 'தமிழ்' },
];

export default function BehaviourGameScreen() {
  const { activeChild } = useChild();
  const { t } = useLanguage();

  const childId =
    activeChild?._id;

  const childName =
    activeChild?.alias || 'Child';

  const [
    sessionId,
    setSessionId,
  ] = useState(null);

  const [
    trialNumber,
    setTrialNumber,
  ] = useState(0);

  const [
    shownIds,
    setShownIds,
  ] = useState([]);

  const [
    difficulty,
    setDifficulty,
  ] = useState(1);

  // "score" here just tracks trials completed for the progress bar/summary
  // — it is NOT a right/wrong tally. This is a preference read, not a quiz.
  const [
    trialsCompleted,
    setTrialsCompleted,
  ] = useState(0);

  const [
    scenario,
    setScenario,
  ] = useState(null);

  // Randomised left/right order of the current scenario's two images,
  // computed once per scenario load so the encouraged-behaviour picture
  // isn't predictably on one side.
  const [
    displayImages,
    setDisplayImages,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    trialStartTime,
    setTrialStartTime,
  ] = useState(null);

  const [
    selectedKey,
    setSelectedKey,
  ] = useState(null);

  const [
    showFeedback,
    setShowFeedback,
  ] = useState(false);

  const [
    showParentInfo,
    setShowParentInfo,
  ] = useState(false);

  const [
  showMotherTip,
  setShowMotherTip,
] = useState(false);

  // The parent-info modal's own language toggle — independent from the
  // app-wide language, defaults to English.
  const [
    parentInfoLanguage,
    setParentInfoLanguage,
  ] = useState('en');

  const [
    hintShown,
    setHintShown,
  ] = useState(false);

  // -------------------------------------------------------------------------
  // RESEARCH STATE (collected silently — never shown to the child)
  // -------------------------------------------------------------------------
  const [
    trialClassifications,
    setTrialClassifications,
  ] = useState([]); // array of 'mastered' | 'uncertain_but_correct' | 'impulsive' | 'confused'

  const [
    preferenceChoices,
    setPreferenceChoices,
  ] = useState([]); // array of { scenarioId, chosePositiveBehaviour }

  const [
    generalizationResults,
    setGeneralizationResults,
  ] = useState([]); // array of { scenarioId, isCorrect }

  const [
    lastDifficultyChangeReason,
    setLastDifficultyChangeReason,
  ] = useState(null);

  const sessionModeRef = useRef('adaptive');

  const hintTimer =
    useRef(null);

  const fadeAnim =
    useRef(
      new Animated.Value(1),
    ).current;

  useEffect(() => {
    initSession();

    return () => {
      if (hintTimer.current) {
        clearTimeout(
          hintTimer.current,
        );
      }
    };
  }, []);

  const initSession = async () => {
    if (!childId) {
      console.log(
        '[BehaviourGame] No active child selected',
      );

      setLoading(false);

      return;
    }

    try {
      const session =
        await startSession(
          childId,
          {
            platform: Platform.OS,
            screenWidth: SW,
            screenHeight: SH,
            appVersion: '1.0.0',
            sessionMode: sessionModeRef.current,
          },
        );

      setSessionId(
        session._id,
      );

      await loadNextScenario(
        [],
        1,
      );
    } catch (e) {
      console.log(
        'Session init failed:',
        e?.message,
      );

      setLoading(false);
    }
  };

  const loadNextScenario =
    useCallback(
      async (
        excludeIds,
        currentDifficulty,
      ) => {
        if (!childId) {
          return;
        }

        setLoading(true);

        setSelectedKey(null);

        setHintShown(false);

        // Gentle fade instead of a hard slide-in — calmer and more
        // predictable for sensory-sensitive users.
        fadeAnim.setValue(0);

        try {
          const data =
            await getNextBehaviourScenario(
              childId,
              currentDifficulty,
              excludeIds,
            );

          setScenario(
            data.scenario,
          );

          // Randomise which side each picture appears on, so the
          // encouraged-behaviour picture isn't always on the same side.
          setDisplayImages(
            shuffleArray(data.scenario?.images || []),
          );

          if (data.difficultyChangeReason) {
            setLastDifficultyChangeReason(
              data.difficultyChangeReason,
            );
          }

          if (data.scenario?.isGeneralizationProbe) {
            console.log(
              '[BehaviourGame] Generalization probe scenario served:',
              data.scenario._id,
            );
          }

          setTrialStartTime(
            Date.now(),
          );

          // Gentle pacing reassurance only — NOT a hint toward a "correct"
          // answer, since there isn't one. Longer delay (8s) keeps things
          // unhurried.
          hintTimer.current =
            setTimeout(() => {
              setHintShown(true);
            }, 8000);

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        } catch (e) {
          console.log(
            'Load scenario failed:',
            e?.message,
          );
        } finally {
          setLoading(false);
        }
      },
      [childId, fadeAnim],
    );

  const handleChoice =
    async image => {
      if (
        selectedKey ||
        !scenario ||
        !sessionId
      ) {
        return;
      }

      if (hintTimer.current) {
        clearTimeout(
          hintTimer.current,
        );
      }

      const responseTimeMs =
        Date.now() -
        trialStartTime;

      setSelectedKey(
        image.assetKey,
      );

      // "isCorrect" on the image means "shows the encouraged/typical
      // behaviour" — recorded silently for the research signal, never
      // shown to the child as right/wrong.
      const localChosePositive =
        image.isCorrect;

      const classification =
        classifyTrial(
          localChosePositive,
          responseTimeMs,
        );

      const recordChoice = chosePositive => {
        setTrialClassifications(
          prev => [
            ...prev,
            classifyTrial(chosePositive, responseTimeMs),
          ],
        );

        setPreferenceChoices(
          prev => [
            ...prev,
            {
              scenarioId: scenario._id,
              chosePositiveBehaviour: chosePositive,
            },
          ],
        );

        if (scenario.isGeneralizationProbe) {
          setGeneralizationResults(
            prev => [
              ...prev,
              {
                scenarioId: scenario._id,
                isCorrect: chosePositive,
              },
            ],
          );
        }
      };

      try {
        const result =
          await submitBehaviourTrial({
            childId,
            sessionId,
            scenarioId:
              scenario._id,
            selectedAssetKey:
              image.assetKey,
            responseTimeMs,
            hintShown,
            attemptNumber: 1,
            trialClassification:
              classification,
            isGeneralizationProbe:
              !!scenario.isGeneralizationProbe,
          });

        const chosePositive =
          result.trial.isCorrect;

        recordChoice(chosePositive);

        setTrialsCompleted(
          n => n + 1,
        );

        setShowFeedback(
          true,
        );
      } catch (e) {
        console.log(
          'Submit trial failed:',
          e?.message,
        );

        recordChoice(localChosePositive);

        setTrialsCompleted(
          n => n + 1,
        );

        setShowFeedback(
          true,
        );
      }
    };

  const handleFeedbackDone =
    useCallback(() => {
      setShowFeedback(false);

      const nextTrialNumber =
        trialNumber + 1;

      if (
        nextTrialNumber >=
        TRIALS_PER_SESSION
      ) {
        router.replace({
          pathname:
            '/(games)/BehaviourResult',

          params: {
            sessionId:
              String(sessionId || ''),

            childName:
              String(childName),

            total:
              String(
                TRIALS_PER_SESSION,
              ),

            // Research payloads — encoded as JSON strings for navigation params.
            trialClassifications: JSON.stringify(
              trialClassifications,
            ),

            preferenceChoices: JSON.stringify(
              preferenceChoices,
            ),

            generalizationResults: JSON.stringify(
              generalizationResults,
            ),
          },
        });

        return;
      }

      setTrialNumber(
        nextTrialNumber,
      );

      const newShownIds = [
        ...shownIds,
        scenario?._id,
      ].filter(Boolean);

      setShownIds(
        newShownIds,
      );

      loadNextScenario(
        newShownIds,
        difficulty,
      );
    }, [
      trialNumber,
      sessionId,
      childName,
      shownIds,
      scenario,
      difficulty,
      loadNextScenario,
      trialClassifications,
      preferenceChoices,
      generalizationResults,
    ]);

  if (!childId) {
    return (
      <View
        style={s.loadingWrap}
      >
        <Ionicons
          name="person-outline"
          size={48}
          color={C.teal}
        />

        <Text style={s.loadingTxt}>
          {t('behaviourGame.selectChildTitle')}
        </Text>

        <TouchableOpacity
          style={s.backToDashboard}
          onPress={() =>
            router.replace(
              '/(tabs)/dashboard',
            )
          }
        >
          <Text
            style={
              s.backToDashboardText
            }
          >
            {t('back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (
    loading &&
    !scenario
  ) {
    return (
      <View
        style={s.loadingWrap}
      >
        <ActivityIndicator
          size="large"
          color={C.teal}
        />

        <Text style={s.loadingTxt}>
          {t('behaviourGame.gettingReady')}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={[
          C.heroA,
          C.heroB,
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={s.header}
      >
        <TouchableOpacity
          style={s.backBtn}
          onPress={() =>
            router.back()
          }
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <View
          style={
            s.headerCenter
          }
        >
          <Text
            style={
              s.headerTitle
            }
          >
            {t('behaviourGame.headerTitle')}
          </Text>
        </View>

        <TouchableOpacity
          style={s.infoBtn}
          onPress={() => setShowParentInfo(true)}
          accessibilityRole="button"
          accessibilityLabel={t('behaviourGame.infoA11yLabel')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="information-circle-outline"
            size={25}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      <View
        style={
          s.progressWrap
        }
      >
        <ProgressBar
          current={trialNumber}
          total={
            TRIALS_PER_SESSION
          }
        />
      </View>

      {/*
        No per-scenario question text — reading a different sentence every
        trial adds a comprehension burden many autistic children this age
        don't need for what is meant to be a simple, low-pressure picture
        choice. A single, unchanging instruction (shown once, always the
        same) is far easier to internalise than a new sentence every time.
      */}
      <View style={s.instructionWrap}>
        <Text style={s.instructionEn}>
          {t('behaviourGame.instruction')} 👆
        </Text>
      </View>

      {scenario && displayImages.length > 0 && (
        <Animated.View
          style={[
            s.choicesRow,
            { opacity: fadeAnim },
          ]}
        >
          {displayImages.map(
            img => (
              <ChoiceCard
                key={
                  img.assetKey
                }
                image={img}
                onPress={() =>
                  handleChoice(
                    img,
                  )
                }
                selected={
                  selectedKey ===
                  img.assetKey
                }
                disabled={
                  !!selectedKey
                }
              />
            ),
          )}
        </Animated.View>
      )}

      {hintShown &&
        !selectedKey && (
          <View
            style={
              s.hintBubble
            }
          >
            <Ionicons
              name="heart-outline"
              size={18}
              color={C.amber}
            />

            <Text
              style={s.hintTxt}
            >
              {t('behaviourGame.hint')} 🌟
            </Text>
          </View>
        )}

      <Modal
        visible={showParentInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowParentInfo(false)}
      >
        <View style={s.parentModalBackdrop}>
          <View style={s.parentModalCard}>
            <View style={s.parentModalTopRow}>
              <View style={s.parentModalIconWrap}>
                <Ionicons
                  name="information"
                  size={24}
                  color={C.tealDark}
                />
              </View>

              <TouchableOpacity
                style={s.parentModalClose}
                onPress={() => setShowParentInfo(false)}
                accessibilityRole="button"
                accessibilityLabel="Close parent information"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={C.inkMid}
                />
              </TouchableOpacity>
            </View>

            {/*
              This toggle is intentionally separate from the app-wide
              language — a parent may want to read this explanation in a
              different language than the child's app is currently set to.
              getTranslation(lang, key) pulls straight from the shared
              translation table for whichever language is picked here.
            */}
            <View style={s.languageSwitch}>
              {PARENT_INFO_LANGUAGES.map(({ code, label }) => (
                <TouchableOpacity
                  key={code}
                  style={[
                    s.languageSwitchBtn,
                    parentInfoLanguage === code && s.languageSwitchBtnActive,
                  ]}
                  onPress={() => setParentInfoLanguage(code)}
                >
                  <Text
                    style={[
                      s.languageSwitchText,
                      parentInfoLanguage === code && s.languageSwitchTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.parentModalTitle}>
              {getTranslation(parentInfoLanguage, 'behaviourGame.parentInfoTitle')}
            </Text>

            <Text style={s.parentModalBody}>
              {getTranslation(parentInfoLanguage, 'behaviourGame.parentInfoBody1')}
            </Text>

            <Text style={s.parentModalBody}>
              {getTranslation(parentInfoLanguage, 'behaviourGame.parentInfoBody2')}
            </Text>

            <View style={s.parentNoteBox}>
              <Ionicons
                name="heart-outline"
                size={19}
                color={C.tealDark}
              />
              <Text style={s.parentNoteText}>
                {getTranslation(parentInfoLanguage, 'behaviourGame.parentInfoNote')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <FeedbackOverlay
        visible={
          showFeedback
        }
        onDone={
          handleFeedbackDone
        }
      />

        <TouchableOpacity
  style={s.motherTipBtn}
  onPress={() => setShowMotherTip(true)}
  accessibilityRole="button"
  accessibilityLabel={t('behaviourGame.motherTipA11yLabel')}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
>
  <Ionicons
  name="woman-outline"
  size={24}
  color="#fff"
/>
</TouchableOpacity>

<Modal
  visible={showMotherTip}
  transparent
  animationType="fade"
  onRequestClose={() => setShowMotherTip(false)}
>
  <TouchableOpacity
    style={s.motherTipBackdrop}
    activeOpacity={1}
    onPress={() => setShowMotherTip(false)}
  >
    <View style={s.motherTipCard}>
      <View style={s.motherTipIconWrap}>
        <Ionicons
  name="person-circle-outline"
  size={26}
  color="#fff"
/>
      </View>

      <Text style={s.motherTipText}>
        {t('behaviourGame.motherTipMessage')}
      </Text>

      <TouchableOpacity
        style={s.motherTipCloseBtn}
        onPress={() => setShowMotherTip(false)}
      >
        <Text style={s.motherTipCloseText}>
          {t('behaviourGame.gotIt')}
        </Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
    gap: 12,
    paddingHorizontal: 24,
  },

  loadingTxt: {
    fontSize: 17,
    color: C.inkMid,
    fontWeight: '600',
    textAlign: 'center',
  },

  backToDashboard: {
    marginTop: 12,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: C.teal,
  },

  backToDashboardText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  header: {
    paddingTop:
      Platform.OS === 'ios'
        ? 56
        : 44,

    paddingBottom: 18,

    paddingHorizontal:
      H_PAD,

    flexDirection: 'row',
    alignItems: 'center',

    ...shadow(10, '#000', 0.12),
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor:
      'rgba(255,255,255,0.2)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  infoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },

  parentModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,26,22,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  parentModalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: C.warmWhite,
    borderRadius: 28,
    padding: 22,
    ...shadow(18, '#000', 0.16),
  },

  parentModalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  parentModalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  parentModalClose: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.bgDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },

  languageSwitch: {
    flexDirection: 'row',
    backgroundColor: C.bgDeep,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },

  languageSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  languageSwitchBtnActive: {
    backgroundColor: C.teal,
  },

  languageSwitchText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.inkSoft,
  },

  languageSwitchTextActive: {
    color: '#fff',
  },

  parentModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 12,
  },

  parentModalBody: {
    fontSize: 15,
    lineHeight: 23,
    color: C.inkMid,
    marginBottom: 12,
  },

  parentNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: C.tealLight,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 4,
  },

  parentNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.tealDark,
  },

  progressWrap: {
    paddingHorizontal:
      H_PAD,
    paddingTop: 16,
    paddingBottom: 4,
  },

  instructionWrap: {
    marginHorizontal:
      H_PAD,
    marginTop: 18,
    alignItems: 'center',
  },

  instructionEn: {
    fontSize: 20,
    fontWeight: '800',
    color: C.ink,
    textAlign: 'center',
  },

  choicesRow: {
    flexDirection: 'column',
    gap: 18,
    marginHorizontal: H_PAD,
    marginTop: 20,
    alignItems: 'center',
  },

  hintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

    backgroundColor:
      C.amberLight,

    marginHorizontal:
      H_PAD,

    marginTop: 14,

    borderRadius: 18,

    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  hintTxt: {
    fontSize: 14,
    color: C.inkMid,
    fontWeight: '600',
    flexShrink: 1,
  },
motherTipBtn: {
  position: 'absolute',
  left: H_PAD,
  bottom: 24,

  width: 48,
  height: 48,
  borderRadius: 24,

  backgroundColor: C.teal,

  justifyContent: 'center',
  alignItems: 'center',

  ...shadow(12, '#000', 0.18),
},

motherTipBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(30,26,22,0.45)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 28,
},

motherTipCard: {
  width: '100%',
  maxWidth: 420,
  backgroundColor: C.warmWhite,
  borderRadius: 24,
  padding: 22,
  alignItems: 'center',
  ...shadow(18, '#000', 0.16),
},

motherTipIconWrap: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: C.tealLight,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,
},

motherTipText: {
  fontSize: 15,
  lineHeight: 22,
  color: C.inkMid,
  textAlign: 'center',
  marginBottom: 18,
},

motherTipCloseBtn: {
  backgroundColor: C.teal,
  borderRadius: 16,
  paddingHorizontal: 28,
  paddingVertical: 12,
},

motherTipCloseText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '700',
},

});