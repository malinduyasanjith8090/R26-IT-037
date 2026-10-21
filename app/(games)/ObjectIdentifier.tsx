
// Roboflow Object Identifier Component




import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as Speech from "expo-speech";
import { useLanguage } from "../../context/LanguageContext";

// Roboflow configuration
// Replace the API key with your actual key.
const API_KEY = "OoHXY3wnSDmhaKzT3LVr";
const WORKSPACE = "thisals-workspace";
const WORKFLOW_ID = "yolo-world-medium-demo";

const ROBOFLOW_ENDPOINT =
  `https://serverless.roboflow.com/${WORKSPACE}/workflows/${WORKFLOW_ID}`;

const LABELS_SI = {
  chair: "පුටුවක්",
  table: "මේසයක්",
  "dining table": "මේසයක්",
  cup: "කෝප්පයක්",
  mug: "කෝප්පයක්",
  couch: "සෝෆාවක්",
  sofa: "සෝෆාවක්",
  bed: "ඇඳක්",
  bottle: "බෝතලයක්",
  book: "පොතක්",
  tv: "රූපවාහිනියක්",
  laptop: "ලැප්ටොප් පරිගණකයක්",
  person: "පුද්ගලයෙක්",
};

const LABELS_EN = {
  chair: "Chair",
  table: "Table",
  "dining table": "Dining Table",
  cup: "Cup",
  mug: "Mug",
  couch: "Sofa",
  sofa: "Sofa",
  bed: "Bed",
  bottle: "Bottle",
  book: "Book",
  tv: "Television",
  laptop: "Laptop",
  person: "Person",
};

function getObjectLabel(name, language) {
  const key = String(name || "").toLowerCase().trim();

  if (language === "si") {
    return LABELS_SI[key] || name;
  }

  return LABELS_EN[key] || name;
}

