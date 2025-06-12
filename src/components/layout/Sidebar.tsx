import React from 'react';
import { NavLink } from 'react-router-dom';
import {
   Home,
   Users,
   Tag,
   Image,
   FileText,
   Coffee,
   LogOut,
   Package // Added Package icon for Product
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
   
  const navigation = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    // { name: 'Users', icon: Users, href: '/users' },
    { name: 'Categories', icon: Tag, href: '/categories' },
    { name: 'Product', icon: Package, href: '/Products' }, // Changed from Tag to Package
    { name: 'Banners', icon: Image, href: '/banners' },
    // { name: 'Ingredients', icon: Coffee, href: '/ingredients' },
  ];

  return (
    <div className="h-full bg-green-800 text-white w-64 flex flex-col">
      <div className="p-4 border-b border-green-700">
        <div className="flex items-center justify-center space-x-2">
          <Coffee className="h-8 w-8 text-green-400" />
          <h1 className="text-xl font-bold">Smoothie Admin</h1>
        </div>
      </div>
           
      <div className="p-4 border-b border-green-700">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-semibold">
            {user?.name.charAt(0)}
          </div>
          <div className="mt-2 text-center">
            <h3 className="font-medium">{user?.name}</h3>
            <p className="text-sm text-green-300">{user?.role}</p>
          </div>
        </div>
      </div>
           
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                  isActive
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
           
      <div className="p-4 border-t border-green-700">
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 text-sm font-medium text-green-100 rounded-md w-full hover:bg-green-700 hover:text-white transition-colors duration-150 ease-in-out"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;