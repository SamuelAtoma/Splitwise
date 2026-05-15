import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { initSentry, setUserContext, clearUserContext, captureError } from './lib/sentry';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import ProfileSetup from './components/ProfileSetup';
import DrawerNavigator from './components/DrawerNavigator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const TEAL_DARK = '#0D8F8F';

type Screen = 'loading' | 'landing' | 'onboarding' | 'signup' | 'signin' | 'profile_setup' | 'dashboard' | 'privacy' | 'terms';

const HISTORY_SCREENS: Screen[] = ['landing', 'onboarding', 'signup', 'signin', 'profile_setup', 'dashboard', 'privacy', 'terms'];

// Initialise Sentry as early as possible (non-blocking)
initSentry().catch(() => {});

function AppContent() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [initError, setInitError] = useState<string | null>(null);

  const navigate = (next: Screen) => {
    setScreen(next);
    if (Platform.OS === 'web' && HISTORY_SCREENS.includes(next)) {
      window.history.pushState({ screen: next }, '', `/${next === 'landing' ? '' : next}`);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onPop = (e: PopStateEvent) => {
      const s: Screen = e.state?.screen ?? 'landing';
      setScreen(s);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;
        if (session) {
          setUserContext(session.user.id, session.user.email);
          await checkProfileSetup(session.user.id);
        } else {
          navigate('landing');
        }
      } catch (err: any) {
        if (!mounted) return;
        captureError(err, { context: 'bootstrap' });
        console.error('[App] Session init failed:', err);
        // Don't block the user — send them to landing so they can still use the app
        navigate('landing');
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
      if (data?.display_name) {
        navigate('dashboard');
      } else {
        navigate('profile_setup');
      }
    } catch (err: any) {
      captureError(err, { context: 'checkProfileSetup', userId });
      console.error('[App] Profile check failed:', err);
      // Fail open — send to profile_setup so user can complete their profile
      navigate('profile_setup');
    }
  };

  if (screen === 'loading') {
    return (
      <View style={s.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={TEAL_DARK} />
        <Text style={s.loadingTxt}>SPLITWI$E</Text>
        {initError && <Text style={s.errorTxt}>{initError}</Text>}
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      {screen === 'landing' && (
        <LandingPage
          onGetStarted={() => navigate('onboarding')}
          onSignIn={() => navigate('signin')}
          onPrivacy={() => navigate('privacy')}
          onTerms={() => navigate('terms')}
        />
      )}
      {screen === 'onboarding' && (
        <Onboarding onFinish={() => navigate('signup')} />
      )}
      {screen === 'signup' && (
        <AuthScreen
          mode="signup"
          onBack={() => navigate('onboarding')}
          onSuccess={() => navigate('profile_setup')}
          onSwitchToSignIn={() => navigate('signin')}
        />
      )}
      {screen === 'signin' && (
        <AuthScreen
          mode="signin"
          onBack={() => navigate('onboarding')}
          onSuccess={() => navigate('dashboard')}
          onSwitchToSignUp={() => navigate('signup')}
        />
      )}
      {screen === 'profile_setup' && (
        <ProfileSetup
          onComplete={() => navigate('dashboard')}
          onBack={() => navigate('signin')}
        />
      )}
      {screen === 'dashboard' && (
        <DrawerNavigator onSignOut={() => { clearUserContext(); navigate('landing'); }} onEditProfile={() => navigate('profile_setup')} />
      )}
      {screen === 'privacy' && (
        <PrivacyPolicy onBack={() => navigate('landing')} />
      )}
      {screen === 'terms' && (
        <TermsOfService onBack={() => navigate('landing')} />
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
  errorTxt:   { fontSize: 13, color: '#E53E3E', textAlign: 'center', paddingHorizontal: 24 },
});
