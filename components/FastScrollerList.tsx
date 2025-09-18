
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { colors } from '../styles/commonStyles';

type Section = {
  key: string; // letter
  items: string[];
};

function generateSections(): Section[] {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const sections: Section[] = letters.map((L) => {
    // generate 12 items to simulate long list
    const items = Array.from({ length: 12 }).map((_, i) => `${L}pp ${L}${i + 1} — Example App`);
    return { key: L, items };
  });
  return sections;
}

export default function FastScrollerList() {
  const sections = useMemo(() => generateSections(), []);
  const scrollRef = useRef<ScrollView>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [activeLetter, setActiveLetter] = useState<string>('A');

  const onSectionLayout = (letter: string, e: LayoutChangeEvent) => {
    setPositions((prev) => ({ ...prev, [letter]: e.nativeEvent.layout.y }));
  };

  const scrollToLetter = (letter: string) => {
    const y = positions[letter] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    // update active letter
    let current = 'A';
    for (const L of Object.keys(positions)) {
      if (positions[L] <= y + 8) {
        current = L;
      } else {
        break;
      }
    }
    setActiveLetter(current);
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 16 }}>
        {sections.map((section) => (
          <View key={section.key} onLayout={(e) => onSectionLayout(section.key, e)} style={styles.section}>
            <Text style={styles.sectionHeader}>{section.key}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <View key={`${section.key}-${idx}`} style={styles.row}>
                  <View style={styles.iconDot} />
                  <Text style={styles.rowText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indexBar}>
        {sections.map((s) => {
          const selected = s.key === activeLetter;
          return (
            <Pressable key={s.key} onPress={() => scrollToLetter(s.key)} style={({ pressed }) => [styles.indexItem, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.indexText, selected && styles.indexTextActive]}>{s.key}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const INDEX_WIDTH = 22;

const styles = StyleSheet.create({
  container: {
    height: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.grey,
    marginBottom: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    padding: 8,
    boxShadow: '0px 6px 14px rgba(0,0,0,0.06)',
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  iconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  rowText: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  indexBar: {
    position: 'absolute',
    top: 8,
    right: 4,
    bottom: 8,
    width: INDEX_WIDTH,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderRadius: 10,
  },
  indexItem: {
    width: INDEX_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  indexText: {
    fontSize: 10,
    color: colors.grey,
    fontWeight: '800',
  },
  indexTextActive: {
    color: colors.primary,
  },
});
