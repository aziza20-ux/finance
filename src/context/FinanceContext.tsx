import React, { createContext, useEffect, useMemo, useState } from "react";
import { Budget, BudgetInput } from "../types/budget.types";
import { Transaction, TransactionInput } from "../types/transaction.types";
import { Pot, PotInput } from "../types/pot.types";
import { useAuth } from "../hooks/useAuth";

type FinanceContextValue = {
  transactions: Transaction[];
  budgets: Budget[];
  pots: Pot[];
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  setPots: (pots: Pot[]) => void;
  addTransaction: (transaction: TransactionInput) => void;
  removeTransaction: (transactionId: string) => void;
  clearTransactions: () => void;
  upsertBudget: (budget: BudgetInput) => void;
  removeBudget: (budgetId: string) => void;
  clearBudgets: () => void;
  addPot: (pot: PotInput) => void;
  updatePot: (potId: string, updates: Partial<Pot>) => void;
  removePot: (potId: string) => void;
  clearPots: () => void;
};

export const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

type FinanceProviderProps = {
  children: React.ReactNode;
};

export const FinanceProvider = ({ children }: FinanceProviderProps) => {
  const { user } = useAuth();

  const transactionsStorageKey = user ? `finance.transactions.${user.id}` : null;
  const budgetsStorageKey = user ? `finance.budgets.${user.id}` : null;
  const potsStorageKey = user ? `finance.pots.${user.id}` : null;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [pots, setPots] = useState<Pot[]>([]);

  const readList = <T,>(storageKey: string | null): T[] => {
    if (!storageKey) {
      return [];
    }

    const storedData = window.localStorage.getItem(storageKey);

    if (!storedData) {
      return [];
    }

    try {
      return JSON.parse(storedData) as T[];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setTransactions(readList<Transaction>(transactionsStorageKey));
  }, [transactionsStorageKey]);

  useEffect(() => {
    setBudgets(readList<Budget>(budgetsStorageKey));
  }, [budgetsStorageKey]);

  useEffect(() => {
    setPots(readList<Pot>(potsStorageKey));
  }, [potsStorageKey]);

  useEffect(() => {
    if (!transactionsStorageKey) {
      return;
    }

    window.localStorage.setItem(transactionsStorageKey, JSON.stringify(transactions));
  }, [transactions, transactionsStorageKey]);

  useEffect(() => {
    if (!budgetsStorageKey) {
      return;
    }

    window.localStorage.setItem(budgetsStorageKey, JSON.stringify(budgets));
  }, [budgets, budgetsStorageKey]);

  useEffect(() => {
    if (!potsStorageKey) {
      return;
    }

    window.localStorage.setItem(potsStorageKey, JSON.stringify(pots));
  }, [pots, potsStorageKey]);

  const normalizeDate = () => new Date().toISOString().slice(0, 10);

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      pots,
      setTransactions: (nextTransactions: Transaction[]) => {
        setTransactions(nextTransactions);
      },
      setBudgets: (nextBudgets: Budget[]) => {
        setBudgets(nextBudgets);
      },
      setPots: (nextPots: Pot[]) => {
        setPots(nextPots);
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
      addPot: (pot: PotInput) => {
        setPots((prev) => [
          {
            id: `pot-${Date.now()}`,
            name: pot.name,
            targetAmount: pot.targetAmount,
            savedAmount: pot.savedAmount ?? 0,
            theme: pot.theme,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      },
      updatePot: (potId: string, updates: Partial<Pot>) => {
        setPots((prev) =>
          prev.map((pot) =>
            pot.id === potId ? { ...pot, ...updates } : pot
          )
        );
      },
      removePot: (potId: string) => {
        setPots((prev) => prev.filter((pot) => pot.id !== potId));
      },
      clearPots: () => {
        setPots([]);
      },
    }),
    [budgets, transactions, pots]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
