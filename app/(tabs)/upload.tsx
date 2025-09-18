
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, commonStyles } from '../../styles/commonStyles';
import Button from '../../components/Button';
import { useReels } from '../../state/reelsContext';
import { Audio, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen() {
  const { addReel, user } = useReels();
  const params = useLocalSearchParams();
  const preSong = typeof params.song === 'string' ? params.song : undefined;

  const [picked, setPicked] = useState<string | null>(null);
  const [pickedDuration, setPickedDuration] = useState<number | null>(null); // seconds
  const [overlayText, setOverlayText] = useState('');
  const [filter, setFilter] = useState<'none' | 'mono' | 'warm' | 'cool'>('none');
  const [aspect, setAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');

  const MAX_DURATION = 90; // seconds

  const aspectStyle = useMemo(() => {
    switch (aspect) {
      case '1:1':
        return { aspectRatio: 1 };
      case '16:9':
        return { aspectRatio: 16 / 9 };
      default:
        return { aspectRatio: 9 / 16 };
    }
  }, [aspect]);

  const ensureLoggedIn = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to upload reels.');
      return false;
    }
    return true;
  };

  const onPicked = (uri: string, duration?: number | null) => {
    if (duration && duration > MAX_DURATION) {
      Alert.alert('Video too long', 'Reels must be 1:30 or shorter. Please trim your video.');
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
        Alert.alert('Permission required', 'We need access to your media library to upload.');
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
    Alert.alert('Go Live', 'Live video is coming soon. Stay tuned for dance battles and showcases!');
  };

  const postReel = () => {
    if (!picked) {
      Alert.alert('No video', 'Please select or record a video first.');
      return;
    }
    if (!ensureLoggedIn()) return;

    console.log('Posting reel with uri:', picked, { overlayText, filter, aspect, pickedDuration });
    addReel({
      userId: user?.id || 'guest',
      username: user?.username || 'guest',
      mediaUri: picked,
      soundName: preSong || 'Imported Sound',
      category: 'Challenges',
      thumb: picked,
      overlayText: overlayText.trim() || undefined,
      filter,
      aspect,
    });
    Alert.alert('Uploaded', 'Your reel has been added to the feed.');
    setPicked(null);
    setPickedDuration(null);
    setOverlayText('');
    setFilter('none');
    setAspect('9:16');
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Upload</Text>
        {preSong ? <Text style={styles.usingSong}>Using song: {preSong}</Text> : null}
      </View>
      <Text style={styles.subtitle}>Reels must be 1:30 or shorter.</Text>

      <View style={[styles.previewWrap, aspectStyle]}>
        {picked ? (
          <>
            <Video source={{ uri: picked }} style={styles.previewMedia} shouldPlay={false} isMuted resizeMode="cover" />
            {!!overlayText && (
              <View style={styles.overlayTextWrap}>
                <Text style={styles.overlayText}>{overlayText}</Text>
              </View>
            )}
            {filter === 'mono' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />}
            {filter === 'warm' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(255,165,0,0.15)' }]} />}
            {filter === 'cool' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(0,128,255,0.15)' }]} />}
          </>
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewText}>No video selected</Text>
          </View>
        )}

        {/* Floating bubbles like IG */}
        <View style={styles.fabRow}>
          <Pressable onPress={pickFromLibrary} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}>
            <Ionicons name="film" size={22} color="#fff" />
            <Text style={styles.fabLabel}>Upload</Text>
          </Pressable>
          <Pressable onPress={goLive} style={({ pressed }) => [styles.fab, { backgroundColor: '#e91e63' }, pressed && { opacity: 0.9 }]}>
            <Ionicons name="radio" size={22} color="#fff" />
            <Text style={styles.fabLabel}>Go Live</Text>
          </Pressable>
          <Pressable onPress={recordVideo} style={({ pressed }) => [styles.fab, { backgroundColor: colors.primaryDark }, pressed && { opacity: 0.9 }]}>
            <Ionicons name="camera" size={22} color="#fff" />
            <Text style={styles.fabLabel}>Record</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.editCard}>
        <Text style={styles.label}>Overlay Text</Text>
        <TextInput
          value={overlayText}
          onChangeText={setOverlayText}
          placeholder="Add a caption overlay..."
          placeholderTextColor={colors.grey}
          style={styles.input}
        />
        <Text style={styles.label}>Filter</Text>
        <View style={styles.row}>
          {(['none', 'mono', 'warm', 'cool'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, filter === f && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Aspect</Text>
        <View style={styles.row}>
          {(['9:16', '1:1', '16:9'] as const).map((a) => (
            <Pressable
              key={a}
              onPress={() => setAspect(a)}
              style={[styles.chip, aspect === a && styles.chipActive]}
            >
              <Text style={[styles.chipText, aspect === a && styles.chipTextActive]}>{a}</Text>
            </Pressable>
          ))}
        </View>

        <Button text="Post Reel" onPress={postReel} style={{ backgroundColor: colors.primary }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  usingSong: {
    color: colors.primary,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.grey,
    marginBottom: 12,
  },
  previewWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
    elevation: 2,
    marginBottom: 12,
    position: 'relative',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  previewPlaceholder: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    color: colors.grey,
  },
  overlayTextWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 8,
  },
  overlayText: {
    color: '#fff',
    fontWeight: '800',
  },
  editCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    padding: 12,
    boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    marginBottom: 10,
  },
  label: {
    color: colors.text,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.card,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  fabRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  },
  fabLabel: {
    color: '#fff',
    fontWeight: '800',
  },
});