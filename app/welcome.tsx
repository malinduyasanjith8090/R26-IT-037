// app/welcome.tsx (improved layout & animation)
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/Button';
import { Spacing } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // ✅ create animations once with useRef
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
            <MaterialIcons name="spa" size={70} color={colors.primary} />
          </View>
          <Text style={[styles.logoText, { color: colors.primary }]}>Bloom</Text>
          <Text style={[styles.tagline, { color: colors.textLight }]}>Growing Together</Text>
        </Animated.View>

        {/* Welcome Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{t('welcome')} to Bloom</Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            A gentle learning companion for children with Autism Spectrum Disorder
          </Text>

          <View style={styles.features}>
            <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="school" size={22} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t('personalizedLearning')}
              </Text>
            </View>
            <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="games" size={22} color={colors.secondary} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t('funEducationalGames')}
              </Text>
            </View>
            <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="schedule" size={22} color={colors.accentBlue} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t('dailyRoutineSupport')}
              </Text>
            </View>
            <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="face" size={22} color={colors.accentPink} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t('socialSkills')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Button
            title={t('getStarted')}
            onPress={() => router.push('/onboarding')}
            variant="primary"
            size="large"
            style={styles.button}
          />
          <Button
            title={t('alreadyHaveAccount')}
            onPress={() => router.push('/login')}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 44,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    marginTop: Spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
  features: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: Spacing.md,
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  button: {
    marginVertical: Spacing.sm,
  },
});