
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import Button from '../../components/Button';

export default function ProfileScreen() {
  console.log('ProfileScreen render');
  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.subtitle}>Sign in features coming soon.</Text>
      <View style={styles.actions}>
        <Button text="Edit Profile" onPress={() => console.log('Edit Profile pressed')} />
        <Button text="Settings" onPress={() => console.log('Settings pressed')} style={{ backgroundColor: colors.backgroundAlt }} textStyle={{ color: colors.text }} />
      </View>
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
    marginBottom: 6,
  },
  subtitle: {
    color: colors.grey,
    marginBottom: 14,
  },
  actions: {
    gap: 10,
  },
});
