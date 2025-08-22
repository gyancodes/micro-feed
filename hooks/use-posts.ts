'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post, PostsResponse } from '@/types/post';
import { supabase } from '@/lib/db';

interface UsePostsOptions {
  query?: string;
  filter?: 'all' | 'mine';
}

export function usePosts({ query = '', filter = 'all' }: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const fetchPosts = useCallback(async (cursor?: string, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (filter) params.set('filter', filter);
      if (cursor) params.set('cursor', cursor);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/posts?${params}`, {
        headers,
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: PostsResponse = await response.json();

      setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [query, filter]);

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !loading) {
      fetchPosts(nextCursor, false);
    }
  }, [hasMore, nextCursor, loading, fetchPosts]);

  const refresh = useCallback(() => {
    fetchPosts(undefined, true);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts(undefined, true);
  }, [fetchPosts]);

  // Real-time subscriptions
  useEffect(() => {
    // Subscribe to posts changes
    const postsSubscription = supabase
      .channel('posts-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          console.log('New post inserted:', payload.new);
          
          // Check if this post should be shown based on current filter
          const { data: { user } } = await supabase.auth.getUser();
          const shouldShow = filter === 'all' || (filter === 'mine' && payload.new.author_id === user?.id);
          
          if (shouldShow && (!query || payload.new.content.toLowerCase().includes(query.toLowerCase()))) {
            // Refresh to get the full post with profile data
            refresh();
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Post updated:', payload.new);
          // Update the specific post in the list if it exists
          setPosts(prev => prev.map(post => 
            post.id === payload.new.id 
              ? { ...post, content: payload.new.content, updated_at: payload.new.updated_at }
              : post
          ));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Post deleted:', payload.old);
          // Remove the post from the list
          setPosts(prev => prev.filter(post => post.id !== payload.old.id));
        }
      )
      .subscribe();

    // Subscribe to likes changes
    const likesSubscription = supabase
      .channel('likes-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'likes' },
        async (payload) => {
          console.log('Like added:', payload.new);
          // Get current user to check if this like is from them
          const { data: { user } } = await supabase.auth.getUser();
          // Update the post's like count and status
          setPosts(prev => prev.map(post => {
            if (post.id === payload.new.post_id) {
              return {
                ...post,
                isLiked: payload.new.user_id === user?.id ? true : post.isLiked,
                _count: {
                  likes: (post._count?.likes || 0) + 1
                }
              };
            }
            return post;
          }));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'likes' },
        async (payload) => {
          console.log('Like removed:', payload.old);
          // Get current user to check if this unlike is from them
          const { data: { user } } = await supabase.auth.getUser();
          // Update the post's like count and status
          setPosts(prev => prev.map(post => {
            if (post.id === payload.old.post_id) {
              return {
                ...post,
                isLiked: payload.old.user_id === user?.id ? false : post.isLiked,
                _count: {
                  likes: Math.max((post._count?.likes || 1) - 1, 0)
                }
              };
            }
            return post;
          }));
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, [refresh, setPosts, filter, query]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    setPosts,
  };
}