'use client';

import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Smartphone, Settings } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType, NotificationPreferences as NotificationPreferencesType } from '@/types/types';

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesType | null;
}

export default function NotificationPreferences({ preferences }: NotificationPreferencesProps) {
  const { updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferencesType>({
    emailNotifications: true,
    pushNotifications: true,
    notificationTypes: Object.values(NotificationType)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updatePreferences(localPreferences);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotificationType = (type: NotificationType) => {
    setLocalPreferences(prev => ({
      ...prev,
      notificationTypes: prev.notificationTypes.includes(type)
        ? prev.notificationTypes.filter(t => t !== type)
        : [...prev.notificationTypes, type]
    }));
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels = {
      [NotificationType.SYSTEM_ANNOUNCEMENT]: 'Annonces système',
      [NotificationType.EVENT_CREATED]: 'Nouveaux événements',
      [NotificationType.EVENT_APPROVED]: 'Événements approuvés',
      [NotificationType.EVENT_REJECTED]: 'Événements rejetés',
      [NotificationType.PARTICIPATION_REQUESTED]: 'Demandes de participation',
      [NotificationType.PARTICIPATION_APPROVED]: 'Participations approuvées',
      [NotificationType.PARTICIPATION_REJECTED]: 'Participations rejetées',
      [NotificationType.JOB_APPLICATION]: 'Candidatures',
      [NotificationType.JOB_INTERVIEW]: 'Entretiens',
      [NotificationType.POST_LIKED]: 'J\'aime sur mes posts',
      [NotificationType.POST_COMMENTED]: 'Commentaires sur mes posts',
      [NotificationType.POST_SHARED]: 'Partages de mes posts',
      [NotificationType.USER_FOLLOWED]: 'Nouveaux abonnés',
      [NotificationType.MESSAGE_RECEIVED]: 'Nouveaux messages',
      [NotificationType.CONVERSATION_CREATED]: 'Nouvelles conversations',
      [NotificationType.MENTION]: 'Mentions',
      [NotificationType.REPLY]: 'Réponses',
      [NotificationType.REACTION]: 'Réactions'
    };
    
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900">Préférences de notification</h2>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.emailNotifications}
                onChange={(e) => setLocalPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <span className="font-medium text-gray-900">Notifications par email</span>
                <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.pushNotifications}
                onChange={(e) => setLocalPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <Smartphone className="h-5 w-5 text-gray-600" />
              <div>
                <span className="font-medium text-gray-900">Notifications push</span>
                <p className="text-sm text-gray-500">Recevoir les notifications en temps réel dans le navigateur</p>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Types de notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(NotificationType).map(type => (
              <label
                key={type}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localPreferences.notificationTypes.includes(type)}
                  onChange={() => handleToggleNotificationType(type)}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">{getTypeLabel(type)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {isSaved && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Préférences sauvegardées</span>
              </>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}