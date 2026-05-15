import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { captureError } from '../lib/sentry';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureError(error, { componentStack: info.componentStack });
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={s.container}>
        <Text style={s.emoji}>⚠️</Text>
        <Text style={s.title}>Something went wrong</Text>
        <Text style={s.subtitle}>
          SPLITWI$E hit an unexpected error. Our team has been notified.
        </Text>
        {__DEV__ && this.state.error && (
          <View style={s.devBox}>
            <Text style={s.devText} numberOfLines={6}>
              {this.state.error.message}
            </Text>
          </View>
        )}
        <TouchableOpacity style={s.btn} onPress={this.reset} activeOpacity={0.85}>
          <Text style={s.btnTxt}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.reset();
            if (Platform.OS === 'web') window.location.href = '/';
          }}
        >
          <Text style={s.backLink}>← Go back to home</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F8FEFE',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  emoji:    { fontSize: 56, marginBottom: 16 },
  title:    { fontSize: 22, fontWeight: '800', color: '#062020', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#3A7070', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  devBox:   { backgroundColor: '#FFF5F5', borderRadius: 10, padding: 14, width: '100%', marginBottom: 20, borderWidth: 1, borderColor: '#FED7D7' },
  devText:  { fontSize: 12, color: '#C53030', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  btn: {
    backgroundColor: '#0D8F8F', borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 40, marginBottom: 16,
  },
  btnTxt:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  backLink: { fontSize: 14, color: '#3A7070', textDecorationLine: 'underline' },
});
