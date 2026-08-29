// app/(tabs)/routine.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Card from '../../components/Card';
import { Spacing, Typography } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../hooks/useSound';
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

// ─── External Audio Maps ───────────────────────────────────────
const sinhalaAudioMap: { [key: string]: any } = {
  instruction: require('../../assets/sounds/sinhala/routinesinstruction.mp3'),
  wakeUp: require('../../assets/sounds/sinhala/routines/wakeUp.mp3'),
  brushTeeth: require('../../assets/sounds/sinhala/routines/brushTeeth.mp3'),
  breakfast: require('../../assets/sounds/sinhala/routines/breakfast.mp3'),
  learningTime: require('../../assets/sounds/sinhala/routines/learningTime.mp3'),
  playTime: require('../../assets/sounds/sinhala/routines/playTime.mp3'),
  lunch: require('../../assets/sounds/sinhala/routines/lunch.mp3'),
  quietTime: require('../../assets/sounds/sinhala/routines/quietTime.mp3'),
  outdoorPlay: require('../../assets/sounds/sinhala/routines/outdoorPlay.mp3'),
  dinner: require('../../assets/sounds/sinhala/routines/dinner.mp3'),
  bedtime: require('../../assets/sounds/sinhala/routines/bedtime.mp3'),
};

const alarmSoundFile = require('../../assets/sounds/alarm_sound.mp3');
const backgroundMusic = require('../../assets/sounds/calm_background.mp3');

const calmingIntroAudioMap: { [key: string]: any } = {
  'Deep Breathing': require('../../assets/sounds/calming/deep_breathing_intro.mp3'),
  // Add others if available
};

