// app/welcome.tsx (Updated)
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import Button from '../components/Button';
import { Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

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
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bloom Logo/Icon */}
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
          <MaterialIcons name="spa" size={80} color={colors.primary} />
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
            <MaterialIcons name="school" size={24} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>{t('personalizedLearning')}</Text>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="games" size={24} color={colors.secondary} />
            <Text style={[styles.featureText, { color: colors.text }]}>{t('funEducationalGames')}</Text>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="schedule" size={24} color={colors.accentBlue} />
            <Text style={[styles.featureText, { color: colors.text }]}>{t('dailyRoutineSupport')}</Text>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="face" size={24} color={colors.accentPink} />
            <Text style={[styles.featureText, { color: colors.text }]}>{t('socialSkills')}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  features: {
    marginVertical: Spacing.xl,
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
  },
  buttonContainer: {
    marginBottom: Spacing.xl,
  },
  button: {
    marginVertical: Spacing.sm,
  },
});