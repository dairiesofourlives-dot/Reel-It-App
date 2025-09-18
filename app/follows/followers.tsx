
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useReels } from '../../state/reelsContext';

type Row = {
  user_id: string;
  username: string;
  avatar_url: string | null;
};

export default function FollowersScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useReels();
  const targetUserId = typeof params.userId === 'string' ? params.userId : currentUser?.id || '';
  const [rows, setRows] = useState<Row[]>([]);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // who follows targetUserId
        const { data } = await supabase
          .from('follows')
          .select('follower_id, profiles!inner(user_id, username, avatar_url)')
          .eq('followee_id', targetUserId)
          .returns<any[]>();
        const profiles: Row[] = (data || []).map((r) => ({
          user_id: r.profiles.user_id,
          username: r.profiles.username,
          avatar_url: r.profiles.avatar_url,
        }));
        if (mounted) setRows(profiles);

        if (currentUser?.id) {
          const { data: mine } = await supabase
            .from('follows')
            .select('followee_id')
            .eq('follower_id', currentUser.id);
          const set = new Set<string>((mine || []).map((m) => m.followee_id));
          if (mounted) setMyFollowing(set);
        }
      } catch (e) {
        console.log('Load followers failed', e);
      }
    };

    if (targetUserId) load();
    return () => {
      mounted = false;
    };
  }, [targetUserId, currentUser?.id]);

  const toggleFollow = async (targetId: string, currentlyFollowing: boolean) => {
    if (!currentUser?.id) {
      Alert.alert('Sign in required', 'Sign in to follow users.');
      return;
    }
    if (currentlyFollowing) {
      const { error } = await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('followee_id', targetId);
      if (!error) {
        setMyFollowing((s) => {
          const next = new Set(s);
          next.delete(targetId);
          return next;
        });
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      const { error } = await supabase.from('follows').insert({ follower_id: currentUser.id, followee_id: targetId } as any);
      if (!error) {
        setMyFollowing((s) => new Set(s).add(targetId));
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Followers</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {rows.length === 0 ? (
          <Text style={styles.empty}>No followers to show.</Text>
        ) : (
          rows.map((r) => {
            const following = myFollowing.has(r.user_id);
            return (
              <View key={r.user_id} style={styles.row}>
                {r.avatar_url ? (
                  <Image source={{ uri: r.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
                <Pressable onPress={() => router.push(`/user/${encodeURIComponent(r.user_id)}`)} style={({ pressed }) => [styles.userCol, pressed && { opacity: 0.8 }]}>
                  <Text style={styles.username}>@{r.username}</Text>
                  <Text style={styles.meta}>Tap to view profile</Text>
                </Pressable>
                {currentUser?.id !== r.user_id && (
                  <Pressable
                    onPress={() => toggleFollow(r.user_id, following)}
                    style={({ pressed }) => [styles.followBtn, following && styles.followingBtn, pressed && { opacity: 0.9 }]}
                  >
                    <Text style={[styles.followTxt, following && { color: colors.text }]}>{following ? 'Following' : 'Follow back'}</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const AVATAR = 44;

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
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderColor: colors.divider,
    paddingVertical: 10,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  avatarPlaceholder: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.backgroundAlt,
  },
  userCol: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontWeight: '900',
  },
  meta: {
    color: colors.grey,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
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
  empty: {
    color: colors.grey,
    marginTop: 10,
  },
});
