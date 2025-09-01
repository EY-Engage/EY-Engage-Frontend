import { api } from '@/lib/Api-Client';

export class IntegrationService {
  private readonly baseUrl = '/api/integration';

  // Health Check
  async checkIntegrationHealth() {
    return api.get(`${this.baseUrl}/health-check`);
  }

  // Statistiques d'intégration
  async getIntegrationStats() {
    return api.get(`${this.baseUrl}/stats`);
  }

  // Synchronisation des données
  async syncEventData(eventId: string) {
    return api.get(`${this.baseUrl}/sync/event/${eventId}`);
  }

  async syncUserData(userId: string) {
    return api.get(`${this.baseUrl}/sync/user/${userId}`);
  }

  async syncJobData(jobId: string) {
    return api.get(`${this.baseUrl}/sync/job/${jobId}`);
  }
}

export const integrationService = new IntegrationService();