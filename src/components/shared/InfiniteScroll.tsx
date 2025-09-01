'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

export default function InfiniteScroll({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 100,
  className = ''
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  return (
    <div className={className}>
      {children}
      
      {hasMore && (
        <div ref={lastElementRef} className="py-4">
          {loading && (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
