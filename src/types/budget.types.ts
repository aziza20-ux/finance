export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface BudgetInput {
  category: string;
  limit: number;
  spent?: number;
  month?: string;
}

export interface BudgetProgress {
  percentUsed: number;
  remaining: number;
}
