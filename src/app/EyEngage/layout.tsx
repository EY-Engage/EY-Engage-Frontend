// src/app/EyEngage/layout.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, 
  LogOut, 
  User, 
  Settings,
  X,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import EnhancedLoading from '@/components/SkeletonLoader';
import ImprovedSidebar from '@/components/ImprovedSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationProvider } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

interface ImprovedEyEngageLayoutProps {
  children: React.ReactNode;
}

export default function ImprovedEyEngageLayout({ children }: ImprovedEyEngageLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Récupération correcte des données depuis AuthContext
  const { user, roles, logout, isLoading: authLoading } = useAuth();
  
  // Extraction des données utilisateur
  const userName = user?.fullName || 'Utilisateur';
  const userEmail = user?.email || '';
  const userProfilePicture = user?.profilePicture;
  const userRoles = roles || [];
  
  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!userName) return 'U';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    // Ne plus simuler le chargement si auth est déjà chargé
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return <EnhancedLoading fullScreen message="Chargement de votre espace de travail..." variant="pulse" />;
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-ey-light-gray overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-72 h-full">
            <ImprovedSidebar userRoles={userRoles} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`
          lg:hidden fixed inset-0 z-50 transition-all duration-300
          ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}>
          {/* Overlay */}
          <div 
            className={`
              absolute inset-0 bg-ey-black transition-opacity duration-300
              ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'}
            `}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`
            absolute left-0 top-0 h-full w-72 bg-ey-black transform transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <ImprovedSidebar userRoles={userRoles} onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-ey-white border-b border-ey-gray-200 shadow-ey-sm">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left side */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 rounded-ey-lg text-ey-gray-600 hover:bg-ey-gray-100 hover:text-ey-black transition-colors"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                  
                  {/* Breadcrumb ou titre de page */}
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-ey-black">
                      {pathname?.includes('SupervisorDashboard') ? 'Administration' : 
                       pathname?.includes('EmployeeDashboard') ? 'Tableau de bord' : 'EY Engage'}
                    </h1>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                  {/* Help */}
                  <button 
                    className="p-2 rounded-ey-lg text-ey-gray-600 hover:bg-ey-gray-100 hover:text-ey-black transition-colors"
                    title="Centre d'aide"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>

                  {/* Notifications Bell */}
                  <NotificationBell />

                  {/* Profile */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 p-2 rounded-ey-lg hover:bg-ey-gray-100 transition-colors"
                    >
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium text-ey-black">{userName}</p>
                        <p className="text-xs text-ey-gray-500">{userEmail}</p>
                      </div>
                      {userProfilePicture ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${userProfilePicture}`} 
                          alt={userName}
                          className="h-8 w-8 rounded-full object-cover border-2 border-ey-yellow"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-ey-yellow rounded-full flex items-center justify-center border-2 border-ey-yellow">
                          <span className="text-ey-black font-semibold text-sm">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}
                      <ChevronDown className="h-4 w-4 text-ey-gray-400" />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-ey-white rounded-ey-xl shadow-ey-2xl border border-ey-gray-200 z-50">
                        <div className="p-4 border-b border-ey-gray-200">
                          <div className="flex items-center gap-3">
                            {userProfilePicture ? (
                              <img 
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${userProfilePicture}`} 
                                alt={userName}
                                className="h-12 w-12 rounded-full object-cover border-2 border-ey-yellow"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-ey-yellow rounded-full flex items-center justify-center">
                                <span className="text-ey-black font-semibold text-lg">
                                  {getUserInitials()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-ey-black truncate">{userName}</p>
                              <p className="text-xs text-ey-gray-500 truncate">{userEmail}</p>
                              {userRoles.length > 0 && (
                                <p className="text-xs text-ey-yellow-dark mt-1 font-medium">
                                  {userRoles.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              router.push('/EyEngage/profile');
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-ey-lg hover:bg-ey-gray-100 transition-colors text-left"
                          >
                            <User className="h-4 w-4 text-ey-gray-600" />
                            <span className="text-sm text-ey-black">Mon profil</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push('/EyEngage/settings');
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-ey-lg hover:bg-ey-gray-100 transition-colors text-left"
                          >
                            <Settings className="h-4 w-4 text-ey-gray-600" />
                            <span className="text-sm text-ey-black">Paramètres</span>
                          </button>
                          <hr className="my-2 border-ey-gray-200" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-ey-lg hover:bg-ey-red/10 transition-colors text-left text-ey-red"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-ey-light-gray to-ey-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-ey-black text-ey-white border-t border-ey-gray-800">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ey-gray-400">
                  © {new Date().getFullYear()} Ernst & Young. Tous droits réservés.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-sm text-ey-gray-400 hover:text-ey-yellow transition-colors">
                    Conditions d'utilisation
                  </a>
                  <a href="#" className="text-sm text-ey-gray-400 hover:text-ey-yellow transition-colors">
                    Confidentialité
                  </a>
                  <a href="#" className="text-sm text-ey-gray-400 hover:text-ey-yellow transition-colors">
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Toast Container avec style EY */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#FFFFFF',
              color: '#1A1A24',
              boxShadow: '0 25px 50px -12px rgba(26, 26, 36, 0.25)',
              border: '1px solid #E7E7EA',
              borderRadius: '0.75rem',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </div>
    </NotificationProvider>
  );
}