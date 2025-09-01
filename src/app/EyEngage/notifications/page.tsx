// src/app/EyEngage/Notifications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Filter,
  Search,
  Settings,
  Trash2,
  CheckCheck,
  Plus,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType, Department } from '@/types/types';
import BulkNotificationForm from './BulkNotificationForm';
import NotificationItem from './NotificationItem';
import NotificationPreferences from './NotificationPreferences';
import NotificationStats from './NotificationStats';
import SystemAnnouncementForm from './SystemAnnouncementForm';
import Modal from '@/components/shared/Modal';


export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAllAsRead,
    fetchStats,
    stats,
    fetchPreferences,
    preferences,
    cleanupOldNotifications,
    refreshNotifications
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'preferences' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isAdmin = user?.roles?.some(role => ['SuperAdmin', 'Admin', 'AgentEY'].includes(role));

  useEffect(() => {
    fetchNotifications({ page: 1, limit: 20 });
    fetchPreferences();
    
    if (isAdmin) {
      fetchStats(user?.department);
    }
  }, []);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    const response = await fetchNotifications({ 
      page: nextPage, 
      limit: 20,
      unreadOnly: activeTab === 'unread'
    });
    
    if (response && response.notifications.length < 20) {
      setHasMore(false);
    }
    setPage(nextPage);
  };

  const handleTabChange = (tab: 'all' | 'unread' | 'preferences' | 'admin') => {
    setActiveTab(tab);
    setPage(1);
    setHasMore(true);
    
    if (tab === 'all' || tab === 'unread') {
      fetchNotifications({ 
        page: 1, 
        limit: 20, 
        unreadOnly: tab === 'unread' 
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleFilterChange = (type: NotificationType | 'all') => {
    setFilterType(type);
    // Implement filter functionality
    console.log('Filtering by type:', type);
  };

  const handleCleanup = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer les notifications de plus de 90 jours ?')) {
      await cleanupOldNotifications(90);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-6 w-6 text-yellow-500" />
              Centre de notifications
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos notifications et paramètres de communication
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Tout marquer comme lu ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('all')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          
          <button
            onClick={() => handleTabChange('unread')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'unread'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Non lues ({unreadCount})
          </button>
          
          <button
            onClick={() => handleTabChange('preferences')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preferences'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-1" />
            Préférences
          </button>
          
          {isAdmin && (
            <button
              onClick={() => handleTabChange('admin')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'admin'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Administration
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'preferences' ? (
        <NotificationPreferences preferences={preferences} />
      ) : activeTab === 'admin' && isAdmin ? (
        <div className="space-y-6">
          {/* Admin Stats */}
          <NotificationStats stats={stats} />
          
          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setShowBulkModal(true)}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-yellow-300 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Notification en masse</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Envoyer des notifications à plusieurs utilisateurs
              </p>
            </button>
            
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-yellow-300 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Annonce système</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Diffuser une annonce importante à tous
              </p>
            </button>
            
            <button
              onClick={handleCleanup}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-red-300 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Nettoyage</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Supprimer les anciennes notifications
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </form>
              
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => handleFilterChange(e.target.value as NotificationType | 'all')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  {Object.values(NotificationType).map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {isLoading && notifications.length === 0 ? (
              <div className="p-12 text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-500">Chargement des notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'unread' 
                    ? 'Vous êtes à jour avec toutes vos notifications !' 
                    : 'Vous n\'avez pas encore reçu de notifications.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isLast={index === filteredNotifications.length - 1}
                  />
                ))}
                
                {/* Load More Button */}
                {hasMore && !isLoading && (
                  <div className="p-6 text-center border-t border-gray-200">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Charger plus de notifications
                    </button>
                  </div>
                )}
                
                {isLoading && notifications.length > 0 && (
                  <div className="p-6 text-center border-t border-gray-200">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Notification en masse"
      >
        <BulkNotificationForm onClose={() => setShowBulkModal(false)} />
      </Modal>

      <Modal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        title="Annonce système"
      >
        <SystemAnnouncementForm onClose={() => setShowAnnouncementModal(false)} />
      </Modal>
    </div>
  );
}