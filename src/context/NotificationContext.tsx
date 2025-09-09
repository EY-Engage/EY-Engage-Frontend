// src/context/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: {
    entityId?: string;
    entityType?: string;
    actionUrl?: string;
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    department?: string;
    additionalData?: any;
  };
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  archiveNotification: (notificationId: string) => void;
  getUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // Connexion WebSocket
  useEffect(() => {
    if (isAuthenticated && token && user) {
      console.log('Initializing notification socket connection...');
      
      const socketInstance = io(`${process.env.NEXT_PUBLIC_NEST_URL}/notifications`, {
        auth: {
          token: token,
        },
        transports: ['websocket'],
        forceNew: true,
      });

      socketInstance.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Notification socket connection error:', error);
        setIsConnected(false);
      });

      socketInstance.on('new_notification', (notification: Notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Afficher un toast selon la priorité
        showNotificationToast(notification);
        
        // Invalider les queries pertinentes
        invalidateRelatedQueries(notification);
        
        // Jouer un son pour les notifications urgentes
        if (notification.priority === 'urgent') {
          playNotificationSound();
        }
      });

      socketInstance.on('unread_notifications', (data: Notification[]) => {
        console.log('Unread notifications loaded:', data);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      });

      socketInstance.on('unread_count', (data: { count: number }) => {
        console.log('Unread count updated:', data.count);
        setUnreadCount(data.count);
      });

      socketInstance.on('notification_read', (data: { notificationId: string }) => {
        setNotifications(prev =>
          prev.map(n =>
            n.id === data.notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      socketInstance.on('all_notifications_read', () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      });

      setSocket(socketInstance);

      return () => {
        console.log('Cleaning up notification socket...');
        socketInstance.disconnect();
      };
    } else {
      // Nettoyer les notifications si pas authentifié
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
    }
  }, [isAuthenticated, token, user]);

  const showNotificationToast = (notification: Notification) => {
    const { title, message, metadata, priority } = notification;
    
    const toastOptions = {
      duration: priority === 'urgent' ? 8000 : 5000,
      position: 'top-right' as const,
    };

    const NotificationContent = (
      <div 
        className="cursor-pointer flex items-start gap-3 max-w-sm"
        onClick={() => {
          if (metadata?.actionUrl) {
            window.location.href = metadata.actionUrl;
          }
        }}
      >
        {metadata?.actorAvatar && (
          <img 
            src={metadata.actorAvatar} 
            alt="" 
            className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-ey-yellow"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-ey-black line-clamp-1">{title}</p>
          <p className="text-xs text-ey-gray-600 mt-1 line-clamp-2">{message}</p>
          {metadata?.department && (
            <span className="inline-block bg-ey-yellow text-ey-black text-xs px-2 py-1 rounded-full mt-2">
              {metadata.department}
            </span>
          )}
        </div>
      </div>
    );

    switch (priority) {
      case 'urgent':
        toast.error(NotificationContent, toastOptions);
        break;
      case 'high':
        toast(NotificationContent, { ...toastOptions, icon: '⚠️' });
        break;
      default:
        toast.success(NotificationContent, toastOptions);
    }
  };

  const invalidateRelatedQueries = (notification: Notification) => {
    const { type, metadata } = notification;
    
    switch (type) {
      case 'event_created':
      case 'event_approved':
      case 'event_rejected':
      case 'event_participation_request':
      case 'event_participation_approved':
      case 'event_participation_rejected':
        queryClient.invalidateQueries(['events']);
        break;
      case 'job_posted':
      case 'job_application':
      case 'job_recommendation':
      case 'job_interview_scheduled':
      case 'job_status_changed':
        queryClient.invalidateQueries(['jobs']);
        break;
      case 'post_mention':
      case 'post_comment':
      case 'post_reaction':
      case 'post_share':
        if (metadata?.entityId) {
          queryClient.invalidateQueries(['post', metadata.entityId]);
        }
        queryClient.invalidateQueries(['feed']);
        queryClient.invalidateQueries(['social']);
        break;
      case 'content_flagged':
      case 'moderation_action':
        queryClient.invalidateQueries(['flagged-content']);
        queryClient.invalidateQueries(['admin']);
        break;
      case 'welcome':
      case 'password_changed':
      case 'profile_updated':
        queryClient.invalidateQueries(['user']);
        break;
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  const markAsRead = useCallback((notificationId: string) => {
    if (socket && socket.connected) {
      socket.emit('mark_as_read', { notificationId });
    }
  }, [socket]);

  const markAllAsRead = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('mark_all_as_read');
    }
  }, [socket]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success('Notification supprimée');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [token]);

  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/api/notifications/${notificationId}/archive`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success('Notification archivée');
      } else {
        throw new Error('Erreur lors de l\'archivage');
      }
    } catch (error) {
      console.error('Archive notification error:', error);
      toast.error('Erreur lors de l\'archivage');
    }
  }, [token]);

  const getUnreadCount = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('get_unread_count');
    }
  }, [socket]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        archiveNotification,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};