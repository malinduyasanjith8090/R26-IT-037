// app/(tabs)/learning.tsx (Updated - pass 'sinhala' type)
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import TracingGame from '../../components/TracingCanvas';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function LearningScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<'letters' | 'sinhala' | 'numbers' | null>(null);
  const [learningProgress, setLearningProgress] = useState(0);

  if (selectedType) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedType(null)}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back to Learning</Text>
        </TouchableOpacity>

        {/* Tracing Game - Pass the correct type */}
        <TracingGame
          type={selectedType}
          onComplete={() => {
            if (selectedType === 'letters') {
              alert(`🎉 Congratulations! You mastered all English letters! 🎉`);
            } else if (selectedType === 'sinhala') {
              alert(`🎉 සුපිරි! ඔබ සියලු සිංහල අකුරු සාර්ථක කළා! 🎉`);
            } else {
              alert(`🎉 Congratulations! You mastered all numbers! 🎉`);
            }
          }}
          onProgress={(progress: number) => setLearningProgress(progress)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Learning Journey</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          Trace and learn letters & numbers
        </Text>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <MaterialIcons name="stars" size={32} color={colors.accentYellow} />
          <Text style={[styles.statValue, { color: colors.text }]}>245</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Stars Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="emoji-events" size={32} color={colors.accentOrange} />
          <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Badges</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="local-fire-department" size={32} color={colors.accentPink} />
          <Text style={[styles.statValue, { color: colors.text }]}>7</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Day Streak</Text>
        </View>
      </View>

      {/* Learning Options */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose What to Learn</Text>
      
      {/* English Letters Card */}
      <TouchableOpacity
        style={[styles.learningCard, { backgroundColor: colors.surface }]}
        onPress={() => setSelectedType('letters')}
      >
        <View style={[styles.cardIcon, { backgroundColor: '#FF6B6B20' }]}>
          <Text style={styles.cardEmoji}>🔤</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>English Letters A-Z</Text>
          <Text style={[styles.cardDescription, { color: colors.textLight }]}>
            Trace uppercase English letters from A to Z with guided dotted lines
          </Text>
          <View style={styles.cardProgress}>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '60%', backgroundColor: '#FF6B6B' }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>15/26 Completed</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={32} color={colors.textLight} />
      </TouchableOpacity>

      {/* Sinhala Letters Card */}
      <TouchableOpacity 
        style={[styles.learningCard, { backgroundColor: colors.surface }]}
        onPress={() => setSelectedType('sinhala')}
      >
        <View style={[styles.cardIcon, { backgroundColor: '#9C27B020' }]}>
          <Text style={styles.cardEmoji}>🕉️</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>සිංහල අකුරු (Sinhala Letters)</Text>
          <Text style={[styles.cardDescription, { color: colors.textLight }]}>
            Trace Sinhala letters including vowels and consonants with guided dotted lines
          </Text>
          <View style={styles.cardProgress}>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '30%', backgroundColor: '#9C27B0' }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>18/60 Completed</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={32} color={colors.textLight} />
      </TouchableOpacity>

      {/* Numbers Card */}
      <TouchableOpacity 
        style={[styles.learningCard, { backgroundColor: colors.surface }]}
        onPress={() => setSelectedType('numbers')}
      >
        <View style={[styles.cardIcon, { backgroundColor: '#4ECDC420' }]}>
          <Text style={styles.cardEmoji}>🔢</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Numbers 0-9</Text>
          <Text style={[styles.cardDescription, { color: colors.textLight }]}>
            Trace numbers with fun animations and voice guidance
          </Text>
          <View style={styles.cardProgress}>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '40%', backgroundColor: '#4ECDC4' }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>4/10 Completed</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={32} color={colors.textLight} />
      </TouchableOpacity>

      {/* Practice Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Practice Zone</Text>
      <View style={styles.practiceGrid}>
        {[
          { icon: '🎨', name: 'Colors', color: '#FFD166', progress: 30 },
          { icon: '⬛', name: 'Shapes', color: '#06D6A0', progress: 15 },
          { icon: '🐘', name: 'Animals', color: '#118AB2', progress: 45 },
          { icon: '🍎', name: 'Fruits', color: '#EF476F', progress: 20 },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={[styles.practiceCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.practiceIcon, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.practiceEmoji}>{item.icon}</Text>
            </View>
            <Text style={[styles.practiceName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.practiceProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
                <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
              </View>
            </View>
            <TouchableOpacity style={[styles.practiceButton, { backgroundColor: item.color }]}>
              <Text style={styles.practiceButtonText}>Start</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Achievements */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Achievements</Text>
      <View style={styles.achievementsContainer}>
        {[
          { title: 'First Trace', icon: '🏆', earned: true, date: 'Yesterday' },
          { title: 'English Letter Master', icon: '🔤', earned: true, date: '2 days ago' },
          { title: 'Sinhala Letter Master', icon: '🕉️', earned: false, date: null },
          { title: 'Number Ninja', icon: '🥈', earned: false, date: null },
          { title: 'Perfect Score', icon: '💯', earned: false, date: null },
        ].map((achievement, index) => (
          <View key={index} style={[styles.achievementCard, { 
            backgroundColor: colors.surface,
            opacity: achievement.earned ? 1 : 0.5 
          }]}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
            {achievement.earned && (
              <>
                <MaterialIcons name="check-circle" size={16} color={colors.success} />
                <Text style={[styles.achievementDate, { color: colors.textLight }]}>{achievement.date}</Text>
              </>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  backText: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.xxl,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.xs,
  },
  statsCard: {
    flexDirection: 'row',
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  learningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  cardProgress: {
    gap: Spacing.xs,
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
  progressText: {
    fontSize: 12,
  },
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  practiceCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  practiceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  practiceEmoji: {
    fontSize: 32,
  },
  practiceName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  practiceProgress: {
    width: '100%',
    marginVertical: Spacing.sm,
  },
  practiceButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  practiceButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  achievementCard: {
    width: '47%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  achievementDate: {
    fontSize: 10,
  },
});