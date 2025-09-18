
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Reel, useReels } from '../state/reelsContext';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import CommentsModal from './CommentsModal';

interface ReelCardProps {
  reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
  const { saved, toggleSave, liked, toggleLike } = useReels();
  const isSaved = saved.includes(reel.id);
  const isLiked = liked.includes(reel.id);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isVideo =
    /\.mp4|\.mov|^http.*\.(mp4|mov)/i.test(reel.mediaUri) ||
    reel.mediaUri.includes('gtv-videos-bucket');

  return (
    <View style={styles.card}>
      {isVideo ? (
        <Video
          source={{ uri: reel.mediaUri }}
          style={styles.media}
          shouldPlay={false}
          isMuted
          resizeMode="cover"
          useNativeControls={false}
        />
      ) : (
        <Image source={{ uri: reel.mediaUri }} style={styles.media} resizeMode="cover" />
      )}

      {!!reel.overlayText && (
        <View style={styles.textOverlay}>
          <Text style={styles.overlayText}>{reel.overlayText}</Text>
        </View>
      )}

      {reel.filter === 'mono' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />}
      {reel.filter === 'warm' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(255,165,0,0.15)' }]} />}
      {reel.filter === 'cool' && <View style={[styles.filterOverlay, { backgroundColor: 'rgba(0,128,255,0.15)' }]} />}

      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <Text style={styles.username}>@{reel.username}</Text>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{reel.category}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Ionicons name="musical-notes" size={16} color={colors.background} />
          <Text style={styles.sound} numberOfLines={1}>
            {reel.soundName}
          </Text>

          <Pressable
            onPress={() => toggleLike(reel.id)}
            hitSlop={10}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? '#ff4d6d' : '#fff'} />
            <Text style={styles.likeText}>{reel.likes}</Text>
          </Pressable>

          <Pressable
            onPress={() => setCommentsOpen(true)}
            hitSlop={10}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => toggleSave(reel.id)}
            hitSlop={12}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? colors.accent : '#fff'} />
          </Pressable>
        </View>
      </View>

      <CommentsModal reelId={reel.id} visible={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 440,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 12,
    backgroundColor: colors.backgroundAlt,
    boxShadow: '0px 10px 22px rgba(0,0,0,0.10)',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  textOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 8,
  },
  overlayText: {
    color: '#fff',
    fontWeight: '800',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  categoryPill: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sound: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginLeft: 6,
  },
  likeText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveBtn: {
    padding: 4,
  },
});
