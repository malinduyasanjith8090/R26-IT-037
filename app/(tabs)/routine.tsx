// app/(tabs)/routine.tsx (Dynamic Current Activity + Add Custom Routine)

import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '../../components/Card';
import { Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

// ------------- Daily routines with completion state -------------
const initialRoutines = [
  { id: '1', time: '7:00 AM',  titleKey: 'wakeUp',       icon: 'brightness-6',    color: '#FFEB3B', completed: false },
  { id: '2', time: '7:30 AM',  titleKey: 'brushTeeth',   icon: 'brush',           color: '#9C27B0', completed: false },
  { id: '3', time: '8:00 AM',  titleKey: 'breakfast',    icon: 'restaurant',      color: '#FF9800', completed: false },
  { id: '4', time: '9:00 AM',  titleKey: 'learningTime', icon: 'school',          color: '#4CAF50', completed: false },
  { id: '5', time: '10:30 AM', titleKey: 'playTime',     icon: 'toys',            color: '#E91E63', completed: false },
  { id: '6', time: '12:00 PM', titleKey: 'lunch',        icon: 'lunch-dining',    color: '#4CAF50', completed: false },
  { id: '7', time: '1:00 PM',  titleKey: 'quietTime',    icon: 'library-music',   color: '#2196F3', completed: false },
  { id: '8', time: '3:00 PM',  titleKey: 'outdoorPlay',  icon: 'park',            color: '#4CAF50', completed: false },
  { id: '9', time: '6:00 PM',  titleKey: 'dinner',       icon: 'dinner-dining',   color: '#FF9800', completed: false },
  { id: '10',time: '8:00 PM',  titleKey: 'bedtime',      icon: 'bedtime',         color: '#7B1FA2', completed: false },
];

// Available icons and colors for custom routines
const AVAILABLE_ICONS = ['brightness-6', 'brush', 'restaurant', 'school', 'toys', 'lunch-dining', 'library-music', 'park', 'dinner-dining', 'bedtime', 'accessibility-new', 'favorite', 'pets', 'book', 'music-note'];
const AVAILABLE_COLORS = ['#FFEB3B', '#9C27B0', '#FF9800', '#4CAF50', '#E91E63', '#2196F3', '#7B1FA2', '#795548', '#607D8B', '#F44336'];

export default function RoutineScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // ------------- State -------------
  const [routines, setRoutines] = useState(initialRoutines);
  const [activeRoutineId, setActiveRoutineId] = useState('4'); // default to learning time
  const [stars, setStars] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(15 * 60); // 15 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState('15'); // minutes
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('accessibility-new');
  const [selectedColor, setSelectedColor] = useState('#2196F3');

  // Animated values for circular timer
  const timerProgress = useRef(new Animated.Value(1)).current;

  // ---------- Derived data ----------
  const completedCount = routines.filter(r => r.completed).length;
  const progressPercent = (completedCount / routines.length) * 100;
  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routines[0];

  // ---------- Timer logic ----------
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    const totalTime = (parseInt(timerInput) || 15) * 60;
    const progress = timerSeconds / totalTime;
    Animated.timing(timerProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timerSeconds]);

  const startTimer = () => {
    if (timerSeconds <= 0) {
      const minutes = parseInt(timerInput) || 15;
      setTimerSeconds(minutes * 60);
    }
    setIsTimerRunning(true);
  };

  const pauseTimer = () => setIsTimerRunning(false);

  const resetTimer = () => {
    setIsTimerRunning(false);
    timerProgress.setValue(1);
    const minutes = parseInt(timerInput) || 15;
    setTimerSeconds(minutes * 60);
  };

  // ---------- Routine completion ----------
  const handleMarkComplete = (id: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    );
    setStars(prev => {
      const routine = routines.find(r => r.id === id);
      return routine && !routine.completed ? prev + 1 : prev; // add star when newly completed
    });
  };

  // ---------- Add custom routine ----------
  const handleAddCustomRoutine = () => {
    if (!newTitle.trim() || !newTime.trim()) return;

    const newRoutine = {
      id: Date.now().toString(),
      time: newTime.trim(),
      titleKey: newTitle.trim(), // custom routines use the entered text directly (no translation)
      icon: selectedIcon,
      color: selectedColor,
      completed: false,
    };

    setRoutines(prev => [...prev, newRoutine]);
    setModalVisible(false);
    setNewTitle('');
    setNewTime('');
    setSelectedIcon('accessibility-new');
    setSelectedColor('#2196F3');
  };

  // ---------- Render routine item ----------
  const renderRoutineItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.routineItem,
        {
          backgroundColor: activeRoutineId === item.id ? item.color + '15' : colors.surface,
          borderColor: activeRoutineId === item.id ? item.color : colors.surface,
        },
      ]}
      onPress={() => setActiveRoutineId(item.id)}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
      </View>
      <View style={styles.routineContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '30' }]}>
          <MaterialIcons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.routineTitle, { color: colors.text }]}>
            {/* If titleKey contains spaces (custom), display directly, else use translation */}
            {item.titleKey.includes(' ') ? item.titleKey : t(item.titleKey)}
          </Text>
          <Text style={[styles.routineStatus, { color: colors.textLight }]}>
            {item.completed ? t('completed') : t('upcoming')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleMarkComplete(item.id)} style={styles.checkButton}>
          <MaterialIcons
            name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
            size={28}
            color={item.completed ? colors.success : colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ---------- Timer display ----------
  const minutes = Math.floor(timerSeconds / 60);
  const secondsRemaining = timerSeconds % 60;
  const timeDisplay = `${minutes}:${secondsRemaining.toString().padStart(2, '0')}`;

  // ---------- Routine tips ----------
  const routineTips = [
    t('visualTimers'),
    t('minuteWarnings'),
    t('celebrateCompleting'),
    t('keepRoutinesConsistent'),
  ];

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('dailyRoutineTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {t('todaysSchedule')}
          </Text>
        </View>

        {/* Star Reward Counter */}
        <View style={[styles.starCounter, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="stars" size={28} color="#FFD700" />
          <Text style={[styles.starText, { color: colors.text }]}>
            {stars} {t('stars')}
          </Text>
        </View>

        {/* Current Activity (dynamic based on selected routine) */}
        <Card title={t('currentActivity')} backgroundColor={colors.softGreen}>
          <View style={styles.currentActivityRow}>
            <View style={[styles.currentIcon, { backgroundColor: activeRoutine.color + '30' }]}>
              <MaterialIcons name={activeRoutine.icon as any} size={40} color={activeRoutine.color} />
            </View>
            <View style={styles.currentInfo}>
              <Text style={[styles.currentTitle, { color: colors.text }]}>
                {activeRoutine.titleKey.includes(' ') ? activeRoutine.titleKey : t(activeRoutine.titleKey)}
              </Text>
              <Text style={[styles.currentTime, { color: colors.textLight }]}>
                {activeRoutine.time}
              </Text>
              <Text style={[styles.currentDesc, { color: colors.textLight }]}>
                {activeRoutine.completed ? t('completed') : t('inProgress')}
              </Text>
            </View>
          </View>

          {/* Visual Timer Section */}
          <View style={styles.timerSection}>
            <View style={styles.timerInputRow}>
              <Text style={[styles.timerLabel, { color: colors.textLight }]}>
                {t('focusTimer')}
              </Text>
              <View style={styles.timerInputContainer}>
                <TouchableOpacity
                  onPress={() => setTimerInput(prev => Math.max(1, parseInt(prev) - 1).toString())}
                  style={styles.timerAdjustButton}
                >
                  <MaterialIcons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.timerInputText, { color: colors.text, borderColor: colors.primaryLight }]}>
                  {timerInput} min
                </Text>
                <TouchableOpacity
                  onPress={() => setTimerInput(prev => (parseInt(prev) + 1).toString())}
                  style={styles.timerAdjustButton}
                >
                  <MaterialIcons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timerCircleWrapper}>
              <View style={styles.timerCircleOuter}>
                <View style={[styles.timerCircle, { borderColor: activeRoutine.color }]}>
                  <Text style={[styles.timerText, { color: colors.text }]}>{timeDisplay}</Text>
                </View>
              </View>
              <View style={styles.timerControls}>
                <TouchableOpacity
                  onPress={isTimerRunning ? pauseTimer : startTimer}
                  style={[styles.timerControlButton, { backgroundColor: activeRoutine.color }]}
                >
                  <MaterialIcons
                    name={isTimerRunning ? 'pause' : 'play-arrow'}
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={resetTimer}
                  style={[styles.timerControlButton, { backgroundColor: colors.primaryLight }]}
                >
                  <MaterialIcons name="refresh" size={32} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Daily Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            {t('dailyProgress')}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textLight }]}>
            {completedCount}/{routines.length} {t('tasksCompleted')}
          </Text>
        </View>

        {/* Today's Schedule (interactive) */}
        <Card
          title={t('todaysSchedule')}
          icon="schedule"
          iconColor={colors.accentBlue}
        >
          <FlatList
            data={routines}
            renderItem={renderRoutineItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </Card>

        {/* Add Custom Routine Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add-circle" size={24} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>
            {t('addCustomActivity')}
          </Text>
        </TouchableOpacity>

        {/* Routine Tips */}
        <Card
          title={t('routineTips')}
          icon="lightbulb"
          iconColor={colors.accentYellow}
          backgroundColor={colors.softYellow}
        >
          <View style={styles.tipsContainer}>
            {routineTips.map((tip, index) => (
              <Text key={index} style={[styles.tipText, { color: colors.text }]}>
                • {tip}
              </Text>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Modal for Adding Custom Routine */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('addCustomActivity')}
            </Text>

            {/* Title Input */}
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.primaryLight, backgroundColor: colors.surface }]}
              placeholder={t('activityName') || 'Activity name'}
              placeholderTextColor={colors.textLight}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* Time Input */}
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.primaryLight, backgroundColor: colors.surface }]}
              placeholder={t('time') || 'e.g., 3:30 PM'}
              placeholderTextColor={colors.textLight}
              value={newTime}
              onChangeText={setNewTime}
            />

            {/* Icon Picker */}
            <Text style={[styles.pickerLabel, { color: colors.text }]}>
              {t('chooseIcon') || 'Choose icon'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
              {AVAILABLE_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[styles.iconOption, { borderColor: selectedIcon === icon ? colors.primary : 'transparent', backgroundColor: selectedIcon === icon ? colors.primaryLight : colors.surface }]}
                >
                  <MaterialIcons name={icon as any} size={32} color={selectedIcon === icon ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Color Picker */}
            <Text style={[styles.pickerLabel, { color: colors.text, marginTop: Spacing.md }]}>
              {t('chooseColor') || 'Choose color'}
            </Text>
            <View style={styles.colorRow}>
              {AVAILABLE_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[styles.colorOption, { backgroundColor: color, borderColor: selectedColor === color ? colors.primary : 'transparent', }]}
                />
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.primary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCustomRoutine}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  header: { marginBottom: Spacing.lg },
  title: { fontWeight: 'bold', fontSize: Typography.fontSize.xxl },
  subtitle: { fontSize: Typography.fontSize.md, marginTop: Spacing.xs },
  starCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
    gap: 8,
  },
  starText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
  },
  currentActivityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  currentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  currentInfo: { flex: 1 },
  currentTitle: { fontWeight: 'bold', fontSize: Typography.fontSize.lg },
  currentTime: { fontSize: Typography.fontSize.sm, marginVertical: Spacing.xs },
  currentDesc: { fontSize: Typography.fontSize.sm },
  timerSection: { marginTop: Spacing.md },
  timerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  timerLabel: { fontSize: Typography.fontSize.md, fontWeight: '600' },
  timerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerAdjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerInputText: {
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 8,
  },
  timerCircleWrapper: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  timerCircleOuter: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 20,
    marginTop: Spacing.md,
  },
  timerControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  progressTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
  },
  timeContainer: {
    width: 70,
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
  },
  routineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  routineTitle: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
  routineStatus: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  checkButton: {
    padding: 4,
    marginLeft: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    marginVertical: Spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
    marginLeft: Spacing.md,
  },
  tipsContainer: {
    marginTop: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
  },
  pickerLabel: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xl,
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 10,
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
});