// app/(tabs)/dashboard.tsx (fetches real user data)
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import { Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getProfile } from '../../services/api';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    parentName: '',
    childName: '',
    childAge: '',
  });

  const [childProgress, setChildProgress] = useState({
    learning: 0.65,
    games: 0.45,
    routine: 0.80,
    behavioral: 0.30,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setUserProfile({
          parentName: data.parentName || '',
          childName: data.childName || '',
          childAge: data.childAge ? String(data.childAge) : '',
        });
      } catch (error) {
        // If token missing or invalid, redirect to login
        Alert.alert('Session expired', 'Please sign in again.');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const dailyTasks = [
    { id: '1', title: t('morningRoutine'), icon: 'brightness-6', completed: true },
    { id: '2', title: t('learningSession'), icon: 'school', completed: true },
    { id: '3', title: t('lunchTime'), icon: 'restaurant', completed: false },
    { id: '4', title: t('gameTime'), icon: 'games', completed: false },
    { id: '5', title: t('eveningRoutine'), icon: 'nightlight-round', completed: false },
  ];

  const recentAchievements = [
    { id: '1', title: t('learnedNewWords'), icon: 'star', color: colors.accentYellow },
    { id: '2', title: t('completedGames'), icon: 'emoji-events', color: colors.secondary },
    { id: '3', title: t('dayStreak'), icon: 'local-fire-department', color: colors.accentOrange },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {t('hello')}, {userProfile.childName || 'Friend'}!
          </Text>
          <Text style={[styles.subGreeting, { color: colors.textLight }]}>{t('readyToLearn')}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <View style={[styles.profileIcon, { backgroundColor: colors.primaryLight }]}>
            <MaterialIcons name="child-care" size={32} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Today's Progress */}
      <Card
        title={t('todaysProgress')}
        icon="trending-up"
        iconColor={colors.primary}
      >
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>{t('learning')}</Text>
            <ProgressBar progress={childProgress.learning} height={10} showLabel />
            <Text style={[styles.progressValue, { color: colors.primary }]}>65%</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>{t('games')}</Text>
            <ProgressBar progress={childProgress.games} height={10} showLabel />
            <Text style={[styles.progressValue, { color: colors.primary }]}>45%</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>{t('routine')}</Text>
            <ProgressBar progress={childProgress.routine} height={10} showLabel />
            <Text style={[styles.progressValue, { color: colors.primary }]}>80%</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>{t('socialSkills')}</Text>
            <ProgressBar progress={childProgress.behavioral} height={10} showLabel />
            <Text style={[styles.progressValue, { color: colors.primary }]}>30%</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
            <MaterialIcons name="play-circle-filled" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>{t('continueLearning')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: colors.secondaryLight }]}>
            <MaterialIcons name="games" size={32} color={colors.secondary} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>{t('playGames')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: colors.accentBlue + '20' }]}>
            <MaterialIcons name="schedule" size={32} color={colors.accentBlue} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>{t('dailyRoutine')}</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Tasks */}
      <Card
        title={t('todaysTasks')}
        icon="check-circle"
        iconColor={colors.success}
      >
        {dailyTasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <MaterialIcons
              name={task.icon as any}
              size={24}
              color={task.completed ? colors.success : colors.textLight}
            />
            <Text style={[styles.taskText, { color: colors.text }, task.completed && styles.taskCompleted]}>
              {task.title}
            </Text>
            {task.completed ? (
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
            ) : (
              <MaterialIcons name="radio-button-unchecked" size={24} color={colors.textLight} />
            )}
          </View>
        ))}
      </Card>

      {/* Recent Achievements */}
      <Card
        title={t('recentAchievements')}
        icon="emoji-events"
        iconColor={colors.accentOrange}
      >
        {recentAchievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
              <MaterialIcons name={achievement.icon as any} size={24} color={achievement.color} />
            </View>
            <Text style={[styles.achievementText, { color: colors.text }]}>{achievement.title}</Text>
          </View>
        ))}
      </Card>

      {/* Tips Section */}
      <Card
        title={t('parentTip')}
        backgroundColor={colors.softBlue}
      >
        <Text style={[styles.tipText, { color: colors.text }]}>
          {t('parentTipText')}
        </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.xxl,
  },
  subGreeting: {
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.xs,
  },
  profileButton: {
    padding: Spacing.sm,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressItem: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  progressValue: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  taskText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    marginLeft: Spacing.md,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  achievementText: {
    fontSize: Typography.fontSize.md,
    flex: 1,
  },
  tipText: {
    fontSize: Typography.fontSize.md,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});