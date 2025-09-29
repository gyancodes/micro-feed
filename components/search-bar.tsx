'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center bg-gray-100 rounded-full transition-all ${
          isFocused ? 'bg-white border border-blue-500' : 'hover:bg-gray-200'
        }`}>
          <div className="absolute left-4 text-gray-500">
            <span className="text-lg">🔍</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search Micro Feed"
            className="w-full py-3 pl-12 pr-12 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none rounded-full"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="text-lg">✕</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}