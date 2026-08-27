import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import TracingCanvas from '../../components/TracingCanvasdilsha';
import { useChild } from '../../context/ChildContext';
import { endSession, startSession, submitTrial, syncOfflineQueue } from '../../services/apiService';
import { getShapesForDifficulty } from '../data/shapes/sriLankanShapes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Determines performance phase from blended accuracy (0.0 – 1.0).
 * Uses frontend blendedAccuracy — no server roundtrip needed.
 *
 * POOR  < 0.40 — gentle retry, no punishment
 * OK    0.40 – 0.74 — encouraging, acknowledges effort
 * GREAT ≥ 0.75 — full reward, celebration
 * 
 * 
 */

const SHAPE_EMOJIS: Record<string, string> = {
  ball: '⚽',
  basketball: '🏀',
  star: '⭐',
  flower: '🌸',
  banana: '🍌',
  ship: '🚢',
  car: '🚗',
  hand: '✋',
  tshirt: '👕',
  cloud: '☁️',
  butterfly: '🦋',
  bus: '🚌',
  house: '🏠',
};

function getShapeEmoji(shape: any) {
  return SHAPE_EMOJIS[shape.imageId] || SHAPE_EMOJIS[shape.id] || '🔷'; // fallback
}

function getPerformancePhase(blendedAccuracy) {
  if (blendedAccuracy >= 0.75) return 'great';
  if (blendedAccuracy >= 0.40) return 'ok';
  return 'poor';
}

