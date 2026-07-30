import { StyleSheet, Text, View } from 'react-native';

// Placeholder boot screen (T-0003). Replaced by the design system + real
// screens in later tasks (S1+). Kept intentionally minimal.
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>Woven</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 2,
  },
});
