// app/child-setup.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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

import {
    createChild,
    getParentChildren,
} from '../services/apiService';

import {
    Spacing,
    Typography,
} from '../constants/theme';

import { useChild } from '../context/ChildContext';
import { useTheme } from '../context/ThemeContext';

export default function ChildSetupScreen() {
  const {
    parentProfile,
    setChildren,
  } = useChild();

  const { colors } = useTheme();

  const [alias, setAlias] = useState('');
  const [age, setAge] = useState('5');

  const [asdSeverityLevel, setAsdSeverityLevel] =
    useState<number>(1);

  const [verbalAbility, setVerbalAbility] =
    useState('limited');

  const [severityOpen, setSeverityOpen] =
    useState(false);

  const [verbalOpen, setVerbalOpen] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // ADD CHILD
  // --------------------------------------------------

  const handleAddChild = async () => {
    if (!alias.trim()) {
      Alert.alert(
        'Error',
        'Please enter a child name or alias'
      );
      return;
    }

    const numericAge = parseInt(age, 10);

    if (
      !age ||
      isNaN(numericAge) ||
      numericAge < 3 ||
      numericAge > 18
    ) {
      Alert.alert(
        'Error',
        'Please enter a valid age (3-18)'
      );
      return;
    }

    if (!parentProfile?._id) {
      Alert.alert(
        'Error',
        'Parent profile not found. Please login again.'
      );
      return;
    }

    setLoading(true);

    try {
      console.log('[ChildSetup] Creating child...');

      await createChild({
        parentId: parentProfile._id,
        alias: alias.trim(),
        age: numericAge,
        asdSeverityLevel: Number(asdSeverityLevel),
        verbalAbility,
        consentRecorded: true,
      });

      console.log(
        '[ChildSetup] Child created successfully'
      );

      console.log(
        '[ChildSetup] Fetching updated children...'
      );

      const children = await getParentChildren(
        parentProfile._id
      );

      setChildren(children);

      console.log(
        '[ChildSetup] Children updated:',
        children
      );

      // Return to child selection
      router.replace('/child-select');
    } catch (error: any) {
      console.error(
        '[ChildSetup] Failed:',
        error
      );

      Alert.alert(
        'Error',
        error?.response?.data?.error ||
          error?.message ||
          'Failed to create child profile'
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SKIP
  // --------------------------------------------------

  const handleSkip = () => {
    router.replace('/child-select');
  };

  // --------------------------------------------------
  // SEVERITY LABEL
  // --------------------------------------------------

  const getSeverityLabel = () => {
    switch (asdSeverityLevel) {
      case 1:
        return 'Level 1 - Mild';

      case 2:
        return 'Level 2 - Moderate';

      case 3:
        return 'Level 3 - Severe';

      default:
        return 'Level 1 - Mild';
    }
  };

  // --------------------------------------------------
  // VERBAL ABILITY LABEL
  // --------------------------------------------------

  const getVerbalAbilityLabel = () => {
    switch (verbalAbility) {
      case 'non-verbal':
        return 'Non-verbal';

      case 'limited':
        return 'Limited';

      case 'verbal':
        return 'Verbal';

      default:
        return 'Limited';
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
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ==========================================
            HEADER
        ========================================== */}

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
            Add Child Profile
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textLight,
              },
            ]}
          >
            Tell us about your child
          </Text>
        </View>

        {/* ==========================================
            FORM
        ========================================== */}

        <View style={styles.form}>

          {/* ========================================
              CHILD NAME
          ======================================== */}

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Child Name or Alias *
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    colors.primaryLight,
                },
              ]}
            >
              <MaterialIcons
                name="child-care"
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
                placeholder="e.g. My Child or StarFish"
                placeholderTextColor={
                  colors.textDisabled
                }
                value={alias}
                onChangeText={setAlias}
                editable={!loading}
              />
            </View>
          </View>

          {/* ========================================
              AGE
          ======================================== */}

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Age *
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    colors.primaryLight,
                },
              ]}
            >
              <MaterialIcons
                name="cake"
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
                placeholder="3-18"
                placeholderTextColor={
                  colors.textDisabled
                }
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
                editable={!loading}
                maxLength={2}
              />
            </View>
          </View>

          {/* ========================================
              ASD SEVERITY
          ======================================== */}

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              ASD Severity Level *
            </Text>

            {/* Dropdown Button */}

            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.primaryLight,
                },
              ]}
              onPress={() => {
                if (loading) return;

                setSeverityOpen(
                  !severityOpen
                );

                setVerbalOpen(false);
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {getSeverityLabel()}
              </Text>

              <MaterialIcons
                name={
                  severityOpen
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={24}
                color={colors.textLight}
              />
            </TouchableOpacity>

            {/* Dropdown Options */}

            {severityOpen && (
              <View
                style={[
                  styles.dropdownOptions,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.primaryLight,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setAsdSeverityLevel(1);
                    setSeverityOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Level 1 - Mild
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setAsdSeverityLevel(2);
                    setSeverityOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Level 2 - Moderate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setAsdSeverityLevel(3);
                    setSeverityOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Level 3 - Severe
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ========================================
              VERBAL ABILITY
          ======================================== */}

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Verbal Ability *
            </Text>

            {/* Dropdown Button */}

            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.primaryLight,
                },
              ]}
              onPress={() => {
                if (loading) return;

                setVerbalOpen(
                  !verbalOpen
                );

                setSeverityOpen(false);
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {getVerbalAbilityLabel()}
              </Text>

              <MaterialIcons
                name={
                  verbalOpen
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={24}
                color={colors.textLight}
              />
            </TouchableOpacity>

            {/* Dropdown Options */}

            {verbalOpen && (
              <View
                style={[
                  styles.dropdownOptions,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.primaryLight,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setVerbalAbility(
                      'non-verbal'
                    );
                    setVerbalOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Non-verbal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setVerbalAbility(
                      'limited'
                    );
                    setVerbalOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Limited
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setVerbalAbility(
                      'verbal'
                    );
                    setVerbalOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Verbal
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ========================================
              CONSENT
          ======================================== */}

          <View
            style={[
              styles.consentBox,
              {
                backgroundColor:
                  colors.primaryLight,
                borderLeftColor:
                  colors.primary,
              },
            ]}
          >
            <MaterialIcons
              name="info-outline"
              size={22}
              color={colors.primary}
            />

            <Text
              style={[
                styles.consentText,
                {
                  color: colors.text,
                },
              ]}
            >
              By creating this profile, you
              confirm that you have obtained
              the required consent and agree
              to the use of this information
              within the application.
            </Text>
          </View>

          {/* ========================================
              ADD CHILD BUTTON
          ======================================== */}

          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor:
                  colors.primary,
              },
              loading &&
                styles.buttonDisabled,
            ]}
            onPress={handleAddChild}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <>
                <MaterialIcons
                  name="person-add"
                  size={22}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.buttonText}
                >
                  Add Child
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ========================================
              SKIP BUTTON
          ======================================== */}

          <TouchableOpacity
            style={[
              styles.skipButton,
              {
                borderColor:
                  colors.primaryLight,
                backgroundColor:
                  colors.surface,
              },
            ]}
            onPress={handleSkip}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.skipButtonText,
                {
                  color: colors.textLight,
                },
              ]}
            >
              Skip for now
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
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
  },

  form: {
    marginTop: Spacing.sm,
  },

  inputGroup: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    minHeight: 56,
  },

  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
  },

  // --------------------------------------------------
  // CUSTOM DROPDOWN
  // --------------------------------------------------

  dropdown: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownText: {
    fontSize: Typography.fontSize.md,
  },

  dropdownOptions: {
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },

  dropdownOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },

  dropdownOptionText: {
    fontSize: Typography.fontSize.md,
  },

  // --------------------------------------------------
  // CONSENT
  // --------------------------------------------------

  consentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },

  consentText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: 19,
  },

  // --------------------------------------------------
  // BUTTONS
  // --------------------------------------------------

  addButton: {
    minHeight: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: Spacing.md,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },

  skipButton: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  skipButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});