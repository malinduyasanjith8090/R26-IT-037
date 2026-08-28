import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import * as Font from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  ChildProvider,
  useChild,
} from '../context/ChildContext';

import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

// Sound Services
import SoundService from '../services/SoundService';
import WebSoundService from '../services/WebSoundService';

// Prevent splash screen from automatically hiding
SplashScreen.preventAutoHideAsync();

/**
 * ---------------------------------------------------------
 * Root Navigator
 * ---------------------------------------------------------
 *
 * This component is inside ChildProvider, so it can access
 * parentProfile and authentication state.
 */
function RootNavigator() {
  const {
    parentProfile,
    isHydrated,
  } = useChild();

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait until saved authentication state has been restored.
    if (!isHydrated) {
      return;
    }

    const currentRoute = segments[0];

    /**
     * -------------------------------------------------------
     * AUTHENTICATED USER
     * -------------------------------------------------------
     */
    if (parentProfile) {
      // Already inside the application.
      // Do nothing.
      if (currentRoute === '(tabs)') {
        return;
      }

      // Only move authenticated users from public/auth screens
      // into the application.
      if (
        currentRoute === 'login' ||
        currentRoute === 'signup' ||
        currentRoute === 'welcome' 
       
      ) {
        console.log(
          '[RootNavigator] Parent authenticated - entering app'
        );

        router.replace('/(tabs)');
      }

      return;
    }

    /**
     * -------------------------------------------------------
     * NOT AUTHENTICATED
     * -------------------------------------------------------
     *
     * If there is no parent profile and the user somehow
     * reaches the protected tabs, send them to login.
     */
    if (currentRoute === '(tabs)') {
      console.log(
        '[RootNavigator] No authenticated parent - returning to login'
      );

      router.replace('/login');
    }
  }, [parentProfile, isHydrated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,

        contentStyle: {
          backgroundColor: 'transparent',
        },

        animation: 'slide_from_right',
      }}
    >
      {/* Home */}
      <Stack.Screen
        name="hello"
        options={{
          title: 'Home',
          animation: 'fade',
        }}
      />

      {/* Welcome */}
      <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome',
          animation: 'fade_from_bottom',
        }}
      />

      {/* Onboarding */}
      <Stack.Screen
        name="onboarding"
        options={{
          title: 'Onboarding',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Login */}
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          animation: 'slide_from_right',
        }}
      />

      {/* Signup */}
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          animation: 'slide_from_right',
        }}
      />

      {/* Main Application */}
      <Stack.Screen
        name="(tabs)"
        options={{
          title: 'Main',
          animation: 'fade',
        }}
      />

      {/* Settings */}
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Profile */}
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

/**
 * ---------------------------------------------------------
 * Root Layout
 * ---------------------------------------------------------
 */
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded, setFontsLoaded] =
    useState(false);

  const [soundsInitialized, setSoundsInitialized] =
    useState(false);

  /**
   * -------------------------------------------------------
   * LOAD FONTS
   * -------------------------------------------------------
   */
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
        console.warn(
          'Error loading fonts:',
          error
        );

        // Continue even if fonts fail.
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  /**
   * -------------------------------------------------------
   * INITIALIZE SOUND SERVICE
   * -------------------------------------------------------
   */
  useEffect(() => {
    async function initSounds() {
      try {
        if (Platform.OS === 'web') {
          await WebSoundService.initialize();

          console.log(
            'Web Sound Service initialized'
          );
        } else {
          await SoundService.initialize();

          console.log(
            'Mobile Sound Service initialized'
          );
        }

        setSoundsInitialized(true);
      } catch (error) {
        console.warn(
          'Sound service initialization failed:',
          error
        );

        // Continue even if sound initialization fails.
        setSoundsInitialized(true);
      }
    }

    initSounds();
  }, []);

  /**
   * -------------------------------------------------------
   * HIDE SPLASH SCREEN
   * -------------------------------------------------------
   */
  useEffect(() => {
    async function hideSplash() {
      if (
        fontsLoaded &&
        soundsInitialized
      ) {
        setAppIsReady(true);

        await SplashScreen.hideAsync();
      }
    }

    hideSplash();
  }, [
    fontsLoaded,
    soundsInitialized,
  ]);

  /**
   * -------------------------------------------------------
   * CLEANUP SOUND SERVICE
   * -------------------------------------------------------
   */
  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') {
        const unloadSounds =
          (SoundService as any).unloadSounds;

        if (
          typeof unloadSounds === 'function'
        ) {
          unloadSounds().catch(console.error);
        }
      }
    };
  }, []);

  /**
   * -------------------------------------------------------
   * WAIT FOR APP INITIALIZATION
   * -------------------------------------------------------
   */
  if (!appIsReady) {
    return null;
  }

  /**
   * -------------------------------------------------------
   * PROVIDER HIERARCHY
   * -------------------------------------------------------
   *
   * ChildProvider MUST wrap RootNavigator because
   * RootNavigator uses useChild().
   */
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ChildProvider>
            <RootNavigator />
          </ChildProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}