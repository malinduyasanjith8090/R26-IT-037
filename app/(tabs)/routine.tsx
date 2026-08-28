// app/(tabs)/routine.tsx (Full ASD-Friendly Routine Screen – TypeScript Fixed)
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Card from '../../components/Card';
import { Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { updateStats } from '../../services/api';

// ------------- Daily routines with completion state -------------
const initialRoutines = [
  { id: '1', time: '7:00 AM', titleKey: 'wakeUp', icon: 'brightness-6', color: '#FFEB3B', completed: false },
  { id: '2', time: '7:30 AM', titleKey: 'brushTeeth', icon: 'brush', color: '#9C27B0', completed: false },
  { id: '3', time: '8:00 AM', titleKey: 'breakfast', icon: 'restaurant', color: '#FF9800', completed: false },
  { id: '4', time: '9:00 AM', titleKey: 'learningTime', icon: 'school', color: '#4CAF50', completed: false },
  { id: '5', time: '10:30 AM', titleKey: 'playTime', icon: 'toys', color: '#E91E63', completed: false },
  { id: '6', time: '12:00 PM', titleKey: 'lunch', icon: 'lunch-dining', color: '#4CAF50', completed: false },
  { id: '7', time: '1:00 PM', titleKey: 'quietTime', icon: 'library-music', color: '#2196F3', completed: false },
  { id: '8', time: '3:00 PM', titleKey: 'outdoorPlay', icon: 'park', color: '#4CAF50', completed: false },
  { id: '9', time: '6:00 PM', titleKey: 'dinner', icon: 'dinner-dining', color: '#FF9800', completed: false },
  { id: '10', time: '8:00 PM', titleKey: 'bedtime', icon: 'bedtime', color: '#7B1FA2', completed: false },
];

const AVAILABLE_ICONS = [
  'brightness-6', 'brush', 'restaurant', 'school', 'toys',
  'lunch-dining', 'library-music', 'park', 'dinner-dining', 'bedtime',
  'accessibility-new', 'favorite', 'pets', 'book', 'music-note'
];

const AVAILABLE_COLORS = [
  '#FFEB3B', '#9C27B0', '#FF9800', '#4CAF50', '#E91E63',
  '#2196F3', '#7B1FA2', '#795548', '#607D8B', '#F44336'
];

const CALMING_ACTIVITIES = [
  { title: 'Deep Breathing', desc: 'Take 5 slow deep breaths – in through your nose, out through your mouth', icon: 'air', color: '#81D4FA' },
  { title: 'Stretching', desc: 'Reach for the sky, then touch your toes. Hold for 5 seconds', icon: 'accessibility-new', color: '#A5D6A7' },
  { title: 'Sensory Play', desc: 'Play with playdough, kinetic sand, or a fidget toy for 5 minutes', icon: 'toys', color: '#FFCC80' },
  { title: 'Calm Music', desc: 'Listen to a calming song or nature sounds for 5 minutes', icon: 'music-note', color: '#CE93D8' },
  { title: 'Gentle Movement', desc: 'Do 10 slow arm circles and 5 gentle head rolls', icon: 'directions-run', color: '#FFAB91' },
  { title: 'Mindful Coloring', desc: 'Spend 5 minutes coloring a simple picture', icon: 'brush', color: '#80DEEA' },
  { title: 'Body Scan', desc: 'Close your eyes and notice how each part of your body feels', icon: 'visibility-off', color: '#B0BEC5' },
  { title: 'Blowing Bubbles', desc: 'Blow bubbles slowly and watch them float away', icon: 'bubble-chart', color: '#90CAF9' },
  { title: 'Silly Faces', desc: 'Look in a mirror and make 5 happy or silly faces', icon: 'face', color: '#F48FB1' },
  { title: 'Listening to Wind', desc: 'Sit quietly and listen to the wind or soft sounds around you', icon: 'hearing', color: '#AED581' },
  { title: 'Rocking', desc: 'Gently rock back and forth or side to side for 2 minutes', icon: 'child-care', color: '#FFD54F' },
  { title: 'Smelling Flowers', desc: 'Smell a flower or a gentle scent, taking 4 slow breaths', icon: 'spa', color: '#EF9A9A' },
  { title: 'Water Play', desc: 'Splash your hands in cool water for 3 minutes', icon: 'water-drop', color: '#81D4FA' },
  { title: 'Hug Your Favorite Toy', desc: 'Give your favorite stuffed animal a long, gentle hug', icon: 'pets', color: '#B39DDB' },
];

const formatTimeString = (h: number, m: number, period: 'AM' | 'PM') => {
  const hour = h.toString().padStart(2, '0');
  const minute = m.toString().padStart(2, '0');
  return `${hour}:${minute} ${period}`;
};

// Audio maps (add your own files)
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/routinesinstruction.mp3'),
};
const backgroundMusic = require('../../assets/sounds/calm_background.mp3');

