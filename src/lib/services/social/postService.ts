import { api } from '@/lib/Api-Client-Nest';
import {
  PostDto,
  CreatePostDto,
  UpdatePostDto,
  SharePostDto,
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  ReactionDto,
  CreateReactionDto,
  FeedQueryDto,
  FeedResponseDto,
  SearchQueryDto,
  SearchResultDto,
  TrendingDto,
  FlagContentDto,
  Department,
  ContentType,
  ReactionType
} from "@/types/types";

export class PostService {
  private readonly baseUrl = '/api/social/posts';

  // RECHERCHE SIMPLE PAR CONTENU AVEC HIGHLIGHTING
  async searchPosts(query: SearchQueryDto): Promise<SearchResultDto & { 
    searchTerm: string;
    highlightedPosts: (PostDto & { highlightedContent?: string; highlightedAuthor?: string })[]
  }> {
    const params = new URLSearchParams();
    params.append('query', query.query);
    
    if (query.page !== undefined) {
      params.append('page', query.page.toString());
    }
    
    if (query.limit !== undefined) {
      params.append('limit', query.limit.toString());
    }
    
    const result: SearchResultDto = await api.get(`${this.baseUrl}/search?${params.toString()}`);
    
    // Ajouter le highlighting côté frontend
    const highlightedPosts = result.posts.map(post => ({
      ...post,
      highlightedContent: this.highlightText(post.content, query.query),
      highlightedAuthor: this.highlightText(post.authorName, query.query)
    }));

    return {
      ...result,
      searchTerm: query.query,
      highlightedPosts
    };
  }

  // NOUVELLE MÉTHODE : Recherche de suggestions en temps réel
  async getSearchSuggestions(query: string, limit: number = 5): Promise<{
    suggestions: Array<{
      type: 'content' | 'author' | 'tag';
      text: string;
      count: number;
      highlighted: string;
    }>;
  }> {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    try {
      // Recherche limitée pour les suggestions
      const searchResult = await this.advancedSearch({
        query,
        page: 1,
        limit: limit * 2 // Plus de résultats pour extraire les suggestions
      });

      const suggestions: Array<{
        type: 'content' | 'author' | 'tag';
        text: string;
        count: number;
        highlighted: string;
      }> = [];

      // Extraire les suggestions d'auteurs
      const authors = new Map<string, number>();
      const tags = new Map<string, number>();

      searchResult.posts.forEach(post => {
        // Suggestions d'auteurs
        if (post.authorName.toLowerCase().includes(query.toLowerCase())) {
          authors.set(post.authorName, (authors.get(post.authorName) || 0) + 1);
        }

        // Suggestions de tags
        if (post.tags) {
          post.tags.forEach(tag => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              tags.set(tag, (tags.get(tag) || 0) + 1);
            }
          });
        }
      });

      // Ajouter les suggestions d'auteurs
      Array.from(authors.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .forEach(([author, count]) => {
          suggestions.push({
            type: 'author',
            text: author,
            count,
            highlighted: this.highlightText(author, query)
          });
        });

      // Ajouter les suggestions de tags
      Array.from(tags.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .forEach(([tag, count]) => {
          suggestions.push({
            type: 'tag',
            text: tag,
            count,
            highlighted: this.highlightText(tag, query)
          });
        });

      // Ajouter une suggestion de contenu générale
      if (searchResult.total > 0) {
        suggestions.unshift({
          type: 'content',
          text: `Rechercher "${query}" dans le contenu`,
          count: searchResult.total,
          highlighted: this.highlightText(`Rechercher "${query}" dans le contenu`, query)
        });
      }

      return { suggestions: suggestions.slice(0, limit) };
    } catch (error) {
      console.error('Erreur suggestions:', error);
      return { suggestions: [] };
    }
  }

