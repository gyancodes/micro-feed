'use client';

import { useState } from 'react';
import { Post } from '@/types/post';
import { supabase } from '@/lib/db';

export function useLike() {
  const [loading, setLoading] = useState<string | null>(null);

  const toggleLike = async (
    post: Post,
    onOptimisticUpdate: (postId: string, isLiked: boolean, likesCount: number) => void
  ): Promise<boolean> => {
    const wasLiked = post.isLiked;
    const currentLikesCount = post._count?.likes || 0;
    
    // Optimistic update
    onOptimisticUpdate(
      post.id, 
      !wasLiked, 
      wasLiked ? currentLikesCount - 1 : currentLikesCount + 1
    );

    try {
      setLoading(post.id);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: wasLiked ? 'DELETE' : 'POST',
        headers,
        credentials: 'same-origin',
      });

      if (!response.ok) {
        // Revert optimistic update on error
        onOptimisticUpdate(post.id, wasLiked, currentLikesCount);
        throw new Error('Failed to toggle like');
      }

      return true;
    } catch (error) {
      // Optimistic update already reverted above
      return false;
    } finally {
      setLoading(null);
    }
  };

  return {
    toggleLike,
    loading,
  };
}