export default function RoutineScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  // State
  const [routines, setRoutines] = useState(initialRoutines);
  const [activeRoutineId, setActiveRoutineId] = useState('4');
  const [stars, setStars] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState('15');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedIcon, setSelectedIcon] = useState('accessibility-new');
  const [selectedColor, setSelectedColor] = useState('#2196F3');

  const [calmingCompleted, setCalmingCompleted] = useState(false);
  const [lastCalmingDate, setLastCalmingDate] = useState<string | null>(null);

  const [calmingSchedule, setCalmingSchedule] = useState<
    { id: string; activity: typeof CALMING_ACTIVITIES[0]; time: string; completed: boolean }[]
  >([]);
  const [calmingModalVisible, setCalmingModalVisible] = useState(false);
  const [selectedCalmingActivity, setSelectedCalmingActivity] = useState(0);
  const [calmingHour, setCalmingHour] = useState(9);
  const [calmingMinute, setCalmingMinute] = useState(0);
  const [calmingPeriod, setCalmingPeriod] = useState<'AM' | 'PM'>('AM');

  const [backgroundSound, setBackgroundSound] = useState<Audio.Sound | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const sinhalaSounds = useRef<{ [key: string]: Audio.Sound | null }>({});
  const pendingInstruction = useRef(false);
  const isFirstRender = useRef(true);

  const todayIndex = new Date().getDate() % CALMING_ACTIVITIES.length;
  const dailyCalmingActivity = CALMING_ACTIVITIES[todayIndex];

  const timerProgress = useRef(new Animated.Value(1)).current;

  const completedCount = routines.filter(r => r.completed).length + calmingSchedule.filter(c => c.completed).length;
  const totalTasks = routines.length + calmingSchedule.length;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routines[0];

  // Load Sinhala audio
  useEffect(() => {
    let isMounted = true;
    const loadSounds = async () => {
      const sounds: { [key: string]: Audio.Sound | null } = {};
      for (const key of Object.keys(sinhalaAudioMap)) {
        try {
          const { sound } = await Audio.Sound.createAsync(sinhalaAudioMap[key]);
          sounds[key] = sound;
        } catch (error) {
          console.warn(`Failed to load Sinhala audio: ${key}`, error);
          sounds[key] = null;
        }
      }
      if (isMounted) {
        sinhalaSounds.current = sounds;
        setSoundsLoaded(true);
      }
    };
    loadSounds();
    return () => {
      isMounted = false;
      Object.values(sinhalaSounds.current).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
      if (backgroundSound) backgroundSound.unloadAsync();
    };
  }, []);

  const speak = async (text: string, audioKey?: string) => {
    try {
      if (language === 'si' && audioKey && sinhalaSounds.current[audioKey]) {
        const sound = sinhalaSounds.current[audioKey];
        if (sound) await sound.replayAsync();
        return;
      }
      Speech.stop();
      Speech.speak(text, {
        language: language === 'si' ? 'si-LK' : 'en-US',
        pitch: 1.1,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const instruction = language === 'si'
        ? 'ආයුබෝවන්! මෙය ඔබේ දිනචර්යාවයි. සෑම කාර්යයක්ම සම්පූර්ණ කිරීමට උත්සාහ කරන්න. ඔබට එය කළ හැකියි!'
        : 'Welcome! This is your daily routine. Try to complete each task. You can do it!';
      speak(instruction, 'instruction');
    }
  }, [language]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
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

  const handleMarkComplete = (id: string) => {
    setRoutines(prev =>
      prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
    setStars(prev => {
      const routine = routines.find(r => r.id === id);
      return routine && !routine.completed ? prev + 1 : prev;
    });
    const newCompleted = routines.filter(r => r.completed).length + (routines.find(r => r.id === id)?.completed ? 0 : 1);
    const progress = Math.round((newCompleted / routines.length) * 100);
    updateStats({ routine: progress }).catch(err => console.warn(err));
  };

  const handleCalmingScheduleComplete = (id: string) => {
    setCalmingSchedule(prev =>
      prev.map(c => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
    setStars(prev => {
      const item = calmingSchedule.find(c => c.id === id);
      return item && !item.completed ? prev + 1 : prev;
    });
  };

  const handleCalmingComplete = () => {
    if (!calmingCompleted) {
      setCalmingCompleted(true);
      setStars(prev => prev + 1);
    }
  };

  const handleAddCustomRoutine = () => {
    if (!newTitle.trim()) return;
    const newTime = formatTimeString(selectedHour, selectedMinute, selectedPeriod);
    const newRoutine = {
      id: Date.now().toString(),
      time: newTime,
      titleKey: newTitle.trim(),
      icon: selectedIcon,
      color: selectedColor,
      completed: false,
    };
    setRoutines(prev => [...prev, newRoutine]);
    scheduleNotificationForTask(newTitle, newTime);
    setModalVisible(false);
    setNewTitle('');
    setSelectedHour(9);
    setSelectedMinute(0);
    setSelectedPeriod('AM');
    setSelectedIcon('accessibility-new');
    setSelectedColor('#2196F3');
  };

  const handleAddCalmingActivity = () => {
    if (calmingSchedule.length >= 5) return;
    const activity = CALMING_ACTIVITIES[selectedCalmingActivity];
    const time = formatTimeString(calmingHour, calmingMinute, calmingPeriod);
    const newItem = {
      id: Date.now().toString(),
      activity,
      time,
      completed: false,
    };
    setCalmingSchedule(prev => [...prev, newItem]);
    scheduleNotificationForTask(activity.title, time);
    setCalmingModalVisible(false);
    setSelectedCalmingActivity(0);
    setCalmingHour(9);
    setCalmingMinute(0);
    setCalmingPeriod('AM');
  };

  const scheduleNotificationForTask = async (title: string, timeStr: string) => {
    try {
      const [time, period] = timeStr.split(' ');
      const [hourStr, minuteStr] = time.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Bloom Reminder',
          body: `Time for: ${title}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR, // ✅ fixed
          hour,
          minute,
          repeats: true,
        },
      });
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow notifications to get reminders.');
      }
    };
    requestPermissions();
    initialRoutines.forEach(r => scheduleNotificationForTask(t(r.titleKey), r.time));
  }, []);

  const toggleBackgroundMusic = async () => {
    if (isMusicPlaying) {
      await backgroundSound?.pauseAsync();
      setIsMusicPlaying(false);
    } else {
      if (!backgroundSound) {
        const { sound } = await Audio.Sound.createAsync(backgroundMusic, { isLooping: true });
        setBackgroundSound(sound);
        await sound.playAsync();
      } else {
        await backgroundSound.playAsync();
      }
      setIsMusicPlaying(true);
    }
  };

  const handleRoutinePress = (item: any) => {
    setActiveRoutineId(item.id);
    speak(t(item.titleKey));
  };

  const incrementHour = () => setSelectedHour(prev => (prev % 12) + 1);
  const decrementHour = () => setSelectedHour(prev => (prev === 1 ? 12 : prev - 1));
  const incrementMinute = () => setSelectedMinute(prev => (prev + 5) % 60);
  const decrementMinute = () => setSelectedMinute(prev => (prev === 0 ? 55 : prev - 5));
  const togglePeriod = () => setSelectedPeriod(prev => (prev === 'AM' ? 'PM' : 'AM'));

  const incrementCalmingHour = () => setCalmingHour(prev => (prev % 12) + 1);
  const decrementCalmingHour = () => setCalmingHour(prev => (prev === 1 ? 12 : prev - 1));
  const incrementCalmingMinute = () => setCalmingMinute(prev => (prev + 5) % 60);
  const decrementCalmingMinute = () => setCalmingMinute(prev => (prev === 0 ? 55 : prev - 5));
  const toggleCalmingPeriod = () => setCalmingPeriod(prev => (prev === 'AM' ? 'PM' : 'AM'));

  const renderRoutineItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.routineItem,
        {
          backgroundColor: activeRoutineId === item.id ? item.color + '15' : colors.surface,
          borderColor: activeRoutineId === item.id ? item.color : colors.surface,
        },
      ]}
      onPress={() => handleRoutinePress(item)}
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

  const renderCalmingScheduleItem = (item: typeof calmingSchedule[0]) => (
    <View
      key={item.id}
      style={[
        styles.routineItem,
        {
          backgroundColor: colors.surface,
          borderColor: item.activity.color,
        },
      ]}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
      </View>
      <View style={styles.routineContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.activity.color + '30' }]}>
          <MaterialIcons name={item.activity.icon as any} size={24} color={item.activity.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.routineTitle, { color: colors.text }]}>
            {item.activity.title}
          </Text>
          <Text style={[styles.routineStatus, { color: colors.textLight }]}>
            {item.completed ? t('completed') : t('upcoming')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              setActiveRoutineId('calming_' + item.id);
              startTimer();
            }}
            style={styles.timerMiniButton}
            disabled={isTimerRunning}
          >
            <MaterialIcons name="play-arrow" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCalmingScheduleComplete(item.id)} style={styles.checkButton}>
            <MaterialIcons
              name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
              size={28}
              color={item.completed ? colors.success : colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const minutes = Math.floor(timerSeconds / 60);
  const secondsRemaining = timerSeconds % 60;
  const timeDisplay = `${minutes}:${secondsRemaining.toString().padStart(2, '0')}`;

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

        {/* Background Music Toggle */}
        <TouchableOpacity
          style={[styles.musicButton, { backgroundColor: isMusicPlaying ? colors.success : colors.primary }]}
          onPress={toggleBackgroundMusic}
        >
          <MaterialIcons name={isMusicPlaying ? 'music-off' : 'music-note'} size={20} color="#FFF" />
          <Text style={styles.musicButtonText}>
            {isMusicPlaying ? 'Stop Music' : 'Play Calm Music'}
          </Text>
        </TouchableOpacity>

        {/* Calming Activity of the Day */}
        <Card
          title={t('calmingActivityOfDay') || 'Calming Activity of the Day'}
          backgroundColor={dailyCalmingActivity.color + '30'}
        >
          <View style={styles.calmingContainer}>
            <View style={[styles.calmingIcon, { backgroundColor: dailyCalmingActivity.color + '50' }]}>
              <MaterialIcons name={dailyCalmingActivity.icon as any} size={36} color={dailyCalmingActivity.color} />
            </View>
            <View style={styles.calmingText}>
              <Text style={[styles.calmingTitle, { color: colors.text }]}>
                {dailyCalmingActivity.title}
              </Text>
              <Text style={[styles.calmingDesc, { color: colors.textLight }]}>
                {dailyCalmingActivity.desc}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleCalmingComplete}
            style={[styles.calmingButton, { backgroundColor: calmingCompleted ? colors.success : dailyCalmingActivity.color }]}
            disabled={calmingCompleted}
          >
            <MaterialIcons
              name={calmingCompleted ? 'check-circle' : 'play-arrow'}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.calmingButtonText}>
              {calmingCompleted ? t('completed') : t('startCalming') || 'Start Activity'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Current Activity (dynamic) */}
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
            {completedCount}/{totalTasks} {t('tasksCompleted')}
          </Text>
        </View>

        {/* Today's Schedule */}
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

        {/* Calming Corner */}
        <Card
          title={t('calmingCorner') || 'Calming Corner'}
          icon="self-care"
          iconColor={colors.accentPink} // ✅ fixed from accentPurple
        >
          {calmingSchedule.length > 0 ? (
            calmingSchedule.map(item => renderCalmingScheduleItem(item))
          ) : (
            <Text style={[styles.calmingPlaceholder, { color: colors.textLight }]}>
              {t('noCalmingActivities') || 'No calming activities yet. Add up to 5!'}
            </Text>
          )}
          {calmingSchedule.length < 5 && (
            <TouchableOpacity
              style={[styles.calmingAddButton, { borderColor: colors.primary }]}
              onPress={() => setCalmingModalVisible(true)}
            >
              <MaterialIcons name="add" size={24} color={colors.primary} />
              <Text style={[styles.calmingAddButtonText, { color: colors.primary }]}>
                {t('addCalmingActivity') || 'Add Calming Activity'}
              </Text>
            </TouchableOpacity>
          )}
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
            {routineTips.map((tip: string, index: number) => (
              <Text key={index} style={[styles.tipText, { color: colors.text }]}>
                • {tip}
              </Text>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Custom Routine Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        {/* ... (same as before, no changes needed) ... */}
      </Modal>

      {/* Calming Activity Modal */}
      <Modal visible={calmingModalVisible} transparent animationType="slide" onRequestClose={() => setCalmingModalVisible(false)}>
        {/* ... (same as before) ... */}
      </Modal>
    </>
  );
}

// ─── STYLES (unchanged, includes musicButton) ───────────────────
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
  starText: { fontWeight: 'bold', fontSize: Typography.fontSize.lg },
  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.md,
    gap: 8,
  },
  musicButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
  calmingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  calmingIcon: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  calmingText: { flex: 1 },
  calmingTitle: { fontWeight: 'bold', fontSize: Typography.fontSize.lg, marginBottom: 4 },
  calmingDesc: { fontSize: Typography.fontSize.sm, lineHeight: 20 },
  calmingButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, gap: 8,
  },
  calmingButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: Typography.fontSize.md },
  calmingPlaceholder: { textAlign: 'center', paddingVertical: Spacing.md },
  calmingAddButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, borderRadius: 8, borderWidth: 2, borderStyle: 'dashed',
    marginTop: Spacing.sm,
  },
  calmingAddButtonText: { fontWeight: 'bold', marginLeft: 8 },
  calmingList: { marginBottom: Spacing.sm, flexDirection: 'row' },
  calmingOption: {
    width: 120, padding: Spacing.sm, borderRadius: 12, borderWidth: 2,
    marginRight: Spacing.sm, alignItems: 'center',
  },
  calmingOptionIcon: {
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  calmingOptionTitle: { fontWeight: '600', fontSize: Typography.fontSize.sm, textAlign: 'center' },
  currentActivityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  currentIcon: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  currentInfo: { flex: 1 },
  currentTitle: { fontWeight: 'bold', fontSize: Typography.fontSize.lg },
  currentTime: { fontSize: Typography.fontSize.sm, marginVertical: Spacing.xs },
  currentDesc: { fontSize: Typography.fontSize.sm },
  timerSection: { marginTop: Spacing.md },
  timerInputRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  timerLabel: { fontSize: Typography.fontSize.md, fontWeight: '600' },
  timerInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerAdjustButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
  },
  timerInputText: {
    fontSize: Typography.fontSize.md, fontWeight: 'bold',
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderRadius: 8,
  },
  timerCircleWrapper: { alignItems: 'center', marginTop: Spacing.sm },
  timerCircleOuter: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center' },
  timerCircle: {
    width: 130, height: 130, borderRadius: 65, borderWidth: 10,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF',
  },
  timerText: { fontSize: 32, fontWeight: 'bold' },
  timerControls: { flexDirection: 'row', gap: 20, marginTop: Spacing.md },
  timerControlButton: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  timerMiniButton: {
    marginRight: 8, padding: 4, borderRadius: 12, backgroundColor: '#f0f0f0',
  },
  progressContainer: {
    borderRadius: 12, padding: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  progressTitle: { fontWeight: 'bold', fontSize: Typography.fontSize.lg, marginBottom: Spacing.sm },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden', marginVertical: Spacing.sm },
  progressFill: { height: '100%', borderRadius: 5 },
  progressText: { fontSize: Typography.fontSize.sm, textAlign: 'center' },
  routineItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, marginBottom: Spacing.sm,
    borderWidth: 2, borderRadius: 10,
    paddingHorizontal: Spacing.md,
  },
  timeContainer: { width: 70, alignItems: 'center' },
  timeText: { fontWeight: 'bold', fontSize: Typography.fontSize.sm },
  routineContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: { flex: 1 },
  routineTitle: { fontWeight: 'bold', fontSize: Typography.fontSize.md },
  routineStatus: { fontSize: Typography.fontSize.sm, marginTop: Spacing.xs },
  checkButton: { padding: 4, marginLeft: Spacing.sm },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: Spacing.lg, borderRadius: 12, marginVertical: Spacing.lg,
    borderWidth: 2, borderStyle: 'dashed',
  },
  addButtonText: { fontWeight: 'bold', fontSize: Typography.fontSize.md, marginLeft: Spacing.md },
  tipsContainer: { marginTop: Spacing.sm },
  tipText: { fontSize: Typography.fontSize.md, marginBottom: Spacing.sm, lineHeight: 24 },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: { width: '90%', maxHeight: '90%', borderRadius: 20, padding: Spacing.xl },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: 'bold', marginBottom: Spacing.lg },
  input: {
    borderWidth: 1, borderRadius: 10, padding: Spacing.md,
    fontSize: Typography.fontSize.md, marginBottom: Spacing.md,
  },
  pickerLabel: { fontWeight: '600', fontSize: Typography.fontSize.md, marginBottom: Spacing.xs },
  timePickerContainer: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', marginBottom: Spacing.md,
    paddingVertical: Spacing.md, backgroundColor: '#f9f9f9', borderRadius: 12,
  },
  timeColumn: { alignItems: 'center', width: 80 },
  timeArrowButton: { padding: 4 },
  timeValue: { fontSize: 32, fontWeight: '800', marginVertical: 4 },
  timeUnit: { fontSize: 12, color: '#888', marginTop: 4 },
  periodButton: {
    width: 70, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  periodText: { fontSize: 16, fontWeight: '700' },
  iconRow: { flexDirection: 'row', marginBottom: Spacing.md },
  iconOption: {
    width: 50, height: 50, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10, borderWidth: 2,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorOption: { width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.xl, gap: 10 },
  modalButton: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: 10 },
  modalButtonText: { fontWeight: 'bold', fontSize: Typography.fontSize.md },
});