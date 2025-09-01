'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Image as ImageIcon, Paperclip, Globe, Building, Users, 
  Hash, AtSign, Send, Smile, MapPin, Calendar, Tag,
  AlertCircle, CheckCircle, Upload, Trash2,
  Eye
} from 'lucide-react';
import { CreatePostDto, PostDto } from '@/types/types';
import toast from 'react-hot-toast';
import { UserDto } from '@/dtos/user/UserDto';
import { postService } from '@/lib/services/social/postService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: PostDto) => void;
  currentUser?: UserDto;
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPostCreated, 
  currentUser 
}: CreatePostModalProps) {
  const [postData, setPostData] = useState<CreatePostDto>({
    content: '',
    isPublic: true,
    departmentOnly: false,
    allowComments: true,
    allowShares: true
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Gérer le changement de contenu
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (content.length <= 5000) {
      setPostData(prev => ({ ...prev, content }));
      setCharCount(content.length);
    }
  };

  // Gérer la sélection d'images
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > 5) {
      toast.error('Maximum 5 images autorisées');
      return;
    }

    const validImages = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name}: Format d'image non supporté`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: Taille maximale 10MB`);
        return false;
      }
      
      return true;
    });

    setSelectedImages(prev => [...prev, ...validImages]);
    
    // Créer des aperçus
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreviews(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > 3) {
      toast.error('Maximum 3 fichiers autorisés');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 25 * 1024 * 1024; // 25MB
      
      if (!isValidSize) {
        toast.error(`${file.name}: Taille maximale 25MB`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Supprimer une image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Supprimer un fichier
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Extraire les hashtags et mentions
  const extractTagsAndMentions = (content: string) => {
    const hashtags = content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
    const mentions = content.match(/@(\w+)/g)?.map(mention => mention.substring(1)) || [];
    return { hashtags, mentions };
  };

  // Ajouter cette fonction pour vérifier les fichiers avant envoi
  const validateFiles = (files: File[], maxSize: number, allowedTypes: string[]): File[] => {
    return files.filter(file => {
      const isValidType = allowedTypes.includes(file.type);
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) {
        toast.error(`${file.name}: Type de fichier non supporté`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: Taille maximale ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      
      return true;
    });
  };

  // Modifier la fonction handleSubmit - CORRECTION PRINCIPALE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postData.content.trim()) {
      toast.error('Le contenu est obligatoire');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { hashtags, mentions } = extractTagsAndMentions(postData.content);
      
      // S'assurer que tags et mentions sont toujours des arrays
      const finalPostData: CreatePostDto = {
        ...postData,
        tags: Array.isArray(hashtags) ? hashtags : [],
        mentions: Array.isArray(mentions) ? mentions : []
      };

      // Valider les fichiers avant envoi
      const validatedImages = validateFiles(
        selectedImages, 
        10 * 1024 * 1024, // 10MB
        ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      );

      const validatedFiles = validateFiles(
        selectedFiles,
        25 * 1024 * 1024, // 25MB
        [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain'
        ]
      );

      const files = {
        images: validatedImages.length > 0 ? validatedImages : undefined,
        files: validatedFiles.length > 0 ? validatedFiles : undefined
      };

      const newPost = await postService.createPost(finalPostData, files);
      onPostCreated(newPost);
      resetForm();
      toast.success('Publication créée avec succès !');
      
    } catch (error) {
      console.error('Erreur création post:', error);
      toast.error('Erreur lors de la création de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setPostData({
      content: '',
      isPublic: true,
      departmentOnly: false,
      allowComments: true,
      allowShares: true
    });
    setSelectedImages([]);
    setSelectedFiles([]);
    setImagePreviews([]);
    setCharCount(0);
    setShowEmojiPicker(false);
  };

  // Fermer le modal
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Insérer un emoji dans le contenu
  const insertEmoji = (emoji: string) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = postData.content.substring(0, start) + emoji + postData.content.substring(end);
      
      setPostData(prev => ({ ...prev, content: newContent }));
      setCharCount(newContent.length);
      
      // Repositionner le curseur
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
          <div className="flex items-center justify-between p-6 border-b border-ey-gray-200 bg-gradient-ey-primary">
            <div className="flex items-center gap-3">
              {currentUser && (
                <>
                  {currentUser.profilePicture ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${currentUser.profilePicture}`}
                      alt={currentUser.fullName}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-ey-white"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-ey-white rounded-full flex items-center justify-center">
                      <span className="text-ey-black font-bold">
                        {currentUser.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <h2 className="text-xl font-bold text-ey-black">
                  Créer une publication
                </h2>
                <p className="text-ey-gray-700 text-sm">
                  Partagez vos idées avec vos collègues
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-ey-black/10 rounded-ey-lg transition-colors"
            >
              <X className="w-6 h-6 text-ey-black" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Zone de texte principale */}
            <div className="space-y-3">
              <textarea
                ref={contentTextareaRef}
                value={postData.content}
                onChange={handleContentChange}
                placeholder="Que voulez-vous partager aujourd'hui ?"
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

            {/* Aperçu des images */}
            {imagePreviews.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-ey-black">Images sélectionnées ({selectedImages.length}/5)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-ey-lg overflow-hidden bg-ey-gray-100">
                        <Image
                          src={preview}
                          alt={`Aperçu ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-ey-red text-ey-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des fichiers */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-ey-black">Fichiers attachés ({selectedFiles.length}/3)</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-ey-gray-50 rounded-ey-lg p-3">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-ey-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-ey-black">{file.name}</p>
                          <p className="text-xs text-ey-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-ey-red/10 text-ey-red rounded-ey-lg transition-colors"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options de publication */}
            <div className="space-y-4 p-4 bg-ey-gray-50 rounded-ey-lg">
              <h4 className="font-medium text-ey-black">Options de publication</h4>
              
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
                        checked={postData.isPublic}
                        onChange={() => setPostData(prev => ({ ...prev, isPublic: true, departmentOnly: false }))}
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
                        checked={postData.departmentOnly}
                        onChange={() => setPostData(prev => ({ ...prev, isPublic: false, departmentOnly: true }))}
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
                        checked={postData.allowComments}
                        onChange={(e) => setPostData(prev => ({ ...prev, allowComments: e.target.checked }))}
                        className="text-ey-yellow focus:ring-ey-yellow rounded"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">Autoriser les commentaires</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postData.allowShares}
                        onChange={(e) => setPostData(prev => ({ ...prev, allowShares: e.target.checked }))}
                        className="text-ey-yellow focus:ring-ey-yellow rounded"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">Autoriser les partages</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions pour médias */}
            <div className="flex flex-wrap gap-3">
              
              {/* Ajouter des images */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isSubmitting || selectedImages.length >= 5}
                className="btn-ey-outline flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Images ({selectedImages.length}/5)
              </button>
              
              {/* Ajouter des fichiers */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || selectedFiles.length >= 3}
                className="btn-ey-outline flex items-center gap-2"
              >
                <Paperclip className="w-4 h-4" />
                Fichiers ({selectedFiles.length}/3)
              </button>
              
              {/* Inputs cachés */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={isSubmitting}
              />
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>

            {/* Aperçu de la publication */}
            {(postData.content.trim() || selectedImages.length > 0 || selectedFiles.length > 0) && (
              <div className="p-4 bg-ey-yellow/10 rounded-ey-lg border border-ey-yellow/20">
                <h4 className="font-medium text-ey-black mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Aperçu de votre publication
                </h4>
                <div className="text-sm text-ey-gray-700">
                  <p className="mb-2">
                    <span className="font-medium">{currentUser?.fullName}</span> • {currentUser?.department}
                  </p>
                  <p className="whitespace-pre-wrap line-clamp-3">
                    {postData.content || 'Votre contenu apparaîtra ici...'}
                  </p>
                  {selectedImages.length > 0 && (
                    <p className="text-ey-accent-blue mt-2">
                      📸 {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} attachée{selectedImages.length > 1 ? 's' : ''}
                    </p>
                  )}
                  {selectedFiles.length > 0 && (
                    <p className="text-ey-purple mt-1">
                      📎 {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''} attaché{selectedFiles.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-between pt-4 border-t border-ey-gray-200">
              <div className="text-sm text-ey-gray-600">
                {postData.isPublic ? (
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Publication publique
                  </span>
                ) : postData.departmentOnly ? (
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
                  type="submit"
                  disabled={isSubmitting || !postData.content.trim()}
                  className="btn-ey-primary min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Upload className="w-4 h-4 animate-pulse mr-2" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publier
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