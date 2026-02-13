import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/screens';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <DashboardScreen userId={DEMO_USER_ID} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
