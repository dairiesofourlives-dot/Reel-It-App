
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useReels } from '../../state/reelsContext';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [activeTab, setActiveTab] = useState<'reels' | 'tagged'>('reels');
  const [taggedReels, setTaggedReels] = useState<any[]>([]);

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

        // Load tagged reels
        const { data: tags, error: tagsErr } = await supabase
          .from('reel_tags')
          .select('reel_id')
          .eq('tagged_user_id', userId);
        
        if (!tagsErr && tags && tags.length > 0) {
          const reelIds = tags.map(t => t.reel_id);
          const { data: taggedReelsData, error: reelsErr } = await supabase
            .from('reels')
            .select('*')
            .in('id', reelIds)
            .order('created_at', { ascending: false });
          
          if (!reelsErr && mounted) {
            setTaggedReels(taggedReelsData || []);
          }
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

  const GridTabs = () => (
    <View style={styles.gridTabs}>
      <Pressable onPress={() => setActiveTab('reels')} style={[styles.gridTabBtn, activeTab === 'reels' && styles.gridTabBtnActive]}>
        <Ionicons name="grid-outline" size={20} color={activeTab === 'reels' ? '#fff' : colors.text} />
        <Text style={[styles.gridTabTxt, activeTab === 'reels' && styles.gridTabTxtActive]}>Reels</Text>
      </Pressable>
      <Pressable onPress={() => setActiveTab('tagged')} style={[styles.gridTabBtn, activeTab === 'tagged' && styles.gridTabBtnActive]}>
        <Ionicons name="pricetag-outline" size={20} color={activeTab === 'tagged' ? '#fff' : colors.text} />
        <Text style={[styles.gridTabTxt, activeTab === 'tagged' && styles.gridTabTxtActive]}>Tagged</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
            <Text style={styles.backTxt}>Back</Text>
          </Pressable>
          <Text style={styles.brand}>Profile</Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={[colors.primary + '20', colors.primaryLight + '10', 'transparent']}
          style={styles.profileHeader}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => setAvatarOpen(true)} style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.9 }]}>
              <View style={styles.avatarContainer}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={32} color={colors.text} />
                  </View>
                )}
                <View style={styles.avatarRing} />
              </View>
            </Pressable>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.username}>@{profile?.username || 'user'}</Text>
              {!!profile?.bio && <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>}
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Pressable 
            onPress={() => router.push(`/follows/following?userId=${encodeURIComponent(userId)}`)} 
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8 }]}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="people" size={22} color="#fff" />
              <Text style={styles.statCardValue}>{following}</Text>
              <Text style={styles.statCardLabel}>Following</Text>
            </LinearGradient>
          </Pressable>

          <Pressable 
            onPress={() => router.push(`/follows/followers?userId=${encodeURIComponent(userId)}`)} 
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8 }]}
          >
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="heart" size={22} color="#fff" />
              <Text style={styles.statCardValue}>{followers}</Text>
              <Text style={styles.statCardLabel}>Followers</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Follow Button */}
        <Pressable 
          onPress={onToggleFollow} 
          style={({ pressed }) => [
            styles.followBtn, 
            isFollowing && styles.followingBtn, 
            pressed && { opacity: 0.9 }
          ]}
        >
          <Ionicons 
            name={isFollowing ? 'checkmark-circle' : 'person-add'} 
            size={20} 
            color={isFollowing ? colors.text : '#fff'} 
          />
          <Text style={[styles.followTxt, isFollowing && { color: colors.text }]}>
            {isFollowing ? 'Following' : 'Add Friend'}
          </Text>
        </Pressable>

        {/* Tabs */}
        <GridTabs />

        {/* Grid */}
        <View style={styles.grid}>
          {activeTab === 'reels' ? (
            theirReels.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="videocam-outline" size={48} color={colors.grey} />
                <Text style={styles.emptyTitle}>No reels yet</Text>
                <Text style={styles.emptyText}>This user hasn&apos;t posted any reels</Text>
              </View>
            ) : (
              theirReels.map((r) => <ReelGridItem key={r.id} thumb={r.thumb} />)
            )
          ) : taggedReels.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={48} color={colors.grey} />
              <Text style={styles.emptyTitle}>No tagged reels</Text>
              <Text style={styles.emptyText}>This user hasn&apos;t been tagged in any reels</Text>
            </View>
          ) : (
            taggedReels.map((r) => <ReelGridItem key={r.id} thumb={r.thumb_uri} />)
          )}
        </View>
      </ScrollView>

      {/* Avatar modal */}
      <Modal visible={avatarOpen} animationType="fade" transparent onRequestClose={() => setAvatarOpen(false)}>
        <Pressable onPress={() => setAvatarOpen(false)} style={styles.modalBackdrop}>
          <View style={styles.modalImgWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.modalImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { width: '100%', height: '100%' }]}>
                <Ionicons name="person" size={80} color={colors.text} />
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function ReelGridItem({ thumb }: { thumb?: string }) {
  return (
    <Pressable
      onPress={() => Alert.alert('Reel', 'Opening reel...')}
      style={({ pressed }) => [gridStyles.item, pressed && { opacity: 0.85 }]}
    >
      {thumb ? (
        <Image source={{ uri: thumb }} style={gridStyles.media} />
      ) : (
        <View style={gridStyles.placeholder}>
          <Ionicons name="play-circle" size={32} color={colors.primary} />
        </View>
      )}
      <View style={gridStyles.overlay}>
        <Ionicons name="play" size={16} color="#fff" />
      </View>
    </Pressable>
  );
}

const AVATAR = 84;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backTxt: {
    color: colors.text,
    fontWeight: '700',
  },
  brand: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  profileHeader: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: (AVATAR + 8) / 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  statGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginTop: 6,
  },
  statCardLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    opacity: 0.9,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    boxShadow: '0px 6px 16px rgba(0,0,0,0.15)',
    elevation: 3,
  },
  followingBtn: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  followTxt: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  gridTabs: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
  },
  gridTabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  gridTabBtnActive: {
    backgroundColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
    elevation: 3,
  },
  gridTabTxt: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  gridTabTxtActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
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

const gridStyles = StyleSheet.create({
  item: {
    width: '31.5%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
});
