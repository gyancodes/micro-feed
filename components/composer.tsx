'use client';

import { useState } from 'react';
import { useMutatePost } from '@/hooks/use-mutate-post';
import { Post } from '@/types/post';

interface ComposerProps {
  onPostCreated: (post: Post) => void;
}

export function Composer({ onPostCreated }: ComposerProps) {
  const [content, setContent] = useState('');
  const { createPost, loading, error } = useMutatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    const post = await createPost({ content: content.trim() });
    if (post) {
      setContent('');
      onPostCreated(post);
    }
  };

  const remainingChars = 280 - content.length;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* Avatar placeholder */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">You</span>
            </div>
          </div>

          {/* Composer */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full text-xl placeholder-gray-500 border-none resize-none focus:outline-none text-gray-900 bg-transparent"
              rows={3}
              maxLength={280}
              disabled={loading}
            />
            
            {/* Media options and controls */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              {/* Media options */}
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  title="Add photo"
                >
                  <span className="text-lg">📷</span>
                </button>
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  title="Add GIF"
                >
                  <span className="text-lg">🎬</span>
                </button>
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  title="Add poll"
                >
                  <span className="text-lg">📊</span>
                </button>
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  title="Add emoji"
                >
                  <span className="text-lg">😊</span>
                </button>
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  title="Schedule"
                >
                  <span className="text-lg">📅</span>
                </button>
              </div>

              {/* Character count and tweet button */}
              <div className="flex items-center space-x-3">
                {/* Character count circle */}
                <div className="relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke={remainingChars < 20 ? '#ef4444' : remainingChars < 50 ? '#f59e0b' : '#3b82f6'}
                      strokeWidth="2"
                      strokeDasharray={`${((280 - remainingChars) / 280) * 87.96} 87.96`}
                      className="transition-all duration-200"
                    />
                  </svg>
                  {remainingChars < 20 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-500">
                      {remainingChars}
                    </span>
                  )}
                </div>

                {/* Tweet button */}
                <button
                  type="submit"
                  disabled={loading || !content.trim() || content.length > 280}
                  className="px-6 py-1.5 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    'Tweet'
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <span className="font-medium">Error: </span>{error}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}