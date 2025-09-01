'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  X,
  Mic,
  MicOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { MessageDto, MessageType } from '@/types/types';

interface MessageInputProps {
  conversationId: string;
  replyingTo?: MessageDto | null;
  onCancelReply?: () => void;
}

export default function MessageInput({ 
  conversationId, 
  replyingTo, 
  onCancelReply 
}: MessageInputProps) {
  const { user } = useAuth();
  const { sendMessage, sendTyping, stopTyping } = useChat();
  
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim()) {
      sendTyping(conversationId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId);
      }, 3000);
    } else {
      stopTyping(conversationId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, conversationId, sendTyping, stopTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && attachments.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    stopTyping(conversationId);

    try {
      const messageData = {
        conversationId,
        type: MessageType.TEXT,
        content: message.trim(),
        replyToId: replyingTo?.id,
        mentions: extractMentions(message),
      };

      await sendMessage(messageData, attachments.length > 0 ? attachments : undefined);
      
      // Clear form
      setMessage('');
      setAttachments([]);
      if (onCancelReply) onCancelReply();
      
      // Focus back to textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@\w+/g);
    return mentions ? mentions.map(mention => mention.substring(1)) : [];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🤔', '👋', '🙏'];

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-yellow-400 rounded"></div>
              <div>
                <p className="text-xs font-medium text-gray-700">
                  Réponse à {replyingTo.senderName}
                </p>
                <p className="text-xs text-gray-600 truncate max-w-xs">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <Paperclip className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-700 truncate max-w-32">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                  textareaRef.current?.focus();
                }}
                className="text-lg hover:bg-gray-200 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-3">
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Joindre un fichier"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Émojis"
            >
              <Smile className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message... (Utilisez @ pour mentionner quelqu'un)"
              className="w-full max-h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              rows={1}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || isSubmitting}
            className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Envoyer"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Character count */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div>
            {message.length > 0 && (
              <span className={message.length > 4500 ? 'text-red-500' : ''}>
                {message.length}/5000
              </span>
            )}
          </div>
          <div>
            <span>Entrée pour envoyer, Maj+Entrée pour nouvelle ligne</span>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
      </form>
    </div>
  );
}