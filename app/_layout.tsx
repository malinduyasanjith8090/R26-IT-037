// app/_layout.tsx (Complete with fonts and sound service)
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

// Sound Service Imports (create these files first)
import SoundService from '../services/SoundService';
import WebSoundService from '../services/WebSoundService';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [soundsInitialized, setSoundsInitialized] = useState(false);

  // Initialize Fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Poppins-Regular': Poppins_400Regular,
          'Poppins-Medium': Poppins_500Medium,
          'Poppins-SemiBold': Poppins_600SemiBold,
          'Poppins-Bold': Poppins_700Bold,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Error loading fonts:', error);
        setFontsLoaded(true); // Continue even if fonts fail
      }
    }
    loadFonts();
  }, []);

  // Initialize Sound Service
  useEffect(() => {
    async function initSounds() {
      try {
        if (Platform.OS === 'web') {
          await WebSoundService.initialize();
          console.log('Web Sound Service initialized');
        } else {
          await SoundService.initialize();
          console.log('Mobile Sound Service initialized');
        }
        setSoundsInitialized(true);
      } catch (error) {
        console.warn('Sound service initialization failed:', error);
        setSoundsInitialized(true); // Continue even if sounds fail
      }
    }
    initSounds();
  }, []);

  // Hide splash screen when everything is ready
  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded && soundsInitialized) {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
  }, [fontsLoaded, soundsInitialized]);

  // Cleanup sounds on app close (for mobile)
  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') {
        const unloadSounds = (SoundService as any).unloadSounds;
        if (typeof unloadSounds === 'function') {
          unloadSounds().catch(console.error);
        }
      }
    };
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{ 
                title: 'Home',
                animation: 'fade',
              }} 
            />
            <Stack.Screen 
              name="welcome" 
              options={{ 
                title: 'Welcome',
                animation: 'fade_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="onboarding" 
              options={{ 
                title: 'Onboarding',
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="login" 
              options={{ 
                title: 'Login',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="signup" 
              options={{ 
                title: 'Sign Up',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                title: 'Main',
                animation: 'fade',
              }} 
            />
            <Stack.Screen 
              name="settings" 
              options={{ 
                title: 'Settings',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="profile" 
              options={{ 
                title: 'Profile',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }} 
            />
          </Stack>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}