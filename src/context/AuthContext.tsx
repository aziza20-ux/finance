import React, { createContext, useEffect, useMemo, useState } from "react";
import { AuthUser } from "../types/auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const storageKey = "finance.auth.user";

  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = window.localStorage.getItem(storageKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(storageKey, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      login: (nextUser: AuthUser) => setUser(nextUser),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
