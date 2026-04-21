import React, { useEffect, useMemo, useState } from "react";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import TransactionCard from "../components/finance/TransactionCard";
import { useTransactions } from "../hooks/useTransactions";
import { transactionService } from "../services/transactionService";
import { isPositiveNumber, isRequired } from "../utils/validators";

const defaultDate = new Date().toISOString().slice(0, 10);

const Transactions = () => {
  const { transactions, setTransactions } = useTransactions();
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
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
  };

  useEffect(() => {
    const hydrate = async () => {
      if (transactions.length === 0) {
        const storedTransactions = await transactionService.list();
        setTransactions(storedTransactions);
      }
    };

    hydrate();
  }, [setTransactions, transactions.length]);

  const summary = useMemo(
    () => ({
      total: transactions.length,
      recurring: transactions.filter((transaction) => transaction.isRecurring).length,
    }),
    [transactions]
  );

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
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Activity</p>
          <h1 className="h3 mb-1">Transactions</h1>
          <p className="text-body-secondary mb-0">Add income and expenses, then manage them from one place.</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge text-bg-dark px-3 py-2">{summary.total} total</span>
          <span className="badge text-bg-primary px-3 py-2">{summary.recurring} recurring</span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">{editingTransactionId ? "Edit transaction" : "Add transaction"}</h2>

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

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? "Saving..." : editingTransactionId ? "Update transaction" : "Save transaction"}
                </Button>
                {editingTransactionId ? (
                  <Button type="button" variant="outline-secondary" fullWidth className="mt-2" onClick={resetForm}>
                    Cancel edit
                  </Button>
                ) : null}
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">All transactions</h2>
                <span className="text-body-secondary small">Most recent first</span>
              </div>

              <div className="row g-3">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div className="col-12 col-lg-6" key={transaction.id}>
                      <TransactionCard
                        id={transaction.id}
                        title={transaction.title}
                        amount={transaction.amount}
                        category={transaction.category}
                        date={transaction.date}
                        note={transaction.note}
                        isRecurring={transaction.isRecurring}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">No transactions have been added yet.</div>
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

export default Transactions;
