'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface RouteGuardProps {
  allowedRoles: ('SuperAdmin' | 'Admin' | 'AgentEY' | 'EmployeeEY')[];
  children: React.ReactNode;
}

export default function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const { roles, isLoading, isActive } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!roles) {
        router.replace('/auth');
      } else if (!isActive && !roles.includes('SuperAdmin')) {
        router.replace('/auth/change-password');
      } else if (!allowedRoles.some(role => roles.includes(role))) {
        router.replace('/auth/forbidden'); 
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isLoading, isActive, roles, router, allowedRoles, pathname]);

  if (isLoading || !isAuthorized) return <p>Chargement...</p>;

  return <>{children}</>;
}