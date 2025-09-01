'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Users, 
  User, 
  Building, 
  Megaphone,
  MoreHorizontal,
  Pin,
  Circle
} from 'lucide-react';
import { ConversationDto, ConversationType } from '@/types/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface ConversationListProps {
  conversations: ConversationDto[];
  currentConversation: ConversationDto | null;
  onSelectConversation: (conversation: ConversationDto) => void;
  isLoading: boolean;
}

export default function ConversationList({
  conversations,
  currentConversation,
  onSelectConversation,
  isLoading
}: ConversationListProps) {

  const getConversationIcon = (type: ConversationType) => {
    switch (type) {
      case ConversationType.DIRECT:
        return <User className="h-4 w-4" />;
      case ConversationType.GROUP:
        return <Users className="h-4 w-4" />;
      case ConversationType.DEPARTMENT:
        return <Building className="h-4 w-4" />;
      case ConversationType.ANNOUNCEMENT:
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getConversationIconColor = (type: ConversationType) => {
    switch (type) {
      case ConversationType.DIRECT:
        return 'text-blue-500 bg-blue-100';
      case ConversationType.GROUP:
        return 'text-green-500 bg-green-100';
      case ConversationType.DEPARTMENT:
        return 'text-purple-500 bg-purple-100';
      case ConversationType.ANNOUNCEMENT:
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="sm" />
        <span className="ml-3 text-gray-500">Chargement...</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Aucune conversation</h3>
        <p className="text-sm text-gray-500">
          Créez votre première conversation pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`
            p-4 cursor-pointer transition-colors hover:bg-gray-50 group
            ${currentConversation?.id === conversation.id ? 'bg-yellow-50 border-r-2 border-yellow-400' : ''}
          `}
        >
          <div className="flex items-start gap-3">
            {/* Avatar/Icon */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
              ${conversation.avatar 
                ? 'bg-yellow-400' 
                : getConversationIconColor(conversation.type)
              }
            `}>
              {conversation.avatar ? (
                <img 
                  src={conversation.avatar} 
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : conversation.type === ConversationType.DIRECT ? (
                <span className="text-gray-900 font-semibold text-sm">
                  {conversation.name.substring(0, 2).toUpperCase()}
                </span>
              ) : (
                getConversationIcon(conversation.type)
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className={`
                    font-medium truncate
                    ${currentConversation?.id === conversation.id ? 'text-yellow-700' : 'text-gray-900'}
                  `}>
                    {conversation.name}
                  </h3>
                  {conversation.isPinned && (
                    <Pin className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </span>
                  )}
                  
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle options menu
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Last message preview */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {conversation.lastMessage ? (
                    <div className="flex items-center gap-2">
                      {conversation.lastMessageByName && conversation.type !== ConversationType.DIRECT && (
                        <span className="text-xs font-medium text-gray-600">
                          {conversation.lastMessageByName}:
                        </span>
                      )}
                      <p className={`
                        text-sm truncate
                        ${conversation.unreadCount && conversation.unreadCount > 0 
                          ? 'font-medium text-gray-900' 
                          : 'text-gray-600'
                        }
                      `}>
                        {truncateMessage(conversation.lastMessage)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Aucun message
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  {conversation.lastMessageAt && (
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                        addSuffix: false,
                        locale: fr
                      })}
                    </span>
                  )}
                  
                  {/* Online indicator for direct conversations */}
                  {conversation.type === ConversationType.DIRECT && (
                    <div className="relative">
                      <Circle className="h-3 w-3 text-green-500 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation metadata */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {conversation.participantsCount > 1 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {conversation.participantsCount}
                  </span>
                )}
                
                {conversation.messagesCount > 0 && (
                  <span>{conversation.messagesCount} messages</span>
                )}
                
                {conversation.type === ConversationType.DEPARTMENT && conversation.department && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {conversation.department}
                  </span>
                )}
                
                {conversation.isMuted && (
                  <span className="text-orange-500">🔇 Silencieux</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}