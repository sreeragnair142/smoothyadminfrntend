export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  smoothieCount: number;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  imageUrl: string;
  tags: string[];
  publishDate: string;
  status: 'draft' | 'published';
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  supplier: string;
  lastRestock: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalBanners: number;
  totalBlogs: number;
  totalIngredients: number;
  lowStockIngredients: number;
  activeBanners: number;
  publishedBlogs: number;
}