import React, { useEffect, useMemo, useState } from "react";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import BudgetCard from "../components/finance/BudgetCard";
import { useTransactions } from "../hooks/useTransactions";
import { budgetService } from "../services/budgetService";
import { isPositiveNumber, isRequired } from "../utils/validators";

const Budget = () => {
  const { budgets, transactions, setBudgets } = useTransactions();
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
  };

  useEffect(() => {
    const hydrate = async () => {
      if (budgets.length === 0) {
        const storedBudgets = await budgetService.list();
        setBudgets(storedBudgets);
      }
    };

    hydrate();
  }, [budgets.length, setBudgets]);

  const spentByCategory = (budgetCategory: string) =>
    transactions.reduce((sum, transaction) => {
      if (transaction.category.toLowerCase() !== budgetCategory.toLowerCase() || transaction.amount >= 0) {
        return sum;
      }

      return sum + Math.abs(transaction.amount);
    }, 0);

  const totalBudget = useMemo(() => budgets.reduce((sum, budget) => sum + budget.limit, 0), [budgets]);

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
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Planning</p>
          <h1 className="h3 mb-1">Budget</h1>
          <p className="text-body-secondary mb-0">Set spending limits and compare them with actual transaction activity.</p>
        </div>
        <span className="badge text-bg-dark px-3 py-2">Total budget {totalBudget.toLocaleString()}</span>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">{editingBudgetId ? "Edit budget" : "Add budget"}</h2>

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

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? "Saving..." : editingBudgetId ? "Update budget" : "Save budget"}
                </Button>
                {editingBudgetId ? (
                  <Button type="button" variant="outline-secondary" fullWidth className="mt-2" onClick={resetForm}>
                    Cancel edit
                  </Button>
                ) : null}
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Budget list</h2>
                <span className="text-body-secondary small">Actual spend is calculated from transactions</span>
              </div>

              <div className="row g-3">
                {budgets.length > 0 ? (
                  budgets.map((budget) => (
                    <div className="col-12 col-lg-6" key={budget.id}>
                      <div className="d-flex flex-column gap-2 h-100">
                        <BudgetCard
                          id={budget.id}
                          category={budget.category}
                          limit={budget.limit}
                          spent={spentByCategory(budget.category) || budget.spent}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                        <span className="text-body-secondary small">{budget.month}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">No budgets have been configured yet.</div>
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

export default Budget;
