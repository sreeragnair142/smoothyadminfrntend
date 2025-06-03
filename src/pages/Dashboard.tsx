import React from 'react';
import { 
  Users, 
  Tag, 
  Image, 
  FileText, 
  Coffee,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import Card from '../components/ui/Card';
import StatsCard from '../components/ui/StatsCard';
import { dashboardStats } from '../data/mockData';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your smoothie admin dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={dashboardStats.totalUsers} 
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard 
          title="Categories" 
          value={dashboardStats.totalCategories} 
          icon={<Tag className="h-6 w-6" />}
          color="purple"
        />
        <StatsCard 
          title="Active Banners" 
          value={dashboardStats.activeBanners} 
          icon={<Image className="h-6 w-6" />}
          color="green"
        />
        <StatsCard 
          title="Published Blogs" 
          value={dashboardStats.publishedBlogs} 
          icon={<FileText className="h-6 w-6" />}
          color="orange"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Ingredients Status" 
          icon={<Coffee className="h-5 w-5 text-green-600" />}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Total Ingredients</h4>
                <p className="text-sm text-gray-500">All registered ingredients</p>
              </div>
              <span className="text-2xl font-bold text-gray-800">{dashboardStats.totalIngredients}</span>
            </div>
            
            <div className="h-px bg-gray-200"></div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Low Stock Alert</h4>
                <p className="text-sm text-gray-500">Ingredients that need reordering</p>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold text-amber-500">{dashboardStats.lowStockIngredients}</span>
              </div>
            </div>
            
            <div className="h-px bg-gray-200"></div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Inventory Health</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your inventory is well-stocked at {Math.round((1 - dashboardStats.lowStockIngredients / dashboardStats.totalIngredients) * 100)}% capacity.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card 
          title="Content Overview" 
          icon={<FileText className="h-5 w-5 text-purple-600" />}
        >
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-purple-600">
                    Blog Articles
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-purple-600">
                    {dashboardStats.publishedBlogs}/{dashboardStats.totalBlogs}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                <div style={{ width: `${(dashboardStats.publishedBlogs / dashboardStats.totalBlogs) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    Active Banners
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {dashboardStats.activeBanners}/{dashboardStats.totalBanners}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div style={{ width: `${(dashboardStats.activeBanners / dashboardStats.totalBanners) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700">Recent Activities</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm text-blue-600">New blog post published</li>
                  <li className="text-sm text-blue-600">Banner "Summer Specials" updated</li>
                  <li className="text-sm text-blue-600">2 new categories added</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-700">Upcoming Tasks</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm text-amber-600">Review seasonal ingredients</li>
                  <li className="text-sm text-amber-600">Update banner images</li>
                  <li className="text-sm text-amber-600">Schedule social media posts</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
          <div className="space-y-4">
            <div className="flex items-start p-4 rounded-lg bg-gray-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">New Blog Post: "Top 10 Benefits of Daily Smoothies"</h4>
                <p className="mt-1 text-sm text-gray-500">Published 2 days ago by Nutrition Expert</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-lg bg-gray-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                  <Tag className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">New Category: "Detox Smoothies"</h4>
                <p className="mt-1 text-sm text-gray-500">Added 1 week ago with 5 smoothies</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-lg bg-gray-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <Image className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Banner "Summer Specials" is now active</h4>
                <p className="mt-1 text-sm text-gray-500">Will run from June 1 to August 31</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Add New Smoothie
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Manage Ingredients
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Create New Blog
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              View Reports
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;