"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";

export function RouteGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userRole && !allowedRoles.includes(userRole)) {
      router.push(userRole === "EmployeeEY" ? "/EyEngage/EmployeeDashboard" : "/EyEngage/SupervisorDashboard");
    }
  }, [userRole, allowedRoles, router]);

  if (!userRole || !allowedRoles.includes(userRole)) return null;

  return <>{children}</>;
}