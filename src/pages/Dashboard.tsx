import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  Image, 
  Coffee,
  AlertCircle,
  TrendingUp,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/ui/Card';
import StatsCard from '../components/ui/StatsCard';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [activeBannersCount, setActiveBannersCount] = useState<number>(0);
  const [totalIngredients, setTotalIngredients] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<number>(0);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const LOW_STOCK_THRESHOLD = 10; // Define low stock threshold

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || 
           localStorage.getItem('userToken') || 
           localStorage.getItem('authToken') ||
           localStorage.getItem('access_token');
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!getAuthToken();
  }, [getAuthToken]);

  const redirectToLogin = () => navigate('/login');

  const makeApiRequest = async (
    url: string,
    method: string,
    body?: any,
    isFormData = false,
    requiresAuth = true
  ) => {
    const headers: Record<string, string> = {};
    if (requiresAuth) {
      const token = getAuthToken();
      if (!token) {
        redirectToLogin();
        throw new Error('Authentication required. Please login.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const config: RequestInit = { method, headers };
    if (body) config.body = isFormData ? body : JSON.stringify(body);

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      if (response.status === 401) {
        ['token', 'userToken', 'authToken', 'access_token'].forEach(key => localStorage.removeItem(key));
        redirectToLogin();
        throw new Error('Session expired. Please login again.');
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `Request failed with status ${response.status}`;
        throw new Error(message);
      }
      if (method === 'DELETE' && response.status === 204) return { success: true };
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      throw new Error(`${message} (URL: ${url})`);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsResponse, categoriesResponse, bannersResponse] = await Promise.all([
          makeApiRequest('/products', 'GET', undefined, false, true),
          makeApiRequest('/categories', 'GET', undefined, false, false),
          axios.get(`${API_BASE_URL}/banners/admin`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('userToken')}`,
            },
          }),
        ]);

        // Handle product count, ingredients, and stock
        let fetchedProducts: any[] = [];
        if (Array.isArray(productsResponse)) {
          fetchedProducts = productsResponse;
        } else if (productsResponse?.products) {
          fetchedProducts = productsResponse.products;
        } else if (productsResponse?.data) {
          fetchedProducts = productsResponse.data;
        }
        setProductCount(fetchedProducts.length);

        // Extract unique ingredients and calculate stock
        const uniqueIngredients = new Set<string>();
        let totalStockCount = 0;
        let lowStockCount = 0;

        fetchedProducts.forEach((product: any) => {
          // Sum stock
          if (typeof product.stock === 'number') {
            totalStockCount += product.stock;
            if (product.stock < LOW_STOCK_THRESHOLD) {
              lowStockCount++;
            }
          }

          // Extract ingredients from recipes
          if (Array.isArray(product.recipes)) {
            product.recipes.forEach((recipe: any) => {
              if (typeof recipe.ingredients === 'string' && recipe.ingredients.trim()) {
                const ingredients = recipe.ingredients
                  .split(',')
                  .map((ing: string) => ing.trim().toLowerCase())
                  .filter((ing: string) => ing);
                ingredients.forEach((ing: string) => uniqueIngredients.add(ing));
              }
            });
          }
        });

        setTotalIngredients(uniqueIngredients.size);
        setLowStockProducts(lowStockCount);
        setTotalStock(totalStockCount);

        // Handle category count
        let fetchedCategories: any[] = [];
        if (Array.isArray(categoriesResponse)) {
          fetchedCategories = categoriesResponse;
        } else if (categoriesResponse?.categories) {
          fetchedCategories = categoriesResponse.categories;
        } else if (categoriesResponse?.data) {
          fetchedCategories = categoriesResponse.data;
        }
        setCategoryCount(fetchedCategories.length);

        // Handle active banners count
        const fetchedBanners = Array.isArray(bannersResponse.data) ? bannersResponse.data : [];
        const activeBanners = fetchedBanners.filter((banner: any) => banner.isActive === true);
        setActiveBannersCount(activeBanners.length);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch counts.';
        setError(message);
        setProductCount(0);
        setCategoryCount(0);
        setActiveBannersCount(0);
        setTotalIngredients(0);
        setLowStockProducts(0);
        setTotalStock(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [isAuthenticated, navigate, getAuthToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your smoothie admin dashboard</p>
        {!isAuthenticated() && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              You're viewing in read-only mode.{' '}
              <button
                onClick={() => navigate('/login')}
                className="underline font-medium hover:text-yellow-900"
              >
                Login
              </button>{' '}
              to manage content.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 shadow">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Products" 
          value={productCount} 
          icon={<ShoppingBag className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard 
          title="Categories" 
          value={categoryCount} 
          icon={<Tag className="h-6 w-6" />}
          color="purple"
        />
        <StatsCard 
          title="Active Banners" 
          value={activeBannersCount} 
          icon={<Image className="h-6 w-6" />}
          color="green"
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
                <p className="text-sm text-gray-500">Unique ingredients across all products</p>
              </div>
              <span className="text-2xl font-bold text-gray-800">{totalIngredients}</span>
            </div>
            
            <div className="h-px bg-gray-200"></div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Low Stock Products</h4>
                <p className="text-sm text-gray-500">Products needing restocking (stock &lt; {LOW_STOCK_THRESHOLD})</p>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold text-amber-500">{lowStockProducts}</span>
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
                    <p>Your inventory is {lowStockProducts === 0 ? 'fully stocked' : `${Math.round((1 - lowStockProducts / productCount) * 100)}% healthy`} with {totalStock} units available.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card 
          title="Content Overview" 
          icon={<Package className="h-5 w-5 text-purple-600" />}
        >
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    Active Banners
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {activeBannersCount}/10
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div style={{ width: `${(activeBannersCount / 10) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    Total Stock
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {totalStock} units
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div style={{ width: `${Math.min((totalStock / 1000) * 100, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700">Recent Activities</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm text-blue-600">Banner "Summer Specials" updated</li>
                  <li className="text-sm text-blue-600">2 new categories added</li>
                  <li className="text-sm text-blue-600">New product "Berry Blast" added</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-700">Upcoming Tasks</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm text-amber-600">Review seasonal ingredients</li>
                  <li className="text-sm text-amber-600">Update banner images</li>
                  <li className="text-sm text-amber-600">Restock low inventory items</li>
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
            
            <div className="flex items-start p-4 rounded-lg bg-gray-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">New Product: "Berry Blast"</h4>
                <p className="mt-1 text-sm text-gray-500">Added 3 days ago to Smoothies</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              disabled={!isAuthenticated()}
              onClick={() => navigate('/products')}
            >
              Add New Smoothie
            </button>
            <button 
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              disabled={!isAuthenticated()}
              onClick={() => navigate('/categories')}
            >
              Manage Categories
            </button>
            <button 
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={!isAuthenticated()}
              onClick={() => navigate('/banners')}
            >
              Manage Banners
            </button>
          
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;