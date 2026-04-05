import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import ProfileSetup from './components/ProfileSetup';
import DrawerNavigator from './components/DrawerNavigator';

const TEAL_DARK = '#0D8F8F';

type Screen = 'loading' | 'landing' | 'onboarding' | 'signup' | 'signin' | 'profile_setup' | 'dashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkProfileSetup(session.user.id);
      } else {
        setScreen('landing');
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
      setScreen('dashboard');
    } else {
      setScreen('profile_setup');
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
          onGetStarted={() => setScreen('onboarding')}
          onSignIn={() => setScreen('signin')}
        />
      )}
      {screen === 'onboarding' && (
        <Onboarding onFinish={() => setScreen('signup')} />
      )}
      {screen === 'signup' && (
        <AuthScreen
          mode="signup"
          onBack={() => setScreen('onboarding')}
          onSuccess={() => setScreen('profile_setup')}
          onSwitchToSignIn={() => setScreen('signin')}
        />
      )}
      {screen === 'signin' && (
        <AuthScreen
          mode="signin"
          onBack={() => setScreen('onboarding')}
          onSuccess={() => setScreen('dashboard')}
          onSwitchToSignUp={() => setScreen('signup')}
        />
      )}
      {screen === 'profile_setup' && (
        <ProfileSetup
          onComplete={() => setScreen('dashboard')}
          onBack={() => setScreen('signin')}
        />
      )}
      {screen === 'dashboard' && (
        <DrawerNavigator onSignOut={() => setScreen('landing')} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  loading:    { flex: 1, backgroundColor: '#F8FEFE', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingTxt: { fontSize: 22, fontWeight: '900', color: '#0A6E6E', letterSpacing: 1.5 },
});