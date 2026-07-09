import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { registerCustomer, loginCustomer, getCurrentCustomer } from "@/lib/customer.functions";

const TOKEN_KEY = "maison_customer_token";

type Customer = { id: string; email: string; name: string };

type AuthContextValue = {
  customer: Customer | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    name: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      getCurrentCustomer({ data: { token: saved } })
        .then((c) => {
          if (c) {
            setCustomer(c);
            setToken(saved);
          } else {
            localStorage.removeItem(TOKEN_KEY);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await loginCustomer({ data: { email, password } });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setCustomer(res.customer);
  }

  async function register(email: string, name: string, password: string, confirmPassword: string) {
    const res = await registerCustomer({ data: { email, name, password, confirmPassword } });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setCustomer(res.customer);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCustomer(null);
  }

  return (
    <AuthContext.Provider value={{ customer, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
