'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, AlertTriangle, RefreshCw } from 'lucide-react';
import { PostDto, ContentType } from '@/types/types';
import { UserDto } from '@/dtos/user/UserDto';

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description?: string) => Promise<void>;
  post: PostDto;
  currentUser?: UserDto;
  loading?: boolean;
}

const flagReasons = [
  {
    id: 'inappropriate_content',
    label: 'Contenu inapproprié',
    description: 'Contenu offensant, vulgaire ou non professionnel'
  },
  {
    id: 'harassment',
    label: 'Harcèlement',
    description: 'Harcèlement, intimidation ou menaces'
  },
  {
    id: 'spam',
    label: 'Spam ou contenu indésirable',
    description: 'Contenu répétitif, publicitaire non sollicité'
  },
  {
    id: 'misinformation',
    label: 'Désinformation',
    description: 'Informations fausses ou trompeuses'
  },
  {
    id: 'privacy_violation',
    label: 'Violation de la vie privée',
    description: 'Partage d\'informations privées sans consentement'
  },
  {
    id: 'copyright',
    label: 'Violation de droits d\'auteur',
    description: 'Utilisation non autorisée de contenu protégé'
  },
  {
    id: 'other',
    label: 'Autre',
    description: 'Autre raison non listée ci-dessus'
  }
];

export default function FlagModal({
  isOpen,
  onClose,
  onSubmit,
  post,
  currentUser,
  loading = false
}: FlagModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescriptionField, setShowDescriptionField] = useState(false);

  const handleReasonChange = (reasonId: string) => {
    setSelectedReason(reasonId);
    // Afficher le champ description pour "Autre" ou si une raison est sélectionnée
    setShowDescriptionField(reasonId === 'other' || reasonId !== '');
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      const selectedReasonData = flagReasons.find(r => r.id === selectedReason);
      const reason = selectedReasonData?.label || selectedReason;
      
      await onSubmit(reason, description.trim() || undefined);
      
      // Reset form
      setSelectedReason('');
      setDescription('');
      setShowDescriptionField(false);
      onClose();
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    setSelectedReason('');
    setDescription('');
    setShowDescriptionField(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 relative">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Signaler ce contenu</h2>
                <p className="text-red-100 text-sm">
                  Aidez-nous à maintenir une communauté respectueuse
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Post preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {post.authorName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {post.authorDepartment}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm line-clamp-3">
                {post.content}
              </p>
            </div>

            {/* Reason selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pourquoi signalez-vous ce contenu ?
              </label>
              
              {flagReasons.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedReason === reason.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="flagReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => handleReasonChange(e.target.value)}
                    className="mt-1 w-4 h-4 text-red-600"
                    disabled={isSubmitting}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {reason.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {reason.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Description field */}
            <AnimatePresence>
              {showDescriptionField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description détaillée {selectedReason === 'other' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez plus en détail le problème avec ce contenu..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm"
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {description.length}/500 caractères
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important :</p>
                <p>
                  Les signalements abusifs peuvent entraîner des sanctions sur votre compte. 
                  Assurez-vous que ce contenu viole réellement nos règles de communauté.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting || (selectedReason === 'other' && !description.trim())}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Signalement...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  Signaler
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}