
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useReels } from '../../state/reelsContext';
import { supabase } from '../../lib/supabase';
import ReelCard from '../../components/ReelCard';

export default function OtherUserProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = typeof params.id === 'string' ? params.id : '';
  const { user: currentUser, reels } = useReels();

  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null; bio: string | null } | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const theirReels = useMemo(() => reels.filter((r) => r.userId === userId), [reels, userId]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data: p } = await supabase
          .from('profiles')
          .select('username, avatar_url, bio')
          .eq('user_id', userId)
          .maybeSingle();
        if (mounted) setProfile(p || { username: 'user', avatar_url: null, bio: null });

        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { head: true, count: 'exact' })
          .eq('followee_id', userId);
        if (mounted) setFollowers(followersCount || 0);

        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { head: true, count: 'exact' })
          .eq('follower_id', userId);
        if (mounted) setFollowing(followingCount || 0);

        if (currentUser?.id) {
          const { data: f } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('followee_id', userId)
            .maybeSingle();
          if (mounted) setIsFollowing(!!f);
        }
      } catch (e) {
        console.log('Load other profile failed', e);
      }
    };

    if (userId) load();

    return () => {
      mounted = false;
    };
  }, [userId, currentUser?.id]);

  const onToggleFollow = async () => {
    if (!currentUser?.id) {
      Alert.alert('Sign in required', 'Please sign in to follow users.');
      return;
    }
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('followee_id', userId);
        if (!error) {
          setIsFollowing(false);
          setFollowers((v) => Math.max(0, v - 1));
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        const { error } = await supabase.from('follows').insert({
          follower_id: currentUser.id,
          followee_id: userId,
        } as any);
        if (!error) {
          setIsFollowing(true);
          setFollowers((v) => v + 1);
        } else {
          Alert.alert('Error', error.message);
        }
      }
    } catch (e: any) {
      console.log('Follow toggle error', e);
      Alert.alert('Error', e?.message || 'Something went wrong');
    }
  };

  const avatarUri = (profile?.avatar_url as string) || undefined;

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
        <Text style={styles.brand}>Profile</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.headerRow}>
        <Pressable onPress={() => setAvatarOpen(true)} style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.9 }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={30} color={colors.text} />
            </View>
          )}
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.username}>@{profile?.username || 'user'}</Text>
          {!!profile?.bio && <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>}
          <View style={styles.statsRow}>
            <Pressable onPress={() => router.push(`/follows/following?userId=${encodeURIComponent(userId)}`)} style={styles.stat}>
              <Text style={styles.statValue}>{following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </Pressable>
            <Pressable onPress={() => router.push(`/follows/followers?userId=${encodeURIComponent(userId)}`)} style={styles.stat}>
              <Text style={styles.statValue}>{followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={onToggleFollow} style={({ pressed }) => [styles.followBtn, isFollowing && styles.followingBtn, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.followTxt, isFollowing && { color: colors.text }]}>{isFollowing ? 'Following' : 'Add Friend'}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Updates</Text>
      {theirReels.length === 0 ? (
        <Text style={styles.empty}>No updates yet.</Text>
      ) : (
        theirReels.map((r) => <ReelCard key={r.id} reel={r} />)
      )}

      {/* Avatar modal */}
      <Modal visible={avatarOpen} animationType="fade" transparent onRequestClose={() => setAvatarOpen(false)}>
        <Pressable onPress={() => setAvatarOpen(false)} style={styles.modalBackdrop}>
          <View style={styles.modalImgWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.modalImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { width: '100%', height: '100%' }]} />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const AVATAR = 80;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backBtn: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backTxt: {
    color: colors.text,
    fontWeight: '700',
  },
  brand: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  bio: {
    color: colors.text,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  stat: {
    marginRight: 12,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.grey,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  followingBtn: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  followTxt: {
    color: '#fff',
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  empty: {
    color: colors.grey,
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalImgWrap: {
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
  },
  modalImg: {
    width: '100%',
    height: '100%',
  },
});
