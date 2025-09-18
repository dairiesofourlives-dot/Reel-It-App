
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useReels } from '../../state/reelsContext';
import CommentsModal from '../../components/CommentsModal';

const { height: SCREEN_H } = Dimensions.get('window');

export default function ReelViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { reels, liked, toggleLike } = useReels();
  const reel = useMemo(() => reels.find((r) => r.id === id), [reels, id]);
  const [commentsOpen, setCommentsOpen] = useState(false);

  if (!reel) {
    return (
      <View style={[commonStyles.wrapper, styles.center]}>
        <Text style={{ color: colors.text }}>Reel not found.</Text>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backChip, pressed && { opacity: 0.9 }]}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backChipTxt}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const isLiked = liked.includes(reel.id);

  const onUseSong = () => {
    router.push(`/(tabs)/upload?song=${encodeURIComponent(reel.soundName)}`);
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Video
        source={{ uri: reel.mediaUri }}
        style={styles.video}
        shouldPlay
        isMuted={false}
        resizeMode="cover"
        useNativeControls={false}
        isLooping
      />

      {/* Back button floating */}
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}>
        <Ionicons name="chevron-back" size={20} color="#fff" />
      </Pressable>

      {/* Bottom text area */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => router.push(`/user/${encodeURIComponent(reel.userId)}`)} style={({ pressed }) => [styles.userRow, pressed && { opacity: 0.9 }]}>
          <Ionicons name="person-circle" size={20} color="#fff" />
          <Text style={styles.username}>@{reel.username}</Text>
        </Pressable>
        <View style={styles.songRow}>
          <Ionicons name="musical-notes" size={16} color="#fff" />
          <Text style={styles.song} numberOfLines={1}>{reel.soundName}</Text>
        </View>
        {!!reel.overlayText && <Text style={styles.caption} numberOfLines={2}>{reel.overlayText}</Text>}
      </View>

      {/* Right side actions */}
      <View style={styles.rightActions}>
        <Pressable onPress={() => toggleLike(reel.id)} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={26} color="#fff" />
          <Text style={styles.actionLabel}>{reel.likes}</Text>
        </Pressable>

        <Pressable onPress={() => setCommentsOpen(true)} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
          <Text style={styles.actionLabel}>Comment</Text>
        </Pressable>

        <Pressable onPress={onUseSong} style={({ pressed }) => [styles.useSongBtn, pressed && { opacity: 0.9 }]}>
          <Ionicons name="musical-note" size={22} color="#000" />
          <Text style={styles.useSongTxt}>Use song</Text>
        </Pressable>
      </View>

      <CommentsModal reelId={reel.id} visible={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </View>
  );
}

const PADDING = 12;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: SCREEN_H,
  },
  backBtn: {
    position: 'absolute',
    top: 18,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 999,
  },
  bottomBar: {
    position: 'absolute',
    left: PADDING,
    right: 84,
    bottom: PADDING + 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  username: {
    color: '#fff',
    fontWeight: '900',
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  song: {
    color: '#fff',
    fontWeight: '700',
    flex: 1,
  },
  caption: {
    color: '#fff',
    opacity: 0.9,
  },
  rightActions: {
    position: 'absolute',
    right: PADDING,
    bottom: PADDING + 8,
    alignItems: 'center',
    gap: 14,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontWeight: '800',
    marginTop: 4,
  },
  useSongBtn: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  useSongTxt: {
    color: '#000',
    fontWeight: '900',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChip: {
    marginTop: 12,
    backgroundColor: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backChipTxt: {
    color: '#fff',
    fontWeight: '800',
  },
});
