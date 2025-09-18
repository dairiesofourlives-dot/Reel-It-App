
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { colors, commonStyles } from '../styles/commonStyles';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    console.log('Splash mounted');
  }, []);

  const handleContinue = () => {
    console.log('Navigating to /(tabs)/feed');
    router.push('/(tabs)/feed');
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      <Image
        source={require('../assets/images/natively-dark.png')}
        resizeMode="contain"
        style={styles.logo}
      />
      <Text style={styles.title}>Reel&apos;It</Text>
      <Text style={styles.subtitle}>Dance. Create. Share.</Text>
      <View style={styles.buttonWrap}>
        <Button text="Enter" onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonWrap: {
    width: '100%',
  },
});
