'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { chatService } from '@/lib/services/chatService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { 
  ConversationDto, 
  MessageDto, 
  CreateConversationDto, 
  SendMessageDto,
  ChatQueryDto,
  MessageQueryDto,
  ParticipantDto,
  ConversationType
} from '@/types/types';

interface ChatState {
  conversations: ConversationDto[];
  currentConversation: ConversationDto | null;
  messages: MessageDto[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  typingUsers: { userId: string; userName: string }[];
  onlineUsers: Set<string>;
}

interface ChatContextType extends ChatState {
  // Conversations
  fetchConversations: (query?: ChatQueryDto) => Promise<void>;
  createConversation: (data: CreateConversationDto) => Promise<ConversationDto>;
  selectConversation: (conversation: ConversationDto) => void;
  updateConversation: (conversationId: string, updates: Partial<ConversationDto>) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  
  // Messages
  fetchMessages: (conversationId: string, query?: MessageQueryDto) => Promise<void>;
  sendMessage: (data: SendMessageDto, files?: File[]) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (conversationId: string, messageId?: string) => Promise<void>;
  
  // Participants
  addParticipant: (conversationId: string, userId: string, role?: string) => Promise<void>;
  removeParticipant: (conversationId: string, participantId: string) => Promise<void>;
  updateParticipant: (conversationId: string, participantId: string, updates: any) => Promise<void>;
  
  // Reactions
  toggleMessageReaction: (messageId: string, type: string) => Promise<void>;
  