function extractPredictions(data) {
  const found = [];

  function walk(value) {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (typeof value !== "object") return;

    if (
      typeof value.class === "string" &&
      (
        typeof value.confidence === "number" ||
        typeof value.class_id === "number"
      )
    ) {
      found.push({
        name: value.class.toLowerCase().trim(),
        confidence:
          typeof value.confidence === "number"
            ? value.confidence
            : 1,
      });

      return;
    }

    Object.values(value).forEach(walk);
  }

  walk(data);

  const unique = new Map();

  found.forEach((item) => {
    const key = `${item.name}-${item.confidence}`;

    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values());
}

export default function ObjectIdentifier() {
  const cameraRef = useRef(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [photo, setPhoto] = useState(null);
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const { language, setLanguage, t } = useLanguage();

  async function takePhoto() {
    if (!cameraReady || !cameraRef.current || loading) {
      return;
    }

    try {
      Speech.stop();
      setObjects([]);
      setPhoto(null);

      const result = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      if (result?.uri) {
        setPhoto(result.uri);
        await detectObjects(result.uri);
      }
    } catch (error) {
      console.error("Camera error:", error);

      Alert.alert(
        t("cameraErrorTitle"),
        t("cameraErrorMessage")
      );
    }
  }

  async function detectObjects(imageUri) {
    if (
      !API_KEY ||
      API_KEY === "YOUR_ROBOFLOW_API_KEY" ||
      !WORKSPACE ||
      !WORKFLOW_ID
    ) {
      Alert.alert(
        t("configurationError"),
        "Please set your Roboflow API key in ObjectIdentifier.jsx."
      );
      return;
    }

    setLoading(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(
        imageUri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      const response = await fetch(ROBOFLOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          inputs: {
            image: {
              type: "base64",
              value: base64,
            },
          },
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Roboflow returned invalid JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        console.error("Roboflow error:", data);
        throw new Error(`HTTP ${response.status}`);
      }

      console.log("Roboflow Workflow Result:", data);

      const predictions = extractPredictions(data);
      const counts = {};

      predictions.forEach((item) => {
        if (item.confidence < 0.4) return;

        const name = item.name;
        counts[name] = (counts[name] || 0) + 1;
      });

      const results = Object.entries(counts).map(
        ([name, count]) => ({
          name,
          count,
          label: getObjectLabel(name, language),
        })
      );

      setObjects(results);

      // Keep the original Sinhala voice behaviour.
      if (results.length === 0) {
        Speech.speak(
          "මේ ඡායාරූපයේ හඳුනාගත හැකි වස්තූන් හමු වුණේ නැහැ.",
          {
            language: "si-LK",
            rate: 0.8,
          }
        );
        return;
      }

      const sentences = results.map((item) => {
        const sinhalaLabel = LABELS_SI[item.name] || item.name;

        if (item.count === 1) {
          return `මෙතන ${sinhalaLabel} තියෙනවා`;
        }

        return `මෙතන ${sinhalaLabel} ${item.count}ක් තියෙනවා`;
      });

      Speech.speak(sentences.join(". "), {
        language: "si-LK",
        rate: 0.8,
      });
    } catch (error) {
      console.error("Object detection error:", error);

      Alert.alert(
        t("detectionErrorTitle"),
        `${t("detectionErrorMessage")}\n\n${error.message || ""}`
      );
    } finally {
      setLoading(false);
    }
  }

  function speakResults() {
    if (objects.length === 0) return;

    const sentences = objects.map((item) => {
      const sinhalaLabel = LABELS_SI[item.name] || item.name;

      if (item.count === 1) {
        return `මෙතන ${sinhalaLabel} තියෙනවා`;
      }

      return `මෙතන ${sinhalaLabel} ${item.count}ක් තියෙනවා`;
    });

    Speech.stop();

    Speech.speak(sentences.join(". "), {
      language: "si-LK",
      rate: 0.8,
    });
  }

  function resetCamera() {
    Speech.stop();
    setPhoto(null);
    setObjects([]);
    setCameraReady(false);
  }

  function toggleLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    Speech.stop();
  }

 

  if (!permission) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7058D9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          contentContainerStyle={styles.permissionContainer}
        >

          <View style={styles.permissionIllustration}>
            <Text style={styles.bigEmoji}>📸</Text>
            <Text style={styles.sparkleOne}>✨</Text>
            <Text style={styles.sparkleTwo}>⭐</Text>
          </View>

          <Text style={styles.title}>
            {t("cameraPermissionTitle")}
          </Text>

          <Text style={styles.description}>
            {t("cameraPermissionDescription")}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonEmoji}>📷</Text>
            <Text style={styles.primaryButtonText}>
              {t("allowCamera")}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9EE" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandEmoji}>🔎</Text>
            </View>

            <View style={styles.brandTextContainer}>
              <Text style={styles.brandName}>
                {t("objectExplorer")}
              </Text>
              <Text style={styles.brandCaption}>
                {t("subtitle")}
              </Text>
            </View>
          </View>

        </View>

        {!photo ? (
          <>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeEyebrow}>
                  {t("cameraReady")}
                </Text>

                <Text style={styles.welcomeTitle}>
                  {t("takePhoto")}
                </Text>

                <Text style={styles.welcomeDescription}>
                  {t("takePhotoDescription")}
                </Text>
              </View>

            </View>

            <View style={styles.cameraCard}>
              <View style={styles.cameraHeader}>
                <View style={styles.liveDot} />
                <Text style={styles.cameraHeaderText}>
                  {t("cameraReady")}
                </Text>
              </View>

              <View style={styles.cameraFrame}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  onCameraReady={() => setCameraReady(true)}
                />

                <View pointerEvents="none" style={styles.cameraOverlay}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={!cameraReady || loading}
                onPress={takePhoto}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (!cameraReady || loading) && styles.disabledButton,
                  pressed && cameraReady && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonEmoji}>📸</Text>
                <Text style={styles.primaryButtonText}>
                  {t("takePhoto")}
                </Text>
              </Pressable>

              <Text style={styles.helperText}>
                💡 {t("takePhotoDescription")}
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💛</Text>
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>
                  {language === "si"
                    ? "පුංචි ඉඟියක්!"
                    : "A Little Tip!"}
                </Text>
                <Text style={styles.tipDescription}>
                  {language === "si"
                    ? "හොඳ ආලෝකයක් ඇති තැනක ඡායාරූපය ගන්න."
                    : "Take your photo somewhere with good lighting."}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.resultIntro}>
              <Text style={styles.resultIntroEmoji}>
                {loading ? "🔍" : "🎉"}
              </Text>

              <Text style={styles.resultIntroTitle}>
                {loading
                  ? t("detectingObjects")
                  : t("objectsFound")}
              </Text>

              <Text style={styles.resultIntroDescription}>
                {loading
                  ? t("detectingDescription")
                  : t("subtitle")}
              </Text>
            </View>

            <View style={styles.resultPhotoCard}>
              <Image
                source={{ uri: photo }}
                style={styles.photo}
                accessibilityLabel={
                  language === "si"
                    ? "ගත් ඡායාරූපය"
                    : "Captured photo"
                }
              />

              {loading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator
                      size="large"
                      color="#7058D9"
                    />
                    <Text style={styles.loadingTitle}>
                      {t("detectingObjects")}
                    </Text>
                    <Text style={styles.loadingDescription}>
                      {t("detectingDescription")}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {!loading && (
              <>
                {objects.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyEmoji}>🧐</Text>
                    <Text style={styles.emptyTitle}>
                      {t("noObjectsFound")}
                    </Text>
                    <Text style={styles.emptyDescription}>
                      {t("noObjectsDescription")}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.objectsSection}>
                    <View style={styles.sectionHeadingRow}>
                      <Text style={styles.sectionHeading}>
                        {t("objectsFound")}
                      </Text>

                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>
                          {objects.reduce(
                            (total, item) => total + item.count,
                            0
                          )}
                        </Text>
                      </View>
                    </View>

                    {objects.map((item, index) => (
                      <View
                        key={item.name}
                        style={[
                          styles.objectCard,
                          index % 2 === 0
                            ? styles.objectCardPurple
                            : styles.objectCardYellow,
                        ]}
                      >
                        <View style={styles.objectIcon}>
                          <Text style={styles.objectEmoji}>
                            {getObjectEmoji(item.name)}
                          </Text>
                        </View>

                        <View style={styles.objectTextContainer}>
                          <Text style={styles.objectName}>
                            {getObjectLabel(item.name, language)}
                          </Text>

                          <Text style={styles.objectSubtitle}>
                            {language === "si"
                              ? "අපි මේක සොයාගත්තා!"
                              : "We found this!"}
                          </Text>
                        </View>

                        <View style={styles.objectCountBadge}>
                          <Text style={styles.objectCountText}>
                            ×{item.count}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  disabled={objects.length === 0}
                  onPress={speakResults}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    objects.length === 0 && styles.disabledButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.secondaryButtonEmoji}>🔊</Text>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.secondaryButtonText}>
                      {t("listenAgain")}
                    </Text>
                    <Text style={styles.secondaryButtonSubtext}>
                      {t("listenAgainDescription")}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={resetCamera}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.exploreAgainButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonEmoji}>🌟</Text>
                  <Text style={styles.primaryButtonText}>
                    {t("takeAnotherPhoto")}
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}

        <Text style={styles.footer}>
  {language === "si"
    ? "සෙල්ලමෙන් ඉගෙන ගනිමු!"
    : "Learning is an adventure!"}
</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function getObjectEmoji(name) {
  const icons = {
    chair: "🪑",
    table: "🪑",
    "dining table": "🍽️",
    cup: "☕",
    mug: "☕",
    couch: "🛋️",
    sofa: "🛋️",
    bed: "🛏️",
    bottle: "🍼",
    book: "📚",
    tv: "📺",
    laptop: "💻",
    person: "🧒",
  };

  return icons[name] || "✨";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9EE",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
  },

  permissionContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    gap: 18,
    marginBottom: 24,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  brandIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E8DEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  brandEmoji: {
    fontSize: 29,
  },

  brandTextContainer: {
    flex: 1,
  },

  brandName: {
    color: "#30265B",
    fontSize: 23,
    fontWeight: "900",
  },

  brandCaption: {
    color: "#817A98",
    fontSize: 13,
    marginTop: 3,
  },



  languageOption: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  activeLanguage: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },

  languageText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#77708D",
  },

  activeLanguageText: {
    color: "#5941AD",
  },

  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8DEFF",
    borderRadius: 26,
    padding: 22,
    marginBottom: 20,
    overflow: "hidden",
  },

  welcomeTextContainer: {
    flex: 1,
    gap: 8,
  },

  welcomeEyebrow: {
    fontSize: 12,
    color: "#6853A8",
    fontWeight: "800",
  },

  welcomeTitle: {
    fontSize: 24,
    lineHeight: 31,
    color: "#30265B",
    fontWeight: "900",
  },

  welcomeDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#665C85",
  },

  welcomeEmoji: {
    fontSize: 54,
    marginLeft: 8,
  },

  cameraCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 15,
    gap: 16,
    borderWidth: 1,
    borderColor: "#F0E9FA",
    elevation: 3,
    shadowColor: "#9C8BBE",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#59C98C",
  },

  cameraHeaderText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#51456F",
  },

  cameraFrame: {
    height: 360,
    width: "100%",
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: "#E8E5EF",
  },

  camera: {
    flex: 1,
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    margin: 18,
  },

  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },

  primaryButton: {
    minHeight: 62,
    backgroundColor: "#7058D9",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 11,
    elevation: 3,
    shadowColor: "#7058D9",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },

  primaryButtonEmoji: {
    fontSize: 24,
  },

  primaryButtonText: {
    fontSize: 17,
    lineHeight: 25,
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    flexShrink: 1,
  },

  buttonPressed: {
    opacity: 0.83,
    transform: [{ scale: 0.98 }],
  },

  disabledButton: {
    opacity: 0.45,
  },

  helperText: {
    textAlign: "center",
    color: "#8A829B",
    fontSize: 12,
    lineHeight: 19,
    paddingHorizontal: 4,
  },

  tipCard: {
    marginTop: 18,
    padding: 17,
    borderRadius: 22,
    backgroundColor: "#FFF0C8",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  tipEmoji: {
    fontSize: 30,
  },

  tipTextContainer: {
    flex: 1,
    gap: 4,
  },

  tipTitle: {
    color: "#765421",
    fontSize: 15,
    fontWeight: "900",
  },

  tipDescription: {
    color: "#866D47",
    fontSize: 13,
    lineHeight: 20,
  },

  title: {
    color: "#30265B",
    fontSize: 27,
    lineHeight: 36,
    textAlign: "center",
    fontWeight: "900",
    marginBottom: 14,
  },

  description: {
    color: "#77708D",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 30,
  },

  permissionIllustration: {
    width: 190,
    height: 190,
    borderRadius: 70,
    backgroundColor: "#E8DEFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "relative",
  },

  bigEmoji: {
    fontSize: 82,
  },

  sparkleOne: {
    position: "absolute",
    top: 15,
    right: 15,
    fontSize: 30,
  },

  sparkleTwo: {
    position: "absolute",
    bottom: 20,
    left: 12,
    fontSize: 25,
  },

  resultIntro: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 15,
    gap: 8,
  },

  resultIntroEmoji: {
    fontSize: 46,
  },

  resultIntroTitle: {
    color: "#30265B",
    fontSize: 25,
    lineHeight: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  resultIntroDescription: {
    color: "#817A98",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  resultPhotoCard: {
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    padding: 9,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#EFE8F7",
    overflow: "hidden",
  },

  photo: {
    width: "100%",
    height: 260,
    borderRadius: 18,
    resizeMode: "contain",
    backgroundColor: "#F2F0F7",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 249, 238, 0.91)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  loadingBubble: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },

  loadingTitle: {
    color: "#30265B",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  loadingDescription: {
    color: "#817A98",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },

  objectsSection: {
    gap: 12,
    marginBottom: 20,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  sectionHeading: {
    flex: 1,
    color: "#30265B",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "900",
  },

  countBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#DDF7E8",
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    color: "#267B50",
    fontSize: 16,
    fontWeight: "900",
  },

  objectCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 21,
    padding: 14,
    gap: 12,
  },

  objectCardPurple: {
    backgroundColor: "#EEE7FF",
  },

  objectCardYellow: {
    backgroundColor: "#FFF0C8",
  },

  objectIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },

  objectEmoji: {
    fontSize: 29,
  },

  objectTextContainer: {
    flex: 1,
    gap: 5,
  },

  objectName: {
    color: "#30265B",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "900",
  },

  objectSubtitle: {
    color: "#81758F",
    fontSize: 12,
    lineHeight: 18,
  },

  objectCountBadge: {
    minWidth: 43,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  objectCountText: {
    color: "#5A479B",
    fontSize: 16,
    fontWeight: "900",
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 24,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F0E9FA",
  },

  emptyEmoji: {
    fontSize: 54,
  },

  emptyTitle: {
    color: "#30265B",
    fontSize: 19,
    lineHeight: 27,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyDescription: {
    color: "#817A98",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },

  secondaryButton: {
    minHeight: 76,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#DDD3FA",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
    marginBottom: 13,
  },

  secondaryButtonEmoji: {
    fontSize: 30,
  },

  buttonTextContainer: {
    flex: 1,
    gap: 4,
  },

  secondaryButtonText: {
    color: "#5B46A8",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryButtonSubtext: {
    color: "#817A98",
    fontSize: 12,
    lineHeight: 18,
  },

  exploreAgainButton: {
    marginBottom: 8,
  },

  footer: {
    marginTop: 25,
    textAlign: "center",
    color: "#A198B4",
    fontSize: 13,
    fontWeight: "700",
  },
});
