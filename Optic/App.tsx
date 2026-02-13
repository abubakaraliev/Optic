import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthScreen, DashboardScreen } from './src/screens';

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);

  const handleAuthSuccess = (uid: string) => {
    setUserId(uid);
  };

  const handleSignOut = () => {
    setUserId(null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {userId ? (
          <DashboardScreen userId={userId} onSignOut={handleSignOut} />
        ) : (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
