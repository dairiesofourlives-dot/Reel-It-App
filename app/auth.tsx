
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { useReels } from '../state/reelsContext';

export default function AuthScreen() {
  const router = useRouter();
  const { user, setUser } = useReels();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    console.log('AuthScreen mounted', { mode });
  }, [mode]);

  const onSubmit = () => {
    console.log('Submitting auth form', { mode, emailLength: email.length });
    if (!email || !password) {
      Alert.alert('Missing info', 'Please fill in email and password.');
      return;
    }
    if (mode === 'signup') {
      Alert.alert('Verify your email', 'We sent a verification link. Please verify your email to complete sign up.');
    }
    const username = email.split('@')[0] || 'user';
    setUser({
      id: `u_${Date.now()}`,
      username,
      avatar: undefined,
    });
    Alert.alert('Success', mode === 'signup' ? 'Account created (local). You are now signed in.' : 'Signed in (local).');
    router.replace('/(tabs)/feed');
  };

  const onContinueGuest = () => {
    console.log('Continuing as guest');
    router.replace('/(tabs)/feed');
  };

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Welcome to Reel&apos;It</Text>
      </View>

      <View style={styles.segment}>
        <Pressable onPress={() => setMode('signin')} style={[styles.segmentBtn, mode === 'signin' && styles.segmentBtnActive]}>
          <Text style={[styles.segmentTxt, mode === 'signin' && styles.segmentTxtActive]}>Sign In</Text>
        </Pressable>
        <Pressable onPress={() => setMode('signup')} style={[styles.segmentBtn, mode === 'signup' && styles.segmentBtnActive]}>
          <Text style={[styles.segmentTxt, mode === 'signup' && styles.segmentTxtActive]}>Create Account</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.grey}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          returnKeyType="next"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.grey}
          secureTextEntry
          style={styles.input}
          returnKeyType="done"
        />

        <Button text={mode === 'signin' ? 'Sign In' : 'Sign Up'} onPress={onSubmit} />
        <Button
          text="Continue as Guest"
          onPress={onContinueGuest}
          style={{ backgroundColor: colors.backgroundAlt }}
          textStyle={{ color: colors.text }}
        />
      </View>

      {user && (
        <Text style={styles.already}>
          Signed in as @{user.username}. You can go to your Profile tab to edit profile.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    marginBottom: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  backTxt: {
    color: colors.text,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 999,
    padding: 4,
    marginTop: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentTxt: {
    color: colors.text,
    fontWeight: '700',
  },
  segmentTxtActive: {
    color: '#fff',
  },
  form: {
    marginTop: 18,
    gap: 8,
  },
  label: {
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
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
  },
  already: {
    textAlign: 'center',
    color: colors.grey,
    marginTop: 18,
  },
});
