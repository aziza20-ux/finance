import { Budget, BudgetInput } from "../types/budget.types";

let budgets: Budget[] = [
  {
    id: "budget-1",
    category: "Housing",
    limit: 1600,
    spent: 1400,
    month: "2026-04",
  },
  {
    id: "budget-2",
    category: "Food",
    limit: 500,
    spent: 220,
    month: "2026-04",
  },
  {
    id: "budget-3",
    category: "Entertainment",
    limit: 150,
    spent: 18,
    month: "2026-04",
  },
];

const createBudgetId = () => `budget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const budgetService = {
  async list() {
    return Promise.resolve(budgets);
  },

  async upsert(payload: BudgetInput) {
    const nextBudget: Budget = {
      id: createBudgetId(),
      category: payload.category,
      limit: payload.limit,
      spent: payload.spent ?? 0,
      month: payload.month ?? new Date().toISOString().slice(0, 7),
    };

    budgets = [...budgets.filter((budget) => budget.category.toLowerCase() !== payload.category.toLowerCase()), nextBudget];
    return Promise.resolve(nextBudget);
  },

  async update(budgetId: string, payload: BudgetInput) {
    const previousBudget = budgets.find((budget) => budget.id === budgetId);

    if (!previousBudget) {
      throw new Error("Budget not found.");
    }

    const updatedBudget: Budget = {
      ...previousBudget,
      category: payload.category,
      limit: payload.limit,
      spent: payload.spent ?? previousBudget.spent,
      month: payload.month ?? previousBudget.month,
    };

    budgets = budgets.map((budget) => (budget.id === budgetId ? updatedBudget : budget));
    return Promise.resolve(updatedBudget);
  },

  async remove(budgetId: string) {
    budgets = budgets.filter((budget) => budget.id !== budgetId);
    return Promise.resolve(true);
  },
};
