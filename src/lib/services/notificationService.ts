
import { 
  NotificationDto, 
  CreateNotificationDto, 
  BulkNotificationDto,
  NotificationPreferences,
  NotificationStats,
  SystemAnnouncementDto
} from "@/types/types";
import { api } from '../Api-Client-Nest';

export class NotificationService {
  private readonly baseUrl = '/api/notifications';

  // Récupérer les notifications de l'utilisateur
  async getMyNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
    
    return api.get<{
      notifications: NotificationDto[];
      total: number;
      unreadCount: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.baseUrl}?${queryParams.toString()}`);
  }

  // Compter les notifications non lues
  async getUnreadCount(): Promise<{ count: number }> {
    return api.get(`${this.baseUrl}/unread-count`);
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    return api.put(`${this.baseUrl}/${notificationId}/read`);
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<{ success: boolean }> {
    return api.put(`${this.baseUrl}/mark-all-read`);
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    return api.delete(`${this.baseUrl}/${notificationId}`);
  }

  // [ADMIN] Créer une notification
  async createNotification(dto: CreateNotificationDto): Promise<NotificationDto> {
    return api.post(this.baseUrl, dto);
  }

  // [ADMIN] Créer des notifications en masse
  async createBulkNotification(dto: BulkNotificationDto) {
    return api.post(`${this.baseUrl}/bulk`, dto);
  }

  // [ADMIN] Envoyer une annonce système
  async sendSystemAnnouncement(dto: SystemAnnouncementDto) {
    return api.post(`${this.baseUrl}/system-announcement`, dto);
  }

  // [ADMIN] Statistiques des notifications
  async getNotificationStats(department?: string): Promise<NotificationStats> {
    const url = department 
      ? `${this.baseUrl}/stats?department=${department}`
      : `${this.baseUrl}/stats`;
    return api.get(url);
  }

  // [ADMIN] Nettoyer les anciennes notifications
  async cleanupOldNotifications(daysOld?: number) {
    return api.post(`${this.baseUrl}/cleanup`, { daysOld });
  }

  // Obtenir les préférences de notification
  async getPreferences(): Promise<NotificationPreferences> {
    return api.get(`${this.baseUrl}/preferences`);
  }

  // Mettre à jour les préférences
  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    return api.put(`${this.baseUrl}/preferences`, preferences);
  }

  // Récupérer les notifications par type
  async getNotificationsByType(
    type: string,
    params?: { page?: number; limit?: number; department?: string }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.department) queryParams.append('department', params.department);
    
    return api.get(`${this.baseUrl}/by-type/${type}?${queryParams.toString()}`);
  }

  // WebSocket subscription pour les notifications temps réel
  subscribeToNotifications(userId: string, onNotification: (data: NotificationDto) => void) {
    // Implementation WebSocket à ajouter avec Socket.IO
    // Voir section WebSocket ci-dessous
  }
}

export const notificationService = new NotificationService();