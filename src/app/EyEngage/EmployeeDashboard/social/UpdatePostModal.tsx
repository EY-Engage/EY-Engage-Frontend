'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Globe, Building, Users, Smile, Save, AlertCircle,
  CheckCircle, Hash, AtSign, Eye
} from 'lucide-react';
import { UpdatePostDto, PostDto } from '@/types/types';
import toast from 'react-hot-toast';
import { UserDto } from '@/dtos/user/UserDto';
import { postService } from '@/lib/services/social/postService';

interface UpdatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostDto;
  onPostUpdated: (updatedPost: PostDto) => void;
  currentUser?: UserDto;
}

export default function UpdatePostModal({ 
  isOpen, 
  onClose, 
  post, 
  onPostUpdated, 
  currentUser 
}: UpdatePostModalProps) {
  const [updateData, setUpdateData] = useState<UpdatePostDto>({
    content: post.content,
    isPublic: post.isPublic,
    departmentOnly: post.departmentOnly,
    allowComments: post.allowComments,
    allowShares: post.allowShares
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(post.content.length);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Vérifier s'il y a des changements
  useEffect(() => {
    const changed = 
      updateData.content !== post.content ||
      updateData.isPublic !== post.isPublic ||
      updateData.departmentOnly !== post.departmentOnly ||
      updateData.allowComments !== post.allowComments ||
      updateData.allowShares !== post.allowShares;
    
    setHasChanges(changed);
  }, [updateData, post]);

  // Gérer le changement de contenu
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (content.length <= 5000) {
      setUpdateData(prev => ({ ...prev, content }));
      setCharCount(content.length);
    }
  };

  // Extraire les hashtags et mentions du contenu
  const extractTagsAndMentions = (content: string) => {
    const hashtags = content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
    const mentions = content.match(/@(\w+)/g)?.map(mention => mention.substring(1)) || [];
    return { hashtags, mentions };
  };

  // Soumettre les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateData.content?.trim()) {
      toast.error('Le contenu ne peut pas être vide');
      return;
    }

    if (!hasChanges) {
      toast.info('Aucune modification à sauvegarder');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { hashtags, mentions } = extractTagsAndMentions(updateData.content);
      
      const finalUpdateData: UpdatePostDto = {
        ...updateData,
        tags: hashtags,
      };

      const updatedPost = await postService.updatePost(post.id, finalUpdateData);
      onPostUpdated(updatedPost);
      onClose();
      toast.success('Publication modifiée avec succès !');
      
    } catch (error) {
      console.error('Erreur modification post:', error);
      toast.error('Erreur lors de la modification de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer le modal
  const handleClose = () => {
    if (hasChanges && !isSubmitting) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Insérer un emoji
  const insertEmoji = (emoji: string) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = updateData.content!.substring(0, start) + emoji + updateData.content!.substring(end);
      
      setUpdateData(prev => ({ ...prev, content: newContent }));
      setCharCount(newContent.length);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  if (!isOpen) return null;

  const emojis = ['😊', '😍', '🎉', '👍', '💡', '🔥', '❤️', '🚀', '💪', '🎯', '✨', '🏆'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-ey-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ey-yellow rounded-ey-lg flex items-center justify-center">
                <Save className="w-6 h-6 text-ey-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ey-black">
                  Modifier la publication
                </h2>
                <p className="text-ey-gray-600 text-sm">
                  Apportez vos modifications et sauvegardez
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors"
            >
              <X className="w-6 h-6 text-ey-gray-600" />
            </button>
          </div>

          {/* Formulaire */}
          <form className="p-6 space-y-6">
            
            {/* Indicateur de changements */}
            {hasChanges && (
              <div className="flex items-center gap-2 p-3 bg-ey-yellow/10 rounded-ey-lg border border-ey-yellow/20">
                <AlertCircle className="w-4 h-4 text-ey-orange" />
                <span className="text-sm text-ey-orange font-medium">
                  Vous avez des modifications non sauvegardées
                </span>
              </div>
            )}
            
            {/* Zone de texte principale */}
            <div className="space-y-3">
              <textarea
                ref={contentTextareaRef}
                value={updateData.content}
                onChange={handleContentChange}
                placeholder="Modifiez votre contenu..."
                className="w-full min-h-32 resize-none border border-ey-gray-200 rounded-ey-lg p-4 focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent text-lg"
                disabled={isSubmitting}
              />
              
              {/* Compteur de caractères et emojis */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  
                  {/* Bouton emoji */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <Smile className="w-5 h-5 text-ey-gray-600" />
                    </button>
                    
                    {/* Sélecteur d'emoji */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-12 left-0 bg-ey-white rounded-ey-lg shadow-ey-xl border border-ey-gray-200 p-3 z-50"
                        >
                          <div className="grid grid-cols-6 gap-2">
                            {emojis.map((emoji, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => insertEmoji(emoji)}
                                className="p-2 hover:bg-ey-gray-100 rounded-ey-md transition-colors text-xl"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <span className="text-sm text-ey-gray-500">
                    Utilisez # pour les hashtags et @ pour les mentions
                  </span>
                </div>
                
                <span className={`text-sm ${charCount > 4500 ? 'text-ey-red' : 'text-ey-gray-500'}`}>
                  {charCount}/5000
                </span>
              </div>
            </div>

            {/* Options de publication */}
            <div className="space-y-4 p-4 bg-ey-gray-50 rounded-ey-lg">
              <h4 className="font-medium text-ey-black">Paramètres de la publication</h4>
              
              {/* Visibilité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Public/Privé */}
                <div>
                  <label className="block text-sm font-medium text-ey-black mb-2">
                    Visibilité
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={updateData.isPublic}
                        onChange={() => setUpdateData(prev => ({ ...prev, isPublic: true, departmentOnly: false }))}
                        className="text-ey-yellow focus:ring-ey-yellow"
                        disabled={isSubmitting}
                      />
                      <Globe className="w-4 h-4 text-ey-accent-blue" />
                      <span className="text-sm">Public - Visible par tous</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={updateData.departmentOnly}
                        onChange={() => setUpdateData(prev => ({ ...prev, isPublic: false, departmentOnly: true }))}
                        className="text-ey-yellow focus:ring-ey-yellow"
                        disabled={isSubmitting}
                      />
                      <Building className="w-4 h-4 text-ey-purple" />
                      <span className="text-sm">Département uniquement</span>
                    </label>
                  </div>
                </div>

                {/* Paramètres d'interaction */}
                <div>
                  <label className="block text-sm font-medium text-ey-black mb-2">
                    Interactions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={updateData.allowComments}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, allowComments: e.target.checked }))}
                        className="text-ey-yellow focus:ring-ey-yellow rounded"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">Autoriser les commentaires</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={updateData.allowShares}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, allowShares: e.target.checked }))}
                        className="text-ey-yellow focus:ring-ey-yellow rounded"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">Autoriser les partages</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu des modifications */}
            {hasChanges && (
              <div className="p-4 bg-ey-accent-blue/10 rounded-ey-lg border border-ey-accent-blue/20">
                <h4 className="font-medium text-ey-black mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Aperçu des modifications
                </h4>
                <div className="text-sm text-ey-gray-700">
                  <p className="mb-2">
                    <span className="font-medium">{currentUser?.fullName}</span> • {currentUser?.department}
                  </p>
                  <p className="whitespace-pre-wrap line-clamp-3">
                    {updateData.content || 'Votre contenu modifié apparaîtra ici...'}
                  </p>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-between pt-4 border-t border-ey-gray-200">
              <div className="text-sm text-ey-gray-600">
                {updateData.isPublic ? (
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Publication publique
                  </span>
                ) : updateData.departmentOnly ? (
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Département uniquement
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Réseau privé
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="btn-ey-outline"
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !updateData.content?.trim() || !hasChanges}
                  className="btn-ey-primary min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-ey-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}