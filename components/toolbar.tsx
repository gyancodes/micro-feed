'use client';

interface ToolbarProps {
  filter: 'all' | 'mine';
  onFilterChange: (filter: 'all' | 'mine') => void;
  onSignOut: () => void;
  username?: string;
}

export function Toolbar({ filter, onFilterChange, onSignOut, username }: ToolbarProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            🌍 All Posts
          </button>
          <button
            onClick={() => onFilterChange('mine')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'mine'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            📝 My Posts
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {username && (
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-800 font-medium">👤 @{username}</span>
            </div>
          )}
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}