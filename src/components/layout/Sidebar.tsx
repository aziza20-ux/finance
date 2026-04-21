import React from "react";
import { NavLink } from "react-router-dom";

type SidebarProps = {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
};

const Sidebar = ({ isMinimized, setIsMinimized }: SidebarProps) => {

  const navItems = [
    { path: "/", label: "Overview", icon: "🏠" },
    { path: "/transactions", label: "Transactions", icon: "↕" },
    { path: "/budget", label: "Budgets", icon: "◐" },
    { path: "/pots", label: "Pots", icon: "🔐" },
    { path: "/recurring-costs", label: "Recurring bills", icon: "📋" }
  ];

  return (
    <aside 
      className="h-100 d-flex flex-column" 
      style={{ 
        backgroundColor: "#2d2d2d", 
        width: isMinimized ? "70px" : "260px", 
        height: "100vh",
        transition: "width 0.3s ease",
        overflow: "hidden",
        padding: "1.5rem 0"
      }}
    >
      {/* Logo */}
      {!isMinimized && (
        <div className="px-4 mb-5">
          <h1 className="h4 text-white fw-bold mb-0">finance</h1>
        </div>
      )}

      {/* Navigation */}
      <nav className="d-flex flex-column gap-2 flex-grow-1 px-3">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            end={item.path === "/"} 
            className={({ isActive }) =>
              isActive
                ? "d-flex align-items-center gap-3 text-dark text-decoration-none px-3 py-2 rounded fw-semibold"
                : "d-flex align-items-center gap-3 text-secondary text-decoration-none px-3 py-2 rounded"
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#ffffff" : "transparent",
              whiteSpace: "nowrap"
            })}
          >
            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{item.icon}</span>
            {!isMinimized && <span style={{ fontSize: "1rem" }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Minimize Menu Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="border-0 bg-transparent d-flex align-items-center gap-3 text-secondary text-decoration-none"
        style={{ 
          fontSize: "0.95rem",
          marginTop: "auto",
          padding: "0.75rem 1rem",
          marginLeft: "0.75rem",
          cursor: "pointer",
          whiteSpace: "nowrap"
        }}
      >
        <span style={{ fontSize: "1rem" }}>◀</span>
        {!isMinimized && <span>Minimize Menu</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
