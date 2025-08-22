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
    <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">✍️ What's on your mind?</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts with the world..."
          className="w-full p-4 border-2 border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
          rows={4}
          maxLength={280}
          disabled={loading}
        />
        
        <div className="flex justify-between items-center mt-4">
          <span className={`text-sm font-medium ${remainingChars < 20 ? 'text-red-600' : remainingChars < 50 ? 'text-yellow-600' : 'text-gray-500'}`}>
            {remainingChars} characters remaining
          </span>
          
          <button
            type="submit"
            disabled={loading || !content.trim() || content.length > 280}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
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
              '📝 Post'
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <span className="font-medium">Error: </span>{error}
          </div>
        )}
      </form>
    </div>
  );
}