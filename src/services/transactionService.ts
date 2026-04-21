import { Transaction, TransactionInput } from "../types/transaction.types";

const authStorageKey = "finance.auth.user";

const defaultTransactions: Transaction[] = [
  {
    id: "txn-1",
    title: "Salary",
    amount: 4200,
    category: "Income",
    date: "2026-04-01",
    note: "Monthly salary",
  },
  {
    id: "txn-2",
    title: "Rent",
    amount: -1400,
    category: "Housing",
    date: "2026-04-03",
    note: "Monthly rent payment",
    isRecurring: true,
  },
  {
    id: "txn-3",
    title: "Groceries",
    amount: -220,
    category: "Food",
    date: "2026-04-06",
  },
  {
    id: "txn-4",
    title: "Streaming Subscription",
    amount: -18,
    category: "Entertainment",
    date: "2026-04-08",
    isRecurring: true,
  },
];

const createTransactionId = () => `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getActiveUserId = () => {
  const rawUser = window.localStorage.getItem(authStorageKey);

  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as { id?: string };
    return parsed.id ?? null;
  } catch {
    return null;
  }
};

const getTransactionsKey = (userId: string) => `finance.transactions.${userId}`;

const getTransactionsForUser = (userId: string): Transaction[] => {
  const storageKey = getTransactionsKey(userId);
  const storedTransactions = window.localStorage.getItem(storageKey);

  if (!storedTransactions) {
    const initialData = userId === "demo-user" ? defaultTransactions : [];
    window.localStorage.setItem(storageKey, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(storedTransactions) as Transaction[];
  } catch {
    return [];
  }
};

const setTransactionsForUser = (userId: string, nextTransactions: Transaction[]) => {
  window.localStorage.setItem(getTransactionsKey(userId), JSON.stringify(nextTransactions));
};

export const transactionService = {
  async list() {
    const userId = getActiveUserId();
    return Promise.resolve(userId ? getTransactionsForUser(userId) : []);
  },

  async create(input: TransactionInput) {
    const userId = getActiveUserId();

    if (!userId) {
      throw new Error("You must be logged in to create transactions.");
    }

    const transactions = getTransactionsForUser(userId);

    const nextTransaction: Transaction = {
      id: createTransactionId(),
      title: input.title,
      amount: input.amount,
      category: input.category,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      note: input.note,
      isRecurring: input.isRecurring,
    };

    setTransactionsForUser(userId, [nextTransaction, ...transactions]);
    return Promise.resolve(nextTransaction);
  },

  async update(transactionId: string, input: TransactionInput) {
    const userId = getActiveUserId();

    if (!userId) {
      throw new Error("You must be logged in to update transactions.");
    }

    const transactions = getTransactionsForUser(userId);
    const previousTransaction = transactions.find((transaction) => transaction.id === transactionId);

    if (!previousTransaction) {
      throw new Error("Transaction not found.");
    }

    const updatedTransaction: Transaction = {
      ...previousTransaction,
      title: input.title,
      amount: input.amount,
      category: input.category,
      date: input.date ?? previousTransaction.date,
      note: input.note,
      isRecurring: input.isRecurring,
    };

    const nextTransactions = transactions.map((transaction) =>
      transaction.id === transactionId ? updatedTransaction : transaction
    );
    setTransactionsForUser(userId, nextTransactions);

    return Promise.resolve(updatedTransaction);
  },

  async remove(transactionId: string) {
    const userId = getActiveUserId();

    if (!userId) {
      throw new Error("You must be logged in to remove transactions.");
    }

    const transactions = getTransactionsForUser(userId);
    setTransactionsForUser(
      userId,
      transactions.filter((transaction) => transaction.id !== transactionId)
    );

    return Promise.resolve(true);
  },
};
