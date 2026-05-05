// app/(games)/CreativeWritingGame.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Activity {
  id: string;
  title: string;
  titleSin: string;
  instruction: string;
  instructionSin: string;
  emoji: string;
  type: 'sentence' | 'story' | 'word';
}

const activities: Activity[] = [
  {
    id: 'sentence-1',
    title: 'Make a Sentence',
    titleSin: 'වාක්‍යයක් සාදන්න',
    instruction: 'Use the word "Happy" to make a sentence',
    instructionSin: '"සතුටු" යන වචනය භාවිතා කර වාක්‍යයක් සාදන්න',
    emoji: '😊',
    type: 'sentence',
  },
  {
    id: 'sentence-2',
    title: 'Make a Sentence',
    titleSin: 'වාක්‍යයක් සාදන්න',
    instruction: 'Use the word "Big" to make a sentence',
    instructionSin: '"ලොකු" යන වචනය භාවිතා කර වාක්‍යයක් සාදන්න',
    emoji: '🐘',
    type: 'sentence',
  },
  {
    id: 'story-1',
    title: 'Complete the Story',
    titleSin: 'කතාව සම්පූර්ණ කරන්න',
    instruction: 'The cat is _______. (finish the sentence)',
    instructionSin: 'බළලා _______ ය. (වාක්‍යය සම්පූර්ණ කරන්න)',
    emoji: '🐱',
    type: 'story',
  },
  {
    id: 'story-2',
    title: 'Complete the Story',
    titleSin: 'කතාව සම්පූර්ණ කරන්න',
    instruction: 'Today I feel _______ because _______',
    instructionSin: 'අද මට _______ දැනෙනවා, මන්ද _______',
    emoji: '💭',
    type: 'story',
  },
  {
    id: 'word-1',
    title: 'Describe the Picture',
    titleSin: 'පින්තූරය විස්තර කරන්න',
    instruction: 'Describe a sunny day in 3 words',
    instructionSin: 'අව්ව දවසක් වචන 3 කින් විස්තර කරන්න',
    emoji: '☀️',
    type: 'word',
  },
  {
    id: 'word-2',
    title: 'Describe the Picture',
    titleSin: 'පින්තූරය විස්තර කරන්න',
    instruction: 'Describe your favorite food',
    instructionSin: 'ඔබගේ ප්‍රියතම ආහාරය විස්තර කරන්න',
    emoji: '🍕',
    type: 'word',
  },
];

export default function CreativeWritingGame() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [responses, setResponses] = useState<{ id: string; answer: string }[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const currentActivity = activities[currentIndex];

  const handleSubmit = () => {
    if (userAnswer.trim().length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResponses([...responses, { id: currentActivity.id, answer: userAnswer }]);
    setUserAnswer('');

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    if (currentIndex + 1 >= activities.length) {
      const earnedStars = Math.floor(responses.length / 2) + 1;
      setStars(earnedStars > 3 ? 3 : earnedStars);
      setShowComplete(true);
    } else {
      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setCurrentIndex(currentIndex + 1);
      }, 2000);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setResponses([]);
    setUserAnswer('');
    setShowComplete(false);
  };

  const getStarRating = (starCount: number) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= starCount ? 'star' : 'star-border'}
          size={40}
          color="#FFD700"
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Creative Writing</Text>
        <View style={[styles.progressBadge, { backgroundColor: colors.surface }]}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {currentIndex + 1}/{activities.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex) / activities.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Activity Card */}
        <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.activityEmoji}>{currentActivity.emoji}</Text>
          <Text style={[styles.activityTitle, { color: colors.text }]}>
            {language === 'en' ? currentActivity.title : currentActivity.titleSin}
          </Text>
          <Text style={[styles.activityInstruction, { color: colors.textLight }]}>
            {language === 'en' ? currentActivity.instruction : currentActivity.instructionSin}
          </Text>
        </View>

        {/* Writing Area */}
        <View style={[styles.writingArea, { backgroundColor: colors.surface }]}>
          <Text style={[styles.writingLabel, { color: colors.text }]}>Your Answer:</Text>
          <TextInput
            style={[styles.textInput, { color: colors.text, borderColor: colors.primaryLight }]}
            value={userAnswer}
            onChangeText={setUserAnswer}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Type your answer here..."
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <MaterialIcons name="send" size={24} color="#FFF" />
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        {/* Previous Responses */}
        {responses.length > 0 && (
          <View style={[styles.responsesContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.responsesTitle, { color: colors.text }]}>
              Your Creative Work ✨
            </Text>
            {responses.map((response, idx) => (
              <View key={idx} style={[styles.responseItem, { borderColor: colors.primaryLight }]}>
                <Text style={[styles.responseEmoji, { color: colors.primary }]}>
                  {activities.find(a => a.id === response.id)?.emoji}
                </Text>
                <Text style={[styles.responseText, { color: colors.text }]}>
                  {response.answer}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Reward Modal */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.rewardEmoji}>✨</Text>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>Great Creativity!</Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>
                You're doing amazing!
              </Text>
            </Animated.View>
          </View>
        </View>
      </Modal>

      {/* Complete Modal */}
      <Modal visible={showComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.completeModal, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.completeEmoji}>🏆</Text>
              <Text style={[styles.completeTitle, { color: colors.text }]}>Writing Champion!</Text>
              <Text style={[styles.completeMessage, { color: colors.textLight }]}>
                You completed all creative activities!
              </Text>
              {getStarRating(stars)}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={resetGame}
                >
                  <Text style={styles.modalButtonText}>Play Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.modalButtonText}>Back to Menu</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  backButton: { padding: Spacing.sm },
  title: { fontSize: Typography.fontSize.lg, fontWeight: 'bold' },
  progressBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  progressText: { fontSize: Typography.fontSize.md, fontWeight: 'bold' },
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  content: { padding: Spacing.md, gap: Spacing.lg },
  activityCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  activityEmoji: { fontSize: 60, marginBottom: Spacing.md },
  activityTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: Spacing.sm },
  activityInstruction: { fontSize: 16, textAlign: 'center' },
  writingArea: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  writingLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  textInput: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  responsesContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  responsesTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: Spacing.md },
  responseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  responseEmoji: { fontSize: 24 },
  responseText: { flex: 1, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardModal: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  rewardEmoji: { fontSize: 60 },
  rewardTitle: { fontSize: 24, fontWeight: 'bold', marginTop: Spacing.md },
  rewardMessage: { fontSize: 16, marginTop: Spacing.sm },
  completeModal: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  completeEmoji: { fontSize: 60 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', marginTop: Spacing.md },
  completeMessage: { fontSize: 16, marginTop: Spacing.sm, textAlign: 'center' },
  starsContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.xs },
  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  modalButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});