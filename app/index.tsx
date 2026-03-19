import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'JetBRAIN' }} />
      <View style={styles.content}>
        <Text style={styles.title}>JETBRAIN</Text>
        <Text style={styles.subtitle}>CORONA CONTROL ULTIMATE</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>PHASE 1: INITIALISIERUNG AKTIV</Text>
          <Text style={styles.subText}>Cloud Development Mode · React 19 · R3F</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030608',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00d4ff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#00ffcc',
    letterSpacing: 6,
    marginTop: 8,
  },
  statusBox: {
    marginTop: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  statusText: {
    color: '#00d4ff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subText: {
    color: '#7a9ab5',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
});
