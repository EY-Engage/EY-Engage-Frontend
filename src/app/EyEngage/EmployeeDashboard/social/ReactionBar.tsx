'use client';

import React, { useState } from 'react';
import { Heart, ThumbsUp, Lightbulb, Star, Coffee, Plus } from 'lucide-react';
import { PostDto, ReactionType } from '@/types/types';
import { postService } from '@/lib/services/social/postService';

interface ReactionBarProps {
  post: PostDto;
  onUpdate: (post: PostDto) => void;
}

const reactionConfig = {
  [ReactionType.LIKE]: { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50', label: 'J\'aime' },
  [ReactionType.LOVE]: { icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-50', label: 'Adore' },
  [ReactionType.CELEBRATE]: { icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50', label: 'Bravo' },
  [ReactionType.SUPPORT]: { icon: ThumbsUp, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'Soutien' },
  [ReactionType.INSIGHTFUL]: { icon: Lightbulb, color: 'text-purple-500', bgColor: 'bg-purple-50', label: 'Perspicace' },
  [ReactionType.CURIOUS]: { icon: Coffee, color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'Intéressant' }
};

export default function ReactionBar({ post, onUpdate }: ReactionBarProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const handleReaction = async (reactionType: ReactionType) => {
    if (isReacting) return;
    
    setIsReacting(true);
    setShowReactions(false);
    
    try {
      const response = await postService.toggleReaction({
        targetId: post.id,
        targetType: 'POST',
        type: reactionType
      });

      // Update post with new reaction
      const updatedPost = {
        ...post,
        userReaction: response.action === 'added' ? reactionType : undefined,
        likesCount: response.action === 'added' 
          ? post.likesCount + 1 
          : post.likesCount - 1
      };
      
      onUpdate(updatedPost);
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const currentReaction = post.userReaction;
  const CurrentReactionIcon = currentReaction ? reactionConfig[currentReaction]?.icon : Plus;
  const currentReactionColor = currentReaction ? reactionConfig[currentReaction]?.color : 'text-gray-400';

  return (
    <div className="relative">
      <button
        onClick={() => setShowReactions(!showReactions)}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          currentReaction 
            ? `${reactionConfig[currentReaction]?.bgColor} ${reactionConfig[currentReaction]?.color}`
            : 'text-gray-400 hover:bg-gray-100'
        }`}
        disabled={isReacting}
      >
        <CurrentReactionIcon className="w-4 h-4" />
        {currentReaction ? reactionConfig[currentReaction]?.label : 'Réaction'}
      </button>

      {showReactions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowReactions(false)}
          />
          
          {/* Reactions popup */}
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 z-20">
            {Object.entries(reactionConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type as ReactionType)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${config.bgColor} ${config.color}`}
                  title={config.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}