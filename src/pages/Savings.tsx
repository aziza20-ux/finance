import React, { useState } from "react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useTransactions } from "../hooks/useTransactions";
import { PotInput } from "../types/pot.types";

const Savings = () => {
  const { pots, addPot, removePot, updatePot } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PotInput>({
    name: "",
    targetAmount: 0,
    theme: "blue",
    savedAmount: 0,
  });

  const themeColors: { [key: string]: string } = {
    blue: "#0d6efd",
    green: "#198754",
    red: "#dc3545",
    purple: "#6f42c1",
    orange: "#fd7e14",
    cyan: "#0dcaf0",
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      targetAmount: 0,
      theme: "blue",
      savedAmount: 0,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.targetAmount > 0) {
      addPot(formData);
      handleCloseModal();
    }
  };

  const handleAddMoney = (potId: string) => {
    const amount = prompt("Enter amount to add:");
    if (amount && !isNaN(Number(amount))) {
      const pot = pots.find((p) => p.id === potId);
      if (pot) {
        updatePot(potId, {
          savedAmount: pot.savedAmount + Number(amount),
        });
      }
    }
  };

  const handleWithdraw = (potId: string) => {
    const amount = prompt("Enter amount to withdraw:");
    if (amount && !isNaN(Number(amount))) {
      const pot = pots.find((p) => p.id === potId);
      if (pot && pot.savedAmount >= Number(amount)) {
        updatePot(potId, {
          savedAmount: pot.savedAmount - Number(amount),
        });
      } else {
        alert("Insufficient funds");
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Savings Goals</p>
          <h1 className="h3 mb-0">Pots</h1>
        </div>
        <Button onClick={handleOpenModal} style={{ padding: "0.5rem 1.5rem" }}>
          + Add New Pot
        </Button>
      </div>

      {pots.length === 0 ? (
        <div className="alert alert-light border-0 text-center py-5">
          <p className="text-body-secondary mb-0">You don't have a pot account yet.</p>
        </div>
      ) : (
        <div className="row g-4">
          {pots.map((pot) => {
            const percentage = pot.targetAmount > 0 ? (pot.savedAmount / pot.targetAmount) * 100 : 0;
            const dotColor = themeColors[pot.theme] || themeColors.blue;

            return (
              <div className="col-12 col-md-6 col-lg-4" key={pot.id}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span
                        className="rounded-circle"
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: dotColor,
                        }}
                      />
                      <h5 className="mb-0">{pot.name}</h5>
                      <button
                        className="btn btn-sm p-0 ms-auto"
                        onClick={() => {
                          if (window.confirm("Delete this pot?")) {
                            removePot(pot.id);
                          }
                        }}
                      >
                        ⋯
                      </button>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-body-secondary">Total Saved</span>
                        <strong className="fs-5">{formatCurrency(pot.savedAmount)}</strong>
                      </div>

                      <div className="progress" style={{ height: "0.5rem" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: dotColor,
                          }}
                        />
                      </div>

                      <div className="d-flex justify-content-between mt-2">
                        <span className="text-body-secondary small">{percentage.toFixed(0)}%</span>
                        <span className="text-body-secondary small">Target of {formatCurrency(pot.targetAmount)}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        onClick={() => handleAddMoney(pot.id)}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          fontSize: "0.875rem",
                          backgroundColor: "#f0f0f0",
                          color: "#000",
                          border: "none",
                        }}
                      >
                        + Add Money
                      </Button>
                      <Button
                        onClick={() => handleWithdraw(pot.id)}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          fontSize: "0.875rem",
                          backgroundColor: "#f0f0f0",
                          color: "#000",
                          border: "none",
                        }}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} title="Add New Pot" onClose={handleCloseModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-body-secondary small fw-semibold">Pot Name</label>
            <p className="text-body-secondary small mb-2">
              Choose a category to set a spending budget. These categories can help you monitor spending.
            </p>
            <Input
              type="text"
              placeholder="e.g. Rainy Days"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={30}
            />
            <small className="text-body-secondary">
              {formData.name.length} character{formData.name.length !== 1 ? "s" : ""} left
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label text-body-secondary small fw-semibold">Target Amount</label>
            <Input
              type="number"
              placeholder="$ e.g. 2000"
              value={formData.targetAmount === 0 ? "" : formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) || 0 })}
              onFocus={(e) => e.target.select()}
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-body-secondary small fw-semibold">Theme</label>
            <select
              className="form-select"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="purple">Purple</option>
              <option value="orange">Orange</option>
              <option value="cyan">Cyan</option>
            </select>
          </div>

          <Button type="submit" style={{ width: "100%", padding: "0.75rem" }}>
            Submit
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Savings;
