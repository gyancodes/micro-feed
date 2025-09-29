'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/db';
import { User } from '@supabase/supabase-js';
import { Post } from '@/types/post';
import { usePosts } from '@/hooks/use-posts';
import { Composer } from '@/components/composer';
import { PostCard } from '@/components/post-card';
import { SearchBar } from '@/components/search-bar';
import { Sidebar } from '@/components/sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { AuthForm } from '@/components/auth-form';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  const { posts, loading: postsLoading, error, hasMore, loadMore, refresh, setPosts } = usePosts({ 
    query, 
    filter 
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Get or create profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({ id: user.id, username })
            .select('username')
            .single();
          setProfile(newProfile);
        } else {
          setProfile(profile);
        }
      }
      
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
        }
      }
    );

    // Monitor real-time connection status
    const channel = supabase.channel('connection-status');
    
    channel
      .on('system', {}, (payload) => {
        if (payload.status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (payload.status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAuthSuccess = () => {
    // Refresh user state after successful auth
    window.location.reload();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handlePostCreated = useCallback((newPost: Post) => {
    // Real-time subscription will handle adding the post automatically
    // But we can still add it optimistically for immediate feedback
    setPosts(prev => [newPost, ...prev]);
  }, [setPosts]);

  const handlePostUpdated = useCallback((updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  }, [setPosts]);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  }, [setPosts]);

  const handleLikeToggled = useCallback((postId: string, isLiked: boolean, likesCount: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked, _count: { likes: likesCount } }
        : post
    ));
  }, [setPosts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Micro Feed</h1>
            <p className="text-gray-600 text-lg">Share your thoughts in 280 characters or less</p>
          </div>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <Sidebar
        username={profile?.username}
        onSignOut={handleSignOut}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 mr-80">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
            <h1 className="text-xl font-bold text-gray-900">
              {filter === 'all' ? 'Home' : 'Your Posts'}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <SearchBar onSearch={setQuery} />
          </div>

          {/* Composer */}
          <div className="border-b border-gray-200">
            <Composer onPostCreated={handlePostCreated} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4">
              {error}
            </div>
          )}

          {/* Posts Feed */}
          <div className="divide-y divide-gray-200">
            {postsLoading && posts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-500">Loading posts...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {query ? 'No posts found matching your search.' : 'No posts yet. Be the first to post!'}
                </div>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                    onLikeToggled={handleLikeToggled}
                  />
                ))}

                {hasMore && (
                  <div className="text-center py-6 border-t border-gray-200">
                    <button
                      onClick={loadMore}
                      disabled={postsLoading}
                      className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 font-medium"
                    >
                      {postsLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 p-4 overflow-y-auto">
        <RightSidebar realtimeStatus={realtimeStatus} />
      </div>
    </div>
  );
}