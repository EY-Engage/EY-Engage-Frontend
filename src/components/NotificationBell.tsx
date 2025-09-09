// src/components/NotificationBell.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Archive, ExternalLink, Clock, User, Calendar, Briefcase, Users, MessageSquare, Shield, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { JSX } from 'react/jsx-runtime';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, archiveNotification, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-ey-red text-ey-white';
      case 'high':
        return 'bg-ey-orange text-ey-white';
      case 'medium':
        return 'bg-ey-accent-blue text-ey-white';
      default:
        return 'bg-ey-gray-200 text-ey-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'event_created': <Calendar className="h-4 w-4" />,
      'event_approved': <Check className="h-4 w-4" />,
      'event_rejected': <AlertTriangle className="h-4 w-4" />,
      'event_participation_request': <Users className="h-4 w-4" />,
      'event_participation_approved': <Check className="h-4 w-4" />,
      'event_participation_rejected': <AlertTriangle className="h-4 w-4" />,
      'event_comment': <MessageSquare className="h-4 w-4" />,
      'job_posted': <Briefcase className="h-4 w-4" />,
      'job_application': <User className="h-4 w-4" />,
      'job_recommendation': <Users className="h-4 w-4" />,
      'job_interview_scheduled': <Calendar className="h-4 w-4" />,
      'job_status_changed': <Briefcase className="h-4 w-4" />,
      'post_mention': <Users className="h-4 w-4" />,
      'post_comment': <MessageSquare className="h-4 w-4" />,
      'post_reaction': <MessageSquare className="h-4 w-4" />,
      'post_share': <Users className="h-4 w-4" />,
      'content_flagged': <Shield className="h-4 w-4" />,
      'moderation_action': <Shield className="h-4 w-4" />,
      'user_warning': <AlertTriangle className="h-4 w-4" />,
      'welcome': <User className="h-4 w-4" />,
      'password_changed': <Shield className="h-4 w-4" />,
      'profile_updated': <User className="h-4 w-4" />,
    };
    return iconMap[type] || <Bell className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    if (type.startsWith('event_')) return 'text-ey-accent-blue';
    if (type.startsWith('job_')) return 'text-ey-green';
    if (type.startsWith('post_')) return 'text-ey-purple';
    if (type.includes('flag') || type.includes('moderation')) return 'text-ey-red';
    return 'text-ey-gray-600';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-ey-gray-600 hover:text-ey-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ey-yellow rounded-lg transition-colors"
        title={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
      >
        <Bell className="h-6 w-6" />
        
        {/* Connection status indicator */}
        <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${isConnected ? 'bg-ey-green' : 'bg-ey-red'}`} 
             title={isConnected ? 'Connecté aux notifications temps réel' : 'Déconnecté du système de notifications'}>
        </div>
        
        {/* Unread count badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-ey-red text-ey-white text-xs rounded-full flex items-center justify-center font-bold shadow-ey-lg"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-ey-white rounded-ey-xl shadow-ey-2xl border border-ey-gray-200 z-50 max-h-[600px] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-ey-gray-200 bg-gradient-to-r from-ey-yellow/10 to-ey-accent-blue/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-ey-black" />
                  <h3 className="text-lg font-bold text-ey-black">Notifications</h3>
                  {!isConnected && (
                    <span className="text-xs bg-ey-red text-ey-white px-2 py-1 rounded-full">
                      Hors ligne
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-ey-accent-blue hover:text-ey-accent-blue/80 font-medium transition-colors"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                  <span className="text-xs bg-ey-yellow text-ey-black px-2 py-1 rounded-full font-bold">
                    {notifications.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[480px] scrollbar-ey">
              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center text-ey-gray-500">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-ey-gray-300" />
                  <p className="text-lg font-medium">Aucune notification</p>
                  <p className="text-sm mt-1">Vous êtes à jour!</p>
                </div>
              ) : (
                <div className="divide-y divide-ey-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`px-6 py-4 hover:bg-ey-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-ey-yellow/5 border-l-4 border-ey-yellow' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        if (notification.metadata?.actionUrl) {
                          setIsOpen(false);
                          window.location.href = notification.metadata.actionUrl;
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-ey-gray-100 flex items-center justify-center ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`text-sm font-medium text-ey-black line-clamp-2 ${!notification.isRead ? 'font-bold' : ''}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-ey-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {/* Metadata */}
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center gap-1 text-xs text-ey-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                      addSuffix: true,
                                      locale: fr,
                                    })}
                                  </span>
                                </div>
                                
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority === 'urgent' ? 'Urgent' : 
                                   notification.priority === 'high' ? 'Important' :
                                   notification.priority === 'medium' ? 'Moyen' : 'Info'}
                                </span>

                                {notification.metadata?.department && (
                                  <span className="text-xs bg-ey-accent-blue/10 text-ey-accent-blue px-2 py-1 rounded-full">
                                    {notification.metadata.department}
                                  </span>
                                )}
                              </div>

                              {/* Actor info if available */}
                              {notification.metadata?.actorName && (
                                <div className="flex items-center gap-2 mt-2">
                                  {notification.metadata.actorAvatar ? (
                                    <img 
                                      src={notification.metadata.actorAvatar} 
                                      alt={notification.metadata.actorName}
                                      className="w-5 h-5 rounded-full border border-ey-gray-200"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 bg-ey-yellow rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-ey-black">
                                        {notification.metadata.actorName.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-xs text-ey-gray-600">
                                    {notification.metadata.actorName}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1 ml-2">
                              {notification.metadata?.actionUrl && (
                                <button
                                  className="p-1 text-ey-gray-400 hover:text-ey-accent-blue transition-colors"
                                  title="Voir"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              )}
                              
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 text-ey-gray-400 hover:text-ey-green transition-colors"
                                  title="Marquer comme lu"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveNotification(notification.id);
                                }}
                                className="p-1 text-ey-gray-400 hover:text-ey-orange transition-colors"
                                title="Archiver"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 text-ey-gray-400 hover:text-ey-red transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-t border-ey-gray-200 bg-ey-gray-50">
                <Link
                  href="/EyEngage/notifications"
                  className="text-sm text-ey-accent-blue hover:text-ey-accent-blue/80 font-medium transition-colors flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  Voir toutes les notifications
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};