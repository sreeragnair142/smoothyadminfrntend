
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
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  smoothieCount?: number;
  productPages?: ProductPage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  smoothieCount: number;
  createdAt: string;
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

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  mobileImage?: string;
  fruitImage?: string;
  linkUrl?: string;
  bannerType: 'home_slider' | 'inner_page';
  page?: string;
  displayOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt?: string;
  bannerImages?: { id: string; url: string; type: 'home-slider' | 'inner-page' }[];
  ingredients?: { id: string; name: string; type: 'primary' | 'secondary' }[];
}

export interface ProductPage {
  name: string;
  url: string;
}
