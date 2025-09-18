
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Alert, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useReels } from '../../state/reelsContext';
import Button from '../../components/Button';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function EditProfileScreen() {
  const { user, updateProfile } = useReels();
  const router = useRouter();

  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState<string | undefined>(typeof user?.avatar === 'string' ? user?.avatar : undefined);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load fresh bio in case it wasn't in context
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.log('load profile error', error);
        return;
      }
      if (data) {
        setUsername(data.username || username);
        setAvatar(data.avatar_url || undefined);
        setBio(data.bio || '');
      }
    };
    load();
  }, [user]);

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your media library to set your profile picture.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setAvatar(res.assets[0].uri);
      }
    } catch (e) {
      console.log('Error picking avatar', e);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const save = async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to edit your profile.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Username required', 'Please enter a username.');
      return;
    }
    if (bio.length > 350) {
      Alert.alert('Bio too long', 'Bio must be 350 characters or less.');
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          bio: bio.trim(),
          // avatar upload omitted here; in a real app you would upload to storage and save URL
          // avatar_url: avatar
        })
        .eq('user_id', user.id);
      if (error) {
        Alert.alert('Save failed', error.message);
        setSaving(false);
        return;
      }
      updateProfile({ username: username.trim(), bio: bio.trim(), avatar });
      Alert.alert('Saved', 'Profile updated.');
      router.back();
    } catch (e: any) {
      console.log('save error', e);
      Alert.alert('Error', e?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <Pressable onPress={pickAvatar} style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.8 }]}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{(user?.username || 'U').slice(0, 2).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.changePhoto}>Change photo</Text>
      </Pressable>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="your_username"
          placeholderTextColor={colors.grey}
          style={styles.input}
          autoCapitalize="none"
          maxLength={20}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about your dance style…"
          placeholderTextColor={colors.grey}
          style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
          multiline
          maxLength={350}
        />
        <Text style={styles.counter}>{bio.length}/350</Text>

        <Button text={saving ? 'Saving…' : 'Save'} onPress={save} />
      </View>
    </View>
  );
}

const AVATAR_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    marginBottom: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  backTxt: {
    color: colors.text,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },
  changePhoto: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  form: {
    gap: 8,
    marginTop: 8,
  },
  label: {
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
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
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    elevation: 1,
  },
  counter: {
    alignSelf: 'flex-end',
    color: colors.grey,
    marginTop: -4,
    marginBottom: 6,
  },
});
