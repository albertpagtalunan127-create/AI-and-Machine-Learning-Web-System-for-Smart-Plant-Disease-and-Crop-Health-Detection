import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { predictImage } from '../services/ai';

const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.72;

export default function ScanScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ className: string; probability: number } | null>(null);
  const cameraRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const cornerLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Request camera permission + start corner animation
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    const cornerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(cornerAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    cornerLoopRef.current = cornerLoop;
    cornerLoop.start();

    return () => {
      cornerLoop.stop();
    };
  }, []);

  // Pulse animation tied to isAnalyzing state
  useEffect(() => {
    if (isAnalyzing) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current = loop;
      loop.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
      pulseAnim.setValue(1);
    }
  }, [isAnalyzing]);

  async function handleCapture() {
    if (!cameraRef.current) return;
    setResult(null);
    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      const res = await predictImage(photo.base64);
      setResult(res);
    } catch {
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const cornerOpacity = cornerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  // ─── Permission: loading ───────────────────────────────────────────────────
  if (hasPermission === null) {
    return (
      <LinearGradient colors={['#0d1b2a', '#1a2e47']} style={styles.centered}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.permText}>Requesting camera access…</Text>
      </LinearGradient>
    );
  }

  // ─── Permission: denied ────────────────────────────────────────────────────
  if (hasPermission === false) {
    return (
      <LinearGradient colors={['#0d1b2a', '#1a2e47']} style={styles.centered}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permText}>
          Please enable camera access in your device Settings to use the plant scanner.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.permBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ─── Main scanner ──────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen camera */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} />

      {/* Gradient overlays sit above the camera */}
      <LinearGradient
        colors={['rgba(0,0,0,0.72)', 'transparent']}
        style={styles.topOverlay}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        style={styles.bottomOverlay}
        pointerEvents="none"
      />

      {/* Safe area content */}
      <SafeAreaView style={styles.safeContent} edges={['top', 'bottom']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Plant Scanner</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* Spacer to balance the back button */}
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Scan viewfinder ── */}
        <View style={styles.scanArea}>
          <Animated.View style={[styles.scanBox, { opacity: cornerOpacity }]}>
            {/* Corner brackets */}
            <View style={[styles.corner, { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[styles.corner, { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 }]} />
            <View style={[styles.corner, { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[styles.corner, { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 }]} />

            {/* Analyzing overlay inside the box */}
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <ActivityIndicator size="large" color="#22c55e" />
                </Animated.View>
                <Text style={styles.analyzingText}>Analyzing…</Text>
              </View>
            )}
          </Animated.View>

          {!isAnalyzing && !result && (
            <Text style={styles.hint}>🌿  Align your plant leaf inside the frame</Text>
          )}
        </View>

        {/* ── Result card ── */}
        {result && (
          <View style={styles.resultCard}>
            <LinearGradient
              colors={['rgba(10,40,28,0.97)', 'rgba(13,27,42,0.97)']}
              style={styles.resultGrad}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Detection Result</Text>
                <TouchableOpacity onPress={() => setResult(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.resultClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.resultBody}>
                <Text style={styles.resultIcon}>
                  {result.probability > 0.5 ? '⚠️' : '✅'}
                </Text>
                <View style={styles.resultTextCol}>
                  <Text style={styles.resultDisease}>{result.className}</Text>
                  <Text style={styles.resultConf}>
                    Confidence: {Math.round(result.probability * 100)}%
                  </Text>
                </View>
              </View>

              {/* Confidence bar — use flex instead of % width */}
              <View style={styles.confBarBg}>
                <View
                  style={[
                    styles.confBarFill,
                    { flex: result.probability },
                  ]}
                />
                <View style={{ flex: 1 - result.probability }} />
              </View>

              <TouchableOpacity style={styles.treatmentBtn} activeOpacity={0.8}>
                <Text style={styles.treatmentBtnText}>💊  View Treatment Plan</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* ── Bottom controls ── */}
        {!result && (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.sideBtn} activeOpacity={0.75}>
              <Text style={styles.sideBtnText}>🖼️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureOuter}
              onPress={handleCapture}
              disabled={isAnalyzing}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isAnalyzing ? ['#475569', '#475569'] : ['#22c55e', '#16a34a']}
                style={styles.captureBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.captureBtnText}>📷</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideBtn} activeOpacity={0.75}>
              <Text style={styles.sideBtnText}>⚡</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Permission screens ────────────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permIcon: { fontSize: 56, marginBottom: 16 },
  permTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  permText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  permBtn: {
    marginTop: 28,
    backgroundColor: 'rgba(34,197,94,0.18)',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  permBtnText: { color: '#4ade80', fontWeight: '700', fontSize: 15 },

  // ── Main layout ───────────────────────────────────────────────────────────
  root: { flex: 1, backgroundColor: '#000' },

  // Overlays — pointerEvents="none" so they don't block touches
  topOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 180,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 300,
  },

  safeContent: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 44 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.28)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 5,
  },
  liveText: { color: '#fca5a5', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // ── Scan viewfinder ───────────────────────────────────────────────────────
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#22c55e',
    borderRadius: 3,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  analyzingText: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 12,
  },
  hint: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // ── Result card ───────────────────────────────────────────────────────────
  resultCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.28)',
  },
  resultGrad: { padding: 18 },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resultClose: { color: '#64748b', fontSize: 20, fontWeight: '700' },
  resultBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultIcon: { fontSize: 32, marginRight: 14 },
  resultTextCol: { flex: 1 },
  resultDisease: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultConf: { color: '#94a3b8', fontSize: 13, marginTop: 3 },
  // Confidence bar — uses flex ratio instead of % string (RN-safe)
  confBarBg: {
    flexDirection: 'row',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  confBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  treatmentBtn: {
    backgroundColor: 'rgba(34,197,94,0.18)',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  treatmentBtnText: { color: '#4ade80', fontWeight: '700', fontSize: 14 },

  // ── Bottom controls ───────────────────────────────────────────────────────
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 30,
    paddingTop: 8,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  sideBtnText: { fontSize: 22 },
  captureOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  captureBtnText: { fontSize: 28 },
});
