import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, supabaseMisconfigured } from './lib/supabase';
import { initSentry, setUserContext, clearUserContext, captureError } from './lib/sentry';
import ErrorBoundary from './components/ErrorBoundary';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import ProfileSetup from './components/ProfileSetup';
import DrawerNavigator from './components/DrawerNavigator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const TEAL_DARK = '#0D8F8F';

// Persisted flag — set after user completes onboarding for the first time
const ONBOARDING_KEY = 'splitwise_onboarding_done';

type Screen = 'loading' | 'onboarding' | 'signup' | 'signin' | 'profile_setup' | 'dashboard' | 'privacy' | 'terms';

const HISTORY_SCREENS: Screen[] = ['onboarding', 'signup', 'signin', 'profile_setup', 'dashboard', 'privacy', 'terms'];

// Initialise Sentry as early as possible (non-blocking)
initSentry().catch(() => {});

function AppContent() {
  const [screen, setScreen] = useState<Screen>('loading');

  const navigate = (next: Screen) => {
    setScreen(next);
    if (Platform.OS === 'web' && HISTORY_SCREENS.includes(next)) {
      window.history.pushState({ screen: next }, '', `/${next === 'onboarding' ? '' : next}`);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onPop = (e: PopStateEvent) => {
      const s: Screen = e.state?.screen ?? 'onboarding';
      setScreen(s);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      // If Supabase env vars are missing (mis-deploy), skip straight to onboarding/signin
      if (supabaseMisconfigured) {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY).catch(() => null);
        navigate(done ? 'signin' : 'onboarding');
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        if (session) {
          setUserContext(session.user.id, session.user.email);
          await checkProfileSetup(session.user.id);
        } else {
          // No session — first-time user sees onboarding, returning user goes straight to sign in
          const done = await AsyncStorage.getItem(ONBOARDING_KEY).catch(() => null);
          navigate(done ? 'signin' : 'onboarding');
        }
      } catch (err: any) {
        if (!mounted) return;
        captureError(err, { context: 'bootstrap' });
        console.error('[App] Session init failed:', err);
        navigate('onboarding');
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setUserContext(session.user.id, session.user.email);
        checkProfileSetup(session.user.id);
      } else {
        clearUserContext();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkProfileSetup = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      navigate(data?.display_name ? 'dashboard' : 'profile_setup');
    } catch (err: any) {
      captureError(err, { context: 'checkProfileSetup', userId });
      console.error('[App] Profile check failed:', err);
      navigate('profile_setup');
    }
  };

  if (screen === 'loading') {
    return (
      <View style={s.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={TEAL_DARK} />
        <Text style={s.loadingTxt}>SPLITWI$E</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar style="dark" />

      {screen === 'onboarding' && (
        <Onboarding onFinish={async () => {
          // Mark onboarding as seen so returning users skip straight to sign in
          await AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
          navigate('signup');
        }} />
      )}

      {screen === 'signup' && (
        <AuthScreen
          mode="signup"
          onBack={() => navigate('onboarding')}
          onSuccess={() => navigate('profile_setup')}
          onSwitchToSignIn={() => navigate('signin')}
          onPrivacy={() => navigate('privacy')}
          onTerms={() => navigate('terms')}
        />
      )}

      {screen === 'signin' && (
        <AuthScreen
          mode="signin"
          onBack={() => navigate('onboarding')}
          onSuccess={() => navigate('dashboard')}
          onSwitchToSignUp={() => navigate('signup')}
          onPrivacy={() => navigate('privacy')}
          onTerms={() => navigate('terms')}
        />
      )}

      {screen === 'profile_setup' && (
        <ProfileSetup
          onComplete={() => navigate('dashboard')}
          onBack={() => navigate('signin')}
        />
      )}

      {screen === 'dashboard' && (
        <DrawerNavigator
          onSignOut={() => { clearUserContext(); navigate('signin'); }}
          onEditProfile={() => navigate('profile_setup')}
        />
      )}

      {screen === 'privacy' && (
        <PrivacyPolicy onBack={() => navigate('signin')} />
      )}

      {screen === 'terms' && (
        <TermsOfService onBack={() => navigate('signin')} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  loading:    { flex: 1, backgroundColor: '#F8FEFE', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingTxt: { fontSize: 22, fontWeight: '900', color: '#0A6E6E', letterSpacing: 1.5 },
});
