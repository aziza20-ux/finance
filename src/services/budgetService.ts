import { Budget, BudgetInput } from "../types/budget.types";

const authStorageKey = "finance.auth.user";

const defaultBudgets: Budget[] = [
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

const getActiveUserId = () => {
  const rawUser = window.localStorage.getItem(authStorageKey);

  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as { id?: string };
    return parsed.id ?? null;
  } catch {
    return null;
  }
};

const getBudgetsKey = (userId: string) => `finance.budgets.${userId}`;

const getBudgetsForUser = (userId: string): Budget[] => {
  const storageKey = getBudgetsKey(userId);
  const storedBudgets = window.localStorage.getItem(storageKey);

  if (!storedBudgets) {
    const initialData = userId === "demo-user" ? defaultBudgets : [];
    window.localStorage.setItem(storageKey, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(storedBudgets) as Budget[];
  } catch {
    return [];
  }
};

const setBudgetsForUser = (userId: string, nextBudgets: Budget[]) => {
  window.localStorage.setItem(getBudgetsKey(userId), JSON.stringify(nextBudgets));
};

export const budgetService = {
  async list() {
    const userId = getActiveUserId();
    return Promise.resolve(userId ? getBudgetsForUser(userId) : []);
  },

  async upsert(payload: BudgetInput) {
    const userId = getActiveUserId();

    if (!userId) {
      throw new Error("You must be logged in to save budgets.");
    }

    const budgets = getBudgetsForUser(userId);
    const nextBudget: Budget = {
      id: createBudgetId(),
      category: payload.category,
      limit: payload.limit,
      spent: payload.spent ?? 0,
      month: payload.month ?? new Date().toISOString().slice(0, 7),
    };

    setBudgetsForUser(
      userId,
      [...budgets.filter((budget) => budget.category.toLowerCase() !== payload.category.toLowerCase()), nextBudget]
    );

    return Promise.resolve(nextBudget);
  },

  async update(budgetId: string, payload: BudgetInput) {
    const userId = getActiveUserId();

    if (!userId) {
      throw new Error("You must be logged in to update budgets.");
    }

    const budgets = getBudgetsForUser(userId);
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

    const nextBudgets = budgets.map((budget) => (budget.id === budgetId ? updatedBudget : budget));
    setBudgetsForUser(userId, nextBudgets);

    return Promise.resolve(updatedBudget);
  },

  async remove(budgetId: string) {
    const userId = getActiveUserId();

    if (!userId) {
      throw new Error("You must be logged in to remove budgets.");
    }

    const budgets = getBudgetsForUser(userId);
    setBudgetsForUser(
      userId,
      budgets.filter((budget) => budget.id !== budgetId)
    );

    return Promise.resolve(true);
  },
};
