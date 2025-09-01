import React from 'react';
import { Loader2, Activity } from 'lucide-react';

interface EnhancedLoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
}

export default function EnhancedLoading({ 
  fullScreen = true, 
  message = 'Chargement en cours...', 
  size = 'lg',
  variant = 'spinner' 
}: EnhancedLoadingProps) {
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full border-4 border-ey-gray-200 border-t-ey-yellow animate-spin`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-ey-yellow rounded-full animate-pulse" />
            </div>
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-4 h-4 bg-ey-yellow rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );
      
      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2 h-8 bg-ey-yellow rounded-full animate-pulse"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  height: `${Math.random() * 20 + 20}px`
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} bg-ey-yellow rounded-full animate-ping absolute opacity-75`} />
            <div className={`${sizeClasses[size]} bg-ey-yellow rounded-full relative flex items-center justify-center`}>
              <span className="text-ey-black font-bold text-2xl">EY</span>
            </div>
          </div>
        );
      
      default:
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-ey-yellow`} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Logo EY */}
      <div className="mb-4">
        <div className="w-20 h-20 bg-ey-yellow rounded-full flex items-center justify-center shadow-ey-xl animate-pulse">
          <span className="text-ey-black font-bold text-3xl">EY</span>
        </div>
      </div>

      {/* Loader */}
      {renderLoader()}

      {/* Message */}
      <div className="text-center space-y-2">
        <h3 className="text-ey-black font-semibold text-lg">{message}</h3>
        <p className="text-ey-gray-600 text-sm">Veuillez patienter...</p>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-ey-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-ey-yellow rounded-full animate-loading-bar" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-ey-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-ey-white p-10 rounded-ey-2xl shadow-ey-2xl border border-ey-gray-200">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}

// Composant Skeleton pour le chargement de contenu
export function ContentSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-ey-gray-200 rounded-ey-md w-3/4" />
          <div className="h-4 bg-ey-gray-200 rounded-ey-md w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Composant pour le chargement de cartes
export function CardSkeleton() {
  return (
    <div className="card-ey p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-ey-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-ey-gray-200 rounded-ey-md w-1/4" />
          <div className="h-3 bg-ey-gray-200 rounded-ey-md w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-ey-gray-200 rounded-ey-md" />
        <div className="h-4 bg-ey-gray-200 rounded-ey-md w-5/6" />
        <div className="h-4 bg-ey-gray-200 rounded-ey-md w-4/6" />
      </div>
    </div>
  );
}

// Composant pour le chargement de tableau
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-ey">
      <div className="bg-ey-gray-200 h-12" />
      <div className="divide-y divide-ey-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex divide-x divide-ey-gray-200">
            {[...Array(columns)].map((_, colIndex) => (
              <div key={colIndex} className="flex-1 p-4">
                <div className="h-4 bg-ey-gray-200 rounded-ey-md animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}