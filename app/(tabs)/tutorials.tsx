
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useReels } from '../../state/reelsContext';
import { useRouter } from 'expo-router';

function toHashtag(category: string) {
  // Convert to #hashTag removing spaces and special chars
  const cleaned = category.replace(/[^a-zA-Z0-9]/g, '');
  return `#${cleaned}`;
}

export default function TutorialsScreen() {
  const { categories } = useReels();
  const router = useRouter();
  console.log('TutorialsScreen categories:', categories.length);

  const onPressHashtag = (tag: string) => {
    console.log('Tapped hashtag', tag);
    router.push({ pathname: '/(tabs)/search', params: { q: tag } });
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Text style={styles.title}>Dance Tutorials</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {categories.map((c) => {
          const tag = toHashtag(c);
          return (
            <Pressable
              key={c}
              onPress={() => onPressHashtag(tag)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.cardTitle}>{tag}</Text>
              <Text style={styles.cardText}>
                Explore {c} moves and challenges. Tap to search tutorials and reels by {tag}.
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  content: {
    paddingBottom: 28,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  cardText: {
    color: colors.grey,
  },
});
