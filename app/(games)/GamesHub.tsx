// app/(games)/GamesHub.tsx
import React from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const CARD_RADIUS = BorderRadius.xl;
const H_PAD = Spacing.md;

type GameTileProps = {
  icon: string;
  title: string;
  subtitle: string;
  tint: string;
  onPress: () => void;
};

function GameTile({ icon, title, subtitle, tint, onPress }: GameTileProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: `${tint}14`,
          borderColor: `${tint}30`,
        },
      ]}
    >
      <View style={[styles.tileIconWrap, { backgroundColor: `${tint}22` }]}>
        <Ionicons name={icon as any} size={22} color={tint} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.tileTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.tileSubtitle, { color: colors.textLight }]}>
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color={`${tint}90`} />
    </TouchableOpacity>
  );
}

export default function GamesHubScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('games') || 'Games'}
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <GameTile
          icon="game-controller-outline"
          title={t('behaviourGame')}
          subtitle={t('practiceSocialSkills')}
          tint={colors.primary}
          onPress={() => router.push('/(games)/BehaviourGame')}
        />

        <GameTile
          icon="pencil-outline"
          title={t('tracingGame') || 'Tracing'}
          subtitle={t('tracingGameDescription') || 'Practice motor skills'}
          tint={colors.accentOrange}
          onPress={() => router.push('/(games)/TracingGame')}
        />

        {/* Add more game tiles here as you build them out */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
  },
  tileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },
  tileSubtitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: 1,
  },
});