// app/(tabs)/games.tsx (Fixed with Language Support)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Card from '../../components/Card';
import { Typography, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons';

// Games with translation keys
const games = [
  {
    id: '1',
    titleKey: 'memoryMatch',
    descriptionKey: 'matchPairs',
    icon: 'memory',
    color: '#9C27B0',
    difficulty: 'easy',
    stars: 3,
  },
  {
    id: '2',
    titleKey: 'colorSorting',
    descriptionKey: 'sortObjectsByColor',
    icon: 'color-lens',
    color: '#E91E63',
    difficulty: 'easy',
    stars: 2,
  },
  {
    id: '3',
    titleKey: 'shapePuzzle',
    descriptionKey: 'completeShapePuzzles',
    icon: 'extension',
    color: '#4CAF50',
    difficulty: 'medium',
    stars: 4,
  },
  {
    id: '4',
    titleKey: 'emotionMatch',
    descriptionKey: 'matchFacesWithEmotions',
    icon: 'emoji-emotions',
    color: '#FF9800',
    difficulty: 'medium',
    stars: 3,
  },
  {
    id: '5',
    titleKey: 'patternMaker',
    descriptionKey: 'createPatterns',
    icon: 'pattern',
    color: '#2196F3',
    difficulty: 'hard',
    stars: 5,
  },
  {
    id: '6',
    titleKey: 'numberHunt',
    descriptionKey: 'findHiddenNumbers',
    icon: 'search',
    color: '#4CAF50',
    difficulty: 'easy',
    stars: 2,
  },
];

export default function GamesScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState('1');

  const renderStars = (count: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <MaterialIcons
            key={i}
            name={i < count ? 'star' : 'star-border'}
            size={16}
            color={colors.accentYellow}
          />
        ))}
      </View>
    );
  };

  const renderGame = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.gameCard,
        { 
          backgroundColor: colors.surface,
          borderColor: selectedGame === item.id ? item.color : colors.surface,
        },
      ]}
      onPress={() => setSelectedGame(item.id)}
    >
      <View style={[styles.gameIcon, { backgroundColor: item.color + '20' }]}>
        <MaterialIcons name={item.icon as any} size={40} color={item.color} />
      </View>
      <Text style={[styles.gameTitle, { color: colors.text }]}>
        {t(item.titleKey)}
      </Text>
      <Text style={[styles.gameDescription, { color: colors.textLight }]}>
        {t(item.descriptionKey)}
      </Text>
      <View style={styles.gameFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: item.color + '30' }]}>
          <Text style={[styles.difficultyText, { color: item.color }]}>
            {t(item.difficulty)}
          </Text>
        </View>
        {renderStars(item.stars)}
      </View>
    </TouchableOpacity>
  );

  const filterCategories = [
    t('all'),
    t('memory'),
    t('puzzle'),
    t('educational'),
    t('fun'),
    t('socialCat'),
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('funGames')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {t('playLearnGrow')}
        </Text>
      </View>

      {/* Daily Challenge */}
      <Card
        title={t('dailyChallenge')}
        description={t('completeForRewards')}
        icon="bolt"
        iconColor={colors.accentOrange}
        backgroundColor={colors.softYellow}
      >
        <View style={styles.challenge}>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>
              {t('completeMemoryGames')}
            </Text>
            <Text style={[styles.challengeReward, { color: colors.accentOrange }]}>
              {t('rewardStars')}
            </Text>
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: colors.textLight }]}>
                {t('progress')}: 2/3
              </Text>
              <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
                <View
                  style={[styles.progressFill, { width: '66%', backgroundColor: colors.accentOrange }]}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.playButton, { backgroundColor: colors.accentOrange }]}>
            <Text style={styles.playButtonText}>{t('playNow')}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Game Categories */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('allGames')}
      </Text>
      <FlatList
        data={games}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.gamesRow}
      />

      {/* Recently Played */}
      <Card
        title={t('recentlyPlayed')}
        icon="history"
        iconColor={colors.textLight}
      >
        {games.slice(0, 3).map((game) => (
          <TouchableOpacity key={game.id} style={styles.recentGame}>
            <View style={[styles.recentIcon, { backgroundColor: game.color + '20' }]}>
              <MaterialIcons name={game.icon as any} size={24} color={game.color} />
            </View>
            <View style={styles.recentInfo}>
              <Text style={[styles.recentTitle, { color: colors.text }]}>
                {t(game.titleKey)}
              </Text>
              <Text style={[styles.recentTime, { color: colors.textLight }]}>
                {t('playedAgo')}
              </Text>
            </View>
            <TouchableOpacity style={styles.recentPlayButton}>
              <MaterialIcons name="play-arrow" size={24} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </Card>

      {/* Game Categories Filter */}
      <View style={styles.filterContainer}>
        <Text style={[styles.filterTitle, { color: colors.text }]}>
          {t('filterByCategory')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterCategories.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.filterButton, 
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.primaryLight,
                }
              ]}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.xxl,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.xs,
  },
  challenge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
  challengeReward: {
    fontSize: Typography.fontSize.sm,
    marginVertical: Spacing.xs,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  playButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginLeft: Spacing.md,
  },
  playButtonText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginVertical: Spacing.lg,
  },
  gamesRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  gameCard: {
    width: '48%',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  gameIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gameTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  gameDescription: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  difficultyText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.xs,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  recentGame: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
  recentTime: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  recentPlayButton: {
    padding: Spacing.sm,
  },
  filterContainer: {
    marginVertical: Spacing.lg,
  },
  filterTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
  },
});