import React, { useEffect, useMemo } from "react";

import SummaryCard from "../components/finance/SummaryCard";
import TransactionCard from "../components/finance/TransactionCard";
import { useTransactions } from "../hooks/useTransactions";
import { transactionService } from "../services/transactionService";

const RecurringCosts = () => {
  const { transactions, setTransactions } = useTransactions();

  useEffect(() => {
    const hydrate = async () => {
      if (transactions.length === 0) {
        const storedTransactions = await transactionService.list();
        setTransactions(storedTransactions);
      }
    };

    hydrate();
  }, [setTransactions, transactions.length]);

  const recurringTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.isRecurring),
    [transactions]
  );

  const recurringTotal = useMemo(
    () => recurringTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [recurringTransactions]
  );

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Commitments</p>
        <h1 className="h3 mb-1">Recurring Costs</h1>
        <p className="text-body-secondary mb-0">Monitor subscriptions, rent, and other fixed monthly spending in one place.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <SummaryCard label="Recurring monthly total" value={recurringTotal} tone="warning" />
        </div>
        <div className="col-12 col-md-6">
          <SummaryCard label="Recurring items" value={recurringTransactions.length} tone="info" />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Recurring transaction list</h2>
            <span className="text-body-secondary small">Auto-seeded from the transactions service</span>
          </div>

          <div className="row g-3">
            {recurringTransactions.length > 0 ? (
              recurringTransactions.map((transaction) => (
                <div className="col-12 col-lg-6" key={transaction.id}>
                  <TransactionCard
                    id={transaction.id}
                    title={transaction.title}
                    amount={transaction.amount}
                    category={transaction.category}
                    date={transaction.date}
                    note={transaction.note}
                    isRecurring={transaction.isRecurring}
                  />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-secondary mb-0">No recurring costs are marked yet.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringCosts;
