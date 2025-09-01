'use client';

import React, { useState, useEffect } from 'react';
import { Send, Heart, Reply, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { CommentDto, CreateCommentDto } from '@/types/types';
import { postService } from '@/lib/services/social/postService';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentsChange: (count: number) => void;
}

export default function CommentSection({ postId, commentsCount, onCommentsChange }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async (pageNum: number = 1) => {
    try {
      const response = await postService.getPostComments(postId, user!, pageNum, 10);
      
      if (pageNum === 1) {
        setComments(response.comments || []);
      } else {
        setComments(prev => [...prev, ...(response.comments || [])]);
      }
      
      setHasMore(response.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData: CreateCommentDto = {
        postId,
        content: newComment.trim(),
        parentCommentId: replyingTo || undefined
      };

      const newCommentResponse = await postService.createComment(user!, commentData);
      
      if (replyingTo) {
        // If it's a reply, add it to the parent comment's replies
        setComments(prev => prev.map(comment => 
          comment.id === replyingTo 
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), newCommentResponse],
                repliesCount: comment.repliesCount + 1
              }
            : comment
        ));
      } else {
        // If it's a top-level comment, add it to the beginning
        setComments(prev => [newCommentResponse, ...prev]);
        onCommentsChange(commentsCount + 1);
      }

      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Erreur lors de la création du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await postService.toggleReaction({
        targetId: commentId,
        targetType: 'COMMENT',
        type: 'like'
      });

      // Update comment like status
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              isLiked: !comment.isLiked,
              likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1
            }
          : comment
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      await postService.deleteComment(commentId, user!);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      onCommentsChange(commentsCount - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="border-t border-gray-100 p-6">
        <LoadingSpinner size="sm" />
        <p className="text-center text-gray-500 text-sm mt-2">Chargement des commentaires...</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100">
      {/* Comment form */}
      <div className="p-6 border-b border-gray-100">
        <form onSubmit={handleSubmitComment} className="flex items-start gap-3">
          {/* User avatar */}
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-semibold text-xs">
                {getUserInitials(user?.fullName || '')}
              </span>
            </div>
          )}

          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Écrire une réponse..." : "Écrire un commentaire..."}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none text-sm"
            />
            
            <div className="flex items-center justify-between mt-2">
              {replyingTo && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Annuler la réponse
                </button>
              )}
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-sm"
                >
                  <Send className="w-3 h-3" />
                  {isSubmitting ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Comments list */}
      <div className="space-y-0">
        {comments.map((comment) => (
          <div key={comment.id} className="p-6 border-b border-gray-50 last:border-b-0">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              {comment.authorProfilePicture ? (
                <img 
                  src={comment.authorProfilePicture} 
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 font-semibold text-xs">
                    {getUserInitials(comment.authorName)}
                  </span>
                </div>
              )}

              <div className="flex-1">
                {/* Comment header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{comment.authorName}</span>
                  <span className="text-xs text-gray-500">{comment.authorDepartment}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-gray-400">(modifié)</span>
                  )}
                </div>

                {/* Comment content */}
                <p className="text-gray-900 text-sm leading-relaxed mb-2">{comment.content}</p>

                {/* Comment actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center gap-1 text-xs ${
                      comment.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                    {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                  </button>

                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Reply className="w-3 h-3" />
                    Répondre
                  </button>

                  {comment.canDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </button>
                  )}
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        {reply.authorProfilePicture ? (
                          <img 
                            src={reply.authorProfilePicture} 
                            alt={reply.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-gray-300"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-gray-900 font-semibold text-xs">
                              {getUserInitials(reply.authorName)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-xs">{reply.authorName}</span>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(reply.createdAt), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </span>
                          </div>
                          <p className="text-gray-900 text-xs leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Load more comments */}
        {hasMore && (
          <div className="p-6 text-center border-t border-gray-100">
            <button
              onClick={() => loadComments(page + 1)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir plus de commentaires
            </button>
          </div>
        )}
      </div>
    </div>
  );
}