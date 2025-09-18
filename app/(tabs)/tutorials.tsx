
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useReels } from '../../state/reelsContext';

export default function TutorialsScreen() {
  const { categories } = useReels();
  console.log('TutorialsScreen categories:', categories.length);

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Text style={styles.title}>Dance Tutorials</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {categories.map((c) => (
          <View key={c} style={styles.card}>
            <Text style={styles.cardTitle}>{c}</Text>
            <Text style={styles.cardText}>Explore {c} moves and challenges.</Text>
          </View>
        ))}
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
    color: colors.text,
    marginBottom: 6,
  },
  cardText: {
    color: colors.grey,
  },
});
