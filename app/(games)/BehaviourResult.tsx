import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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

import {
  getBehaviourSessionSummary,
} from '../../services/apiService';

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

// ---------------------------------------------------------------------------
// RESEARCH LABELS
// ---------------------------------------------------------------------------

const CLASSIFICATION_META = {
  mastered: {
    label: 'Confident & Correct',
    si: 'විශ්වාසයෙන් නිවැරදි',
    color: '#2BBFA4',
    icon: 'checkmark-circle',
  },

  uncertain_but_correct: {
    label: 'Got There, Took Time',
    si: 'නිවැරදියි, කල් ගත විය',
    color: '#4A9FD4',
    icon: 'time-outline',
  },

  impulsive: {
    label: 'Quick Tap, Worth Revisiting',
    si: 'ඉක්මන් තේරීමක්',
    color: '#F5A623',
    icon: 'flash-outline',
  },

  confused: {
    label: 'Needs More Practice',
    si: 'තව පුහුණුවක් අවශ්‍යයි',
    color: '#FF6B4A',
    icon: 'help-circle-outline',
  },
};

function AnimCount({
  target,
  suffix = '',
}: {
  target: number;
  suffix?: string;
}) {
  const anim = useRef(
    new Animated.Value(0),
  ).current;

  const [display, setDisplay] =
    useState('0');

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Number.isFinite(target)
        ? target
        : 0,

      duration: 1200,

      easing: Easing.out(Easing.exp),

      useNativeDriver: false,
    }).start();

    const id = anim.addListener(
      ({ value }) => {
        setDisplay(
          Math.round(value).toString(),
        );
      },
    );

    return () =>
      anim.removeListener(id);
  }, [target, anim]);

  return (
    <Text>
      {display}
      {suffix}
    </Text>
  );
}

function Stars({
  count,
}: {
  count: number;
}) {
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
        <Animated.Text
          key={i}
          style={{
            fontSize: 36,
          }}
        >
          {i <= count
            ? '⭐'
            : '☆'}
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
  const anim = useRef(
    new Animated.Value(0),
  ).current;

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
    accuracy >= 80
      ? C.teal
      : accuracy >= 60
        ? C.amber
        : C.coral;

  const label =
    String(category)
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        l => l.toUpperCase(),
      );

  return (
    <View style={cr.row}>
      <View style={cr.rowTop}>
        <Text style={cr.label}>
          {label}
        </Text>

        <Text
          style={[
            cr.pct,
            { color },
          ]}
        >
          {accuracy}%
        </Text>
      </View>

      <View style={cr.track}>
        <Animated.View
          style={[
            cr.fill,
            {
              backgroundColor: color,

              width:
                anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    '0%',
                    '100%',
                  ],
                }),
            },
          ]}
        />
      </View>

      <Text style={cr.sub}>
        {correct}/{total} correct
      </Text>
    </View>
  );
}

const cr = StyleSheet.create({
  row: {
    marginBottom: 16,
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3F35',
  },

  pct: {
    fontSize: 13,
    fontWeight: '700',
  },

  track: {
    height: 8,
    backgroundColor: '#E8DFD3',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },

  fill: {
    height: 8,
    borderRadius: 8,
  },

  sub: {
    fontSize: 11,
    color: '#A89E96',
  },
});

// ---------------------------------------------------------------------------
// TRIAL CLASSIFICATION ROW
// ---------------------------------------------------------------------------

function ClassificationRow({
  type,
  count,
  totalTrials,
}: {
  type: string;
  count: number;
  totalTrials: number;
}) {
  const meta =
    CLASSIFICATION_META[
      type as keyof typeof CLASSIFICATION_META
    ] || {
      label: type,
      si: '',
      color: C.inkFaint,
      icon: 'ellipse-outline',
    };

  const pct =
    totalTrials > 0
      ? Math.round(
          (count / totalTrials) * 100,
        )
      : 0;

  return (
    <View style={clr.row}>
      <View
        style={[
          clr.iconWrap,
          {
            backgroundColor:
              `${meta.color}22`,
          },
        ]}
      >
        <Ionicons
          name={meta.icon as any}
          size={18}
          color={meta.color}
        />
      </View>

      <View style={clr.textWrap}>
        <Text style={clr.label}>
          {meta.label}
        </Text>

        <Text style={clr.si}>
          {meta.si}
        </Text>
      </View>

      <Text
        style={[
          clr.count,
          {
            color: meta.color,
          },
        ]}
      >
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

  textWrap: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1610',
  },

  si: {
    fontSize: 11,
    color: '#A89E96',
    marginTop: 1,
  },

  count: {
    fontSize: 14,
    fontWeight: '800',
  },
});

