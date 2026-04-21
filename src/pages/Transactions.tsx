import React, { useMemo, useState } from "react";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import { useTransactions } from "../hooks/useTransactions";
import { transactionService } from "../services/transactionService";
import { formatCurrency } from "../utils/formatCurrency";
import { isPositiveNumber, isRequired } from "../utils/validators";

const defaultDate = new Date().toISOString().slice(0, 10);

const Transactions = () => {
  const { transactions, setTransactions } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "highest" | "lowest">("latest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEditingTransactionId(null);
    setTitle("");
    setCategory("");
    setAmount("0");
    setType("expense");
    setDate(defaultDate);
    setNote("");
    setIsRecurring(false);
    setError("");
  };

  const summary = useMemo(
    () => ({
      total: transactions.length,
      recurring: transactions.filter((transaction) => transaction.isRecurring).length,
    }),
    [transactions]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(transactions.map((transaction) => transaction.category))).sort((a, b) =>
      a.localeCompare(b)
    );
    return unique;
  }, [transactions]);

  const visibleTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || transaction.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [categoryFilter, searchTerm, sortBy, transactions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (!isRequired(title) || !isRequired(category)) {
      setError("Title and category are required.");
      return;
    }

    if (!isPositiveNumber(Math.abs(numericAmount))) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        category,
        amount: type === "expense" ? -Math.abs(numericAmount) : Math.abs(numericAmount),
        date,
        note,
        isRecurring,
      };

      if (editingTransactionId) {
        const updatedTransaction = await transactionService.update(editingTransactionId, payload);
        setTransactions(
          transactions.map((transaction) =>
            transaction.id === editingTransactionId ? updatedTransaction : transaction
          )
        );
      } else {
        const createdTransaction = await transactionService.create(payload);
        setTransactions([createdTransaction, ...transactions]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save transaction.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    await transactionService.remove(transactionId);
    setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));

    if (editingTransactionId === transactionId) {
      resetForm();
    }
  };

  const handleEdit = (transactionId: string) => {
    const transaction = transactions.find((item) => item.id === transactionId);

    if (!transaction) {
      return;
    }

    setEditingTransactionId(transaction.id);
    setTitle(transaction.title);
    setCategory(transaction.category);
    setAmount(String(Math.abs(transaction.amount)));
    setType(transaction.amount < 0 ? "expense" : "income");
    setDate(transaction.date);
    setNote(transaction.note ?? "");
    setIsRecurring(Boolean(transaction.isRecurring));
    setIsModalOpen(true);
  };

  const handleStartNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const avatarColor = (index: number) => {
    const colors = ["#6c6a7b", "#d24b34", "#5f7680", "#7f6f97", "#5f6f57"];
    return colors[index % colors.length];
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
        <h1 className="display-6 fw-bold mb-0">Transactions</h1>
        <button
          type="button"
          className="btn text-white fw-semibold px-4 py-3"
          style={{ backgroundColor: "#1f1f2a", borderRadius: "0.75rem" }}
          onClick={handleStartNew}
        >
          +Add New Transaction
        </button>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "1rem" }}>
        <div className="card-body p-4 p-lg-5">
          <div className="row g-3 align-items-end mb-4">
            <div className="col-12 col-xl-5">
              <label htmlFor="transaction-search" className="form-label small text-body-secondary mb-2">
                Search
              </label>
              <input
                id="transaction-search"
                type="text"
                className="form-control form-control-lg"
                placeholder="Search transaction"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-xl-2">
              <label htmlFor="sort-by" className="form-label small text-body-secondary mb-2">
                Sort by
              </label>
              <select
                id="sort-by"
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

            <div className="col-12 col-md-6 col-xl-3">
              <label htmlFor="filter-category" className="form-label small text-body-secondary mb-2">
                Filter by Category
              </label>
              <select
                id="filter-category"
                className="form-select form-select-lg"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All Transactions</option>
                {categories.map((entry) => (
                  <option value={entry} key={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-xl-2 text-xl-end">
              <span className="badge text-bg-dark px-3 py-2 me-2">{summary.total} total</span>
              <span className="badge text-bg-secondary px-3 py-2">{summary.recurring} recurring</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr className="text-body-secondary">
                  <th className="fw-semibold py-3">Recipient / Sender</th>
                  <th className="fw-semibold py-3">Category</th>
                  <th className="fw-semibold py-3">Transaction Date</th>
                  <th className="fw-semibold py-3 text-end">Amount</th>
                  <th className="fw-semibold py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.length > 0 ? (
                  visibleTransactions.map((transaction, index) => (
                    <tr key={transaction.id} role="button" onDoubleClick={() => handleEdit(transaction.id)}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-inline-flex align-items-center justify-content-center text-white fw-semibold"
                            style={{
                              width: "2.75rem",
                              height: "2.75rem",
                              borderRadius: "999px",
                              backgroundColor: avatarColor(index),
                              fontSize: "0.95rem",
                            }}
                          >
                            {transaction.title.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="fw-semibold text-dark">{transaction.title}</span>
                        </div>
                      </td>
                      <td className="text-body-secondary py-3">{transaction.category}</td>
                      <td className="text-body-secondary py-3">{formatDate(transaction.date)}</td>
                      <td className="text-end py-3">
                        <span className={transaction.amount >= 0 ? "fw-bold text-success" : "fw-bold text-danger"}>
                          {transaction.amount >= 0 ? "+" : "-"}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </td>
                      <td className="text-end py-3">
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEdit(transaction.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="alert alert-info mb-0">No transactions match your current filters.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex align-items-center justify-content-between mt-4">
            <button type="button" className="btn btn-light text-body-secondary px-4 py-2" disabled>
              Prev
            </button>
            <span className="badge text-bg-dark px-3 py-2">1</span>
            <button type="button" className="btn btn-light text-body-secondary px-4 py-2" disabled>
              Next
            </button>
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
        title={editingTransactionId ? "Edit Transaction" : "Add New Transaction"}
      >
        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <Input
            id="transaction-title"
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Freelance payment"
          />

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <Input
                id="transaction-category"
                label="Category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Income, Food, Housing"
              />
            </div>
            <div className="col-12 col-md-6">
              <Input
                id="transaction-amount"
                label="Amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="120.00"
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="transaction-type" className="form-label">
                  Type
                </label>
                <select
                  id="transaction-type"
                  className="form-select"
                  value={type}
                  onChange={(event) => setType(event.target.value as "income" | "expense")}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <Input id="transaction-date" label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
          </div>

          <Input
            id="transaction-note"
            label="Note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional memo"
            helperText="Add context for later review."
          />

          <div className="form-check mb-4">
            <input
              id="transaction-recurring"
              className="form-check-input"
              type="checkbox"
              checked={isRecurring}
              onChange={(event) => setIsRecurring(event.target.checked)}
            />
            <label className="form-check-label" htmlFor="transaction-recurring">
              Mark as recurring cost
            </label>
          </div>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingTransactionId ? "Update transaction" : "Save transaction"}
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

export default Transactions;
