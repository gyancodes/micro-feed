'use client';

import { useState } from 'react';
import { Post } from '@/types/post';
import { useMutatePost } from '@/hooks/use-mutate-post';
import { useLike } from '@/hooks/use-like';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onPostUpdated: (post: Post) => void;
  onPostDeleted: (postId: string) => void;
  onLikeToggled: (postId: string, isLiked: boolean, likesCount: number) => void;
}

export function PostCard({ 
  post, 
  currentUserId, 
  onPostUpdated, 
  onPostDeleted,
  onLikeToggled 
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { updatePost, deletePost, loading: mutateLoading, error } = useMutatePost();
  const { toggleLike, loading: likeLoading } = useLike();

  const isOwner = currentUserId === post.author_id;
  const isLikeLoading = likeLoading === post.id;

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    const updatedPost = await updatePost(post.id, { content: editContent.trim() });
    if (updatedPost) {
      onPostUpdated(updatedPost);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const success = await deletePost(post.id);
      if (success) {
        onPostDeleted(post.id);
      }
    }
  };

  const handleLike = async () => {
    await toggleLike(post, onLikeToggled);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 p-4">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {post.profiles.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tweet Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-gray-900 hover:underline cursor-pointer">
              {post.profiles.username}
            </h3>
            <span className="text-gray-500">@{post.profiles.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm hover:underline cursor-pointer">
              {formatDate(post.created_at)}
            </span>
            {post.updated_at !== post.created_at && (
              <>
                <span className="text-gray-500">·</span>
                <span className="text-blue-600 text-sm">(edited)</span>
              </>
            )}
            
            {/* More Options */}
            {isOwner && (
              <div className="ml-auto flex items-center">
                <div className="relative group">
                  <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <span className="text-gray-500">⋯</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      disabled={mutateLoading}
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      disabled={mutateLoading}
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                rows={3}
                maxLength={280}
                disabled={mutateLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${280 - editContent.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                  {280 - editContent.length} characters remaining
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(post.content);
                    }}
                    className="px-4 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50"
                    disabled={mutateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={mutateLoading || !editContent.trim() || editContent.length > 280}
                    className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 font-medium"
                  >
                    {mutateLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              {error && (
                <div className="mt-2 text-red-500 text-sm">{error}</div>
              )}
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-gray-900 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
            </div>
          )}

          {/* Engagement Buttons */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            {/* Reply */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full px-3 py-2 transition-all group">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              <span className="text-sm group-hover:text-blue-500">0</span>
            </button>

            {/* Retweet */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-full px-3 py-2 transition-all group">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-lg">🔄</span>
              </div>
              <span className="text-sm group-hover:text-green-500">0</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex items-center space-x-2 rounded-full px-3 py-2 transition-all group ${
                post.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
              </div>
              <span className={`text-sm ${post.isLiked ? 'text-red-500' : 'group-hover:text-red-500'}`}>
                {post._count?.likes || 0}
              </span>
            </button>

            {/* Share */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full px-3 py-2 transition-all group">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-lg">📤</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}