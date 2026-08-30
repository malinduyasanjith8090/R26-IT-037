// app/(tabs)/behavioral.tsx
// Theme + Language integrated version
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getDashboard } from '../../services/apiService';
const playgroundBg = require('../../assets/images/playground.png');
const { width: SW } = Dimensions.get('window');

const CARD_RADIUS = BorderRadius.xl;
const H_PAD = Spacing.md;

type AnyObject = Record<string, any>;

type FadeSlideProps = {
  delay?: number;
  children: React.ReactNode;
  style?: any;
};

function FadeSlide({ delay = 0, children, style }: FadeSlideProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

type AnimatedNumberProps = {
  target: number;
  suffix?: string;
  style?: any;
};

function AnimatedNumber({
  target,
  suffix = '',
  style,
}: AnimatedNumberProps) {
  const animation = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const listener = animation.addListener(({ value }) => {
      setDisplay(Number(value.toFixed(1)).toString());
    });

    Animated.timing(animation, {
      toValue: target,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    return () => animation.removeListener(listener);
  }, [animation, target]);

  return (
    <Text style={style}>
      {display}
      {suffix}
    </Text>
  );
}

type RadialRingProps = {
  value?: number;
  size?: number;
  color: string;
  label?: string;
  sub?: string;
  textColor: string;
  mutedColor: string;
};

function RadialRing({
  value = 0,
  size = 80,
  color,
  label,
  sub,
  textColor,
  mutedColor,
}: RadialRingProps) {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: Math.min(Math.max(value, 0), 1),
      duration: 1400,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animation, value]);

  const pct = Math.min(Math.max(value, 0), 1);
  const strokeW = 7;

  return (
    <View style={styles.ringContainer}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <View
          style={[
            styles.ringTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeW,
              borderColor: `${color}22`,
            },
          ]}
        />

        <View
          style={[
            styles.ringFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeW,
              borderColor: 'transparent',
              borderTopColor: color,
              borderRightColor: pct > 0.25 ? color : 'transparent',
              borderBottomColor: pct > 0.5 ? color : 'transparent',
              borderLeftColor: pct > 0.75 ? color : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />

        <Text style={[styles.ringValue, { color: textColor }]}>
          {Math.round(pct * 100)}
        </Text>
        <Text style={[styles.ringPercent, { color: mutedColor }]}>%</Text>
      </View>

      {!!label && (
        <Text style={[styles.ringLabel, { color: textColor }]}>
          {label}
        </Text>
      )}

      {!!sub && (
        <Text style={[styles.ringSub, { color: mutedColor }]}>
          {sub}
        </Text>
      )}
    </View>
  );
}

type StatCardProps = {
  icon: string;
  iconLib?: 'ion' | 'mci';
  value: string;
  label: string;
  color: string;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  delay?: number;
};

function StatCard({
  icon,
  iconLib = 'ion',
  value,
  label,
  color,
  backgroundColor,
  textColor,
  mutedColor,
  delay = 0,
}: StatCardProps) {
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [delay, scale]);

  const IconComponent =
    iconLib === 'ion' ? Ionicons : MaterialCommunityIcons;

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor,
          transform: [{ scale }],
        },
      ]}
    >
      <View
        style={[
          styles.statIconWrap,
          { backgroundColor: `${color}22` },
        ]}
      >
        <IconComponent name={icon as any} size={20} color={color} />
      </View>

      <Text style={[styles.statValue, { color: textColor }]}>
        {value}
      </Text>

      <Text style={[styles.statLabel, { color: mutedColor }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

type SectionHeadProps = {
  title: string;
  sub?: string;
  accent: string;
  textColor: string;
  mutedColor: string;
};

function SectionHead({
  title,
  sub,
  accent,
  textColor,
  mutedColor,
}: SectionHeadProps) {
  return (
    <View style={styles.sectionHead}>
      <View
        style={[
          styles.sectionAccent,
          { backgroundColor: accent },
        ]}
      />

      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {title}
        </Text>

        {!!sub && (
          <Text style={[styles.sectionSub, { color: mutedColor }]}>
            {sub}
          </Text>
        )}
      </View>
    </View>
  );
}

type SkeletonProps = {
  width?: number | string;
  height?: number;
  radius?: number;
  backgroundColor: string;
  style?: any;
};

function Skeleton({
  width = '100%',
  height = 18,
  radius = 10,
  backgroundColor,
  style,
}: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

function LoadingSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.loadingRoot,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.loadingHero,
          { backgroundColor: colors.surface },
        ]}
      >
        <Skeleton
          width={120}
          height={14}
          radius={8}
          backgroundColor={colors.primaryLight}
          style={{ marginBottom: 14 }}
        />
        <Skeleton
          width={200}
          height={28}
          radius={10}
          backgroundColor={colors.primaryLight}
          style={{ marginBottom: 10 }}
        />
        <Skeleton
          width={160}
          height={14}
          radius={8}
          backgroundColor={colors.primaryLight}
          style={{ marginBottom: 6 }}
        />
        <Skeleton
          width={140}
          height={12}
          radius={8}
          backgroundColor={colors.primaryLight}
        />
      </View>

      <View style={styles.loadingStats}>
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            width={(SW - H_PAD * 2 - 24) / 3}
            height={110}
            radius={20}
            backgroundColor={colors.surface}
          />
        ))}
      </View>

      <View
        style={[
          styles.loadingPanel,
          { backgroundColor: colors.surface },
        ]}
      >
        <Skeleton
          width={140}
          height={14}
          radius={8}
          backgroundColor={colors.primaryLight}
          style={{ marginBottom: 16 }}
        />
        <Skeleton
          width="100%"
          height={180}
          radius={16}
          backgroundColor={colors.primaryLight}
        />
      </View>
    </View>
  );
}

