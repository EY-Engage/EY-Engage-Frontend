'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ExternalLink, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationDto, NotificationType } from '@/types/types';

interface NotificationItemProps {
  notification: NotificationDto;
  isLast?: boolean;
}

export default function NotificationItem({ notification, isLast }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead, deleteNotification } = useNotifications();

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

  const getPriorityColor = (type: NotificationType) => {
    const priorities = {
      [NotificationType.SYSTEM_ANNOUNCEMENT]: 'border-l-red-500',
      [NotificationType.EVENT_APPROVED]: 'border-l-green-500',
      [NotificationType.EVENT_REJECTED]: 'border-l-red-500',
      [NotificationType.JOB_INTERVIEW]: 'border-l-yellow-500',
      [NotificationType.MESSAGE_RECEIVED]: 'border-l-blue-500',
    };
    
    return priorities[type] || 'border-l-gray-300';
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      await deleteNotification(notification.id);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  return (
    <div
      className={`
        p-6 border-l-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 group
        ${!notification.isRead ? 'bg-yellow-50 border-l-yellow-400' : `bg-white ${getPriorityColor(notification.type)}`}
        ${!isLast ? 'border-b border-gray-200' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h3>
              <p className="text-gray-600 mt-1 leading-relaxed">
                {notification.content}
              </p>
              
              {/* Sender info */}
              {notification.senderName && (
                <p className="text-sm text-gray-500 mt-2">
                  De: <span className="font-medium">{notification.senderName}</span>
                </p>
              )}
              
              {/* Timestamp */}
              <p className="text-sm text-gray-400 mt-3">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: fr
                })}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Marquer comme lu"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              
              {notification.actionUrl && (
                <button
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Ouvrir"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-blue-600">Non lu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}