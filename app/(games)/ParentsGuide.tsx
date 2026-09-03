// app/(info)/ParentsGuide.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
//
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const { width: SW } = Dimensions.get('window');
const H_PAD = Spacing.md;

const shadow = (depth = 8) =>
  Platform.select({
    web: { boxShadow: `0 ${depth}px ${depth * 2.5}px rgba(0,0,0,0.07)` },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: depth,
      shadowOffset: { width: 0, height: depth / 2 },
      elevation: Math.round(depth / 2),
    },
  });

// ── Fade + slide entrance, same easing/timing as the dashboard ────────────
function FadeSlide({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ── Parent guide content ──────────────────────────────────────────────
type GuideItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const GUIDE_ITEMS: GuideItem[] = [
  { id: 'g1', title: 'Getting Started', description: 'A simple guide to understanding the app and starting each session.', icon: 'book-outline' },
  { id: 'g2', title: 'Reading the Dashboard', description: 'Understand accuracy scores, progress, and session results.', icon: 'analytics-outline' },
  { id: 'g3', title: 'Supporting Fine Motor Practice', description: 'Simple ways to support your child while practising tracing shapes.', icon: 'hand-left-outline' },
  { id: 'g4', title: 'Handling a Tough Session', description: 'Helpful guidance when your child becomes frustrated or wants to stop.', icon: 'heart-outline' },
  { id: 'g5', title: 'Building a Daily Routine', description: 'How to keep practice consistent, calm, and enjoyable.', icon: 'calendar-outline' },
];

// ── Parent guide card ─────────────────────────────────────────────────
function GuideCard({
  item,
  index,
  onPress,
}: {
  item: GuideItem;
  index: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <FadeSlide delay={80 + index * 70}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.card, { backgroundColor: colors.surface }]}
      >
        <View style={[styles.guideIconWrap, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name={item.icon as any} size={28} color={colors.primary} />
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            style={[styles.cardDescription, { color: colors.textLight }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </TouchableOpacity>
    </FadeSlide>
  );
}

// ── Guide information modal ───────────────────────────────────────────
function GuideInfoModal({
  visible,
  item,
  onClose,
}: {
  visible: boolean;
  item: GuideItem | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  const videoSource =
    item?.id === 'g4'
      ? require('../../assets/videos/video1.mp4')
      : null;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;

    if (videoSource) {
      player.play();
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.infoModalBackdrop}>
        <View
          style={[
            styles.infoModalCard,
            { backgroundColor: colors.surface },
          ]}
        >
          <TouchableOpacity
            style={styles.infoCloseBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons
              name="close"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          {item && (
            <>
              <View
                style={[
                  styles.infoIconWrap,
                  { backgroundColor: colors.primary + '18' },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={36}
                  color={colors.primary}
                />
              </View>

              <Text
                style={[
                  styles.infoTitle,
                  { color: colors.text },
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.infoDescription,
                  { color: colors.textLight },
                ]}
              >
                {item.description}
              </Text>

              {/* Play video only for guide ID g4 */}
              {item.id === 'g4' ? (
                <View style={styles.videoContainer}>
                  <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="contain"
                    nativeControls
                  />
                </View>
              ) : (
                <View style={styles.comingSoonBox}>
                  <Ionicons
                    name="videocam-outline"
                    size={22}
                    color={colors.primary}
                  />

                  <View style={styles.comingSoonTextWrap}>
                    <Text
                      style={[
                        styles.comingSoonTitle,
                        { color: colors.text },
                      ]}
                    >
                      Video Coming Soon
                    </Text>

                    <Text
                      style={[
                        styles.comingSoonDescription,
                        { color: colors.textLight },
                      ]}
                    >
                      This parent guide will include an educational
                      video in a future update.
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.doneBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>
                  Close
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────
export default function ParentsGuideScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  const total = GUIDE_ITEMS.length;

  const openGuide = (item: GuideItem) => setSelectedGuide(item);
  const closeGuide = () => setSelectedGuide(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <FadeSlide delay={0}>
  <ImageBackground
    source={require('../../assets/images/momguides.png')}
    style={styles.hero}
    imageStyle={{ borderRadius: CARD_RADIUS }}
  >
    <LinearGradient
      colors={['rgba(0,0,0,0.25)', `${colors.primaryDark}D9`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroOverlay}
    >
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.heroTitle}>{t('parentsGuide') || 'Parents Guide'}</Text>
      <Text style={styles.heroSubtitle}>
        {t('parentsGuideDescription') ||
          'Short videos to help you get the most out of every session.'}
      </Text>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>{total} guides</Text>
      </View>
    </LinearGradient>
  </ImageBackground>
</FadeSlide>

        <View style={styles.list}>
          {GUIDE_ITEMS.map((item, index) => (
            <GuideCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => openGuide(item)}
            />
          ))}
        </View>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>

      <GuideInfoModal
        visible={selectedGuide !== null}
        item={selectedGuide}
        onClose={closeGuide}
      />
    </View>
  );
}

const CARD_RADIUS = BorderRadius.xl;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Spacing.md },

  // Hero
  hero: {
  marginHorizontal: H_PAD,
  marginTop: Platform.OS === 'ios' ? 56 : 44,
  borderRadius: CARD_RADIUS,
  overflow: 'hidden',
  ...shadow(14),
},

heroOverlay: {
  padding: Spacing.lg,
  // no borderRadius needed here — imageStyle on ImageBackground already
  // clips the photo, and overflow:'hidden' on `hero` clips this gradient
},
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
    lineHeight: 19,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },

  // List
  list: {
    marginHorizontal: H_PAD,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    gap: Spacing.sm,
    ...shadow(6),
  },
  thumbWrap: {
    width: 92,
    height: 66,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#00000010',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  watchedBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },

  // Guide icon
  guideIconWrap: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Guide information modal
  infoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  infoModalCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
  },

  infoCloseBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00000010',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  infoIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },

  infoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },

  infoDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },

  comingSoonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F3EBDD',
  },

  comingSoonTextWrap: {
    flex: 1,
  },

  comingSoonTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },

  comingSoonDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  doneBtn: {
    marginTop: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },

  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
videoContainer: {
  width: '100%',
  height: 220,
  marginTop: Spacing.lg,
  borderRadius: BorderRadius.lg,
  overflow: 'hidden',
  backgroundColor: '#000',
},

video: {
  width: '100%',
  height: '100%',
},
});