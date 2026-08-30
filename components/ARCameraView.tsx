// components/ARCameraView.tsx – with real background photo capture
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { BorderRadius, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import type { ARItem } from './ARLearning';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Touch {
    pageX: number;
    pageY: number;
}

function getDistance(t1: Touch, t2: Touch) {
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(t1: Touch, t2: Touch) {
    return Math.atan2(t2.pageY - t1.pageY, t2.pageX - t1.pageX);
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface ARCameraViewProps {
    item: ARItem;
    language: 'en' | 'si';
    onBack: () => void;
}

export default function ARCameraView({ item, language, onBack }: ARCameraViewProps) {
    const { colors } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [backgroundImageUri, setBackgroundImageUri] = useState<string | null>(null);
    const [isStaticMode, setIsStaticMode] = useState(false);

    const cameraRef = useRef<CameraView>(null);
    const viewShotRef = useRef<ViewShot>(null);

    const [transform, setTransform] = useState({
        x: SCREEN_W / 2 - 60,
        y: SCREEN_H / 2 - 120,
        scale: 1,
        rotation: 0,
    });

    const gestureRef = useRef({
        startX: 0,
        startY: 0,
        startScale: 1,
        startRotation: 0,
        startDistance: 0,
        startAngle: 0,
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const touches = evt.nativeEvent.touches;
                gestureRef.current.startX = transform.x;
                gestureRef.current.startY = transform.y;
                gestureRef.current.startScale = transform.scale;
                gestureRef.current.startRotation = transform.rotation;
                if (touches.length === 2) {
                    gestureRef.current.startDistance = getDistance(touches[0], touches[1]);
                    gestureRef.current.startAngle = getAngle(touches[0], touches[1]);
                }
            },
            onPanResponderMove: (evt, gesture) => {
                const touches = evt.nativeEvent.touches;
                if (touches.length === 2) {
                    const newDistance = getDistance(touches[0], touches[1]);
                    const newAngle = getAngle(touches[0], touches[1]);
                    const scaleRatio = newDistance / (gestureRef.current.startDistance || newDistance);
                    const rotationDelta = newAngle - gestureRef.current.startAngle;
                    setTransform((prev) => ({
                        ...prev,
                        scale: clamp(gestureRef.current.startScale * scaleRatio, 0.4, 3),
                        rotation: gestureRef.current.startRotation + rotationDelta,
                    }));
                } else {
                    setTransform((prev) => ({
                        ...prev,
                        x: gestureRef.current.startX + gesture.dx,
                        y: gestureRef.current.startY + gesture.dy,
                    }));
                }
            },
        })
    ).current;

    const adjustScale = (delta: number) =>
        setTransform((prev) => ({ ...prev, scale: clamp(prev.scale + delta, 0.4, 3) }));

    const adjustRotation = (deltaDeg: number) =>
        setTransform((prev) => ({ ...prev, rotation: prev.rotation + (deltaDeg * Math.PI) / 180 }));

    const resetPlacement = () =>
        setTransform({ x: SCREEN_W / 2 - 60, y: SCREEN_H / 2 - 120, scale: 1, rotation: 0 });

    // ─── Capture camera image (first step) ───────────────────────
    const captureCameraImage = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
                setBackgroundImageUri(photo.uri);
                setIsStaticMode(true);
            } catch (error) {
                console.error('Failed to capture camera image:', error);
            }
        }
    };

    // ─── Capture final composite (camera image + overlay) ────────
    const captureComposite = async () => {
        if (viewShotRef.current) {
            try {
                const uri = await viewShotRef.current.capture();
                setCapturedPhoto(uri);
                setIsPreviewVisible(true);
            } catch (error) {
                console.error('Failed to capture composite:', error);
            }
        }
    };

    // Button action: if not static, capture camera; else capture composite
    const handleCapturePress = () => {
        if (!isStaticMode) {
            captureCameraImage();
        } else {
            captureComposite();
        }
    };

    // Reset everything to live camera
    const resetToLiveCamera = () => {
        setBackgroundImageUri(null);
        setIsStaticMode(false);
        setCapturedPhoto(null);
        setIsPreviewVisible(false);
    };

    // Permission still loading
    if (!permission) {
        return <View style={[styles.container, { backgroundColor: colors.background }]} />;
    }

    // Permission denied / not yet granted
    if (!permission.granted) {
        return (
            <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
                <MaterialIcons name="camera-alt" size={64} color={colors.primary} />
                <Text style={[styles.permissionTitle, { color: colors.text }]}>
                    {language === 'en' ? 'Camera access needed' : 'කැමරා අවසරය අවශ්‍යයි'}
                </Text>
                <Text style={[styles.permissionText, { color: colors.textLight }]}>
                    {language === 'en'
                        ? 'Allow camera access to place items in the real world.'
                        : 'සැබෑ ලෝකයේ අයිතම තැබීමට කැමරා අවසරය ලබා දෙන්න.'}
                </Text>
                <TouchableOpacity
                    style={[styles.permissionButton, { backgroundColor: colors.primary }]}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>
                        {language === 'en' ? 'Allow Camera' : 'කැමරාවට අවසර දෙන්න'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onBack} style={{ marginTop: Spacing.lg }}>
                    <Text style={{ color: colors.primary }}>{language === 'en' ? 'Go Back' : 'ආපසු යන්න'}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Capture-able view: live camera OR static image + overlay */}
            <ViewShot
                ref={viewShotRef}
                options={{ format: 'jpg', quality: 0.9 }}
                style={StyleSheet.absoluteFill}
            >
                {/* Background: either live camera or captured image */}
                {isStaticMode && backgroundImageUri ? (
                    <Image
                        source={{ uri: backgroundImageUri }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                    />
                ) : (
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing={facing}
                    />
                )}

                {/* Draggable / pinchable overlay item */}
                <View
                    {...panResponder.panHandlers}
                    style={[
                        styles.itemWrapper,
                        {
                            left: transform.x,
                            top: transform.y,
                            transform: [{ scale: transform.scale }, { rotate: `${transform.rotation}rad` }],
                        },
                    ]}
                >
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>
            </ViewShot>

            {/* Top bar */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.circleButton} onPress={onBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.itemLabel}>
                    <Text style={styles.itemLabelText}>
                        {item.emoji} {language === 'en' ? item.nameEn : item.nameSi}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
                    disabled={isStaticMode}
                >
                    <MaterialIcons name="flip-camera-ios" size={22} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Hint */}
            <View style={styles.hintContainer}>
                <Text style={styles.hintText}>
                    {language === 'en'
                        ? 'Drag to move · Pinch with two fingers to resize & rotate'
                        : 'ගෙනයාමට අදින්න · ප්‍රමාණය වෙනස් කිරීමට ඇඟිලි දෙකින් අදින්න'}
                </Text>
            </View>

            {/* Bottom controls */}
            <View style={[styles.bottomBar, { backgroundColor: colors.surface + 'F0' }]}>
                <TouchableOpacity style={styles.controlButton} onPress={() => adjustScale(-0.15)}>
                    <MaterialIcons name="remove" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => adjustRotation(-15)}>
                    <MaterialIcons name="rotate-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlButton, styles.resetButton, { backgroundColor: colors.primary }]}
                    onPress={resetPlacement}
                >
                    <MaterialIcons name="center-focus-strong" size={22} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => adjustRotation(15)}>
                    <MaterialIcons name="rotate-right" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => adjustScale(0.15)}>
                    <MaterialIcons name="add" size={22} color={colors.text} />
                </TouchableOpacity>

                {/* Capture button: camera first, composite second */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.captureButton, { backgroundColor: '#FFF' }]}
                    onPress={handleCapturePress}
                >
                    <MaterialIcons
                        name={isStaticMode ? 'check' : 'photo-camera'}
                        size={26}
                        color="#000"
                    />
                </TouchableOpacity>
            </View>

            {/* Preview Modal */}
            <Modal
                visible={isPreviewVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsPreviewVisible(false)}
            >
                <View style={styles.previewOverlay}>
                    <View style={styles.previewCard}>
                        <Text style={[styles.previewTitle, { color: colors.text }]}>
                            {language === 'en' ? 'Your Photo' : 'ඔබේ ඡායාරූපය'}
                        </Text>
                        {capturedPhoto && (
                            <Image
                                source={{ uri: capturedPhoto }}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                        )}
                        <View style={styles.previewButtons}>
                            <TouchableOpacity
                                style={[styles.previewButton, { backgroundColor: colors.primary }]}
                                onPress={() => setIsPreviewVisible(false)}
                            >
                                <MaterialIcons name="refresh" size={20} color="#FFF" />
                                <Text style={styles.previewButtonText}>
                                    {language === 'en' ? 'Retake' : 'නැවත ගන්න'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.previewButton, { backgroundColor: colors.success }]}
                                onPress={() => {
                                    setIsPreviewVisible(false);
                                    setCapturedPhoto(null);
                                    resetToLiveCamera();
                                    onBack();
                                }}
                            >
                                <MaterialIcons name="check" size={20} color="#FFF" />
                                <Text style={styles.previewButtonText}>
                                    {language === 'en' ? 'Done' : 'අවසන්'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    itemWrapper: {
        position: 'absolute',
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemEmoji: { fontSize: 90, textAlign: 'center' },
    topBar: {
        position: 'absolute', top: Spacing.xl, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
    },
    circleButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center', alignItems: 'center',
    },
    itemLabel: {
        backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
    },
    itemLabelText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    hintContainer: { position: 'absolute', top: Spacing.xl + 60, left: 0, right: 0, alignItems: 'center' },
    hintText: {
        color: '#FFF', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.md, overflow: 'hidden',
    },
    bottomBar: {
        position: 'absolute', bottom: Spacing.xl, left: Spacing.lg, right: Spacing.lg,
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg,
    },
    controlButton: {
        width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center',
    },
    resetButton: { width: 52, height: 52, borderRadius: 26 },
    captureButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#000',
    },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    permissionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: Spacing.lg, textAlign: 'center' },
    permissionText: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg },
    permissionButton: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
    permissionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

    // Preview modal styles
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    previewCard: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    previewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: Spacing.md,
    },
    previewImage: {
        width: '100%',
        height: SCREEN_H * 0.5,
        borderRadius: BorderRadius.md,
    },
    previewButtons: {
        flexDirection: 'row',
        marginTop: Spacing.lg,
        gap: Spacing.md,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    previewButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});