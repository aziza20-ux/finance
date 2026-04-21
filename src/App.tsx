import React from "react";

import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppRoutes />
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;
