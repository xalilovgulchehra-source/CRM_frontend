"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User, AuthResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get<User>("/auth/me")
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.token);
      setUser(res.user);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", res.token);
      setUser(res.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
