
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Reel } from '../state/reelsContext';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface ReelCardProps {
  reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: reel.mediaUri }} style={styles.media} resizeMode="cover" />
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <Text style={styles.username}>@{reel.username}</Text>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{reel.category}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Ionicons name="musical-notes" size={16} color={colors.background} />
          <Text style={styles.sound} numberOfLines={1}>{reel.soundName}</Text>
          <View style={styles.likes}>
            <Ionicons name="heart" size={16} color={colors.background} />
            <Text style={styles.likeText}>{reel.likes}</Text>
          </View>
        </View>
      </View>
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
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 10,
  },
  likeText: {
    color: '#fff',
    fontWeight: '700',
  },
});
