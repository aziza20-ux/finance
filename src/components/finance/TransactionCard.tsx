import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

type TransactionCardProps = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date?: string;
  note?: string;
  isRecurring?: boolean;
  onEdit?: (transactionId: string) => void;
  onDelete?: (transactionId: string) => void;
};

const TransactionCard = ({
  id,
  title,
  amount,
  category,
  date,
  note,
  isRecurring,
  onEdit,
  onDelete,
}: TransactionCardProps) => {
  const menuId = `transaction-menu-${id}`;
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <article className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <h5 className="card-title mb-1">{title}</h5>
            <p className="text-body-secondary mb-0">{category}</p>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
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
            <span className={`badge ${amount >= 0 ? "text-bg-success" : "text-bg-danger"}`}>{formatCurrency(amount)}</span>
            {isRecurring ? <span className="badge text-bg-warning text-dark">Recurring</span> : null}
          </div>
        </div>
        {note ? <p className="small text-body-secondary mt-3 mb-0">{note}</p> : null}
        {date ? <p className="small text-body-secondary mt-3 mb-0">{date}</p> : null}
      </div>
    </article>
  );
};

export default TransactionCard;
