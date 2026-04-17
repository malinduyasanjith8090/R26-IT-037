// app/signup.tsx (Fixed)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Button from '../components/Button';
import { Typography, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function SignupScreen() {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    childName: '',
    childAge: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    const { name, email, password, confirmPassword, childName, childAge } = formData;
    
    if (!name || !email || !password || !confirmPassword || !childName || !childAge) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push('/(tabs)');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>Join Bloom community</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Parent Information */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Parent Information</Text>
          
          <View style={[styles.inputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight 
          }]}>
            <MaterialIcons name="person" size={24} color={colors.textLight} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Your Name"
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholderTextColor={colors.textDisabled}
            />
          </View>

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight 
          }]}>
            <MaterialIcons name="email" size={24} color={colors.textLight} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textDisabled}
            />
          </View>

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight 
          }]}>
            <MaterialIcons name="lock" size={24} color={colors.textLight} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry={!showPassword}
              placeholderTextColor={colors.textDisabled}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight 
          }]}>
            <MaterialIcons name="lock-outline" size={24} color={colors.textLight} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              secureTextEntry={!showPassword}
              placeholderTextColor={colors.textDisabled}
            />
          </View>

          {/* Child Information */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Child Information</Text>
          
          <View style={[styles.inputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight 
          }]}>
            <MaterialIcons name="child-care" size={24} color={colors.textLight} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Child's Name"
              value={formData.childName}
              onChangeText={(value) => handleChange('childName', value)}
              placeholderTextColor={colors.textDisabled}
            />
          </View>

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight 
          }]}>
            <MaterialIcons name="cake" size={24} color={colors.textLight} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Child's Age"
              value={formData.childAge}
              onChangeText={(value) => handleChange('childAge', value)}
              keyboardType="numeric"
              placeholderTextColor={colors.textDisabled}
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleSignup}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.signupButton}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.primaryLight }]} />
            <Text style={[styles.dividerText, { color: colors.textLight }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.primaryLight }]} />
          </View>

          <Button
            title="Continue as Guest"
            onPress={() => router.push('/dashboard')}
            variant="outline"
            size="large"
          />
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
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
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
  },
  signupButton: {
    marginTop: Spacing.lg,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
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