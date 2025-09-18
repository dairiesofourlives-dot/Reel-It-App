
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

export type DanceCategory =
  | 'Challenges'
  | 'Pantsula'
  | 'Amapiano'
  | 'Afrobeat Hybrids'
  | 'Neo-House'
  | 'Dancefloor Sounds'
  | 'Spantsula'
  | 'Sgija'
  | 'Indlamu'
  | 'Trap';

export interface User {
  id: string;
  username: string;
  avatar?: ImageSourcePropType | string;
}

export interface Reel {
  id: string;
  userId: string;
  username: string;
  mediaUri: string; // local file uri or remote placeholder
  soundName: string;
  category: DanceCategory;
  likes: number;
  createdAt: number;
  thumb?: string;
  overlayText?: string;
  filter?: 'none' | 'mono' | 'warm' | 'cool';
  aspect?: '9:16' | '1:1' | '16:9';
}

export type FriendAddPolicy = 'Everyone' | 'Friends of Friends';
export type ProfileVisibility = 'Public' | 'Only Friends';

export interface AppSettings {
  // Privacy
  friendAddPolicy: FriendAddPolicy;
  profileVisibility: ProfileVisibility;
  // Notifications
  notifyMessages: boolean;
  notifyFriendRequests: boolean;
  notifyDanceLive: boolean;
  // Content
  mutedConversations: string[]; // ids of chats - placeholder
  feedPreferences: string[]; // e.g. ['Dance','Music']
  language: string; // e.g. 'English'
  safeMode: boolean;
}

interface ReelsContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  updateProfile: (patch: Partial<Pick<User, 'username' | 'avatar'>>) => void;
  signOut: () => void;
  categories: DanceCategory[];
  reels: Reel[];
  addReel: (r: Omit<Reel, 'id' | 'likes' | 'createdAt'>) => void;
  saved: string[];
  toggleSave: (id: string) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const ReelsContext = createContext<ReelsContextType | undefined>(undefined);

export const useReels = () => {
  const ctx = useContext(ReelsContext);
  if (!ctx) {
    console.log('useReels called outside provider');
    throw new Error('useReels must be used within ReelsProvider');
  }
  return ctx;
};

const defaultCategories: DanceCategory[] = [
  'Challenges',
  'Pantsula',
  'Amapiano',
  'Afrobeat Hybrids',
  'Neo-House',
  'Dancefloor Sounds',
  'Spantsula',
  'Sgija',
  'Indlamu',
  'Trap',
];

const sampleReels: Reel[] = [
  {
    id: '1',
    userId: 'u1',
    username: 'dance.africa',
    mediaUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    soundName: 'Amapiano Groove',
    category: 'Amapiano',
    likes: 128,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    thumb: 'https://images.unsplash.com/photo-1511771760608-0f1f1d2f64c0?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    userId: 'u2',
    username: 'pantsula.core',
    mediaUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    soundName: 'Street Beat 102',
    category: 'Pantsula',
    likes: 256,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    thumb: 'https://images.unsplash.com/photo-1513617330650-6f9f2b26bc98?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    userId: 'u3',
    username: 'afro.motion',
    mediaUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    soundName: 'Afrobeat Hybrid #7',
    category: 'Afrobeat Hybrids',
    likes: 89,
    createdAt: Date.now() - 1000 * 60 * 15,
    thumb: 'https://images.unsplash.com/photo-1543030717-6081a8c0d362?q=80&w=600&auto=format&fit=crop',
  },
];

export const ReelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [reels, setReels] = useState<Reel[]>(sampleReels);
  const [saved, setSaved] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    friendAddPolicy: 'Everyone',
    profileVisibility: 'Public',
    notifyMessages: true,
    notifyFriendRequests: true,
    notifyDanceLive: true,
    mutedConversations: [],
    feedPreferences: ['Dance', 'Music', 'Comedy'],
    language: 'English',
    safeMode: true,
  });

  const addReel: ReelsContextType['addReel'] = (r) => {
    const id = `local_${Date.now()}`;
    const likes = 0;
    const createdAt = Date.now();
    const newReel: Reel = { id, likes, createdAt, ...r };
    console.log('Adding new reel', newReel);
    setReels((prev) => [newReel, ...prev]);
  };

  const toggleSave: ReelsContextType['toggleSave'] = (id) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateProfile: ReelsContextType['updateProfile'] = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      console.log('Updating profile', updated);
      return updated;
    });
  };

  const updateSettings: ReelsContextType['updateSettings'] = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const signOut = () => {
    console.log('Signing out');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateProfile,
      signOut,
      categories: defaultCategories,
      reels,
      addReel,
      saved,
      toggleSave,
      settings,
      updateSettings,
    }),
    [user, reels, saved, settings]
  );

  return <ReelsContext.Provider value={value}>{children}</ReelsContext.Provider>;
};
