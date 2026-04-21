import { Transaction, TransactionInput } from "../types/transaction.types";

let transactions: Transaction[] = [
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

export const transactionService = {
  async list() {
    return Promise.resolve(transactions);
  },

  async create(input: TransactionInput) {
    const nextTransaction: Transaction = {
      id: createTransactionId(),
      title: input.title,
      amount: input.amount,
      category: input.category,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      note: input.note,
      isRecurring: input.isRecurring,
    };

    transactions = [nextTransaction, ...transactions];
    return Promise.resolve(nextTransaction);
  },

  async update(transactionId: string, input: TransactionInput) {
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

    transactions = transactions.map((transaction) =>
      transaction.id === transactionId ? updatedTransaction : transaction
    );

    return Promise.resolve(updatedTransaction);
  },

  async remove(transactionId: string) {
    transactions = transactions.filter((transaction) => transaction.id !== transactionId);
    return Promise.resolve(true);
  },
};
