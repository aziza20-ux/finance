import React, { useMemo, useState } from "react";

import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency } from "../utils/formatCurrency";

const RecurringCosts = () => {
  const { transactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "highest" | "lowest">("latest");

  const recurringTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.isRecurring),
    [transactions]
  );

  const recurringTotal = useMemo(
    () => recurringTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [recurringTransactions]
  );

  const paidBills = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return recurringTransactions
      .filter((transaction) => {
        const dueDate = new Date(transaction.date);
        return !Number.isNaN(dueDate.getTime()) && dueDate < today;
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }, [recurringTransactions]);

  const totalUpcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return recurringTransactions
      .filter((transaction) => {
        const dueDate = new Date(transaction.date);
        return !Number.isNaN(dueDate.getTime()) && dueDate >= today;
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }, [recurringTransactions]);

  const dueSoon = useMemo(() => {
    const today = new Date();
    const soon = new Date();
    today.setHours(0, 0, 0, 0);
    soon.setHours(0, 0, 0, 0);
    soon.setDate(soon.getDate() + 7);

    return recurringTransactions
      .filter((transaction) => {
        const dueDate = new Date(transaction.date);
        return !Number.isNaN(dueDate.getTime()) && dueDate >= today && dueDate <= soon;
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }, [recurringTransactions]);

  const visibleBills = useMemo(() => {
    const filtered = recurringTransactions.filter((transaction) => {
      if (searchTerm.trim() === "") {
        return true;
      }

      const term = searchTerm.toLowerCase();
      return (
        transaction.title.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      if (sortBy === "highest") {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }

      return Math.abs(a.amount) - Math.abs(b.amount);
    });
  }, [recurringTransactions, searchTerm, sortBy]);

  const formatDate = (value: string) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-0">Recurring Bills</h1>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "0.75rem", backgroundColor: "#1f1f2a" }}>
            <div className="card-body p-4 p-lg-5 text-white">
              <div className="mb-4" style={{ fontSize: "2.25rem", lineHeight: 1 }}>
                🗨
              </div>
              <p className="mb-1 fw-semibold" style={{ fontSize: "1.9rem" }}>Total bills</p>
              <p className="mb-0 fw-bold" style={{ fontSize: "3rem", lineHeight: 1.1 }}>
                {formatCurrency(recurringTotal)}
              </p>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: "0.75rem" }}>
            <div className="card-body p-4 p-lg-5">
              <h2 className="h3 mb-4">Summary</h2>

              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-body-secondary">Paid bills</span>
                <span className="fs-4">{formatCurrency(paidBills)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2 border-bottom mt-2">
                <span className="text-body-secondary">Total Upcoming</span>
                <span className="fs-4">{formatCurrency(totalUpcoming)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2 mt-2">
                <span className="text-body-secondary">Due Soon</span>
                <span className="fs-4 text-danger">{formatCurrency(dueSoon)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "0.75rem" }}>
            <div className="card-body p-4 p-lg-5 d-flex flex-column">
              <div className="row g-3 align-items-end mb-4">
                <div className="col-12 col-lg-7">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Search bills"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="col-12 col-lg-5">
                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor="bill-sort" className="text-body-secondary mb-0 small">
                      Sort by
                    </label>
                    <select
                      id="bill-sort"
                      className="form-select form-select-lg"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as "latest" | "oldest" | "highest" | "lowest")}
                    >
                      <option value="latest">Latest</option>
                      <option value="oldest">Oldest</option>
                      <option value="highest">Highest Amount</option>
                      <option value="lowest">Lowest Amount</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-responsive flex-grow-1">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr className="text-body-secondary">
                      <th className="fw-semibold py-3">Bill Title</th>
                      <th className="fw-semibold py-3">Due Date</th>
                      <th className="fw-semibold py-3 text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBills.length > 0 ? (
                      visibleBills.map((bill) => (
                        <tr key={bill.id}>
                          <td className="py-3">
                            <span className="fw-semibold">{bill.title}</span>
                          </td>
                          <td className="py-3 text-body-secondary">{formatDate(bill.date)}</td>
                          <td className="py-3 text-end fw-semibold">{formatCurrency(Math.abs(bill.amount))}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-5 text-body-secondary fs-5">
                          No results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <button type="button" className="btn btn-light text-body-secondary px-4 py-2" disabled>
                  Prev
                </button>
                <button type="button" className="btn btn-light text-body-secondary px-4 py-2" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringCosts;
