'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, 
  Globe, Building, Users, Calendar, Edit, Trash2, Flag,
  User, ThumbsUp, Smile, Eye, Paperclip, Download,
  ChevronDown, ChevronUp, Hash, ImageIcon, RefreshCw,
  FileText, Send, X, Clock, AlertTriangle, CheckCircle, ExternalLink
} from 'lucide-react';
import { PostDto, ReactionType, CommentDto, CreateCommentDto, CreateReactionDto, ContentType } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserDto } from '@/dtos/user/UserDto';
import { postService } from '@/lib/services/social/postService';
import toast from 'react-hot-toast';
import UserListModal from '@/components/user/UserListModal';
import FlagModal from './FlagModal';

interface PostCardProps {
  post: PostDto;
  onReaction: (postId: string, reactionType: ReactionType) => void;
  onComment: (postId: string, content: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onEdit?: (post: PostDto) => void;
  onDelete?: (postId: string) => void;
  onShare?: (post: PostDto) => void;
  currentUser?: UserDto | null;  
  showComments?: boolean;
  highlightTerm?: string;
}

const reactionEmojis = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
  celebrate: '🎉',
  support: '🤝'
};

interface ReactionUser {
  id: string;
  userName: string;
  userProfilePicture?: string;
  userDepartment: string;
  type: ReactionType;
  createdAt: Date;
}

interface CommentWithReplies extends CommentDto {
  showReplies?: boolean;
  replies?: CommentDto[];
  loadingReplies?: boolean;
}

