// app/(tabs)/games.tsx (Complete updated version)
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '../../components/Card';
import { Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const games = [
  {
    id: '1',
    titleKey: 'memoryMatch',
    descriptionKey: 'matchPairs',
    icon: 'memory',
    color: '#9C27B0',
    difficulty: 'easy',
    stars: 3,
    route: '/(games)/MemoryMatchGame',
  },
  {
    id: '2',
    titleKey: 'simplePuzzle',
    descriptionKey: 'completeSimplePuzzles',
    icon: 'puzzle',
    color: '#4CAF50',
    difficulty: 'easy',
    stars: 3,
    route: '/(games)/SimplePuzzleGame',
  },
  {
    id: '3',
    titleKey: 'shapePuzzle',
    descriptionKey: 'completeShapePuzzles',
    icon: 'extension',
    color: '#2196F3',
    difficulty: 'medium',
    stars: 4,
    route: '/(games)/ShapePuzzleGame',
  },
  {
    id: '4',
    titleKey: 'emotionMatch',
    descriptionKey: 'matchFacesWithEmotions',
    icon: 'emoji-emotions',
    color: '#FF9800',
    difficulty: 'medium',
    stars: 3,
    route: '/(games)/EmotionMatchGame',
  },
  {
    id: '5',
    titleKey: 'patternMaker',
    descriptionKey: 'createPatterns',
    icon: 'pattern',
    color: '#E91E63',
    difficulty: 'hard',
    stars: 5,
    route: '/(games)/PatternMakerGame',
  },
  {
    id: '6',
    titleKey: 'numberHunt',
    descriptionKey: 'findHiddenNumbers',
    icon: 'search',
    color: '#00BCD4',
    difficulty: 'easy',
    stars: 3,
    route: '/(games)/NumberHuntGame',
  },
  {
    id: '7',
    titleKey: 'colorSorting',
    descriptionKey: 'sortObjectsByColor',
    icon: 'color-lens',
    color: '#FF6B6B',
    difficulty: 'medium',
    stars: 4,
    route: '/(games)/ColorSortingGame',
  },
  {
    id: '8',
    titleKey: 'wordMatch',
    descriptionKey: 'matchWordsInBothLanguages',
    icon: 'translate',
    color: '#9C27B0',
    difficulty: 'easy',
    stars: 4,
    route: '/(games)/WordMatchGame',
  },
  {
    id: '9',
    titleKey: 'thinkingGames',
    descriptionKey: 'solvePuzzlesAndSequences',
    icon: 'psychology',
    color: '#4ECDC4',
    difficulty: 'medium',
    stars: 4,
    route: '/(games)/ThinkingGames',
  },
  {
    id: '10',
    titleKey: 'creativeWriting',
    descriptionKey: 'expressYourselfThroughWords',
    icon: 'edit',
    color: '#FFD166',
    difficulty: 'medium',
    stars: 4,
    route: '/(games)/CreativeWritingGame',
  },
];

export default function GamesScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState('1');

  const handleGamePress = (game: any) => {
    setSelectedGame(game.id);
    
    try {
      router.push(game.route as any);
    } catch (error) {
      Alert.alert(
        t('comingSoon') || 'Coming Soon!',
        t('gameUnderDevelopment') || 'This game is under development. Stay tuned!',
        [{ text: 'OK' }]
      );
    }
  };

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
          borderColor: selectedGame === item.id ? item.color : '#E0E0E0',
        },
      ]}
      onPress={() => handleGamePress(item)}
      activeOpacity={0.8}
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
    t('language'),
    t('creative'),
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
    >
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
              {t('completeThreeGames')}
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
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: colors.accentOrange }]}
            onPress={() => handleGamePress(games[0])}
          >
            <Text style={styles.playButtonText}>{t('playNow')}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* All Games Section */}
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
          <TouchableOpacity 
            key={game.id} 
            style={styles.recentGame}
            onPress={() => handleGamePress(game)}
          >
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
            <TouchableOpacity 
              style={styles.recentPlayButton}
              onPress={() => handleGamePress(game)}
            >
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
  bilingualBanner: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  languageFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  flagEmoji: { fontSize: 32 },
  bilingualText: { fontSize: Typography.fontSize.sm, textAlign: 'center' },
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