import React from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import Budget from "../pages/Budget";
import Savings from "../pages/Savings";
import RecurringCosts from "../pages/RecurringCosts";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        }
      />
      <Route
        path="/savings"
        element={
          <ProtectedRoute>
            <Savings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recurring-costs"
        element={
          <ProtectedRoute>
            <RecurringCosts />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
