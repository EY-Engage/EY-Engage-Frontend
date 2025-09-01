// src/components/notifications/NotificationBell.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import { NotificationDto, NotificationType } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    error,
    clearError
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    const iconMap = {
      [NotificationType.SYSTEM_ANNOUNCEMENT]: '📢',
      [NotificationType.EVENT_CREATED]: '📅',
      [NotificationType.EVENT_APPROVED]: '✅',
      [NotificationType.EVENT_REJECTED]: '❌',
      [NotificationType.PARTICIPATION_REQUESTED]: '🙋',
      [NotificationType.PARTICIPATION_APPROVED]: '👍',
      [NotificationType.PARTICIPATION_REJECTED]: '👎',
      [NotificationType.JOB_APPLICATION]: '💼',
      [NotificationType.JOB_INTERVIEW]: '🎯',
      [NotificationType.POST_LIKED]: '❤️',
      [NotificationType.POST_COMMENTED]: '💬',
      [NotificationType.POST_SHARED]: '🔄',
      [NotificationType.USER_FOLLOWED]: '👥',
      [NotificationType.MESSAGE_RECEIVED]: '📨',
      [NotificationType.CONVERSATION_CREATED]: '💬',
      [NotificationType.MENTION]: '🏷️',
      [NotificationType.REPLY]: '↩️',
      [NotificationType.REACTION]: '😊'
    };
    
    return iconMap[type] || '🔔';
  };

  // Get notification priority color
  const getPriorityColor = (type: NotificationType) => {
    const priorities = {
      [NotificationType.SYSTEM_ANNOUNCEMENT]: 'border-l-red-500 bg-red-50',
      [NotificationType.EVENT_APPROVED]: 'border-l-green-500 bg-green-50',
      [NotificationType.EVENT_REJECTED]: 'border-l-red-500 bg-red-50',
      [NotificationType.JOB_INTERVIEW]: 'border-l-yellow-500 bg-yellow-50',
      [NotificationType.MESSAGE_RECEIVED]: 'border-l-blue-500 bg-blue-50',
    };
    
    return priorities[type] || 'border-l-gray-300 bg-white';
  };

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to relevant page if actionUrl exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setIsOpen(false);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle delete notification
  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  // Load more notifications
  const loadMoreNotifications = () => {
    const currentPage = Math.ceil(notifications.length / 20) + 1;
    fetchNotifications({ page: currentPage, limit: 20 });
  };

  // Display notifications (show first 5 if not showing all)
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-lg transition-colors duration-200
          ${isOpen 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    disabled={isLoading}
                  >
                    <CheckCheck className="h-4 w-4" />
                    Tout marquer
                  </button>
                )}
                
                <button
                  onClick={() => router.push('/EyEngage/Notifications')}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500">Chargement...</p>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Aucune notification</p>
                <p className="text-sm mt-1">Vous êtes à jour !</p>
              </div>
            ) : (
              displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    border-l-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
                    ${!notification.isRead ? 'bg-yellow-50 border-l-yellow-400' : getPriorityColor(notification.type)}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-lg mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.content}
                            </p>
                            
                            {/* Sender info */}
                            {notification.senderName && (
                              <p className="text-xs text-gray-500 mt-1">
                                De: {notification.senderName}
                              </p>
                            )}
                            
                            {/* Timestamp */}
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            
                            <button
                              onClick={(e) => handleDeleteNotification(e, notification.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            
                            {notification.actionUrl && (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              {!showAll && notifications.length > 5 ? (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
                >
                  Voir {notifications.length - 5} notification{notifications.length - 5 > 1 ? 's' : ''} de plus
                </button>
              ) : showAll && notifications.length > 5 ? (
                <button
                  onClick={() => setShowAll(false)}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-700 py-1"
                >
                  Réduire
                </button>
              ) : null}
              
              <button
                onClick={() => {
                  router.push('/EyEngage/Notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-700 font-medium py-2 mt-1 rounded-lg hover:bg-white transition-colors"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}