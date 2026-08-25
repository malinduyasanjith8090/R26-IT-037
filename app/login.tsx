import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

import { Spacing, Typography } from '../constants/theme';
import { useChild } from '../context/ChildContext';
import { useTheme } from '../context/ThemeContext';
import { getParentChildren, loginParent } from '../services/apiService';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { setParent, setChildren } = useChild();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email.trim() || !password) {
    Alert.alert('Error', 'Please enter email and password');
    return;
  }

  setLoading(true);

  try {
    console.log('[Login] Logging in parent...');

    const result = await loginParent(
      email.trim(),
      password
    );

    console.log('[Login] Login successful');

    // Save parent + token
    await setParent(
      result.parent,
      result.token
    );

    // Fetch children
    console.log('[Login] Fetching children for parent...');

    const children = await getParentChildren(
      result.parent._id
    );

    console.log(
      '[Login] Children fetched:',
      children
    );

    setChildren(children);

    console.log(
      '[Login] Success - opening child select'
    );

    // Directly enter the app
    router.replace('/child-select');
  } catch (error) {
    console.log('[Login] Failed:', error);

    Alert.alert(
      'Login Failed',
      error?.response?.data?.error ||
        error?.message ||
        'Unable to login. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password?',
      'Password reset functionality will be available soon.'
    );
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
            Welcome Back!
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textLight,
              },
            ]}
          >
            Sign in to continue
          </Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logo,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
          >
            <MaterialIcons
              name="spa"
              size={60}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={styles.passwordToggle}
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

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text
              style={[
                styles.forgotPasswordText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: colors.primary,
              },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: '#FFFFFF',
                    },
                  ]}
                >
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: '#FFFFFF',
                  },
                ]}
              >
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: colors.textLight,
              },
            ]}
          >
            Don't have an account?{' '}
          </Text>

          <TouchableOpacity
              onPress={() => router.replace('/signup')}
            disabled={loading}
          >
            <Text
              style={[
                styles.registerLink,
                {
                  color: colors.primary,
                },
              ]}
            >
              Create one
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

  logoContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  form: {
    marginVertical: Spacing.xl,
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

  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: Spacing.md,
  },

  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },

  loginButton: {
    marginTop: Spacing.md,
    minHeight: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
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

  registerLink: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
});