import { api } from '@/lib/Api-Client-Nest';
import { CreateFollowDto, FollowDto, FollowCounts, MutualConnectionDto } from '@/types/types';

export class FollowService {
  private readonly baseUrl = '/api/social/follows';

  /**
   * Suivre un utilisateur
   */
  async followUser(dto: CreateFollowDto): Promise<FollowDto> {
    console.log('FollowService.followUser - début:', dto);
    
    try {
      const result = await api.post(this.baseUrl, dto);
      console.log('FollowService.followUser - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.followUser - erreur:', error);
      throw error;
    }
  }

  /**
   * Ne plus suivre un utilisateur
   */
  async unfollowUser(followedId: string): Promise<{ success: boolean; message: string }> {
    console.log('FollowService.unfollowUser - début:', followedId);
    
    try {
      const result = await api.delete(`${this.baseUrl}/${followedId}`);
      console.log('FollowService.unfollowUser - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.unfollowUser - erreur:', error);
      throw error;
    }
  }

  /**
   * Récupérer les followers d'un utilisateur
   */
  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    console.log('FollowService.getFollowers - début:', { userId, page, limit });
    
    try {
      const result = await api.get<{
        followers: FollowDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`${this.baseUrl}/followers/${userId}?page=${page}&limit=${limit}`);
      
      console.log('FollowService.getFollowers - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.getFollowers - erreur:', error);
      throw error;
    }
  }

  /**
   * Récupérer les utilisateurs suivis
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    console.log('FollowService.getFollowing - début:', { userId, page, limit });
    
    try {
      const result = await api.get<{
        following: FollowDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`${this.baseUrl}/following/${userId}?page=${page}&limit=${limit}`);
      
      console.log('FollowService.getFollowing - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.getFollowing - erreur:', error);
      throw error;
    }
  }

  /**
   * Récupérer les compteurs de follows
   */
  async getFollowCounts(userId: string): Promise<FollowCounts> {
    console.log('FollowService.getFollowCounts - début:', userId);
    
    try {
      const result = await api.get<FollowCounts>(`${this.baseUrl}/counts/${userId}`);
      console.log('FollowService.getFollowCounts - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.getFollowCounts - erreur:', error);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur suit un autre
   */
  async isFollowing(followedId: string): Promise<{ isFollowing: boolean }> {
    console.log('FollowService.isFollowing - début:', followedId);
    
    try {
      const result = await api.get<{ isFollowing: boolean }>(`${this.baseUrl}/is-following/${followedId}`);
      console.log('FollowService.isFollowing - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.isFollowing - erreur:', error);
      throw error;
    }
  }

  /**
   * Récupérer les connexions mutuelles
   */
  async getMutualConnections(userId: string): Promise<MutualConnectionDto[]> {
    console.log('FollowService.getMutualConnections - début:', userId);
    
    try {
      const result = await api.get<MutualConnectionDto[]>(`${this.baseUrl}/mutual/${userId}`);
      console.log('FollowService.getMutualConnections - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.getMutualConnections - erreur:', error);
      throw error;
    }
  }

  /**
   * Récupérer les suggestions de follow
   */
  async getFollowSuggestions(limit: number = 10): Promise<FollowDto[]> {
    console.log('FollowService.getFollowSuggestions - début:', limit);
    
    try {
      const result = await api.get<FollowDto[]>(`${this.baseUrl}/suggestions?limit=${limit}`);
      console.log('FollowService.getFollowSuggestions - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.getFollowSuggestions - erreur:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  async getUserById(userId: string) {
    console.log('FollowService.getUserById - début:', userId);
    
    try {
      const result = await api.get(`${this.baseUrl}/user/${userId}`);
      console.log('FollowService.getUserById - succès:', result);
      return result;
    } catch (error) {
      console.error('FollowService.getUserById - erreur:', error);
      throw error;
    }
  }
}

export const followService = new FollowService();