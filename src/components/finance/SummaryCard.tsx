import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

type SummaryCardProps = {
  label: string;
  value: number;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  formatter?: (value: number) => string;
};

const SummaryCard = ({ label, value, tone = "primary", formatter = formatCurrency }: SummaryCardProps) => {
  return (
    <article className={`card border-0 shadow-sm h-100 border-start border-4 border-${tone}`}>
      <div className="card-body">
        <p className="text-body-secondary text-uppercase small fw-semibold mb-2">{label}</p>
        <h3 className="mb-0">{formatter(value)}</h3>
      </div>
    </article>
  );
};

export default SummaryCard;
