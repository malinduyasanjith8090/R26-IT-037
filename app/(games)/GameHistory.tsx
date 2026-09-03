import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useLanguage } from '../../context/LanguageContext';

const { width: SW } = Dimensions.get('window');

const H_PAD = 20;
const CARD_RADIUS = 28;

const C = {
  bg: '#F7F3EE',
  sandLight: '#E8DFD3',
  warmWhite: '#FFFCF8',

  ink: '#1C1610',
  inkMid: '#4A3F35',
  inkFaint: '#A89E96',

  teal: '#2BBFA4',
  tealLight: '#D0F5EE',
  tealDark: '#1A8C79',

  coral: '#FF6B4A',
  coralLight: '#FFE8E2',

  amber: '#F5A623',
  amberLight: '#FFF0D0',

  plum: '#7B5EA7',
  plumLight: '#EDE5F7',

  sky: '#4A9FD4',

  heroA: '#2BBFA4',
  heroB: '#1A7FA8',
  heroC: '#0F4F7A',
};

const shadow = (depth = 8) =>
  Platform.select({
    web: {
      boxShadow: `0 ${depth}px ${depth * 2.5}px rgba(0,0,0,0.07)`,
    },

    default: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: depth,
      shadowOffset: {
        width: 0,
        height: depth / 2,
      },
      elevation: Math.round(depth / 2),
    },
  });

const CLASSIFICATION_META = {
  mastered: {
    color: '#2BBFA4',
    icon: 'checkmark-circle',
  },

  uncertain_but_correct: {
    color: '#4A9FD4',
    icon: 'time-outline',
  },

  impulsive: {
    color: '#F5A623',
    icon: 'flash-outline',
  },

  confused: {
    color: '#FF6B4A',
    icon: 'help-circle-outline',
  },
};

// ---------------------------------------------------------------------------
// DUMMY DATA — weak-performing student "Ben"
// Replace this block with the real API call when wiring back to
// getBehaviourSessionSummary(sessionId).
// ---------------------------------------------------------------------------

const CHILD_NAME = 'Ben';

const DUMMY_SUMMARY = {
  totalTrials: 20,
  correctTrials: 8,
  accuracy: 40, // <60 -> "try more" / coral gradient / 1 star
  avgResponseTimeMs: 5400, // slow responses
  categoryBreakdown: [
    { category: 'greeting', total: 5, correct: 2, accuracy: 40 },
    { category: 'sharing', total: 5, correct: 1, accuracy: 20 },
    { category: 'turn_taking', total: 5, correct: 3, accuracy: 60 },
    { category: 'eye_contact', total: 5, correct: 2, accuracy: 40 },
  ],
};

// One entry per trial, matching totalTrials (20), skewed toward
// "confused" and "impulsive" to reflect weak performance.
const DUMMY_TRIAL_CLASSIFICATIONS = [
  'confused', 'confused', 'impulsive', 'confused', 'mastered',
  'impulsive', 'confused', 'uncertain_but_correct', 'confused', 'impulsive',
  'confused', 'mastered', 'impulsive', 'confused', 'confused',
  'uncertain_but_correct', 'impulsive', 'confused', 'confused', 'impulsive',
];

const DUMMY_GENERALIZATION_RESULTS = [
  { scenario: 'new_playground', isCorrect: false },
  { scenario: 'new_classmate', isCorrect: true },
  { scenario: 'new_snack_time', isCorrect: false },
  { scenario: 'new_lineup', isCorrect: false },
  { scenario: 'new_group_activity', isCorrect: false },
];

// ---------------------------------------------------------------------------

function AnimCount({
  target,
  suffix = '',
}: {
  target: number;
  suffix?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Number.isFinite(target) ? target : 0,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    const id = anim.addListener(({ value }) => {
      setDisplay(Math.round(value).toString());
    });

    return () => anim.removeListener(id);
  }, [target, anim]);

  return (
    <Text>
      {display}
      {suffix}
    </Text>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'center',
        marginVertical: 12,
      }}
    >
      {[1, 2, 3].map(i => (
        <Animated.Text key={i} style={{ fontSize: 36 }}>
          {i <= count ? '⭐' : '☆'}
        </Animated.Text>
      ))}
    </View>
  );
}

