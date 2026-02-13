import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthScreen, DashboardScreen, TransactionsScreen } from './src/screens';

type TabName = 'dashboard' | 'transactions' | 'budgets' | 'settings';

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');

  const handleAuthSuccess = (uid: string) => {
    setUserId(uid);
    setActiveTab('dashboard');
  };

  const handleSignOut = () => {
    setUserId(null);
    setActiveTab('dashboard');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'transactions':
        return userId ? <TransactionsScreen userId={userId} onTabChange={(tab) => setActiveTab(tab as TabName)} /> : <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case 'budgets':
      case 'settings':
        return <DashboardScreen userId={userId || ''} onSignOut={handleSignOut} onTabChange={(tab) => setActiveTab(tab as TabName)} />;
      default:
        return <DashboardScreen userId={userId || ''} onSignOut={handleSignOut} onTabChange={(tab) => setActiveTab(tab as TabName)} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {userId ? (
          renderScreen()
        ) : (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
