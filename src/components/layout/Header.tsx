import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get page title from location
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center h-16 px-4 shadow-sm">
      <button
        onClick={toggleSidebar}
        className="text-gray-600 focus:outline-none lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <h1 className="ml-4 text-xl font-semibold text-gray-700">{getPageTitle()}</h1>
      
      <div className="flex-1 mx-4 md:mx-8 hidden md:block">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex items-center">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <div className="ml-4 relative flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;