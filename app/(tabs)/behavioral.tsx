// app/(tabs)/behavioral.tsx (Fixed with Language Support)
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
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

// Social scenarios with translation keys
const socialScenarios = [
  {
    id: '1',
    titleKey: 'greetingFriends',
    descriptionKey: 'learnHelloGoodbye',
    icon: 'waving-hand',
    color: '#9C27B0',
    difficulty: 'easy',
    completed: true,
  },
  {
    id: '2',
    titleKey: 'sharingToys',
    descriptionKey: 'practiceTakingTurns',
    icon: 'share',
    color: '#4CAF50',
    difficulty: 'easy',
    completed: true,
  },
  {
    id: '3',
    titleKey: 'understandingEmotions',
    descriptionKey: 'recognizeDifferentFeelings',
    icon: 'emoji-emotions',
    color: '#E91E63',
    difficulty: 'medium',
    completed: false,
  },
  {
    id: '4',
    titleKey: 'playingTogether',
    descriptionKey: 'groupPlayActivities',
    icon: 'groups',
    color: '#2196F3',
    difficulty: 'medium',
    completed: false,
  },
  {
    id: '5',
    titleKey: 'dealingWithAnger',
    descriptionKey: 'calmDownStrategies',
    icon: 'mood-bad',
    color: '#FF9800',
    difficulty: 'hard',
    completed: false,
  },
  {
    id: '6',
    titleKey: 'publicPlaces',
    descriptionKey: 'behaviorStoresParks',
    icon: 'store',
    color: '#4CAF50',
    difficulty: 'hard',
    completed: false,
  },
];

// Emotion cards with translation keys
const emotionCards = [
  { id: '1', emotionKey: 'happy', icon: 'sentiment-very-satisfied', color: '#FFEB3B' },
  { id: '2', emotionKey: 'sad', icon: 'sentiment-very-dissatisfied', color: '#2196F3' },
  { id: '3', emotionKey: 'angry', icon: 'sentiment-dissatisfied', color: '#FF9800' },
  { id: '4', emotionKey: 'scared', icon: 'sentiment-neutral', color: '#9C27B0' },
  { id: '5', emotionKey: 'excited', icon: 'celebration', color: '#E91E63' },
  { id: '6', emotionKey: 'calm', icon: 'self-improvement', color: '#4CAF50' },
];

export default function BehavioralScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState('3');
  const [selectedEmotion, setSelectedEmotion] = useState('');

  const renderScenario = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.scenarioCard,
        selectedScenario === item.id && { borderColor: item.color, borderWidth: 2 },
      ]}
      onPress={() => setSelectedScenario(item.id)}
    >
      <View style={[styles.scenarioIcon, { backgroundColor: item.color + '20' }]}>
        <MaterialIcons name={item.icon as any} size={32} color={item.color} />
      </View>
      <Text style={[styles.scenarioTitle, { color: colors.text }]}>
        {t(item.titleKey)}
      </Text>
      <Text style={[styles.scenarioDesc, { color: colors.textLight }]}>
        {t(item.descriptionKey)}
      </Text>
      <View style={styles.scenarioFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: item.color + '30' }]}>
          <Text style={[styles.difficultyText, { color: item.color }]}>
            {t(item.difficulty)}
          </Text>
        </View>
        {item.completed && (
          <MaterialIcons name="check-circle" size={20} color={colors.success} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmotionCard = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.emotionCard,
        selectedEmotion === item.id && { borderColor: item.color, borderWidth: 2 },
      ]}
      onPress={() => setSelectedEmotion(item.id)}
    >
      <View style={[styles.emotionIcon, { backgroundColor: item.color + '20' }]}>
        <MaterialIcons name={item.icon as any} size={40} color={item.color} />
      </View>
      <Text style={[styles.emotionText, { color: colors.text }]}>
        {t(item.emotionKey)}
      </Text>
    </TouchableOpacity>
  );

  const socialSkillsTips = [
    t('useSimpleLanguage'),
    t('practiceVisualAids'),
    t('roleplayScenarios'),
    t('positiveReinforcement'),
    t('patientConsistent'),
  ];

  const selectedEmotionText = selectedEmotion 
    ? `${t('greatYouSelected')} "${t(emotionCards.find(e => e.id === selectedEmotion)?.emotionKey || '')}"`
    : '';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('socialSkillsTraining')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {t('practiceVirtualEnvironments')}
        </Text>
      </View>

      {/* VR Practice */}
      <Card
        title={t('virtualRealityPractice')}
        description={t('safeEnvironmentPractice')}
        icon="3d-rotation"
        iconColor={colors.accentBlue}
        backgroundColor={colors.softBlue}
      >
        <View style={styles.vrContainer}>
          <Text style={[styles.vrTitle, { color: colors.text }]}>
            {t('currentScenario')}
          </Text>
          <Text style={[styles.vrDesc, { color: colors.textLight }]}>
            {t('practiceGreetingFriends')}
          </Text>
          <TouchableOpacity style={[styles.vrButton, { backgroundColor: colors.accentBlue }]}>
            <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
            <Text style={styles.vrButtonText}>{t('startVrSession')}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Emotion Recognition */}
      <Card
        title={t('emotionRecognition')}
        description={t('identifyDifferentEmotions')}
        icon="face"
        iconColor={colors.accentPink}
      >
        <Text style={[styles.sectionSubtitle, { color: colors.textLight }]}>
          {t('tapToSelect')}
        </Text>
        <FlatList
          data={emotionCards}
          renderItem={renderEmotionCard}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.emotionRow}
        />
        {selectedEmotion && (
          <View style={[styles.selectedEmotion, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.selectedEmotionText, { color: colors.primary }]}>
              {selectedEmotionText}
            </Text>
          </View>
        )}
      </Card>

      {/* Social Scenarios */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('socialScenarios')}
      </Text>
      <FlatList
        data={socialScenarios}
        renderItem={renderScenario}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.scenariosRow}
      />

      {/* Progress Tracking */}
      <Card
        title={t('progressTracking')}
        icon="trending-up"
        iconColor={colors.success}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>
              {t('socialSkills')}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '40%', backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressValue, { color: colors.text }]}>40%</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>
              {t('emotionRecognition')}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '65%', backgroundColor: colors.accentPink }]} />
            </View>
            <Text style={[styles.progressValue, { color: colors.text }]}>65%</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>
              {t('communication')}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.progressFill, { width: '30%', backgroundColor: colors.secondary }]} />
            </View>
            <Text style={[styles.progressValue, { color: colors.text }]}>30%</Text>
          </View>
        </View>
      </Card>

      {/* Tips */}
      <Card
        title={t('socialSkillsTips')}
        backgroundColor={colors.softGreen}
      >
        <View style={styles.tipsContainer}>
          {socialSkillsTips.map((tip, index) => (
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
  vrContainer: {
    alignItems: 'center',
  },
  vrTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
  },
  vrDesc: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  vrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  vrButtonText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    color: '#FFFFFF',
    marginLeft: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emotionRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  emotionCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  emotionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emotionText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  selectedEmotion: {
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  selectedEmotionText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginVertical: Spacing.lg,
  },
  scenariosRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  scenarioCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  scenarioIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  scenarioTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  scenarioDesc: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  scenarioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.xs,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressItem: {
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
    textAlign: 'right',
    marginTop: Spacing.xs,
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