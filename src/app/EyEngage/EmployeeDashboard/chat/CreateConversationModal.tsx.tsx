'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Building, 
  Megaphone, 
  Search, 
  X, 
  Plus,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { ConversationType, Department } from '@/types/types';
import Modal from '@/components/shared/Modal';

interface CreateConversationModalProps {
  onClose: () => void;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  department: Department;
  profilePicture?: string;
  isActive: boolean;
}

export default function CreateConversationModal({ onClose }: CreateConversationModalProps) {
  const { user } = useAuth();
  const { createConversation, selectConversation } = useChat();
  
  const [conversationType, setConversationType] = useState<ConversationType>(ConversationType.DIRECT);
  const [conversationName, setConversationName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Mock users - In real app, this would come from an API
  useEffect(() => {
    // Simulate loading users
    setIsSearching(true);
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '1',
          fullName: 'Marie Dubois',
          email: 'marie.dubois@ey.com',
          department: Department.Consulting,
          isActive: true
        },
        {
          id: '2',
          fullName: 'Pierre Martin',
          email: 'pierre.martin@ey.com',
          department: Department.Assurance,
          isActive: true
        },
        {
          id: '3',
          fullName: 'Sophie Laurent',
          email: 'sophie.laurent@ey.com',
          department: Department.Tax,
          isActive: true
        },
        {
          id: '4',
          fullName: 'Antoine Moreau',
          email: 'antoine.moreau@ey.com',
          department: Department.Consulting,
          isActive: true
        },
        {
          id: '5',
          fullName: 'Camille Bernard',
          email: 'camille.bernard@ey.com',
          department: Department.Assurance,
          isActive: true
        }
      ];
      
      setAvailableUsers(mockUsers.filter(u => u.id !== user?.id));
      setIsSearching(false);
    }, 500);
  }, [user?.id]);

  const filteredUsers = availableUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (selectedUser: User) => {
    if (conversationType === ConversationType.DIRECT) {
      setSelectedUsers([selectedUser]);
      setConversationName(`${user?.fullName} & ${selectedUser.fullName}`);
    } else {
      if (selectedUsers.find(u => u.id === selectedUser.id)) {
        setSelectedUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      } else {
        setSelectedUsers(prev => [...prev, selectedUser]);
      }
    }
  };

  const handleTypeChange = (type: ConversationType) => {
    setConversationType(type);
    setSelectedUsers([]);
    setConversationName('');
    setDescription('');
    setSelectedDepartment('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0 && conversationType !== ConversationType.ANNOUNCEMENT) {
      alert('Veuillez sélectionner au moins un participant');
      return;
    }

    if (!conversationName.trim()) {
      alert('Veuillez saisir un nom pour la conversation');
      return;
    }

    setIsLoading(true);

    try {
      const conversationData = {
        type: conversationType,
        name: conversationName.trim(),
        description: description.trim() || undefined,
        participantIds: selectedUsers.map(u => u.id),
        isPrivate,
        department: conversationType === ConversationType.DEPARTMENT ? selectedDepartment : undefined,
      };

      const newConversation = await createConversation(conversationData);
      selectConversation(newConversation);
      onClose();
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      alert(error.message || 'Erreur lors de la création de la conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getTypeInfo = (type: ConversationType) => {
    switch (type) {
      case ConversationType.DIRECT:
        return {
          icon: <User className="h-5 w-5" />,
          title: 'Conversation privée',
          description: 'Discussion entre deux personnes'
        };
      case ConversationType.GROUP:
        return {
          icon: <Users className="h-5 w-5" />,
          title: 'Groupe',
          description: 'Discussion avec plusieurs personnes'
        };
      case ConversationType.DEPARTMENT:
        return {
          icon: <Building className="h-5 w-5" />,
          title: 'Canal département',
          description: 'Discussion pour tout un département'
        };
      case ConversationType.ANNOUNCEMENT:
        return {
          icon: <Megaphone className="h-5 w-5" />,
          title: 'Canal d\'annonces',
          description: 'Pour les annonces importantes'
        };
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nouvelle conversation" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Conversation Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de conversation
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(ConversationType).map(type => {
              const typeInfo = getTypeInfo(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    conversationType === type
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${conversationType === type ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {typeInfo.icon}
                    </div>
                    <span className="font-medium text-gray-900">{typeInfo.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{typeInfo.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la conversation
          </label>
          <input
            type="text"
            value={conversationName}
            onChange={(e) => setConversationName(e.target.value)}
            placeholder={
              conversationType === ConversationType.DIRECT ? 'Généré automatiquement' :
              conversationType === ConversationType.GROUP ? 'Équipe Marketing' :
              conversationType === ConversationType.DEPARTMENT ? `Canal ${selectedDepartment}` :
              'Annonces importantes'
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required={conversationType !== ConversationType.DIRECT}
            disabled={conversationType === ConversationType.DIRECT}
          />
        </div>

        {/* Description */}
        {conversationType !== ConversationType.DIRECT && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'objectif de cette conversation..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>
        )}

        {/* Department Selection for Department conversations */}
        {conversationType === ConversationType.DEPARTMENT && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Département
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value as Department);
                setConversationName(`Canal ${e.target.value}`);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            >
              <option value="">Sélectionnez un département</option>
              {Object.values(Department).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        )}

        {/* Privacy Settings */}
        {(conversationType === ConversationType.GROUP || conversationType === ConversationType.DEPARTMENT) && (
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Conversation privée</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Les conversations privées nécessitent une invitation pour rejoindre
            </p>
          </div>
        )}

        {/* User Selection */}
        {conversationType !== ConversationType.ANNOUNCEMENT && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {conversationType === ConversationType.DIRECT ? 'Sélectionnez un contact' : 'Participants'}
            </label>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des collègues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Participants sélectionnés:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(selectedUser => (
                    <span
                      key={selectedUser.id}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {selectedUser.fullName}
                      <button
                        type="button"
                        onClick={() => handleUserSelect(selectedUser)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User List */}
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">Recherche...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Aucun utilisateur trouvé</div>
              ) : (
                filteredUsers.map(availableUser => {
                  const isSelected = selectedUsers.find(u => u.id === availableUser.id);
                  return (
                    <button
                      key={availableUser.id}
                      type="button"
                      onClick={() => handleUserSelect(availableUser)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                        isSelected ? 'bg-yellow-50' : ''
                      }`}
                    >
                      {availableUser.profilePicture ? (
                        <img 
                          src={availableUser.profilePicture} 
                          alt={availableUser.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-gray-900 font-semibold text-xs">
                            {getUserInitials(availableUser.fullName)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{availableUser.fullName}</p>
                        <p className="text-sm text-gray-500">{availableUser.department}</p>
                      </div>
                      
                      {isSelected && (
                        <Check className="h-5 w-5 text-yellow-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading || (!conversationName.trim() && conversationType !== ConversationType.DIRECT) || (selectedUsers.length === 0 && conversationType !== ConversationType.ANNOUNCEMENT)}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {isLoading ? 'Création...' : 'Créer la conversation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}