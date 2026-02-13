import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BottomNav } from '../components/BottomNav';
import { databaseService } from '../services';
import type { Transaction } from '../types';

interface TransactionsScreenProps {
  userId: string;
  onTabChange?: (tab: string) => void;
}

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Espèces' },
  { key: 'credit_card', label: 'Carte de crédit' },
  { key: 'debit_card', label: 'Carte bancaire' },
  { key: 'bank_transfer', label: 'Virement' },
  { key: 'other', label: 'Autre' },
];

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ userId, onTabChange }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    label: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'other' as const,
  });

  const loadTransactions = async () => {
    try {
      const data = await databaseService.getTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.log('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, [userId]);

  const handleAddTransaction = async () => {
    if (!newTransaction.label || !newTransaction.amount) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await databaseService.createTransaction({
        user_id: userId,
        label: newTransaction.label,
        amount: -Math.abs(parseFloat(newTransaction.amount)),
        date: newTransaction.date,
        payment_method: newTransaction.payment_method,
        category_id: '00000000-0000-0000-0000-000000000001',
        is_pending: false,
      });
      setShowAddModal(false);
      setNewTransaction({ label: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'other' });
      loadTransactions();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la transaction');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}€`;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: item.amount < 0 ? '#FEE2E2' : '#DCFCE7' }]}>
          <Feather name={item.amount < 0 ? 'arrow-up-right' : 'arrow-down-left'} size={18} color={item.amount < 0 ? '#EF4444' : '#22C55E'} />
        </View>
        <View>
          <Text style={styles.transactionLabel}>{item.label}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)} • {(item as any).category?.name || 'Autre'}</Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: item.amount < 0 ? '#EF4444' : '#22C55E' }]}>
        {formatAmount(item.amount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.headerSubtitle}>{transactions.length} opération{transactions.length !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chargement...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>Aucune transaction</Text>
          <Text style={styles.emptySubtext}>Appuyez sur + pour en ajouter une</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle transaction</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Libellé</Text>
                <TextInput
                  style={styles.input}
                  value={newTransaction.label}
                  onChangeText={(text) => setNewTransaction({ ...newTransaction, label: text })}
                  placeholder="Ex: Courses, Transport..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant (€)</Text>
                <TextInput
                  style={styles.input}
                  value={newTransaction.amount}
                  onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Méthode de paiement</Text>
                <View style={styles.paymentMethods}>
                  {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                      key={method.key}
                      style={[styles.paymentMethod, newTransaction.payment_method === method.key && styles.paymentMethodActive]}
                      onPress={() => setNewTransaction({ ...newTransaction, payment_method: method.key as any })}
                    >
                      <Text style={[styles.paymentMethodText, newTransaction.payment_method === method.key && styles.paymentMethodTextActive]}>
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddTransaction}>
                <Text style={styles.submitButtonText}>Ajouter la transaction</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="transactions" onTabPress={(tab) => onTabChange?.(tab)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  list: { padding: 16 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  transactionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transactionLabel: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  transactionDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#64748B', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  paymentMethods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentMethod: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  paymentMethodActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  paymentMethodText: { fontSize: 13, color: '#64748B' },
  paymentMethodTextActive: { color: '#FFFFFF', fontWeight: '600' },
  submitButton: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
