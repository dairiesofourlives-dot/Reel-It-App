
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import Button from '../../components/Button';
import { useReels } from '../../state/reelsContext';
import SimpleBottomSheet from '../../components/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useReels();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  console.log('ProfileScreen render user:', user?.username);

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const handleEdit = () => router.push('/profile/edit');

  const avatarUri = typeof user?.avatar === 'string' ? user?.avatar : undefined;

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Text style={styles.title}>Your Profile</Text>
      {user ? (
        <>
          <View style={styles.userRow}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{user.username.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.meta}>Tap settings to manage account</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Button text="Edit Profile" onPress={handleEdit} />
            <Button
              text="Settings"
              onPress={openSettings}
              style={{ backgroundColor: colors.backgroundAlt }}
              textStyle={{ color: colors.text }}
            />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>You are not signed in.</Text>
          <View style={styles.actions}>
            <Button text="Sign In / Sign Up" onPress={() => router.push('/auth')} />
            <Button
              text="Settings"
              onPress={openSettings}
              style={{ backgroundColor: colors.backgroundAlt }}
              textStyle={{ color: colors.text }}
            />
          </View>
        </>
      )}

      <SimpleBottomSheet isVisible={settingsOpen} onClose={closeSettings}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>Settings</Text>
          </View>
        </View>
        <View style={styles.sheetList}>
          <SettingsItem icon="person-circle" label="Manage account" onPress={() => Alert.alert('Manage account')} />
          <SettingsItem icon="lock-closed" label="Privacy" onPress={() => Alert.alert('Privacy')} />
          <SettingsItem icon="notifications" label="Notifications" onPress={() => Alert.alert('Notifications')} />
          <SettingsItem icon="list" label="Content preferences" onPress={() => Alert.alert('Content preferences')} />
          <SettingsItem icon="help-circle" label="Report a problem" onPress={() => Alert.alert('Report a problem')} />
          <SettingsItem icon="information-circle" label="About" onPress={() => Alert.alert('About Reel\'It')} />
          {user && (
            <SettingsItem
              icon="log-out"
              label="Log out"
              danger
              onPress={() => {
                signOut();
                Alert.alert('Logged out', 'You have been signed out.');
                closeSettings();
              }}
            />
          )}
        </View>
      </SimpleBottomSheet>
    </View>
  );
}

function SettingsItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.8 }]}
    >
      <View style={[styles.iconCircle, danger && { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
        <Ionicons name={icon} size={22} color={danger ? '#ff3b30' : colors.text} />
      </View>
      <Text style={[styles.itemLabel, danger && { color: '#ff3b30' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.grey} />
    </Pressable>
  );
}

const AVATAR_SIZE = 74;

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
    marginBottom: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
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
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  username: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  meta: {
    color: colors.grey,
    marginTop: 4,
  },
  actions: {
    gap: 10,
  },
  sheetHeader: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  sheetList: {
    marginTop: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    color: colors.text,
    fontWeight: '700',
  },
});
