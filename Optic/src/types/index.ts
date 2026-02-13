export interface Category {
  id: string;
  name: string;
  icon: string;
  budget_limit: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Transaction {
  id: string;
  created_at: string;
  date: string;
  label: string;
  amount: number;
  category_id: string;
  payment_method: PaymentMethod;
  is_pending: boolean;
  user_id: string;
  category?: Category;
}

export type PaymentMethod = 
  | 'cash' 
  | 'credit_card' 
  | 'debit_card' 
  | 'bank_transfer' 
  | 'check' 
  | 'other';

export interface DashboardStats {
  totalExpenses: number;
  totalBudget: number;
  resteAVivre: number;
  expensesByCategory: CategoryExpense[];
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  spent: number;
  budget: number;
  percentage: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}
