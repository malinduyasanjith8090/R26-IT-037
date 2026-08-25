import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { Spacing, Typography } from '../constants/theme';
import { useChild } from '../context/ChildContext';
import { useTheme } from '../context/ThemeContext';
import { registerParent } from '../services/apiService';

export default function SignupScreen() {
  const { colors } = useTheme();
  const { setParent, setChildren } = useChild();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Error',
        'Password must be at least 8 characters'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await registerParent(
        fullName.trim(),
        email.trim(),
        password,
        confirmPassword
      );

      // Save parent profile and token
      await setParent(result.parent, result.token);

      // New parent has no children yet
      setChildren([]);

      console.log(
        '[Register] Success - navigating via context state change'
      );

      // No navigation call here.
      // ChildProvider state change should update
      // the application's authenticated state.
    } catch (error) {
      console.log('[Register] Failed:', error);

      Alert.alert(
        'Registration Failed',
        error?.response?.data?.error ||
          error?.message ||
          'Unable to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Create Account
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textLight,
              },
            ]}
          >
            Join us to start tracing
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Parent Information */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.primary,
              },
            ]}
          >
            Parent Information
          </Text>

          {/* Full Name */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primaryLight,
              },
            ]}
          >
            <MaterialIcons
              name="person"
              size={24}
              color={colors.textLight}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Full Name"
              placeholderTextColor={colors.textDisabled}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primaryLight,
              },
            ]}
          >
            <MaterialIcons
              name="email"
              size={24}
              color={colors.textLight}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Email Address"
              placeholderTextColor={colors.textDisabled}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primaryLight,
              },
            ]}
          >
            <MaterialIcons
              name="lock"
              size={24}
              color={colors.textLight}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={colors.textDisabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() =>
                setShowPassword(!showPassword)
              }
              disabled={loading}
            >
              <MaterialIcons
                name={
                  showPassword
                    ? 'visibility-off'
                    : 'visibility'
                }
                size={24}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primaryLight,
              },
            ]}
          >
            <MaterialIcons
              name="lock-outline"
              size={24}
              color={colors.textLight}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textDisabled}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              disabled={loading}
            >
              <MaterialIcons
                name={
                  showConfirmPassword
                    ? 'visibility-off'
                    : 'visibility'
                }
                size={24}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              {
                backgroundColor: colors.primary,
              },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: '#FFFFFF',
                  },
                ]}
              >
                Creating Account...
              </Text>
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: '#FFFFFF',
                  },
                ]}
              >
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            />

            <Text
              style={[
                styles.dividerText,
                {
                  color: colors.textLight,
                },
              ]}
            >
              OR
            </Text>

            <View
              style={[
                styles.dividerLine,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            />
          </View>

          {/* Guest */}
          <TouchableOpacity
            style={[
              styles.guestButton,
              {
                borderColor: colors.primary,
              },
            ]}
              onPress={() => router.replace('/(tabs)')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.guestButtonText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: colors.textLight,
              },
            ]}
          >
            Already have an account?{' '}
          </Text>

          <TouchableOpacity
            onPress={() => router.replace('/login')}
            disabled={loading}
          >
            <Text
              style={[
                styles.loginLink,
                {
                  color: colors.primary,
                },
              ]}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
  },

  header: {
    marginTop: Spacing.xl,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  title: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.xxl,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.xl,
  },

  form: {
    marginVertical: Spacing.xl,
  },

  sectionTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginVertical: Spacing.md,
    marginTop: Spacing.lg,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    minHeight: 58,
  },

  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
  },

  passwordToggle: {
    padding: 4,
  },

  registerButton: {
    marginTop: Spacing.lg,
    minHeight: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },

  dividerLine: {
    flex: 1,
    height: 1,
  },

  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },

  guestButton: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  guestButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },

  footerText: {
    fontSize: Typography.fontSize.md,
  },

  loginLink: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
});