"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore, UNAUTHORIZED_EVENT } from "./api";
import type { Me, Role } from "./types";

type AuthState =
  | { status: "loading"; me: null }
  | { status: "anon"; me: null }
  | { status: "ready"; me: Me };

type AuthContextValue = AuthState & {
  login: (token: string) => Promise<void>;
  logout: () => void;
  can: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", me: null });

  const loadMe = useCallback(async () => {
    if (!tokenStore.get()) {
      setState({ status: "anon", me: null });
      return;
    }
    try {
      const me = await api.get<Me>("/api/auth/me");
      setState({ status: "ready", me });
    } catch {
      setState({ status: "anon", me: null });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- первичная загрузка профиля по токену
    loadMe();
    const onUnauthorized = () => setState({ status: "anon", me: null });
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [loadMe]);

  const login = useCallback(
    async (token: string) => {
      tokenStore.set(token);
      await loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setState({ status: "anon", me: null });
  }, []);

  const can = useCallback((...roles: Role[]) => state.status === "ready" && roles.includes(state.me.role), [state]);

  return <AuthContext.Provider value={{ ...state, login, logout, can }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth вне AuthProvider");
  return ctx;
}

/** Текущий пользователь — только внутри экранов после входа. */
export function useMe(): Me {
  const auth = useAuth();
  if (auth.status !== "ready") throw new Error("Пользователь не вошёл");
  return auth.me;
}
