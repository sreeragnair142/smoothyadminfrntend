import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  onSearch?: (query: string) => void; // Optional search callback
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, onSearch }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Get page title from location
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Call the search callback if provided
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('header-search');
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center h-16 px-4 shadow-sm">
      <button
        onClick={toggleSidebar}
        className="text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <h1 className="ml-4 text-xl font-semibold text-gray-700">{getPageTitle()}</h1>
      
      {/* <div className="flex-1 mx-4 md:mx-8 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <input
            id="header-search"
            type="text"
            placeholder="Search... (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full rounded-lg border pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              isSearchFocused ? 'border-green-300' : 'border-gray-300'
            }`}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div> */}
      
      {/* Mobile search - shows when needed */}
      {/* <div className="md:hidden flex-1 mx-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-300 pl-8 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
          
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-2 h-4 w-4 text-gray-400"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>
      </div>
       */}
      {/* <div className="flex items-center">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <div className="ml-4 relative flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div> */}
    </header>
  );
};

export default Header;