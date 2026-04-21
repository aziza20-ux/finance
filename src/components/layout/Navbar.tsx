import React from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark border-bottom border-secondary sticky-top">
      <div className="container-fluid px-4 d-flex justify-content-end">
        <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
