import React from "react";
import { Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
