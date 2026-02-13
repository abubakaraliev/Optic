import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

interface BottomNavProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}

const TABS: TabItem[] = [
  { key: 'dashboard', label: 'Accueil', icon: 'home' },
  { key: 'transactions', label: 'Transactions', icon: 'list' },
  { key: 'budgets', label: 'Budgets', icon: 'pie-chart' },
  { key: 'settings', label: 'Paramètres', icon: 'settings' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <Feather 
            name={tab.icon} 
            size={20} 
            color={activeTab === tab.key ? '#00D09E' : '#94A3B8'} 
          />
          <Text style={[styles.label, activeTab === tab.key && styles.activeLabel]}>
            {tab.label}
          </Text>
          {activeTab === tab.key && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 24,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  label: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#00D09E',
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    backgroundColor: '#00D09E',
    borderRadius: 2,
  },
});
