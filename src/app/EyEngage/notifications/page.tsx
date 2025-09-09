// src/app/EyEngage/notifications/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Filter, 
  Check, 
  CheckCheck, 
  Archive, 
  Trash2, 
  Settings,
  ChevronDown,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Info,
  MessageSquare,
  Briefcase,
  Users,
  Shield,
  Eye,
  Search,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RouteGuard from '@/components/RouteGuard';
import EnhancedLoading from '@/components/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationFilters {
  type: string;
  priority: string;
  isRead: string;
  department: string;
  dateRange: string;
}

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
  };
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const { markAsRead, markAllAsRead, deleteNotification, archiveNotification, isConnected } = useNotifications();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    priority: 'all',
    isRead: 'all',
    department: 'all',
    dateRange: 'all'
  });
  
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch notifications
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filters, currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.isRead !== 'all') params.append('isRead', filters.isRead);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/api/notifications?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors du chargement des notifications');
      return response.json();
    },
    enabled: !!token,
  });

  // Bulk actions mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, notificationIds }: { action: string; notificationIds: string[] }) => {
      for (const id of notificationIds) {
        switch (action) {
          case 'read':
            markAsRead(id);
            break;
          case 'archive':
            await archiveNotification(id);
            break;
          case 'delete':
            await deleteNotification(id);
            break;
        }
      }
    },
    onSuccess: () => {
      setSelectedNotifications([]);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const handleBulkAction = (action: string) => {
    if (selectedNotifications.length > 0) {
      bulkActionMutation.mutate({ action, notificationIds: selectedNotifications });
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'event_created': <Calendar className="h-5 w-5" />,
      'event_approved': <Check className="h-5 w-5" />,
      'event_rejected': <AlertTriangle className="h-5 w-5" />,
      'job_posted': <Briefcase className="h-5 w-5" />,
      'job_application': <User className="h-5 w-5" />,
      'post_mention': <Users className="h-5 w-5" />,
      'post_comment': <MessageSquare className="h-5 w-5" />,
      'content_flagged': <Shield className="h-5 w-5" />,
      'user_warning': <AlertTriangle className="h-5 w-5" />,
      'welcome': <User className="h-5 w-5" />,
    };
    return iconMap[type] || <Bell className="h-5 w-5" />;
  };

  const getTypeColor = (type: string) => {
    if (type.startsWith('event_')) return 'text-ey-accent-blue bg-ey-accent-blue/10';
    if (type.startsWith('job_')) return 'text-ey-green bg-ey-green/10';
    if (type.startsWith('post_')) return 'text-ey-purple bg-ey-purple/10';
    if (type.includes('flag') || type.includes('moderation')) return 'text-ey-red bg-ey-red/10';
    return 'text-ey-gray-600 bg-ey-gray-100';
  };

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

  const formatTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'event_created': 'Événement créé',
      'event_approved': 'Événement approuvé',
      'event_rejected': 'Événement rejeté',
      'event_participation_request': 'Demande de participation',
      'event_participation_approved': 'Participation approuvée',
      'event_participation_rejected': 'Participation rejetée',
      'event_comment': 'Commentaire événement',
      'job_posted': 'Offre d\'emploi publiée',
      'job_application': 'Candidature reçue',
      'job_recommendation': 'Recommandation',
      'job_interview_scheduled': 'Entretien programmé',
      'job_status_changed': 'Statut candidature modifié',
      'post_mention': 'Mention dans un post',
      'post_comment': 'Commentaire',
      'post_reaction': 'Réaction',
      'post_share': 'Partage',
      'content_flagged': 'Contenu signalé',
      'moderation_action': 'Action de modération',
      'user_warning': 'Avertissement',
      'welcome': 'Bienvenue',
      'password_changed': 'Mot de passe modifié',
      'profile_updated': 'Profil mis à jour',
    };
    return typeLabels[type] || type;
  };

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['EmployeeEY', 'SuperAdmin', 'Admin', 'AgentEY']}>
        <EnhancedLoading fullScreen message="Chargement des notifications..." variant="pulse" />
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['EmployeeEY', 'SuperAdmin', 'Admin', 'AgentEY']}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-ey-white rounded-ey-xl shadow-ey-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-ey-yellow to-ey-accent-blue rounded-ey-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-ey-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-ey-black">Centre de Notifications</h1>
                  <p className="text-ey-gray-600">Gérez vos notifications et préférences</p>
                </div>
              </div>
              {!isConnected && (
                <div className="bg-ey-red/10 text-ey-red px-3 py-1 rounded-ey-lg text-sm font-medium">
                  Hors ligne
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-ey-gray-100 text-ey-black rounded-ey-lg hover:bg-ey-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-ey-accent-blue text-ey-white rounded-ey-lg hover:bg-ey-accent-blue/90 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filtres
                <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-ey-white rounded-ey-xl shadow-ey-lg p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div>
                  <label className="block text-sm font-medium text-ey-black mb-2">Rechercher</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ey-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher dans les notifications..."
                      className="w-full pl-10 pr-4 py-2 border border-ey-gray-300 rounded-ey-lg focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ey-black mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border border-ey-gray-300 rounded-ey-lg focus:ring-2 focus:ring-ey-yellow"
                  >
                    <option value="all">Tous les types</option>
                    <option value="event">Événements</option>
                    <option value="job">Emplois</option>
                    <option value="post">Social</option>
                    <option value="system">Système</option>
                    <option value="moderation">Modération</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ey-black mb-2">Priorité</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-ey-gray-300 rounded-ey-lg focus:ring-2 focus:ring-ey-yellow"
                  >
                    <option value="all">Toutes priorités</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">Élevée</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Faible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ey-black mb-2">Statut</label>
                  <select
                    value={filters.isRead}
                    onChange={(e) => setFilters({ ...filters, isRead: e.target.value })}
                    className="w-full px-3 py-2 border border-ey-gray-300 rounded-ey-lg focus:ring-2 focus:ring-ey-yellow"
                  >
                    <option value="all">Toutes</option>
                    <option value="false">Non lues</option>
                    <option value="true">Lues</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions en lot */}
        {selectedNotifications.length > 0 && (
          <div className="bg-ey-yellow/10 border border-ey-yellow rounded-ey-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-ey-black font-medium">
                {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} sélectionnée{selectedNotifications.length > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('read')}
                  className="px-4 py-2 bg-ey-accent-blue text-ey-white rounded-ey-lg hover:bg-ey-accent-blue/90 transition-colors flex items-center gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marquer comme lu
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-4 py-2 bg-ey-orange text-ey-white rounded-ey-lg hover:bg-ey-orange/90 transition-colors flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archiver
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-ey-red text-ey-white rounded-ey-lg hover:bg-ey-red/90 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="bg-ey-white rounded-ey-xl shadow-ey-lg">
          {error ? (
            <div className="p-8 text-center text-ey-red">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-ey-red/50" />
              <p className="font-medium">Erreur lors du chargement des notifications</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-ey-accent-blue text-ey-white rounded-ey-lg hover:bg-ey-accent-blue/90 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : !data?.notifications?.length ? (
            <div className="p-8 text-center text-ey-gray-500">
              <Bell className="h-16 w-16 mx-auto mb-4 text-ey-gray-300" />
              <p className="text-lg font-medium">Aucune notification trouvée</p>
              <p className="text-sm mt-1">Vous êtes à jour!</p>
            </div>
          ) : (
            <div className="divide-y divide-ey-gray-100">
              {data.notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-ey-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-ey-yellow/5 border-l-4 border-ey-yellow' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications([...selectedNotifications, notification.id]);
                        } else {
                          setSelectedNotifications(
                            selectedNotifications.filter(id => id !== notification.id)
                          );
                        }
                      }}
                      className="mt-1 h-4 w-4 text-ey-yellow focus:ring-ey-yellow border-ey-gray-300 rounded"
                    />

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-ey-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-sm font-medium text-ey-black line-clamp-2 ${!notification.isRead ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority === 'urgent' ? 'Urgent' : 
                               notification.priority === 'high' ? 'Important' :
                               notification.priority === 'medium' ? 'Moyen' : 'Info'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-ey-gray-600 mb-3 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-ey-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </span>
                            </div>
                            
                            <span className="bg-ey-gray-100 text-ey-gray-700 px-2 py-1 rounded-full">
                              {formatTypeLabel(notification.type)}
                            </span>

                            {notification.metadata?.department && (
                              <span className="bg-ey-accent-blue/10 text-ey-accent-blue px-2 py-1 rounded-full">
                                {notification.metadata.department}
                              </span>
                            )}
                          </div>

                          {/* Actor info */}
                          {notification.metadata?.actorName && (
                            <div className="flex items-center gap-2 mt-3">
                              {notification.metadata.actorAvatar ? (
                                <img 
                                  src={notification.metadata.actorAvatar} 
                                  alt={notification.metadata.actorName}
                                  className="w-6 h-6 rounded-full border border-ey-gray-200"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-ey-yellow rounded-full flex items-center justify-center">
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
                        <div className="flex items-center gap-2 ml-4">
                          {notification.metadata?.actionUrl && (
                            <button
                              onClick={() => window.location.href = notification.metadata.actionUrl}
                              className="p-2 text-ey-gray-400 hover:text-ey-accent-blue transition-colors"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-ey-gray-400 hover:text-ey-green transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => archiveNotification(notification.id)}
                            className="p-2 text-ey-gray-400 hover:text-ey-orange transition-colors"
                            title="Archiver"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-ey-gray-400 hover:text-ey-red transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-ey-gray-200 flex items-center justify-between">
              <span className="text-sm text-ey-gray-600">
                Page {data.page} sur {data.totalPages} ({data.total} notification{data.total > 1 ? 's' : ''})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-ey-gray-100 text-ey-black rounded-ey-lg hover:bg-ey-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
                  disabled={currentPage === data.totalPages}
                  className="px-3 py-1 text-sm bg-ey-gray-100 text-ey-black rounded-ey-lg hover:bg-ey-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}