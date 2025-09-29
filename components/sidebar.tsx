'use client';

import { useState } from 'react';

interface SidebarProps {
  username?: string;
  onSignOut: () => void;
  filter: 'all' | 'mine';
  onFilterChange: (filter: 'all' | 'mine') => void;
}

export function Sidebar({ username, onSignOut, filter, onFilterChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: '🏠', 
      active: filter === 'all',
      onClick: () => onFilterChange('all')
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤', 
      active: filter === 'mine',
      onClick: () => onFilterChange('mine')
    },
    { 
      id: 'explore', 
      label: 'Explore', 
      icon: '🔍', 
      active: false,
      onClick: () => {}
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: '🔔', 
      active: false,
      onClick: () => {}
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: '✉️', 
      active: false,
      onClick: () => {}
    },
    { 
      id: 'bookmarks', 
      label: 'Bookmarks', 
      icon: '🔖', 
      active: false,
      onClick: () => {}
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️', 
      active: false,
      onClick: () => {}
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">Micro Feed</h1>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-full transition-all hover:bg-gray-100 ${
                    item.active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-lg">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Tweet Button */}
          <div className="px-3 mt-6">
            <button className={`w-full bg-blue-500 text-white font-bold py-3 rounded-full hover:bg-blue-600 transition-colors ${
              isCollapsed ? 'px-3' : 'px-6'
            }`}>
              {isCollapsed ? '✏️' : '✏️ Tweet'}
            </button>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          {username && (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    @{username}
                  </p>
                  <p className="text-xs text-gray-500">Active now</p>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={onSignOut}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <span>🚪</span>
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className={`text-xs transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
            ◀
          </span>
        </button>
      </div>
    </div>
  );
}