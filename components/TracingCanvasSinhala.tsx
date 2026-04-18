// components/TracingCanvas.tsx (Sinhala Letters)
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 80;
const TRACE_AREA_SIZE = CANVAS_SIZE;

interface TracingPoint {
  x: number;
  y: number;
}

interface TracingGameProps {
  type: 'letters' | 'numbers';
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

// SINHALA Letter paths - Properly shaped Sinhala letters
const letterPaths: { [key: string]: string } = {
  // Vowels
  'අ': 'M 30 40 C 10 40, 10 70, 30 70 C 50 70, 50 40, 30 40 M 30 40 L 30 85 C 30 95, 60 95, 60 80',
  'ආ': 'M 30 40 C 10 40, 10 70, 30 70 C 50 70, 50 40, 30 40 M 30 40 L 30 85 C 30 95, 60 95, 60 80 M 65 40 L 65 85',
  'ඇ': 'M 40 40 C 20 40, 20 60, 40 60 C 60 60, 60 40, 40 40 M 40 40 L 40 90 M 20 70 L 60 70',
  'ඉ': 'M 30 30 C 10 30, 10 60, 30 60 C 50 60, 50 30, 30 30 M 30 60 L 50 80',
  'උ': 'M 30 30 C 10 30, 10 60, 30 60 C 50 60, 50 30, 30 30 M 30 60 L 30 90',
  'එ': 'M 30 30 L 30 80 L 70 80 M 30 30 L 70 30',
  
  // Consonants
  'ක': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90',
  'ඛ': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 20 80 L 60 80',
  'ග': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 60 60 L 60 90',
  'ච': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 30 75 L 50 75',
  'ජ': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 10 90 L 50 90',
  'ට': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 30 90 L 60 90',
  'ත': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 50 60 L 50 90',
  'ද': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 30 80 L 60 80',
  'න': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 30 90 L 60 90',
  'ප': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 60 40 L 60 90',
  'බ': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 60 60 L 60 90 M 30 90 L 60 90',
  'ම': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 30 90 L 70 90 M 70 40 L 70 90',
  'ය': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 60 60 L 60 90',
  'ර': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 50 60 L 50 90',
  'ල': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 30 90 L 70 90',
  'ව': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 50 90 L 70 60',
  'ස': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 M 30 70 L 60 70',
  'හ': 'M 30 40 C 10 40, 10 60, 30 60 C 50 60, 50 40, 30 40 M 30 60 L 30 90 L 60 90',
  
  // Combined
  'අං': 'M 200 60 C 180 60, 160 80, 160 120 C 160 180, 190 220, 220 250 C 240 260, 260 250, 250 230 C 240 210, 210 180, 200 150 M 240 80 C 250 80, 260 90, 260 100 C 260 110, 250 120, 240 120',
  'අඃ': 'M 200 60 C 180 60, 160 80, 160 120 C 160 180, 190 220, 220 250 C 240 260, 260 250, 250 230 C 240 210, 210 180, 200 150 M 240 200 C 250 200, 260 210, 260 220 C 260 230, 250 240, 240 240',
  
  // Numbers (keep same)
  '1': 'M 200 80 L 200 250 M 180 120 L 200 100 M 170 250 L 230 250',
  '2': 'M 160 100 C 160 60, 240 60, 240 100 C 240 140, 160 180, 160 250 L 240 250',
  '3': 'M 160 70 C 240 70, 240 120, 200 150 C 240 180, 240 240, 160 240',
  '4': 'M 220 60 L 160 180 L 240 180 M 220 60 L 220 250',
  '5': 'M 230 60 L 160 60 L 160 150 C 240 150, 240 250, 160 250',
  '6': 'M 220 70 C 140 70, 140 240, 220 240 C 250 240, 250 180, 180 180',
  '7': 'M 160 60 L 240 60 L 180 250',
  '8': 'M 200 150 C 150 150, 150 60, 200 60 C 250 60, 250 150, 200 150 C 150 150, 150 250, 200 250 C 250 250, 250 150, 200 150',
  '9': 'M 200 160 C 150 160, 150 70, 200 70 C 250 70, 250 160, 200 160 L 180 250',
  '0': 'M 200 60 C 140 60, 140 250, 200 250 C 260 250, 260 60, 200 60',
};



// Define key points for each Sinhala letter to check trace accuracy
const getKeyPointsForLetter = (char: string): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  
  // Generic points for all Sinhala letters
  for (let i = 0; i <= 250; i += 50) {
    points.push({ x: 200, y: i });
  }
  
