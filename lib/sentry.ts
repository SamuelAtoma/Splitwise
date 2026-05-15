import { Platform } from 'react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let Sentry: any = null;

export async function initSentry() {
  if (!DSN) return;
  try {
    if (Platform.OS === 'web') {
      const mod = await import('@sentry/react');
      Sentry = mod;
      mod.init({
        dsn: DSN,
        environment: __DEV__ ? 'development' : 'production',
        tracesSampleRate: __DEV__ ? 0 : 0.2,
        beforeSend(event) {
          if (__DEV__) return null;
          return event;
        },
      });
    }
  } catch (e) {
    console.warn('[Sentry] Failed to initialise:', e);
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (__DEV__) {
    console.error('[captureError]', error, context);
    return;
  }
  try {
    Sentry?.captureException(error, { extra: context });
  } catch {
    // never let error reporting crash the app
  }
}

export function captureMessage(msg: string, level: 'info' | 'warning' | 'error' = 'info') {
  try {
    Sentry?.captureMessage(msg, level);
  } catch {
    // never let error reporting crash the app
  }
}

export function setUserContext(userId: string, email?: string) {
  try {
    Sentry?.setUser({ id: userId, email });
  } catch {
    // never let error reporting crash the app
  }
}

export function clearUserContext() {
  try {
    Sentry?.setUser(null);
  } catch {
    // never let error reporting crash the app
  }
}