type SkillRowProps = {
  label: string;
  value: number;
  color: string;
  textColor: string;
  mutedColor: string;
  trackColor: string;
};

function SkillRow({
  label,
  value,
  color,
  textColor,
  mutedColor,
  trackColor,
}: SkillRowProps) {
  const animation = useRef(new Animated.Value(0)).current;
  const pct = Math.min(Math.max(value, 0), 1);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: pct,
      duration: 1200,
      delay: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animation, pct]);

  return (
    <View style={styles.skillRow}>
      <View style={styles.skillRowTop}>
        <Text style={[styles.skillLabel, { color: textColor }]}>
          {label}
        </Text>

        <Text style={[styles.skillPct, { color }]}>
          {Math.round(pct * 100)}%
        </Text>
      </View>

      <View
        style={[
          styles.skillTrack,
          { backgroundColor: trackColor },
        ]}
      >
        <Animated.View
          style={[
            styles.skillFill,
            {
              backgroundColor: color,
              width: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

type SessionMetricProps = {
  icon: string;
  color: string;
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
  backgroundColor: string;
};

function SessionMetric({
  icon,
  color,
  label,
  value,
  textColor,
  mutedColor,
  backgroundColor,
}: SessionMetricProps) {
  return (
    <View
      style={[
        styles.sessionMetric,
        {
          borderColor: `${color}30`,
          backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.sessionIcon,
          { backgroundColor: `${color}18` },
        ]}
      >
        <Ionicons name={icon as any} size={18} color={color} />
      </View>

      <Text style={[styles.sessionValue, { color: textColor }]}>
        {value}
      </Text>

      <Text style={[styles.sessionLabel, { color: mutedColor }]}>
        {label}
      </Text>
    </View>
  );
}

type NavPillProps = {
  icon: string;
  label: string;
  active?: boolean;
  activeColor: string;
  mutedColor: string;
  activeBackground: string;
};

function NavPill({
  icon,
  label,
  active = false,
  activeColor,
  mutedColor,
  activeBackground,
}: NavPillProps) {
  return (
    <TouchableOpacity
      style={[
        styles.navPill,
        active && { backgroundColor: activeBackground },
      ]}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={active ? activeColor : mutedColor}
      />

      <Text
        style={[
          styles.navLabel,
          { color: active ? activeColor : mutedColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type CtaCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  tint: string;
  onPress: () => void;
  delay?: number;
};

function CtaCard({ icon, title, subtitle, tint, onPress, delay = 0 }: CtaCardProps) {
  const { colors } = useTheme();

  return (
    <FadeSlide delay={delay}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.ctaWrap}
      >
        <View
          style={[
            styles.ctaSoft,
            { backgroundColor: `${tint}14`, borderColor: `${tint}30` },
          ]}
        >
          <View style={styles.ctaLeft}>
            <View style={[styles.ctaIconWrap, { backgroundColor: `${tint}22` }]}>
              <Ionicons name={icon as any} size={18} color={tint} />
            </View>

            <View>
              <Text style={[styles.ctaTitle, { color: colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.ctaSubtitle, { color: colors.textLight }]}>
                {subtitle}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={22} color={`${tint}90`} />
        </View>
      </TouchableOpacity>
    </FadeSlide>
  );
}

export default function ParentDashboardScreen({
  navigation,
}: AnyObject) {
  const { activeChild, parentProfile, logout } = useChild();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const childId =
    activeChild?._id || '69e0e39c84040d2901db4b04';

  const childName = activeChild?.alias || 'Child';
  const parentName = parentProfile?.fullName || t('parentName');
  const parentInitial =
    parentName?.[0]?.toUpperCase() || 'P';

  useEffect(() => {
    loadDashboard();
  }, [childId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard(childId);
      setData(response);
    } catch (error) {
      console.log('Dashboard loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.log('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const chartData =
    data?.recentAccuracy?.length > 0
      ? data.recentAccuracy.map((value: number) =>
          Math.max(0.01, value)
        )
      : [0.65, 0.72, 0.8, 0.76, 0.88, 0.91, 0.87];

  const totalSessions = data?.totalSessions || 0;
  const totalTrials = data?.totalTrials || 0;
  const avgAccuracy = Number(data?.avgAccuracy || 0);

  const attention =
    data?.cognitive?.attentionScore || 0;

  const motor =
    data?.cognitive?.motorScore || 0;

  const vmi =
    data?.cognitive?.vmiScore || 0;

  const lastTrials =
    data?.latestSession?.totalTrials || 0;

  const lastScore =
    (data?.latestSession?.avgAccuracyScore || 0) * 100;

  const getGreetingKey = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'goodMorning';
    if (hour < 17) return 'goodAfternoon';

    return 'goodEvening';
  };

  const getEncouragement = () => {
    if (avgAccuracy >= 0.85) {
      return {
        title: t('outstandingProgress'),
        colors: [
          colors.secondary,
          colors.secondaryDark,
        ] as [string, string],
      };
    }

    if (avgAccuracy >= 0.65) {
      return {
        title: t('greatWorkKeepGoing'),
        colors: [
          colors.warning,
          colors.accentOrange,
        ] as [string, string],
      };
    }

    return {
      title: t('everyStepCounts'),
      colors: [
        colors.error,
        colors.accentOrange,
      ] as [string, string],
    };
  };

  const encouragement = getEncouragement();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HERO */}
   {/* HERO */}
{/* HERO */}
<FadeSlide delay={0}>
  <ImageBackground
    source={playgroundBg}
    style={styles.hero}
    imageStyle={{ borderRadius: CARD_RADIUS }}
  >
    {/* dark overlay so white text stays readable over the photo */}
    <View style={styles.heroOverlay} />

    <View style={styles.heroTop}>
      <Text style={styles.heroGreeting}>
        Hi, {childName} baby
      </Text>

      <TouchableOpacity
        style={styles.heroIconButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  </ImageBackground>
</FadeSlide>

        {/* CTA */}
       <View style={styles.ctaGroup}>
  <CtaCard
    icon="play"
    title={t('startNewTrial')}
    subtitle={t('startNewTrialDescription')}
    tint={colors.accentOrange}
    onPress={() => router.push('/(games)/TracingGame')}
    delay={80}
  />
  <CtaCard
    icon="game-controller-outline"
    title={t('behaviourGame')}
    subtitle={t('practiceSocialSkills')}
    tint={colors.primary}
    onPress={() => router.push('/(games)/GamesHub')}
    delay={120}
  />
  <CtaCard
    icon="book-outline"
    title={t('parentsGuide')}
    subtitle={t('parentsGuideDescription')}
    tint={colors.accentPink}
    onPress={() => router.push('/(games)/ParentsGuide')}
    delay={160}
  />
</View>

        {/* STATS */}
        <FadeSlide
          delay={140}
          style={styles.statRow}
        >
          <StatCard
            icon="calendar-outline"
            value={totalSessions.toString()}
            label={t('sessions')}
            color={colors.accentBlue}
            backgroundColor={colors.softBlue}
            textColor={colors.text}
            mutedColor={colors.textLight}
            delay={160}
          />

          <StatCard
            icon="shapes-outline"
            value={totalTrials.toString()}
            label={t('trials')}
            color={colors.secondary}
            backgroundColor={colors.softGreen}
            textColor={colors.text}
            mutedColor={colors.textLight}
            delay={220}
          />

          <StatCard
            icon="target"
            iconLib="mci"
            value={`${(avgAccuracy * 100).toFixed(0)}%`}
            label={t('accuracy')}
            color={colors.accentPink}
            backgroundColor={colors.softPink}
            textColor={colors.text}
            mutedColor={colors.textLight}
            delay={280}
          />
        </FadeSlide>

        {/* CHART */}
        <FadeSlide delay={200}>
          <View
            style={[
              styles.panel,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <SectionHead
              title={t('progressTrend')}
              sub={t('accuracyAcrossRecentTrials')}
              accent={colors.accentBlue}
              textColor={colors.text}
              mutedColor={colors.textLight}
            />

            <LineChart
              data={{
                labels: chartData.map(
                  (_: number, index: number) =>
                    `${index + 1}`
                ),
                datasets: [
                  {
                    data: chartData,
                    strokeWidth: 3,
                  },
                ],
              }}
              width={SW - H_PAD * 2 - Spacing.lg * 2}
              height={180}
              withDots
              withInnerLines={false}
              withOuterLines={false}
              withShadow={false}
              yAxisInterval={1}
              chartConfig={{
                decimalPlaces: 0,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                color: (opacity = 1) =>
                  `rgba(156,39,176,${opacity})`,
                labelColor: (opacity = 1) =>
                  `${colors.textLight}${Math.round(
                    opacity * 255
                  )
                    .toString(16)
                    .padStart(2, '0')}`,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2.5',
                  stroke: colors.primaryDark,
                },
              }}
              formatYLabel={(value) =>
                `${Math.round(Number(value) * 100)}%`
              }
              bezier
              style={styles.chart}
            />
          </View>
        </FadeSlide>

        {/* SKILLS */}
        <FadeSlide delay={260}>
          <View
            style={[
              styles.panel,
              { backgroundColor: colors.surface },
            ]}
          >
            <SectionHead
              title={t('skillsSnapshot')}
              sub={t('skillsSnapshotDescription')}
              accent={colors.primary}
              textColor={colors.text}
              mutedColor={colors.textLight}
            />

            <View style={styles.skillsGrid}>
              <RadialRing
                value={attention}
                size={88}
                color={colors.secondary}
                label={t('attention')}
                textColor={colors.text}
                mutedColor={colors.textLight}
              />

              <RadialRing
                value={motor}
                size={88}
                color={colors.primary}
                label={t('motorSkills')}
                textColor={colors.text}
                mutedColor={colors.textLight}
              />

              <RadialRing
                value={vmi}
                size={88}
                color={colors.accentPink}
                label={t('visualMotor')}
                textColor={colors.text}
                mutedColor={colors.textLight}
              />
            </View>

            <SkillRow
              label={t('attention')}
              value={attention}
              color={colors.secondary}
              textColor={colors.text}
              mutedColor={colors.textLight}
              trackColor={colors.primaryLight}
            />

            <SkillRow
              label={t('motorSkills')}
              value={motor}
              color={colors.primary}
              textColor={colors.text}
              mutedColor={colors.textLight}
              trackColor={colors.primaryLight}
            />

            <SkillRow
              label={t('visualMotor')}
              value={vmi}
              color={colors.accentPink}
              textColor={colors.text}
              mutedColor={colors.textLight}
              trackColor={colors.primaryLight}
            />
          </View>
        </FadeSlide>

        {/* LATEST SESSION */}
        <FadeSlide delay={320}>
          <View
            style={[
              styles.panel,
              { backgroundColor: colors.surface },
            ]}
          >
            <SectionHead
              title={t('latestSession')}
              sub={t('latestSessionDescription')}
              accent={colors.warning}
              textColor={colors.text}
              mutedColor={colors.textLight}
            />

            <View style={styles.sessionGrid}>
              <SessionMetric
                icon="list-outline"
                color={colors.accentBlue}
                label={t('trials')}
                value={lastTrials.toString()}
                textColor={colors.text}
                mutedColor={colors.textLight}
                backgroundColor={colors.background}
              />

              <SessionMetric
                icon="checkmark-done"
                color={colors.secondary}
                label={t('score')}
                value={`${lastScore.toFixed(0)}%`}
                textColor={colors.text}
                mutedColor={colors.textLight}
                backgroundColor={colors.background}
              />

              <SessionMetric
                icon="trophy-outline"
                color={colors.warning}
                label={t('level')}
                value={`L${
                  data?.latestSession?.difficultyLevel || 1
                }`}
                textColor={colors.text}
                mutedColor={colors.textLight}
                backgroundColor={colors.background}
              />

              <SessionMetric
                icon="time-outline"
                color={colors.primary}
                label={t('duration')}
                value={
                  data?.latestSession?.durationMin
                    ? `${data.latestSession.durationMin}m`
                    : '--'
                }
                textColor={colors.text}
                mutedColor={colors.textLight}
                backgroundColor={colors.background}
              />
            </View>
          </View>
        </FadeSlide>

        {/* ENCOURAGEMENT */}
        <FadeSlide delay={380}>
          <LinearGradient
            colors={encouragement.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.encouragementCard}
          >
            <View style={styles.encouragementBubble} />

            <View style={styles.encouragementContent}>
              <Text style={styles.encouragementTitle}>
                {encouragement.title}
              </Text>

              <Text style={styles.encouragementBody}>
                {t('encouragementBody')}
              </Text>
            </View>

            <View style={styles.encouragementBadge}>
              <Ionicons
                name="heart"
                size={20}
                color="#FFFFFF"
              />
            </View>
          </LinearGradient>
        </FadeSlide>

        {/* FOOTER */}
      

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const shadow = (depth = 8) =>
  Platform.select({
    web: {
      boxShadow: `0 ${depth}px ${
        depth * 2.5
      }px rgba(0,0,0,0.07)`,
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  scroll: {
    paddingBottom: Spacing.md,
  },

  loadingRoot: {
    flex: 1,
    paddingTop: 60,
  },

  loadingHero: {
    marginHorizontal: H_PAD,
    borderRadius: CARD_RADIUS,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  loadingStats: {
    marginHorizontal: H_PAD,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  loadingPanel: {
    marginHorizontal: H_PAD,
    borderRadius: CARD_RADIUS,
    padding: Spacing.lg,
  },

hero: {
  marginHorizontal: H_PAD,
  marginTop: Platform.OS === 'ios' ? 56 : 44,
  borderRadius: CARD_RADIUS,
  padding: Spacing.lg,
  overflow: 'hidden',
  minHeight: 240,
  justifyContent: 'flex-start', // keeps content pinned to the top line
  ...shadow(16),
},

heroOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.28)', // darkens the photo so white text reads clearly
  borderRadius: CARD_RADIUS,
},

  heroBubbleOne: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -30,
  },

  heroBubbleTwo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: 40,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  heroGreetingSmall: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },

  heroGreeting: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    marginTop: 2,
  },

  heroTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  heroIconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroAvatar: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroAvatarText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },

  heroChild: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },

  heroChildAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroChildAvatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  heroChildName: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },

  heroChildSub: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },

  heroRingWrap: {
    alignItems: 'center',
  },

  heroRingLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    marginTop: 2,
  },

  heroDate: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
  },

  ctaWrap: {
  marginHorizontal: H_PAD,
  borderRadius: BorderRadius.lg,
  overflow: 'hidden',
  ...shadow(4),
},

ctaSoft: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.md,
  borderRadius: BorderRadius.lg,
  borderWidth: 1,
},

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  ctaGroup: {
  marginTop: Spacing.sm + 2,
  gap: 12, // ← this is your "minimal space" knob — shrink to 4 for even tighter, or use Spacing.xs if your theme has one
},

  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  ctaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  ctaTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },

  ctaSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: Typography.fontSize.xs,
    marginTop: 1,
  },

  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: H_PAD,
    marginTop: Spacing.sm + 2,
  },

  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'flex-start',
    ...shadow(6),
  },

  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },

  panel: {
    marginHorizontal: H_PAD,
    marginTop: Spacing.sm + 2,
    borderRadius: CARD_RADIUS,
    padding: Spacing.md,
    ...shadow(8),
  },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  sectionAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },

  sectionSub: {
    fontSize: 11,
    marginTop: 1,
  },

  chart: {
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },

  skillsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
  },

  skillRow: {
    marginTop: Spacing.sm,
  },

  skillRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  skillLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },

  skillPct: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },

  skillTrack: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },

  skillFill: {
    height: 8,
    borderRadius: 8,
  },

  sessionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },

  sessionMetric: {
    width: (SW - H_PAD * 2 - Spacing.lg * 2 - Spacing.sm) / 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
  },

  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  sessionValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },

  sessionLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  encouragementCard: {
    marginHorizontal: H_PAD,
    marginTop: Spacing.sm + 2,
    borderRadius: CARD_RADIUS,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...shadow(12),
  },

  encouragementBubble: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    right: -30,
  },

  encouragementContent: {
    zIndex: 1,
    paddingRight: 48,
  },

  encouragementTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },

  encouragementBody: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },

  encouragementBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerNav: {
    flexDirection: 'row',
    marginHorizontal: H_PAD,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    justifyContent: 'space-around',
    ...shadow(10),
  },

  navPill: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 3,
  },

  navLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  ringContainer: {
    alignItems: 'center',
    gap: 6,
  },

  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  ringTrack: {
    position: 'absolute',
  },

  ringFill: {
    position: 'absolute',
  },

  ringValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  ringPercent: {
    fontSize: 9,
    marginTop: -1,
  },

  ringLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  ringSub: {
    fontSize: 10,
    textAlign: 'center',
  },
});