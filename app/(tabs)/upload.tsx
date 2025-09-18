
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, commonStyles } from '../../styles/commonStyles';
import Button from '../../components/Button';
import { useReels } from '../../state/reelsContext';

export default function UploadScreen() {
  const { addReel } = useReels();
  const [picked, setPicked] = useState<string | null>(null);

  const pickMedia = async () => {
    try {
      console.log('Requesting media library permissions');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your media library to upload.');
        return;
      }
      console.log('Launching image picker');
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: false,
        quality: 0.8,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!res.canceled) {
        const uri = res.assets?.[0]?.uri;
        console.log('Picked asset uri:', uri);
        if (uri) {
          setPicked(uri);
        }
      }
    } catch (e) {
      console.log('Error picking media', e);
      Alert.alert('Error', 'Failed to pick media.');
    }
  };

  const postReel = () => {
    if (!picked) {
      Alert.alert('No media', 'Please select a video or image first.');
      return;
    }
    console.log('Posting reel with uri:', picked);
    addReel({
      userId: 'local_user',
      username: 'you',
      mediaUri: picked,
      soundName: 'Imported Sound',
      category: 'Challenges',
      thumb: picked,
    });
    Alert.alert('Uploaded', 'Your reel has been added to the feed.');
    setPicked(null);
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Text style={styles.title}>Upload Reel</Text>
      <Text style={styles.subtitle}>Pick a video or image from your library.</Text>

      {picked ? (
        <Image source={{ uri: picked }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.previewPlaceholder}>
          <Text style={styles.previewText}>No media selected</Text>
        </View>
      )}

      <View style={styles.buttons}>
        <Button text="Choose from Library" onPress={pickMedia} />
        <Button
          text="Post Reel"
          onPress={postReel}
          style={{ backgroundColor: colors.accent }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
    alignItems: 'center',
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
  preview: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewPlaceholder: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
    elevation: 2,
    marginBottom: 16,
  },
  previewText: {
    color: colors.grey,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
});