function CategoryRow({
  category,
  accuracy,
  total,
  correct,
}: {
  category: string;
  accuracy: number;
  total: number;
  correct: number;
}) {
  const { t } = useLanguage();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: accuracy / 100,
      duration: 1000,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [accuracy, anim]);

  const color =
    accuracy >= 80 ? C.teal : accuracy >= 60 ? C.amber : C.coral;

  const label = String(category)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <View style={cr.row}>
      <View style={cr.rowTop}>
        <Text style={cr.label}>{label}</Text>
        <Text style={[cr.pct, { color }]}>{accuracy}%</Text>
      </View>

      <View style={cr.track}>
        <Animated.View
          style={[
            cr.fill,
            {
              backgroundColor: color,
              width: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={cr.sub}>
        {t('behaviourResult.correctOfTotal', { correct, total })}
      </Text>
    </View>
  );
}

const cr = StyleSheet.create({
  row: { marginBottom: 16 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#4A3F35' },
  pct: { fontSize: 13, fontWeight: '700' },
  track: {
    height: 8,
    backgroundColor: '#E8DFD3',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: { height: 8, borderRadius: 8 },
  sub: { fontSize: 11, color: '#A89E96' },
});

function ClassificationRow({
  type,
  count,
  totalTrials,
}: {
  type: string;
  count: number;
  totalTrials: number;
}) {
  const { t } = useLanguage();

  const meta =
    CLASSIFICATION_META[type as keyof typeof CLASSIFICATION_META] || {
      color: C.inkFaint,
      icon: 'ellipse-outline',
    };

  const label = t(`behaviourResult.classification.${type}`);

  const pct =
    totalTrials > 0 ? Math.round((count / totalTrials) * 100) : 0;

  return (
    <View style={clr.row}>
      <View
        style={[clr.iconWrap, { backgroundColor: `${meta.color}22` }]}
      >
        <Ionicons name={meta.icon as any} size={18} color={meta.color} />
      </View>

      <View style={clr.textWrap}>
        <Text style={clr.label}>{label}</Text>
      </View>

      <Text style={[clr.count, { color: meta.color }]}>
        {count} · {pct}%
      </Text>
    </View>
  );
}

const clr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: '#1C1610' },
  count: { fontSize: 14, fontWeight: '800' },
});

// ---------------------------------------------------------------------------
// MAIN SCREEN (DEMO — dummy data, no network call)
// ---------------------------------------------------------------------------

