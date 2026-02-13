import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { PieChart } from '../components/PieChart';
import { ProgressBar } from '../components/ProgressBar';
import { BottomNav } from '../components/BottomNav';
import { databaseService } from '../services';
import type { DashboardStats } from '../types';

interface DashboardScreenProps {
  userId: string;
  onSignOut?: () => void;
  onTabChange?: (tab: string) => void;
}

const CHART_COLORS = ['#448AFF', '#00D09E', '#FFB340', '#FF5252', '#8B5CF6', '#EC4899', '#F97316', '#6366F1'];

const MOCK_STATS: DashboardStats = {
  totalExpenses: 850,
  totalBudget: 2000,
  resteAVivre: 1150,
  expensesByCategory: [
    { categoryId: '1', categoryName: 'Alimentation', categoryIcon: 'shopping-cart', spent: 320, budget: 500, percentage: 64 },
    { categoryId: '2', categoryName: 'Transport', categoryIcon: 'truck', spent: 180, budget: 200, percentage: 90 },
    { categoryId: '3', categoryName: 'Logement', categoryIcon: 'home', spent: 200, budget: 1000, percentage: 20 },
    { categoryId: '4', categoryName: 'Loisirs', categoryIcon: 'music', spent: 150, budget: 150, percentage: 100 },
  ]
};

const LOAD_TIMEOUT_MS = 10000;

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ userId, onSignOut, onTabChange }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setError(null);
    console.log('[Dashboard] Loading stats for user:', userId);
    
    try {
      const fetchPromise = databaseService.getDashboardStats(userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), LOAD_TIMEOUT_MS)
      );
      
      const data = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('[Dashboard] Stats loaded successfully');
      setStats(data as DashboardStats);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log('[Dashboard] Error, using demo data:', errorMessage);
      setError(errorMessage);
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    console.log('[Dashboard] Mounting, loading stats...');
    loadStats(); 
  }, [userId]);

  const onRefresh = () => { setRefreshing(true); loadStats(); };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return '#FF5252';
    if (percentage >= 80) return '#FFB340';
    return '#00D09E';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
        <Text style={styles.loadingSubtext}>Connexion à Supabase...</Text>
      </SafeAreaView>
    );
  }

  const resteAVivre = stats?.resteAVivre || 0;
  const isPositive = resteAVivre >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.headerTitle}>Vos finances</Text>
        </View>
        {onSignOut && (
          <TouchableOpacity onPress={onSignOut} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D09E" />}
      >
        <View style={styles.resteCard}>
          <Text style={styles.resteLabel}>Reste à vivre</Text>
          <Text style={[styles.resteValue, { color: isPositive ? '#00D09E' : '#FF5252' }]}>
            {resteAVivre.toFixed(0)}€
          </Text>
          <Text style={styles.resteSubtext}>
            {isPositive ? 'Bonne santé financière' : 'Attention au dépassement'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFECEC' }]}>
            <Text style={[styles.statLabel, { color: '#FF5252' }]}>Dépenses</Text>
            <Text style={[styles.statValue, { color: '#FF5252' }]}>{stats?.totalExpenses.toFixed(0) || 0}€</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.statLabel, { color: '#448AFF' }]}>Budget</Text>
            <Text style={[styles.statValue, { color: '#448AFF' }]}>{stats?.totalBudget.toFixed(0) || 0}€</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Répartition</Text>
          <View style={styles.chartContainer}>
            <PieChart data={stats?.expensesByCategory || []} size={220} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Par catégorie</Text>
          <View style={styles.categoryList}>
            {stats?.expensesByCategory.map((item, index) => (
              <View key={item.categoryId} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <Feather 
                      name={item.categoryIcon as any} 
                      size={18} 
                      color={CHART_COLORS[index % CHART_COLORS.length]} 
                    />
                    <Text style={styles.categoryName}>{item.categoryName}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>{item.spent.toFixed(0)}€ / {item.budget.toFixed(0)}€</Text>
                </View>
                <ProgressBar
                  progress={item.percentage}
                  color={getStatusColor(item.percentage)}
                  height={8}
                />
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={async () => {
          try {
            const csv = await databaseService.exportToCSV(userId);
            console.log('CSV Export:', csv);
            alert('Export CSV généré (voir console)');
          } catch (error) { console.error('Export error:', error); }
        }}>
          <Text style={styles.exportButtonText}>Exporter en CSV</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav activeTab={activeTab} onTabPress={(tab) => { setActiveTab(tab); onTabChange?.(tab); }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { fontSize: 16, color: '#64748B' },
  loadingSubtext: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1E293B' },
  logoutButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  scrollView: { flex: 1 },
  resteCard: { margin: 20, marginBottom: 12, padding: 24, backgroundColor: '#FFFFFF', borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  resteLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  resteValue: { fontSize: 48, fontWeight: '700' },
  resteSubtext: { fontSize: 14, color: '#94A3B8', marginTop: 8 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 20 },
  statLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '700' },
  card: { margin: 20, marginTop: 12, padding: 20, backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 20 },
  chartContainer: { alignItems: 'center', marginVertical: 8 },
  categoryList: { gap: 16 },
  categoryItem: { gap: 8 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  categoryAmount: { fontSize: 13, color: '#64748B' },
  exportButton: { marginHorizontal: 20, padding: 16, backgroundColor: '#1E293B', borderRadius: 16, alignItems: 'center' },
  exportButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
