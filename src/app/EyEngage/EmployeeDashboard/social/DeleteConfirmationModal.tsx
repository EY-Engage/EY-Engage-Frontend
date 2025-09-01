'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, X, Trash2, Shield, Clock, 
  RefreshCw, CheckCircle, AlertCircle 
} from 'lucide-react';
import { PostDto } from '@/types/types';
import { postService } from '@/lib/services/social/postService';
import toast from 'react-hot-toast';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: PostDto;
  comment?: { id: string; content: string; authorName: string };
  onDeleted: (id: string) => void;
  type: 'post' | 'comment';
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  post,
  comment,
  onDeleted,
  type
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const targetContent = type === 'post' ? post?.content : comment?.content;
  const targetAuthor = type === 'post' ? post?.authorName : comment?.authorName;
  const targetId = type === 'post' ? post?.id : comment?.id;

  // Confirmation requise pour les contenus longs ou avec interactions
  const requiresConfirmation = type === 'post' && (
    (post?.likesCount || 0) > 5 || 
    (post?.commentsCount || 0) > 2 || 
    (post?.content?.length || 0) > 500
  );

  const expectedConfirmText = "SUPPRIMER";

  const handleDelete = async () => {
    if (requiresConfirmation && confirmText !== expectedConfirmText) {
      toast.error(`Veuillez taper "${expectedConfirmText}" pour confirmer`);
      return;
    }

    setIsDeleting(true);
    
    try {
      if (type === 'post' && post) {
        await postService.deletePost(post.id);
        toast.success('Publication supprimée avec succès');
      } else if (type === 'comment' && comment) {
        await postService.deleteComment(comment.id);
        toast.success('Commentaire supprimé avec succès');
      }
      
      onDeleted(targetId!);
      onClose();
      
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(`Erreur lors de la suppression du ${type === 'post' ? 'post' : 'commentaire'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setShowAdvancedOptions(false);
      onClose();
    }
  };

  if (!isOpen || !targetId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-md w-full overflow-hidden"
        >
          
          {/* En-tête d'alerte */}
          <div className="bg-gradient-to-r from-ey-red/10 to-ey-orange/10 p-6 border-b border-ey-red/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ey-red/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-ey-red" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ey-black mb-2">
                  Supprimer {type === 'post' ? 'la publication' : 'le commentaire'} ?
                </h3>
                <p className="text-ey-gray-700 text-sm">
                  Cette action est <strong>irréversible</strong>. Le contenu sera définitivement supprimé.
                </p>
              </div>
              
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="p-2 hover:bg-ey-black/10 rounded-ey-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-ey-gray-600" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-4">
            
            {/* Aperçu du contenu à supprimer */}
            <div className="bg-ey-gray-50 rounded-ey-lg p-4 border-l-4 border-ey-red">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-ey-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-ey-black font-bold text-sm">
                    {targetAuthor?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ey-black text-sm mb-1">
                    {targetAuthor}
                  </p>
                  <p className="text-ey-gray-700 text-sm line-clamp-3">
                    {targetContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques d'engagement (pour les posts) */}
            {type === 'post' && post && (
              <div className="bg-ey-yellow/10 rounded-ey-lg p-4 border border-ey-yellow/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-ey-orange" />
                  <span className="text-sm font-medium text-ey-orange">
                    Cette publication a généré de l'engagement
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-ey-black">
                      {post.likesCount || 0}
                    </div>
                    <div className="text-xs text-ey-gray-600">Réactions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-ey-black">
                      {post.commentsCount || 0}
                    </div>
                    <div className="text-xs text-ey-gray-600">Commentaires</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-ey-black">
                      {post.viewsCount || 0}
                    </div>
                    <div className="text-xs text-ey-gray-600">Vues</div>
                  </div>
                </div>
              </div>
            )}

            {/* Conséquences de la suppression */}
            <div className="space-y-2">
              <h4 className="font-medium text-ey-black">Conséquences :</h4>
              <ul className="space-y-1 text-sm text-ey-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-ey-red mt-0.5">•</span>
                  <span>Le contenu sera définitivement supprimé</span>
                </li>
                {type === 'post' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-ey-red mt-0.5">•</span>
                      <span>Tous les commentaires associés seront supprimés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ey-red mt-0.5">•</span>
                      <span>Les réactions et statistiques seront perdues</span>
                    </li>
                  </>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-ey-red mt-0.5">•</span>
                  <span>Cette action ne peut pas être annulée</span>
                </li>
              </ul>
            </div>

            {/* Options avancées */}
            <div>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-ey-accent-blue hover:text-ey-accent-blue-dark text-sm font-medium transition-colors"
              >
                {showAdvancedOptions ? 'Masquer' : 'Afficher'} les options avancées
              </button>
              
              <AnimatePresence>
                {showAdvancedOptions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 p-4 bg-ey-gray-50 rounded-ey-lg border border-ey-gray-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-ey-gray-500" />
                        <span className="text-sm text-ey-gray-700">
                          Suppression immédiate (aucun délai de grâce)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-ey-gray-500" />
                        <span className="text-sm text-ey-gray-700">
                          Suppression enregistrée dans les logs d'audit
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Champ de confirmation pour contenu important */}
            {requiresConfirmation && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ey-black">
                  Pour confirmer, tapez <span className="font-mono bg-ey-gray-100 px-2 py-1 rounded text-ey-red">{expectedConfirmText}</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={expectedConfirmText}
                  className="input-ey"
                  disabled={isDeleting}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-ey-gray-200 bg-ey-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="btn-ey-outline flex-1"
              >
                Annuler
              </button>
              
              <button
                onClick={handleDelete}
                disabled={
                  isDeleting || 
                  (requiresConfirmation && confirmText !== expectedConfirmText)
                }
                className="btn-ey-danger flex-1 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
            
            {/* Message de sécurité */}
            <p className="text-xs text-ey-gray-500 text-center mt-3">
              Cette action est irréversible. Assurez-vous de vraiment vouloir supprimer ce contenu.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}