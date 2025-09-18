
import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useReels } from '../../state/reelsContext';
import ReelCard from '../../components/ReelCard';
import { colors, commonStyles } from '../../styles/commonStyles';

export default function FeedScreen() {
  const { reels } = useReels();

  console.log('FeedScreen rendering with reels:', reels.length);

  return (
    <View style={[commonStyles.wrapper, styles.wrapper]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Following</Text>
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
        {reels.length === 0 && (
          <Text style={styles.empty}>No reels yet. Be the first to post!</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  empty: {
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 24,
  },
});