export default function BehaviourResultDemoScreen() {
  const { t } = useLanguage();

  const childName = CHILD_NAME;
  const summary = DUMMY_SUMMARY;
  const trialClassifications = DUMMY_TRIAL_CLASSIFICATIONS;
  const generalizationResults = DUMMY_GENERALIZATION_RESULTS;

  const classificationCounts = trialClassifications.reduce(
    (acc: Record<string, number>, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {},
  );

  const generalizationCorrectCount = generalizationResults.filter(
    g => g.isCorrect,
  ).length;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalTrials = summary.totalTrials;
  const correctTrials = summary.correctTrials;
  const accuracy = summary.accuracy;
  const avgResponseTimeMs = summary.avgResponseTimeMs;

  const starCount = accuracy >= 85 ? 3 : accuracy >= 60 ? 2 : 1;

  const getMessage = () => {
    if (accuracy >= 85) return t('behaviourResult.msgGreat');
    if (accuracy >= 60) return t('behaviourResult.msgGood');
    return t('behaviourResult.msgTryMore');
  };

  const msg = getMessage();

  const gradColors =
    accuracy >= 85
      ? [C.heroA, C.heroB, C.heroC]
      : accuracy >= 60
        ? ['#F5A623', '#E8821A', '#C4600F']
        : ['#FF6B4A', '#E04A2A', '#C03010'];

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <LinearGradient
            colors={gradColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroCard}
          >
            <View style={s.heroBubble1} />
            <View style={s.heroBubble2} />

            {childName ? (
              <Text style={s.childName}>{childName}</Text>
            ) : null}

            <Stars count={starCount} />

            <Text style={s.msgEn}>{msg}</Text>

            <View style={s.heroStats}>
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>
                  <AnimCount target={accuracy} suffix="%" />
                </Text>
                <Text style={s.heroStatLabel}>{t('accuracy')}</Text>
              </View>

              <View style={s.heroStatDivider} />

              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>
                  <AnimCount target={correctTrials} />/{totalTrials}
                </Text>
                <Text style={s.heroStatLabel}>
                  {t('behaviourResult.correct')}
                </Text>
              </View>

              <View style={s.heroStatDivider} />

              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>
                  {avgResponseTimeMs > 0
                    ? `${(avgResponseTimeMs / 1000).toFixed(1)}s`
                    : '--'}
                </Text>
                <Text style={s.heroStatLabel}>
                  {t('behaviourResult.avgTime')}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {summary.categoryBreakdown?.length > 0 && (
          <Animated.View style={[s.panel, { opacity: fadeAnim }]}>
            <View style={s.secHead}>
              <View style={[s.secAccent, { backgroundColor: C.teal }]} />
              <View>
                <Text style={s.secTitle}>
                  {t('behaviourResult.categoryBreakdown')}
                </Text>
                <Text style={s.secSub}>
                  {t('behaviourResult.categoryBreakdownSub')}
                </Text>
              </View>
            </View>

            {summary.categoryBreakdown.map(cat => (
              <CategoryRow
                key={cat.category}
                category={cat.category}
                accuracy={cat.accuracy}
                total={cat.total}
                correct={cat.correct}
              />
            ))}
          </Animated.View>
        )}

        {trialClassifications.length > 0 && (
          <Animated.View style={[s.panel, { opacity: fadeAnim }]}>
            <View style={s.secHead}>
              <View style={[s.secAccent, { backgroundColor: C.plum }]} />
              <View>
                <Text style={s.secTitle}>
                  {childName
                    ? t('behaviourResult.howResponded', { childName })
                    : t('behaviourResult.howRespondedGeneric')}
                </Text>
                <Text style={s.secSub}>
                  {t('behaviourResult.responsePattern')}
                </Text>
              </View>
            </View>

            {Object.keys(CLASSIFICATION_META).map(type => (
              <ClassificationRow
                key={type}
                type={type}
                count={classificationCounts[type] || 0}
                totalTrials={trialClassifications.length}
              />
            ))}
          </Animated.View>
        )}

        {generalizationResults.length > 0 && (
          <Animated.View style={[s.panel, { opacity: fadeAnim }]}>
            <View style={s.secHead}>
              <View style={[s.secAccent, { backgroundColor: C.sky }]} />
              <View>
                <Text style={s.secTitle}>
                  {t('behaviourResult.newSituationCheck')}
                </Text>
                <Text style={s.secSub}>
                  {t('behaviourResult.newSituationCheckSub')}
                </Text>
              </View>
            </View>

            <Text style={s.genBody}>
              {t('behaviourResult.generalizationBody', {
                correct: generalizationCorrectCount,
                total: generalizationResults.length,
                childPhrase: childName
                  ? t('behaviourResult.childHadntPracticed', { childName })
                  : t('behaviourResult.genericHadntPracticed'),
              })}
            </Text>
          </Animated.View>
        )}

        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={[C.amber, C.coral]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.encCard}
          >
            <View style={s.encBubble} />
            <Text style={s.encTitle}>
              {t('behaviourResult.keepPractising')}
            </Text>
            <Text style={s.encBody}>
              {t('behaviourResult.encouragementBody')}
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[s.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={s.btnPrimary}
            activeOpacity={0.85}
            onPress={() => router.replace('/(games)/BehaviourGame')}
          >
            <LinearGradient
              colors={[C.heroA, C.heroB]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.btnGrad}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={s.btnPrimaryTxt}>
                {t('behaviourResult.playAgain')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnSecondary}
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)/dashboard')}
          >
            <Ionicons name="home-outline" size={20} color={C.teal} />
            <Text style={s.btnSecondaryTxt}>
              {t('behaviourResult.backToDashboard')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 16 },

  heroCard: {
    marginHorizontal: H_PAD,
    marginTop: Platform.OS === 'ios' ? 56 : 44,
    borderRadius: CARD_RADIUS,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    ...shadow(20),
  },

  heroBubble1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -30,
  },

  heroBubble2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: 40,
  },

  childName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  msgEn: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  heroStats: {
    flexDirection: 'row',
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },

  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 3,
  },

  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 4,
  },

  panel: {
    backgroundColor: C.warmWhite,
    marginHorizontal: H_PAD,
    marginTop: 14,
    borderRadius: CARD_RADIUS,
    padding: 20,
    ...shadow(8),
  },

  secHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },

  secAccent: { width: 4, height: 22, borderRadius: 2 },
  secTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
  secSub: { fontSize: 11, color: C.inkFaint, marginTop: 1 },
  genBody: { fontSize: 13, color: C.inkMid, lineHeight: 20 },

  encCard: {
    marginHorizontal: H_PAD,
    marginTop: 14,
    borderRadius: CARD_RADIUS,
    padding: 22,
    overflow: 'hidden',
    ...shadow(12),
  },

  encBubble: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    right: -30,
  },

  encTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  encBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },

  actions: { marginHorizontal: H_PAD, marginTop: 16, gap: 12 },

  btnPrimary: { borderRadius: 20, overflow: 'hidden', ...shadow(10) },
  btnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  btnPrimaryTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },

  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: C.tealLight,
    ...shadow(4),
  },
  btnSecondaryTxt: { color: C.teal, fontSize: 16, fontWeight: '700' },
});