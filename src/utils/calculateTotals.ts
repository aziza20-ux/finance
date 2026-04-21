import { Transaction, TransactionTotals } from "../types/transaction.types";

export const calculateTotals = (transactions: Transaction[]): TransactionTotals => {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.amount >= 0) {
        acc.income += transaction.amount;
      } else {
        acc.expense += Math.abs(transaction.amount);
      }

      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );
};
