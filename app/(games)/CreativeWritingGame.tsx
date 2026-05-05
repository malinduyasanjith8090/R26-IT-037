// app/(games)/CreativeWritingGame.tsx (with Sounds & Haptics)
import { MaterialIcons } from '@expo/vector-icons';
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
import { useSound } from '../../hooks/useSound';

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
  const { 
    playSound, 
    playCelebration, 
    playStarEarned, 
    playCorrectAnswer,
    toggleSound,
    isEnabled: soundEnabled 
  } = useSound();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [responses, setResponses] = useState<{ id: string; answer: string }[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [showTypingFeedback, setShowTypingFeedback] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const currentActivity = activities[currentIndex];

  const handleSubmit = async () => {
    if (userAnswer.trim().length === 0) {
      await playSound('error', true);
      setShowTypingFeedback(true);
      setTimeout(() => setShowTypingFeedback(false), 2000);
      return;
    }

    await playCorrectAnswer();
    setResponses([...responses, { id: currentActivity.id, answer: userAnswer }]);
    setUserAnswer('');

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    if (currentIndex + 1 >= activities.length) {
      const earnedStars = Math.floor(responses.length / 2) + 1;
      const finalStars = earnedStars > 3 ? 3 : earnedStars;
      setStars(finalStars);
      
      // Play star sounds for each star earned
      for (let i = 0; i < finalStars; i++) {
        setTimeout(() => playSound('star', false), i * 300);
      }
      
      await playCelebration();
      setShowComplete(true);
    } else {
      setShowReward(true);
      await playStarEarned();
      setTimeout(() => {
        setShowReward(false);
        setCurrentIndex(currentIndex + 1);
        playSound('click', false);
      }, 2000);
    }
  };

  const resetGame = async () => {
    await playSound('click', false);
    setCurrentIndex(0);
    setResponses([]);
    setUserAnswer('');
    setShowComplete(false);
  };

  const handleBackPress = async () => {
    await playSound('goodbye', false);
    router.back();
  };

  const handleType = (text: string) => {
    setUserAnswer(text);
    // Play soft click on each character (optional - might be too much)
    // Uncomment if you want typing sounds
    // if (text.length > userAnswer.length) {
    //   playSound('click', false);
    // }
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
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'en' ? 'Creative Writing' : 'නිර්මාණාත්මක ලිවීම'}
        </Text>
        
        {/* Sound Toggle Button */}
        <TouchableOpacity 
          style={styles.soundButton}
          onPress={async () => {
            await playSound('click', false);
            toggleSound();
          }}
        >
          <MaterialIcons 
            name={soundEnabled ? "volume-up" : "volume-off"} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
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
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {language === 'en' ? 'Activity' : 'ක්‍රියාකාරකම'} {currentIndex + 1} of {activities.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Activity Card */}
        <Animated.View style={[styles.activityCard, { backgroundColor: colors.surface, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.activityEmoji}>{currentActivity.emoji}</Text>
          <Text style={[styles.activityTitle, { color: colors.text }]}>
            {language === 'en' ? currentActivity.title : currentActivity.titleSin}
          </Text>
          <Text style={[styles.activityInstruction, { color: colors.textLight }]}>
            {language === 'en' ? currentActivity.instruction : currentActivity.instructionSin}
          </Text>
        </Animated.View>

        {/* Writing Area */}
        <View style={[styles.writingArea, { backgroundColor: colors.surface }]}>
          <Text style={[styles.writingLabel, { color: colors.text }]}>
            {language === 'en' ? 'Your Answer:' : 'ඔබගේ පිළිතුර:'}
          </Text>
          <TextInput
            style={[styles.textInput, { color: colors.text, borderColor: colors.primaryLight }]}
            value={userAnswer}
            onChangeText={handleType}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder={language === 'en' ? "Type your creative answer here..." : "ඔබගේ නිර්මාණාත්මක පිළිතුර මෙහි ටයිප් කරන්න..."}
            placeholderTextColor={colors.textLight}
          />
          
          {/* Character count */}
          <Text style={[styles.charCount, { color: colors.textLight }]}>
            {userAnswer.length} characters
          </Text>
        </View>

        {/* Typing Feedback */}
        {showTypingFeedback && (
          <View style={[styles.typingFeedback, { backgroundColor: colors.error + '20' }]}>
            <MaterialIcons name="warning" size={20} color={colors.error} />
            <Text style={[styles.typingFeedbackText, { color: colors.error }]}>
              {language === 'en' ? 'Please write something before submitting!' : 'ඉදිරිපත් කිරීමට පෙර කරුණාකර යමක් ලියන්න!'}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <MaterialIcons name="send" size={24} color="#FFF" />
          <Text style={styles.submitButtonText}>
            {language === 'en' ? 'Submit' : 'ඉදිරිපත් කරන්න'}
          </Text>
        </TouchableOpacity>

        {/* Creative Tips */}
        <View style={[styles.tipsContainer, { backgroundColor: colors.primaryLight + '20' }]}>
          <MaterialIcons name="lightbulb" size={20} color={colors.accentYellow} />
          <Text style={[styles.tipsText, { color: colors.textLight }]}>
            {language === 'en' 
              ? '✨ Tip: Be creative! Use descriptive words and have fun!' 
              : '✨ ඉඟිය: නිර්මාණශීලී වන්න! විස්තරාත්මක වචන භාවිතා කර විනෝද වන්න!'}
          </Text>
        </View>

        {/* Previous Responses */}
        {responses.length > 0 && (
          <View style={[styles.responsesContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.responsesHeader}>
              <Text style={[styles.responsesTitle, { color: colors.text }]}>
                {language === 'en' ? '✨ Your Creative Work ✨' : '✨ ඔබගේ නිර්මාණාත්මක කාර්යය ✨'}
              </Text>
              <MaterialIcons name="celebration" size={24} color={colors.primary} />
            </View>
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
              <Text style={[styles.rewardTitle, { color: colors.text }]}>
                {language === 'en' ? 'Great Creativity!' : 'විශිෂ්ට නිර්මාණශීලිත්වය!'}
              </Text>
              <Text style={[styles.rewardMessage, { color: colors.textLight }]}>
                {language === 'en' ? 'You\'re doing amazing!' : 'ඔබ පුදුම සහගත ලෙස කරනවා!'}
              </Text>
              <View style={styles.rewardStars}>
                <Text>⭐</Text>
                <Text>⭐</Text>
                <Text>⭐</Text>
              </View>
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
              <Text style={[styles.completeTitle, { color: colors.text }]}>
                {language === 'en' ? 'Writing Champion!' : 'ලිවීමේ ශූරයා!'}
              </Text>
              <Text style={[styles.completeMessage, { color: colors.textLight }]}>
                {language === 'en' 
                  ? 'You completed all creative activities!' 
                  : 'ඔබ සියලු නිර්මාණාත්මක ක්‍රියාකාරකම් සම්පූර්ණ කළා!'}
              </Text>
              {getStarRating(stars)}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={resetGame}
                >
                  <MaterialIcons name="replay" size={20} color="#FFF" />
                  <Text style={styles.modalButtonText}>
                    {language === 'en' ? 'Play Again' : 'නැවත සෙල්ලම් කරන්න'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={handleBackPress}
                >
                  <MaterialIcons name="home" size={20} color="#FFF" />
                  <Text style={styles.modalButtonText}>
                    {language === 'en' ? 'Back to Menu' : 'මෙනුවට ආපසු'}
                  </Text>
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
  soundButton: { padding: Spacing.sm },
  title: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  progressContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.xs },
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xxl },
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
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  typingFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  typingFeedbackText: { fontSize: 14, flex: 1 },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipsText: { fontSize: 14, flex: 1 },
  responsesContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  responsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  responsesTitle: { fontSize: 18, fontWeight: 'bold' },
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
  rewardStars: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  completeModal: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  completeEmoji: { fontSize: 60 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', marginTop: Spacing.md },
  completeMessage: { fontSize: 16, marginTop: Spacing.sm, textAlign: 'center' },
  starsContainer: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.xs },
  modalButtons: { 
    flexDirection: 'row', 
    gap: Spacing.md, 
    marginTop: Spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});