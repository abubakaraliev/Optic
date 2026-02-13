import { supabase } from './supabase';
import type { Category, Transaction, DashboardStats, CategoryExpense, DateRange } from '../types';

export const databaseService = {
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getTransactions(userId: string, dateRange?: DateRange): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('date', dateRange.start.toISOString().split('T')[0])
        .lte('date', dateRange.end.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getDashboardStats(userId: string, month?: Date): Promise<DashboardStats> {
    const targetMonth = month || new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

    const [categories, transactions] = await Promise.all([
      this.getCategories(userId),
      this.getTransactions(userId, { start: startOfMonth, end: endOfMonth })
    ]);

    const expensesByCategory: CategoryExpense[] = categories.map(cat => {
      const catTransactions = transactions.filter(t => t.category_id === cat.id);
      const spent = catTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const budget = cat.budget_limit || 0;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        spent,
        budget,
        percentage: budget > 0 ? (spent / budget) * 100 : 0
      };
    }).filter(c => c.spent > 0 || c.budget > 0);

    const totalExpenses = expensesByCategory.reduce((sum, c) => sum + c.spent, 0);
    const totalBudget = categories.reduce((sum, c) => sum + (c.budget_limit || 0), 0);

    return {
      totalExpenses,
      totalBudget,
      resteAVivre: totalBudget - totalExpenses,
      expensesByCategory: expensesByCategory.sort((a, b) => b.spent - a.spent)
    };
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async exportToCSV(userId: string): Promise<string> {
    const transactions = await this.getTransactions(userId);
    const categories = await this.getCategories(userId);
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    
    const headers = ['Date', 'Label', 'Amount', 'Category', 'Payment Method', 'Pending'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.label}"`,
      t.amount.toString(),
      categoryMap.get(t.category_id) || 'Unknown',
      t.payment_method,
      t.is_pending ? 'Yes' : 'No'
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
