
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { colors, commonStyles } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('Splash mounted with animation');
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.95, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -6, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 6, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        ])
      ),
    ]).start();
  }, [scale, translateY, glow]);

  const glowShadow = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['0 0px 0px rgba(13,110,253,0.0)', '0 10px 30px rgba(13,110,253,0.35)'],
  });

  const handleContinue = () => {
    console.log('Navigating to /auth');
    router.push('/auth');
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      <LinearGradient
        colors={['#ffffff', '#f3f7ff']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View
        style={[
          styles.logoWrap,
          {
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <Text style={styles.logoTop}>Reel</Text>
        <View style={styles.row}>
          <Text style={styles.logoBottom}>&apos;It</Text>
          <View style={styles.dot} />
        </View>
      </Animated.View>

      <Text style={styles.subtitle}>Dance. Create. Share.</Text>

      <Animated.View style={[styles.buttonWrap, { boxShadow: glowShadow as any }]}>
        <Button text="Get started" onPress={handleContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoTop: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBottom: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: colors.accent,
    borderRadius: 5,
    marginLeft: 8,
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
