'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, RefreshCw, Users, Building, Phone, Mail } from 'lucide-react';
import { followService } from '@/lib/services/social/followService';
import { FollowDto } from '@/types/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import toast from 'react-hot-toast';

interface FollowSuggestionsProps {
  suggestions: FollowDto[];
  onRefresh: () => void;
}

export default function FollowSuggestions({ suggestions: initialSuggestions, onRefresh }: FollowSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<FollowDto[]>(initialSuggestions);
  const [isLoading, setIsLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getProfilePictureUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/') 
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
  };

  const handleFollow = async (userId: string) => {
    if (followingUsers.has(userId)) return;

    setFollowingUsers(prev => new Set([...prev, userId]));
    
    try {
      await followService.followUser({ followedId: userId });
      
      // Retirer l'utilisateur des suggestions
      setSuggestions(prev => prev.filter(suggestion => suggestion.followedId !== userId));
      
      toast.success('Utilisateur suivi avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du suivi');
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
      toast.success('Suggestions actualisées !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'actualisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune suggestion</h3>
          <p className="text-gray-500 mb-4">
            Nous n'avons pas trouvé de nouvelles personnes à vous suggérer pour le moment.
          </p>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-yellow-500" />
            Suggestions pour vous ({suggestions.length})
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Link 
                    href={`/EyEngage/profile/${suggestion.followedId}`}
                    className="flex-shrink-0"
                  >
                    {suggestion.followedProfilePicture ? (
                      <Image
                        src={getProfilePictureUrl(suggestion.followedProfilePicture) || ''}
                        alt={suggestion.followedName}
                        width={48}
                        height={48}
                        className="rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border border-gray-200">
                        <span className="text-gray-900 font-semibold text-sm">
                          {getUserInitials(suggestion.followedName)}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/EyEngage/profile/${suggestion.followedId}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors block"
                    >
                      {suggestion.followedName}
                    </Link>
                    
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Building className="w-3 h-3" />
                      {suggestion.followedDepartment}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleFollow(suggestion.followedId)}
                        disabled={followingUsers.has(suggestion.followedId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {followingUsers.has(suggestion.followedId) ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Suivi...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            Suivre
                          </>
                        )}
                      </button>

                      <Link
                        href={`/EyEngage/profile/${suggestion.followedId}`}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Voir profil
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">
            Basé sur votre département et vos connexions existantes
          </p>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir plus de suggestions
          </button>
        </div>
      </div>
    </div>
  );
}