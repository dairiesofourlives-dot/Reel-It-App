
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert, Switch, Linking, ScrollView } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import Button from '../../components/Button';
import { useReels } from '../../state/reelsContext';
import SimpleBottomSheet from '../../components/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, reels, saved, signOut, settings, updateSettings } = useReels();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<
    'root' | 'account' | 'privacy' | 'notifications' | 'content' | 'support' | 'community' | 'report' | 'about' | 'security'
  >('root');
  const [activeTab, setActiveTab] = useState<'reels' | 'tagged'>('reels');

  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [taggedReels, setTaggedReels] = useState<any[]>([]);

  console.log('ProfileScreen render user:', user?.username);

  useEffect(() => {
    let mounted = true;
    const loadCounts = async () => {
      try {
        if (!user) return;
        const { count: followersCount, error: followersErr } = await supabase
          .from('follows')
          .select('*', { head: true, count: 'exact' })
          .eq('followee_id', user.id);
        if (!followersErr && mounted) setFollowers(followersCount || 0);

        const { count: followingCount, error: followingErr } = await supabase
          .from('follows')
          .select('*', { head: true, count: 'exact' })
          .eq('follower_id', user.id);
        if (!followingErr && mounted) setFollowing(followingCount || 0);

        // Load tagged reels
        const { data: tags, error: tagsErr } = await supabase
          .from('reel_tags')
          .select('reel_id')
          .eq('tagged_user_id', user.id);
        
        if (!tagsErr && tags && tags.length > 0) {
          const reelIds = tags.map(t => t.reel_id);
          const { data: taggedReelsData, error: reelsErr } = await supabase
            .from('reels')
            .select('*')
            .in('id', reelIds)
            .order('created_at', { ascending: false });
          
          if (!reelsErr && mounted) {
            setTaggedReels(taggedReelsData || []);
          }
        }
      } catch (e) {
        console.log('loadCounts error', e);
      }
    };
    loadCounts();
    return () => {
      mounted = false;
    };
  }, [user]);

  const openSettings = () => {
    setActiveSheet('root');
    setSettingsOpen(true);
  };
  const closeSettings = () => setSettingsOpen(false);
  const handleEdit = () => router.push('/profile/edit');

  const avatarUri = typeof user?.avatar === 'string' ? user?.avatar : undefined;

  const myReels = useMemo(() => {
    if (!user) return [];
    return reels.filter((r) => r.userId === user.id);
  }, [reels, user]);

  const stats = {
    following,
    followers,
    posts: myReels.length,
  };

  const RootSheet = () => (
    <>
      <SheetHeader title="Settings" onBack={undefined} />
      <View style={styles.sheetList}>
        <SettingsItem icon="person-circle" label="Account" onPress={() => setActiveSheet('account')} />
        <SettingsItem icon="lock-closed" label="Privacy" onPress={() => setActiveSheet('privacy')} />
        <SettingsItem icon="notifications" label="Notifications" onPress={() => setActiveSheet('notifications')} />
        <SettingsItem icon="list" label="Content preferences" onPress={() => setActiveSheet('content')} />
        <SettingsItem icon="mail" label="Contact Support" onPress={() => setActiveSheet('support')} />
        <SettingsItem icon="megaphone" label="Community & Updates" onPress={() => setActiveSheet('community')} />
        <SettingsItem icon="alert-circle" label="Report a problem" onPress={() => setActiveSheet('report')} />
        <SettingsItem icon="information-circle" label="About Reel'It" onPress={() => setActiveSheet('about')} />
        {user && (
          <SettingsItem
            icon="log-out"
            label="Log out"
            danger
            onPress={async () => {
              await signOut();
              Alert.alert('Logged out', 'You have been signed out.');
              closeSettings();
              router.replace('/auth');
            }}
          />
        )}
      </View>
    </>
  );

  const AccountSheet = () => (
    <>
      <SheetHeader title="Manage Account" onBack={() => setActiveSheet('root')} />
      <Section title="Manage Account">
        <Text style={styles.description}>
          Update your display name, bio or profile picture from Profile → Edit Profile.
        </Text>
      </Section>
      <Section title="Security">
        <Text style={styles.description}>Change Email or Password → Profile → Settings → Account → Security.</Text>
        <Button
          text="Open Security"
          onPress={() => setActiveSheet('security')}
          style={{ backgroundColor: colors.backgroundAlt }}
          textStyle={{ color: colors.text }}
        />
      </Section>
      {user && (
        <Section title="Logout">
          <Text style={styles.description}>You can log out of your account from here.</Text>
          <Button
            text="Log out"
            onPress={async () => {
              await signOut();
              Alert.alert('Logged out', 'You have been signed out.');
              closeSettings();
              router.replace('/auth');
            }}
            style={{ backgroundColor: '#ff3b30' }}
          />
        </Section>
      )}
    </>
  );

  const SecuritySheet = () => (
    <>
      <SheetHeader title="Security" onBack={() => setActiveSheet('account')} />
      <Section title="Change Email">
        <Text style={styles.description}>For now, send us a request to change your email.</Text>
        <Button text="Email Support" onPress={() => Linking.openURL('mailto:info@se-mo.com?subject=Change%20Email%20Request')} />
      </Section>
      <Section title="Change Password">
        <Text style={styles.description}>If you signed up with email, request a password reset.</Text>
        <Button text="Reset via Email" onPress={() => Linking.openURL('mailto:info@se-mo.com?subject=Password%20Reset%20Request')} />
      </Section>
    </>
  );

  const PrivacySheet = () => (
    <>
      <SheetHeader title="Privacy" onBack={() => setActiveSheet('root')} />
      <Section title="Control Who Can Add You">
        <OptionRow
          label="Everyone"
          selected={settings.friendAddPolicy === 'Everyone'}
          onPress={() => updateSettings({ friendAddPolicy: 'Everyone' })}
        />
        <OptionRow
          label="Friends of Friends"
          selected={settings.friendAddPolicy === 'Friends of Friends'}
          onPress={() => updateSettings({ friendAddPolicy: 'Friends of Friends' })}
        />
      </Section>
      <Section title="Profile Visibility">
        <OptionRow
          label="Public"
          selected={settings.profileVisibility === 'Public'}
          onPress={() => updateSettings({ profileVisibility: 'Public' })}
        />
        <OptionRow
          label="Only Friends"
          selected={settings.profileVisibility === 'Only Friends'}
          onPress={() => updateSettings({ profileVisibility: 'Only Friends' })}
        />
      </Section>
      <Section title="Block or Report Users">
        <Text style={styles.description}>Open a profile → Tap Options → Block or Report.</Text>
      </Section>
    </>
  );

  const NotificationsSheet = () => (
    <>
      <SheetHeader title="Notifications" onBack={() => setActiveSheet('root')} />
      <Section title="Customize your app experience">
        <ToggleRow
          label="Message Notifications"
          value={settings.notifyMessages}
          onValueChange={(v) => updateSettings({ notifyMessages: v })}
        />
        <ToggleRow
          label="Friend Requests"
          value={settings.notifyFriendRequests}
          onValueChange={(v) => updateSettings({ notifyFriendRequests: v })}
        />
        <ToggleRow
          label="Dance Live Alerts"
          value={settings.notifyDanceLive}
          onValueChange={(v) => updateSettings({ notifyDanceLive: v })}
        />
        <Pressable onPress={() => Alert.alert('Muted conversations', 'Manage muted conversations in chats.')} style={styles.inlineLink}>
          <Text style={styles.linkText}>Mute Conversations → Manage muted chats</Text>
        </Pressable>
      </Section>
    </>
  );

  const ContentSheet = () => {
    const tags = useMemo(() => ['Dance', 'Music', 'Comedy', 'Battles', 'Tutorials', 'Amapiano', 'Pantsula'], []);
    const toggleTag = (tag: string) => {
      const exists = settings.feedPreferences.includes(tag);
      updateSettings({
        feedPreferences: exists ? settings.feedPreferences.filter((t) => t !== tag) : [...settings.feedPreferences, tag],
      });
    };

    const languages = ['English', 'Français', 'Português'];

    return (
      <>
        <SheetHeader title="Content Preferences" onBack={() => setActiveSheet('root')} />
        <Section title="Feed Preferences">
          <View style={styles.chipsRow}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} selected={settings.feedPreferences.includes(tag)} onPress={() => toggleTag(tag)} />
            ))}
          </View>
        </Section>
        <Section title="Language Settings">
          {languages.map((lng) => (
            <OptionRow key={lng} label={lng} selected={settings.language === lng} onPress={() => updateSettings({ language: lng })} />
          ))}
        </Section>
        <Section title="Safe Mode">
          <ToggleRow label="Filter sensitive content" value={settings.safeMode} onValueChange={(v) => updateSettings({ safeMode: v })} />
        </Section>
      </>
    );
  };

  const SupportSheet = () => (
    <>
      <SheetHeader title="Contact Support" onBack={() => setActiveSheet('root')} />
      <Section title="If you need extra help, our support team is ready:">
        <LinkRow label="Email" value="info@se-mo.com" onPress={() => Linking.openURL('mailto:info@se-mo.com')} />
        <LinkRow label="Website" value="www.se-mo.com/help" onPress={() => WebBrowser.openBrowserAsync('https://www.se-mo.com/help')} />
        <Text style={styles.description}>In-App: Profile → Help & Support → Contact Us to send a direct message.</Text>
      </Section>
    </>
  );

  const CommunitySheet = () => (
    <>
      <SheetHeader title="Community & Updates" onBack={() => setActiveSheet('root')} />
      <Section title="Stay connected with Reel'It news, tips, and updates:">
        <LinkRow label="Twitter/X" value="@ReelItOfficial" onPress={() => WebBrowser.openBrowserAsync('https://x.com/ReelItOfficial')} />
        <LinkRow label="Instagram" value="@ReelItApp" onPress={() => WebBrowser.openBrowserAsync('https://instagram.com/ReelItApp')} />
        <LinkRow label="Website" value="www.se-mo.com" onPress={() => WebBrowser.openBrowserAsync('https://www.se-mo.com')} />
      </Section>
    </>
  );

  const ReportSheet = () => (
    <>
      <SheetHeader title="Report a Problem" onBack={() => setActiveSheet('root')} />
      <Section title="Found a bug or issue?">
        <Text style={styles.description}>Go to Profile → Help & Support → Report a Problem</Text>
        <Text style={styles.description}>Describe what happened and, if possible, attach screenshots to help us fix it faster.</Text>
        <Button text="Email us directly" onPress={() => Linking.openURL('mailto:info@se-mo.com?subject=Bug%20Report')} />
        <Text style={[styles.description, { marginTop: 8 }]}>Tip: Check the FAQ first — most common issues are answered there.</Text>
      </Section>
      {user && (
        <Section title="Logout">
          <Button
            text="Log out"
            onPress={async () => {
              await signOut();
              Alert.alert('Logged out', 'You have been signed out.');
              closeSettings();
              router.replace('/auth');
            }}
            style={{ backgroundColor: '#ff3b30' }}
          />
        </Section>
      )}
    </>
  );

  const AboutSheet = () => (
    <>
      <SheetHeader title="About Reel'It" onBack={() => setActiveSheet('root')} />
      <Section title="Our Mission">
        <Text style={styles.description}>Reel&apos;It is built by Se-Mo Media Solutions to empower dancers and creators across Africa.
We believe in giving young talent a digital stage to shine, connect, and grow their careers.

Our mission: Stream. Connect. Dance.</Text>
      </Section>
    </>
  );

  const renderActiveSheet = () => {
    switch (activeSheet) {
      case 'account':
        return <AccountSheet />;
      case 'privacy':
        return <PrivacySheet />;
      case 'notifications':
        return <NotificationsSheet />;
      case 'content':
        return <ContentSheet />;
      case 'support':
        return <SupportSheet />;
      case 'community':
        return <CommunitySheet />;
      case 'report':
        return <ReportSheet />;
      case 'about':
        return <AboutSheet />;
      case 'security':
        return <SecuritySheet />;
      default:
        return <RootSheet />;
    }
  };

  const GridTabs = () => (
    <View style={styles.gridTabs}>
      <Pressable onPress={() => setActiveTab('reels')} style={[styles.gridTabBtn, activeTab === 'reels' && styles.gridTabBtnActive]}>
        <Ionicons name="grid-outline" size={20} color={activeTab === 'reels' ? '#fff' : colors.text} />
        <Text style={[styles.gridTabTxt, activeTab === 'reels' && styles.gridTabTxtActive]}>Reels</Text>
      </Pressable>
      <Pressable onPress={() => setActiveTab('tagged')} style={[styles.gridTabBtn, activeTab === 'tagged' && styles.gridTabBtnActive]}>
        <Ionicons name="pricetag-outline" size={20} color={activeTab === 'tagged' ? '#fff' : colors.text} />
        <Text style={[styles.gridTabTxt, activeTab === 'tagged' && styles.gridTabTxtActive]}>Tagged</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[commonStyles.wrapper, styles.container]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* Top bar with brand and settings icon */}
        <View style={styles.topBar}>
          <Text style={styles.brand}>Reel&apos;It</Text>
          <Pressable onPress={openSettings} hitSlop={10} style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="settings-sharp" size={22} color={colors.text} />
          </Pressable>
        </View>

        {user ? (
          <>
            {/* Profile Header with Gradient Background */}
            <LinearGradient
              colors={[colors.primary + '20', colors.primaryLight + '10', 'transparent']}
              style={styles.profileHeader}
            >
              <View style={styles.userRow}>
                {avatarUri ? (
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    <View style={styles.avatarRing} />
                  </View>
                ) : (
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>{user.username.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.avatarRing} />
                  </View>
                )}
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={styles.username}>@{user.username}</Text>
                  {!!user.bio && <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>}
                </View>
              </View>
            </LinearGradient>

            {/* Redesigned Stats Cards */}
            <View style={styles.statsContainer}>
              <Pressable 
                onPress={() => router.push('/follows/following')} 
                style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8 }]}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Ionicons name="people" size={24} color="#fff" />
                  <Text style={styles.statCardValue}>{stats.following}</Text>
                  <Text style={styles.statCardLabel}>Following</Text>
                </LinearGradient>
              </Pressable>

              <Pressable 
                onPress={() => router.push('/follows/followers')} 
                style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8 }]}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Ionicons name="heart" size={24} color="#fff" />
                  <Text style={styles.statCardValue}>{stats.followers}</Text>
                  <Text style={styles.statCardLabel}>Followers</Text>
                </LinearGradient>
              </Pressable>

              <Pressable 
                onPress={() => Alert.alert('Posts', `${stats.posts} posts`)} 
                style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8 }]}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Ionicons name="videocam" size={24} color="#fff" />
                  <Text style={styles.statCardValue}>{stats.posts}</Text>
                  <Text style={styles.statCardLabel}>Posts</Text>
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Button text="Edit Profile" onPress={handleEdit} />
            </View>

            {/* Modern Tabs */}
            <GridTabs />

            {/* Grid */}
            <View style={styles.grid}>
              {activeTab === 'reels' ? (
                myReels.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="videocam-outline" size={48} color={colors.grey} />
                    <Text style={styles.emptyTitle}>No reels yet</Text>
                    <Text style={styles.emptyText}>Upload your first dance reel!</Text>
                  </View>
                ) : (
                  myReels.map((r) => <ReelGridItem key={r.id} thumb={r.thumb} />)
                )
              ) : taggedReels.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="pricetag-outline" size={48} color={colors.grey} />
                  <Text style={styles.emptyTitle}>No tagged reels</Text>
                  <Text style={styles.emptyText}>When others tag you in their reels, they&apos;ll appear here</Text>
                </View>
              ) : (
                taggedReels.map((r) => <ReelGridItem key={r.id} thumb={r.thumb_uri} />)
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>You are not signed in.</Text>
            <View style={styles.actions}>
              <Button text="Sign In / Sign Up" onPress={() => router.push('/auth')} />
            </View>

            {/* Tabs even when signed-out to show structure */}
            <GridTabs />
            <View style={styles.grid}>
              {activeTab === 'reels' ? (
                <View style={styles.emptyState}>
                  <Ionicons name="lock-closed-outline" size={48} color={colors.grey} />
                  <Text style={styles.emptyTitle}>Sign in required</Text>
                  <Text style={styles.emptyText}>Sign in to see your uploaded reels</Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="lock-closed-outline" size={48} color={colors.grey} />
                  <Text style={styles.emptyTitle}>Sign in required</Text>
                  <Text style={styles.emptyText}>Sign in to see tagged reels</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <SimpleBottomSheet isVisible={settingsOpen} onClose={closeSettings}>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {renderActiveSheet()}
        </ScrollView>
      </SimpleBottomSheet>
    </View>
  );
}

function ReelGridItem({ thumb }: { thumb?: string }) {
  return (
    <Pressable
      onPress={() => Alert.alert('Reel', 'Opening reel...')}
      style={({ pressed }) => [gridStyles.item, pressed && { opacity: 0.85 }]}
    >
      {thumb ? (
        <Image source={{ uri: thumb }} style={gridStyles.media} />
      ) : (
        <View style={gridStyles.placeholder}>
          <Ionicons name="play-circle" size={32} color={colors.primary} />
        </View>
      )}
      <View style={gridStyles.overlay}>
        <Ionicons name="play" size={16} color="#fff" />
      </View>
    </Pressable>
  );
}

function SheetHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.sheetHeader}>
      <View style={styles.sheetTitleRow}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}
        <Text style={styles.sheetTitle}>{title}</Text>
      </View>
    </View>
  );
}

function SettingsItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.8 }]}>
      <View style={[styles.iconCircle, danger && { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
        <Ionicons name={icon} size={22} color={danger ? '#ff3b30' : colors.text} />
      </View>
      <Text style={[styles.itemLabel, danger && { color: '#ff3b30' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.grey} />
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function OptionRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.optionLabel, selected && { color: colors.primary }]}>{label}</Text>
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      ) : (
        <Ionicons name="ellipse-outline" size={20} color={colors.grey} />
      )}
    </Pressable>
  );
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? colors.primaryLight : '#f4f3f4'}
        trackColor={{ false: '#ccc', true: colors.primary }}
      />
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && { opacity: 0.9 }]}>
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function LinkRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.8 }]}>
      <View style={{ display: 'contents' }} />
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkValue}>{value}</Text>
      <Ionicons name="open-outline" size={18} color={colors.primary} />
    </Pressable>
  );
}

const AVATAR_SIZE = 84;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brand: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
  },
  subtitle: {
    color: colors.grey,
    marginBottom: 14,
    fontSize: 16,
  },
  profileHeader: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  username: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginTop: 8,
  },
  statCardLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    opacity: 0.9,
  },
  gridTabs: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
  },
  gridTabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  gridTabBtnActive: {
    backgroundColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
    elevation: 3,
  },
  gridTabTxt: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  gridTabTxtActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
  },
  sheetHeader: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
  },
  backText: {
    color: colors.primary,
    marginLeft: 2,
    fontWeight: '800',
  },
  sheetList: {
    marginTop: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    color: colors.text,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.grey,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderColor: colors.divider,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    gap: 10,
  },
  description: {
    color: colors.text,
  },
  optionRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  optionLabel: {
    flex: 1,
    color: colors.text,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.divider,
    gap: 8,
  },
  linkLabel: {
    width: 90,
    color: colors.grey,
    fontWeight: '700',
  },
  linkValue: {
    flex: 1,
    color: colors.primary,
    fontWeight: '800',
  },
  inlineLink: {
    paddingVertical: 10,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '800',
  },
});

const gridStyles = StyleSheet.create({
  item: {
    width: '31.5%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
});
