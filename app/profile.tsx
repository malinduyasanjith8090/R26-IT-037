// app/profile.tsx – Connected to backend with TypeScript fixes
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../components/Button';
import { BorderRadius, Spacing } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getProfile, updateProfile } from '../services/api';

// Helper to safely extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong';
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    childGender: 'Male',
  });

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile({
          parentName: data.parentName || '',
          email: data.email || '',
          phone: data.phone || '',
          childName: data.childName || '',
          childAge: String(data.childAge || ''),
          childGender: data.childGender || 'Male',
        });
      } catch (error: unknown) {
        // No need to alert on first load; just log
        console.warn('Error loading profile:', getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        parentName: profile.parentName,
        email: profile.email,
        phone: profile.phone,
        childName: profile.childName,
        childAge: Number(profile.childAge),
        childGender: profile.childGender,
      });
      Alert.alert(t('save'), t('profileUpdated'));
      setIsEditing(false);
    } catch (error: unknown) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const updateProfileField = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('profile')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <MaterialIcons name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <MaterialIcons
              name={isEditing ? 'close' : 'edit'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        <View style={[styles.photoContainer, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="person" size={80} color={colors.primary} />
        </View>
        {isEditing && (
          <TouchableOpacity style={[styles.changePhotoButton, { borderColor: colors.primary }]}>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              {t('changePhoto')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Parent Information */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
          {t('parentName')}
        </Text>

        {isEditing ? (
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
            value={profile.parentName}
            onChangeText={(value) => updateProfileField('parentName', value)}
            placeholder={t('parentName')}
            placeholderTextColor={colors.textLight}
          />
        ) : (
          <Text style={[styles.infoText, { color: colors.text }]}>
            {profile.parentName}
          </Text>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
          {t('email')}
        </Text>

        {isEditing ? (
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
            value={profile.email}
            onChangeText={(value) => updateProfileField('email', value)}
            placeholder={t('email')}
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
          />
        ) : (
          <Text style={[styles.infoText, { color: colors.text }]}>
            {profile.email}
          </Text>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
          {t('phone')}
        </Text>

        {isEditing ? (
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
            value={profile.phone}
            onChangeText={(value) => updateProfileField('phone', value)}
            placeholder={t('phone')}
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={[styles.infoText, { color: colors.text }]}>
            {profile.phone}
          </Text>
        )}
      </View>

      {/* Child Information */}
      <View style={styles.childSection}>
        <Text style={[styles.childTitle, { color: colors.text }]}>
          {t('childInformation')}
        </Text>

        <View style={[styles.childCard, { backgroundColor: colors.surface }]}>
          <View style={styles.childHeader}>
            <View style={[styles.childIcon, { backgroundColor: colors.secondaryLight }]}>
              <MaterialIcons name="child-care" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.childName, { color: colors.text }]}>
              {profile.childName}
            </Text>
          </View>

          <View style={styles.childDetails}>
            <View style={styles.childDetail}>
              <MaterialIcons name="cake" size={20} color={colors.textLight} />
              <Text style={[styles.childDetailText, { color: colors.text }]}>
                {t('age')}: {profile.childAge} {t('years')}
              </Text>
            </View>
            <View style={styles.childDetail}>
              <MaterialIcons name="person" size={20} color={colors.textLight} />
              <Text style={[styles.childDetailText, { color: colors.text }]}>
                {t('gender')}: {profile.childGender}
              </Text>
            </View>
          </View>

          {isEditing && (
            <View style={[styles.editChildSection, { borderTopColor: colors.primaryLight + '50' }]}>
              <View style={styles.editRow}>
                <Text style={[styles.editLabel, { color: colors.text }]}>
                  {t('childName')}:
                </Text>
                <TextInput
                  style={[styles.childInput, { color: colors.text, borderColor: colors.primary }]}
                  value={profile.childName}
                  onChangeText={(value) => updateProfileField('childName', value)}
                  placeholder={t('childName')}
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={styles.editRow}>
                <Text style={[styles.editLabel, { color: colors.text }]}>
                  {t('childAge')}:
                </Text>
                <TextInput
                  style={[styles.childInput, { color: colors.text, borderColor: colors.primary }]}
                  value={profile.childAge}
                  onChangeText={(value) => updateProfileField('childAge', value)}
                  placeholder={t('childAge')}
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Settings Button */}
      <TouchableOpacity
        style={[styles.settingsCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push('/settings')}
      >
        <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="settings" size={24} color={colors.primary} />
        </View>
        <View style={styles.settingsInfo}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>
            {t('appSettings')}
          </Text>
          <Text style={[styles.settingsDescription, { color: colors.textLight }]}>
            {t('manageSettings')}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
      </TouchableOpacity>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <View style={styles.buttonContainer}>
          <Button
            title={t('cancel')}
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
            disabled={saving}
          />
          <Button
            title={t('save')}
            onPress={handleSave}
            variant="primary"
            style={styles.saveButton}
            loading={saving}
          />
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  backButton: {
    padding: Spacing.sm,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
  editButton: {
    padding: Spacing.sm,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  changePhotoButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  changePhotoText: {
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  input: {
    fontSize: 16,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  infoText: {
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  childSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  childTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  childCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  childIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  childName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  childDetails: {
    marginBottom: Spacing.md,
  },
  childDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  childDetailText: {
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  editChildSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  editLabel: {
    width: 100,
    fontSize: 14,
  },
  childInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  settingsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingsInfo: {
    flex: 1,
  },
  settingsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  settingsDescription: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  spacer: {
    height: Spacing.xxl,
  },
});