import { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("askhero_deal_token");
    if (!token) return;
    api.get("/auth/me").then((res) => setUser(res.data.user)).catch(() => localStorage.removeItem("askhero_deal_token"));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("askhero_deal_token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("askhero_deal_token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("askhero_deal_token");
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    role: user?.role,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user)
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
