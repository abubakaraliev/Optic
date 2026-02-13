import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { PieChart } from '../components/PieChart';
import { databaseService } from '../services';
import type { DashboardStats, CategoryExpense } from '../types';

interface DashboardScreenProps {
  userId: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

const MOCK_STATS: DashboardStats = {
  totalExpenses: 850,
  totalBudget: 2000,
  resteAVivre: 1150,
  expensesByCategory: [
    { categoryId: '1', categoryName: 'Alimentation', categoryIcon: '🍎', spent: 320, budget: 500, percentage: 64 },
    { categoryId: '2', categoryName: 'Transport', categoryIcon: '🚗', spent: 180, budget: 200, percentage: 90 },
    { categoryId: '3', categoryName: 'Logement', categoryIcon: '🏠', spent: 200, budget: 1000, percentage: 20 },
    { categoryId: '4', categoryName: 'Loisirs', categoryIcon: '🎮', spent: 150, budget: 150, percentage: 100 },
  ]
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ userId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDemo] = useState(userId === '00000000-0000-0000-0000-000000000000');

  const loadStats = async () => {
    try {
      const data = await databaseService.getDashboardStats(userId);
      setStats(data);
    } catch (error) {
      console.log('Using demo data (Supabase not configured)');
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const getBudgetAlert = (expense: CategoryExpense) => {
    if (expense.budget > 0 && expense.percentage >= 80) {
      return { color: '#FF6B6B', message: '⚠️ Alerte budget' };
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Répartition des dépenses</Text>
        <View style={styles.chartContainer}>
          <PieChart data={stats?.expensesByCategory || []} size={200} />
        </View>
        <View style={styles.legend}>
          {stats?.expensesByCategory.map((item, index) => {
            const alert = getBudgetAlert(item);
            return (
              <View key={item.categoryId} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS[index % COLORS.length] }]} />
                <Text style={styles.legendText}>
                  {item.categoryIcon} {item.categoryName}
                </Text>
                <Text style={[styles.legendAmount, alert && { color: alert.color }]}>
                  {item.spent.toFixed(0)}€
                </Text>
                {alert && <Text style={[styles.alertText, { color: alert.color }]}>{alert.message}</Text>}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.expensesCard]}>
          <Text style={styles.statLabel}>Total Dépenses</Text>
          <Text style={styles.statValue}>{stats?.totalExpenses.toFixed(2) || 0}€</Text>
        </View>
        <View style={[styles.statCard, styles.budgetCard]}>
          <Text style={styles.statLabel}>Budget Total</Text>
          <Text style={styles.statValue}>{stats?.totalBudget.toFixed(2) || 0}€</Text>
        </View>
      </View>

      <View style={[styles.card, styles.resteCard]}>
        <Text style={styles.cardTitle}>Reste à vivre</Text>
        <Text style={[
          styles.resteValue,
          { color: (stats?.resteAVivre || 0) >= 0 ? '#4ECDC4' : '#FF6B6B' }
        ]}>
          {stats?.resteAVivre.toFixed(2) || 0}€
        </Text>
        <Text style={styles.resteSubtext}>
          {(stats?.resteAVivre || 0) >= 0 
            ? '💰 Vous êtes dans les verts !' 
            : '⚠️ Dépasse le budget'}
        </Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={async () => {
        try {
          const csv = await databaseService.exportToCSV(userId);
          console.log('CSV Export:', csv);
          alert('Export CSV généré (voir console)');
        } catch (error) {
          console.error('Export error:', error);
        }
      }}>
        <Text style={styles.exportButtonText}>📥 Exporter en CSV</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#4ECDC4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  legend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  alertText: {
    fontSize: 10,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  expensesCard: {
    backgroundColor: '#FF6B6B',
  },
  budgetCard: {
    backgroundColor: '#45B7D1',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  resteCard: {
    alignItems: 'center',
  },
  resteValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  resteSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  exportButton: {
    backgroundColor: '#4ECDC4',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
