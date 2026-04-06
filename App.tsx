import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import ProfileSetup from './components/ProfileSetup';
import DrawerNavigator from './components/DrawerNavigator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const TEAL_DARK = '#0D8F8F';

type Screen = 'loading' | 'landing' | 'onboarding' | 'signup' | 'signin' | 'profile_setup' | 'dashboard' | 'privacy' | 'terms';

// Screens that should be pushed into browser history
const HISTORY_SCREENS: Screen[] = ['landing', 'onboarding', 'signup', 'signin', 'profile_setup', 'dashboard', 'privacy', 'terms'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');

  // Navigate and push browser history on web
  const navigate = (next: Screen) => {
    setScreen(next);
    if (Platform.OS === 'web' && HISTORY_SCREENS.includes(next)) {
      window.history.pushState({ screen: next }, '', `/${next === 'landing' ? '' : next}`);
    }
  };

  // Listen to browser back/forward buttons
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkProfileSetup(session.user.id);
      } else {
        navigate('landing');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkProfileSetup(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkProfileSetup = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle();
    if (data?.display_name) {
      navigate('dashboard');
    } else {
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
        <DrawerNavigator onSignOut={() => navigate('landing')} onEditProfile={() => navigate('profile_setup')} />
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

const s = StyleSheet.create({
  root:       { flex: 1 },
  loading:    { flex: 1, backgroundColor: '#F8FEFE', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingTxt: { fontSize: 22, fontWeight: '900', color: '#0A6E6E', letterSpacing: 1.5 },
});
