import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0a1420',
          },
          headerTintColor: '#00d4ff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
          },
        }}
      />
    </>
  );
}