export default function TracingGameScreen() {
  const { activeChild, cognitiveState, updateCognitiveState } = useChild();

  const [sessionId,       setSessionId]       = useState(null);
  const [currentShape,    setCurrentShape]    = useState(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [shapeSize,       setShapeSize]       = useState(240);
  const [guidanceLevel,   setGuidanceLevel]   = useState('voice');
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const trialNumberRef = useRef(0); // avoid setState race conditions on trial count
  const [performancePhase, setPerformancePhase] = useState(null); // null | 'poor' | 'ok' | 'great'
  const [sessionLoading,  setSessionLoading]  = useState(true);
  const [accuracy,        setAccuracy]        = useState(null);
  const sessionTrialsRef = useRef([]);

  // Start a new session when screen loads
  useEffect(() => {
    initSession();
    syncOfflineQueue(); // try to sync any offline trials
  }, []);

  // NOTE: no auto-pick effect here anymore. Changing difficulty just clears
  // the current shape so the picker grid is shown; the user (or auto-advance
  // logic in handleTrialComplete) decides what happens next.

  async function initSession() {
    if (!activeChild) {
      console.warn('No active child selected');
      setSessionLoading(false);
      Alert.alert('Error', 'Please select a child first', [
        {
          text: 'Go Back',
          onPress: () => router.back()
        }
      ]);
      return;
    }
    const child = activeChild;

    setSessionLoading(true);
    const session = await startSession(child._id, {
      platform: 'web',
      screenWidth: Math.round(SCREEN_WIDTH),
      screenHeight: Math.round(Dimensions.get('window').height),
    });
    setSessionId(session._id || 'offline_session_001');

    const initialDifficulty = cognitiveState?.difficultyLevel || 1;
    setDifficultyLevel(initialDifficulty);
    setShapeSize(getSizeForDifficulty(initialDifficulty));
    setGuidanceLevel(getGuidanceForDifficulty(initialDifficulty));
    setSessionLoading(false);
    // currentShape stays null here on purpose — this puts the user into the
    // shape-selection grid rather than silently auto-picking one.
  }

  function pickNextShape(difficulty: number) {
    const shapes = getShapesForDifficulty(difficulty);

    if (!shapes || shapes.length === 0) {
      setCurrentShape(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * shapes.length);
    setCurrentShape(shapes[randomIndex]);
    setSelectedShapeId(shapes[randomIndex].id);
  }

  function getSizeForDifficulty(level) {
    return 300; // Keep constant size across all difficulty levels
  }

  function getGuidanceForDifficulty(level) {
    return { 1: 'full', 2: 'voice', 3: 'subtle', 4: 'none', 5: 'none' }[level] || 'voice';
  }

  // Called when user picks a level from the dropdown/modal
  function handleLevelSelect(level: number) {
    setShowLevelPicker(false);

    setDifficultyLevel(level);
    setShapeSize(getSizeForDifficulty(level));
    setGuidanceLevel(getGuidanceForDifficulty(level));

    setAccuracy(null);

    // Clear previous shape so the picker grid is shown for the new level
    setSelectedShapeId(null);
    setCurrentShape(null);
  }

  function handleShapeSelect(shape: any) {
    setSelectedShapeId(shape.id);
    setCurrentShape(shape);
    setAccuracy(null);
  }

  /**
   * Called by TracingCanvas when a tracing attempt ends
   */
  async function handleTrialComplete({ metrics, touchPathSample, completed }) {
    trialNumberRef.current += 1;
    const currentTrial = trialNumberRef.current;

    if (!activeChild) {
      console.warn('No active child selected during trial');
      return;
    }

    const trialData = {
      childId:        activeChild._id,
      sessionId,
      trialNumber:    currentTrial,
      shapeId:        currentShape.id,
      shapeCategory:  currentShape.category,
      difficultyLevel,
      metrics,
      touchPathSample,
      completed,
    };

    // Submit to backend (or offline queue)
    const result = await submitTrial(trialData);
    sessionTrialsRef.current.push(result.accuracyScore);

    // Clamp difficulty to max level 4
    const nextLevel = Math.min(result.currentDifficultyLevel || difficultyLevel, 4);

    // Update local cognitive state display
    if (nextLevel && nextLevel !== difficultyLevel) {
      setDifficultyLevel(nextLevel);
      setShapeSize(getSizeForDifficulty(nextLevel));
      setGuidanceLevel(getGuidanceForDifficulty(nextLevel));
    }

    setAccuracy(Math.round(result.accuracyScore * 100));

    // ── Phase decision from frontend blendedAccuracy ──────────────────────
    const phase = getPerformancePhase(metrics.blendedAccuracy);
    setPerformancePhase(phase);

    if (phase === 'great') {
      // Full celebration — earned it, auto-advance to next shape
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setPerformancePhase(null);
        pickNextShape(nextLevel);
      }, 2200);

    } else if (phase === 'ok') {
      // Gentle encouragement — light haptic, shorter display, auto-advance
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => {
        setPerformancePhase(null);
        pickNextShape(nextLevel);
      }, 1800);

    } else {
      // Poor — no haptic (avoid negative reinforcement), very brief overlay,
      // retry the same shape rather than advancing
      setTimeout(() => {
        setPerformancePhase(null);
        pickNextShape(difficultyLevel);
      }, 1600);
    }
  }

  // End session and go back
  async function handleEndSession() {
    if (!activeChild) {
      console.warn('No active child selected during session end');
      return;
    }

    const scores = sessionTrialsRef.current;
    const avgAccuracy = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    await endSession(sessionId, activeChild._id, {
      totalTrials:      scores.length,
      completedTrials:  scores.filter(s => s > 0).length,
      avgAccuracyScore: parseFloat(avgAccuracy.toFixed(3)),
      difficultyProgression: scores.map((_, i) => difficultyLevel),
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      trialNumberRef.current = 0;
      setAccuracy(null);
      sessionTrialsRef.current = [];
      setCurrentShape(null);
      setSelectedShapeId(null);
      initSession();
    }
  }

  // Only the session bootstrap blocks rendering now — shape selection is a
  // normal in-flow state, not a loading state.
  if (sessionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Getting ready...</Text>
      </View>
    );
  }

  // No shape chosen yet for this level → show the picker grid instead of the canvas.
  if (!currentShape) {
    return (
      <View style={styles.container}>
       <View style={styles.shapeSelectionContainer}>
  <Text style={styles.shapeSelectionTitle}>Select a Shape</Text>

  <View style={styles.shapeList}>
  {getShapesForDifficulty(difficultyLevel).map((shape: any) => {
    const isSelected = selectedShapeId === shape.id;
    return (
      <TouchableOpacity
        key={shape.id}
        activeOpacity={0.8}
        onPress={() => handleShapeSelect(shape)}
        style={[
          styles.shapeListItem,
          isSelected && styles.shapeCardSelected,
        ]}
      >
        <Text style={styles.shapeEmoji}>{getShapeEmoji(shape)}</Text>
        <View style={styles.shapeTextGroup}>
          <Text style={styles.shapeName}>{shape.name}</Text>
          <Text style={styles.shapeNameSinhala}>{shape.nameSinhala}</Text>
        </View>
      </TouchableOpacity>
    );
  })}
</View>
</View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.levelButton}
            onPress={() => setShowLevelPicker(true)}
          >
            <Text style={styles.levelButtonText}>Level {difficultyLevel} ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEndSession}>
            <Text style={styles.endButton}>End Session</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showLevelPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLevelPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLevelPicker(false)}
          >
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Level</Text>
              {[
                { level: 1, label: 'Level 1 — Ball | Flower | Cloud',     hint: 'Simple circles and shapes' },
                { level: 2, label: 'Level 2 — Butterfly | Banana | Car', hint: 'Gentle curves' },
                { level: 3, label: 'Level 3 — T-Shirt | Bus | House',      hint: 'Compound outlines' },
                { level: 4, label: 'Level 4 — Hand | Star | Ship',  hint: 'Fine motor control' },
              ].map(({ level, label, hint }) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.pickerItem,
                    difficultyLevel === level && styles.pickerItemActive,
                  ]}
                  onPress={() => handleLevelSelect(level)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    difficultyLevel === level && styles.pickerItemTextActive,
                  ]}>
                    {label}
                  </Text>
                  <Text style={styles.pickerItemHint}>{hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // A shape is selected → show the tracing canvas.
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.shapeName}>{currentShape.nameSinhala}</Text>
        <Text style={styles.shapeNameEn}>{currentShape.name}</Text>
        {accuracy !== null && (
          <Text style={styles.accuracyText}>
            Last: {accuracy}%
          </Text>
        )}
      </View>

      {/* Instruction text */}
      <Text style={styles.instruction}>
        Place your finger on the green dot and trace to the red dot
      </Text>

      {/* The tracing canvas */}
      <View style={styles.canvasContainer}>
        <TracingCanvas
          shape={currentShape}
          shapeSize={shapeSize}
          guidanceLevel={guidanceLevel}
          onTrialComplete={handleTrialComplete}
        />
      </View>

      {/* Performance phase overlay — three distinct responses */}
      {performancePhase === 'great' && (
        <View style={[styles.phaseOverlay, styles.phaseGreat]}>
          <Text style={styles.phaseStar}>★</Text>
          <Text style={styles.phaseTitle}>Well done!</Text>
          <Text style={styles.phaseSinhala}>ගොඩාක් හොඳයි!</Text>
        </View>
      )}

      {performancePhase === 'ok' && (
        <View style={[styles.phaseOverlay, styles.phaseOk]}>
          <Text style={styles.phaseStar}>👍</Text>
          <Text style={styles.phaseTitle}>Good try!</Text>
          <Text style={styles.phaseSinhala}>හොඳයි, නැවත උත්සාහ කරන්න!</Text>
        </View>
      )}

      {performancePhase === 'poor' && (
        <View style={[styles.phaseOverlay, styles.phasePoor]}>
          <Text style={styles.phaseStar}>🔵</Text>
          <Text style={styles.phaseTitle}>Let's try again</Text>
          <Text style={styles.phaseSinhala}>සෙමෙන් dots follow කරන්න</Text>
        </View>
      )}

      {/* Level picker modal */}
      <Modal
        visible={showLevelPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLevelPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLevelPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Level</Text>
            {[
              { level: 1, label: 'Level 1 — Ball | Star | Cloud',     hint: 'Simple circles and shapes' },
              { level: 2, label: 'Level 2 — Butterfly | Banana | Car', hint: 'Gentle curves' },
              { level: 3, label: 'Level 3 — T-Shirt | Bus | House',      hint: 'Compound outlines' },
              { level: 4, label: 'Level 4 — Hand | Star | Ship',  hint: 'Fine motor control' },
            ].map(({ level, label, hint }) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.pickerItem,
                  difficultyLevel === level && styles.pickerItemActive,
                ]}
                onPress={() => handleLevelSelect(level)}
              >
                <Text style={[
                  styles.pickerItemText,
                  difficultyLevel === level && styles.pickerItemTextActive,
                ]}>
                  {label}
                </Text>
                <Text style={styles.pickerItemHint}>{hint}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.levelButton}
          onPress={() => setShowLevelPicker(true)}
        >
          <Text style={styles.levelButtonText}>Level {difficultyLevel} ▾</Text>
        </TouchableOpacity>
        <Text style={styles.trialCountText}>Trial {trialNumberRef.current}</Text>
        <TouchableOpacity onPress={handleEndSession}>
          <Text style={styles.endButton}>End Session</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5',  // warm white — calm for ASD
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF5'
  },
  loadingText: {
    fontSize: 18, color: '#8B7355', marginTop: 16, fontFamily: 'System'
  },
  header: {
    alignItems: 'center', marginBottom: 8
  },
  shapeName: {
    fontSize: 28, color: '#3D2B1F', fontWeight: '500', letterSpacing: 1
  },
  shapeNameEn: {
    fontSize: 16, color: '#8B7355', marginTop: 2
  },
  accuracyText: {
    fontSize: 14, color: '#6B9B6B', marginTop: 4
  },
  instruction: {
    fontSize: 15, color: '#8B7355', textAlign: 'center',
    marginHorizontal: 24, marginBottom: 20, lineHeight: 22
  },
  canvasContainer: {
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }
    })
  },
  // ── Phase overlays ─────────────────────────────────────────────────────
  phaseOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 20,
  },
  phaseGreat: {
    backgroundColor: 'rgba(255, 200, 50, 0.93)',  // warm gold — celebration
  },
  phaseOk: {
    backgroundColor: 'rgba(100, 180, 120, 0.88)', // soft green — encouraging
  },
  phasePoor: {
    backgroundColor: 'rgba(160, 200, 240, 0.88)', // calm blue — no alarm
  },
  phaseStar: {
    fontSize: 64, marginBottom: 8,
  },
  phaseTitle: {
    fontSize: 32, color: '#3D2B1F', fontWeight: '600', marginBottom: 6,
  },
  phaseSinhala: {
    fontSize: 18, color: '#5A3E28', marginTop: 2, textAlign: 'center',
    paddingHorizontal: 20,
  },
  guidanceOverlay: {
    position: 'absolute', bottom: 100, left: 40, right: 40,
    backgroundColor: 'rgba(100, 160, 220, 0.88)',
    borderRadius: 16, padding: 16, alignItems: 'center'
  },
  guidanceText:        { fontSize: 20, color: '#fff', fontWeight: '500' },
  guidanceTextSinhala: { fontSize: 16, color: '#ddeeff', marginTop: 4 },
  footer: {
    position: 'absolute', bottom: 30,
    flexDirection: 'row', justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.85, alignItems: 'center'
  },
  difficultyText: { fontSize: 14, color: '#8B7355', backgroundColor: '#F0E8D8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  trialCountText: { fontSize: 14, color: '#8B7355' },
  endButton:      { fontSize: 14, color: '#C0392B', fontWeight: '500', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#C0392B', borderRadius: 8 },

  levelButton: {
    backgroundColor: '#F0E8D8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8B89A',
  },
  levelButtonText: {
    fontSize: 14,
    color: '#5A3E28',
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  pickerContainer: {
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    ...Platform.select({
      web: { boxShadow: '0 -4px 20px rgba(0,0,0,0.12)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  pickerTitle: {
    fontSize: 13,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  pickerItemActive: {
    backgroundColor: '#F0E8D8',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#3D2B1F',
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: '#8B4513',
  },
  pickerItemHint: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 2,
  },
  // NOTE: shapeSelectionContainer, shapeSelectionTitle, shapeGrid, shapeCard,
  // shapeCardSelected, shapeNameSinhala were referenced in the picker JSX in
  // the original file but weren't defined in this stylesheet — add these
  // (or your app's equivalents) or the picker grid will render unstyled.
  shapeSelectionContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  shapeSelectionTitle: {
    fontSize: 22,
    color: '#3D2B1F',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  shapeCard: {
    width: 140,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5EFE0',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shapeCardSelected: {
    borderColor: '#FF8C42',
    backgroundColor: '#FFF3E0',
  },
  shapeNameSinhala: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 4,
  },

  shapeList: {
  flexDirection: 'column',
  width: '100%',
  gap: 12,
},
shapeListItem: {
  width: '100%',
  flexDirection: 'row',        // emoji next to text now
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 16,
  backgroundColor: '#F5EFE0',
  borderWidth: 2,
  borderColor: 'transparent',
  gap: 14,
},
shapeEmoji: {
  fontSize: 32,
},
shapeTextGroup: {
  flexDirection: 'column',
},
});