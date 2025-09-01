'use client';

import React, { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { Department } from '@/types/types';
import { useAuth } from '@/context/AuthContext';

interface SystemAnnouncementFormProps {
  onClose: () => void;
}

export default function SystemAnnouncementForm({ onClose }: SystemAnnouncementFormProps) {
  const { sendSystemAnnouncement } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const { roles } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    targetDepartments: [] as Department[],
    targetRoles: roles
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendSystemAnnouncement(formData.title, formData.content, {
        priority: formData.priority,
        targetDepartments: formData.targetDepartments.length > 0 ? formData.targetDepartments : undefined,
        targetRoles: formData.targetRoles.length > 0 ? formData.targetRoles : undefined
      });
      onClose();
    } catch (error) {
      console.error('Error sending system announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-800">Annonce système</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Cette annonce sera visible par tous les utilisateurs concernés et ne peut pas être supprimée par les destinataires.
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de l'annonce
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Ex: Maintenance programmée du système"
          required
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contenu de l'annonce
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Décrivez l'annonce en détail..."
          required
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priorité
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="low">Faible</option>
          <option value="normal">Normale</option>
          <option value="high">Élevée</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

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
          className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Publication...' : 'Publier l\'annonce'}
        </button>
      </div>
    </form>
  );
}