  // MÉTHODE D'HIGHLIGHTING
  private highlightText(text: string, searchTerm: string): string {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark class="bg-ey-yellow/30 px-1 rounded font-medium text-ey-black">$1</mark>');
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // getFeed mis à jour pour supporter myDepartment
  async getFeed(query: FeedQueryDto): Promise<FeedResponseDto> {
    const params = new URLSearchParams();
    
    if (query.page !== undefined) {
      params.append('page', query.page.toString());
    }
    
    if (query.limit !== undefined) {
      params.append('limit', query.limit.toString());
    }
    
    if (query.sortBy) {
      params.append('sortBy', query.sortBy);
    }
    
    if (query.followingOnly !== undefined) {
      params.append('followingOnly', query.followingOnly.toString());
    }
    
    // NOUVEAU: Support de myDepartment
    if (query.myDepartment !== undefined) {
      params.append('myDepartment', query.myDepartment.toString());
    }
    
    if (query.departmentOnly !== undefined) {
      params.append('departmentOnly', query.departmentOnly.toString());
    }
    
    if (query.department) {
      params.append('department', query.department);
    }
    
    if (query.search) {
      params.append('search', query.search);
    }
    
    if (query.tags && query.tags.length > 0) {
      query.tags.forEach(tag => params.append('tags', tag));
    }
    
    return api.get(`${this.baseUrl}/feed?${params.toString()}`);
  }

  // Méthodes existantes conservées mais améliorées...
  async advancedSearch(options: {
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
  }): Promise<SearchResultDto> {
    const params = new URLSearchParams();
    
    if (options.query) params.append('query', options.query);
    if (options.author) params.append('author', options.author);
    if (options.department) params.append('department', options.department);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.hasImages !== undefined) params.append('hasImages', options.hasImages.toString());
    if (options.hasFiles !== undefined) params.append('hasFiles', options.hasFiles.toString());
    if (options.dateFrom) params.append('dateFrom', options.dateFrom.toISOString());
    if (options.dateTo) params.append('dateTo', options.dateTo.toISOString());
    
    if (options.tags && options.tags.length > 0) {
      options.tags.forEach(tag => params.append('tags[]', tag));
    }
    
    return api.get(`${this.baseUrl}/advanced-search?${params.toString()}`);
  }

  // Toutes les autres méthodes restent identiques...
  async createPost(dto: CreatePostDto, files?: {
    images?: File[];
    files?: File[];
  }): Promise<PostDto> {
    
    // Si pas de fichiers, utiliser JSON normal
    if ((!files?.images || files.images.length === 0) && (!files?.files || files.files.length === 0)) {
      return api.post(this.baseUrl, dto);
    }

    // Si des fichiers, utiliser FormData avec les champs individuels
    const formData = new FormData();
    
    // Ajouter chaque champ individuellement
    formData.append('content', dto.content);
    if (typeof dto.isPublic !== 'undefined') {
      formData.append('isPublic', dto.isPublic.toString());
    }
      if (typeof dto.departmentOnly !== 'undefined') {
      formData.append('departmentOnly', dto.departmentOnly.toString());
    }
      if (typeof dto.allowComments !== 'undefined') {
      formData.append('allowComments', dto.allowComments.toString());
    }
      if (typeof dto.allowShares !== 'undefined') {
      formData.append('allowShares', dto.allowShares.toString());
    }
    
    if (dto.originalPostId) {
      formData.append('originalPostId', dto.originalPostId);
    }
    
    if (dto.tags && dto.tags.length > 0) {
      dto.tags.forEach(tag => formData.append('tags', tag));
    }
    
    if (dto.mentions && dto.mentions.length > 0) {
      dto.mentions.forEach(mention => formData.append('mentions', mention));
    }

    // Ajouter les fichiers
    if (files?.images && files.images.length > 0) {
      files.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }
    
    if (files?.files && files.files.length > 0) {
      files.files.forEach(file => {
        if (file instanceof File) {
          formData.append('files', file);
        }
      });
    }

    return api.post(this.baseUrl, formData);
  }

  // Autres méthodes conservées...
  async getTrending(): Promise<TrendingDto> {
    return api.get(`${this.baseUrl}/trending`);
  }

  async getPostById(postId: string): Promise<PostDto> {
    return api.get(`${this.baseUrl}/${postId}`);
  }

