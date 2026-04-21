import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

type BudgetCardProps = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  onEdit?: (budgetId: string) => void;
  onDelete?: (budgetId: string) => void;
};

const BudgetCard = ({ id, category, limit, spent, onEdit, onDelete }: BudgetCardProps) => {
  const percentUsed = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const menuId = `budget-menu-${id}`;
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <article className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">{category}</h5>
          <div className="d-flex align-items-center gap-2">
            {hasActions ? (
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-light border"
                  type="button"
                  id={menuId}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  ...
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={menuId}>
                  <li>
                    <button className="dropdown-item" type="button" onClick={() => onEdit?.(id)}>
                      Edit
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" type="button" onClick={() => onDelete?.(id)}>
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}
            <span className="badge text-bg-primary">{percentUsed.toFixed(0)}%</span>
          </div>
        </div>
        <div className="progress mb-3" style={{ height: "0.75rem" }}>
          <div className="progress-bar" role="progressbar" style={{ width: `${percentUsed}%` }} aria-valuenow={percentUsed} aria-valuemin={0} aria-valuemax={100} />
        </div>
        <div className="d-flex justify-content-between small text-body-secondary">
          <span>Spent: {formatCurrency(spent)}</span>
          <span>Limit: {formatCurrency(limit)}</span>
        </div>
      </div>
    </article>
  );
};

export default BudgetCard;
