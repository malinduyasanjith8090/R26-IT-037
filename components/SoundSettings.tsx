// components/SoundSettings.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SoundService from '../services/SoundService';

interface SoundSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export default function SoundSettings({ visible, onClose }: SoundSettingsProps) {
  const { colors } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSoundPack, setSelectedSoundPack] = useState('default');

  useEffect(() => {
    // Load saved preferences
    // You can use AsyncStorage here to save user preferences
  }, []);

  const toggleSound = async () => {
    const enabled = SoundService.toggleSound();
    setSoundEnabled(enabled);
  };

  const testSound = async (soundType: string) => {
    await SoundService.playSound(soundType as any, true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sound Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Sound Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="volume-up" size={24} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Enable Sounds</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: soundEnabled ? colors.success : colors.error }
              ]}
              onPress={toggleSound}
            >
              <Text style={styles.toggleText}>{soundEnabled ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* Sound Test Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Sounds</Text>
          <View style={styles.soundGrid}>
            {[
              { name: 'Correct', type: 'correct', icon: 'check-circle', color: '#4CAF50' },
              { name: 'Wrong', type: 'wrong', icon: 'cancel', color: '#F44336' },
              { name: 'Star', type: 'star', icon: 'star', color: '#FFD700' },
              { name: 'Clap', type: 'clap', icon: 'clap', color: '#FF9800' },
              { name: 'Cheer', type: 'cheer', icon: 'celebration', color: '#9C27B0' },
              { name: 'Reward', type: 'reward', icon: 'emoji-events', color: '#FFD700' },
            ].map((sound) => (
              <TouchableOpacity
                key={sound.type}
                style={[styles.soundButton, { backgroundColor: sound.color + '20' }]}
                onPress={() => testSound(sound.type)}
              >
                <MaterialIcons name={sound.icon as any} size={32} color={sound.color} />
                <Text style={[styles.soundButtonText, { color: sound.color }]}>
                  {sound.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingText: {
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  soundButton: {
    width: '30%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 5,
  },
  soundButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});