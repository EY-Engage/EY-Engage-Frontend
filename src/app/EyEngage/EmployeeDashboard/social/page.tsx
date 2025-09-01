'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Plus, Search, Filter, TrendingUp, Users, Heart, MessageSquare, 
  Share2, Bookmark, Hash, Calendar, Bell, Settings, RefreshCw,
  Image, Paperclip, Globe, Building, Eye, ChevronDown,
  AlertTriangle, CheckCircle, Trash2, Edit, ExternalLink,
  BookOpen, Star, Clock, X, User, FileText, Sliders,
  SearchX, Zap, Target, ChevronRight, ChevronUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  PostDto, CreatePostDto, FeedQueryDto, ReactionType, ContentType,
  CreateReactionDto, CreateCommentDto, TrendingDto, FollowDto, SharePostDto,
  SearchResultDto, SearchQueryDto, Department
} from '@/types/types';
import toast from 'react-hot-toast';
import EnhancedLoading from '@/components/SkeletonLoader';
import { followService } from '@/lib/services/social/followService';
import { postService } from '@/lib/services/social/postService';
import CreatePostModal from './CreatePost';
import UpdatePostModal from './UpdatePostModal';
import SharePostModal from './SharePostModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ReactionsModal from './ReactionsModal';
import FollowSuggestions from './FollowSuggestions';
import PostCard from './PostCard';
import TrendingPanel from './TrendingSection';

interface ReactionUser {
  id: string;
  userName: string;
  userProfilePicture?: string;
  userDepartment: string;
  type: ReactionType;
  createdAt: Date;
}

interface AdvancedSearchOptions {
  query?: string;
  author?: string;
  department?: Department;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasImages?: boolean;
  hasFiles?: boolean;
  sortBy?: 'recent' | 'popular' | 'relevance';
  page?: number;
  limit?: number;
}

interface SearchSuggestion {
  type: 'content' | 'author' | 'tag';
  text: string;
  count: number;
  highlighted: string;
}

