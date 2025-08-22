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
    <div className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">@{post.profiles.username}</h3>
          <p className="text-sm text-gray-600">{formatDate(post.created_at)}</p>
          {post.updated_at !== post.created_at && (
            <p className="text-xs text-blue-600 font-medium">(edited)</p>
          )}
        </div>
        
        {isOwner && (
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              disabled={mutateLoading}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              disabled={mutateLoading}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                disabled={mutateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={mutateLoading || !editContent.trim() || editContent.length > 280}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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
        <p className="text-gray-900 mb-6 whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handleLike}
          disabled={isLikeLoading}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
            post.isLiked 
              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
          <span className="text-sm">
            {post._count?.likes || 0} {(post._count?.likes || 0) === 1 ? 'like' : 'likes'}
          </span>
        </button>
        
        <div className="text-xs text-gray-400">
          Post #{post.id.slice(-8)}
        </div>
      </div>
    </div>
  );
}