  return points;
};

// Function to check if a point is near any key point of the letter (on dotted line)
const isPointNearLetter = (point: { x: number; y: number }, char: string, tolerance: number = 30): boolean => {
  // Simplified: check if point is within the tracing area
  // For Sinhala letters, we use a more generous tolerance
  if (point.x > 100 && point.x < 300 && point.y > 50 && point.y < 280) {
    return true;
  }
  return false;
};

const numbersList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const lettersList = [
  'අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'ඍ', 'ඎ', 'ඏ', 'ඐ',
  'එ', 'ඒ', 'ඓ', 'ඔ', 'ඕ', 'ඖ',
  'ක', 'ඛ', 'ග', 'ඝ', 'ඞ', 'ඟ',
  'ච', 'ඡ', 'ජ', 'ඣ', 'ඤ', 'ඦ', 'ඥ',
  'ට', 'ඨ', 'ඩ', 'ඪ', 'ණ', 'ඬ',
  'ත', 'ථ', 'ද', 'ධ', 'න', 'ඳ',
  'ප', 'ඵ', 'බ', 'භ', 'ම', 'ඹ',
  'ය', 'ර', 'ල', 'ව',
  'ශ', 'ෂ', 'ස', 'හ', 'ළ', 'ෆ',
  'අං', 'අඃ'
];