export default function EmployeeSocialDashboard() {
   const { user, roles } = useAuth()
  
  // États principaux
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [trending, setTrending] = useState<TrendingDto | null>(null);
  const [followSuggestions, setFollowSuggestions] = useState<FollowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // États de recherche avec UX améliorée
  const [searchMode, setSearchMode] = useState<'feed' | 'simple' | 'advanced'>('feed');
  const [searchResults, setSearchResults] = useState<SearchResultDto | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedPosts, setHighlightedPosts] = useState<PostDto[]>([]);
  
  // États des filtres et recherche simple
  const [feedQuery, setFeedQuery] = useState<FeedQueryDto>({
    page: 1,
    limit: 10,
    sortBy: 'recent'
  });

  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<number | null>(null);
  const suggestionsTimeoutRef = useRef<number | null>(null);

  // États de recherche avancée
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedSearchOptions>({
    page: 1,
    limit: 10,
    sortBy: 'recent'
  });

  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  
  // États des actions sur les posts
  const [selectedPost, setSelectedPost] = useState<PostDto | null>(null);
  const [postToDelete, setPostToDelete] = useState<PostDto | null>(null);
  const [postReactions, setPostReactions] = useState<ReactionUser[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostDto[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  
  // Statistiques et notifications
  const [stats, setStats] = useState({
    myPosts: 0,
    myReactions: 0,
    myComments: 0,
    followers: 0,
    following: 0,
    bookmarks: 0
  });

  /**
   * Recherche simple avec suggestions dynamiques et highlighting
   */
  const performSimpleSearch = useCallback(async (query: string, page = 1) => {
    if (!query.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await postService.searchPosts({
        query: query.trim(),
        page,
        limit: 10
      });
      
      setSearchResults(results);
      setHighlightedPosts(results.highlightedPosts || results.posts);
      setSearchMode('simple');
    } catch (error) {
      console.error('Erreur recherche simple:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  /**
   * Charger les suggestions de recherche en temps réel
   */
  const loadSearchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { suggestions } = await postService.getSearchSuggestions(query, 5);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Erreur suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  /**
   * Recherche avancée
   */
  const performAdvancedSearch = useCallback(async (options: AdvancedSearchOptions) => {
    setSearchLoading(true);
    try {
      const results = await postService.advancedSearch(options);
      setSearchResults(results);
      setSearchMode('advanced');
    } catch (error) {
      console.error('Erreur recherche avancée:', error);
      toast.error('Erreur lors de la recherche avancée');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  /**
   * fetchFeed corrigé avec support myDepartment
   */
  const fetchFeed = useCallback(async (query: FeedQueryDto, append = false) => {
    try {
      if (!append) setLoading(true);
      const feedData = await postService.getFeed(query);
      if (append) {
        setPosts(prev => [...prev, ...feedData.posts]);
      } else {
        setPosts(feedData.posts);
      }
      setHasMore(!!feedData.hasNext);
      setSearchMode('feed');
      setSearchResults(null);
      setHighlightedPosts([]);
    } catch (error) {
      console.error('Erreur chargement feed:', error);
      toast.error('Erreur lors du chargement des publications');
    } finally {
      if (!append) setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  // Gestion recherche avec suggestions en temps réel
  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    // Nettoyer les timeouts précédents
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    if (suggestionsTimeoutRef.current) {
      window.clearTimeout(suggestionsTimeoutRef.current);
    }

    if (!value.trim()) {
      setSearchMode('feed');
      setSearchResults(null);
      setHighlightedPosts([]);
      setShowSuggestions(false);
      return;
    }

    // Suggestions immédiates (300ms)
    const suggestionsId = window.setTimeout(() => {
      loadSearchSuggestions(value);
    }, 300);
    suggestionsTimeoutRef.current = suggestionsId as unknown as number;

    // Recherche complète avec debounce (600ms)
    const searchId = window.setTimeout(() => {
      performSimpleSearch(value);
    }, 600);
    searchTimeoutRef.current = searchId as unknown as number;
  };

  const handleManualSearch = () => {
    // Nettoyer les timeouts
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    if (suggestionsTimeoutRef.current) {
      window.clearTimeout(suggestionsTimeoutRef.current);
      suggestionsTimeoutRef.current = null;
    }
    
    setShowSuggestions(false);
    
    if (searchInput.trim()) {
      performSimpleSearch(searchInput);
    } else {
      setSearchMode('feed');
      setSearchResults(null);
      setHighlightedPosts([]);
    }
  };

  // Sélectionner une suggestion
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchInput(suggestion.text);
    setShowSuggestions(false);
    performSimpleSearch(suggestion.text);
  };

  // Charger les tendances
  const loadTrending = useCallback(async () => {
    try {
      const trendingData = await postService.getTrending();
      setTrending(trendingData);
    } catch (error) {
      console.error('Erreur chargement tendances:', error);
    }
  }, []);

  // Charger les suggestions de suivi
  const loadFollowSuggestions = useCallback(async () => {
    try {
      const suggestions = await followService.getFollowSuggestions(5);
      setFollowSuggestions(suggestions);
    } catch (error) {
      console.error('Erreur suggestions:', error);
    }
  }, []);

  // Charger les posts sauvegardés
  const loadBookmarkedPosts = useCallback(async () => {
    if (!user) return;
    
    setLoadingBookmarks(true);
    try {
      const result = await postService.getBookmarkedPosts(1, 20);
      setBookmarkedPosts(result.posts);
      setStats(prev => ({ ...prev, bookmarks: result.total }));
    } catch (error) {
      console.error('Erreur chargement bookmarks:', error);
      toast.error('Erreur lors du chargement des favoris');
    } finally {
      setLoadingBookmarks(false);
    }
  }, [user]);

  // Charger les statistiques utilisateur
  const loadStats = useCallback(async () => {
    try {
      const currentPosts = searchMode === 'feed' ? posts : searchResults?.posts || [];
      const myPosts = currentPosts.filter(p => p.authorId === user?.id).length;
      setStats(prev => ({ ...prev, myPosts }));
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [posts, searchResults, searchMode, user?.id]);

  // Initialisation
  useEffect(() => {
    if (user) {
      fetchFeed(feedQuery, false);
      loadTrending();
      loadFollowSuggestions();
      loadBookmarkedPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Mettre à jour les stats
  useEffect(() => {
    loadStats();
  }, [posts, searchResults, loadStats]);

  // CORRECTION MAJEURE : applyFilters avec myDepartment
  const applyFilters = useCallback((filters: Partial<FeedQueryDto>) => {
    setFeedQuery(prev => {
      const newQuery: FeedQueryDto = {
        ...prev,
        ...filters,
        page: 1,
        department: filters.department !== undefined ? (filters.department as any) : prev.department,
        myDepartment: filters.myDepartment !== undefined ? (filters.myDepartment as any) : prev.myDepartment,
        departmentOnly: filters.departmentOnly !== undefined ? (filters.departmentOnly as any) : prev.departmentOnly,
        ...(filters.department && filters.department !== prev.department ? { myDepartment: false } : {})
      } as FeedQueryDto;

      fetchFeed(newQuery, false);
      return newQuery;
    });
  }, [fetchFeed]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    const newQuery: FeedQueryDto = {
      page: 1,
      limit: 10,
      sortBy: 'recent' as const
    } as FeedQueryDto;
    setFeedQuery(newQuery);
    setSearchInput('');
    setAdvancedOptions({
      page: 1,
      limit: 10,
      sortBy: 'recent'
    });
    setShowAdvancedSearch(false);
    setSearchResults(null);
    setHighlightedPosts([]);
    setShowSuggestions(false);
    setSearchMode('feed');
    fetchFeed(newQuery, false);
  };

  // Charger plus de posts (pagination)
  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      
      if (searchMode === 'feed') {
        setFeedQuery(prev => {
          const nextPage = (prev.page || 1) + 1;
          const nextQuery: FeedQueryDto = { ...prev, page: nextPage };
          fetchFeed(nextQuery, true);
          return nextQuery;
        });
      } else if (searchMode === 'simple' && searchInput.trim()) {
        const nextPage = (searchResults?.page || 1) + 1;
        performSimpleSearch(searchInput, nextPage).then(() => {
          setLoadingMore(false);
        });
      } else if (searchMode === 'advanced') {
        const nextPage = (searchResults?.page || 1) + 1;
        performAdvancedSearch({ ...advancedOptions, page: nextPage }).then(() => {
          setLoadingMore(false);
        });
      }
    }
  }, [loadingMore, hasMore, searchMode, searchInput, searchResults, advancedOptions, fetchFeed, performSimpleSearch, performAdvancedSearch]);

  // Actualiser le feed
  const refreshFeed = useCallback(async () => {
    setRefreshing(true);
    if (searchMode === 'feed') {
      const newQuery: FeedQueryDto = { ...(feedQuery || {}), page: 1 };
      setFeedQuery(newQuery);
      await fetchFeed(newQuery, false);
    } else if (searchMode === 'simple' && searchInput.trim()) {
      await performSimpleSearch(searchInput);
    } else if (searchMode === 'advanced') {
      await performAdvancedSearch({ ...advancedOptions, page: 1 });
    }
    await loadTrending();
    await loadFollowSuggestions();
    setRefreshing(false);
  }, [searchMode, feedQuery, searchInput, advancedOptions, fetchFeed, performSimpleSearch, performAdvancedSearch, loadTrending, loadFollowSuggestions]);

  // Gérer la recherche avancée
  const handleAdvancedSearch = () => {
    performAdvancedSearch(advancedOptions);
  };

  // Actions sur les posts (inchangées mais optimisées)
  const handlePostCreated = (newPost: PostDto) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
    toast.success('Publication créée avec succès !');
  };

  const handlePostUpdated = (updatedPost: PostDto) => {
    const updatePosts = (prevPosts: PostDto[]) => 
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post);
    
    setPosts(updatePosts);
    if (searchResults) {
      setSearchResults(prev => prev ? {
        ...prev,
        posts: updatePosts(prev.posts)
      } : null);
    }
    
    setShowUpdateModal(false);
    setSelectedPost(null);
    toast.success('Publication modifiée avec succès !');
  };

  const handlePostShared = (sharedPost: PostDto) => {
    setPosts(prev => [sharedPost, ...prev]);
    setShowShareModal(false);
    setSelectedPost(null);
    toast.success('Publication partagée avec succès !');
  };

  const handlePostDeleted = (postId: string) => {
    const filterPosts = (prevPosts: PostDto[]) => 
      prevPosts.filter(post => post.id !== postId);
    
    setPosts(filterPosts);
    if (searchResults) {
      setSearchResults(prev => prev ? {
        ...prev,
        posts: filterPosts(prev.posts),
        total: prev.total - 1
      } : null);
    }
    
    setShowDeleteModal(false);
    setPostToDelete(null);
    setBookmarkedPosts(filterPosts);
    toast.success('Publication supprimée avec succès !');
  };

  const handleEditPost = (post: PostDto) => {
    setSelectedPost(post);
    setShowUpdateModal(true);
  };

  const handleSharePost = (post: PostDto) => {
    setSelectedPost(post);
    setShowShareModal(true);
  };

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      const reactionDto: CreateReactionDto = {
        type: reactionType,
        targetId: postId,
        targetType: ContentType.POST
      };
      
      const result = await postService.toggleReaction(reactionDto);
      
      const updatePostReaction = (post: PostDto) => {
        if (post.id === postId) {
          if (result.action === 'added') {
            return {
              ...post,
              likesCount: post.likesCount + 1,
              isLiked: true,
              userReaction: reactionType
            };
          } else if (result.action === 'removed') {
            return {
              ...post,
              likesCount: Math.max(0, post.likesCount - 1),
              isLiked: false,
              userReaction: undefined
            };
          } else if (result.action === 'updated') {
            return {
              ...post,
              userReaction: reactionType
            };
          }
        }
        return post;
      };
      
      setPosts(prev => prev.map(updatePostReaction));
      if (searchResults) {
        setSearchResults(prev => prev ? {
          ...prev,
          posts: prev.posts.map(updatePostReaction)
        } : null);
      }
      
    } catch (error) {
      console.error('Erreur réaction:', error);
      toast.error('Erreur lors de la réaction');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const commentDto: CreateCommentDto = {
        postId,
        content
      };
      
      await postService.createComment(commentDto);
      
      const updatePostComments = (post: PostDto) => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1
          };
        }
        return post;
      };
      
      setPosts(prev => prev.map(updatePostComments));
      if (searchResults) {
        setSearchResults(prev => prev ? {
          ...prev,
          posts: prev.posts.map(updatePostComments)
        } : null);
      }
      
      toast.success('Commentaire ajouté !');
    } catch (error) {
      console.error('Erreur commentaire:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };
const handleUnfollow = async (userId: string) => {
  try {
    console.log('=== DEBUT handleUnfollow ===');
    console.log('handleUnfollow - userId:', userId);
    
    if (!userId) {
      toast.error('Erreur: ID utilisateur manquant');
      return;
    }

    const result = await followService.unfollowUser(userId);
    console.log('handleUnfollow - résultat:', result);
    
    // Mettre à jour l'état même si la relation n'existait pas
    const updateFollowStatus = (post: PostDto) => {
      if (post.authorId === userId) {
        return { ...post, isFollowingAuthor: false };
      }
      return post;
    };
    
    setPosts(prev => prev.map(updateFollowStatus));
    if (searchResults) {
      setSearchResults(prev => prev ? {
        ...prev,
        posts: prev.posts.map(updateFollowStatus)
      } : null);
    }
    
    toast.success('Abonnement annulé');
    console.log('=== FIN handleUnfollow (succès) ===');
    
  } catch (error: any) {
    console.error('=== ERREUR handleUnfollow ===');
    console.error('Erreur handleUnfollow:', error);
    
    if (error.message) {
      toast.error(`Erreur: ${error.message}`);
    } else {
      toast.error('Erreur lors du désabonnement');
    }
    
    console.log('=== FIN handleUnfollow (erreur) ===');
  }
};
 const handleFollow = async (userId: string) => {
  try {
    console.log('=== DEBUT handleFollow ===');
    console.log('handleFollow - userId:', userId);
    
    if (!userId) {
      toast.error('Erreur: ID utilisateur manquant');
      return;
    }

    const followDto: CreateFollowDto = {
      followedId: userId
    };

    const result = await followService.followUser(followDto);
    console.log('handleFollow - résultat:', result);
    
    // Mettre à jour l'état des posts
    const updateFollowStatus = (post: PostDto) => {
      if (post.authorId === userId) {
        return { ...post, isFollowingAuthor: true };
      }
      return post;
    };
    
    setPosts(prev => prev.map(updateFollowStatus));
    if (searchResults) {
      setSearchResults(prev => prev ? {
        ...prev,
        posts: prev.posts.map(updateFollowStatus)
      } : null);
    }
    
    await loadFollowSuggestions();
    toast.success('Utilisateur suivi avec succès !');
    console.log('=== FIN handleFollow (succès) ===');
    
  } catch (error: any) {
    console.error('=== ERREUR handleFollow ===');
    console.error('Erreur handleFollow:', error);
    
    if (error.message) {
      toast.error(`Erreur: ${error.message}`);
    } else {
      toast.error('Erreur lors du suivi de l\'utilisateur');
    }
    
    console.log('=== FIN handleFollow (erreur) ===');
  }
};




  const handleShowReactions = async (post: PostDto) => {
    try {
      const reactions = await postService.getPostReactions(post.id);
      setPostReactions(reactions.map(r => ({
        id: r.userId,
        userName: r.userName,
        userProfilePicture: r.userProfilePicture,
        userDepartment: r.userDepartment,
        type: r.type,
        createdAt: r.createdAt
      })));
      setSelectedPost(post);
      setShowReactionsModal(true);
    } catch (error) {
      console.error('Erreur réactions:', error);
      toast.error('Erreur lors du chargement des réactions');
    }
  };

  const handleDeletePost = (post: PostDto) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const handleShowBookmarks = async () => {
    await loadBookmarkedPosts();
    setShowBookmarksModal(true);
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
      if (suggestionsTimeoutRef.current) {
        window.clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

  if (loading) {
    return (
      <EnhancedLoading 
        fullScreen 
        message="Chargement du réseau social..." 
        variant="pulse" 
      />
    );
  }

  const currentPosts = searchMode === 'feed' ? posts : 
    searchMode === 'simple' ? highlightedPosts : 
    searchResults?.posts || [];
  const showLoadMore = searchMode === 'feed' ? hasMore : 
    (searchResults && searchResults.page < searchResults.totalPages);

  return (
    <div className="min-h-screen bg-ey-light-gray">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar gauche - Tendances */}
          <div className="lg:col-span-1 space-y-6">
            <TrendingPanel trending={trending} onRefresh={loadTrending} />
            <FollowSuggestions 
              suggestions={followSuggestions} 
              onFollow={handleFollow}
              onRefresh={loadFollowSuggestions}
            />
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* En-tête avec recherche dynamique */}
            <div className="card-ey p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-ey-black mb-2">
                    {searchMode === 'feed' ? 'Réseau Social EY' : 
                     searchMode === 'simple' ? 'Résultats de recherche' : 
                     'Recherche avancée'}
                  </h1>
                  <p className="text-ey-gray-600">
                    {searchMode === 'feed' ? 'Connectez-vous avec vos collègues et partagez vos idées' :
                     searchMode === 'simple' ? `${searchResults?.total || 0} résultats trouvés pour "${searchInput}"` :
                     `Recherche personnalisée - ${searchResults?.total || 0} résultats`}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={refreshFeed}
                    disabled={refreshing}
                    className="btn-ey-outline flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualiser
                  </button>
                  
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-ey-primary flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nouvelle publication
                  </button>
                </div>
              </div>

              {/* Barre de recherche avec suggestions dynamiques */}
              <div className="relative mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ey-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par contenu..."
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                      onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                      className="input-ey pl-10 pr-12 py-3 text-base focus:ring-2 focus:ring-ey-yellow/20 transition-all"
                    />
                    {searchInput && (
                      <button
                        onClick={() => {
                          setSearchInput('');
                          setSearchMode('feed');
                          setSearchResults(null);
                          setHighlightedPosts([]);
                          setShowSuggestions(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ey-gray-400 hover:text-ey-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    
                    {searchLoading && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <RefreshCw className="w-4 h-4 animate-spin text-ey-accent-blue" />
                      </div>
                    )}

                    {/* Suggestions dynamiques */}
                    <AnimatePresence>
                      {showSuggestions && searchSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-ey-white border border-ey-gray-200 rounded-ey-lg shadow-ey-xl z-50 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-2">
                            {searchSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="w-full px-4 py-3 text-left hover:bg-ey-gray-50 transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0">
                                    {suggestion.type === 'content' && <MessageSquare className="w-4 h-4 text-ey-accent-blue" />}
                                    {suggestion.type === 'author' && <User className="w-4 h-4 text-ey-green" />}
                                    {suggestion.type === 'tag' && <Hash className="w-4 h-4 text-ey-yellow" />}
                                  </div>
                                  <div className="flex-1">
                                    <div 
                                      className="text-sm text-ey-black group-hover:text-ey-accent-blue"
                                      dangerouslySetInnerHTML={{ __html: suggestion.highlighted }}
                                    />
                                    <div className="text-xs text-ey-gray-500">
                                      {suggestion.count} résultat{suggestion.count > 1 ? 's' : ''}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-ey-gray-400 group-hover:text-ey-accent-blue" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={handleManualSearch}
                    disabled={searchLoading}
                    className="btn-ey-primary px-6 py-3 flex items-center gap-2"
                  >
                    {searchLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    Rechercher
                  </button>

                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={`btn-ey-outline px-4 py-3 flex items-center gap-2 transition-all ${showAdvancedSearch ? 'bg-ey-yellow/20 border-ey-yellow text-ey-black' : ''}`}
                  >
                    <Sliders className="w-5 h-5" />
                    Avancée
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Indicateur du mode de recherche avec design EY */}
                {searchMode !== 'feed' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 text-sm"
                  >
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-ey-accent-blue/20 to-ey-green/20 text-ey-accent-blue rounded-full border border-ey-accent-blue/30">
                      <Target className="w-4 h-4" />
                      {searchMode === 'simple' ? 'Recherche par contenu' : 'Recherche avancée'}
                    </div>
                    <button
                      onClick={resetFilters}
                      className="text-ey-gray-500 hover:text-ey-accent-blue transition-colors underline"
                    >
                      Retour au fil d'actualité
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Recherche avancée */}
              <AnimatePresence>
                {showAdvancedSearch && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-ey-gray-200 pt-6 space-y-6"
                  >
                    <div className="bg-gradient-to-r from-ey-yellow/10 to-ey-green/10 rounded-ey-lg p-6 border border-ey-yellow/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-ey-yellow to-ey-green rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-ey-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-ey-black">Recherche avancée</h3>
                          <p className="text-sm text-ey-gray-600">Affinez votre recherche avec des critères précis</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-ey-black mb-2">
                            <User className="w-4 h-4 inline mr-1" />
                            Auteur
                          </label>
                          <input
                            type="text"
                            placeholder="Nom de l'auteur"
                            value={advancedOptions.author || ''}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              author: e.target.value || undefined
                            }))}
                            className="input-ey focus:ring-ey-green/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-ey-black mb-2">
                            <Building className="w-4 h-4 inline mr-1" />
                            Département
                          </label>
                          <select
                            value={advancedOptions.department || ''}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              department: e.target.value as Department || undefined
                            }))}
                            className="select-ey focus:ring-ey-green/20"
                          >
                            <option value="">Tous les départements</option>
                            <option value="Assurance">Assurance</option>
                            <option value="Consulting">Consulting</option>
                            <option value="StrategyAndTransactions">Strategy & Transactions</option>
                            <option value="Tax">Tax</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-ey-black mb-2">
                            <Hash className="w-4 h-4 inline mr-1" />
                            Tags
                          </label>
                          <input
                            type="text"
                            placeholder="innovation, client, digital"
                            value={advancedOptions.tags?.join(', ') || ''}
                            onChange={(e) => {
                              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                              setAdvancedOptions(prev => ({
                                ...prev,
                                tags: tags.length > 0 ? tags : undefined
                              }));
                            }}
                            className="input-ey focus:ring-ey-green/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-ey-black mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date de début
                          </label>
                          <input
                            type="date"
                            value={advancedOptions.dateFrom ? advancedOptions.dateFrom.toISOString().split('T')[0] : ''}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              dateFrom: e.target.value ? new Date(e.target.value) : undefined
                            }))}
                            className="input-ey focus:ring-ey-green/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-ey-black mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date de fin
                          </label>
                          <input
                            type="date"
                            value={advancedOptions.dateTo ? advancedOptions.dateTo.toISOString().split('T')[0] : ''}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              dateTo: e.target.value ? new Date(e.target.value) : undefined
                            }))}
                            className="input-ey focus:ring-ey-green/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-ey-black mb-2">
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            Tri par
                          </label>
                          <select
                            value={advancedOptions.sortBy || 'recent'}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              sortBy: e.target.value as 'recent' | 'popular' | 'relevance'
                            }))}
                            className="select-ey focus:ring-ey-green/20"
                          >
                            <option value="recent">Plus récent</option>
                            <option value="popular">Plus populaire</option>
                            <option value="relevance">Plus pertinent</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={advancedOptions.hasImages || false}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              hasImages: e.target.checked ? true : undefined
                            }))}
                            className="rounded border-ey-gray-300 text-ey-accent-blue focus:ring-ey-accent-blue"
                          />
                          <Image className="w-4 h-4 text-ey-gray-600 group-hover:text-ey-accent-blue" />
                          <span className="text-sm text-ey-gray-700 group-hover:text-ey-accent-blue">Avec images</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={advancedOptions.hasFiles || false}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              hasFiles: e.target.checked ? true : undefined
                            }))}
                            className="rounded border-ey-gray-300 text-ey-accent-blue focus:ring-ey-accent-blue"
                          />
                          <FileText className="w-4 h-4 text-ey-gray-600 group-hover:text-ey-accent-blue" />
                          <span className="text-sm text-ey-gray-700 group-hover:text-ey-accent-blue">Avec fichiers</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleAdvancedSearch}
                            disabled={searchLoading}
                            className="btn-ey-primary flex items-center gap-2 bg-gradient-to-r from-ey-accent-blue to-ey-green hover:from-ey-accent-blue-dark hover:to-ey-green-dark"
                          >
                            {searchLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                            Lancer la recherche
                          </button>
                          
                          <button
                            onClick={() => {
                              setAdvancedOptions({
                                page: 1,
                                limit: 10,
                                sortBy: 'recent'
                              });
                            }}
                            className="btn-ey-outline text-sm hover:bg-ey-red hover:text-ey-white"
                          >
                            <SearchX className="w-4 h-4 mr-1" />
                            Effacer
                          </button>
                        </div>

                        <button
                          onClick={() => setShowAdvancedSearch(false)}
                          className="text-ey-gray-500 hover:text-ey-gray-700 p-2 rounded-full hover:bg-ey-gray-100 transition-colors"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CORRECTION MAJEURE : Filtres rapides avec myDepartment */}
              {searchMode === 'feed' && (
                <>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={() => applyFilters({ sortBy: 'recent' })}
                      className={`btn-filter ${feedQuery.sortBy === 'recent' ? 'active' : ''}`}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Récent
                    </button>
                    <button
                      onClick={() => applyFilters({ sortBy: 'popular' })}
                      className={`btn-filter ${feedQuery.sortBy === 'popular' ? 'active' : ''}`}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Populaire
                    </button>
                    <button
                      onClick={() => applyFilters({ followingOnly: !feedQuery.followingOnly })}
                      className={`btn-filter ${feedQuery.followingOnly ? 'active' : ''}`}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Mes abonnements
                    </button>
                    {/* BOUTON CORRIGÉ */}
                    <button
                      onClick={() => applyFilters({ myDepartment: !feedQuery.myDepartment })}
                      className={`btn-filter ${feedQuery.myDepartment ? 'active' : ''}`}
                    >
                      <Building className="w-4 h-4 mr-1" />
                      Mon département ({user?.department})
                    </button>

                    {(feedQuery.followingOnly || feedQuery.myDepartment || feedQuery.department) && (
                      <button
                        onClick={resetFilters}
                        className="btn-ey-outline text-ey-red hover:bg-ey-red hover:text-ey-white text-sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Résultats avec highlighting */}
            <div className="space-y-6">
              {searchLoading ? (
                <div className="card-ey p-12 text-center">
                  <div className="relative">
                    <RefreshCw className="w-12 h-12 animate-spin text-ey-accent-blue mx-auto mb-4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-ey-yellow/20 to-ey-green/20 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-bold text-ey-black mb-2">Recherche en cours...</h3>
                  <p className="text-ey-gray-600">
                    Nous parcourons les publications pour vous
                  </p>
                </div>
              ) : currentPosts.length === 0 ? (
                <div className="card-ey p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-ey-yellow/20 to-ey-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {searchMode !== 'feed' ? (
                      <SearchX className="w-10 h-10 text-ey-yellow" />
                    ) : (
                      <MessageSquare className="w-10 h-10 text-ey-yellow" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-ey-black mb-2">
                    {searchMode !== 'feed' ? 'Aucun résultat trouvé' : 'Aucune publication pour le moment'}
                  </h3>
                  <p className="text-ey-gray-600 mb-6">
                    {searchMode !== 'feed' 
                      ? 'Essayez avec des mots-clés différents ou utilisez la recherche avancée.'
                      : 'Soyez le premier à partager quelque chose d\'intéressant !'
                    }
                  </p>
                  {searchMode !== 'feed' ? (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setShowAdvancedSearch(true)}
                        className="btn-ey-outline"
                      >
                        <Sliders className="w-5 h-5 mr-2" />
                        Recherche avancée
                      </button>
                      <button
                        onClick={resetFilters}
                        className="btn-ey-primary"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Retour au feed
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-ey-primary"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Créer une publication
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {currentPosts.map((post, index) => (
                    <motion.div
                      key={`${searchMode}-${post.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
       <PostCard
                        post={post}
                        onReaction={handleReaction}
                        onComment={handleComment}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}  
                        onEdit={handleEditPost}
                        onDelete={() => handleDeletePost(post)}
                        onShare={handleSharePost}
                        currentUser={user}  
                        highlightTerm={searchMode === 'simple' ? searchInput : undefined}
                      />
                    </motion.div>
                  ))}
                  
                  {/* Bouton charger plus */}
                  {showLoadMore && (
                    <div className="text-center pt-6">
                      <button
                        onClick={loadMorePosts}
                        disabled={loadingMore}
                        className="btn-ey-outline flex items-center gap-2 mx-auto hover:bg-gradient-to-r hover:from-ey-yellow hover:to-ey-green hover:text-ey-white"
                      >
                        {loadingMore ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Chargement...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Voir plus de publications
                            {searchResults && (
                              <span className="text-sm text-ey-gray-500">
                                ({searchResults.page}/{searchResults.totalPages})
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar droite - Activités et statistiques */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Mes statistiques */}
            <div className="card-ey p-6">
              <h3 className="text-lg font-bold text-ey-black mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-ey-green" />
                Mes statistiques
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-ey-gray-700">Publications</span>
                  <span className="font-bold text-ey-black">
                    {stats.myPosts}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-ey-gray-700">Abonnements</span>
                  <span className="font-bold text-ey-accent-blue">
                    {stats.following}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-ey-gray-700">Abonnés</span>
                  <span className="font-bold text-ey-green">
                    {stats.followers}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ey-gray-700">Favoris</span>
                  <span className="font-bold text-ey-yellow">
                    {stats.bookmarks}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-ey-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-ey-purple to-ey-accent-blue bg-clip-text text-transparent">85%</div>
                    <div className="text-ey-gray-600 text-sm">Niveau d'engagement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques de recherche */}
            {searchResults && (
              <div className="card-ey p-6">
                <h3 className="text-lg font-bold text-ey-black mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-ey-accent-blue" />
                  Résultats de recherche
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ey-gray-700">Total trouvé</span>
                    <span className="font-bold text-ey-accent-blue">
                      {searchResults.total}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-ey-gray-700">Page actuelle</span>
                    <span className="font-bold text-ey-black">
                      {searchResults.page}/{searchResults.totalPages}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-ey-gray-700">Par page</span>
                    <span className="font-bold text-ey-black">
                      {searchResults.limit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="card-ey p-6">
              <h3 className="text-lg font-bold text-ey-black mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-ey-gray-600" />
                Actions rapides
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full btn-ey-outline text-left flex items-center gap-2 hover:bg-gradient-to-r hover:from-ey-yellow/10 hover:to-ey-green/10"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle publication
                </button>
                
                <button
                  onClick={() => setShowAdvancedSearch(true)}
                  className="w-full btn-ey-outline text-left flex items-center gap-2 hover:bg-gradient-to-r hover:from-ey-yellow/10 hover:to-ey-green/10"
                >
                  <Sliders className="w-4 h-4" />
                  Recherche avancée
                </button>
                
                <button
                  onClick={() => applyFilters({ followingOnly: true })}
                  className="w-full btn-ey-outline text-left flex items-center gap-2 hover:bg-gradient-to-r hover:from-ey-yellow/10 hover:to-ey-green/10"
                >
                  <Users className="w-4 h-4" />
                  Mes abonnements
                </button>

                <button
                  onClick={handleShowBookmarks}
                  className="w-full btn-ey-outline text-left flex items-center gap-2 hover:bg-gradient-to-r hover:from-ey-yellow/10 hover:to-ey-green/10"
                >
                  <BookOpen className="w-4 h-4" />
                  Mes favoris ({stats.bookmarks})
                </button>

                {searchMode !== 'feed' && (
                  <button
                    onClick={resetFilters}
                    className="w-full btn-ey-primary text-left flex items-center gap-2 bg-gradient-to-r from-ey-accent-blue to-ey-green"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Retour au feed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - inchangés */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
        currentUser={user}
      />

      {selectedPost && (
        <UpdatePostModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          onPostUpdated={handlePostUpdated}
          currentUser={user}
        />
      )}

      {selectedPost && (
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          onPostShared={handlePostShared}
          currentUser={user}
        />
      )}

      {postToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPostToDelete(null);
          }}
          post={postToDelete}
          onDeleted={handlePostDeleted}
          type="post"
        />
      )}

      {selectedPost && (
        <ReactionsModal
          isOpen={showReactionsModal}
          onClose={() => {
            setShowReactionsModal(false);
            setSelectedPost(null);
            setPostReactions([]);
          }}
          reactions={postReactions}
          title={`Réactions sur la publication de ${selectedPost.authorName}`}
          targetType="post"
        />
      )}

      {/* Modal des bookmarks */}
      <BookmarksModal
        isOpen={showBookmarksModal}
        onClose={() => setShowBookmarksModal(false)}
        posts={bookmarkedPosts}
        loading={loadingBookmarks}
        onRefresh={loadBookmarkedPosts}
      />

      {/* Loading overlay avec design EY */}
      {(refreshing || searchLoading) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 right-4 bg-gradient-to-r from-ey-white to-ey-light-gray/95 backdrop-blur-sm rounded-ey-lg p-4 shadow-ey-xl z-50 border border-ey-yellow/20"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-ey-accent-blue" />
            <span className="text-ey-black font-medium">
              {searchLoading ? 'Recherche en cours...' : 'Actualisation...'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Modal des bookmarks (inchangée)
interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: PostDto[];
  loading: boolean;
  onRefresh: () => void;
}

function BookmarksModal({ isOpen, onClose, posts, loading, onRefresh }: BookmarksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-ey-white rounded-ey-lg shadow-ey-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-ey-gray-200">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-ey-yellow" />
            <h2 className="text-xl font-bold text-ey-black">Mes publications favorites</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn-ey-outline btn-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors"
            >
              <X className="w-5 h-5 text-ey-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-ey-accent-blue mx-auto mb-3" />
              <p className="text-ey-gray-600">Chargement de vos favoris...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-ey-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ey-black mb-2">Aucun favori pour le moment</h3>
              <p className="text-ey-gray-600">
                Sauvegardez des publications pour les retrouver facilement ici.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-ey-gray-50 rounded-ey-lg p-4 hover:bg-ey-gray-100 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-ey-yellow to-ey-green rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-ey-white font-bold text-sm">
                        {post.authorName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-ey-black">{post.authorName}</span>
                        <span className="text-sm text-ey-gray-500">•</span>
                        <span className="text-sm text-ey-gray-500">{post.authorDepartment}</span>
                      </div>
                      <p className="text-ey-gray-700 text-sm line-clamp-3">{post.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-ey-gray-500">
                    <div className="flex items-center gap-4">
                      <span>{post.likesCount} réactions</span>
                      <span>{post.commentsCount} commentaires</span>
                    </div>
                    <Link
                      href={`/EyEngage/social/posts/${post.id}`}
                      className="text-ey-accent-blue hover:text-ey-accent-blue-dark font-medium hover:underline"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}