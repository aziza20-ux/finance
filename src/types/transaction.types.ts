export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  isRecurring?: boolean;
}

export interface TransactionInput {
  title: string;
  amount: number;
  category: string;
  date?: string;
  note?: string;
  isRecurring?: boolean;
}

export interface TransactionTotals {
  income: number;
  expense: number;
  balance: number;
}
