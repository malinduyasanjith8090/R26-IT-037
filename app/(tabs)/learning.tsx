// app/(tabs)/learning.tsx (Complete Updated Version with Words Module)
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AnimalsLearning from '../../components/AnimalsLearning';
import ColorsLearning from '../../components/ColorsLearning';
import FruitsLearning from '../../components/FruitsLearning';
import ShapesLearning from '../../components/ShapesLearning';
import TracingGame from '../../components/TracingCanvas';
import WordsLearning from '../../components/WordsLearning';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function LearningScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const [selectedType, setSelectedType] = useState<'letters' | 'sinhala' | 'numbers' | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<'colors' | 'shapes' | 'animals' | 'fruits' | 'words' | null>(null);
  const [learningProgress, setLearningProgress] = useState(0);

  // Handle Tracing Game (Letters/Numbers)
  if (selectedType) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedType(null)}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>
            {language === 'en' ? 'Back to Learning' : 'ඉගෙනීමට ආපසු'}
          </Text>
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

  // Handle Practice Modules (Colors, Shapes, Animals, Fruits, Words)
  if (selectedPractice) {
    const PracticeComponent = {
      colors: ColorsLearning,
      shapes: ShapesLearning,
      animals: AnimalsLearning,
      fruits: FruitsLearning,
      words: WordsLearning,
    }[selectedPractice];

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PracticeComponent
          onBack={() => setSelectedPractice(null)}
          onProgress={(progress: number) => console.log('Practice progress:', progress)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'en' ? 'Learning Journey' : 'ඉගෙනුම් ගමන'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {language === 'en' ? 'Trace and learn letters & numbers' : 'අකුරු සහ අංක සොයා ගෙන ඉගෙන ගන්න'}
        </Text>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <MaterialIcons name="stars" size={32} color={colors.accentYellow} />
          <Text style={[styles.statValue, { color: colors.text }]}>245</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>
            {language === 'en' ? 'Stars Earned' : 'තරු උපයා ඇත'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="emoji-events" size={32} color={colors.accentOrange} />
          <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>
            {language === 'en' ? 'Badges' : 'පදක්කම්'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="local-fire-department" size={32} color={colors.accentPink} />
          <Text style={[styles.statValue, { color: colors.text }]}>7</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>
            {language === 'en' ? 'Day Streak' : 'දින අඛණ්ඩතාව'}
          </Text>
        </View>
      </View>

      {/* Tracing Learning Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {language === 'en' ? 'Trace & Learn' : 'ලිහිල් කර ඉගෙන ගන්න'}
      </Text>
      
      {/* English Letters Card */}
      <TouchableOpacity
        style={[styles.learningCard, { backgroundColor: colors.surface }]}
        onPress={() => setSelectedType('letters')}
      >
        <View style={[styles.cardIcon, { backgroundColor: '#FF6B6B20' }]}>
          <Text style={styles.cardEmoji}>🔤</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'en' ? 'English Letters A-Z' : 'ඉංග්‍රීසි අකුරු A-Z'}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textLight }]}>
            {language === 'en' 
              ? 'Trace uppercase English letters from A to Z with guided dotted lines'
              : 'මඟ පෙන්වන තිත් රේඛා සමඟ A සිට Z දක්වා ඉංග්‍රීසි ලොකු අකුරු සොයා ගන්න'}
          </Text>
          <View style={styles.cardProgress}>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '60%', backgroundColor: '#FF6B6B' }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>
              {language === 'en' ? '15/26 Completed' : '15/26 සම්පූර්ණයි'}
            </Text>
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
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'en' ? 'Sinhala Letters' : 'සිංහල අකුරු'}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textLight }]}>
            {language === 'en'
              ? 'Trace Sinhala letters including vowels and consonants with guided dotted lines'
              : 'මඟ පෙන්වන තිත් රේඛා සමඟ ස්වර සහ ව්‍යාංජන ඇතුළු සිංහල අකුරු සොයා ගන්න'}
          </Text>
          <View style={styles.cardProgress}>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '30%', backgroundColor: '#9C27B0' }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>
              {language === 'en' ? '18/60 Completed' : '18/60 සම්පූර්ණයි'}
            </Text>
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
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'en' ? 'Numbers 0-9' : 'අංක 0-9'}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textLight }]}>
            {language === 'en'
              ? 'Trace numbers with fun animations and voice guidance'
              : 'විනෝදජනක සජීවිකරණ සහ හඬ මඟ පෙන්වීම් සමඟ අංක සොයා ගන්න'}
          </Text>
          <View style={styles.cardProgress}>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '40%', backgroundColor: '#4ECDC4' }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>
              {language === 'en' ? '4/10 Completed' : '4/10 සම්පූර්ණයි'}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={32} color={colors.textLight} />
      </TouchableOpacity>

      {/* Practice Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {language === 'en' ? 'Practice Zone' : 'පුහුණු කලාපය'}
      </Text>
      <View style={styles.practiceGrid}>
        {/* Colors Card */}
        <TouchableOpacity 
          style={[styles.practiceCard, { backgroundColor: colors.surface }]}
          onPress={() => setSelectedPractice('colors')}
        >
          <View style={[styles.practiceIcon, { backgroundColor: '#FF6B6B20' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: '#FF0000' }]} />
            <View style={[styles.colorSwatch, { backgroundColor: '#00FF00', marginTop: 4 }]} />
            <View style={[styles.colorSwatch, { backgroundColor: '#0000FF', marginTop: 4 }]} />
          </View>
          <Text style={[styles.practiceName, { color: colors.text }]}>
            {language === 'en' ? 'Colors' : 'වර්ණ'}
          </Text>
          <Text style={[styles.practiceDesc, { color: colors.textLight }]}>
            {language === 'en' ? 'Learn basic colors' : 'මූලික වර්ණ ඉගෙන ගන්න'}
          </Text>
          <TouchableOpacity style={[styles.practiceButton, { backgroundColor: '#FF6B6B' }]}>
            <Text style={styles.practiceButtonText}>
              {language === 'en' ? 'Start' : 'ආරම්භ කරන්න'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Shapes Card */}
        <TouchableOpacity 
          style={[styles.practiceCard, { backgroundColor: colors.surface }]}
          onPress={() => setSelectedPractice('shapes')}
        >
          <View style={[styles.practiceIcon, { backgroundColor: '#4ECDC420' }]}>
            <View style={[styles.shapeDemo, { backgroundColor: '#4ECDC4', borderRadius: 30 }]} />
            <View style={[styles.shapeDemo, { backgroundColor: '#4ECDC4', borderRadius: 8, marginTop: 4 }]} />
          </View>
          <Text style={[styles.practiceName, { color: colors.text }]}>
            {language === 'en' ? 'Shapes' : 'හැඩතල'}
          </Text>
          <Text style={[styles.practiceDesc, { color: colors.textLight }]}>
            {language === 'en' ? 'Learn basic shapes' : 'මූලික හැඩතල ඉගෙන ගන්න'}
          </Text>
          <TouchableOpacity style={[styles.practiceButton, { backgroundColor: '#4ECDC4' }]}>
            <Text style={styles.practiceButtonText}>
              {language === 'en' ? 'Start' : 'ආරම්භ කරන්න'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Animals Card */}
        <TouchableOpacity 
          style={[styles.practiceCard, { backgroundColor: colors.surface }]}
          onPress={() => setSelectedPractice('animals')}
        >
          <View style={[styles.practiceIcon, { backgroundColor: '#FFD16620' }]}>
            <Text style={styles.animalIconDemo}>🐶</Text>
            <Text style={styles.animalIconDemo}>🐱</Text>
          </View>
          <Text style={[styles.practiceName, { color: colors.text }]}>
            {language === 'en' ? 'Animals' : 'සතුන්'}
          </Text>
          <Text style={[styles.practiceDesc, { color: colors.textLight }]}>
            {language === 'en' ? 'Learn about animals' : 'සතුන් ගැන ඉගෙන ගන්න'}
          </Text>
          <TouchableOpacity style={[styles.practiceButton, { backgroundColor: '#FFD166' }]}>
            <Text style={styles.practiceButtonText}>
              {language === 'en' ? 'Start' : 'ආරම්භ කරන්න'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Fruits Card */}
        <TouchableOpacity 
          style={[styles.practiceCard, { backgroundColor: colors.surface }]}
          onPress={() => setSelectedPractice('fruits')}
        >
          <View style={[styles.practiceIcon, { backgroundColor: '#06D6A020' }]}>
            <Text style={styles.fruitIconDemo}>🍎</Text>
            <Text style={styles.fruitIconDemo}>🍌</Text>
          </View>
          <Text style={[styles.practiceName, { color: colors.text }]}>
            {language === 'en' ? 'Fruits' : 'පලතුරු'}
          </Text>
          <Text style={[styles.practiceDesc, { color: colors.textLight }]}>
            {language === 'en' ? 'Learn about fruits' : 'පලතුරු ගැන ඉගෙන ගන්න'}
          </Text>
          <TouchableOpacity style={[styles.practiceButton, { backgroundColor: '#06D6A0' }]}>
            <Text style={styles.practiceButtonText}>
              {language === 'en' ? 'Start' : 'ආරම්භ කරන්න'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Words Card - NEW */}
        <TouchableOpacity 
          style={[styles.practiceCard, { backgroundColor: colors.surface }]}
          onPress={() => setSelectedPractice('words')}
        >
          <View style={[styles.practiceIcon, { backgroundColor: '#9C27B020' }]}>
            <Text style={styles.wordIconDemo}>📚</Text>
            <Text style={styles.wordIconDemo}>🔤</Text>
          </View>
          <Text style={[styles.practiceName, { color: colors.text }]}>
            {language === 'en' ? 'Words' : 'වචන'}
          </Text>
          <Text style={[styles.practiceDesc, { color: colors.textLight }]}>
            {language === 'en' ? 'Learn English & Sinhala words' : 'ඉංග්‍රීසි සහ සිංහල වචන ඉගෙන ගන්න'}
          </Text>
          <TouchableOpacity style={[styles.practiceButton, { backgroundColor: '#9C27B0' }]}>
            <Text style={styles.practiceButtonText}>
              {language === 'en' ? 'Start' : 'ආරම්භ කරන්න'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Bilingual Learning Banner */}
      <View style={[styles.bilingualBanner, { backgroundColor: colors.primaryLight + '20', marginHorizontal: Spacing.lg, marginVertical: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg }]}>
        <View style={styles.languageFlags}>
          <Text style={styles.flagEmoji}>🇬🇧</Text>
          <MaterialIcons name="swap-horiz" size={24} color={colors.primary} />
          <Text style={styles.flagEmoji}>🇱🇰</Text>
        </View>
        <Text style={[styles.bilingualText, { color: colors.text }]}>
          {language === 'en' 
            ? 'Learn both English and Sinhala words!' 
            : 'ඉංග්‍රීසි සහ සිංහල වචන දෙකම ඉගෙන ගන්න!'}
        </Text>
      </View>

      {/* Achievements */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {language === 'en' ? 'Recent Achievements' : 'මෑත ජයග්‍රහණ'}
      </Text>
      <View style={styles.achievementsContainer}>
        {[
          { title: language === 'en' ? 'First Trace' : 'පළමු ලුහුබැඳීම', icon: '🏆', earned: true, date: language === 'en' ? 'Yesterday' : 'ඊයේ' },
          { title: language === 'en' ? 'English Letter Master' : 'ඉංග්‍රීසි අකුරු ප්‍රවීණයා', icon: '🔤', earned: true, date: language === 'en' ? '2 days ago' : 'දින 2කට පෙර' },
          { title: language === 'en' ? 'Color Explorer' : 'වර්ණ ගවේෂකයා', icon: '🎨', earned: true, date: language === 'en' ? '3 days ago' : 'දින 3කට පෙර' },
          { title: language === 'en' ? 'Sinhala Letter Master' : 'සිංහල අකුරු ප්‍රවීණයා', icon: '🕉️', earned: false, date: null },
          { title: language === 'en' ? 'Number Ninja' : 'අංක නින්ජා', icon: '🔢', earned: false, date: null },
          { title: language === 'en' ? 'Shape Master' : 'හැඩතල ප්‍රවීණයා', icon: '🔷', earned: false, date: null },
          { title: language === 'en' ? 'Word Wizard' : 'වචන මායාකාරයා', icon: '📚', earned: false, date: null },
          { title: language === 'en' ? 'Vocabulary Star' : 'වචන තරුව', icon: '⭐', earned: false, date: null },
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  colorSwatch: {
    width: 40,
    height: 20,
    borderRadius: 4,
  },
  shapeDemo: {
    width: 40,
    height: 40,
  },
  animalIconDemo: {
    fontSize: 28,
  },
  fruitIconDemo: {
    fontSize: 28,
  },
  wordIconDemo: {
    fontSize: 28,
  },
  practiceName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: Spacing.sm,
  },
  practiceDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: Spacing.xs,
  },
  practiceButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    width: '80%',
    alignItems: 'center',
  },
  practiceButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bilingualBanner: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  languageFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  flagEmoji: {
    fontSize: 32,
  },
  bilingualText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  achievementCard: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 11,
    textAlign: 'center',
  },
  achievementDate: {
    fontSize: 10,
  },
});