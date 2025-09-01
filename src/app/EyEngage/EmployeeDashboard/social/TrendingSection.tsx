'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, TrendingUp, TrendingDown, Minus, RefreshCw, Eye } from 'lucide-react';
import { TrendingDto } from '@/types/types';
import Link from 'next/link';
import Image from 'next/image';

interface TrendingPanelProps {
  trending: TrendingDto | null;
  onRefresh?: () => void;
}

export default function TrendingPanel({ trending, onRefresh }: TrendingPanelProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-ey-green" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-ey-red" />;
      default:
        return <Minus className="w-3 h-3 text-ey-gray-400" />;
    }
  };

  const getProfilePictureUrl = (path?: string | null) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
  };

  // Vérifier si on a des données à afficher
  const hasContent = trending && (
    (trending.hashtags && trending.hashtags.length > 0) ||
    (trending.popularPosts && trending.popularPosts.length > 0) ||
    (trending.activeUsers && trending.activeUsers.length > 0) ||
    (trending.departmentStats && trending.departmentStats.length > 0)
  );

  return (
    <div className="card-ey p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ey-black flex items-center gap-2">
          <Hash className="w-5 h-5 text-ey-accent-blue" />
          Tendances
        </h3>
        
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-ey-gray-100 rounded-ey-lg transition-colors"
            title="Actualiser les tendances"
          >
            <RefreshCw className={`w-4 h-4 text-ey-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {hasContent ? (
        <div className="space-y-4">
          {/* Hashtags tendance */}
          {trending.hashtags && trending.hashtags.length > 0 && (
            <div>
              <h4 className="font-medium text-ey-black mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-ey-accent-blue" />
                Hashtags populaires
              </h4>
              <div className="space-y-2">
                {trending.hashtags.slice(0, 8).map((hashtag, index) => (
                  <motion.div
                    key={hashtag.tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 hover:bg-ey-gray-50 rounded-ey-lg cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-ey-gray-500 text-sm font-mono">
                        {index + 1}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {getTrendIcon(hashtag.trend)}
                        <span className="font-medium text-ey-black group-hover:text-ey-accent-blue transition-colors truncate">
                          #{hashtag.tag}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-ey-gray-500 text-sm flex-shrink-0">
                      {hashtag.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Publications populaires */}
          {trending.popularPosts && trending.popularPosts.length > 0 && (
            <div className="pt-4 border-t border-ey-gray-200">
              <h4 className="font-medium text-ey-black mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ey-orange" />
                Publications populaires
              </h4>
              
              <div className="space-y-3">
                {trending.popularPosts.slice(0, 3).map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/EyEngage/social/posts/${post.id}`}
                    className="block p-3 bg-ey-gray-50 rounded-ey-lg hover:bg-ey-yellow/10 transition-colors group"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-shrink-0">
                        {getProfilePictureUrl(post.authorProfilePicture) ? (
                          <Image
                            src={getProfilePictureUrl(post.authorProfilePicture) || '/default-avatar.png'}
                            alt={post.authorName || 'Avatar'}
                            width={24}
                            height={24}
                            className="rounded-full border border-ey-gray-200"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                            <span className="text-ey-black font-bold text-xs">
                              {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ey-black text-sm group-hover:text-ey-accent-blue transition-colors">
                          {post.authorName}
                        </p>
                        <p className="text-xs text-ey-gray-600">
                          {post.authorDepartment}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-ey-gray-700 line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-ey-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.viewsCount}
                      </span>
                      <span>{post.likesCount} réactions</span>
                      <span>{post.commentsCount} commentaires</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Utilisateurs actifs */}
          {trending.activeUsers && trending.activeUsers.length > 0 && (
            <div className="pt-4 border-t border-ey-gray-200">
              <h4 className="font-medium text-ey-black mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ey-green" />
                Utilisateurs actifs
              </h4>
              
              <div className="space-y-2">
                {trending.activeUsers.slice(0, 5).map((activeUser, index) => (
                  <Link
                    key={activeUser.id}
                    href={`/EyEngage/profile/${activeUser.id}`}
                    className="flex items-center gap-2 p-2 hover:bg-ey-gray-50 rounded-ey-lg group transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getProfilePictureUrl(activeUser.profilePicture) ? (
                        <Image
                          src={getProfilePictureUrl(activeUser.profilePicture) || '/default-avatar.png'}
                          alt={activeUser.fullName || 'Avatar'}
                          width={24}
                          height={24}
                          className="rounded-full border border-ey-gray-200"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                          <span className="text-ey-black font-bold text-xs">
                            {activeUser.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ey-black text-sm group-hover:text-ey-accent-blue transition-colors truncate">
                        {activeUser.fullName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-ey-gray-600">
                        <span>{activeUser.department}</span>
                        <span>•</span>
                        <span>{activeUser.postsCount || 0} posts</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-ey-green font-medium">
                      {Math.round(activeUser.engagementRate || 0)}%
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques par département */}
          {trending.departmentStats && trending.departmentStats.length > 0 && (
            <div className="pt-4 border-t border-ey-gray-200">
              <h4 className="font-medium text-ey-black mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ey-purple" />
                Activité par département
              </h4>
              
              <div className="space-y-2">
                {trending.departmentStats.map((dept, index) => (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ey-black">
                        {dept.department}
                      </span>
                      <span className="text-ey-gray-600">
                        {dept.postsCount}
                      </span>
                    </div>
                    
                    <div className="w-full bg-ey-gray-200 rounded-full h-1">
                      <motion.div 
                        className="bg-ey-accent-blue h-1 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(dept.engagementRate || 0, 100)}%` }}
                        transition={{ delay: index * 0.2, duration: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affichage quand on a seulement les posts populaires (cas actuel) */}
          {trending.popularPosts && trending.popularPosts.length > 0 && 
           (!trending.hashtags || trending.hashtags.length === 0) &&
           (!trending.activeUsers || trending.activeUsers.length === 0) &&
           (!trending.departmentStats || trending.departmentStats.length === 0) && (
            <div className="pt-4 border-t border-ey-gray-200">
              <div className="text-center text-sm text-ey-gray-500">
                <p>Plus de tendances disponibles bientôt</p>
                <p className="text-xs mt-1">Hashtags et statistiques en cours de développement</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Hash className="w-12 h-12 text-ey-gray-300 mx-auto mb-3" />
          <p className="text-ey-gray-500 text-sm">
            Aucune tendance pour le moment
          </p>
          <p className="text-ey-gray-400 text-xs mt-1">
            Les hashtags populaires et statistiques apparaîtront ici
          </p>
        </div>
      )}

      {/* Footer avec lien vers plus de tendances */}
      {trending && trending.popularPosts && trending.popularPosts.length > 3 && (
        <div className="pt-4 border-t border-ey-gray-200">
          <Link 
            href="/EyEngage/social/trending"
            className="block w-full text-center text-ey-accent-blue hover:text-ey-accent-blue-dark text-sm font-medium py-2"
          >
            Voir toutes les tendances
          </Link>
        </div>
      )}
    </div>
  );
}