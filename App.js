import { Buffer } from 'buffer';
global.Buffer = Buffer;
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { SettingsProvider } from './contexts/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep splash screen visible until fonts are ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter: require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SettingsProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SettingsProvider>
      </View>
    </GestureHandlerRootView>
  );
}