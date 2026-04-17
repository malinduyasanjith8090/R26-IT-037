// app/(tabs)/learning.tsx (Fixed with Language Support)
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

// Learning categories with language keys
const learningCategories = [
  {
    id: '1',
    titleKey: 'lettersNumbers',
    icon: 'abc',
    color: '#9C27B0',
    lessons: 12,
    completed: 8,
  },
  {
    id: '2',
    titleKey: 'colorsShapes',
    icon: 'palette',
    color: '#E91E63',
    lessons: 8,
    completed: 5,
  },
  {
    id: '3',
    titleKey: 'dailyActivities',
    icon: 'brush',
    color: '#4CAF50',
    lessons: 10,
    completed: 6,
  },
  {
    id: '4',
    titleKey: 'animalsNature',
    icon: 'pets',
    color: '#2196F3',
    lessons: 15,
    completed: 10,
  },
  {
    id: '5',
    titleKey: 'emotions',
    icon: 'emoji-emotions',
    color: '#FF9800',
    lessons: 6,
    completed: 3,
  },
  {
    id: '6',
    titleKey: 'socialStories',
    icon: 'group',
    color: '#4CAF50',
    lessons: 8,
    completed: 4,
  },
];

export default function LearningScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('1');

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { 
          backgroundColor: colors.surface,
          borderColor: activeCategory === item.id ? item.color : colors.primaryLight,
        },
      ]}
      onPress={() => setActiveCategory(item.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <MaterialIcons name={item.icon as any} size={32} color={item.color} />
      </View>
      <Text style={[styles.categoryTitle, { color: colors.text }]}>
        {t(item.titleKey)}
      </Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(item.completed / item.lessons) * 100}%`,
                backgroundColor: item.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {item.completed}/{item.lessons} {t('lessons')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const recommendedItems = [
    t('interactiveStory'),
    t('countingWithColors'),
    t('emotionMatchingGame'),
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('learningJourney')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {t('exploreLessons')}
        </Text>
      </View>

      {/* Continue Learning */}
      <Card
        title={t('continueLearningPickup')}
        description={t('pickUpWhereLeft')}
        backgroundColor={colors.softPurple}
      >
        <View style={styles.continueLesson}>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, { color: colors.text }]}>
              {t('letterAApple')}
            </Text>
            <Text style={[styles.lessonDesc, { color: colors.textLight }]}>
              {t('learningWordsWithA')}
            </Text>
            <View style={styles.lessonProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
                <View
                  style={[styles.progressFill, { width: '75%', backgroundColor: colors.primary }]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.primary }]}>75%</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.playButton, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Learning Categories */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('learningCategories')}
      </Text>
      <FlatList
        data={learningCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.categoryRow}
      />

      {/* Recommended */}
      <Card
        title={t('recommendedForYou')}
        icon="star"
        iconColor={colors.accentYellow}
      >
        <View style={styles.recommendedList}>
          {recommendedItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.recommendedItem}>
              <MaterialIcons name="play-circle-outline" size={24} color={colors.primary} />
              <Text style={[styles.recommendedText, { color: colors.text }]}>
                {item}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* AR Learning Feature */}
      <Card
        title={t('arLearning')}
        description={t('bringLessonsToLife')}
        icon="3d-rotation"
        iconColor={colors.accentBlue}
        backgroundColor={colors.softBlue}
      >
        <TouchableOpacity style={[styles.arButton, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="camera-alt" size={32} color={colors.accentBlue} />
          <Text style={[styles.arButtonText, { color: colors.accentBlue }]}>
            {t('startArExperience')}
          </Text>
        </TouchableOpacity>
      </Card>
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
  continueLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
  },
  lessonDesc: {
    fontSize: Typography.fontSize.sm,
    marginVertical: Spacing.xs,
  },
  lessonProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginVertical: Spacing.lg,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    width: '100%',
  },
  recommendedList: {
    marginTop: Spacing.sm,
  },
  recommendedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  recommendedText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    marginLeft: Spacing.md,
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  arButtonText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginLeft: Spacing.md,
  },
});