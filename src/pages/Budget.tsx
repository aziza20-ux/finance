import React, { useCallback, useMemo, useState } from "react";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import { useTransactions } from "../hooks/useTransactions";
import { budgetService } from "../services/budgetService";
import { formatCurrency } from "../utils/formatCurrency";
import { isPositiveNumber, isRequired } from "../utils/validators";

const Budget = () => {
  const { budgets, transactions, setBudgets } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("0");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEditingBudgetId(null);
    setCategory("");
    setLimit("0");
    setMonth(new Date().toISOString().slice(0, 7));
    setError("");
  };

  const spentByCategory = useCallback(
    (budgetCategory: string) =>
      transactions.reduce((sum, transaction) => {
        if (transaction.category.toLowerCase() !== budgetCategory.toLowerCase() || transaction.amount >= 0) {
          return sum;
        }

        return sum + Math.abs(transaction.amount);
      }, 0),
    [transactions]
  );

  const totalBudget = useMemo(() => budgets.reduce((sum, budget) => sum + budget.limit, 0), [budgets]);
  const totalSpent = useMemo(
    () => budgets.reduce((sum, budget) => sum + (spentByCategory(budget.category) || budget.spent), 0),
    [budgets, spentByCategory]
  );

  const selectedBudget = useMemo(() => {
    if (editingBudgetId) {
      const editing = budgets.find((budget) => budget.id === editingBudgetId);
      if (editing) {
        return editing;
      }
    }

    return budgets.length > 0 ? budgets[0] : null;
  }, [budgets, editingBudgetId]);

  const selectedSpent = selectedBudget ? spentByCategory(selectedBudget.category) || selectedBudget.spent : 0;
  const selectedFree = selectedBudget ? Math.max(selectedBudget.limit - selectedSpent, 0) : 0;
  const selectedPercent =
    selectedBudget && selectedBudget.limit > 0 ? Math.min((selectedSpent / selectedBudget.limit) * 100, 100) : 0;

  const latestSpending = useMemo(() => {
    if (!selectedBudget) {
      return null;
    }

    const entries = transactions
      .filter(
        (transaction) =>
          transaction.amount < 0 && transaction.category.toLowerCase() === selectedBudget.category.toLowerCase()
      )
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

    return entries.length > 0 ? entries[0] : null;
  }, [selectedBudget, transactions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const numericLimit = Number(limit);

    if (!isRequired(category)) {
      setError("Category is required.");
      return;
    }

    if (!isPositiveNumber(numericLimit)) {
      setError("Enter a valid budget limit greater than zero.");
      return;
    }

    setLoading(true);

    try {
      if (editingBudgetId) {
        const updatedBudget = await budgetService.update(editingBudgetId, {
          category,
          limit: numericLimit,
          month,
        });

        setBudgets(budgets.map((budget) => (budget.id === editingBudgetId ? updatedBudget : budget)));
      } else {
        const nextBudget = await budgetService.upsert({
          category,
          limit: numericLimit,
          month,
        });

        setBudgets(
          [
            nextBudget,
            ...budgets.filter((budget) => budget.category.toLowerCase() !== nextBudget.category.toLowerCase()),
          ].sort((left, right) => left.category.localeCompare(right.category))
        );
      }

      setIsModalOpen(false);
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save budget.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    await budgetService.remove(budgetId);
    setBudgets(budgets.filter((budget) => budget.id !== budgetId));

    if (editingBudgetId === budgetId) {
      resetForm();
    }
  };

  const handleEdit = (budgetId: string) => {
    const budget = budgets.find((item) => item.id === budgetId);

    if (!budget) {
      return;
    }

    setEditingBudgetId(budget.id);
    setCategory(budget.category);
    setLimit(String(budget.limit));
    setMonth(budget.month);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

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
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h1 className="h2 fw-bold mb-0">Budgets</h1>
        <button
          type="button"
          className="btn text-white fw-semibold px-4 py-3"
          style={{ backgroundColor: "#1f1f2a", borderRadius: "0.75rem" }}
          onClick={handleOpenNew}
        >
          +Add New Budget
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "1rem" }}>
            <div className="card-body p-4 p-lg-5 d-flex flex-column">
              <div className="d-flex justify-content-center mb-4">
                <div style={{ position: "relative", width: "min(260px, 100%)", aspectRatio: "1 / 1" }}>
                  <svg viewBox="0 0 260 260" width="100%" height="100%" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="130" cy="130" r="100" fill="none" stroke="#e9ecef" strokeWidth="26" />
                    <circle
                      cx="130"
                      cy="130"
                      r="100"
                      fill="none"
                      stroke="#4a8bbd"
                      strokeWidth="26"
                      strokeDasharray={`${(selectedPercent / 100) * 628.32} 628.32`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <div className="fw-bold text-center" style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", lineHeight: 1.1 }}>
                      {formatCurrency(totalSpent)}
                    </div>
                    <div className="text-body-secondary text-center text-nowrap" style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.2rem)" }}>
                      of {formatCurrency(totalBudget)} limit
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="h4 fw-bold mb-4">Spending Summary</h2>

              <div className="d-grid gap-3">
                {budgets.length > 0 ? (
                  budgets.map((budget) => {
                    const spent = spentByCategory(budget.category) || budget.spent;

                    return (
                      <div className="d-flex align-items-center justify-content-between" key={budget.id}>
                        <div className="d-flex align-items-center gap-3">
                          <span
                            style={{ width: "5px", height: "28px", borderRadius: "999px", backgroundColor: "#4a8bbd" }}
                          />
                          <button
                            type="button"
                            className="btn btn-link text-body-secondary text-decoration-none p-0"
                            onClick={() => setEditingBudgetId(budget.id)}
                          >
                            {budget.category}
                          </button>
                        </div>
                        <div className="text-end">
                          <span className="fw-bold fs-5">{formatCurrency(spent)}</span>
                          <span className="text-body-secondary"> of {formatCurrency(budget.limit)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="alert alert-info mb-0">No budgets have been configured yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "1rem", minWidth: 0 }}>
            <div className="card-body p-4 p-lg-5 d-flex flex-column gap-4">
              {selectedBudget ? (
                <>
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div className="d-flex align-items-center gap-3 min-w-0" style={{ minWidth: 0 }}>
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "999px",
                          backgroundColor: "#4a8bbd",
                          display: "inline-block",
                        }}
                      />
                      <h2 className="mb-0 fw-bold text-truncate" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)", lineHeight: 1.1, maxWidth: "100%" }}>
                        {selectedBudget.category}
                      </h2>
                    </div>

                    <div className="dropdown">
                      <button className="btn btn-link fs-4 text-dark text-decoration-none p-0" data-bs-toggle="dropdown" type="button">
                        ...
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button className="dropdown-item" type="button" onClick={() => handleEdit(selectedBudget.id)}>
                            Edit
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item text-danger" type="button" onClick={() => handleDelete(selectedBudget.id)}>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-body-secondary mb-0" style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)" }}>
                    Maximum of {formatCurrency(selectedBudget.limit)}
                  </p>

                  <div className="progress" style={{ height: "1.5rem", borderRadius: "0.5rem", backgroundColor: "#f1efed" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${selectedPercent}%`, backgroundColor: "#4a8bbd" }}
                      aria-valuenow={selectedPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="p-3" style={{ backgroundColor: "#f7f5f3", borderRadius: "0.5rem", minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            style={{ width: "5px", height: "38px", borderRadius: "999px", backgroundColor: "#4a8bbd" }}
                          />
                          <span className="text-body-secondary" style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)" }}>Spent</span>
                        </div>
                        <p className="mb-0 fw-bold" style={{ fontSize: "clamp(1.35rem, 2.2vw, 1.85rem)", lineHeight: 1.1 }}>
                          {formatCurrency(selectedSpent)}
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3" style={{ backgroundColor: "#f7f5f3", borderRadius: "0.5rem", minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            style={{ width: "5px", height: "38px", borderRadius: "999px", backgroundColor: "#d3cec8" }}
                          />
                          <span className="text-body-secondary" style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)" }}>Free</span>
                        </div>
                        <p className="mb-0 fw-bold" style={{ fontSize: "clamp(1.35rem, 2.2vw, 1.85rem)", lineHeight: 1.1 }}>
                          {formatCurrency(selectedFree)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4" style={{ backgroundColor: "#f7f5f3", borderRadius: "0.75rem" }}>
                    <div className="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
                      <h3 className="mb-0 fw-bold" style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.45rem)" }}>
                        Latest Spending
                      </h3>
                      <span className="text-body-secondary" style={{ fontSize: "clamp(0.9rem, 1.2vw, 1rem)" }}>See All</span>
                    </div>

                    {latestSpending ? (
                      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <div
                            className="d-inline-flex align-items-center justify-content-center text-white fw-semibold"
                            style={{
                              width: "3rem",
                              height: "3rem",
                              borderRadius: "999px",
                              backgroundColor: "#d24b34",
                              fontSize: "1rem",
                            }}
                          >
                            {latestSpending.title.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="fw-semibold" style={{ fontSize: "clamp(1rem, 1.4vw, 1.2rem)" }}>{latestSpending.title}</span>
                        </div>

                        <div className="text-end">
                          <p className="mb-0 fw-bold text-success" style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)", lineHeight: 1.1 }}>
                            +{formatCurrency(Math.abs(latestSpending.amount))}
                          </p>
                          <p className="mb-0 text-body-secondary" style={{ fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)" }}>
                            {formatDate(latestSpending.date)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-body-secondary mb-0">No spending records for this category yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="alert alert-info mb-0">No budgets have been configured yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        size="lg"
        title={editingBudgetId ? "Edit Budget" : "Add New Budget"}
      >
        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <Input
            id="budget-category"
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Housing, Food, Travel"
          />
          <Input
            id="budget-limit"
            label="Limit"
            type="number"
            step="0.01"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            placeholder="500.00"
          />
          <Input id="budget-month" label="Month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />

          <div className="d-flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingBudgetId ? "Update budget" : "Save budget"}
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;
