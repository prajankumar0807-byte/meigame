import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "../api";

type Auth = { user: User | null; loading: boolean; login: (u: string, p: string) => Promise<void>; logout: () => Promise<void> };
const Context = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.me().then(r => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const login = async (username: string, password: string) => { const r = await api.login({ username, password }); setUser(r.user); };
  const logout = async () => { await api.logout(); setUser(null); };
  return <Context.Provider value={{ user, loading, login, logout }}>{children}</Context.Provider>;
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("useAuth must be inside AuthProvider");
  return value;
}