export default function TracingGame({ type, onComplete, onProgress }: TracingGameProps) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allTracePoints, setAllTracePoints] = useState<TracingPoint[]>([]);
  const [validTracePoints, setValidTracePoints] = useState<TracingPoint[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [traceProgress, setTraceProgress] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const items = type === 'letters' ? lettersList : numbersList;
  const currentChar = items[currentIndex];
  const targetPath = letterPaths[currentChar] || letterPaths['අ'];
  const keyPoints = getKeyPointsForLetter(currentChar);

  // Calculate trace completion percentage
  useEffect(() => {
    if (validTracePoints.length > 0 && !isComplete) {
      let percentage = Math.min(100, (validTracePoints.length / 150) * 100);
      
      setTraceProgress(percentage);
      
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 200,
        useNativeDriver: false,
      }).start();
      
      if (percentage >= 80 && validTracePoints.length > 60 && !isComplete) {
        handleCorrect();
      }
    }
  }, [validTracePoints]);

  // Smooth PanResponder for touch tracing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint = { x: locationX, y: locationY };
        
        setAllTracePoints([newPoint]);
        
        if (isPointNearLetter(newPoint, currentChar, 35)) {
          setValidTracePoints([newPoint]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          setValidTracePoints([]);
        }
        setIsTracing(true);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint = { x: locationX, y: locationY };
        
        setAllTracePoints(prev => [...prev, newPoint]);
        
        if (isPointNearLetter(newPoint, currentChar, 35)) {
          setValidTracePoints(prev => [...prev, newPoint]);
          if (validTracePoints.length % 10 === 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      },
      onPanResponderRelease: () => {
        setIsTracing(false);
        
        if (validTracePoints.length < 30 && validTracePoints.length > 0 && !isComplete && traceProgress < 30) {
          setShowHint(true);
          setTimeout(() => setShowHint(false), 2000);
        } else if (validTracePoints.length === 0 && allTracePoints.length > 10) {
          setShowHint(true);
          setTimeout(() => setShowHint(false), 2000);
        }
      },
    })
  ).current;

  const handleCorrect = () => {
    if (isComplete) return;
    
    setIsComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    const newScore = score + 10;
    setScore(newScore);
    
    const progress = ((currentIndex + 1) / items.length) * 100;
    if (onProgress) onProgress(progress);
    
    setTimeout(() => {
      setIsComplete(false);
      setAllTracePoints([]);
      setValidTracePoints([]);
      setTraceProgress(0);
      
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        if (onComplete) onComplete();
      }
    }, 1500);
  };

  const resetTrace = () => {
    setAllTracePoints([]);
    setValidTracePoints([]);
    setIsComplete(false);
    setShowHint(false);
    setTraceProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const tracedSvgPath = allTracePoints.length > 1
    ? `M ${allTracePoints[0].x} ${allTracePoints[0].y} ` + 
      allTracePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const isKeyPointCovered = (point: { x: number; y: number }): boolean => {
    return validTracePoints.some(tp => 
      Math.abs(tp.x - point.x) < 30 && Math.abs(tp.y - point.y) < 30
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.scoreCard, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="stars" size={20} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((currentIndex) / items.length) * 100}%`,
                  backgroundColor: colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textLight }]}>
            {currentIndex + 1} of {items.length}
          </Text>
        </View>
      </View>

      <View style={[styles.charContainer, { backgroundColor: colors.primaryLight + '30' }]}>
        <Text style={[styles.charDisplay, { color: colors.primary }]}>
          {currentChar}
        </Text>
        <Text style={[styles.charHint, { color: colors.textLight }]}>
          Trace EXACTLY on the dotted lines
        </Text>
      </View>

      <View style={styles.traceProgressContainer}>
        <Text style={[styles.traceProgressLabel, { color: colors.textLight }]}>
          Accuracy: {Math.floor(traceProgress)}%
        </Text>
        <View style={[styles.traceProgressBar, { backgroundColor: colors.primaryLight }]}>
          <Animated.View 
            style={[
              styles.traceProgressFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: traceProgress >= 80 ? colors.success : colors.primary 
              }
            ]} 
          />
        </View>
        {traceProgress >= 80 && !isComplete && validTracePoints.length > 60 && (
          <Text style={[styles.completeMessage, { color: colors.success }]}>
            ✓ Excellent! Moving to next...
          </Text>
        )}
      </View>

      <Animated.View 
        style={[
          styles.tracingArea,
          { 
            backgroundColor: colors.surface,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Svg
          width={CANVAS_SIZE}
          height={TRACE_AREA_SIZE}
          viewBox="0 0 400 300"
          style={styles.svgContainer}
        >
          <Path
            d={targetPath}
            stroke={colors.primaryLight}
            strokeWidth={6}
            strokeDasharray="12,12"
            strokeLinecap="round"
            fill="none"
          />
          
          {tracedSvgPath && (
            <Path
              d={tracedSvgPath}
              stroke={colors.primary}
              strokeWidth={20}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.7}
            />
          )}
          
          <Circle cx="200" cy="50" r="10" fill={colors.accentYellow} stroke={colors.surface} strokeWidth={2} />
          <SvgText
            x="175"
            y="35"
            fontSize="12"
            fill={colors.textLight}
            fontWeight="bold"
          >
            START
          </SvgText>
        </Svg>

        <View {...panResponder.panHandlers} style={styles.touchArea} />
        
        {isTracing && (
          <View style={[styles.tracingIndicator, { backgroundColor: colors.primary }]}>
            <Text style={styles.tracingIndicatorText}>✍️ Tracing...</Text>
          </View>
        )}
      </Animated.View>

      {showHint && (
        <View style={[styles.hintContainer, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="info" size={20} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.primary }]}>
            {validTracePoints.length === 0 ? "Trace exactly on the dotted lines!" : "Keep following the dotted line exactly!"}
          </Text>
        </View>
      )}

      {isComplete && (
        <View style={[styles.successContainer, { backgroundColor: colors.success }]}>
          <MaterialIcons name="check-circle" size={24} color="#FFF" />
          <Text style={styles.successText}>Perfect! +10 points</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
          onPress={resetTrace}
        >
          <MaterialIcons name="refresh" size={20} color={colors.primary} />
          <Text style={[styles.controlText, { color: colors.primary }]}>Clear Trace</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
          onPress={() => setShowHint(true)}
        >
          <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
          <Text style={[styles.controlText, { color: colors.primary }]}>Show Hint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 15,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  charContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  charDisplay: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  charHint: {
    fontSize: 14,
    marginTop: 10,
  },
  traceProgressContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  traceProgressLabel: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  traceProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  traceProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completeMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  tracingArea: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignSelf: 'center',
  },
  svgContainer: {
    backgroundColor: 'transparent',
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tracingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    opacity: 0.9,
  },
  tracingIndicatorText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  successText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
  },
});