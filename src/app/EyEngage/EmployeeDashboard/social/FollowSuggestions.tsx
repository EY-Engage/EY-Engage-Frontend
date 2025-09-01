'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, RefreshCw, Users, Building, CheckCircle } from 'lucide-react';
import { FollowDto } from '@/types/types';
import toast from 'react-hot-toast';

interface FollowSuggestionsProps {
  suggestions: FollowDto[];
  onFollow: (userId: string) => void;
  onRefresh?: () => void;
}

export default function FollowSuggestions({ 
  suggestions, 
  onFollow, 
  onRefresh 
}: FollowSuggestionsProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleFollow = async (userId: string, userName: string) => {
    if (followedUsers.has(userId) || followingUsers.has(userId)) return;

    setFollowingUsers(prev => new Set(prev).add(userId));
    
    try {
      await onFollow(userId);
      setFollowedUsers(prev => new Set(prev).add(userId));
      toast.success(`Vous suivez maintenant ${userName}`);
    } catch (error) {
      toast.error('Erreur lors du suivi');
    } finally {
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getProfilePictureUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
  };

  return (
    <div className="card-ey p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ey-black flex items-center gap-2">
          <Users className="w-5 h-5 text-ey-green" />
          Suggestions
        </h3>
        
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors"
            title="Actualiser les suggestions"
          >
            <RefreshCw className={`w-4 h-4 text-ey-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => {
              const isFollowing = followingUsers.has(suggestion.followedId);
              const isFollowed = followedUsers.has(suggestion.followedId);
              const profilePicture = getProfilePictureUrl(suggestion.followedProfilePicture);
              
              return (
                <motion.div
                  key={suggestion.followedId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-ey-lg border-2 transition-all ${
                    isFollowed 
                      ? 'border-ey-green bg-ey-green/5' 
                      : 'border-ey-gray-100 hover:border-ey-yellow hover:bg-ey-yellow/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Link 
                      href={`/EyEngage/profile/${suggestion.followedId}`}
                      className="flex-shrink-0 group"
                    >
                      {profilePicture ? (
                        <div className="relative">
                          <Image
                            src={profilePicture}
                            alt={suggestion.followedName}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-ey-yellow group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-ey-primary rounded-full flex items-center justify-center border-2 border-ey-yellow group-hover:scale-105 transition-transform">
                          <span className="text-ey-black font-bold text-sm">
                            {suggestion.followedName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/EyEngage/profile/${suggestion.followedId}`}
                        className="block group"
                      >
                        <h4 className="font-medium text-ey-black group-hover:text-ey-accent-blue transition-colors truncate">
                          {suggestion.followedName}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-sm text-ey-gray-600 mt-1">
                          <Building className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{suggestion.followedDepartment}</span>
                        </div>
                      </Link>

                      {/* Raison de la suggestion */}
                      <div className="mt-2 text-xs text-ey-gray-500">
                        Collègue de votre département
                      </div>

                      {/* Bouton de suivi */}
                      <div className="mt-3">
                        {isFollowed ? (
                          <div className="flex items-center gap-2 text-ey-green text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Suivi
                          </div>
                        ) : (
                          <button
                            onClick={() => handleFollow(suggestion.followedId, suggestion.followedName)}
                            disabled={isFollowing}
                            className={`btn-sm flex items-center gap-2 transition-all ${
                              isFollowing
                                ? 'bg-ey-gray-200 text-ey-gray-500 cursor-not-allowed'
                                : 'btn-ey-primary hover:scale-105'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Suivi...
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                Suivre
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informations supplémentaires sur hover */}
                  <div className="mt-3 pt-3 border-t border-ey-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between text-xs text-ey-gray-500">
                      <span>Membre depuis {new Date(suggestion.createdAt).getFullYear()}</span>
                      <Link
                        href={`/EyEngage/profile/${suggestion.followedId}`}
                        className="text-ey-accent-blue hover:text-ey-accent-blue-dark font-medium"
                      >
                        Voir le profil
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Footer */}
          <div className="pt-4 border-t border-ey-gray-200">
            <button className="w-full text-ey-accent-blue hover:text-ey-accent-blue-dark text-sm font-medium py-2 transition-colors">
              Voir plus de suggestions
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-ey-gray-300 mx-auto mb-3" />
          <h4 className="font-medium text-ey-gray-500 mb-2">
            Aucune suggestion pour le moment
          </h4>
          <p className="text-ey-gray-400 text-sm mb-4">
            Les suggestions de personnes à suivre apparaîtront ici
          </p>
          
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-ey-outline btn-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          )}
        </div>
      )}

      {/* Statistiques des suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-ey-gray-200">
          <div className="text-center">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-bold text-ey-accent-blue">
                  {suggestions.length}
                </div>
                <div className="text-ey-gray-600">Suggestions</div>
              </div>
              
              <div>
                <div className="font-bold text-ey-green">
                  {followedUsers.size}
                </div>
                <div className="text-ey-gray-600">Suivis</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}