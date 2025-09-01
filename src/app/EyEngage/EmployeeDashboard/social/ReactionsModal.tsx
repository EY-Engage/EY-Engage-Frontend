'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Filter, Search, TrendingUp } from 'lucide-react';
import { ReactionType } from '@/types/types';

interface ReactionUser {
  id: string;
  userName: string;
  userProfilePicture?: string;
  userDepartment: string;
  type: ReactionType;
  createdAt: Date;
}

interface ReactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: ReactionUser[];
  title?: string;
  targetType?: 'post' | 'comment';
}

const reactionEmojis = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
  celebrate: '🎉',
  support: '🤝'
};

const reactionLabels = {
  like: 'J\'aime',
  love: 'Adore',
  laugh: 'Drôle',
  wow: 'Waouh',
  sad: 'Triste',
  angry: 'En colère',
  celebrate: 'Célèbre',
  support: 'Soutien'
};

export default function ReactionsModal({
  isOpen,
  onClose,
  reactions,
  title = 'Réactions',
  targetType = 'post'
}: ReactionsModalProps) {
  const [selectedReactionType, setSelectedReactionType] = useState<ReactionType | 'all'>('all');
  const [filteredReactions, setFilteredReactions] = useState<ReactionUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculer les statistiques des réactions
  const reactionStats = reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  // Filtrer les réactions
  useEffect(() => {
    let filtered = reactions;

    // Filtrer par type de réaction
    if (selectedReactionType !== 'all') {
      filtered = filtered.filter(r => r.type === selectedReactionType);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.userName.toLowerCase().includes(query) ||
        r.userDepartment.toLowerCase().includes(query)
      );
    }

    setFilteredReactions(filtered);
  }, [reactions, selectedReactionType, searchQuery]);

  if (!isOpen) return null;

  // Convertir les réactions en format UserDto pour UserListModal
  const usersData = filteredReactions.map(reaction => ({
    id: reaction.id,
    fullName: reaction.userName,
    email: '', // Non disponible dans les réactions
    department: reaction.userDepartment,
    profilePicture: reaction.userProfilePicture,
    createdAt: reaction.createdAt.toString(),
    roles: [],
    // Données personnalisées pour afficher le type de réaction
    reactionType: reaction.type,
    reactionEmoji: reactionEmojis[reaction.type]
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-ey-gray-200 bg-gradient-ey-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ey-white rounded-ey-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-ey-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ey-black">
                  {title}
                </h2>
                <p className="text-ey-gray-700 text-sm">
                  {reactions.length} réaction{reactions.length > 1 ? 's' : ''} sur ce {targetType === 'post' ? 'post' : 'commentaire'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-ey-black/10 rounded-ey-lg transition-colors"
            >
              <X className="w-6 h-6 text-ey-black" />
            </button>
          </div>

          {/* Filtres par type de réaction */}
          <div className="p-4 border-b border-ey-gray-200 bg-ey-light-gray">
            
            {/* Statistiques rapides */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-ey-gray-600">
                <span className="font-medium text-ey-black">{filteredReactions.length}</span> utilisateur{filteredReactions.length > 1 ? 's' : ''} affiché{filteredReactions.length > 1 ? 's' : ''}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-ey-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Type le plus populaire: {reactionEmojis[Object.entries(reactionStats).sort(([,a], [,b]) => b - a)[0]?.[0] as ReactionType]}</span>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Rechercher par nom ou département..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-ey pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ey-gray-400" />
            </div>

            {/* Filtres par réaction */}
            <div className="flex flex-wrap gap-2">
              {/* Bouton "Toutes" */}
              <button
                onClick={() => setSelectedReactionType('all')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-ey-full text-sm font-medium transition-colors ${
                  selectedReactionType === 'all'
                    ? 'bg-ey-yellow text-ey-black'
                    : 'bg-ey-white text-ey-gray-700 hover:bg-ey-gray-100 border border-ey-gray-200'
                }`}
              >
                <span className="text-base">🌟</span>
                <span>Toutes ({reactions.length})</span>
              </button>

              {/* Boutons par type de réaction */}
              {Object.entries(reactionStats).map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => setSelectedReactionType(type as ReactionType)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-ey-full text-sm font-medium transition-colors ${
                    selectedReactionType === type
                      ? 'bg-ey-yellow text-ey-black'
                      : 'bg-ey-white text-ey-gray-700 hover:bg-ey-gray-100 border border-ey-gray-200'
                  }`}
                  title={reactionLabels[type as ReactionType]}
                >
                  <span className="text-base">{reactionEmojis[type as ReactionType]}</span>
                  <span>{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {filteredReactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-ey-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-ey-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-ey-gray-700 mb-2">
                  Aucune réaction trouvée
                </h3>
                <p className="text-ey-gray-500 mb-4">
                  {searchQuery ? 'Aucune réaction ne correspond à votre recherche.' : 'Aucune réaction de ce type.'}
                </p>
                {(searchQuery || selectedReactionType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedReactionType('all');
                    }}
                    className="btn-ey-primary"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredReactions.map((reaction, index) => (
                  <motion.div
                    key={`${reaction.id}-${reaction.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-ey-white border border-ey-gray-200 rounded-ey-lg hover:shadow-ey-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        {reaction.userProfilePicture ? (
                          <img
                            src={reaction.userProfilePicture.startsWith('http') 
                              ? reaction.userProfilePicture 
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${reaction.userProfilePicture}`
                            }
                            alt={reaction.userName}
                            className="w-10 h-10 rounded-full border-2 border-ey-yellow object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-ey-primary rounded-full flex items-center justify-center border-2 border-ey-yellow">
                            <span className="text-ey-black font-bold">
                              {reaction.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Badge de réaction */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-ey-white rounded-full flex items-center justify-center shadow-ey-sm border border-ey-gray-200">
                          <span className="text-sm" title={reactionLabels[reaction.type]}>
                            {reactionEmojis[reaction.type]}
                          </span>
                        </div>
                      </div>
                      
                      {/* Informations utilisateur */}
                      <div>
                        <p className="font-medium text-ey-black">
                          {reaction.userName}
                        </p>
                        <p className="text-sm text-ey-gray-600">
                          {reaction.userDepartment}
                        </p>
                      </div>
                    </div>
                    
                    {/* Heure de réaction */}
                    <div className="text-xs text-ey-gray-500 text-right">
                      <p>{new Date(reaction.createdAt).toLocaleDateString('fr-FR')}</p>
                      <p>{new Date(reaction.createdAt).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="p-4 border-t border-ey-gray-200 bg-ey-light-gray">
            <div className="flex items-center justify-between text-sm">
              <div className="text-ey-gray-600">
                <span className="font-medium text-ey-black">{reactions.length}</span> réaction{reactions.length > 1 ? 's' : ''} au total
              </div>
              
              <button
                onClick={onClose}
                className="btn-ey-primary"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}