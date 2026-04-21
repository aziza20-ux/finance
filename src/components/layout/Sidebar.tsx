import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    ["nav-link", "rounded", "px-3", "py-2", isActive ? "active bg-primary text-white" : "text-body-secondary"]
      .filter(Boolean)
      .join(" ");

  return (
    <aside className="border-end bg-white h-100 p-3 shadow-sm">
      <div className="d-flex flex-column gap-1">
        <NavLink to="/" end className={linkClassName}>
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={linkClassName}>
          Transactions
        </NavLink>
        <NavLink to="/budget" className={linkClassName}>
          Budget
        </NavLink>
        <NavLink to="/savings" className={linkClassName}>
          Savings
        </NavLink>
        <NavLink to="/recurring-costs" className={linkClassName}>
          Recurring Costs
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
