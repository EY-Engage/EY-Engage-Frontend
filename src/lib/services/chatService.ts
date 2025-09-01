
import {
  ConversationDto,
  CreateConversationDto,
  UpdateConversationDto,
  MessageDto,
  SendMessageDto,
  UpdateMessageDto,
  ParticipantDto,
  AddParticipantDto,
  UpdateParticipantDto,
  MessageReactionDto,
  CreateMessageReactionDto,
  ChatQueryDto,
  MessageQueryDto,
  ChatAnalyticsDto
} from "@/types/types";
import { api } from '../Api-Client-Nest';

export class ChatService {
  private readonly baseUrl = '/api/chat';

  // === CONVERSATIONS ===
  
  async createConversation(dto: CreateConversationDto): Promise<ConversationDto> {
    return api.post(`${this.baseUrl}/conversations`, dto);
  }

  async getUserConversations(query?: ChatQueryDto) {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`${this.baseUrl}/conversations?${params.toString()}`);
  }

  async getConversationById(conversationId: string): Promise<ConversationDto> {
    return api.get(`${this.baseUrl}/conversations/${conversationId}`);
  }

  async updateConversation(conversationId: string, dto: UpdateConversationDto): Promise<ConversationDto> {
    return api.put(`${this.baseUrl}/conversations/${conversationId}`, dto);
  }

  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`${this.baseUrl}/conversations/${conversationId}`);
  }

  // === MESSAGES ===
  
  async getConversationMessages(conversationId: string, query?: MessageQueryDto) {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`${this.baseUrl}/conversations/${conversationId}/messages?${params.toString()}`);
  }

  async sendMessage(dto: SendMessageDto, attachments?: File[]): Promise<MessageDto> {
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      Object.keys(dto).forEach(key => {
        const value = dto[key as keyof SendMessageDto];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(`${key}[]`, item.toString()));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      return api.post(`${this.baseUrl}/messages`, formData);
    }
    
    return api.post(`${this.baseUrl}/messages`, dto);
  }

  async updateMessage(messageId: string, dto: UpdateMessageDto): Promise<MessageDto> {
    return api.put(`${this.baseUrl}/messages/${messageId}`, dto);
  }

  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`${this.baseUrl}/messages/${messageId}`);
  }

  // === PARTICIPANTS ===
  
  async addParticipant(conversationId: string, dto: AddParticipantDto): Promise<ParticipantDto> {
    return api.post(`${this.baseUrl}/conversations/${conversationId}/participants`, dto);
  }

  async removeParticipant(conversationId: string, participantId: string) {
    return api.delete(`${this.baseUrl}/conversations/${conversationId}/participants/${participantId}`);
  }

  async updateParticipant(conversationId: string, participantId: string, dto: UpdateParticipantDto) {
    return api.put(`${this.baseUrl}/conversations/${conversationId}/participants/${participantId}`, dto);
  }

  // === REACTIONS ===
  
  async toggleMessageReaction(dto: CreateMessageReactionDto) {
    return api.post(`${this.baseUrl}/messages/reactions`, dto);
  }

  // === STATUT DE LECTURE ===
  
  async markMessageAsRead(conversationId: string, messageId: string) {
    return api.post(`${this.baseUrl}/conversations/${conversationId}/messages/${messageId}/read`);
  }

  async markConversationAsRead(conversationId: string) {
    return api.post(`${this.baseUrl}/conversations/${conversationId}/read`);
  }

  // === RECHERCHE ===
  
  async searchMessages(query: string, conversationId?: string, type?: string, page: number = 1, limit: number = 20) {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });
    if (conversationId) params.append('conversationId', conversationId);
    if (type) params.append('type', type);
    
    return api.get(`${this.baseUrl}/search?${params.toString()}`);
  }

  // === ANALYTICS (ADMIN) ===
  
  async getChatAnalytics(department?: string): Promise<ChatAnalyticsDto> {
    const url = department 
      ? `${this.baseUrl}/analytics?department=${department}`
      : `${this.baseUrl}/analytics`;
    return api.get(url);
  }

  // === EXPORT (ADMIN) ===
  
  async exportConversation(conversationId: string) {
    return api.get(`${this.baseUrl}/conversations/${conversationId}/export`);
  }
}

export const chatService = new ChatService();