export default function RoutineScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { playSound } = useSound();

  // ─── State ────────────────────────────────────────────────────
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
  const isFirstRender = useRef(true);

  // ─── Alarm State ─────────────────────────────────────────────
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmPeriod, setAlarmPeriod] = useState<'AM' | 'PM'>('AM');
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmSound, setAlarmSound] = useState<Audio.Sound | null>(null);

  // ─── Calming Activity Play Modal State ───────────────────────
  const [calmingPlayModalVisible, setCalmingPlayModalVisible] = useState(false);
  const [selectedPlayActivity, setSelectedPlayActivity] = useState<typeof CALMING_ACTIVITIES[0] | null>(null);
  const [calmingTimerMinutes, setCalmingTimerMinutes] = useState(5);
  const [calmingTimerSeconds, setCalmingTimerSeconds] = useState(5 * 60);
  const [isCalmingTimerRunning, setIsCalmingTimerRunning] = useState(false);
  const [isBreathingVisible, setIsBreathingVisible] = useState(false);
  const [introSound, setIntroSound] = useState<Audio.Sound | null>(null);
  const breathScale = useRef(new Animated.Value(1)).current;
  const breathAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // ─── Popup Modal State ───────────────────────────────────────
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupEmoji, setPopupEmoji] = useState('🎉');
  const [popupType, setPopupType] = useState<'timer' | 'alarm'>('timer');

  const todayIndex = new Date().getDate() % CALMING_ACTIVITIES.length;
  const dailyCalmingActivity = CALMING_ACTIVITIES[todayIndex];

  const timerProgress = useRef(new Animated.Value(1)).current;

  // Derived data
  const completedCount = routines.filter(r => r.completed).length + calmingSchedule.filter(c => c.completed).length;
  const totalTasks = routines.length + calmingSchedule.length;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routines[0];

  // ─── Load Sinhala audio files ─────────────────────────────────
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
      if (alarmSound) alarmSound.unloadAsync();
      if (introSound) introSound.unloadAsync();
    };
  }, []);

  // ─── Play alarm sound ─────────────────────────────────────────
  const playAlarmSound = async () => {
    try {
      if (!alarmSound) {
        const { sound } = await Audio.Sound.createAsync(alarmSoundFile);
        setAlarmSound(sound);
        await sound.playAsync();
      } else {
        await alarmSound.replayAsync();
      }
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
    }
  };

  // ─── Speak function ────────────────────────────────────────────
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

  // ─── Instruction on first open ───────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const instruction = language === 'si'
        ? 'ආයුබෝවන්! මෙය ඔබේ දිනචර්යාවයි. සෑම කාර්යයක්ම සම්පූර්ණ කිරීමට උත්සාහ කරන්න. ඔබට එය කළ හැකියි!'
        : 'Welcome! This is your daily routine. Try to complete each task. You can do it!';
      speak(instruction, 'instruction');
    }
  }, [language]);

  // ─── Timer logic ──────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            playAlarmSound();
            Vibration.vibrate(500);
            showPopup(
              'timer',
              '⏰ Time is Up!',
              'Great job! You finished your focus time. 🌟',
              '🎉'
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // ─── Alarm checking loop ─────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (alarmSet) {
      interval = setInterval(() => {
        const now = new Date();
        const currentHour24 = now.getHours();
        const currentMinute = now.getMinutes();

        let targetHour = alarmHour;
        if (alarmPeriod === 'PM' && alarmHour !== 12) targetHour += 12;
        if (alarmPeriod === 'AM' && alarmHour === 12) targetHour = 0;

        if (currentHour24 === targetHour && currentMinute === alarmMinute) {
          playAlarmSound();
          Vibration.vibrate(500);
          showPopup(
            'alarm',
            '⏰ Alarm!',
            'Time for your scheduled activity! 🕐',
            '🔔'
          );
          setAlarmSet(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [alarmSet, alarmHour, alarmMinute, alarmPeriod]);

  // ─── Popup helper ─────────────────────────────────────────────
  const showPopup = (type: 'timer' | 'alarm', title: string, message: string, emoji: string) => {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupEmoji(emoji);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  // ─── Timer & alarm controls ──────────────────────────────────
  const startTimer = () => {
    if (timerSeconds <= 0) {
      const minutes = parseInt(timerInput) || 15;
      setTimerSeconds(minutes * 60);
      timerProgress.setValue(1);
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

  const setAlarm = () => {
    setAlarmSet(true);
    Alert.alert('Alarm Set', `Alarm will ring at ${formatTimeString(alarmHour, alarmMinute, alarmPeriod)}`);
  };

  // ─── Calming Activity Play Modal functions ───────────────────
  const openCalmingPlayModal = (item: typeof calmingSchedule[0]) => {
    setSelectedPlayActivity(item.activity);
    setCalmingTimerMinutes(5);
    setCalmingTimerSeconds(5 * 60);
    setIsCalmingTimerRunning(false);
    setIsBreathingVisible(false);
    setCalmingPlayModalVisible(true);
  };

  const startCalmingTimer = async () => {
    if (calmingTimerSeconds <= 0) {
      setCalmingTimerSeconds(calmingTimerMinutes * 60);
    }
    setIsCalmingTimerRunning(true);
    setIsBreathingVisible(true);

    if (selectedPlayActivity) {
      const introFile = calmingIntroAudioMap[selectedPlayActivity.title];
      if (introFile) {
        try {
          if (introSound) await introSound.unloadAsync();
          const { sound } = await Audio.Sound.createAsync(introFile);
          setIntroSound(sound);
          await sound.playAsync();
        } catch {
          Speech.stop();
          Speech.speak(`Let's do ${selectedPlayActivity.title} together. Follow the animation.`);
        }
      } else {
        Speech.stop();
        Speech.speak(`Let's do ${selectedPlayActivity.title} together. Follow the animation.`);
      }
    }

    startBreathingAnimation();

    const interval = setInterval(() => {
      setCalmingTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCalmingTimerRunning(false);
          setIsBreathingVisible(false);
          stopBreathingAnimation();
          if (introSound) introSound.stopAsync();
          playSound('complete', false);
          Vibration.vibrate(300);
          showPopup(
            'timer',
            '🧘 Well Done!',
            'You completed the calming activity! 🌈',
            '🌟'
          );
          setCalmingPlayModalVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startBreathingAnimation = () => {
    if (breathAnimation.current) breathAnimation.current.stop();
    breathScale.setValue(1);
    breathAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.4,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathAnimation.current.start();
  };

  const stopBreathingAnimation = () => {
    if (breathAnimation.current) {
      breathAnimation.current.stop();
      breathAnimation.current = null;
    }
    breathScale.setValue(1);
  };

  // ─── Routine completion ──────────────────────────────────────
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
      Vibration.vibrate(50);
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
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
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
    speak(t(item.titleKey), item.titleKey);
  };

  // ─── Time picker helpers ──────────────────────────────────────
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

  const incrementAlarmHour = () => setAlarmHour(prev => (prev % 12) + 1);
  const decrementAlarmHour = () => setAlarmHour(prev => (prev === 1 ? 12 : prev - 1));
  const incrementAlarmMinute = () => setAlarmMinute(prev => (prev + 5) % 60);
  const decrementAlarmMinute = () => setAlarmMinute(prev => (prev === 0 ? 55 : prev - 5));
  const toggleAlarmPeriod = () => setAlarmPeriod(prev => (prev === 'AM' ? 'PM' : 'AM'));

  // ─── Render routine item ──────────────────────────────────────
  const renderRoutineItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.routineItem,
        {
          backgroundColor: activeRoutineId === item.id ? item.color + '20' : colors.surface,
          borderColor: activeRoutineId === item.id ? item.color : colors.surface,
          shadowColor: activeRoutineId === item.id ? item.color : 'transparent',
        },
      ]}
      onPress={() => handleRoutinePress(item)}
      activeOpacity={0.7}
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
            size={32}
            color={item.completed ? colors.success : colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ─── Render calming schedule item ─────────────────────────────
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
            onPress={() => openCalmingPlayModal(item)}
            style={[styles.timerMiniButton, { backgroundColor: item.activity.color + '30' }]}
          >
            <MaterialIcons name="play-arrow" size={20} color={item.activity.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCalmingScheduleComplete(item.id)} style={styles.checkButton}>
            <MaterialIcons
              name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
              size={32}
              color={item.completed ? colors.success : colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ─── Timer display ────────────────────────────────────────────
  const minutes = Math.floor(timerSeconds / 60);
  const secondsRemaining = timerSeconds % 60;
  const timeDisplay = `${minutes}:${secondsRemaining.toString().padStart(2, '0')}`;

  const circleSize = 160;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = timerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  }) as any; // Cast to any to satisfy TypeScript (Animated interpolation is accepted at runtime)

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
          <MaterialIcons name={isMusicPlaying ? 'music-off' : 'music-note'} size={22} color="#FFF" />
          <Text style={styles.musicButtonText}>
            {isMusicPlaying ? 'Stop Music' : 'Play Calm Music'}
          </Text>
        </TouchableOpacity>

        {/* Calming Activity of the Day */}
        <View style={styles.cardShadow}>
          <Card
            title={t('calmingActivityOfDay')}
            backgroundColor={dailyCalmingActivity.color + '20'}
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
                {calmingCompleted ? t('completed') : t('startCalming')}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Current Activity (dynamic) with Alarm & Timer */}
        <View style={styles.cardShadow}>
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

            {/* Timer Section */}
            <View style={styles.timerSection}>
              <View style={styles.timerInputRow}>
                <Text style={[styles.timerLabel, { color: colors.textLight }]}>
                  {t('focusTimer')}
                </Text>
                <View style={styles.timerInputContainer}>
                  <TouchableOpacity
                    onPress={() => setTimerInput(prev => Math.max(1, parseInt(prev) - 1).toString())}
                    style={[styles.timerAdjustButton, { backgroundColor: colors.primaryLight }]}
                  >
                    <MaterialIcons name="remove" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.timerInputText, { color: colors.text, borderColor: colors.primaryLight }]}>
                    {timerInput} min
                  </Text>
                  <TouchableOpacity
                    onPress={() => setTimerInput(prev => (parseInt(prev) + 1).toString())}
                    style={[styles.timerAdjustButton, { backgroundColor: colors.primaryLight }]}
                  >
                    <MaterialIcons name="add" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Circular Timer */}
              <View style={styles.timerCircleWrapper}>
                <View style={styles.timerCircleOuter}>
                  <Svg width={circleSize} height={circleSize} style={{ position: 'absolute' }}>
                    <Circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke={colors.primaryLight}
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    <Circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke={activeRoutine.color}
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <View style={[styles.timerCircle, { backgroundColor: colors.background }]}>
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

              {/* Alarm Setting */}
              <View style={[styles.alarmSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.alarmTitle, { color: colors.text }]}>⏰ Set Alarm</Text>
                <View style={styles.timePickerContainer}>
                  <View style={styles.timeColumn}>
                    <TouchableOpacity onPress={incrementAlarmHour} style={styles.timeArrowButton}>
                      <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                      {alarmHour.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity onPress={decrementAlarmHour} style={styles.timeArrowButton}>
                      <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.timeUnit}>Hour</Text>
                  </View>
                  <View style={styles.timeColumn}>
                    <TouchableOpacity onPress={incrementAlarmMinute} style={styles.timeArrowButton}>
                      <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                      {alarmMinute.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity onPress={decrementAlarmMinute} style={styles.timeArrowButton}>
                      <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.timeUnit}>Min</Text>
                  </View>
                  <View style={styles.timeColumn}>
                    <TouchableOpacity
                      onPress={toggleAlarmPeriod}
                      style={[styles.periodButton, { backgroundColor: alarmPeriod === 'AM' ? colors.primary : colors.primaryLight }]}
                    >
                      <Text style={[styles.periodText, { color: alarmPeriod === 'AM' ? '#FFFFFF' : colors.text }]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={toggleAlarmPeriod}
                      style={[styles.periodButton, { backgroundColor: alarmPeriod === 'PM' ? colors.primary : colors.primaryLight, marginTop: 8 }]}
                    >
                      <Text style={[styles.periodText, { color: alarmPeriod === 'PM' ? '#FFFFFF' : colors.text }]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.alarmButton, { backgroundColor: alarmSet ? colors.success : colors.primary }]}
                  onPress={setAlarm}
                >
                  <MaterialIcons name={alarmSet ? 'alarm-on' : 'alarm'} size={20} color="#FFF" />
                  <Text style={styles.alarmButtonText}>
                    {alarmSet ? 'Alarm Set' : 'Set Alarm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

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
        <View style={styles.cardShadow}>
          <Card title={t('todaysSchedule')} icon="schedule" iconColor={colors.accentBlue}>
            <FlatList
              data={routines}
              renderItem={renderRoutineItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </Card>
        </View>

        {/* Calming Corner */}
        <View style={styles.cardShadow}>
          <Card title={t('calmingCorner')} icon="self-care" iconColor={colors.accentPink}>
            {calmingSchedule.length > 0 ? (
              calmingSchedule.map(item => renderCalmingScheduleItem(item))
            ) : (
              <Text style={[styles.calmingPlaceholder, { color: colors.textLight }]}>
                {t('noCalmingActivities')}
              </Text>
            )}
            {calmingSchedule.length < 5 && (
              <TouchableOpacity
                style={[styles.calmingAddButton, { borderColor: colors.primary }]}
                onPress={() => setCalmingModalVisible(true)}
              >
                <MaterialIcons name="add" size={24} color={colors.primary} />
                <Text style={[styles.calmingAddButtonText, { color: colors.primary }]}>
                  {t('addCalmingActivity')}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>

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
        <View style={styles.cardShadow}>
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
        </View>
      </ScrollView>

      {/* ─── MODAL: Add Custom Routine ─────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('addCustomActivity')}
            </Text>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.primaryLight, backgroundColor: colors.surface }]}
              placeholder={t('activityName')}
              placeholderTextColor={colors.textLight}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={[styles.pickerLabel, { color: colors.text, marginBottom: Spacing.sm }]}>
              {t('time')}
            </Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={incrementHour} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {selectedHour.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity onPress={decrementHour} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeUnit}>Hour</Text>
              </View>

              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={incrementMinute} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity onPress={decrementMinute} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeUnit}>Min</Text>
              </View>

              <View style={styles.timeColumn}>
                <TouchableOpacity
                  onPress={togglePeriod}
                  style={[styles.periodButton, { backgroundColor: selectedPeriod === 'AM' ? colors.primary : colors.primaryLight }]}
                >
                  <Text style={[styles.periodText, { color: selectedPeriod === 'AM' ? '#FFFFFF' : colors.text }]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={togglePeriod}
                  style={[styles.periodButton, { backgroundColor: selectedPeriod === 'PM' ? colors.primary : colors.primaryLight, marginTop: 8 }]}
                >
                  <Text style={[styles.periodText, { color: selectedPeriod === 'PM' ? '#FFFFFF' : colors.text }]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.pickerLabel, { color: colors.text, marginTop: Spacing.md }]}>
              {t('chooseIcon')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
              {AVAILABLE_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconOption,
                    {
                      borderColor: selectedIcon === icon ? colors.primary : 'transparent',
                      backgroundColor: selectedIcon === icon ? colors.primaryLight : colors.surface,
                    },
                  ]}
                >
                  <MaterialIcons name={icon as any} size={32} color={selectedIcon === icon ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.pickerLabel, { color: colors.text, marginTop: Spacing.md }]}>
              {t('chooseColor')}
            </Text>
            <View style={styles.colorRow}>
              {AVAILABLE_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color, borderColor: selectedColor === color ? colors.primary : 'transparent' },
                  ]}
                />
              ))}
            </View>

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

      {/* ─── MODAL: Add Calming Activity ───────────────────────── */}
      <Modal
        visible={calmingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalmingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('selectCalmingActivity')}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calmingList}>
              {CALMING_ACTIVITIES.map((activity, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedCalmingActivity(index)}
                  style={[
                    styles.calmingOption,
                    {
                      borderColor: selectedCalmingActivity === index ? activity.color : 'transparent',
                      backgroundColor: selectedCalmingActivity === index ? activity.color + '20' : colors.surface,
                    },
                  ]}
                >
                  <View style={[styles.calmingOptionIcon, { backgroundColor: activity.color + '40' }]}>
                    <MaterialIcons name={activity.icon as any} size={30} color={activity.color} />
                  </View>
                  <Text style={[styles.calmingOptionTitle, { color: colors.text }]} numberOfLines={2}>
                    {activity.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.pickerLabel, { color: colors.text, marginTop: Spacing.md }]}>
              {t('time')}
            </Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={incrementCalmingHour} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {calmingHour.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity onPress={decrementCalmingHour} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeUnit}>Hour</Text>
              </View>

              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={incrementCalmingMinute} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {calmingMinute.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity onPress={decrementCalmingMinute} style={styles.timeArrowButton}>
                  <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeUnit}>Min</Text>
              </View>

              <View style={styles.timeColumn}>
                <TouchableOpacity
                  onPress={toggleCalmingPeriod}
                  style={[styles.periodButton, { backgroundColor: calmingPeriod === 'AM' ? colors.primary : colors.primaryLight }]}
                >
                  <Text style={[styles.periodText, { color: calmingPeriod === 'AM' ? '#FFFFFF' : colors.text }]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleCalmingPeriod}
                  style={[styles.periodButton, { backgroundColor: calmingPeriod === 'PM' ? colors.primary : colors.primaryLight, marginTop: 8 }]}
                >
                  <Text style={[styles.periodText, { color: calmingPeriod === 'PM' ? '#FFFFFF' : colors.text }]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => setCalmingModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.primary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCalmingActivity}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL: Play Calming Activity ──────────────────────── */}
      <Modal
        visible={calmingPlayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setCalmingPlayModalVisible(false);
          stopBreathingAnimation();
          if (introSound) introSound.stopAsync();
          setIsCalmingTimerRunning(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, alignItems: 'center' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedPlayActivity?.title || 'Calming Activity'}
            </Text>

            {isBreathingVisible && selectedPlayActivity?.title === 'Deep Breathing' ? (
              <View style={styles.breathingContainer}>
                <Animated.View
                  style={[
                    styles.breathingCircle,
                    {
                      backgroundColor: selectedPlayActivity.color + '40',
                      borderColor: selectedPlayActivity.color,
                      transform: [{ scale: breathScale }],
                    },
                  ]}
                />
                <Text style={[styles.breathingText, { color: colors.text }]}>Breathe in... Breathe out...</Text>
              </View>
            ) : (
              <View style={styles.breathingContainer}>
                <MaterialIcons name={selectedPlayActivity?.icon as any} size={80} color={selectedPlayActivity?.color} />
                <Text style={[styles.breathingText, { color: colors.text }]}>Follow along quietly</Text>
              </View>
            )}

            <Text style={[styles.modalTimerText, { color: colors.primary }]}>
              {Math.floor(calmingTimerSeconds / 60)}:{(calmingTimerSeconds % 60).toString().padStart(2, '0')}
            </Text>

            {!isCalmingTimerRunning && (
              <View style={styles.timerInputContainer}>
                <TouchableOpacity
                  onPress={() => setCalmingTimerMinutes(prev => Math.max(1, prev - 1))}
                  style={[styles.timerAdjustButton, { backgroundColor: colors.primaryLight }]}
                >
                  <MaterialIcons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.timerInputText, { color: colors.text, borderColor: colors.primaryLight }]}>
                  {calmingTimerMinutes} min
                </Text>
                <TouchableOpacity
                  onPress={() => setCalmingTimerMinutes(prev => prev + 1)}
                  style={[styles.timerAdjustButton, { backgroundColor: colors.primaryLight }]}
                >
                  <MaterialIcons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => {
                  setCalmingPlayModalVisible(false);
                  stopBreathingAnimation();
                  if (introSound) introSound.stopAsync();
                  setIsCalmingTimerRunning(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.primary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              {!isCalmingTimerRunning ? (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={startCalmingTimer}
                >
                  <Text style={[styles.modalButtonText, { color: colors.background }]}>Start</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.error }]}
                  onPress={() => {
                    setIsCalmingTimerRunning(false);
                    stopBreathingAnimation();
                    if (introSound) introSound.stopAsync();
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Stop</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── CUSTOM POPUP MODAL (Timer / Alarm) ────────────────── */}
      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={[styles.popupContainer, { backgroundColor: colors.background }]}>
            <Text style={styles.popupEmoji}>{popupEmoji}</Text>
            <Text style={[styles.popupTitle, { color: colors.text }]}>{popupTitle}</Text>
            <Text style={[styles.popupMessage, { color: colors.textLight }]}>{popupMessage}</Text>
            <TouchableOpacity
              style={[styles.popupButton, { backgroundColor: colors.primary }]}
              onPress={closePopup}
            >
              <Text style={styles.popupButtonText}>Yay! 🎈</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  musicButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: Typography.fontSize.md,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: Spacing.md,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  timerInputText: {
    fontSize: Typography.fontSize.md, fontWeight: 'bold',
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderRadius: 8,
  },
  timerCircleWrapper: { alignItems: 'center', marginTop: Spacing.sm },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: { fontSize: 32, fontWeight: 'bold' },
  timerControls: { flexDirection: 'row', gap: 20, marginTop: Spacing.md },
  timerControlButton: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timerMiniButton: {
    marginRight: 8, padding: 4, borderRadius: 12,
  },
  progressContainer: {
    borderRadius: 12, padding: Spacing.lg,
    marginVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  progressTitle: { fontWeight: 'bold', fontSize: Typography.fontSize.lg, marginBottom: Spacing.sm },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden', marginVertical: Spacing.sm },
  progressFill: { height: '100%', borderRadius: 5 },
  progressText: { fontSize: Typography.fontSize.sm, textAlign: 'center' },
  routineItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, marginBottom: Spacing.sm,
    borderWidth: 2, borderRadius: 12,
    paddingHorizontal: Spacing.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
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
  alarmSection: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Spacing.md,
  },
  alarmTitle: { fontSize: Typography.fontSize.md, fontWeight: 'bold', marginBottom: Spacing.sm },
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  alarmButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: Typography.fontSize.md },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: { width: '90%', maxHeight: '90%', borderRadius: 24, padding: Spacing.xl },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: 'bold', marginBottom: Spacing.lg, textAlign: 'center' },
  input: {
    borderWidth: 1, borderRadius: 10, padding: Spacing.md,
    fontSize: Typography.fontSize.md, marginBottom: Spacing.md,
  },
  pickerLabel: { fontWeight: '600', fontSize: Typography.fontSize.md, marginBottom: Spacing.xs },
  timePickerContainer: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', marginBottom: Spacing.md,
    paddingVertical: Spacing.md, borderRadius: 12,
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
  modalButton: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: 12 },
  modalButtonText: { fontWeight: 'bold', fontSize: Typography.fontSize.md },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    marginBottom: Spacing.md,
  },
  breathingText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalTimerText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: Spacing.md,
  },
  // ── Popup Styles ──
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popupContainer: {
    width: '80%',
    padding: Spacing.xl,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  popupEmoji: {
    fontSize: 60,
    marginBottom: Spacing.sm,
  },
  popupTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  popupButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  popupButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
  },
});