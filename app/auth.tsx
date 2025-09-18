
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { useReels } from '../state/reelsContext';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

function sanitizeUsername(u: string) {
  return u.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
}

export default function AuthScreen() {
  const router = useRouter();
  const { user, setUser } = useReels();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  useEffect(() => {
    console.log('AuthScreen mounted', { mode });
  }, [mode]);

  const isStrongPassword = (pwd: string) => {
    const lengthOK = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return lengthOK && hasUpper && hasLower && hasNumber;
  };

  const ensureProfile = async (sUser: any) => {
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, full_name')
        .eq('user_id', sUser.id)
        .maybeSingle();

      let finalUsername = existing?.username;
      let finalFullName = existing?.full_name;

      if (!existing) {
        let baseUsername =
          sanitizeUsername(sUser.user_metadata?.username || (sUser.email || 'user').split('@')[0]) || `user${String(Date.now()).slice(-4)}`;
        baseUsername = baseUsername.slice(0, 20) || `user${String(Date.now()).slice(-4)}`;
        let attempt = baseUsername;

        for (let i = 0; i < 3; i++) {
          const { data: ins, error: insErr } = await supabase
            .from('profiles')
            .insert({
              user_id: sUser.id,
              username: attempt,
              full_name: sUser.user_metadata?.full_name || '',
              avatar_url: null,
            })
            .select('id, username, full_name')
            .single();

          if (!insErr && ins) {
            finalUsername = ins.username;
            finalFullName = ins.full_name;
            break;
          }
          if (insErr && (insErr as any).message?.toLowerCase?.().includes('duplicate')) {
            attempt = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
            continue;
          }
          if (insErr) {
            console.log('Insert profile error', insErr);
            break;
          }
        }
      } else {
        const metaUsername = sanitizeUsername(sUser.user_metadata?.username || '');
        const metaFullName = (sUser.user_metadata?.full_name || '').trim();
        const needsUpdate = (!!metaUsername && metaUsername !== existing.username) || (!!metaFullName && metaFullName !== existing.full_name);
        if (needsUpdate) {
          let newUsername = metaUsername || existing.username;
          for (let i = 0; i < 2; i++) {
            const { data: upd, error: updErr } = await supabase
              .from('profiles')
              .update({
                username: newUsername,
                full_name: metaFullName || existing.full_name,
              })
              .eq('user_id', sUser.id)
              .select('id, username, full_name')
              .single();
            if (!updErr && upd) {
              finalUsername = upd.username;
              finalFullName = upd.full_name;
              break;
            }
            if (updErr && (updErr as any).message?.toLowerCase?.().includes('duplicate')) {
              newUsername = `${metaUsername}${Math.floor(Math.random() * 10000)}`;
              continue;
            }
            if (updErr) {
              console.log('Update profile error', updErr);
              break;
            }
          }
        } else {
          finalUsername = existing.username;
          finalFullName = existing.full_name;
        }
      }

      finalUsername = finalUsername || sanitizeUsername((sUser.email || 'user').split('@')[0]) || `user${String(Date.now()).slice(-4)}`;

      setUser({ id: sUser.id, username: finalUsername, avatar: undefined });
      console.log('Profile ensured with username:', finalUsername, 'name:', finalFullName);
    } catch (e) {
      console.log('ensureProfile error', e);
      const fallback = sanitizeUsername((sUser.email || 'user').split('@')[0]) || `user${String(Date.now()).slice(-4)}`;
      setUser({ id: sUser.id, username: fallback, avatar: undefined });
    }
  };

  const onSubmit = async () => {
    try {
      console.log('Submitting auth form', { mode, emailLength: email.length });
      const emailRegex = /[^@]+@[^.]+\..+/;

      if (mode === 'signup') {
        const cleanedUsername = sanitizeUsername(username);
        if (!name.trim()) {
          Alert.alert('Missing info', 'Please enter your name.');
          return;
        }
        if (!cleanedUsername) {
          Alert.alert('Invalid username', 'Choose a username with letters, numbers, dots or underscores.');
          return;
        }
        if (cleanedUsername.length < 3 || cleanedUsername.length > 20) {
          Alert.alert('Invalid username', 'Username must be between 3 and 20 characters.');
          return;
        }
        if (!email || !emailRegex.test(email)) {
          Alert.alert('Invalid email', 'Please provide a valid email address.');
          return;
        }
        if (!password || !repeatPassword) {
          Alert.alert('Missing password', 'Please enter and confirm your password.');
          return;
        }
        if (password !== repeatPassword) {
          Alert.alert('Passwords do not match', 'Please make sure the passwords are the same.');
          return;
        }
        if (!isStrongPassword(password)) {
          Alert.alert('Weak password', 'Use at least 8 characters, with uppercase, lowercase, and a number.');
          return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://natively.dev/email-confirmed',
            data: {
              full_name: name.trim(),
              username: cleanedUsername,
            },
          },
        });
        if (error) {
          Alert.alert('Sign up failed', error.message);
        } else {
          Alert.alert('Verify your email', 'We sent a verification link. Please verify your email to complete sign up.');
        }
      } else {
        if (!email && !password) {
          Alert.alert('Login error', 'Please enter your email and password.');
          return;
        }
        if (!email || !emailRegex.test(email)) {
          Alert.alert('Invalid email', 'Please provide a valid email address.');
          return;
        }
        if (!password) {
          Alert.alert('Missing password', 'Please enter your password.');
          return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          Alert.alert('Sign in failed', error.message);
          setLoading(false);
          return;
        }
        const sUser = data.user;
        if (!sUser) {
          Alert.alert('Sign in', 'Email not confirmed yet. Please verify your email.');
          setLoading(false);
          return;
        }

        await ensureProfile(sUser);

        Alert.alert('Success', 'Signed in successfully.');
        router.replace('/(tabs)/feed');
      }
    } catch (e: any) {
      console.log('Auth error', e);
      Alert.alert('Error', e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    if (!email) {
      Alert.alert('Enter email', 'Type your email first to receive a reset link.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://natively.dev/email-confirmed',
    });
    if (error) Alert.alert('Reset failed', error.message);
    else Alert.alert('Check your inbox', 'Password reset instructions sent.');
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
        {mode === 'signup' && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={colors.grey}
              autoCapitalize="words"
              style={styles.input}
              returnKeyType="next"
            />
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={(t) => setUsername(sanitizeUsername(t))}
              placeholder="username"
              placeholderTextColor={colors.grey}
              autoCapitalize="none"
              style={styles.input}
              returnKeyType="next"
            />
          </>
        )}

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
        <View style={styles.inputWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.grey}
            secureTextEntry={!showPassword}
            style={[styles.input, { paddingRight: 44 }]}
            returnKeyType={mode === 'signin' ? 'done' : 'next'}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={({ pressed }) => [styles.eyeBtn, pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.grey} />
          </Pressable>
        </View>

        {mode === 'signup' && (
          <>
            <Text style={styles.label}>Repeat Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.grey}
                secureTextEntry={!showRepeat}
                style={[styles.input, { paddingRight: 44 }]}
                returnKeyType="done"
              />
              <Pressable
                onPress={() => setShowRepeat(!showRepeat)}
                style={({ pressed }) => [styles.eyeBtn, pressed && { opacity: 0.7 }]}
                hitSlop={8}
              >
                <Ionicons name={showRepeat ? 'eye-off' : 'eye'} size={20} color={colors.grey} />
              </Pressable>
            </View>
          </>
        )}

        <Text style={styles.hint}>Password must be 8+ chars, include uppercase, lowercase, and a number.</Text>

        <Button text={loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'} onPress={onSubmit} />
        {mode === 'signin' && (
          <Pressable onPress={onForgot} style={{ alignSelf: 'flex-end', paddingVertical: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Forgot password?</Text>
          </Pressable>
        )}
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
  inputWrap: {
    position: 'relative',
    width: '100%',
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
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  hint: {
    color: colors.grey,
    marginTop: 4,
  },
  already: {
    textAlign: 'center',
    color: colors.grey,
    marginTop: 18,
  },
});
