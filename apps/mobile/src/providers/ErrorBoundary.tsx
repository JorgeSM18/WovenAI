import { Text } from '@woven/ui';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Minimal error boundary — placeholder for the Sentry boundary (the Sentry SDK
 * is deferred). Catches render errors so the app degrades gracefully.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: report via Telemetry.captureError once the real provider is wired.
    console.error('Unhandled error', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background p-md">
          <Text variant="headline-md">Something went wrong.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
