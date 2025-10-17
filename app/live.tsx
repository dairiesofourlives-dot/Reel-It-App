
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Dimensions, TextInput } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { colors } from '../styles/commonStyles';
import { useReels } from '../state/reelsContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function GoLiveScreen() {
  const { user } = useReels();
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, setMicPermission] = useState<any>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [liveTitle, setLiveTitle] = useState('');
  const [showTitleInput, setShowTitleInput] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestMicPermission();
  }, []);

  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setMicPermission({ granted: status === 'granted' });
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startLive = () => {
    if (!liveTitle.trim()) {
      Alert.alert('Title Required', 'Please add a title for your live stream.');
      return;
    }
    console.log('Starting live stream:', liveTitle);
    setIsLive(true);
    setShowTitleInput(false);
    // Simulate viewer count increasing
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  };

  const endLive = () => {
    Alert.alert(
      'End Live Stream?',
      'Are you sure you want to end your live stream?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Stream',
          style: 'destructive',
          onPress: () => {
            console.log('Ending live stream');
            setIsLive(false);
            setViewerCount(0);
            Alert.alert(
              'Live Ended',
              'Your live stream has ended. Live videos are not saved.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={64} color={colors.primary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need your permission to access the camera for live streaming.
          </Text>
          <Pressable onPress={requestCameraPermission} style={styles.permissionButton}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.permissionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!micPermission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Ionicons name="mic-outline" size={64} color={colors.primary} />
          <Text style={styles.permissionTitle}>Microphone Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need your permission to access the microphone for live streaming.
          </Text>
          <Pressable onPress={requestMicPermission} style={styles.permissionButton}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.permissionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
        mode="video"
      >
        {/* Top Bar */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topBar}
        >
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>

          {isLive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
              <View style={styles.viewerBadge}>
                <Ionicons name="eye" size={14} color="#fff" />
                <Text style={styles.viewerCount}>{viewerCount}</Text>
              </View>
            </View>
          )}

          {!isLive && (
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>Ready to go live</Text>
            </View>
          )}
        </LinearGradient>

        {/* Title Input (before going live) */}
        {showTitleInput && !isLive && (
          <View style={styles.titleInputContainer}>
            <Text style={styles.titleInputLabel}>What&apos;s your stream about?</Text>
            <TextInput
              value={liveTitle}
              onChangeText={setLiveTitle}
              placeholder="e.g., Pantsula Dance Challenge"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.titleInput}
              maxLength={50}
            />
            <Text style={styles.titleCharCount}>{liveTitle.length}/50</Text>
          </View>
        )}

        {/* Live Title Display (during live) */}
        {isLive && liveTitle && (
          <View style={styles.liveTitleDisplay}>
            <Text style={styles.liveTitleText}>{liveTitle}</Text>
          </View>
        )}

        {/* Bottom Controls */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.bottomBar}
        >
          {!isLive ? (
            <View style={styles.previewControls}>
              <Pressable onPress={toggleCameraFacing} style={styles.controlButton}>
                <View style={styles.controlButtonInner}>
                  <Ionicons name="camera-reverse" size={28} color="#fff" />
                </View>
                <Text style={styles.controlLabel}>Flip</Text>
              </Pressable>

              <Pressable onPress={startLive} style={styles.goLiveButton}>
                <LinearGradient
                  colors={['#E91E63', '#C2185B']}
                  style={styles.goLiveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="radio" size={32} color="#fff" />
                  <Text style={styles.goLiveText}>Go Live</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.controlButton}>
                <View style={[styles.controlButtonInner, { opacity: 0.5 }]}>
                  <Ionicons name="sparkles" size={28} color="#fff" />
                </View>
                <Text style={styles.controlLabel}>Effects</Text>
              </View>
            </View>
          ) : (
            <View style={styles.liveControls}>
              <Pressable onPress={toggleCameraFacing} style={styles.liveControlButton}>
                <View style={styles.liveControlButtonInner}>
                  <Ionicons name="camera-reverse" size={24} color="#fff" />
                </View>
              </Pressable>

              <Pressable onPress={endLive} style={styles.endLiveButton}>
                <LinearGradient
                  colors={['#E91E63', '#C2185B']}
                  style={styles.endLiveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="stop" size={24} color="#fff" />
                  <Text style={styles.endLiveText}>End Live</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.liveControlButton}>
                <View style={[styles.liveControlButtonInner, { opacity: 0.5 }]}>
                  <Ionicons name="chatbubble" size={24} color="#fff" />
                </View>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Info Banner */}
        {!isLive && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={18} color="#fff" />
            <Text style={styles.infoBannerText}>
              Live videos are not saved after streaming
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  message: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
  },
  permissionCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  permissionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  backLink: {
    paddingVertical: 12,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233,30,99,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewerCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  titleBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  titleBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  titleInputContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 20,
  },
  titleInputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  titleCharCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  liveTitleDisplay: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 16,
  },
  liveTitleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  goLiveButton: {
    borderRadius: 35,
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(233,30,99,0.4)',
    elevation: 8,
  },
  goLiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  goLiveText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveControlButton: {
    alignItems: 'center',
  },
  liveControlButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  endLiveButton: {
    borderRadius: 30,
    overflow: 'hidden',
    boxShadow: '0 6px 16px rgba(233,30,99,0.4)',
    elevation: 6,
  },
  endLiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  endLiveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  infoBanner: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
