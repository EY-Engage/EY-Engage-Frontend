'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Share2, Globe, Building, Users, MessageSquare, Heart, Eye,
  Calendar, Hash, Image as ImageIcon, FileText, Send, RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { PostDto, SharePostDto } from '@/types/types';
import { UserDto } from '@/dtos/user/UserDto';
import { postService } from '@/lib/services/social/postService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostDto;
  onPostShared: (sharedPost: PostDto) => void;
  currentUser?: UserDto;
}

export default function SharePostModal({ 
  isOpen, 
  onClose, 
  post, 
  onPostShared, 
  currentUser 
}: SharePostModalProps) {
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [departmentOnly, setDepartmentOnly] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareData: SharePostDto = {
        originalPostId: post.id,
        comment: comment.trim() || undefined,
        isPublic,
        departmentOnly,
      };

      const sharedPost = await postService.sharePost(shareData);
      onPostShared(sharedPost);
      
      toast.success('Publication partagée avec succès !');
      onClose();
      setComment('');
    } catch (error) {
      console.error('Erreur partage:', error);
      toast.error('Erreur lors du partage');
    } finally {
      setIsSharing(false);
    }
  };

  const getProfilePictureUrl = (path?: string | null) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
  };

  const getFileUrl = (path: string | null | undefined) => {
    if (!path || typeof path !== 'string' || path === 'undefined' || path === 'null') {
      return '';
    }
    
    if (path.startsWith('http')) {
      return path;
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || 'http://localhost:3001';
    const cleanBackendUrl = backendUrl.replace(/\/$/, '');
    
    if (path.startsWith('/uploads/')) {
      return `${cleanBackendUrl}${path}`;
    }
    
    if (path.startsWith('uploads/')) {
      return `${cleanBackendUrl}/${path}`;
    }
    
    return `${cleanBackendUrl}/uploads/${path}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-ey-white rounded-ey-lg shadow-ey-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-ey-gray-200">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-ey-accent-blue" />
            <h2 className="text-xl font-bold text-ey-black">Partager la publication</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSharing}
            className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors"
          >
            <X className="w-5 h-5 text-ey-gray-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Zone de commentaire de partage */}
          <div className="mb-6">
            <div className="flex gap-3 mb-4">
              {currentUser && (
                <div className="flex-shrink-0">
                  {currentUser.profilePicture ? (
                    <Image
                      src={getProfilePictureUrl(currentUser.profilePicture) || '/default-avatar.png'}
                      alt={currentUser.fullName || 'Avatar'}
                      width={40}
                      height={40}
                      className="rounded-full border border-ey-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                      <span className="text-ey-black font-bold">
                        {currentUser.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ajouter un commentaire à votre partage (optionnel)..."
                  className="w-full resize-none border border-ey-gray-200 rounded-ey-lg p-3 focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-ey-gray-500">
                    {comment.length}/500 caractères
                  </span>
                </div>
              </div>
            </div>

            {/* Options de visibilité */}
            <div className="bg-ey-gray-50 rounded-ey-lg p-4">
              <h4 className="font-medium text-ey-black mb-3">Qui peut voir ce partage ?</h4>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPublic && !departmentOnly}
                    onChange={() => {
                      setIsPublic(true);
                      setDepartmentOnly(false);
                    }}
                    className="text-ey-accent-blue focus:ring-ey-yellow"
                  />
                  <Globe className="w-4 h-4 text-ey-green" />
                  <span className="text-ey-black">Public - Tous les employés EY</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={departmentOnly}
                    onChange={() => {
                      setIsPublic(false);
                      setDepartmentOnly(true);
                    }}
                    className="text-ey-accent-blue focus:ring-ey-yellow"
                  />
                  <Building className="w-4 h-4 text-ey-accent-blue" />
                  <span className="text-ey-black">Département uniquement - {currentUser?.department}</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isPublic && !departmentOnly}
                    onChange={() => {
                      setIsPublic(false);
                      setDepartmentOnly(false);
                    }}
                    className="text-ey-accent-blue focus:ring-ey-yellow"
                  />
                  <Users className="w-4 h-4 text-ey-purple" />
                  <span className="text-ey-black">Réseau - Mes abonnés uniquement</span>
                </label>
              </div>
            </div>
          </div>

          {/* Aperçu de la publication originale */}
          <div className="border-l-4 border-ey-accent-blue bg-ey-accent-blue/5 rounded-r-ey-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-ey-accent-blue" />
              <span className="text-sm font-medium text-ey-gray-600">
                Publication originale de {post.authorName}
              </span>
            </div>

            {/* En-tête du post original */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0">
                {getProfilePictureUrl(post.authorProfilePicture) ? (
                  <Image
                    src={getProfilePictureUrl(post.authorProfilePicture) || '/default-avatar.png'}
                    alt={post.authorName || 'Avatar'}
                    width={32}
                    height={32}
                    className="rounded-full border border-ey-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                    <span className="text-ey-black font-bold text-sm">
                      {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-ey-black text-sm">
                    {post.authorName || 'Utilisateur inconnu'}
                  </span>
                  <span className="text-xs text-ey-gray-500">•</span>
                  <span className="text-xs text-ey-gray-600 bg-ey-gray-100 px-2 py-0.5 rounded-ey-md">
                    {post.authorDepartment || 'Non spécifié'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-ey-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                  
                  {/* Visibilité */}
                  <span>•</span>
                  {post.isPublic ? (
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  ) : post.departmentOnly ? (
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Département</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Réseau</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenu du post original */}
            <div className="mb-3">
              <p className="text-ey-black text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">
                {post.content}
              </p>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 bg-ey-accent-blue/10 text-ey-accent-blue px-2 py-0.5 rounded-ey-full text-xs"
                    >
                      <Hash className="w-2 h-2" />
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs text-ey-gray-500">
                      +{post.tags.length - 3} autres
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Images du post original */}
            {post.images && post.images.length > 0 && (
              <div className="mb-3">
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 2).map((imagePath, index) => {
                    const imageUrl = getFileUrl(imagePath);
                    if (!imageUrl) return null;
                    
                    return (
                      <div key={index} className="relative">
                        <div className="aspect-video rounded-ey-md overflow-hidden bg-ey-gray-100">
                          <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {index === 1 && post.images!.length > 2 && (
                          <div className="absolute inset-0 bg-ey-black/60 rounded-ey-md flex items-center justify-center text-ey-white text-sm font-medium">
                            +{post.images!.length - 2}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fichiers du post original */}
            {post.files && post.files.length > 0 && (
              <div className="mb-3 p-2 bg-ey-gray-100 rounded-ey-md">
                <div className="flex items-center gap-2 text-xs text-ey-gray-600">
                  <FileText className="w-3 h-3" />
                  <span>{post.files.length} fichier{post.files.length > 1 ? 's' : ''} attaché{post.files.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Statistiques du post original */}
            <div className="flex items-center gap-4 text-xs text-ey-gray-500 pt-2 border-t border-ey-gray-200">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{post.viewsCount || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{post.likesCount}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{post.commentsCount}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                <span>{post.sharesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec boutons */}
        <div className="flex items-center justify-between p-6 border-t border-ey-gray-200">
          <div className="text-sm text-ey-gray-500">
            {comment.trim() || isPublic !== true || departmentOnly !== false ? (
              <span className="text-ey-green">✓ Personnalisé</span>
            ) : (
              <span>Partage simple</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSharing}
              className="btn-ey-outline"
            >
              Annuler
            </button>
            
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="btn-ey-primary flex items-center gap-2"
            >
              {isSharing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Partage en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Partager
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}