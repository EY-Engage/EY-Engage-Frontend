import { ContentSearchQueryDto, DashboardData, FlagStatsQueryDto, ModerationActionDto, UserSearchQueryDto } from "@/types/types";
import { api } from "../Api-Client-Nest";

export interface TimeRangeQuery {
  range?: 'today' | '7days' | '30days' | '90days';
  startDate?: string;
  endDate?: string;
  department?: string;
}

export interface FlaggedContentQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  department?: string;
  urgent?: boolean;
}

export interface QuickModerationAction {
  action: 'approve' | 'reject';
}

export class AdminService {
  private readonly baseUrl = '/api/admin';

  // ================== DASHBOARD & STATS ==================

  async getDashboardStats(query: TimeRangeQuery): Promise<any> {
    const params = new URLSearchParams();
    
    if (query.range) {
      const now = new Date();
      const ranges = {
        'today': () => ({ 
          startDate: now.toISOString().split('T')[0], 
          endDate: now.toISOString().split('T')[0] 
        }),
        '7days': () => ({ 
          startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        }),
        '30days': () => ({ 
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        }),
        '90days': () => ({ 
          startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        })
      };
      
      const dateRange = ranges[query.range]();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    }
    
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.department) params.append('department', query.department);
    
    return api.get(`${this.baseUrl}/dashboard/stats?${params}`);
  }

  async getDashboardSummary(): Promise<any> {
    return api.get(`${this.baseUrl}/dashboard/summary`);
  }

  async getQuickStats(): Promise<any> {
    return api.get(`${this.baseUrl}/dashboard/quick-stats`);
  }

  // ================== FLAGGED CONTENT ==================

  async getFlaggedContent(params: FlaggedContentQuery = {}) {
    const queryParams = new URLSearchParams();
    
    // Paramètres par défaut améliorés
    const defaultParams = {
      page: 1,
      limit: 20,
      ...params
    };

    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return api.get(`${this.baseUrl}/flagged-content?${queryParams}`);
  }

  async getFlaggedContentDetail(id: string) {
    return api.get(`${this.baseUrl}/flagged-content/${id}`);
  }

  // NOUVELLE MÉTHODE: Modération rapide
  async quickModerationAction(flagId: string, action: 'approve' | 'reject') {
    return api.post(`${this.baseUrl}/flagged-content/${flagId}/quick-action`, { action });
  }

  async assignFlagToModerator(flagId: string, moderatorId: string) {
    return api.post(`${this.baseUrl}/flagged-content/${flagId}/assign`, { moderatorId });
  }

  async bulkModerationAction(flagIds: string[], action: string) {
    return api.post(`${this.baseUrl}/flagged-content/bulk-action`, { flagIds, action });
  }

  // ================== MODERATION ACTIONS ==================

  async takeModerationAction(dto: ModerationActionDto) {
    return api.post(`${this.baseUrl}/moderation-action`, dto);
  }

  async getModerationHistory(params: {
    page?: number;
    limit?: number;
    moderatorId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return api.get(`${this.baseUrl}/moderation-history?${queryParams}`);
  }

  async getModerationTemplates() {
    return api.get(`${this.baseUrl}/moderation-templates`);
  }

  // ================== USER MANAGEMENT ==================

  async searchUsers(query: UserSearchQueryDto) {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return api.get(`${this.baseUrl}/users/search?${params}`);
  }

  async getUserDetail(userId: string) {
    return api.get(`${this.baseUrl}/users/${userId}`);
  }

  async updateUserStatus(userId: string, isActive: boolean, reason?: string) {
    return api.put(`${this.baseUrl}/users/${userId}/status`, { isActive, reason });
  }

  async sendUserWarning(userId: string, message: string, severity: 'low' | 'medium' | 'high') {
    return api.post(`${this.baseUrl}/users/${userId}/warning`, { message, severity });
  }

  async getUserWarnings(userId: string) {
    return api.get(`${this.baseUrl}/users/${userId}/warnings`);
  }

  async getUserActivity(userId: string, days: number = 30) {
    return api.get(`${this.baseUrl}/users/${userId}/activity?days=${days}`);
  }

  // ================== CONTENT SEARCH ==================

  async searchContent(query: ContentSearchQueryDto) {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return api.get(`${this.baseUrl}/content/search?${params}`);
  }

  async getFlaggedContentTrends() {
    return api.get(`${this.baseUrl}/content/flagged-trends`);
  }

  // ================== STATISTICS ==================

  async getDepartmentStats(query: TimeRangeQuery) {
    const params = new URLSearchParams();
    
    if (query.range) {
      const now = new Date();
      const ranges = {
        'today': () => ({ startDate: now.toISOString().split('T')[0] }),
        '7days': () => ({ startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        '30days': () => ({ startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        '90days': () => ({ startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })
      };
      
      const dateRange = ranges[query.range]();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    }
    
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.department) params.append('department', query.department);
    
    return api.get(`${this.baseUrl}/stats/department?${params}`);
  }

  async getModeratorStats(query: TimeRangeQuery) {
    const params = new URLSearchParams();
    
    if (query.range) {
      const now = new Date();
      const ranges = {
        'today': () => ({ startDate: now.toISOString().split('T')[0] }),
        '7days': () => ({ startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        '30days': () => ({ startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        '90days': () => ({ startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })
      };
      
      const dateRange = ranges[query.range]();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    }
    
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    
    return api.get(`${this.baseUrl}/stats/moderators?${params}`);
  }

  async getContentTypeStats() {
    return api.get(`${this.baseUrl}/stats/content-types`);
  }

  async getResolutionTimeStats() {
    return api.get(`${this.baseUrl}/stats/resolution-times`);
  }

  async exportStats(query: TimeRangeQuery, format: 'json' | 'csv' = 'json') {
    const params = new URLSearchParams();
    
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.department) params.append('department', query.department);
    params.append('format', format);
    
    return api.get(`${this.baseUrl}/stats/export?${params}`);
  }

  // ================== SETTINGS & CONFIGURATION ==================

  async getModerationRules() {
    return api.get(`${this.baseUrl}/settings/moderation-rules`);
  }

  async updateModerationRule(ruleId: string, enabled: boolean) {
    return api.put(`${this.baseUrl}/settings/moderation-rules/${ruleId}`, { enabled });
  }

  async getModerators() {
    return api.get(`${this.baseUrl}/moderators`);
  }

  // ================== REPORTING ==================

  async generateReport(reportType: 'monthly' | 'weekly' | 'custom', params: any = {}) {
    return api.post(`${this.baseUrl}/reports/generate`, { type: reportType, ...params });
  }

  async getReports() {
    return api.get(`${this.baseUrl}/reports`);
  }

  async downloadReport(reportId: string) {
    return api.get(`${this.baseUrl}/reports/${reportId}/download`);
  }

  // ================== AUDIT LOG ==================

  async getAuditLog(page: number = 1, limit: number = 50) {
    return api.get(`${this.baseUrl}/audit-log?page=${page}&limit=${limit}`);
  }

  // ================== NOTIFICATIONS ==================

  async getAdminNotifications() {
    return api.get(`${this.baseUrl}/notifications`);
  }

  async markNotificationAsRead(notificationId: string) {
    return api.put(`${this.baseUrl}/notifications/${notificationId}/read`);
  }

  // ================== UTILITIES ==================

  // Méthodes utilitaires pour le frontend
  formatTimeElapsed(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  }

  getPriorityColor(priorityScore: number): string {
    if (priorityScore >= 80) return 'text-red-600 bg-red-50';
    if (priorityScore >= 60) return 'text-orange-600 bg-orange-50';
    if (priorityScore >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  }

  getStatusColor(status: string): string {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'dismissed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getDepartmentColor(department: string): string {
    const colors = {
      'Assurance': 'bg-purple-100 text-purple-800',
      'Consulting': 'bg-blue-100 text-blue-800',
      'StrategyAndTransactions': 'bg-green-100 text-green-800',
      'Tax': 'bg-orange-100 text-orange-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  }

  // Cache simple pour optimiser les performances
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Gestion des erreurs améliorée
  async handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      console.error('Admin API Error:', error);
      
      // Traitement spécifique des erreurs d'administration
      if (error.response?.status === 403) {
        throw new Error('Permissions insuffisantes pour cette action');
      } else if (error.response?.status === 404) {
        throw new Error('Ressource non trouvée');
      } else if (error.response?.status >= 500) {
        throw new Error('Erreur serveur - Veuillez réessayer plus tard');
      }
      
      throw error;
    }
  }
}

export const adminService = new AdminService();