'use client';

interface RightSidebarProps {
  realtimeStatus: 'connected' | 'connecting' | 'disconnected';
}

export function RightSidebar({ realtimeStatus }: RightSidebarProps) {
  const trendingTopics = [
    { tag: '#MicroFeed', posts: '1.2K posts' },
    { tag: '#SocialMedia', posts: '856 posts' },
    { tag: '#TechNews', posts: '642 posts' },
    { tag: '#WebDev', posts: '423 posts' },
    { tag: '#OpenSource', posts: '312 posts' }
  ];

  const suggestedUsers = [
    { username: 'techguru', name: 'Tech Guru', followers: '12.5K' },
    { username: 'designpro', name: 'Design Pro', followers: '8.3K' },
    { username: 'codewiz', name: 'Code Wizard', followers: '15.2K' }
  ];

  return (
    <div className="w-80 space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            realtimeStatus === 'connected' ? 'bg-green-500' : 
            realtimeStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {realtimeStatus === 'connected' ? 'Live Updates Active' : 
               realtimeStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </p>
            <p className="text-xs text-gray-500">
              {realtimeStatus === 'connected' ? 'Real-time feed updates enabled' : 
               realtimeStatus === 'connecting' ? 'Establishing connection...' : 'Check your connection'}
            </p>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">What's happening</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Trending in Technology</p>
                  <p className="font-bold text-gray-900">{topic.tag}</p>
                  <p className="text-sm text-gray-500">{topic.posts}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="text-lg">⋯</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            Show more
          </button>
        </div>
      </div>

      {/* Who to Follow */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Who to follow</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {suggestedUsers.map((user, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                    <p className="text-xs text-gray-400">{user.followers} followers</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            Show more
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 space-y-2 px-4">
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">Ads info</a>
          <a href="#" className="hover:underline">More</a>
        </div>
        <p className="text-gray-400">© 2024 Micro Feed, Inc.</p>
      </div>
    </div>
  );
}