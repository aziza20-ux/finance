import React, { useEffect, useMemo } from "react";

import SummaryCard from "../components/finance/SummaryCard";
import TransactionCard from "../components/finance/TransactionCard";
import { useTransactions } from "../hooks/useTransactions";
import { transactionService } from "../services/transactionService";
import { calculateTotals } from "../utils/calculateTotals";

const Savings = () => {
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

  const totals = useMemo(() => calculateTotals(transactions), [transactions]);
  const recurringTransactions = transactions.filter((transaction) => transaction.isRecurring);
  const savingsPotential = Math.max(totals.balance, 0);
  const spendingRatio = totals.income > 0 ? ((totals.expense / totals.income) * 100).toFixed(0) : "0";

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Goals</p>
        <h1 className="h3 mb-1">Savings</h1>
        <p className="text-body-secondary mb-0">See what is left after expenses and identify the recurring commitments pulling your balance down.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <SummaryCard label="Savings potential" value={savingsPotential} tone="success" />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard label="Income" value={totals.income} tone="primary" />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard label="Expense ratio" value={Number(spendingRatio)} tone="warning" formatter={(value) => `${value}%`} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Monthly savings snapshot</h2>
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-body-secondary">Balance available to save</span>
                    <strong>{savingsPotential.toLocaleString()}</strong>
                  </div>
                  <div className="progress" style={{ height: "0.75rem" }}>
                    <div className="progress-bar bg-success" style={{ width: `${Math.min(Number(spendingRatio), 100)}%` }} />
                  </div>
                </div>

                <div className="alert alert-light border mb-0">
                  Keep recurring costs under control to increase the balance you can redirect to savings or investments.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Recurring commitments</h2>
                <span className="badge text-bg-light text-body-secondary">{recurringTransactions.length}</span>
              </div>

              <div className="row g-3">
                {recurringTransactions.length > 0 ? (
                  recurringTransactions.map((transaction) => (
                    <div className="col-12" key={transaction.id}>
                      <TransactionCard
                              title={transaction.title}
                              amount={transaction.amount}
                              category={transaction.category}
                              date={transaction.date}
                              note={transaction.note}
                              isRecurring={transaction.isRecurring} id={""}                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-secondary mb-0">No recurring transactions found.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Savings;
