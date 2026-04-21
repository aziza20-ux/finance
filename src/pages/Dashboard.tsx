import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../components/finance/SummaryCard";
import TransactionCard from "../components/finance/TransactionCard";
import { useTransactions } from "../hooks/useTransactions";
import { calculateTotals } from "../utils/calculateTotals";
import { formatCurrency } from "../utils/formatCurrency";

const Dashboard = () => {
  const navigate = useNavigate();
  const { transactions, budgets } = useTransactions();

  const totals = useMemo(() => calculateTotals(transactions), [transactions]);

  const recentTransactions = transactions.slice(0, 4);
  const firstBudget = budgets.length > 0 ? budgets[0] : null;
  const firstBudgetSpent = firstBudget ? 
    (transactions.reduce((sum: number, transaction) => {
      if (transaction.category.toLowerCase() !== firstBudget.category.toLowerCase() || transaction.amount >= 0) {
        return sum;
      }
      return sum + Math.abs(transaction.amount);
    }, 0) || firstBudget.spent) : 0;

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h1 className="h2">Overview</h1>
      </div>

      {/* Row 1: Current Balance + Income/Expenses */}
      <div className="row g-4 mb-4">
        {/* Current Balance - Left Side */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: "#1a1a1a" }}>
            <div className="card-body">
              <p className="text-secondary text-uppercase small fw-semibold mb-2">Current Balance</p>
              <h2 className="mb-0 text-white" style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                {formatCurrency(totals.balance)}
              </h2>
            </div>
          </div>
        </div>

        {/* Income & Expenses - Right Side Stacked */}
        <div className="col-12 col-lg-6">
          <div className="row g-3 h-100">
            <div className="col-12 col-sm-6">
              <SummaryCard label="Income" value={totals.income} tone="success" />
            </div>
            <div className="col-12 col-sm-6">
              <SummaryCard label="Expenses" value={totals.expense} tone="danger" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Pots + Budgets with Circular Progress */}
      <div className="row g-4 mb-4">
        {/* Pots Section - Left */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 mb-0">Pots</h3>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none small text-secondary p-0"
                  onClick={() => navigate("/pots")}
                >
                  See Details <i className="bi bi-chevron-right"></i>
                </button>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: "60px", height: "60px", backgroundColor: "#f0f0f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "1.5rem" }}>💰</span>
                </div>
                <div>
                  <p className="mb-0 small text-body-secondary">Pots</p>
                  <h4 className="mb-0">$0</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budgets Section - Right with Circular Progress */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 mb-0">Budgets</h3>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none small text-secondary p-0"
                  onClick={() => navigate("/budget")}
                >
                  See Details <i className="bi bi-chevron-right"></i>
                </button>
              </div>

              {firstBudget ? (
                <div className="row align-items-center">
                  <div className="col-md-6 d-flex justify-content-center align-items-center mb-3 mb-md-0">
                    {/* Circular Progress Indicator */}
                    <div style={{ position: "relative", width: "160px", height: "160px" }}>
                      <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                        {/* Background circle */}
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#e9ecef" strokeWidth="10" />
                        {/* Progress circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#0d6efd"
                          strokeWidth="10"
                          strokeDasharray={`${(firstBudgetSpent / firstBudget.limit) * 439.82} 439.82`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "1rem", fontWeight: "700" }}>
                          {formatCurrency(firstBudgetSpent)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                          of {formatCurrency(firstBudget.limit)} limit
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={{ paddingLeft: "12px", borderLeft: "4px solid #0d6efd" }}>
                      <p className="mb-1 fw-semibold small">{firstBudget.category}</p>
                      <p className="mb-0 text-body-secondary">{formatCurrency(firstBudgetSpent)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-secondary mb-0">No budgets configured yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Transactions + Recurring Bills */}
      <div className="row g-4">
        {/* Transactions - Left */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 mb-0">Transactions</h3>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none small text-secondary p-0"
                  onClick={() => navigate("/transactions")}
                >
                  See Details <i className="bi bi-chevron-right"></i>
                </button>
              </div>

              <div className="d-grid gap-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id}>
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
                  <div>
                    <div className="alert alert-info mb-0">No transactions yet. Add your first entry from the Transactions page.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Bills - Right */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 mb-0">Recurring Bills</h3>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none small text-secondary p-0"
                  onClick={() => navigate("/recurring-costs")}
                >
                  See Details <i className="bi bi-chevron-right"></i>
                </button>
              </div>

              <div className="d-grid gap-3">
                {/* Paid Bills */}
                <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #0d6efd" }}>
                  <span className="text-body-secondary">Paid Bills</span>
                  <span className="fw-semibold">$0.00</span>
                </div>

                {/* Total Upcoming */}
                <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #fd7e14" }}>
                  <span className="text-body-secondary">Total Upcoming</span>
                  <span className="fw-semibold">$0.00</span>
                </div>

                {/* Due Soon */}
                <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #20c997" }}>
                  <span className="text-body-secondary">Due Soon</span>
                  <span className="fw-semibold">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
