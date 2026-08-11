import { Button, Input, Text } from '@woven/ui';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { authService } from '../src/auth/client';
import { useAuth } from '../src/providers/AuthProvider';

/**
 * Minimal email + password auth (T-0308). Functional stub so the app is testable;
 * the designed auth UI is still PD-01. Email confirmation should be off on the
 * project so sign-up returns a session immediately.
 */
export default function LoginScreen() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Redirect href="/home" />;

  const submit = async () => {
    if (email.trim().length === 0 || password.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'signin') {
        await authService.signIn(email.trim(), password);
      } else {
        const session = await authService.signUp(email.trim(), password);
        if (!session) setMessage('Account created — check your email to confirm, then sign in.');
      }
      // On success the auth listener flips isAuthenticated and this screen redirects.
    } catch {
      setMessage(mode === 'signin' ? 'Wrong email or password.' : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-lg p-lg">
        <Text variant="display-lg" className="text-on-surface">
          Woven
        </Text>
        <Text variant="body-md" className="text-on-surface-variant">
          {mode === 'signin' ? 'Sign in to your wardrobe.' : 'Create your account.'}
        </Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {message ? (
          <Text variant="body-md" className="text-error">
            {message}
          </Text>
        ) : null}

        <Button
          label={busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          disabled={busy || email.trim().length === 0 || password.length === 0}
          onPress={() => {
            void submit();
          }}
        />
        <Button
          label={mode === 'signin' ? 'Create an account instead' : 'I already have an account'}
          variant="secondary"
          disabled={busy}
          onPress={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setMessage(null);
          }}
        />
      </View>
    </ScrollView>
  );
}
