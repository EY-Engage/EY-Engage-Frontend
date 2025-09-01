'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Reply, 
  Copy,
  Download,
  Image as ImageIcon,
  Paperclip,
  Smile,
  ThumbsUp,
  Heart,
  Laugh
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { MessageDto, MessageType } from '@/types/types';
import MessageInput from './MessageInput';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface MessageWindowProps {
  conversationId: string;
}

export default function MessageWindow({ conversationId }: MessageWindowProps) {
  const { user } = useAuth();
  const {
    messages,
    isLoadingMessages,
    fetchMessages,
    deleteMessage,
    updateMessage,
    toggleMessageReaction,
    typingUsers
  } = useChat();

  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageDto | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (editingMessage && editContent.trim()) {
      await updateMessage(editingMessage, editContent.trim());
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      await deleteMessage(messageId);
    }
  };

  const handleReaction = async (messageId: string, type: string) => {
    await toggleMessageReaction(messageId, type);
  };

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    if (isSameDay(date, now)) {
      return format(date, 'HH:mm');
    }
    return format(date, 'dd/MM HH:mm');
  };

  const groupMessagesByDate = (messages: MessageDto[]) => {
    const groups: { [key: string]: MessageDto[] } = {};
    
    messages.forEach(message => {
      const dateKey = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const shouldShowAvatar = (message: MessageDto, prevMessage?: MessageDto) => {
    if (!prevMessage) return true;
    if (prevMessage.senderId !== message.senderId) return true;
    
    const timeDiff = new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime();
    return timeDiff > 300000; // 5 minutes
  };

  const messageGroups = groupMessagesByDate(messages);

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-3 text-gray-500">Chargement des messages...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
          <div key={dateKey}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-6">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {format(new Date(dateKey), 'EEEE d MMMM yyyy', { locale: fr })}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isOwn = message.senderId === user?.id;
              const showAvatar = shouldShowAvatar(message, dateMessages[index - 1]);
              const isEditing = editingMessage === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 ${showAvatar ? 'visible' : 'invisible'}`}>
                    {!isOwn && (
                      message.senderProfilePicture ? (
                        <img 
                          src={message.senderProfilePicture} 
                          alt={message.senderName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-gray-900 font-semibold text-xs">
                            {getUserInitials(message.senderName)}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-lg ${isOwn ? 'text-right' : 'text-left'}`}>
                    {/* Sender name and time */}
                    {showAvatar && !isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{message.senderName}</span>
                        <span className="text-xs text-gray-500">{message.senderDepartment}</span>
                      </div>
                    )}

                    {/* Reply reference */}
                    {message.replyToId && (
                      <div className={`mb-2 p-2 bg-gray-100 rounded-lg text-xs ${isOwn ? 'text-right' : 'text-left'}`}>
                        <div className="font-medium text-gray-700">{message.replyToSenderName}</div>
                        <div className="text-gray-600 truncate">{message.replyToContent}</div>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`
                        relative inline-block max-w-full p-3 rounded-lg
                        ${isOwn 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                        }
                        ${message.type === MessageType.SYSTEM ? 'bg-blue-50 text-blue-800 text-center' : ''}
                      `}
                    >
                      {/* Message content */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Sauvegarder
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Text content */}
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm truncate">{attachment}</span>
                                  <button className="ml-auto">
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Message metadata */}
                          <div className={`flex items-center gap-2 mt-2 text-xs ${isOwn ? 'text-yellow-200' : 'text-gray-500'}`}>
                            <span>{formatMessageTime(new Date(message.createdAt))}</span>
                            {message.isEdited && <span>(modifié)</span>}
                            {message.readAt && isOwn && <span>✓✓</span>}
                          </div>
                        </>
                      )}

                      {/* Message options */}
                      {!isEditing && (
                        <div className={`
                          absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity
                          ${isOwn ? 'left-1' : 'right-1'}
                        `}>
                          <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg p-1">
                            <button
                              onClick={() => handleReaction(message.id, 'like')}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="J'aime"
                            >
                              <ThumbsUp className="h-3 w-3 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleReaction(message.id, 'heart')}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Cœur"
                            >
                              <Heart className="h-3 w-3 text-gray-600" />
                            </button>
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Répondre"
                            >
                              <Reply className="h-3 w-3 text-gray-600" />
                            </button>
                            {isOwn && message.canEdit && (
                              <button
                                onClick={() => handleEditMessage(message.id, message.content)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Modifier"
                              >
                                <Edit className="h-3 w-3 text-gray-600" />
                              </button>
                            )}
                            {(isOwn || message.canDelete) && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {message.reactions.map((reaction, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-full text-xs"
                            title={`${reaction.userName} - ${reaction.type}`}
                          >
                            {reaction.type === 'like' && '👍'}
                            {reaction.type === 'heart' && '❤️'}
                            {reaction.type === 'laugh' && '😂'}
                            <span className="text-gray-600">1</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {typingUsers.length === 1 
                ? `${typingUsers[0].userName} est en train d'écrire...`
                : `${typingUsers.length} personnes sont en train d'écrire...`
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput 
        conversationId={conversationId}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}