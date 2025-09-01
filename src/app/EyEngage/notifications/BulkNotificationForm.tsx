'use client';

import React, { useState } from 'react';
import { Send, Users, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { NotificationType, Department } from '@/types/types';

interface BulkNotificationFormProps {
  onClose: () => void;
}

export default function BulkNotificationForm({ onClose }: BulkNotificationFormProps) {
  const { createBulkNotification } = useNotifications();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    title: '',
    content: '',
    targetType: 'all' as 'all' | 'department' | 'role' | 'users',
    departmentFilter: '',
    roleFilter: [] as string[],
    userIds: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dto = {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        senderId: user?.id,
        senderName: user?.fullName,
        ...(formData.targetType === 'department' && { departmentFilter: formData.departmentFilter }),
        ...(formData.targetType === 'role' && { roleFilter: formData.roleFilter }),
        ...(formData.targetType === 'users' && { userIds: formData.userIds })
      };

      await createBulkNotification(dto);
      onClose();
    } catch (error) {
      console.error('Error sending bulk notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de notification
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NotificationType }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        >
          {Object.values(NotificationType).map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contenu
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />
      </div>

      {/* Target */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinataires
        </label>
        <select
          value={formData.targetType}
          onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="all">Tous les utilisateurs</option>
          <option value="department">Par département</option>
          <option value="role">Par rôle</option>
        </select>
      </div>

      {/* Department Filter */}
      {formData.targetType === 'department' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Département
          </label>
          <select
            value={formData.departmentFilter}
            onChange={(e) => setFormData(prev => ({ ...prev, departmentFilter: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          >
            <option value="">Sélectionner un département</option>
            {Object.values(Department).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
}