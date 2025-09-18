
import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView } from 'react-native';
import { useReels } from '../../state/reelsContext';
import { colors, commonStyles } from '../../styles/commonStyles';
import ReelCard from '../../components/ReelCard';

export default function SearchScreen() {
  const { reels } = useReels();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reels;
    return reels.filter(
      r =>
        r.username.toLowerCase().includes(q) ||
        r.soundName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [reels, query]);

  console.log('SearchScreen query:', query, 'results:', filtered.length);

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by user, sound or category"
        placeholderTextColor={colors.grey}
        style={styles.input}
        autoCapitalize="none"
        returnKeyType="search"
      />
      <ScrollView contentContainerStyle={styles.results}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No results</Text>
        ) : (
          filtered.map((reel) => <ReelCard key={reel.id} reel={reel} />)
        )}
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.card,
    color: colors.text,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    elevation: 1,
    marginBottom: 14,
  },
  results: {
    paddingBottom: 28,
  },
  empty: {
    color: colors.grey,
    textAlign: 'center',
    marginTop: 24,
  },
});
