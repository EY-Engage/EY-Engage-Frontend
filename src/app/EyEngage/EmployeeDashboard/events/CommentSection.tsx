'use client';

import React, { useState, useEffect } from "react";
import { 
  getComments, 
  addComment, 
  reactToComment, 
  replyToComment, 
  getReactions, 
  getReplies,
  deleteComment,
  reactToReply,
  deleteReply,
  getReplyReactions,
  getCurrentUser
} from "@/lib/services/eventService";
import { CommentDto } from "@/dtos/event/CommentDto";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  SmilePlus, 
  Heart, 
  MessageSquare, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Edit3,
  Flag,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormValidation } from "@/components/FormValidation";
import { ContentSkeleton } from "@/components/SkeletonLoader";

/**
 * Section de commentaires complète avec fonctionnalités avancées
 * - Ajout/suppression de commentaires et réponses
 * - Système de réactions avec emojis
 * - Validation des commentaires
 * - Interface responsive avec design EY
 * - Gestion des permissions utilisateur
 * - Animations et transitions fluides
 */

// Emojis de réaction disponibles
const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '😠', '🔥', '👏'];

// Interface pour l'utilisateur courant
interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  fonction?: string;
  department?: string;
  sector?: string;
}

export default function CommentSection({ eventId }: { eventId: string }) {
  // États principaux
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les réactions et réponses
  const [reactions, setReactions] = useState<Record<string, any[]>>({});
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [replyReactions, setReplyReactions] = useState<Record<string, any[]>>({});
  
  // États pour l'interface utilisateur
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // État utilisateur
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Validation des commentaires
  const commentValidation = {
    content: [
      { required: true, message: 'Le commentaire ne peut pas être vide' },
      { minLength: 2, message: 'Le commentaire doit contenir au moins 2 caractères' },
      { maxLength: 500, message: 'Le commentaire ne peut pas dépasser 500 caractères' }
    ]
  };

  const { errors, validate, validateField, clearErrors } = useFormValidation(commentValidation);

  // Récupération de l'utilisateur courant
  const fetchCurrentUser = async () => {
    try {
      setUserLoading(true);
      const userData = await getCurrentUser();
      
      if (userData && userData.id) {
        setCurrentUser(userData);
      } else {
        console.warn("Données utilisateur invalides:", userData);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      setCurrentUser(null);
      toast.error("Impossible de charger les informations utilisateur");
    } finally {
      setUserLoading(false);
    }
  };

  // Récupération des commentaires et données associées
  const fetchCommentsData = async () => {
    try {
      setIsLoading(true);
      
      const commentsData = await getComments(eventId);
      setComments(commentsData);
      
      // Récupération des réactions et réponses pour chaque commentaire
      const reactionsMap: Record<string, any[]> = {};
      const repliesMap: Record<string, any[]> = {};
      
      for (const comment of commentsData) {
        try {
          const [commentReactions, commentReplies] = await Promise.all([
            getReactions(comment.id),
            getReplies(comment.id)
          ]);
          
          reactionsMap[comment.id] = commentReactions;
          repliesMap[comment.id] = commentReplies;
          
          // Récupération des réactions pour chaque réponse
          const replyReactionsMap: Record<string, any[]> = {};
          for (const reply of commentReplies) {
            try {
              const replyReactions = await getReplyReactions(reply.id);
              replyReactionsMap[reply.id] = replyReactions;
            } catch (error) {
              console.error(`Erreur réactions réponse ${reply.id}:`, error);
              replyReactionsMap[reply.id] = [];
            }
          }
          setReplyReactions(prev => ({ ...prev, ...replyReactionsMap }));
        } catch (error) {
          console.error(`Erreur données commentaire ${comment.id}:`, error);
          reactionsMap[comment.id] = [];
          repliesMap[comment.id] = [];
        }
      }
      
      setReactions(reactionsMap);
      setReplies(repliesMap);
    } catch (err) {
      console.error("Erreur lors du chargement des commentaires:", err);
      toast.error("Impossible de charger les commentaires");
    } finally {
      setIsLoading(false);
    }
  };

  // Effets de montage
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchCommentsData();
    }
  }, [eventId]);

  // Basculer l'expansion des commentaires
  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Soumission d'un nouveau commentaire
  const submitComment = async () => {
    if (!validate({ content: newComment })) {
      return;
    }

    if (!currentUser) {
      toast.error("Vous devez être connecté pour commenter");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addComment(eventId, newComment.trim());
      setNewComment("");
      clearErrors();
      await fetchCommentsData();
      toast.success("💬 Commentaire ajouté avec succès !");
    } catch (err: any) {
      console.error("Erreur ajout commentaire:", err);
      toast.error(err.message || "Erreur lors de l'ajout du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des réactions aux commentaires
  const handleReact = async (commentId: string, emoji: string) => {
    if (!currentUser) {
      toast.error("Vous devez être connecté pour réagir");
      return;
    }

    try {
      await reactToComment(commentId, emoji);
      const reactionsData = await getReactions(commentId);
      setReactions(prev => ({ ...prev, [commentId]: reactionsData }));
    } catch (err) {
      console.error("Erreur réaction:", err);
      toast.error("Erreur lors de l'ajout de la réaction");
    }
  };

  // Gestion des réponses aux commentaires
  const handleReply = async (commentId: string) => {
    const replyContent = replyContents[commentId];
    
    if (!replyContent?.trim()) {
      toast.error("La réponse ne peut pas être vide");
      return;
    }

    if (!currentUser) {
      toast.error("Vous devez être connecté pour répondre");
      return;
    }

    try {
      await replyToComment(commentId, replyContent.trim());
      const repliesData = await getReplies(commentId);
      setReplies(prev => ({ ...prev, [commentId]: repliesData }));
      setReplyContents(prev => ({ ...prev, [commentId]: "" }));
      setShowReplyInput(prev => ({ ...prev, [commentId]: false }));
      toast.success("✉️ Réponse ajoutée avec succès !");
    } catch (err) {
      console.error("Erreur réponse:", err);
      toast.error("Erreur lors de l'ajout de la réponse");
    }
  };

  // Suppression de commentaire
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return;
    }
    
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("🗑️ Commentaire supprimé");
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Gestion des réactions aux réponses
  const handleReactToReply = async (replyId: string, emoji: string) => {
    if (!currentUser) {
      toast.error("Vous devez être connecté pour réagir");
      return;
    }

    try {
      await reactToReply(replyId, emoji);
      const reactionsData = await getReplyReactions(replyId);
      setReplyReactions(prev => ({ ...prev, [replyId]: reactionsData }));
    } catch (err) {
      console.error("Erreur réaction réponse:", err);
      toast.error("Erreur lors de l'ajout de la réaction");
    }
  };

  // Suppression de réponse
  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
      return;
    }

    try {
      await deleteReply(replyId);
      
      const commentId = Object.keys(replies).find(cId => 
        replies[cId].some(reply => reply.id === replyId)
      );
      
      if (commentId) {
        const updatedReplies = replies[commentId].filter(reply => reply.id !== replyId);
        setReplies(prev => ({ ...prev, [commentId]: updatedReplies }));
      }
      
      toast.success("🗑️ Réponse supprimée");
    } catch (err) {
      console.error("Erreur suppression réponse:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Groupement des réactions
  const groupReactions = (reactions: any[]) => {
    return reactions?.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {}) || {};
  };

  // Obtenir les utilisateurs ayant réagi avec un emoji
  const getReactionUsers = (reactions: any[], emoji: string) => {
    return reactions?.filter(r => r.emoji === emoji) || [];
  };

  // URL complète de l'image de profil
  const getProfileImageUrl = (profilePicture?: string) => {
    if (!profilePicture) return undefined;
    if (profilePicture.startsWith('http')) return profilePicture;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${profilePicture}`;
  };

  // Vérifier si l'utilisateur peut modifier/supprimer
  const canModifyContent = (authorId: string) => {
    return currentUser?.id === authorId;
  };

  // Affichage du loading
  if (isLoading || userLoading) {
    return (
      <div className="space-y-6">
        <ContentSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-ey-white rounded-ey-xl p-6 border border-ey-gray-200 animate-fade-in">
      
      {/* En-tête de section */}
      <div className="flex items-center justify-between border-b border-ey-gray-200 pb-4">
        <h3 className="text-xl font-bold text-ey-black flex items-center gap-3">
          <MessageSquare className="text-ey-accent-blue" size={24} />
          Discussion ({comments.length})
        </h3>
        <div className="text-sm text-ey-gray-500">
          Participez à la conversation
        </div>
      </div>

      {/* Formulaire d'ajout de commentaire */}
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="h-12 w-12 ring-2 ring-ey-yellow/20">
            <AvatarImage src={getProfileImageUrl(currentUser?.profilePicture)} />
            <AvatarFallback className="bg-ey-yellow text-ey-black font-bold">
              {currentUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="relative">
              <Input
                placeholder="Partagez votre avis sur cet événement..."
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  validateField('content', e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
                className={`input-ey pr-12 ${errors.content ? 'input-ey-error' : ''}`}
                maxLength={500}
                disabled={!currentUser || isSubmitting}
              />
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ey-gray-500 hover:text-ey-accent-blue transition-colors"
                disabled={isSubmitting}
              >
                <SmilePlus size={20} />
              </button>
            </div>
            
            {errors.content && (
              <p className="text-ey-red text-sm flex items-center gap-1">
                <Flag size={14} />
                {errors.content}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-ey-gray-500 text-xs">
                {newComment.length}/500 caractères
              </p>
              
              <Button
                onClick={submitComment}
                disabled={!newComment.trim() || !currentUser || isSubmitting || !!errors.content}
                className="btn-ey-primary flex items-center gap-2"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner-ey !h-4 !w-4" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Publier
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Sélecteur d'emoji */}
        {showEmojiPicker && (
          <div className="relative">
            <div className="absolute z-50 top-2 left-16">
              <EmojiPicker 
                onEmojiClick={(emoji) => {
                  setNewComment(prev => prev + emoji.emoji);
                  setShowEmojiPicker(false);
                }}
                autoFocusSearch={false}
                theme="light"
              />
            </div>
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-ey-gray-200 rounded-ey-xl bg-ey-light-gray/30">
          <MessageSquare className="mx-auto h-16 w-16 text-ey-gray-400" />
          <p className="mt-4 text-ey-gray-600 font-medium">Aucun commentaire pour le moment</p>
          <p className="text-sm text-ey-gray-500 mt-1">
            Soyez le premier à partager votre avis sur cet événement
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className="group animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-4 items-start">
                <Avatar className="h-12 w-12 ring-2 ring-ey-gray-100">
                  <AvatarImage src={getProfileImageUrl(comment.authorProfilePicture)} />
                  <AvatarFallback className="bg-ey-accent-blue text-ey-white font-bold">
                    {comment.authorFullName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  {/* En-tête du commentaire */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-ey-black">
                        {comment.authorFullName}
                      </span>
                      <span className="text-xs text-ey-gray-500 bg-ey-gray-100 px-2 py-1 rounded-full">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {/* Actions de modération */}
                    {canModifyContent(comment.authorId) && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="text-ey-gray-500 hover:text-ey-accent-blue hover:bg-ey-accent-blue/10"
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-ey-gray-500 hover:text-ey-red hover:bg-ey-red/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu du commentaire */}
                  <div className="bg-ey-light-gray rounded-ey-lg p-4">
                    <p className="text-ey-black leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  
                  {/* Réactions et boutons d'action */}
                  <div className="flex items-center gap-6 text-sm">
                    {/* Boutons de réaction */}
                    <div className="flex items-center gap-1">
                      {REACTION_EMOJIS.slice(0, 4).map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(comment.id, emoji)}
                          className="hover:scale-125 transition-transform p-1 rounded-full hover:bg-ey-yellow/20"
                          disabled={!currentUser}
                          title={`Réagir avec ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    
                    {/* Affichage des réactions */}
                    {reactions[comment.id]?.length > 0 && (
                      <div className="flex items-center gap-2">
                        {Object.entries(groupReactions(reactions[comment.id]))
                          .slice(0, 3)
                          .map(([emoji, count]) => (
                            <Popover key={emoji}>
                              <PopoverTrigger asChild>
                                <button className="bg-ey-gray-100 hover:bg-ey-gray-200 px-2 py-1 rounded-full transition-colors text-xs">
                                  {emoji} {count}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3">
                                <h4 className="font-medium mb-2 text-ey-black">
                                  Personnes ayant réagi avec {emoji}
                                </h4>
                                <div className="max-h-32 overflow-y-auto space-y-2">
                                  {getReactionUsers(reactions[comment.id], emoji).map((reaction) => (
                                    <div key={reaction.id} className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={getProfileImageUrl(reaction.userProfilePicture)} />
                                        <AvatarFallback className="text-xs bg-ey-accent-blue text-white">
                                          {reaction.userFullName?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-ey-black">
                                        {reaction.userFullName}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          ))}
                      </div>
                    )}
                    
                    {/* Bouton répondre */}
                    <button 
                      onClick={() => setShowReplyInput(prev => ({ 
                        ...prev, 
                        [comment.id]: !prev[comment.id] 
                      }))}
                      className="text-ey-accent-blue hover:text-ey-accent-blue/80 font-medium transition-colors"
                      disabled={!currentUser}
                    >
                      Répondre
                    </button>
                    
                    {/* Bouton afficher/masquer réponses */}
                    {(replies[comment.id]?.length || 0) > 0 && (
                      <button 
                        onClick={() => toggleCommentExpansion(comment.id)}
                        className="text-ey-accent-blue hover:text-ey-accent-blue/80 font-medium transition-colors flex items-center gap-1"
                      >
                        {expandedComments[comment.id] ? (
                          <>
                            <ChevronUp size={16} />
                            Masquer les réponses
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            Voir {replies[comment.id].length} réponse{replies[comment.id].length > 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Zone de réponse */}
                  {showReplyInput[comment.id] && currentUser && (
                    <div className="ml-4 pt-4 border-l-2 border-ey-yellow pl-4 space-y-3 animate-fade-in">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getProfileImageUrl(currentUser.profilePicture)} />
                          <AvatarFallback className="bg-ey-yellow text-ey-black text-sm">
                            {currentUser.fullName?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            placeholder="Écrivez votre réponse..."
                            value={replyContents[comment.id] || ""}
                            onChange={(e) => setReplyContents(prev => ({ 
                              ...prev, 
                              [comment.id]: e.target.value 
                            }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleReply(comment.id);
                              }
                            }}
                            className="input-ey"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 ml-11">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setShowReplyInput(prev => ({ ...prev, [comment.id]: false }));
                            setReplyContents(prev => ({ ...prev, [comment.id]: "" }));
                          }}
                          className="text-ey-gray-600"
                        >
                          Annuler
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyContents[comment.id]?.trim()}
                          className="btn-ey-tertiary"
                        >
                          <Send size={14} className="mr-1" />
                          Répondre
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Liste des réponses */}
                  {expandedComments[comment.id] && replies[comment.id]?.length > 0 && (
                    <div className="ml-4 pt-4 border-l-2 border-ey-gray-200 pl-4 space-y-6 animate-fade-in">
                      {replies[comment.id].map((reply, replyIndex) => (
                        <div 
                          key={reply.id} 
                          className="group flex gap-3 items-start"
                          style={{ animationDelay: `${replyIndex * 0.05}s` }}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getProfileImageUrl(reply.authorProfilePicture)} />
                            <AvatarFallback className="bg-ey-accent-blue text-white text-sm">
                              {reply.authorFullName?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-2">
                            {/* En-tête de la réponse */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-ey-black text-sm">
                                  {reply.authorFullName}
                                </span>
                                <span className="text-xs text-ey-gray-500 bg-ey-gray-100 px-2 py-0.5 rounded-full">
                                  {new Date(reply.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              
                              {/* Actions de modération pour les réponses */}
                              {canModifyContent(reply.authorId) && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteReply(reply.id)}
                                    className="text-ey-gray-500 hover:text-ey-red hover:bg-ey-red/10 p-1"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {/* Contenu de la réponse */}
                            <div className="bg-ey-light-gray/60 rounded-ey-md p-3">
                              <p className="text-ey-black text-sm leading-relaxed">
                                {reply.content}
                              </p>
                            </div>
                            
                            {/* Réactions aux réponses */}
                            <div className="flex items-center gap-4 text-xs">
                              {/* Boutons de réaction pour les réponses */}
                              <div className="flex items-center gap-1">
                                {REACTION_EMOJIS.slice(0, 3).map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReactToReply(reply.id, emoji)}
                                    className="hover:scale-110 transition-transform p-0.5 rounded hover:bg-ey-yellow/20"
                                    disabled={!currentUser}
                                    title={`Réagir avec ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                              
                              {/* Affichage des réactions aux réponses */}
                              {replyReactions[reply.id]?.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {Object.entries(groupReactions(replyReactions[reply.id]))
                                    .slice(0, 2)
                                    .map(([emoji, count]) => (
                                      <Popover key={emoji}>
                                        <PopoverTrigger asChild>
                                          <button className="bg-ey-gray-100 hover:bg-ey-gray-200 px-1.5 py-0.5 rounded-full transition-colors">
                                            {emoji} {count}
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-60 p-2">
                                          <h4 className="font-medium text-xs mb-2 text-ey-black">
                                            Réactions {emoji}
                                          </h4>
                                          <div className="max-h-24 overflow-y-auto space-y-1">
                                            {getReactionUsers(replyReactions[reply.id], emoji).map((reaction) => (
                                              <div key={reaction.id} className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5">
                                                  <AvatarImage src={getProfileImageUrl(reaction.userProfilePicture)} />
                                                  <AvatarFallback className="text-xs bg-ey-accent-blue text-white">
                                                    {reaction.userFullName?.charAt(0)?.toUpperCase()}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-ey-black">
                                                  {reaction.userFullName}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Message d'encouragement si pas connecté */}
      {!currentUser && (
        <div className="bg-ey-yellow/10 border border-ey-yellow/30 rounded-ey-lg p-4 text-center">
          <p className="text-ey-black font-medium">
            🔐 Connectez-vous pour rejoindre la discussion
          </p>
          <p className="text-ey-gray-600 text-sm mt-1">
            Partagez vos idées et interagissez avec la communauté EY
          </p>
        </div>
      )}
    </div>
  );
}