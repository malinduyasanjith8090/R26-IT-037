
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_RADIUS = BorderRadius.xl;

type GuideItem = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  video: number;
};

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: 'g1',
    titleKey: 'guideLostChild',
    descriptionKey: 'guideLostChildDescription',
    icon: 'person-outline',
    video: require('../../assets/videos/video01.mp4'),
  },
  {
    id: 'g2',
    titleKey: 'guideWaterSafety',
    descriptionKey: 'guideWaterSafetyDescription',
    icon: 'water-outline',
    video: require('../../assets/videos/video02.mp4'),
  },
  {
    id: 'g3',
    titleKey: 'guideOutdoorSafety',
    descriptionKey: 'guideOutdoorSafetyDescription',
    icon: 'walk-outline',
    video: require('../../assets/videos/video03.mp4'),
  },
  {
    id: 'g4',
    titleKey: 'guideRoadSafety',
    descriptionKey: 'guideRoadSafetyDescription',
    icon: 'car-outline',
    video: require('../../assets/videos/video04.mp4'),
  },
  {
    id: 'g5',
    titleKey: 'guideElectricalSafety',
    descriptionKey: 'guideElectricalSafetyDescription',
    icon: 'flash-outline',
    video: require('../../assets/videos/video05.mp4'),
  },
];

const ACCENT_COLORS = [
  '#E879A9',
  '#36A9A1',
  '#F0A64A',
  '#648CE8',
  '#9B7AE5',
];

function GuideVideo({ source }: { source: number }) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  useEffect(() => {
    player.play();
  }, [player]);

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

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
  const { t } = useLanguage();
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 350,
      delay: index * 75,
      useNativeDriver: true,
    }).start();
  }, [animation, index]);

  return (
    <Animated.View
      style={[
        styles.animatedCard,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t(item.titleKey)}
        style={({ pressed }) => [
          styles.guideCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${accent}20` },
          ]}
        >
          <Ionicons name={item.icon} size={28} color={accent} />
        </View>

        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {t(item.titleKey)}
          </Text>

          <Text
            style={[
              styles.cardDescription,
              { color: colors.textLight },
            ]}
          >
            {t(item.descriptionKey)}
          </Text>
        </View>

        <Ionicons
          name="play-circle"
          size={30}
          color={accent}
        />
      </Pressable>
    </Animated.View>
  );
}

function GuideInfoModal({
  item,
  visible,
  onClose,
}: {
  item: GuideItem | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={t('close')}
        />

        <View
          style={[
            styles.modalCard,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text
              style={[styles.modalTitle, { color: colors.text }]}
            >
              {item ? t(item.titleKey) : ''}
            </Text>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              style={[
                styles.closeButton,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons
                name="close"
                size={23}
                color={colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            {item && (
              <>
                <Text
                  style={[
                    styles.modalDescription,
                    { color: colors.textLight },
                  ]}
                >
                  {t(item.descriptionKey)}
                </Text>

                <View style={styles.videoHeading}>
                  <Ionicons
                    name="videocam-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.videoHeadingText,
                      { color: colors.text },
                    ]}
                  >
                    {t('watchSafetyVideo')}
                  </Text>
                </View>

                <GuideVideo key={item.id} source={item.video} />

                <View
                  style={[
                    styles.tipContainer,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.tipText,
                      { color: colors.text },
                    ]}
                  >
                    {t('parentsGuideSafetyTip')}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeActionButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.closeActionText}>
              {t('close')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function ParentsGuideScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedGuide, setSelectedGuide] =
    useState<GuideItem | null>(null);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
      edges={['left', 'right', 'bottom']}
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
        {/* Hero image */}
        <View style={styles.heroWrapper}>
          <ImageBackground
            source={require('../../assets/images/momguides.png')}
            style={styles.hero}
            imageStyle={{ borderRadius: CARD_RADIUS }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.25)',
                `${colors.primary}D9`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroOverlay}
            >
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#FFFFFF"
                />
              </Pressable>

              <View style={styles.heroTextContainer}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="shield-checkmark"
                    size={26}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.heroTitle}>
                  {t('parentsGuide')}
                </Text>

                <Text style={styles.heroDescription}>
                  {t('parentsGuideDescription')}
                </Text>

                <View style={styles.heroBadge}>
                  <Ionicons
                    name="heart"
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.heroBadgeText}>
                    {t('parentsGuideSafetyLabel')}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Guide list */}
        <View style={styles.content}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionText}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                {t('safetyGuidesTitle')}
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: colors.textLight },
                ]}
              >
                {t('safetyGuidesDescription')}
              </Text>
            </View>

            <View
              style={[
                styles.countBadge,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[
                  styles.countBadgeText,
                  { color: colors.primary },
                ]}
              >
                {GUIDE_ITEMS.length}
              </Text>
            </View>
          </View>

          {GUIDE_ITEMS.map((item, index) => (
            <GuideCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => setSelectedGuide(item)}
            />
          ))}

          <View
            style={[
              styles.footerNote,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={colors.primary}
            />
            <Text
              style={[
                styles.footerText,
                { color: colors.textLight },
              ]}
            >
              {t('parentsGuideFooter')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <GuideInfoModal
        item={selectedGuide}
        visible={selectedGuide !== null}
        onClose={() => setSelectedGuide(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingBottom: Spacing.xl,
  },
  heroWrapper: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  hero: {
    minHeight: 300,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    flex: 1,
    minHeight: 300,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  heroTextContainer: {
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  heroDescription: {
    ...Typography.body,
    color: '#FFFFFF',
    lineHeight: 23,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionText: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h2,
    fontWeight: '800',
    marginBottom: 5,
  },
  sectionSubtitle: {
    ...Typography.caption,
    lineHeight: 19,
  },
  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 17,
    fontWeight: '800',
  },
  animatedCard: {
    marginBottom: Spacing.md,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    minHeight: 105,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardTextContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: CARD_RADIUS,
    marginTop: Spacing.xs,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalCard: {
    maxHeight: '91%',
    minHeight: '55%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#B8B8B8',
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 28,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingBottom: Spacing.md,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  videoHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  videoHeadingText: {
    fontSize: 16,
    fontWeight: '800',
  },
  videoContainer: {
    width: '100%',
    height: Math.min(SCREEN_WIDTH * 0.58, 270),
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: Spacing.md,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  closeActionButton: {
    minHeight: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: Spacing.md,
  },
  closeActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
