
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, commonStyles } from '../../styles/commonStyles';
import Button from '../../components/Button';
import { useReels } from '../../state/reelsContext';
import { Video } from 'expo-av';

export default function UploadScreen() {
  const { addReel, user } = useReels();
  const [picked, setPicked] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [filter, setFilter] = useState<'none' | 'mono' | 'warm' | 'cool'>('none');
  const [aspect, setAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');

  const aspectStyle = useMemo(() => {
    // Simulate cropping by container aspect
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
        const uri = res.assets?.[0]?.uri;
        if (uri) {
          setPicked(uri);
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
      const mic = await ImagePicker.requestMicrophonePermissionsAsync();
      if (mic.status !== 'granted') {
        Alert.alert('Permission required', 'We need microphone permission to record.');
        return;
      }
      console.log('Launching camera (video mode)');
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 60,
        quality: ImagePicker.UIImagePickerControllerQualityType.High,
      });

      if (!res.canceled) {
        const uri = res.assets?.[0]?.uri;
        if (uri) {
          setPicked(uri);
        }
      }
    } catch (e) {
      console.log('Error recording video', e);
      Alert.alert('Error', 'Failed to record video.');
    }
  };

  const goLive = () => {
    // Placeholder for live streaming
    Alert.alert('Go Live', 'Live video is coming soon. Stay tuned for dance battles and showcases!');
  };

  const postReel = () => {
    if (!picked) {
      Alert.alert('No video', 'Please select or record a video first.');
      return;
    }
    if (!ensureLoggedIn()) return;

    console.log('Posting reel with uri:', picked, { overlayText, filter, aspect });
    addReel({
      userId: user?.id || 'guest',
      username: user?.username || 'guest',
      mediaUri: picked,
      soundName: 'Imported Sound',
      category: 'Challenges',
      thumb: picked,
      overlayText: overlayText.trim() || undefined,
      filter,
      aspect,
    });
    Alert.alert('Uploaded', 'Your reel has been added to the feed.');
    setPicked(null);
    setOverlayText('');
    setFilter('none');
    setAspect('9:16');
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Text style={styles.title}>Upload Reel</Text>
      <Text style={styles.subtitle}>Only video reels are allowed.</Text>

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
      </View>

      <View style={styles.buttons}>
        <Button text="Choose from Library" onPress={pickFromLibrary} />
        <Button text="Record Reel" onPress={recordVideo} style={{ backgroundColor: colors.primaryDark }} />
        <Button text="Go Live (Beta)" onPress={goLive} style={{ backgroundColor: colors.accent }} />
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
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
  buttons: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
});
