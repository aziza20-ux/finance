import React, { useEffect, useMemo } from "react";

import BudgetCard from "../components/finance/BudgetCard";
import SummaryCard from "../components/finance/SummaryCard";
import TransactionCard from "../components/finance/TransactionCard";
import { useAuth } from "../hooks/useAuth";
import { useTransactions } from "../hooks/useTransactions";
import { budgetService } from "../services/budgetService";
import { transactionService } from "../services/transactionService";
import { calculateTotals } from "../utils/calculateTotals";

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, budgets, setTransactions, setBudgets } = useTransactions();

  useEffect(() => {
    const hydrate = async () => {
      if (transactions.length === 0) {
        const storedTransactions = await transactionService.list();
        setTransactions(storedTransactions);
      }

      if (budgets.length === 0) {
        const storedBudgets = await budgetService.list();
        setBudgets(storedBudgets);
      }
    };

    hydrate();
  }, [budgets.length, setBudgets, setTransactions, transactions.length]);

  const totals = useMemo(() => calculateTotals(transactions), [transactions]);

  const budgetSpending = (category: string) =>
    transactions.reduce((sum, transaction) => {
      if (transaction.category.toLowerCase() !== category.toLowerCase() || transaction.amount >= 0) {
        return sum;
      }

      return sum + Math.abs(transaction.amount);
    }, 0);

  const recentTransactions = transactions.slice(0, 4);
  const activeBudgets = budgets.slice(0, 3);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Overview</p>
          <h1 className="h3 mb-1">Welcome{user ? `, ${user.fullName}` : ""}</h1>
          <p className="text-body-secondary mb-0">A quick view of income, spending, and active budget pressure.</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <SummaryCard label="Income" value={totals.income} tone="success" />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard label="Expenses" value={totals.expense} tone="danger" />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard label="Balance" value={totals.balance} tone="info" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Recent transactions</h2>
                <span className="badge text-bg-light text-body-secondary">{transactions.length} total</span>
              </div>
              <div className="row g-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div className="col-12 col-md-6" key={transaction.id}>
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
                    <div className="alert alert-info mb-0">No transactions yet. Add your first entry from the Transactions page.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Budget watch</h2>
                <span className="badge text-bg-light text-body-secondary">{budgets.length} budgets</span>
              </div>

              <div className="d-grid gap-3">
                {activeBudgets.length > 0 ? (
                  activeBudgets.map((budget) => (
                    <BudgetCard
                      id={budget.id}
                      key={budget.id}
                      category={budget.category}
                      limit={budget.limit}
                      spent={budgetSpending(budget.category) || budget.spent}
                    />
                  ))
                ) : (
                  <div className="alert alert-secondary mb-0">No budgets configured yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
