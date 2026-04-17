// app/(tabs)/routine.tsx (Fixed with Language Support)
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

// Daily routines with translation keys
const dailyRoutines = [
  {
    id: '1',
    time: '7:00 AM',
    titleKey: 'wakeUp',
    icon: 'brightness-6',
    color: '#FFEB3B',
    completed: true,
  },
  {
    id: '2',
    time: '7:30 AM',
    titleKey: 'brushTeeth',
    icon: 'brush',
    color: '#9C27B0',
    completed: true,
  },
  {
    id: '3',
    time: '8:00 AM',
    titleKey: 'breakfast',
    icon: 'restaurant',
    color: '#FF9800',
    completed: true,
  },
  {
    id: '4',
    time: '9:00 AM',
    titleKey: 'learningTime',
    icon: 'school',
    color: '#4CAF50',
    completed: false,
  },
  {
    id: '5',
    time: '10:30 AM',
    titleKey: 'playTime',
    icon: 'toys',
    color: '#E91E63',
    completed: false,
  },
  {
    id: '6',
    time: '12:00 PM',
    titleKey: 'lunch',
    icon: 'lunch-dining',
    color: '#4CAF50',
    completed: false,
  },
  {
    id: '7',
    time: '1:00 PM',
    titleKey: 'quietTime',
    icon: 'library-music',
    color: '#2196F3',
    completed: false,
  },
  {
    id: '8',
    time: '3:00 PM',
    titleKey: 'outdoorPlay',
    icon: 'park',
    color: '#4CAF50',
    completed: false,
  },
  {
    id: '9',
    time: '6:00 PM',
    titleKey: 'dinner',
    icon: 'dinner-dining',
    color: '#FF9800',
    completed: false,
  },
  {
    id: '10',
    time: '8:00 PM',
    titleKey: 'bedtime',
    icon: 'bedtime',
    color: '#7B1FA2',
    completed: false,
  },
];

export default function RoutineScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [activeRoutine, setActiveRoutine] = useState('4');

  const renderRoutineItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.routineItem,
        { 
          backgroundColor: colors.surface,
          borderColor: activeRoutine === item.id ? item.color : colors.surface,
        },
      ]}
      onPress={() => setActiveRoutine(item.id)}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
      </View>
      <View style={styles.routineContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <MaterialIcons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.routineTitle, { color: colors.text }]}>
            {t(item.titleKey)}
          </Text>
          <Text style={[styles.routineStatus, { color: colors.textLight }]}>
            {item.completed ? t('completed') : t('upcoming')}
          </Text>
        </View>
        {item.completed ? (
          <MaterialIcons name="check-circle" size={24} color={colors.success} />
        ) : (
          <TouchableOpacity style={styles.markButton}>
            <MaterialIcons name="radio-button-unchecked" size={24} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const routineTips = [
    t('visualTimers'),
    t('minuteWarnings'),
    t('celebrateCompleting'),
    t('keepRoutinesConsistent'),
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('dailyRoutineTitle')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {t('todaysSchedule')}
        </Text>
      </View>

      {/* Current Activity */}
      <Card
        title={t('currentActivity')}
        backgroundColor={colors.softGreen}
      >
        <View style={styles.currentActivity}>
          <View style={[styles.currentIcon, { backgroundColor: colors.secondaryLight }]}>
            <MaterialIcons name="school" size={40} color={colors.secondary} />
          </View>
          <View style={styles.currentInfo}>
            <Text style={[styles.currentTitle, { color: colors.text }]}>
              {t('learningTime')}
            </Text>
            <Text style={[styles.currentTime, { color: colors.textLight }]}>
              9:00 AM - 10:30 AM
            </Text>
            <Text style={[styles.currentDesc, { color: colors.textLight }]}>
              {t('completeDailyLessons')}
            </Text>
          </View>
          <TouchableOpacity style={[styles.currentButton, { backgroundColor: colors.secondary }]}>
            <Text style={styles.currentButtonText}>{t('start')}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Progress */}
      <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.progressTitle, { color: colors.text }]}>
          {t('dailyProgress')}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.progressFill, { width: '30%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          3/10 {t('tasksCompleted')}
        </Text>
      </View>

      {/* Today's Schedule */}
      <Card
        title={t('todaysSchedule')}
        icon="schedule"
        iconColor={colors.accentBlue}
      >
        <FlatList
          data={dailyRoutines}
          renderItem={renderRoutineItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </Card>

      {/* Add Custom Routine */}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
        <MaterialIcons name="add-circle" size={24} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>
          {t('addCustomActivity')}
        </Text>
      </TouchableOpacity>

      {/* Routine Tips */}
      <Card
        title={t('routineTips')}
        icon="lightbulb"
        iconColor={colors.accentYellow}
        backgroundColor={colors.softYellow}
      >
        <View style={styles.tipsContainer}>
          {routineTips.map((tip, index) => (
            <Text key={index} style={[styles.tipText, { color: colors.text }]}>
              • {tip}
            </Text>
          ))}
        </View>
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
  currentActivity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  currentInfo: {
    flex: 1,
  },
  currentTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
  },
  currentTime: {
    fontSize: Typography.fontSize.sm,
    marginVertical: Spacing.xs,
  },
  currentDesc: {
    fontSize: Typography.fontSize.sm,
  },
  currentButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  currentButtonText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  progressContainer: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  progressTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  timeContainer: {
    width: 80,
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
  },
  routineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  routineTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
  routineStatus: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  markButton: {
    padding: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    marginVertical: Spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    marginLeft: Spacing.md,
  },
  tipsContainer: {
    marginTop: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
});