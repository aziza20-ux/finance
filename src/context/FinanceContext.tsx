import React, { createContext, useEffect, useMemo, useState } from "react";
import { Budget, BudgetInput } from "../types/budget.types";
import { Transaction, TransactionInput } from "../types/transaction.types";

type FinanceContextValue = {
  transactions: Transaction[];
  budgets: Budget[];
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  addTransaction: (transaction: TransactionInput) => void;
  removeTransaction: (transactionId: string) => void;
  clearTransactions: () => void;
  upsertBudget: (budget: BudgetInput) => void;
  removeBudget: (budgetId: string) => void;
  clearBudgets: () => void;
};

export const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

type FinanceProviderProps = {
  children: React.ReactNode;
};

export const FinanceProvider = ({ children }: FinanceProviderProps) => {
  const storageKey = "finance.transactions";
  const budgetsStorageKey = "finance.budgets";

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const storedTransactions = window.localStorage.getItem(storageKey);

    if (!storedTransactions) {
      return [];
    }

    try {
      return JSON.parse(storedTransactions) as Transaction[];
    } catch {
      return [];
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const storedBudgets = window.localStorage.getItem(budgetsStorageKey);

    if (!storedBudgets) {
      return [];
    }

    try {
      return JSON.parse(storedBudgets) as Budget[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    window.localStorage.setItem(budgetsStorageKey, JSON.stringify(budgets));
  }, [budgets]);

  const normalizeDate = () => new Date().toISOString().slice(0, 10);

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      setTransactions: (nextTransactions: Transaction[]) => {
        setTransactions(nextTransactions);
      },
      setBudgets: (nextBudgets: Budget[]) => {
        setBudgets(nextBudgets);
      },
      addTransaction: (transaction: TransactionInput) => {
        setTransactions((prev) => [
          {
            id: `txn-${Date.now()}`,
            title: transaction.title,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date ?? normalizeDate(),
            note: transaction.note,
            isRecurring: transaction.isRecurring,
          },
          ...prev,
        ]);
      },
      removeTransaction: (transactionId: string) => {
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId));
      },
      clearTransactions: () => {
        setTransactions([]);
      },
      upsertBudget: (budget: BudgetInput) => {
        setBudgets((prev) => {
          const existingIndex = prev.findIndex((item) => item.category.toLowerCase() === budget.category.toLowerCase());
          const nextBudget: Budget = {
            id: existingIndex >= 0 ? prev[existingIndex].id : `budget-${Date.now()}`,
            category: budget.category,
            limit: budget.limit,
            spent: budget.spent ?? 0,
            month: budget.month ?? new Date().toISOString().slice(0, 7),
          };

          if (existingIndex === -1) {
            return [nextBudget, ...prev];
          }

          return prev.map((item, index) => (index === existingIndex ? nextBudget : item));
        });
      },
      removeBudget: (budgetId: string) => {
        setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
      },
      clearBudgets: () => {
        setBudgets([]);
      },
    }),
    [budgets, transactions]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
