
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function HelloFriend() {
  const router = useRouter();

  const [completed, setCompleted] = useState(false);
  const [stars, setStars] = useState(0);

  const bounce = useRef(new Animated.Value(1)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(wave, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [wave]);

  const sayHello = () => {
    if (completed) return;

    setCompleted(true);
    setStars((previous) => previous + 1);

    Animated.sequence([
      Animated.spring(bounce, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(bounce, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const waveRotation = wave.interpolate({
    inputRange: [0, 1],
    outputRange: ["-8deg", "8deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF5E8" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>

          <View style={styles.starBadge}>
            <Text style={styles.starText}>⭐ {stars}</Text>
          </View>
        </View>

        {/* Activity information */}
        <View style={styles.heading}>
          <Text style={styles.tag}>LEVEL 1 · BEGINNER</Text>
          <Text style={styles.title}>Hello, Friend!</Text>
          <Text style={styles.subtitle}>
            Let's make a new friend today.
          </Text>
        </View>

        {/* Friendly avatar */}
        <View style={styles.avatarArea}>
          <View style={styles.avatarCircle}>
            <Animated.View
              style={{
                transform: [
                  { scale: bounce },
                  { rotate: waveRotation },
                ],
              }}
            >
              <Text style={styles.avatar}>🧒</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.waveEmoji,
                { transform: [{ rotate: waveRotation }] },
              ]}
            >
              <Text style={styles.waveText}>👋</Text>
            </Animated.View>
          </View>

          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {completed
                ? "Yay! You said hello! 🎉"
                : "Hi! Let's say hello together!"}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instruction}>
          <Text style={styles.instructionTitle}>
            {completed ? "Wonderful job!" : "Your little challenge"}
          </Text>

          <Text style={styles.instructionText}>
            {completed
              ? "You tried something new today. Be proud of yourself!"
              : "Tap the button below to say hello to your new friend."}
          </Text>
        </View>

        {/* Main interaction */}
        <Pressable
          onPress={sayHello}
          disabled={completed}
          accessibilityRole="button"
          accessibilityLabel="Say hello and earn a star"
          style={({ pressed }) => [
            styles.helloButton,
            pressed && !completed && styles.buttonPressed,
            completed && styles.completedButton,
          ]}
        >
          <Text style={styles.helloButtonText}>
            {completed ? "✓ Hello, Friend!" : "👋  Say Hello!"}
          </Text>
        </Pressable>

        {/* Reward */}
        {completed && (
          <View style={styles.reward}>
            <Text style={styles.rewardStar}>⭐</Text>
            <Text style={styles.rewardTitle}>You earned a star!</Text>
            <Text style={styles.rewardSubtitle}>
              Every little step counts.
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          Take your time. There is no rush. 💛
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5E8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 18,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  backText: {
    color: "#574A70",
    fontSize: 16,
    fontWeight: "700",
  },
  starBadge: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  starText: {
    color: "#795500",
    fontSize: 16,
    fontWeight: "800",
  },
  heading: {
    alignItems: "center",
    marginTop: 22,
  },
  tag: {
    color: "#9A68B5",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: "#49335F",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 8,
  },
  subtitle: {
    color: "#776B83",
    fontSize: 15,
    marginTop: 7,
    textAlign: "center",
  },
  avatarArea: {
    alignItems: "center",
    marginTop: 24,
  },
  avatarCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#E6D9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    fontSize: 94,
  },
  waveEmoji: {
    position: "absolute",
    right: -5,
    top: 12,
  },
  waveText: {
    fontSize: 42,
  },
  speechBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 20,
    maxWidth: "100%",
  },
  speechText: {
    color: "#49335F",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  instruction: {
    alignItems: "center",
    marginTop: 22,
  },
  instructionTitle: {
    color: "#49335F",
    fontSize: 19,
    fontWeight: "800",
  },
  instructionText: {
    color: "#776B83",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
  helloButton: {
    width: "100%",
    backgroundColor: "#8C64D8",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 24,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  completedButton: {
    backgroundColor: "#48A978",
  },
  helloButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  reward: {
    alignItems: "center",
    marginTop: 14,
  },
  rewardStar: {
    fontSize: 28,
  },
  rewardTitle: {
    color: "#795500",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },
  rewardSubtitle: {
    color: "#776B83",
    fontSize: 13,
    marginTop: 3,
  },
  footer: {
    color: "#8B7D98",
    fontSize: 12,
    textAlign: "center",
    marginTop: "auto",
    paddingTop: 12,
  },
});
