import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetAdminMe, getGetAdminMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const { data: admin, isLoading: isCheckingAuth } = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      enabled: !!token,
      retry: false,
    },
  });

  const isAuthenticated = !!admin && !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem("admin_token", token);
    } else {
      localStorage.removeItem("admin_token");
    }
  }, [token]);

  const login = (newToken: string) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading: isCheckingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