  // Real-time
  sendTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  
  // Utils
  clearError: () => void;
  refreshConversations: () => Promise<void>;
  searchMessages: (query: string, conversationId?: string) => Promise<any>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    isLoadingMessages: false,
    error: null,
    typingUsers: [],
    onlineUsers: new Set()
  });

  // Fetch conversations
  const fetchConversations = useCallback(async (query?: ChatQueryDto) => {
    if (!isAuthenticated) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await chatService.getUserConversations(query);
      setState(prev => ({
        ...prev,
        conversations: response.conversations || [],
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erreur lors du chargement des conversations',
        isLoading: false
      }));
    }
  }, [isAuthenticated]);

  // Create conversation
  const createConversation = useCallback(async (data: CreateConversationDto): Promise<ConversationDto> => {
    try {
      const conversation = await chatService.createConversation(data);
      
      setState(prev => ({
        ...prev,
        conversations: [conversation, ...prev.conversations]
      }));
      
      return conversation;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback((conversation: ConversationDto) => {
    setState(prev => ({
      ...prev,
      currentConversation: conversation,
      messages: []
    }));
    
    // Join conversation room
    if (socket) {
      socket.emit('join:conversation', { conversationId: conversation.id });
    }
    
    // Fetch messages
    fetchMessages(conversation.id);
  }, [socket]);

  // Fetch messages
  const fetchMessages = useCallback(async (conversationId: string, query?: MessageQueryDto) => {
    setState(prev => ({ ...prev, isLoadingMessages: true, error: null }));
    
    try {
      const response = await chatService.getConversationMessages(conversationId, query);
      
      setState(prev => ({
        ...prev,
        messages: query?.before ? [...prev.messages, ...response.messages] : response.messages,
        isLoadingMessages: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erreur lors du chargement des messages',
        isLoadingMessages: false
      }));
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (data: SendMessageDto, files?: File[]) => {
    try {
      const message = await chatService.sendMessage(data, files);
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
        conversations: prev.conversations.map(conv =>
          conv.id === data.conversationId
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                lastMessageById: message.senderId,
                lastMessageByName: message.senderName,
                messagesCount: conv.messagesCount + 1
              }
            : conv
        )
      }));
      
      // Emit to socket for real-time
      if (socket) {
        socket.emit('message:send', message);
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [socket]);

  // Update message
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const updatedMessage = await chatService.updateMessage(messageId, { content });
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? updatedMessage : msg
        )
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId)
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string, messageId?: string) => {
    try {
      if (messageId) {
        await chatService.markMessageAsRead(conversationId, messageId);
      } else {
        await chatService.markConversationAsRead(conversationId);
      }
      
      // Update conversation unread count
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Update conversation
  const updateConversation = useCallback(async (conversationId: string, updates: Partial<ConversationDto>) => {
    try {
      const updatedConversation = await chatService.updateConversation(conversationId, updates);
      
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId ? updatedConversation : conv
        ),
        currentConversation: prev.currentConversation?.id === conversationId
          ? updatedConversation
          : prev.currentConversation
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await chatService.deleteConversation(conversationId);
      
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(conv => conv.id !== conversationId),
        currentConversation: prev.currentConversation?.id === conversationId
          ? null
          : prev.currentConversation,
        messages: prev.currentConversation?.id === conversationId ? [] : prev.messages
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Add participant
  const addParticipant = useCallback(async (conversationId: string, userId: string, role?: string) => {
    try {
      await chatService.addParticipant(conversationId, { userId, role });
      
      // Refresh conversation details
      const conversation = await chatService.getConversationById(conversationId);
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId ? conversation : conv
        ),
        currentConversation: prev.currentConversation?.id === conversationId
          ? conversation
          : prev.currentConversation
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Remove participant
  const removeParticipant = useCallback(async (conversationId: string, participantId: string) => {
    try {
      await chatService.removeParticipant(conversationId, participantId);
      
      // Refresh conversation details
      const conversation = await chatService.getConversationById(conversationId);
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId ? conversation : conv
        ),
        currentConversation: prev.currentConversation?.id === conversationId
          ? conversation
          : prev.currentConversation
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Update participant
  const updateParticipant = useCallback(async (conversationId: string, participantId: string, updates: any) => {
    try {
      await chatService.updateParticipant(conversationId, participantId, updates);
      
      // Refresh conversation details
      const conversation = await chatService.getConversationById(conversationId);
      setState(prev => ({
        ...prev,
        currentConversation: prev.currentConversation?.id === conversationId
          ? conversation
          : prev.currentConversation
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Toggle message reaction
  const toggleMessageReaction = useCallback(async (messageId: string, type: string) => {
    try {
      await chatService.toggleMessageReaction({ messageId, type });
      
      // Update message reactions locally
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                reactionsCount: msg.reactionsCount + (msg.reactions?.some(r => r.userId === user?.id && r.type === type) ? -1 : 1),
                reactions: msg.reactions?.some(r => r.userId === user?.id && r.type === type)
                  ? msg.reactions.filter(r => !(r.userId === user?.id && r.type === type))
                  : [...(msg.reactions || []), { userId: user?.id!, userName: user?.fullName!, type, messageId, id: Date.now().toString(), createdAt: new Date() }]
              }
            : msg
        )
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [user]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('typing:start', { conversationId, userId: user?.id, userName: user?.fullName });
    }
  }, [socket, user]);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('typing:stop', { conversationId, userId: user?.id });
    }
  }, [socket, user]);

  // Search messages
  const searchMessages = useCallback(async (query: string, conversationId?: string) => {
    try {
      return await chatService.searchMessages(query, conversationId);
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh conversations
  const refreshConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message: MessageDto) => {
      setState(prev => ({
        ...prev,
        messages: prev.currentConversation?.id === message.conversationId 
          ? [...prev.messages, message]
          : prev.messages,
        conversations: prev.conversations.map(conv =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                lastMessageById: message.senderId,
                lastMessageByName: message.senderName,
                messagesCount: conv.messagesCount + 1,
                unreadCount: prev.currentConversation?.id === message.conversationId ? 0 : (conv.unreadCount || 0) + 1
              }
            : conv
        )
      }));
    };

    const handleMessageUpdated = (message: MessageDto) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === message.id ? message : msg
        )
      }));
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== data.messageId)
      }));
    };

    const handleTypingStart = (data: { conversationId: string; userId: string; userName: string }) => {
      if (data.userId !== user.id) {
        setState(prev => ({
          ...prev,
          typingUsers: prev.typingUsers.some(u => u.userId === data.userId)
            ? prev.typingUsers
            : [...prev.typingUsers, { userId: data.userId, userName: data.userName }]
        }));
      }
    };

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      setState(prev => ({
        ...prev,
        typingUsers: prev.typingUsers.filter(u => u.userId !== data.userId)
      }));
    };

    const handleUserOnline = (data: { userId: string }) => {
      setState(prev => ({
        ...prev,
        onlineUsers: new Set([...prev.onlineUsers, data.userId])
      }));
    };

    const handleUserOffline = (data: { userId: string }) => {
      setState(prev => {
        const newOnlineUsers = new Set(prev.onlineUsers);
        newOnlineUsers.delete(data.userId);
        return {
          ...prev,
          onlineUsers: newOnlineUsers
        };
      });
    };

    // Subscribe to events
    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
    };
  }, [socket, user]);

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  return (
    <ChatContext.Provider value={{
      ...state,
      fetchConversations,
      createConversation,
      selectConversation,
      updateConversation,
      deleteConversation,
      fetchMessages,
      sendMessage,
      updateMessage,
      deleteMessage,
      markAsRead,
      addParticipant,
      removeParticipant,
      updateParticipant,
      toggleMessageReaction,
      sendTyping,
      stopTyping,
      searchMessages,
      clearError,
      refreshConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};