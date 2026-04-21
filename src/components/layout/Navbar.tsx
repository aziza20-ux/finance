import React from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary sticky-top">
      <div className="container-fluid px-4">
        <span className="navbar-brand fw-semibold">Personal Finance</span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topNavbar"
          aria-controls="topNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="topNavbar">
          <div className="navbar-nav ms-auto gap-2 align-items-lg-center">
            <span className="nav-link text-white-50">Track spending</span>
            <span className="nav-link text-white-50">Stay on budget</span>
            {user ? <span className="nav-link text-white">{user.fullName}</span> : null}
            <button type="button" className="btn btn-outline-light btn-sm ms-lg-2" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
