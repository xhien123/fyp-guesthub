import React, { createContext, useContext, useEffect, useState } from "react";
import api, { login as apiLogin, logout as apiLogout, register as apiRegister } from "../lib/api";
import type { User } from "../types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>; // <--- ADDED THIS
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch current user session
  const checkUser = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    checkUser();
  }, []);

  // Listen for expiration events
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:expired", handler as any);
    return () => window.removeEventListener("auth:expired", handler as any);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const data = await apiLogin(email, pass);
    // Ensure we get the user object correctly (handle { user: ... } vs direct user)
    const userData = data.user || data; 
    setUser(userData);
    return userData;
  };

  const register = async (name: string, email: string, pass: string) => {
    // This can call either the old 'register' or be updated to call 'registerVerified' internally 
    // if you want 'register' to mean the verified flow. 
    // For now, let's keep it pointing to the basic one, but the Register PAGE calls API directly.
    const data = await apiRegister(name, email, pass);
    const userData = data.user || data;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      window.dispatchEvent(new CustomEvent("user:logout-success"));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};