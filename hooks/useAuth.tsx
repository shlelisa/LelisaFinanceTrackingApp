"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  clearAuth,
  getToken,
  getUser,
  isAuthenticated,
  setToken,
  setUser,
} from "@/lib/auth";
import type { User } from "@/lib/types/api";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

type Action =
  | { type: "INIT"; token: string | null; user: User | null }
  | { type: "LOADED" }
  | { type: "LOGIN"; token: string; user: User }
  | { type: "LOGOUT" };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "INIT":
      return { ...state, token: action.token, user: action.user };
    case "LOADED":
      return { ...state, isLoading: false };
    case "LOGIN":
      return { ...state, token: action.token, user: action.user, isLoading: false };
    case "LOGOUT":
      return { ...state, token: null, user: null, isLoading: false };
  }
}

const AuthContext = createContext<AuthState | null>(null);

const CURRENT_APP_VERSION = "1.0.1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => {},
    logout: () => {},
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastVersion = localStorage.getItem("app_build_version");
      if (lastVersion !== CURRENT_APP_VERSION) {
        localStorage.setItem("app_build_version", CURRENT_APP_VERSION);
        clearAuth();
        dispatch({ type: "LOGOUT" });
        dispatch({ type: "LOADED" });
        return;
      }
    }

    if (isAuthenticated()) {
      dispatch({ type: "INIT", token: getToken(), user: getUser() as User | null });
    }
    dispatch({ type: "LOADED" });
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    dispatch({ type: "LOGIN", token: newToken, user: newUser });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    dispatch({ type: "LOGOUT" });
  }, []);

  const value: AuthState = {
    ...state,
    isAuthenticated: !!state.token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