  async updatePost(postId: string, dto: UpdatePostDto): Promise<PostDto> {
    return api.put(`${this.baseUrl}/${postId}`, dto);
  }

  async deletePost(postId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`${this.baseUrl}/${postId}`);
  }

  async sharePost(dto: SharePostDto): Promise<PostDto> {
    return api.post(`${this.baseUrl}/share`, dto);
  }

  async getPostComments(postId: string, page: number = 1, limit: number = 20) {
    return api.get(`${this.baseUrl}/${postId}/comments?page=${page}&limit=${limit}`);
  }

  async createComment(dto: CreateCommentDto, attachments?: File[]): Promise<CommentDto> {
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      
      formData.append('postId', dto.postId);
      formData.append('content', dto.content);
      
      if (dto.parentCommentId) {
        formData.append('parentCommentId', dto.parentCommentId);
      }
      
      if (dto.mentions && dto.mentions.length > 0) {
        dto.mentions.forEach(mention => formData.append('mentions[]', mention));
      }
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      return api.post(`${this.baseUrl}/comments`, formData);
    }
    
    return api.post(`${this.baseUrl}/comments`, dto);
  }

  async updateComment(commentId: string, dto: UpdateCommentDto): Promise<CommentDto> {
    return api.put(`${this.baseUrl}/comments/${commentId}`, dto);
  }

  async deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`${this.baseUrl}/comments/${commentId}`);
  }

  async getCommentReplies(commentId: string, page: number = 1, limit: number = 10) {
    return api.get(`${this.baseUrl}/comments/${commentId}/replies?page=${page}&limit=${limit}`);
  }

  async toggleReaction(dto: CreateReactionDto): Promise<{
    action: 'added' | 'removed' | 'updated';
    reaction?: ReactionDto;
  }> {
    return api.post(`${this.baseUrl}/reactions`, dto);
  }

  async getPostReactions(postId: string, reactionType?: ReactionType): Promise<ReactionDto[]> {
    const params = reactionType ? `?type=${reactionType}` : '';
    return api.get(`${this.baseUrl}/${postId}/reactions${params}`);
  }

  async getCommentReactions(commentId: string, reactionType?: ReactionType): Promise<ReactionDto[]> {
    const params = reactionType ? `?type=${reactionType}` : '';
    return api.get(`${this.baseUrl}/comments/${commentId}/reactions${params}`);
  }

  async bookmarkPost(postId: string): Promise<{ success: boolean; message: string }> {
    return api.post(`${this.baseUrl}/${postId}/bookmark`);
  }

  async unbookmarkPost(postId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`${this.baseUrl}/${postId}/bookmark`);
  }

  async getBookmarkedPosts(page: number = 1, limit: number = 10): Promise<{
    posts: PostDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return api.get(`${this.baseUrl}/bookmarks?page=${page}&limit=${limit}`);
  }

  async isPostBookmarked(postId: string): Promise<{ isBookmarked: boolean }> {
    return api.get(`${this.baseUrl}/${postId}/bookmark/status`);
  }

async flagContent(dto: FlagContentDto): Promise<FlagResponseDto> {
  try {
    const response = await api.post(`${this.baseUrl}/flag`, dto);
    return response;
  } catch (error: any) {
    console.error('Erreur signalement:', error);
    
    // Gestion des erreurs spécifiques
    if (error?.response?.status === 400) {
      const message = error.response.data?.message || 'Données de signalement invalides';
      throw new Error(message);
    } else if (error?.response?.status === 403) {
      throw new Error('Vous ne pouvez pas signaler votre propre contenu');
    } else if (error?.response?.status === 404) {
      throw new Error('Contenu non trouvé');
    } else if (error?.response?.status === 409) {
      throw new Error('Vous avez déjà signalé ce contenu');
    }
    
    throw new Error('Erreur lors du signalement. Veuillez réessayer.');
  }
}

  async getFlaggedContent(page: number = 1, limit: number = 20) {
    return api.get(`${this.baseUrl}/flagged?page=${page}&limit=${limit}`);
  }
}

export const postService = new PostService();