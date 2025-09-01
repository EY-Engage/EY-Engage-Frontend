'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Users, 
  Settings,
  Phone,
  Video,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { ChatProvider } from '@/context/ChatContext';
import { ConversationType } from '@/types/types';
import ConversationList from './ConversationList';
import CreateConversationModal from './CreateConversationModal.tsx';
import MessageWindow from './MessageWindow';

function ChatContent() {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    isLoading,
    error,
    selectConversation,
    clearError,
    refreshConversations
  } = useChat();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ConversationType | 'all'>('all');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationsList, setShowConversationsList] = useState(true);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: hide conversations list when a conversation is selected
  useEffect(() => {
    if (isMobileView && currentConversation) {
      setShowConversationsList(false);
    } else if (isMobileView && !currentConversation) {
      setShowConversationsList(true);
    }
  }, [isMobileView, currentConversation]);

  const handleBackToConversations = () => {
    setShowConversationsList(true);
    selectConversation(null as any);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || conv.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-yellow-500" />
              Messagerie EY
            </h1>
            <p className="text-gray-600 mt-1">
              Communiquez en temps réel avec vos collègues
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshConversations}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Settings className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouvelle conversation
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List - Desktop always visible, Mobile conditional */}
          <div className={`
            ${isMobileView 
              ? (showConversationsList ? 'w-full' : 'hidden') 
              : 'w-1/3 border-r border-gray-200'
            }
            flex flex-col
          `}>
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedFilter === 'all'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                {Object.values(ConversationType).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedFilter === type
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'DIRECT' ? 'Privées' :
                     type === 'GROUP' ? 'Groupes' :
                     type === 'DEPARTMENT' ? 'Département' :
                     type === 'ANNOUNCEMENT' ? 'Annonces' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={filteredConversations}
                currentConversation={currentConversation}
                onSelectConversation={selectConversation}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Message Window - Desktop always visible, Mobile conditional */}
          <div className={`
            ${isMobileView 
              ? (showConversationsList ? 'hidden' : 'w-full') 
              : 'flex-1'
            }
            flex flex-col
          `}>
            {currentConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isMobileView && (
                        <button
                          onClick={handleBackToConversations}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        {currentConversation.type === ConversationType.DIRECT ? (
                          <span className="text-gray-900 font-semibold text-sm">
                            {currentConversation.name.substring(0, 2).toUpperCase()}
                          </span>
                        ) : (
                          <Users className="h-5 w-5 text-gray-700" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{currentConversation.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{currentConversation.participantsCount} participant{currentConversation.participantsCount > 1 ? 's' : ''}</span>
                          {currentConversation.type === ConversationType.DEPARTMENT && (
                            <>
                              <span>•</span>
                              <span>{currentConversation.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {currentConversation.type === ConversationType.DIRECT && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Phone className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Video className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <MessageWindow conversationId={currentConversation.id} />
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Choisissez une conversation pour commencer à discuter
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Conversation Modal */}
      {showCreateModal && (
        <CreateConversationModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}