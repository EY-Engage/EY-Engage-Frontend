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
}

const AuthContext = createContext<AuthContextType | null>(null);

// Fonction API simplifiée pour éviter les dépendances circulaires
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
    isAuthenticated: false
  });

  // Refs pour éviter les multiples appels
  const isValidatingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const logoutInProgressRef = useRef(false);

  // Fonction pour récupérer le token CSRF
  const fetchCsrfToken = async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/csrf-token', {
        method: 'GET'
      });
      console.log('CSRF token fetched successfully');
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  };

  // Fonction logout sans dépendances circulaires
  const logout = useCallback(async () => {
    // Éviter les appels multiples de logout
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    try {
      // Appel API de logout sans attendre la réponse pour éviter les blocages
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
        isAuthenticated: false
      });
      
      // Reset des flags
      hasInitializedRef.current = false;
      isValidatingRef.current = false;
      isRefreshingRef.current = false;
      
      // Supprimer les cookies côté client
      document.cookie = 'ey-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'ey-refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Redirection seulement si pas déjà sur la page de login
      if (!pathname?.startsWith('/auth')) {
        router.push('/auth');
      }
      
      logoutInProgressRef.current = false;
    }
  }, [pathname, router]);

  // Fonction pour rafraîchir le token SANS déclencher de logout automatique
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // Éviter les refresh multiples simultanés
    if (isRefreshingRef.current) return false;
    
    const refreshTokenValue = getCookie('ey-refresh');
    if (!refreshTokenValue) {
      return false; // Pas de token, pas de refresh
    }

    isRefreshingRef.current = true;

    try {
      // Tentative de refresh
      await apiRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      // Si le refresh réussit, valider la session
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
        isAuthenticated: true
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
        setAuthState(prev => ({ ...prev, isLoading: false }));
        hasInitializedRef.current = true;
        return;
      }

      // Éviter les validations multiples
      if (isValidatingRef.current || hasInitializedRef.current) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      isValidatingRef.current = true;
      
      try {
        const data = await apiRequest<AuthResponse>('/api/auth/validate', {
          method: 'GET'
        });
        
        if (!isMounted) return;
        
        setAuthState({
          user: data.user || null,
          email: data.email || '',
          roles: data.roles || [],
          isActive: data.isActive || false,
          isFirstLogin: data.isFirstLogin || false,
          isLoading: false,
          isAuthenticated: true
        });
        
        hasInitializedRef.current = true;
      } catch (error) {
        if (!isMounted) return;
        
        // Session invalide - essayer de refresh UNE SEULE FOIS
        const refreshSuccess = await refreshToken();
        
        if (!refreshSuccess) {
          setAuthState({
            user: null,
            email: '',
            roles: [],
            isActive: false,
            isFirstLogin: false,
            isLoading: false,
            isAuthenticated: false
          });

          // Redirection vers login seulement si nécessaire
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

    // Exécuter la validation seulement au premier montage
    if (!hasInitializedRef.current) {
      validateSession();
    }

    return () => {
      isMounted = false;
    };
  }, [pathname, router, refreshToken]);

  // Intercepteur global pour les erreurs 401
  useEffect(() => {
    const handleUnauthorized = async (response: Response, url: string, init?: RequestInit): Promise<Response> => {
      // Ne pas intercepter les appels d'auth eux-mêmes
      if (url.includes('/auth/')) {
        return response;
      }

      if (response.status === 401 && !isRefreshingRef.current) {
        const refreshSuccess = await refreshToken();
        
        if (refreshSuccess && init) {
          // Rejouer la requête originale
          return fetch(url, init);
        } else {
          // Refresh échoué - logout
          await logout();
        }
      }
      
      return response;
    };

    // Wrapper pour fetch
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const response = await originalFetch(input, init);
      
      if (response.status === 401) {
        const url = typeof input === 'string' ? input : input.toString();
        return handleUnauthorized(response, url, init);
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshToken, logout]);

  // Rafraîchissement périodique du token (toutes les 10 minutes)
useEffect(() => {
  if (!authState.isAuthenticated) return;

  const refreshInterval = setInterval(async () => {
    try {
      await refreshToken();
      // Mettre à jour le timestamp du dernier rafraîchissement
      localStorage.setItem('lastTokenRefresh', Date.now().toString());
    } catch (error) {
      logout();
    }
  }, 14 * 60 * 1000); // 14 minutes < durée du token

  return () => clearInterval(refreshInterval);
}, [authState.isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const data = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.needsPasswordChange) {
        setAuthState({
          user: null,
          email: data.email || email,
          roles: data.roles || [],
          isActive: data.isActive || false,
          isFirstLogin: data.isFirstLogin || false,
          isLoading: false,
          isAuthenticated: false
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
        isAuthenticated: true
      });

      hasInitializedRef.current = true;

      // Générer le token CSRF après connexion réussie
      await fetchCsrfToken();

      // Redirection selon le rôle
      const isSupervisor = data.roles?.some((role: string) => 
        ['SuperAdmin', 'Admin', 'AgentEY'].includes(role)
      );
      
      router.push(isSupervisor ? '/EyEngage/SupervisorDashboard' : '/EyEngage/EmployeeDashboard');

    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false
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
        isAuthenticated: true
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