
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReelsProvider } from '../state/reelsContext';

export default function RootLayout() {
  useEffect(() => {
    setupErrorLogging();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ReelsProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'default' }} />
        </ReelsProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
