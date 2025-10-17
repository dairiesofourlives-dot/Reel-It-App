
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useReels } from '../../state/reelsContext';
import { Audio, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const PREVIEW_HEIGHT = width * 1.5; // 9:16 aspect ratio

export default function UploadScreen() {
  const { addReel, user } = useReels();
  const router = useRouter();
  const params = useLocalSearchParams();
  const preSong = typeof params.song === 'string' ? params.song : undefined;

  const [picked, setPicked] = useState<string | null>(null);
  const [pickedDuration, setPickedDuration] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [filter, setFilter] = useState<'none' | 'mono' | 'warm' | 'cool'>('none');

  const MAX_DURATION = 90; // 1 minute 30 seconds

  const ensureLoggedIn = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to upload reels.');
      return false;
    }
    return true;
  };

  const onPicked = (uri: string, duration?: number | null) => {
    if (duration && duration > MAX_DURATION) {
      Alert.alert(
        'Video too long',
        `Reels must be 1 minute 30 seconds or shorter. Your video is ${Math.round(duration)}s long. Please trim it and try again.`
      );
      setPicked(null);
      setPickedDuration(null);
      return;
    }
    setPicked(uri);
    setPickedDuration(duration || null);
  };

  const pickFromLibrary = async () => {
    if (!ensureLoggedIn()) return;
    try {
      console.log('Requesting media library permissions');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your media library to upload reels.');
        return;
      }
      console.log('Launching picker (videos only)');
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        quality: 0.8,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
      });

      if (!res.canceled) {
        const asset = res.assets?.[0];
        if (asset?.uri) {
          onPicked(asset.uri, (asset as any).duration ?? undefined);
        }
      }
    } catch (e) {
      console.log('Error picking media', e);
      Alert.alert('Error', 'Failed to pick video.');
    }
  };

  const recordVideo = async () => {
    if (!ensureLoggedIn()) return;
    try {
      console.log('Requesting camera permissions');
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      if (cam.status !== 'granted') {
        Alert.alert('Permission required', 'We need camera permission to record.');
        return;
      }
      console.log('Requesting microphone permissions');
      const mic = await Audio.requestPermissionsAsync();
      if (mic.status !== 'granted') {
        Alert.alert('Permission required', 'We need microphone permission to record.');
        return;
      }
      console.log('Launching camera (video mode)');
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: MAX_DURATION,
        quality: ImagePicker.UIImagePickerControllerQualityType.High,
      });

      if (!res.canceled) {
        const asset = res.assets?.[0];
        if (asset?.uri) {
          onPicked(asset.uri, (asset as any).duration ?? undefined);
        }
      }
    } catch (e) {
      console.log('Error recording video', e);
      Alert.alert('Error', 'Failed to record video.');
    }
  };

  const goLive = () => {
    if (!ensureLoggedIn()) return;
    console.log('Navigating to Go Live screen');
    router.push('/live');
  };

  const postReel = () => {
    if (!picked) {
      Alert.alert('No video', 'Please select or record a video first.');
      return;
    }
    if (!ensureLoggedIn()) return;

    console.log('Posting reel with uri:', picked, { caption, filter, pickedDuration });
    addReel({
      userId: user?.id || 'guest',
      username: user?.username || 'guest',
      mediaUri: picked,
      soundName: preSong || 'Original Sound',
      category: 'Challenges',
      thumb: picked,
      overlayText: caption.trim() || undefined,
      filter,
      aspect: '9:16',
    });
    Alert.alert('Success! 🎉', 'Your reel has been posted to the feed.');
    setPicked(null);
    setPickedDuration(null);
    setCaption('');
    setFilter('none');
  };

  const clearVideo = () => {
    setPicked(null);
    setPickedDuration(null);
    setCaption('');
    setFilter('none');
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Reel</Text>
          <Text style={styles.headerSubtitle}>Share your dance moves with the world</Text>
        </View>

        {/* Video Preview or Upload Options */}
        {!picked ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadCard}>
              <Ionicons name="videocam-outline" size={64} color={colors.grey} />
              <Text style={styles.uploadTitle}>Upload a Dance Reel</Text>
              <Text style={styles.uploadSubtitle}>Maximum duration: 1 minute 30 seconds</Text>
              
              {/* Upload Options */}
              <View style={styles.optionsContainer}>
                <Pressable 
                  onPress={pickFromLibrary}
                  style={({ pressed }) => [
                    styles.optionButton,
                    pressed && styles.optionButtonPressed
                  ]}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.optionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="images" size={28} color="#fff" />
                    <Text style={styles.optionText}>Choose from Library</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable 
                  onPress={recordVideo}
                  style={({ pressed }) => [
                    styles.optionButton,
                    pressed && styles.optionButtonPressed
                  ]}
                >
                  <LinearGradient
                    colors={[colors.accent, '#00A843']}
                    style={styles.optionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="camera" size={28} color="#fff" />
                    <Text style={styles.optionText}>Record Video</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable 
                  onPress={goLive}
                  style={({ pressed }) => [
                    styles.optionButton,
                    pressed && styles.optionButtonPressed
                  ]}
                >
                  <LinearGradient
                    colors={['#E91E63', '#C2185B']}
                    style={styles.optionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="radio" size={28} color="#fff" />
                    <Text style={styles.optionText}>Go Live</Text>
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.editSection}>
            {/* Video Preview */}
            <View style={styles.previewContainer}>
              <Video 
                source={{ uri: picked }} 
                style={styles.videoPreview}
                shouldPlay={false}
                isMuted
                resizeMode="cover"
                isLooping
              />
              {filter === 'mono' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />}
              {filter === 'warm' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(255,165,0,0.15)' }]} />}
              {filter === 'cool' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(0,128,255,0.15)' }]} />}
              
              {/* Duration Badge */}
              {pickedDuration && (
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={14} color="#fff" />
                  <Text style={styles.durationText}>{Math.round(pickedDuration)}s</Text>
                </View>
              )}

              {/* Clear Button */}
              <Pressable onPress={clearVideo} style={styles.clearButton}>
                <Ionicons name="close-circle" size={32} color="#fff" />
              </Pressable>
            </View>

            {/* Caption Input */}
            <View style={styles.captionContainer}>
              <Text style={styles.sectionLabel}>Caption</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption to your reel..."
                placeholderTextColor={colors.grey}
                style={styles.captionInput}
                multiline
                maxLength={150}
              />
              <Text style={styles.charCount}>{caption.length}/150</Text>
            </View>

            {/* Filter Selection */}
            <View style={styles.filterContainer}>
              <Text style={styles.sectionLabel}>Filter</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {(['none', 'mono', 'warm', 'cool'] as const).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[
                      styles.filterChip,
                      filter === f && styles.filterChipActive
                    ]}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filter === f && styles.filterChipTextActive
                    ]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Post Button */}
            <Pressable onPress={postReel} style={styles.postButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.postGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.postButtonText}>Post Reel</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.grey,
    fontWeight: '500',
  },
  uploadSection: {
    paddingHorizontal: 20,
  },
  uploadCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.divider,
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  optionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  optionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  editSection: {
    paddingHorizontal: 20,
  },
  previewContainer: {
    width: '100%',
    height: PREVIEW_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
    marginBottom: 20,
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    elevation: 6,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  durationBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  clearButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  captionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  captionInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'right',
    marginTop: 6,
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterScroll: {
    gap: 10,
  },
  filterChip: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  postButton: {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 6px 16px rgba(13,110,253,0.3)',
    elevation: 6,
  },
  postGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
