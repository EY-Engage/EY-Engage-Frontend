'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCookie } from '@/lib/coockies';
import { UserDto } from '@/dtos/user/UserDto';

interface AuthState {
  user: UserDto | null;
  email: string;
  roles: string[];
  isActive: boolean;
  isFirstLogin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null; // AJOUT CRITIQUE
}


interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (email: string, currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

interface AuthResponse {
  user?: UserDto;
  id?: string;
  email?: string;
  fullName?: string;
  roles?: string[];
  isActive?: boolean;
  isFirstLogin?: boolean;
  needsPasswordChange?: boolean;
  message?: string;
  accessToken?: string; // ✅ AJOUT DU TOKEN DANS LA RÉPONSE
}

const AuthContext = createContext<AuthContextType | null>(null);

// Fonction API simplifiée
const apiRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL not configured");

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${backendUrl}${endpoint}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return await response.json();
};

// ✅ FONCTION POUR RÉCUPÉRER LE TOKEN DEPUIS LES COOKIES
const getTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null;
  return getCookie('ey-session') || null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    email: '',
    roles: [],
    isActive: false,
    isFirstLogin: false,
    isLoading: true,
    isAuthenticated: false,
    token: null, // ✅ INITIALISATION DU TOKEN
  });

  // Refs pour éviter les multiples appels
  const isValidatingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const logoutInProgressRef = useRef(false);

  // ✅ FONCTION POUR METTRE À JOUR LE TOKEN
  const updateToken = useCallback(() => {
    const newToken = getTokenFromCookies();
    setAuthState(prev => ({ ...prev, token: newToken }));
    return newToken;
  }, []);

  // ✅ SURVEILLER LES CHANGEMENTS DE TOKEN
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = getTokenFromCookies();
      setAuthState(prev => {
        if (prev.token !== currentToken) {
          return { ...prev, token: currentToken };
        }
        return prev;
      });
    }, 1000); // Vérifier toutes les secondes

    return () => clearInterval(interval);
  }, []);

  // Fonction logout
  const logout = useCallback(async () => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    try {
      // Appel API de logout
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // Ignorer les erreurs de logout
      });
    } finally {
      // Reset complet de l'état
      setAuthState({
        user: null,
        email: '',
        roles: [],
        isActive: false,
        isFirstLogin: false,
        isLoading: false,
        isAuthenticated: false,
        token: null, // ✅ RESET DU TOKEN
      });

      // Reset des flags
      hasInitializedRef.current = false;
      isValidatingRef.current = false;
      isRefreshingRef.current = false;

      // Supprimer les cookies côté client
      document.cookie = 'ey-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'ey-refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Redirection
      if (!pathname?.startsWith('/auth')) {
        router.push('/auth');
      }

      logoutInProgressRef.current = false;
    }
  }, [pathname, router]);

  // Fonction pour rafraîchir le token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;

    const refreshTokenValue = getCookie('ey-refresh');
    if (!refreshTokenValue) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const refreshResponse = await apiRequest<AuthResponse>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      // ✅ RÉCUPÉRER LE NOUVEAU TOKEN DEPUIS LES COOKIES APRÈS REFRESH
      const newToken = getTokenFromCookies();

      // Valider la session
      const data = await apiRequest<AuthResponse>('/api/auth/validate', {
        method: 'GET'
      });

      setAuthState({
        user: data.user || null,
        email: data.email || '',
        roles: data.roles || [],
        isActive: data.isActive || false,
        isFirstLogin: data.isFirstLogin || false,
        isLoading: false,
        isAuthenticated: true,
        token: newToken, // ✅ MISE À JOUR DU TOKEN
      });

      isRefreshingRef.current = false;
      return true;
    } catch (error) {
      console.error('Refresh token failed:', error);
      isRefreshingRef.current = false;
      return false;
    }
  }, []);

  // Validation initiale de la session
  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      // Pages publiques - pas de validation nécessaire
      const authPaths = ['/auth', '/auth/change-password', '/auth/forgot-password', '/auth/reset-password'];
      if (authPaths.some(path => pathname?.startsWith(path))) {
        const token = getTokenFromCookies();
        setAuthState(prev => ({ ...prev, isLoading: false, token }));
        hasInitializedRef.current = true;
        return;
      }

      // Éviter les validations multiples
      if (isValidatingRef.current || hasInitializedRef.current) {
        const token = getTokenFromCookies();
        setAuthState(prev => ({ ...prev, isLoading: false, token }));
        return;
      }

      isValidatingRef.current = true;

      try {
        const data = await apiRequest<AuthResponse>('/api/auth/validate', {
          method: 'GET'
        });

        if (!isMounted) return;

        // ✅ RÉCUPÉRER LE TOKEN APRÈS VALIDATION
        const token = getTokenFromCookies();

        setAuthState({
          user: data.user || null,
          email: data.email || '',
          roles: data.roles || [],
          isActive: data.isActive || false,
          isFirstLogin: data.isFirstLogin || false,
          isLoading: false,
          isAuthenticated: true,
          token, // ✅ INCLURE LE TOKEN
        });

        hasInitializedRef.current = true;
      } catch (error) {
        if (!isMounted) return;

        // Session invalide - essayer de refresh
        const refreshSuccess = await refreshToken();

        if (!refreshSuccess) {
          setAuthState({
            user: null,
            email: '',
            roles: [],
            isActive: false,
            isFirstLogin: false,
            isLoading: false,
            isAuthenticated: false,
            token: null, // ✅ RESET DU TOKEN
          });

          if (!authPaths.some(path => pathname?.startsWith(path))) {
            router.push('/auth');
          }
        }

        hasInitializedRef.current = true;
      } finally {
        if (isMounted) {
          isValidatingRef.current = false;
        }
      }
    };

    if (!hasInitializedRef.current) {
      validateSession();
    }

    return () => {
      isMounted = false;
    };
  }, [pathname, router, refreshToken]);

  // Rafraîchissement périodique du token
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
        localStorage.setItem('lastTokenRefresh', Date.now().toString());
      } catch (error) {
        logout();
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(refreshInterval);
  }, [authState.isAuthenticated, refreshToken, logout]);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const data = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // ✅ RÉCUPÉRER LE TOKEN APRÈS LOGIN
      const token = getTokenFromCookies();

      if (data.needsPasswordChange) {
        setAuthState({
          user: null,
          email: data.email || email,
          roles: data.roles || [],
          isActive: data.isActive || false,
          isFirstLogin: data.isFirstLogin || false,
          isLoading: false,
          isAuthenticated: false,
          token, // ✅ INCLURE LE TOKEN MÊME EN CAS DE CHANGEMENT REQUIS
        });
        router.push('/auth/change-password');
        return;
      }

      // Connexion réussie
      setAuthState({
        user: data.user || {
          id: data.id || '',
          email: data.email || email,
          fullName: data.fullName || ''
        },
        email: data.email || email,
        roles: data.roles || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        isFirstLogin: data.isFirstLogin || false,
        isLoading: false,
        isAuthenticated: true,
        token, // ✅ INCLURE LE TOKEN
      });

      hasInitializedRef.current = true;

      // Redirection selon le rôle
      const isSupervisor = data.roles?.some((role: string) => 
        ['SuperAdmin', 'Admin', 'AgentEY'].includes(role)
      );

      router.push(isSupervisor ? '/EyEngage/SupervisorDashboard' : '/EyEngage/EmployeeDashboard');

    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        token: null, // ✅ RESET DU TOKEN EN CAS D'ERREUR
      }));

      throw new Error(error.message || 'Erreur de connexion');
    }
  };

  const changePassword = async (
    email: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      const data = await apiRequest<AuthResponse>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          email,
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword
        })
      });

      // ✅ RÉCUPÉRER LE TOKEN APRÈS CHANGEMENT DE MOT DE PASSE
      const token = getTokenFromCookies();

      setAuthState({
        user: data.user || {
          id: data.id || '',
          email: data.email || email,
          fullName: data.fullName || ''
        },
        email: data.email || email,
        roles: data.roles || [],
        isActive: true,
        isFirstLogin: false,
        isLoading: false,
        isAuthenticated: true,
        token, // ✅ INCLURE LE TOKEN
      });

      hasInitializedRef.current = true;

      const isSupervisor = data.roles?.some((role: string) => 
        ['SuperAdmin', 'Admin', 'AgentEY'].includes(role)
      );

      router.push(isSupervisor ? '/EyEngage/SupervisorDashboard' : '/EyEngage/EmployeeDashboard');

    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du changement de mot de passe');
    }
  };

  // ✅ EFFET POUR SURVEILLER LES CHANGEMENTS DE TOKEN EN TEMPS RÉEL
  useEffect(() => {
    const checkToken = () => {
      const currentToken = getTokenFromCookies();
      setAuthState(prev => {
        if (prev.token !== currentToken) {
          console.log('Token updated:', currentToken ? 'Present' : 'Absent');
          return { ...prev, token: currentToken };
        }
        return prev;
      });
    };

    // Vérification initiale
    checkToken();

    // Surveiller les changements de cookies
    const interval = setInterval(checkToken, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        changePassword,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};