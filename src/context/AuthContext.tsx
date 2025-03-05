"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserRole = "SuperAdmin" | "Admin" | "AgentEY" | "EmployeeEY" | null;

interface AuthContextType {
  userRole: UserRole;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("ey-engage-role") as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
      router.push(getRedirectPath(savedRole));
    }
    setIsLoading(false);
  }, []);

  const getRedirectPath = (role: UserRole) => {
    return role === "EmployeeEY" 
      ? "/EyEngage/EmployeeDashboard" 
      : "/EyEngage/SupervisorDashboard";
  };

  const login = (role: UserRole) => {
    setIsLoggingIn(true);
    localStorage.setItem("ey-engage-role", role || "");
    setUserRole(role);
    router.push(getRedirectPath(role));
    setTimeout(() => {
      setIsLoggingIn(false);
    }, 1000);
  };

  const logout = () => {
    localStorage.removeItem("ey-engage-role");
    setUserRole(null);
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ userRole, isLoading, isLoggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};