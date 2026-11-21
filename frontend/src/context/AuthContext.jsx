import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("dm_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    localStorage.setItem("dm_token", data.token);
    localStorage.setItem("dm_user", JSON.stringify(data.user));
    setUser(data.user); return data.user;
  };
  const register = async (name, email, password) => {
    const { data } = await client.post("/auth/register", { name, email, password });
    localStorage.setItem("dm_token", data.token);
    localStorage.setItem("dm_user", JSON.stringify(data.user));
    setUser(data.user); return data.user;
  };
  const logout = () => {
    localStorage.removeItem("dm_token"); localStorage.removeItem("dm_user"); setUser(null);
  };
  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}
