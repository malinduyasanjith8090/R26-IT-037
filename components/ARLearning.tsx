// components/ARLearning.tsx (Updated with type safety)
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Define the item type
interface LetterItem {
  id: string;
  letter: string;
  word: string;
  image: string;
  color: string;
  difficulty: number;
}

interface NumberItem {
  id: number;
  number: string;
  word: string;
  image: string;
  color: string;
  difficulty: number;
  count: number;
}

type LearningItem = LetterItem | NumberItem;

interface ARLearningProps {
  item: LearningItem;
  onClose: () => void;
}

// Type guard functions
function isLetterItem(item: LearningItem): item is LetterItem {
  return (item as LetterItem).letter !== undefined;
}

function isNumberItem(item: LearningItem): item is NumberItem {
  return (item as NumberItem).number !== undefined;
}

export default function ARLearning({ item, onClose }: ARLearningProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const scaleAnim = useState(new Animated.Value(0))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  // Get display text based on type
  const getDisplayText = () => {
    if (isLetterItem(item)) {
      return item.letter;
    }
    return item.number;
  };

  useEffect(() => {
    // Start AR animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    return () => {
      // Cleanup
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.arContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* 3D Object Animation */}
          <Animated.View
            style={[
              styles.arObject,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <Text style={styles.arLetter}>{getDisplayText()}</Text>
            <Text style={styles.arWord}>{item.word}</Text>
          </Animated.View>

          {/* 3D Model Representation */}
          <View style={styles.arModel}>
            <View style={styles.modelBase}>
              <Text style={styles.modelLetter}>{getDisplayText()}</Text>
              <View style={[styles.modelGlow, { backgroundColor: item.color + '40' }]} />
            </View>
            <View style={styles.particlesContainer}>
              {[...Array(12)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: item.color,
                      transform: [
                        {
                          translateX: new Animated.Value(Math.sin(Date.now() / 1000 + i) * 20),
                        },
                        {
                          translateY: new Animated.Value(Math.cos(Date.now() / 1000 + i) * 20),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* AR Instructions */}
          <View style={styles.arInstructions}>
            <MaterialIcons name="camera-alt" size={24} color="#FFF" />
            <Text style={styles.arInstructionText}>
              Point camera at flat surface to see 3D model
            </Text>
          </View>

          {/* Fun Facts */}
          <View style={[styles.funFact, { backgroundColor: item.color + 'CC' }]}>
            <Text style={styles.funFactText}>
              Did you know? {item.word} starts with {getDisplayText()}!
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  arContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  arObject: {
    alignItems: 'center',
    marginBottom: 30,
  },
  arLetter: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  arWord: {
    fontSize: 32,
    color: '#FFF',
    marginTop: 10,
    fontWeight: '600',
  },
  arModel: {
    width: width - 80,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelBase: {
    position: 'relative',
  },
  modelLetter: {
    fontSize: 180,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 15,
  },
  modelGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 100,
    opacity: 0.5,
  },
  particlesContainer: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '50%',
    left: '50%',
  },
  arInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 10,
  },
  arInstructionText: {
    color: '#FFF',
    fontSize: 14,
  },
  funFact: {
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    maxWidth: width - 60,
  },
  funFactText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
});