"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, 
  LogOut, 
  User, 
  Bell, 
  Settings,
  X,
  Search,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import EnhancedLoading from '@/components/SkeletonLoader';
import ImprovedSidebar from '@/components/ImprovedSidebar';
import { useAuth } from '@/context/AuthContext';

interface NotificationItem {
  id: number;
  text: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  avatar?: string;
}

interface ImprovedEyEngageLayoutProps {
  children: React.ReactNode;
}

export default function ImprovedEyEngageLayout({ children }: ImprovedEyEngageLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      text: 'Nouvel événement créé: Formation React',
      read: false,
      type: 'info',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      text: 'Votre candidature a été acceptée',
      read: false,
      type: 'success',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 3,
      text: 'Rappel: Réunion dans 30 minutes',
      read: true,
      type: 'warning',
      timestamp: new Date(Date.now() - 10800000)
    }
  ]);

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

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    const colors = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-orange-500',
      error: 'text-red-500'
    };
    return colors[type];
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading || authLoading) {
    return <EnhancedLoading fullScreen message="Chargement de votre espace de travail..." variant="pulse" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
            absolute inset-0 bg-black transition-opacity duration-300
            ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'}
          `}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`
          absolute left-0 top-0 h-full w-72 bg-gray-900 transform transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <ImprovedSidebar userRoles={userRoles} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {/* Help */}
                <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-blue-500 hover:text-blue-600"
                        >
                          Tout marquer comme lu
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>Aucune notification</p>
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div
                              key={notif.id}
                              className={`
                                p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
                                ${!notif.read ? 'bg-yellow-50' : ''}
                              `}
                              onClick={() => markNotificationAsRead(notif.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 ${getNotificationIcon(notif.type)}`}>
                                  <Bell className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{notif.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatTimestamp(notif.timestamp)}
                                  </p>
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-blue-500 hover:text-blue-600 font-medium">
                          Voir toutes les notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                    {userProfilePicture ? (
                      <img 
                        src={userProfilePicture} 
                        alt={userName}
                        className="h-8 w-8 rounded-full object-cover border-2 border-yellow-400"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-gray-900 font-semibold text-sm">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          {userProfilePicture ? (
                            <img 
                              src={userProfilePicture} 
                              alt={userName}
                              className="h-12 w-12 rounded-full object-cover border-2 border-yellow-400"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-gray-900 font-semibold text-lg">
                                {getUserInitials()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{userName}</p>
                            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                            {userRoles.length > 0 && (
                              <p className="text-xs text-yellow-600 mt-1">
                                {userRoles.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => router.push('/EyEngage/profile')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Mon profil</span>
                        </button>
                        <button
                          onClick={() => router.push('/EyEngage/settings')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <Settings className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Paramètres</span>
                        </button>
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
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
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white border-t border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Ernst & Young. Tous droits réservés.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                  Conditions d'utilisation
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                  Confidentialité
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}