export default function PostCard({ 
  post, 
  onReaction, 
  onComment, 
  onFollow, 
  onUnfollow,
  onEdit,
  onDelete,
  onShare,
  currentUser,
  showComments = false 
}: PostCardProps) {
  // États principaux
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowingAuthor);
  // États pour les réactions détaillées
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [reactionUsers, setReactionUsers] = useState<ReactionUser[]>([]);
  const [loadingReactions, setLoadingReactions] = useState(false);
  const [selectedReactionType, setSelectedReactionType] = useState<ReactionType | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  
  // États pour les commentaires
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  
  // États pour les réponses aux commentaires
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  // États pour les actions
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [checkingBookmarkStatus, setCheckingBookmarkStatus] = useState(false);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Vérifier si le composant est monté (pour les portals)
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Vérifier si le post est bookmarked au chargement
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!currentUser?.id) {
        return;
      }
      
      setCheckingBookmarkStatus(true);
      try {
        const result = await postService.isPostBookmarked(post.id);
        setIsBookmarked(result.isBookmarked);
      } catch (error) {
        console.error('Erreur vérification bookmark:', error);
        setIsBookmarked(false);
      } finally {
        setCheckingBookmarkStatus(false);
      }
    };

    checkBookmarkStatus();
  }, [post.id, currentUser?.id]);

  // Charger les commentaires
  const loadComments = async (reset = false) => {
    if (loadingComments) return;
    
    setLoadingComments(true);
    try {
      const page = reset ? 1 : commentsPage;
      const result = await postService.getPostComments(post.id, page, 10);
      
      if (reset) {
        setComments(result.comments);
        setCommentsPage(2);
      } else {
        setComments(prev => [...prev, ...result.comments]);
        setCommentsPage(prev => prev + 1);
      }
      
      setHasMoreComments(result.page < result.totalPages);
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoadingComments(false);
    }
  };

  // Charger les réactions détaillées
  const loadReactions = async (reactionType?: ReactionType) => {
    setLoadingReactions(true);
    try {
      const reactions = await postService.getPostReactions(post.id, reactionType);
      setReactionUsers(reactions.map(r => ({
        id: r.userId,
        userName: r.userName,
        userProfilePicture: r.userProfilePicture,
        userDepartment: r.userDepartment,
        type: r.type,
        createdAt: r.createdAt
      })));
      setSelectedReactionType(reactionType || null);
    } catch (error) {
      console.error('Erreur chargement réactions:', error);
      toast.error('Erreur lors du chargement des réactions');
    } finally {
      setLoadingReactions(false);
    }
  };

  // Charger les réponses d'un commentaire
  const loadReplies = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment || comment.loadingReplies) return;
    
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, loadingReplies: true }
        : c
    ));
    
    try {
      const result = await postService.getCommentReplies(commentId, 1, 10);
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, replies: result.replies, showReplies: true, loadingReplies: false }
          : c
      ));
    } catch (error) {
      console.error('Erreur chargement réponses:', error);
      toast.error('Erreur lors du chargement des réponses');
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, loadingReplies: false }
          : c
      ));
    }
  };

  // Charger les commentaires quand on ouvre la section
  useEffect(() => {
    if (showCommentsSection && comments.length === 0 && post.commentsCount > 0) {
      loadComments(true);
    }
  }, [showCommentsSection]);

  // Formater le contenu avec hashtags et mentions
  const formatContent = (content: string) => {
    if (!content) return '';
    return content
      .replace(/#(\w+)/g, '<span class="text-ey-accent-blue font-medium cursor-pointer hover:underline">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-ey-purple font-medium cursor-pointer hover:underline">@$1</span>');
  };

  // Gérer une réaction
  const handleReaction = (reactionType: ReactionType) => {
    onReaction(post.id, reactionType);
    setShowReactionPicker(false);
  };

  // Gérer un commentaire
  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    setIsCommenting(true);
    try {
      await onComment(post.id, commentText.trim());
      setCommentText('');
      
      if (showCommentsSection) {
        await loadComments(true);
      }
    } catch (error) {
      console.error('Erreur commentaire:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  // Gérer une réponse à un commentaire
  const handleReply = async (parentCommentId: string) => {
    if (!replyText.trim()) return;
    
    setIsReplying(true);
    try {
      const replyDto: CreateCommentDto = {
        postId: post.id,
        content: replyText.trim(),
        parentCommentId
      };
      
      await postService.createComment(replyDto);
      setReplyText('');
      setReplyingTo(null);
      
      await loadReplies(parentCommentId);
      toast.success('Réponse ajoutée !');
    } catch (error) {
      console.error('Erreur réponse:', error);
      toast.error('Erreur lors de l\'ajout de la réponse');
    } finally {
      setIsReplying(false);
    }
  };

  // Réaction sur un commentaire
  const handleCommentReaction = async (commentId: string, reactionType: ReactionType) => {
    try {
      const reactionDto: CreateReactionDto = {
        type: reactionType,
        targetId: commentId,
        targetType: ContentType.COMMENT
      };
      
      await postService.toggleReaction(reactionDto);
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked 
              ? Math.max(0, comment.likesCount - 1)
              : comment.likesCount + 1
          };
        }
        return comment;
      }));
      
    } catch (error) {
      console.error('Erreur réaction commentaire:', error);
      toast.error('Erreur lors de la réaction');
    }
  };

  // Supprimer le post
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return;
    
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
      toast.success('Publication supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Gérer les bookmarks/favoris
  const handleBookmark = async () => {
    if (loadingBookmark || checkingBookmarkStatus) return;
    
    if (!currentUser?.id) {
      toast.error('Vous devez être connecté pour sauvegarder un post');
      return;
    }
    
    setLoadingBookmark(true);
    try {
      if (isBookmarked) {
        await postService.unbookmarkPost(post.id);
        setIsBookmarked(false);
        toast.success('Retiré des favoris');
      } else {
        await postService.bookmarkPost(post.id);
        setIsBookmarked(true);
        toast.success('Ajouté aux favoris');
      }
    } catch (error: any) {
      console.error('Erreur bookmark:', error);
      
      if (error?.response?.status === 400 && error?.response?.data?.message?.includes('déjà sauvegardé')) {
        setIsBookmarked(true);
        toast.info('Ce post est déjà dans vos favoris');
      } else if (error?.response?.status === 404) {
        if (error?.response?.data?.message?.includes('Bookmark non trouvé')) {
          setIsBookmarked(false);
          toast.info('Ce post n\'était pas dans vos favoris');
        } else {
          toast.error('Post non trouvé');
        }
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } finally {
      setLoadingBookmark(false);
      setShowMoreOptions(false);
    }
  };
const handleFollowClick = async () => {
  try {
    console.log('=== DEBUT handleFollowClick ===');
    console.log('handleFollowClick - post.authorId:', post.authorId);
    console.log('handleFollowClick - isFollowing:', isFollowing);
    
    if (!post.authorId) {
      console.error('post.authorId est undefined ou null');
      toast.error('Erreur: ID utilisateur manquant');
      return;
    }

    console.log('handleFollowClick - Appel de la fonction appropriée...');
    
    if (isFollowing) {
      console.log('handleFollowClick - Appel onUnfollow');
      await onUnfollow(post.authorId);
    } else {
      console.log('handleFollowClick - Appel onFollow');
      await onFollow(post.authorId);
    }
    
    // Mettre à jour l'état local
    setIsFollowing(!isFollowing);
    
    console.log('=== FIN handleFollowClick (succès) ===');
    
  } catch (error) {
    console.error('=== ERREUR handleFollowClick ===');
    console.error('Erreur follow/unfollow:', error);
    toast.error('Erreur lors de l\'opération');
    console.log('=== FIN handleFollowClick (erreur) ===');
  }
};


  // Signaler le contenu
  const handleFlag = async (reason: string, description?: string) => {
    if (!currentUser?.id) {
      toast.error('Vous devez être connecté pour signaler un contenu');
      return;
    }
    
    setIsFlagging(true);
    try {
      const flagDto = {
        targetId: post.id,
        targetType: ContentType.POST,
        reason: reason,
        description: description
      };
      
      console.log('Données du signalement:', {
        ...flagDto,
        reportedBy: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          department: currentUser.department
        },
        reportedPost: {
          id: post.id,
          authorId: post.authorId,
          authorName: post.authorName,
          content: post.content.substring(0, 200),
          createdAt: post.createdAt
        },
        timestamp: new Date().toISOString()
      });

      await postService.flagContent(flagDto);
      toast.success('Contenu signalé avec succès. Notre équipe va examiner ce signalement.');
      setShowMoreOptions(false);
    } catch (error) {
      console.error('Erreur signalement:', error);
      toast.error('Erreur lors du signalement. Veuillez réessayer.');
    } finally {
      setIsFlagging(false);
    }
  };

  // Copier le lien du post
  const copyPostLink = () => {
    try {
      const link = `${window.location.origin}/EyEngage/social/posts/${post.id}`;
      navigator.clipboard.writeText(link);
      toast.success('Lien copié dans le presse-papiers !');
      setShowMoreOptions(false);
    } catch (error) {
      console.error('Erreur copie lien:', error);
      toast.error('Erreur lors de la copie du lien');
    }
  };

  // Partager le post
  const sharePost = async () => {
    try {
      if (onShare) {
        onShare(post);
      } else {
        await postService.sharePostExternal(post);
      }
      setShowMoreOptions(false);
    } catch (error: any) {
      if (error.message !== 'fallback') {
        console.error('Erreur partage:', error);
        toast.error('Erreur lors du partage');
      }
    }
  };

  // Obtenir l'URL d'image de profil
  const getProfilePictureUrl = (path?: string | null) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
  };

  // Obtenir l'URL d'un fichier
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

  // Obtenir le type de fichier
  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'word';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    } else if (['txt'].includes(extension)) {
      return 'text';
    }
    
    return 'unknown';
  };

  // Obtenir l'icône de fichier
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'word': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'excel': return <FileText className="w-5 h-5 text-green-500" />;
      case 'text': return <FileText className="w-5 h-5 text-gray-500" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const isOwnPost = currentUser?.id === post.authorId;
  const profilePictureUrl = getProfilePictureUrl(post.authorProfilePicture);

  // Composant Modal Portal pour l'affichage correct
  const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    if (!isMounted) return null;
    return createPortal(children, document.body);
  };

  return (
    <>
      <motion.div
        className="card-ey p-6 hover:shadow-ey-lg transition-all duration-200 relative"
        whileHover={{ y: -2 }}
      >
        {/* En-tête du post */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Avatar */}
            <Link 
              href={`/EyEngage/profile/${post.authorId}`}
              className="flex-shrink-0 group"
            >
              <div className="relative">
                {profilePictureUrl ? (
                  <Image
                    src={profilePictureUrl}
                    alt={post.authorName || 'Avatar'}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-ey-yellow group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-ey-primary rounded-full flex items-center justify-center border-2 border-ey-yellow group-hover:scale-105 transition-transform">
                    <span className="text-ey-black font-bold text-lg">
                      {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-ey-white rounded-full flex items-center justify-center shadow-ey-sm">
                  <Building className="w-3 h-3 text-ey-gray-600" />
                </div>
              </div>
            </Link>

            {/* Informations auteur */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  href={`/EyEngage/profile/${post.authorId}`}
                  className="font-bold text-ey-black hover:text-ey-accent-blue transition-colors"
                >
                  {post.authorName || 'Utilisateur inconnu'}
                </Link>
                
                <span className="text-ey-gray-500">•</span>
                
                <span className="text-sm text-ey-gray-600 bg-ey-gray-100 px-2 py-1 rounded-ey-md">
                  {post.authorDepartment || 'Non spécifié'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-ey-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </span>
                
                {post.isEdited && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Edit className="w-3 h-3" />
                      Modifié
                    </span>
                  </>
                )}
                
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
                    <span>Département uniquement</span>
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

          {/* Menu d'options */}
          <div className="relative">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-ey-gray-600" />
            </button>
            
            <AnimatePresence>
              {showMoreOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-12 bg-ey-white rounded-ey-lg shadow-ey-xl border border-ey-gray-200 py-2 min-w-48 z-[100]"
                >
                  {isOwnPost ? (
                    <>
                      <button 
                        onClick={() => {
                          onEdit?.(post);
                          setShowMoreOptions(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-ey-gray-50 text-ey-gray-700 w-full text-left"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-ey-gray-50 text-ey-red w-full text-left"
                      >
                        {isDeleting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {isDeleting ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleBookmark}
                        disabled={loadingBookmark || checkingBookmarkStatus}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-ey-gray-50 text-ey-gray-700 w-full text-left"
                      >
                        {loadingBookmark ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-ey-yellow' : ''}`} />
                        )}
                        {loadingBookmark ? 'Chargement...' : (isBookmarked ? 'Retirer des favoris' : 'Sauvegarder')}
                      </button>
                      <button 
                        onClick={() => {
                          setShowFlagModal(true);
                          setShowMoreOptions(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-ey-gray-50 text-ey-gray-700 w-full text-left"
                      >
                        <Flag className="w-4 h-4" />
                        Signaler
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={copyPostLink}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-ey-gray-50 text-ey-gray-700 w-full text-left"
                  >
                    <Share2 className="w-4 h-4" />
                    Copier le lien
                  </button>
                  
                  <button 
                    onClick={sharePost}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-ey-gray-50 text-ey-gray-700 w-full text-left"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Partager externe
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Post original (si partage) */}
        {post.originalPost && (
          <div className="mb-4 p-4 border-l-4 border-ey-accent-blue bg-ey-accent-blue/5 rounded-r-ey-lg">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-ey-accent-blue" />
              <span className="text-sm text-ey-gray-600">
                Partage de <span className="font-medium text-ey-black">{post.originalAuthorName}</span>
              </span>
            </div>
            <div className="text-ey-gray-700 text-sm">
              {post.originalPost.content}
            </div>
            
            {/* Afficher les images/fichiers du post original */}
            {post.originalPost.images && post.originalPost.images.length > 0 && (
              <div className="mt-3 grid gap-2 grid-cols-2">
                {post.originalPost.images.slice(0, 2).map((imagePath, index) => {
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
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Stats du post original */}
            <div className="flex items-center gap-4 mt-3 text-xs text-ey-gray-500">
              <span>{post.originalPost.likesCount} réactions</span>
              <span>{post.originalPost.commentsCount} commentaires</span>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="mb-4">
          <div 
            className="text-ey-black leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 bg-ey-accent-blue/10 text-ey-accent-blue px-3 py-1 rounded-ey-full text-sm font-medium hover:bg-ey-accent-blue/20 cursor-pointer transition-colors"
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              'grid-cols-2 lg:grid-cols-3'
            }`}>
              {post.images.slice(0, 6).map((imagePath, index) => {
                const imageUrl = getFileUrl(imagePath);
                if (!imageUrl) return null;
                
                return (
                  <div key={`${post.id}-image-${index}`} className="relative group">
                    <div className="aspect-square rounded-ey-lg overflow-hidden bg-ey-gray-100">
                      {!imageError[imagePath] ? (
                        <Image
                          src={imageUrl}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={() => {
                            setImageError(prev => ({ ...prev, [imagePath]: true }));
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ey-gray-400 flex-col">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span className="text-xs">Image non disponible</span>
                        </div>
                      )}
                    </div>
                    
                    {index === 5 && post.images!.length > 6 && (
                      <div className="absolute inset-0 bg-ey-black/60 rounded-ey-lg flex items-center justify-center text-ey-white font-bold text-lg">
                        +{post.images!.length - 6}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fichiers attachés */}
        {post.files && post.files.length > 0 && (
          <div className="mb-4">
            <div className="bg-ey-gray-50 rounded-ey-lg p-4">
              <h4 className="text-sm font-medium text-ey-gray-700 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Fichiers attachés ({post.files.length})
              </h4>
              <div className="space-y-2">
                {post.files.map((filePath, index) => {
                  const fileUrl = getFileUrl(filePath);
                  const fileName = filePath?.split('/').pop() || filePath || 'Fichier inconnu';
                  const fileType = getFileType(fileName);
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-ey-white rounded-ey-md p-3 border border-ey-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(fileType)}
                        </div>
                        <span className="text-sm text-ey-gray-700 truncate flex-1">{fileName}</span>
                      </div>
                      
                      {fileUrl && (
                        <div className="flex items-center gap-2">
                          {fileType === 'pdf' && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ey-outline btn-sm flex items-center gap-1"
                              title="Ouvrir dans un nouvel onglet"
                            >
                              <Eye className="w-3 h-3" />
                              Voir
                            </a>
                          )}
                          <a
                            href={fileUrl}
                            download
                            className="btn-ey-primary btn-sm flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Télécharger
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="flex items-center justify-between text-sm text-ey-gray-500 mb-4 py-2 border-t border-ey-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewsCount || 0} vues</span>
            </div>
            
            {(post.likesCount || 0) > 0 && (
              <button
                onClick={() => {
                  loadReactions();
                  setShowReactionsModal(true);
                }}
                className="hover:underline transition-colors"
              >
                {post.likesCount} réaction{post.likesCount > 1 ? 's' : ''}
              </button>
            )}
            
            {(post.commentsCount || 0) > 0 && (
              <span>{post.commentsCount} commentaire{post.commentsCount > 1 ? 's' : ''}</span>
            )}
            
            {(post.sharesCount || 0) > 0 && (
              <span>{post.sharesCount} partage{post.sharesCount > 1 ? 's' : ''}</span>
            )}
          </div>
          
          <div className="text-xs text-ey-gray-400">
            {post.isPinned && (
              <span className="bg-ey-yellow/20 text-ey-orange px-2 py-1 rounded-ey-full mr-2">
                Épinglé
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          
          {/* Réactions */}
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className={`btn-action ${post.isLiked ? 'text-ey-red bg-ey-red/10' : 'text-ey-gray-600'}`}
            >
              {post.userReaction ? (
                <span className="text-lg mr-2">{reactionEmojis[post.userReaction]}</span>
              ) : (
                <Heart className="w-5 h-5 mr-2" />
              )}
              Réagir
              {(post.likesCount || 0) > 0 && (
                <span className="ml-2 text-sm bg-ey-gray-100 px-2 py-0.5 rounded-ey-full">
                  {post.likesCount}
                </span>
              )}
            </button>
            
            {/* Sélecteur de réactions */}
            <AnimatePresence>
              {showReactionPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-12 left-0 bg-ey-white rounded-ey-xl shadow-ey-xl border border-ey-gray-200 p-3 z-[100]"
                >
                  <div className="flex gap-2">
                    {Object.entries(reactionEmojis).map(([type, emoji]) => (
                      <button
                        key={type}
                        onClick={() => handleReaction(type as ReactionType)}
                        className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors text-xl hover:scale-110"
                        title={type}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Commentaires */}
          <button
            onClick={() => {
              setShowCommentsSection(!showCommentsSection);
              if (!showCommentsSection && comments.length === 0 && post.commentsCount > 0) {
                loadComments(true);
              }
              if (!showCommentsSection) {
                setTimeout(() => commentInputRef.current?.focus(), 100);
              }
            }}
            className="btn-action text-ey-gray-600"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Commenter
            {(post.commentsCount || 0) > 0 && (
              <span className="ml-2 text-sm bg-ey-gray-100 px-2 py-0.5 rounded-ey-full">
                {post.commentsCount}
              </span>
            )}
          </button>

          {/* Partage */}
          {post.allowShares && (
            <button 
              onClick={sharePost}
              className="btn-action text-ey-gray-600"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Partager
              {(post.sharesCount || 0) > 0 && (
                <span className="ml-2 text-sm bg-ey-gray-100 px-2 py-0.5 rounded-ey-full">
                  {post.sharesCount}
                </span>
              )}
            </button>
          )}

          {/* Sauvegarder */}
          <button 
            onClick={handleBookmark}
            disabled={loadingBookmark || checkingBookmarkStatus}
            className="btn-action text-ey-gray-600"
            title={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {loadingBookmark || checkingBookmarkStatus ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-ey-yellow' : ''}`} />
            )}
          </button>
        </div>

        {/* Section commentaires */}
        <AnimatePresence>
          {showCommentsSection && post.allowComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-ey-gray-100 pt-4 space-y-4"
            >
              {/* Zone de création de commentaire */}
              <div className="flex gap-3">
                {currentUser && (
                  <div className="flex-shrink-0">
                    {currentUser.profilePicture ? (
                      <Image
                        src={getProfilePictureUrl(currentUser.profilePicture) || '/default-avatar.png'}
                        alt={currentUser.fullName || 'Avatar'}
                        width={32}
                        height={32}
                        className="rounded-full border border-ey-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                        <span className="text-ey-black font-bold text-sm">
                          {currentUser.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex-1 space-y-3">
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Écrivez un commentaire..."
                    className="w-full resize-none border border-ey-gray-200 rounded-ey-lg p-3 focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                    rows={2}
                    maxLength={2000}
                  />
                  
                  {commentText.trim() && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ey-gray-500">
                        {commentText.length}/2000 caractères
                      </span>
                      <button
                        onClick={handleComment}
                        disabled={isCommenting || !commentText.trim()}
                        className="btn-ey-primary btn-sm flex items-center gap-2"
                      >
                        {isCommenting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {isCommenting ? 'Envoi...' : 'Publier'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Liste des commentaires */}
              {loadingComments && comments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-ey-gray-400 mr-3" />
                  <span className="text-ey-gray-500">Chargement des commentaires...</span>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      {/* Avatar du commentateur */}
                      <div className="flex-shrink-0">
                        {comment.authorProfilePicture ? (
                          <Image
                            src={getProfilePictureUrl(comment.authorProfilePicture) || '/default-avatar.png'}
                            alt={comment.authorName}
                            width={32}
                            height={32}
                            className="rounded-full border border-ey-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                            <span className="text-ey-black font-bold text-sm">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        {/* Contenu du commentaire */}
                        <div className="bg-ey-gray-50 rounded-ey-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-ey-black text-sm">
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-ey-gray-500">
                              {comment.authorDepartment}
                            </span>
                            <span className="text-xs text-ey-gray-400">•</span>
                            <span className="text-xs text-ey-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </span>
                            {comment.isEdited && (
                              <span className="text-xs text-ey-gray-400">(modifié)</span>
                            )}
                          </div>
                          
                          <p className="text-ey-black text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                        
                        {/* Actions du commentaire */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <button
                            onClick={() => handleCommentReaction(comment.id, ReactionType.LIKE)}
                            className={`flex items-center gap-1 hover:text-ey-accent-blue transition-colors ${
                              comment.isLiked ? 'text-ey-accent-blue' : 'text-ey-gray-500'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {comment.likesCount > 0 && comment.likesCount}
                          </button>
                          
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-ey-gray-500 hover:text-ey-accent-blue transition-colors"
                          >
                            Répondre
                          </button>
                          
                          {comment.repliesCount > 0 && (
                            <button
                              onClick={() => {
                                if (comment.showReplies) {
                                  setComments(prev => prev.map(c => 
                                    c.id === comment.id 
                                      ? { ...c, showReplies: false, replies: [] }
                                      : c
                                  ));
                                } else {
                                  loadReplies(comment.id);
                                }
                              }}
                              className="flex items-center gap-1 text-ey-accent-blue hover:text-ey-accent-blue-dark transition-colors"
                            >
                              {comment.showReplies ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Masquer les réponses
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Voir les {comment.repliesCount} réponse{comment.repliesCount > 1 ? 's' : ''}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* Zone de réponse */}
                        {replyingTo === comment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 flex gap-3"
                          >
                            {currentUser?.profilePicture ? (
                              <Image
                                src={getProfilePictureUrl(currentUser.profilePicture) || '/default-avatar.png'}
                                alt={currentUser.fullName || 'Avatar'}
                                width={28}
                                height={28}
                                className="rounded-full border border-ey-gray-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-gradient-ey-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-ey-black font-bold text-xs">
                                  {currentUser?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex-1 space-y-2">
                              <textarea
                                ref={replyInputRef}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Répondre à ${comment.authorName}...`}
                                className="w-full resize-none border border-ey-gray-200 rounded-ey-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                                rows={2}
                              />
                              
                              {replyText.trim() && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setReplyText('');
                                      setReplyingTo(null);
                                    }}
                                    className="btn-ey-outline btn-sm"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => handleReply(comment.id)}
                                    disabled={isReplying || !replyText.trim()}
                                    className="btn-ey-primary btn-sm flex items-center gap-1"
                                  >
                                    {isReplying ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    {isReplying ? 'Envoi...' : 'Répondre'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Réponses */}
                        {comment.showReplies && comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-ey-gray-200 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="flex-shrink-0">
                                  {reply.authorProfilePicture ? (
                                    <Image
                                      src={getProfilePictureUrl(reply.authorProfilePicture) || '/default-avatar.png'}
                                      alt={reply.authorName}
                                      width={28}
                                      height={28}
                                      className="rounded-full border border-ey-gray-200"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                                      <span className="text-ey-black font-bold text-xs">
                                        {reply.authorName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="bg-ey-gray-50 rounded-ey-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-ey-black text-sm">
                                        {reply.authorName}
                                      </span>
                                      <span className="text-xs text-ey-gray-500">
                                        {formatDistanceToNow(new Date(reply.createdAt), { 
                                          addSuffix: true, 
                                          locale: fr 
                                        })}
                                      </span>
                                    </div>
                                    
                                    <p className="text-ey-black text-sm whitespace-pre-wrap">
                                      {reply.content}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <button
                                      onClick={() => handleCommentReaction(reply.id, ReactionType.LIKE)}
                                      className={`flex items-center gap-1 hover:text-ey-accent-blue transition-colors ${
                                        reply.isLiked ? 'text-ey-accent-blue' : 'text-ey-gray-500'
                                      }`}
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                      {reply.likesCount > 0 && reply.likesCount}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {comment.loadingReplies && (
                          <div className="flex items-center justify-center py-4 text-ey-gray-500 text-sm">
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            Chargement des réponses...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Charger plus de commentaires */}
                  {hasMoreComments && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => loadComments(false)}
                        disabled={loadingComments}
                        className="btn-ey-outline btn-sm flex items-center gap-2 mx-auto"
                      >
                        {loadingComments ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {loadingComments ? 'Chargement...' : 'Voir plus de commentaires'}
                      </button>
                    </div>
                  )}
                </div>
              ) : post.commentsCount === 0 ? (
                <div className="text-center py-8 text-ey-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-ey-gray-300" />
                  <p>Aucun commentaire pour le moment.</p>
                  <p className="text-sm">Soyez le premier à commenter !</p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MODALES RENDUES AVEC PORTALS - AFFICHAGE CORRECT */}
      {isMounted && (
        <ModalPortal>
          {/* Modal de signalement */}
          <FlagModal
            isOpen={showFlagModal}
            onClose={() => setShowFlagModal(false)}
            onSubmit={handleFlag}
            post={post}
            currentUser={currentUser}
            loading={isFlagging}
          />
          
          {/* Modal des réactions */}
          <UserListModal
            isOpen={showReactionsModal}
            onClose={() => setShowReactionsModal(false)}
            users={reactionUsers.map(r => ({
              id: r.id,
              fullName: r.userName,
              email: '',
              department: r.userDepartment,
              profilePicture: r.userProfilePicture,
              createdAt: r.createdAt.toString(),
              roles: []
            }))}
            title="Réactions"
            subtitle={selectedReactionType 
              ? `Utilisateurs ayant réagi avec ${reactionEmojis[selectedReactionType]}` 
              : 'Tous les utilisateurs ayant réagi'
            }
            allowExport={false}
            showActions={false}
            enableProfileLink={true}
          />
        </ModalPortal>
      )}
    </>
  );
}