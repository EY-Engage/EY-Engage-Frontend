// src/context/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { NotificationDto, NotificationType, NotificationPreferences, NotificationStats } from '@/types/types';
import { useAuth } from './AuthContext';
import { notificationService } from '@/lib/services/notificationService';

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  stats: NotificationStats | null;
  
  fetchNotifications: (params?: any) => Promise<any>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createNotification: (dto: any) => Promise<void>;
  createBulkNotification: (dto: any) => Promise<void>;
  sendSystemAnnouncement: (title: string, content: string, options?: any) => Promise<void>;
  updatePreferences: (prefs: NotificationPreferences) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  fetchStats: (department?: string) => Promise<void>;
  cleanupOldNotifications: (daysOld: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);

  // Initialiser la connexion WebSocket
  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001/notifications', {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to notifications WebSocket');
      });

      newSocket.on('new_notification', (notification: NotificationDto) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Afficher une notification browser si autorisé
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content,
            icon: '/favicon.ico',
          });
        }
      });

      newSocket.on('notification_updated', (update: any) => {
        setNotifications(prev => prev.map(n => 
          n.id === update.notificationId ? { ...n, ...update } : n
        ));
      });

      newSocket.on('notification_deleted', (data: { notificationId: string }) => {
        setNotifications(prev => prev.filter(n => n.id !== data.notificationId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);

  // Charger les notifications initiales
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user]);

  const fetchNotifications = useCallback(async (params?: any) => {
    if (!user || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.getNotifications(token, params);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
      return response;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des notifications');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!token) return;
    
    try {
      await notificationService.markAsRead(token, notificationId);
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage comme lu');
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    
    try {
      await notificationService.markAllAsRead(token);
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage comme lu');
    }
  }, [token]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!token) return;
    
    try {
      await notificationService.deleteNotification(token, notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  }, [token, notifications]);

  const createNotification = useCallback(async (dto: any) => {
    if (!token) return;
    
    try {
      await notificationService.createNotification(token, dto);
      await fetchNotifications();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  }, [token, fetchNotifications]);

  const createBulkNotification = useCallback(async (dto: any) => {
    if (!token) return;
    
    try {
      await notificationService.createBulkNotification(token, dto);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi en masse');
      throw err;
    }
  }, [token]);

  const sendSystemAnnouncement = useCallback(async (title: string, content: string, options?: any) => {
    if (!token) return;
    
    try {
      await notificationService.sendSystemAnnouncement(token, title, content, options);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annonce système');
      throw err;
    }
  }, [token]);

  const updatePreferences = useCallback(async (prefs: NotificationPreferences) => {
    if (!token) return;
    
    try {
      await notificationService.updatePreferences(token, prefs);
      setPreferences(prefs);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour des préférences');
      throw err;
    }
  }, [token]);

  const fetchPreferences = useCallback(async () => {
    if (!token) return;
    
    try {
      const prefs = await notificationService.getPreferences(token);
      setPreferences(prefs);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des préférences');
    }
  }, [token]);

  const fetchStats = useCallback(async (department?: string) => {
    if (!token) return;
    
    try {
      const statsData = await notificationService.getStats(token, department);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques');
    }
  }, [token]);

  const cleanupOldNotifications = useCallback(async (daysOld: number) => {
    if (!token) return;
    
    try {
      await notificationService.cleanupOldNotifications(token, daysOld);
      await fetchNotifications();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du nettoyage');
      throw err;
    }
  }, [token, fetchNotifications]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        preferences,
        stats,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
        createBulkNotification,
        sendSystemAnnouncement,
        updatePreferences,
        fetchPreferences,
        fetchStats,
        cleanupOldNotifications,
        refreshNotifications,
        clearError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}