// ---------------------------------------------------------------------------
// MAIN SCREEN
// ---------------------------------------------------------------------------

export default function BehaviourResultScreen() {
  const params =
    useLocalSearchParams();

  const sessionId =
    Array.isArray(params.sessionId)
      ? params.sessionId[0]
      : params.sessionId;

  const childName =
    Array.isArray(params.childName)
      ? params.childName[0]
      : params.childName || '';

  // -------------------------------------------------------------------------
  // RESEARCH PARAMS
  // -------------------------------------------------------------------------

  const trialClassifications =
    (() => {
      try {
        const raw =
          Array.isArray(
            params.trialClassifications,
          )
            ? params.trialClassifications[0]
            : params.trialClassifications;

        const parsed = raw
          ? JSON.parse(raw)
          : [];

        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch {
        return [];
      }
    })();

  const generalizationResults =
    (() => {
      try {
        const raw =
          Array.isArray(
            params.generalizationResults,
          )
            ? params.generalizationResults[0]
            : params.generalizationResults;

        const parsed = raw
          ? JSON.parse(raw)
          : [];

        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch {
        return [];
      }
    })();

  const classificationCounts =
    trialClassifications.reduce(
      (
        acc: Record<string, number>,
        type: string,
      ) => {
        acc[type] =
          (acc[type] || 0) + 1;

        return acc;
      },
      {},
    );

  const generalizationCorrectCount =
    generalizationResults.filter(
      g => g.isCorrect,
    ).length;

  // -------------------------------------------------------------------------
  // REAL BACKEND SESSION SUMMARY
  // -------------------------------------------------------------------------

  const [
    summary,
    setSummary,
  ] = useState<any>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(false);

  const fadeAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  const scaleAnim =
    useRef(
      new Animated.Value(0.8),
    ).current;

  const loadSummary =
    async () => {
      setLoading(true);
      setError(false);

      try {
        if (!sessionId) {
          throw new Error(
            'No session ID',
          );
        }

        const data =
          await getBehaviourSessionSummary(
            sessionId,
          );

        if (
          !data ||
          typeof data !== 'object'
        ) {
          throw new Error(
            'Invalid session summary',
          );
        }

        setSummary(data);
      } catch (e) {
        console.log(
          'Load summary failed:',
          e?.message,
        );

        setSummary(null);
        setError(true);
      } finally {
        setLoading(false);

        Animated.parallel([
          Animated.timing(
            fadeAnim,
            {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            },
          ),

          Animated.spring(
            scaleAnim,
            {
              toValue: 1,
              friction: 8,
              useNativeDriver: true,
            },
          ),
        ]).start();
      }
    };

  useEffect(() => {
    loadSummary();
  }, [sessionId]);

  // -------------------------------------------------------------------------
  // IMPORTANT:
  // All headline statistics come ONLY from the backend.
  // No old score/total fallback is used.
  // -------------------------------------------------------------------------

  const totalTrials =
    Number(summary?.totalTrials) || 0;

  const correctTrials =
    Number(summary?.correctTrials) || 0;

  const accuracy =
    Number(summary?.accuracy) || 0;

  const avgResponseTimeMs =
    Number(
      summary?.avgResponseTimeMs,
    ) || 0;

  const starCount =
    accuracy >= 85
      ? 3
      : accuracy >= 60
        ? 2
        : 1;

  const getMessage = () => {
    if (accuracy >= 85) {
      return {
        en: 'Fantastic! 🌟',
        si: 'අති විශිෂ්ටයි!',
      };
    }

    if (accuracy >= 60) {
      return {
        en: 'Good job! Keep going!',
        si: 'හොඳ වැඩ! ඉදිරියට!',
      };
    }

    return {
      en: 'Nice try! Practice more 💛',
      si: 'හොඳ උත්සාහයක්!',
    };
  };

  const msg = getMessage();

  const gradColors =
    accuracy >= 85
      ? [
          C.heroA,
          C.heroB,
          C.heroC,
        ]
      : accuracy >= 60
        ? [
            '#F5A623',
            '#E8821A',
            '#C4600F',
          ]
        : [
            '#FF6B4A',
            '#E04A2A',
            '#C03010',
          ];

  // -------------------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={s.centerScreen}>
        <Ionicons
          name="sync-outline"
          size={42}
          color={C.teal}
        />

        <Text style={s.loadingTitle}>
          Loading results...
        </Text>

        <Text style={s.loadingSi}>
          ප්‍රතිඵල ලබාගනිමින්...
        </Text>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // ERROR STATE
  // -------------------------------------------------------------------------

  if (error || !summary) {
    return (
      <View style={s.centerScreen}>
        <Ionicons
          name="alert-circle-outline"
          size={52}
          color={C.coral}
        />

        <Text style={s.errorTitle}>
          Unable to load results
        </Text>

        <Text style={s.errorBody}>
          The session results could not
          be loaded from the server.
        </Text>

        <Text style={s.errorSi}>
          ප්‍රතිඵල ලබාගැනීමට නොහැකි විය.
        </Text>

        <TouchableOpacity
          style={s.retryButton}
          onPress={loadSummary}
          activeOpacity={0.85}
        >
          <Ionicons
            name="refresh"
            size={20}
            color="#fff"
          />

          <Text style={s.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.backButton}
          onPress={() =>
            router.replace(
              '/(tabs)/dashboard',
            )
          }
          activeOpacity={0.85}
        >
          <Text style={s.backText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // REAL RESULTS UI
  // -------------------------------------------------------------------------

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          s.scroll
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                scale: scaleAnim,
              },
            ],
          }}
        >
          <LinearGradient
            colors={gradColors}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={s.heroCard}
          >
            <View
              style={
                s.heroBubble1
              }
            />

            <View
              style={
                s.heroBubble2
              }
            />

            {childName ? (
              <Text
                style={
                  s.childName
                }
              >
                {childName}
              </Text>
            ) : null}

            <Stars
              count={starCount}
            />

            <Text
              style={s.msgEn}
            >
              {msg.en}
            </Text>

            <Text
              style={s.msgSi}
            >
              {msg.si}
            </Text>

            <View
              style={
                s.heroStats
              }
            >
              {/* ACCURACY */}
              <View
                style={
                  s.heroStat
                }
              >
                <Text
                  style={
                    s.heroStatVal
                  }
                >
                  <AnimCount
                    target={
                      accuracy
                    }
                    suffix="%"
                  />
                </Text>

                <Text
                  style={
                    s.heroStatLabel
                  }
                >
                  Accuracy
                </Text>
              </View>

              <View
                style={
                  s.heroStatDivider
                }
              />

              {/* CORRECT / TOTAL */}
              <View
                style={
                  s.heroStat
                }
              >
                <Text
                  style={
                    s.heroStatVal
                  }
                >
                  <AnimCount
                    target={
                      correctTrials
                    }
                  />
                  /{totalTrials}
                </Text>

                <Text
                  style={
                    s.heroStatLabel
                  }
                >
                  Correct
                </Text>
              </View>

              <View
                style={
                  s.heroStatDivider
                }
              />

              {/* RESPONSE TIME */}
              <View
                style={
                  s.heroStat
                }
              >
                <Text
                  style={
                    s.heroStatVal
                  }
                >
                  {avgResponseTimeMs >
                  0
                    ? `${(
                        avgResponseTimeMs /
                        1000
                      ).toFixed(1)}s`
                    : '--'}
                </Text>

                <Text
                  style={
                    s.heroStatLabel
                  }
                >
                  Avg Time
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* CATEGORY BREAKDOWN */}

        {summary.categoryBreakdown
          ?.length > 0 && (
          <Animated.View
            style={[
              s.panel,
              {
                opacity:
                  fadeAnim,
              },
            ]}
          >
            <View
              style={
                s.secHead
              }
            >
              <View
                style={[
                  s.secAccent,
                  {
                    backgroundColor:
                      C.teal,
                  },
                ]}
              />

              <View>
                <Text
                  style={
                    s.secTitle
                  }
                >
                  Category Breakdown
                </Text>

                <Text
                  style={
                    s.secSub
                  }
                >
                  කාණ්ඩ අනුව ප්‍රතිඵල
                </Text>
              </View>
            </View>

            {summary.categoryBreakdown.map(
              cat => (
                <CategoryRow
                  key={
                    cat.category
                  }
                  category={
                    cat.category
                  }
                  accuracy={
                    cat.accuracy
                  }
                  total={
                    cat.total
                  }
                  correct={
                    cat.correct
                  }
                />
              ),
            )}
          </Animated.View>
        )}

        {/* RESEARCH: TRIAL CLASSIFICATION */}

        {trialClassifications.length >
          0 && (
          <Animated.View
            style={[
              s.panel,
              {
                opacity:
                  fadeAnim,
              },
            ]}
          >
            <View
              style={
                s.secHead
              }
            >
              <View
                style={[
                  s.secAccent,
                  {
                    backgroundColor:
                      C.plum,
                  },
                ]}
              />

              <View>
                <Text
                  style={
                    s.secTitle
                  }
                >
                  {childName
                    ? `How ${childName} Responded`
                    : 'How the Child Responded'}
                </Text>

                <Text
                  style={
                    s.secSub
                  }
                >
                  Response pattern
                  this session
                </Text>
              </View>
            </View>

            {Object.keys(
              CLASSIFICATION_META,
            ).map(type => (
              <ClassificationRow
                key={type}
                type={type}
                count={
                  classificationCounts[
                    type
                  ] || 0
                }
                totalTrials={
                  trialClassifications.length
                }
              />
            ))}
          </Animated.View>
        )}

        {/* RESEARCH: GENERALIZATION */}

        {generalizationResults.length >
          0 && (
          <Animated.View
            style={[
              s.panel,
              {
                opacity:
                  fadeAnim,
              },
            ]}
          >
            <View
              style={
                s.secHead
              }
            >
              <View
                style={[
                  s.secAccent,
                  {
                    backgroundColor:
                      C.sky,
                  },
                ]}
              />

              <View>
                <Text
                  style={
                    s.secTitle
                  }
                >
                  New Situation Check
                </Text>

                <Text
                  style={
                    s.secSub
                  }
                >
                  නව අවස්ථාවක්
                  හඳුනාගැනීම
                </Text>
              </View>
            </View>

            <Text
              style={
                s.genBody
              }
            >
              {generalizationCorrectCount}/
              {generalizationResults.length}{' '}
              correct on a
              scenario{' '}
              {childName
                ? `${childName} hadn't practiced`
                : "the child hadn't practiced"}{' '}
              before — a good sign of
              understanding the idea,
              not just memorising a
              picture.
            </Text>
          </Animated.View>
        )}

        {/* ENCOURAGEMENT */}

        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
        >
          <LinearGradient
            colors={[
              C.amber,
              C.coral,
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={
              s.encCard
            }
          >
            <View
              style={
                s.encBubble
              }
            />

            <Text
              style={
                s.encTitle
              }
            >
              Keep practising! 💪
            </Text>

            <Text
              style={
                s.encBody
              }
            >
              Every game builds
              your child's social
              understanding.
              {'\n'}
              දිනෙන් දින දරුවා
              වර්ධනය වෙයි.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* ACTIONS */}

        <Animated.View
          style={[
            s.actions,
            {
              opacity:
                fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={
              s.btnPrimary
            }
            activeOpacity={0.85}
            onPress={() =>
              router.replace(
                '/(games)/BehaviourGame',
              )
            }
          >
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
                y: 0,
              }}
              style={
                s.btnGrad
              }
            >
              <Ionicons
                name="refresh"
                size={20}
                color="#fff"
              />

              <Text
                style={
                  s.btnPrimaryTxt
                }
              >
                Play Again
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              s.btnSecondary
            }
            activeOpacity={0.85}
            onPress={() =>
              router.replace(
                '/(tabs)/dashboard',
              )
            }
          >
            <Ionicons
              name="home-outline"
              size={20}
              color={C.teal}
            />

            <Text
              style={
                s.btnSecondaryTxt
              }
            >
              Back to Dashboard
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View
          style={{
            height: 32,
          }}
        />
      </ScrollView>
    </View>
  );
}

