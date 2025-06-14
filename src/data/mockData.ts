import { User, Category, Banner, Blog, Ingredient, DashboardStats } from '../types';

export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@smoothies.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@smoothies.com',
    role: 'manager',
    status: 'active',
    createdAt: '2025-02-03T09:15:00Z',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert@smoothies.com',
    role: 'staff',
    status: 'inactive',
    createdAt: '2025-03-11T14:45:00Z',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@smoothies.com',
    role: 'staff',
    status: 'active',
    createdAt: '2025-03-22T11:20:00Z',
  },
];

export const categories: Category[] = [
  {
    id: '1',
    name: 'Fruit Smoothies',
    description: 'Classic smoothies made with fresh fruits',
    smoothieCount: 12,
    createdAt: '2024-11-05T08:15:00Z',
  },
  {
    id: '2',
    name: 'Green Smoothies',
    description: 'Vegetable-based smoothies with a healthy twist',
    smoothieCount: 8,
    createdAt: '2024-11-10T09:30:00Z',
  },
  {
    id: '3',
    name: 'Protein Smoothies',
    description: 'High-protein smoothies for fitness enthusiasts',
    smoothieCount: 6,
    createdAt: '2024-12-15T11:45:00Z',
  },
  {
    id: '4',
    name: 'Detox Smoothies',
    description: 'Cleansing smoothies with detoxifying ingredients',
    smoothieCount: 5,
    createdAt: '2025-01-20T14:20:00Z',
  },
];

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Summer Specials',
    description: 'Enjoy our refreshing summer smoothies at 20% off!',
    imageUrl: 'https://images.pexels.com/photos/1134062/pexels-photo-1134062.jpeg',
    linkUrl: '/summer-specials',
    isActive: true,
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
  },
  {
    id: '2',
    title: 'Healthy Lifestyle',
    description: 'Start your healthy journey with our nutritious smoothies',
    imageUrl: 'https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg',
    linkUrl: '/healthy-lifestyle',
    isActive: true,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
  },
  {
    id: '3',
    title: 'New Flavors Launch',
    description: 'Try our exciting new flavors this spring!',
    imageUrl: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg',
    linkUrl: '/new-flavors',
    isActive: false,
    startDate: '2025-03-01T00:00:00Z',
    endDate: '2025-05-31T23:59:59Z',
  },
];

export const blogs: Blog[] = [
  {
    id: '1',
    title: 'Top 10 Benefits of Daily Smoothies',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam scelerisque velit vel quam venenatis, vel ultricies nisl tincidunt...',
    author: 'Nutrition Expert',
    imageUrl: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg',
    tags: ['health', 'nutrition', 'smoothies'],
    publishDate: '2025-02-10T08:30:00Z',
    status: 'published',
  },
  {
    id: '2',
    title: 'How to Make the Perfect Green Smoothie',
    content: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque habitant...',
    author: 'Chef Alex',
    imageUrl: 'https://images.pexels.com/photos/775031/pexels-photo-775031.jpeg',
    tags: ['recipes', 'green', 'healthy'],
    publishDate: '2025-03-15T10:45:00Z',
    status: 'published',
  },
  {
    id: '3',
    title: 'Seasonal Fruits for Your Summer Smoothies',
    content: 'Suspendisse potenti. Sed euismod, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl...',
    author: 'Seasonal Expert',
    imageUrl: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
    tags: ['summer', 'fruits', 'seasonal'],
    publishDate: '2025-05-20T09:15:00Z',
    status: 'draft',
  },
];

export const ingredients: Ingredient[] = [
  {
    id: '1',
    name: 'Banana',
    category: 'Fruits',
    stock: 150,
    unit: 'kg',
    price: 1.99,
    supplier: 'Fresh Farms Inc.',
    lastRestock: '2025-04-01T08:00:00Z',
  },
  {
    id: '2',
    name: 'Strawberry',
    category: 'Fruits',
    stock: 80,
    unit: 'kg',
    price: 4.99,
    supplier: 'Berry Good Supplies',
    lastRestock: '2025-03-28T10:30:00Z',
  },
  {
    id: '3',
    name: 'Spinach',
    category: 'Vegetables',
    stock: 45,
    unit: 'kg',
    price: 2.49,
    supplier: 'Green Grocers Ltd.',
    lastRestock: '2025-04-02T09:15:00Z',
  },
  {
    id: '4',
    name: 'Protein Powder',
    category: 'Supplements',
    stock: 35,
    unit: 'kg',
    price: 19.99,
    supplier: 'Fitness Nutrition Co.',
    lastRestock: '2025-03-15T11:45:00Z',
  },
  {
    id: '5',
    name: 'Almond Milk',
    category: 'Dairy Alternatives',
    stock: 120,
    unit: 'liters',
    price: 3.49,
    supplier: 'Plant Based Foods Inc.',
    lastRestock: '2025-03-30T14:30:00Z',
  },
  {
    id: '6',
    name: 'Honey',
    category: 'Sweeteners',
    stock: 50,
    unit: 'kg',
    price: 8.99,
    supplier: 'Natural Sweets Co.',
    lastRestock: '2025-03-10T13:00:00Z',
  },
];

export const dashboardStats: DashboardStats = {
  totalUsers: users.length,
  totalCategories: categories.length,
  totalBanners: banners.length,
  totalBlogs: blogs.length,
  totalIngredients: ingredients.length,
  lowStockIngredients: ingredients.filter(i => i.stock < 50).length,
  activeBanners: banners.filter(b => b.isActive).length,
  publishedBlogs: blogs.filter(b => b.status === 'published').length,
};