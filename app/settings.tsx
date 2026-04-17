// app/settings.tsx (Updated with back to profile navigation)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LanguageType } from '../context/LanguageContext';
import { Spacing, BorderRadius } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/Card';

export default function SettingsScreen() {
  const { theme, colors, toggleTheme, setTheme } = useTheme();
  const { language, t, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sound: true,
    vibration: true,
  });

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('Are you sure you want to logout?'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: () => router.replace('/welcome') },
      ]
    );
  };

  const handleBackToProfile = () => {
    router.back(); // This will go back to profile screen
  };

  const languages: { key: LanguageType; label: string; icon: string }[] = [
    { key: 'en', label: t('english'), icon: 'language' },
    { key: 'si', label: t('sinhala'), icon: 'language' },
    { key: 'ta', label: t('tamil'), icon: 'language' },
  ];

  const themes = [
    { key: 'light' as const, label: t('lightMode'), icon: 'wb-sunny' },
    { key: 'dark' as const, label: t('darkMode'), icon: 'nights-stay' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToProfile}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Section */}
      <TouchableOpacity
        style={[styles.profileSection, { backgroundColor: colors.surface }]}
        onPress={() => router.push('/profile')}
      >
        <View style={[styles.profileIcon, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="person" size={32} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>Alex Johnson</Text>
          <Text style={[styles.profileEmail, { color: colors.textLight }]}>parent@bloom.com</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
      </TouchableOpacity>

      {/* Notifications */}
      <Card
        title={t('notifications')}
        icon="notifications"
        iconColor={colors.primary}
        backgroundColor={colors.surface}
      >
        <Text style={[styles.sectionDescription, { color: colors.textLight }]}>
          {t('notificationsDesc')}
        </Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="notifications" size={24} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('pushNotifications')}
            </Text>
          </View>
          <Switch
            value={notifications.push}
            onValueChange={(value) => setNotifications({ ...notifications, push: value })}
            trackColor={{ false: colors.textDisabled, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="email" size={24} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('emailNotifications')}
            </Text>
          </View>
          <Switch
            value={notifications.email}
            onValueChange={(value) => setNotifications({ ...notifications, email: value })}
            trackColor={{ false: colors.textDisabled, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="volume-up" size={24} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('soundAlerts')}
            </Text>
          </View>
          <Switch
            value={notifications.sound}
            onValueChange={(value) => setNotifications({ ...notifications, sound: value })}
            trackColor={{ false: colors.textDisabled, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="vibration" size={24} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('vibration')}
            </Text>
          </View>
          <Switch
            value={notifications.vibration}
            onValueChange={(value) => setNotifications({ ...notifications, vibration: value })}
            trackColor={{ false: colors.textDisabled, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </Card>

      {/* Language Settings */}
      <Card
        title={t('language')}
        icon="language"
        iconColor={colors.accentBlue}
        backgroundColor={colors.surface}
      >
        <Text style={[styles.sectionDescription, { color: colors.textLight }]}>
          {t('selectLanguage')}
        </Text>
        
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.key}
            style={[
              styles.languageItem,
              { backgroundColor: language === lang.key ? colors.primaryLight : 'transparent' },
            ]}
            onPress={() => setLanguage(lang.key)}
          >
            <MaterialIcons name={lang.icon as any} size={24} color={colors.text} />
            <Text style={[styles.languageLabel, { color: colors.text }]}>
              {lang.label}
            </Text>
            {language === lang.key && (
              <MaterialIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </Card>

      {/* Theme Settings */}
      <Card
        title={t('theme')}
        icon="palette"
        iconColor={colors.accentPink}
        backgroundColor={colors.surface}
      >
        <Text style={[styles.sectionDescription, { color: colors.textLight }]}>
          {t('selectTheme')}
        </Text>
        
        {themes.map((themeItem) => (
          <TouchableOpacity
            key={themeItem.key}
            style={[
              styles.themeItem,
              { backgroundColor: theme === themeItem.key ? colors.primaryLight : 'transparent' },
            ]}
            onPress={() => setTheme(themeItem.key)}
          >
            <MaterialIcons name={themeItem.icon as any} size={24} color={colors.text} />
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              {themeItem.label}
            </Text>
            {theme === themeItem.key && (
              <MaterialIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {t('systemDefault')}
          </Text>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: colors.textDisabled, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </Card>

      {/* Other Settings */}
      <Card
        title={t('about')}
        icon="info"
        iconColor={colors.secondary}
        backgroundColor={colors.surface}
      >
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="privacy-tip" size={24} color={colors.text} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            {t('privacyPolicy')}
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="description" size={24} color={colors.text} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            {t('termsOfService')}
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="help" size={24} color={colors.text} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            {t('help')}
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="support-agent" size={24} color={colors.text} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            {t('contactSupport')}
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionLabel, { color: colors.textLight }]}>
            {t('version')} 1.0.0
          </Text>
        </View>
      </Card>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={24} color="#FFFFFF" />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>

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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: 14,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  languageLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  versionLabel: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  spacer: {
    height: Spacing.xxl,
  },
});