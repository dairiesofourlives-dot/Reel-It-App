
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
}

interface ReelsContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  categories: DanceCategory[];
  reels: Reel[];
  addReel: (r: Omit<Reel, 'id' | 'likes' | 'createdAt'>) => void;
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
    mediaUri: 'https://images.unsplash.com/photo-1511771760608-0f1f1d2f64c0?q=80&w=1200&auto=format&fit=crop',
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
    mediaUri: 'https://images.unsplash.com/photo-1513617330650-6f9f2b26bc98?q=80&w=1200&auto=format&fit=crop',
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
    mediaUri: 'https://images.unsplash.com/photo-1543030717-6081a8c0d362?q=80&w=1200&auto=format&fit=crop',
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

  const addReel: ReelsContextType['addReel'] = (r) => {
    const id = `local_${Date.now()}`;
    const likes = 0;
    const createdAt = Date.now();
    const newReel: Reel = { id, likes, createdAt, ...r };
    console.log('Adding new reel', newReel);
    setReels((prev) => [newReel, ...prev]);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      categories: defaultCategories,
      reels,
      addReel,
    }),
    [user, reels]
  );

  return <ReelsContext.Provider value={value}>{children}</ReelsContext.Provider>;
};