const s =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.bg,
    },

    scroll: {
      paddingBottom: 16,
    },

    // -----------------------------------------------------------------------
    // LOADING / ERROR
    // -----------------------------------------------------------------------

    centerScreen: {
      flex: 1,
      backgroundColor: C.bg,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },

    loadingTitle: {
      marginTop: 16,
      fontSize: 19,
      fontWeight: '800',
      color: C.ink,
      textAlign: 'center',
    },

    loadingSi: {
      marginTop: 6,
      fontSize: 13,
      color: C.inkFaint,
      textAlign: 'center',
    },

    errorTitle: {
      marginTop: 16,
      fontSize: 21,
      fontWeight: '800',
      color: C.ink,
      textAlign: 'center',
    },

    errorBody: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 21,
      color: C.inkMid,
      textAlign: 'center',
    },

    errorSi: {
      marginTop: 6,
      fontSize: 13,
      color: C.inkFaint,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      paddingHorizontal: 28,
      paddingVertical: 15,
      borderRadius: 18,
      backgroundColor: C.teal,
      ...shadow(8),
    },

    retryText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },

    backButton: {
      marginTop: 12,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 18,
      backgroundColor: C.tealLight,
    },

    backText: {
      color: C.teal,
      fontSize: 15,
      fontWeight: '700',
    },

    // -----------------------------------------------------------------------
    // HERO
    // -----------------------------------------------------------------------

    heroCard: {
      marginHorizontal: H_PAD,

      marginTop:
        Platform.OS === 'ios'
          ? 56
          : 44,

      borderRadius:
        CARD_RADIUS,

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
      backgroundColor:
        'rgba(255,255,255,0.07)',
      top: -40,
      right: -30,
    },

    heroBubble2: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor:
        'rgba(255,255,255,0.05)',
      bottom: -20,
      left: 40,
    },

    childName: {
      color:
        'rgba(255,255,255,0.8)',
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

    msgSi: {
      color:
        'rgba(255,255,255,0.8)',
      fontSize: 14,
      marginTop: 6,
    },

    heroStats: {
      flexDirection: 'row',
      marginTop: 22,
      backgroundColor:
        'rgba(255,255,255,0.15)',
      borderRadius: 18,
      padding: 14,
      gap: 4,
    },

    heroStat: {
      flex: 1,
      alignItems: 'center',
    },

    heroStatVal: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
    },

    heroStatLabel: {
      color:
        'rgba(255,255,255,0.75)',
      fontSize: 11,
      marginTop: 3,
    },

    heroStatDivider: {
      width: 1,
      backgroundColor:
        'rgba(255,255,255,0.25)',
      marginHorizontal: 4,
    },

    // -----------------------------------------------------------------------
    // PANELS
    // -----------------------------------------------------------------------

    panel: {
      backgroundColor:
        C.warmWhite,

      marginHorizontal:
        H_PAD,

      marginTop: 14,

      borderRadius:
        CARD_RADIUS,

      padding: 20,

      ...shadow(8),
    },

    secHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },

    secAccent: {
      width: 4,
      height: 22,
      borderRadius: 2,
    },

    secTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: C.ink,
    },

    secSub: {
      fontSize: 11,
      color: C.inkFaint,
      marginTop: 1,
    },

    genBody: {
      fontSize: 13,
      color: C.inkMid,
      lineHeight: 20,
    },

    // -----------------------------------------------------------------------
    // ENCOURAGEMENT
    // -----------------------------------------------------------------------

    encCard: {
      marginHorizontal:
        H_PAD,

      marginTop: 14,

      borderRadius:
        CARD_RADIUS,

      padding: 22,

      overflow: 'hidden',

      ...shadow(12),
    },

    encBubble: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor:
        'rgba(255,255,255,0.1)',
      top: -40,
      right: -30,
    },

    encTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '800',
    },

    encBody: {
      color:
        'rgba(255,255,255,0.85)',
      fontSize: 13,
      marginTop: 8,
      lineHeight: 20,
    },

    // -----------------------------------------------------------------------
    // ACTIONS
    // -----------------------------------------------------------------------

    actions: {
      marginHorizontal:
        H_PAD,

      marginTop: 16,

      gap: 12,
    },

    btnPrimary: {
      borderRadius: 20,
      overflow: 'hidden',
      ...shadow(10),
    },

    btnGrad: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 18,
    },

    btnPrimaryTxt: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '800',
    },

    btnSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 20,
      backgroundColor:
        C.tealLight,
      ...shadow(4),
    },

    btnSecondaryTxt: {
      color: C.teal,
      fontSize: 16,
      fontWeight: '700',
    },
  });