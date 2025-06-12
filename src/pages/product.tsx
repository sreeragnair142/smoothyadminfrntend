  import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
  import { Edit, Trash2, AlertCircle, Loader, Upload, X, DollarSign, Droplet, Eye } from 'lucide-react';
  import DataTable from '../components/ui/DataTable';
  import Modal from '../components/ui/Modal';
  import { useNavigate, NavigateFunction } from 'react-router-dom';

  // API Configuration
  const API_BASE_URL = 'http://localhost:5000/api';

  // Define available product pages with unique URLs
  const PRODUCT_PAGES = [
    { name: 'Smoothies', url: '/smoothies.html' },
    { name: 'Milk Shake', url: '/milkshake.html' },
    { name: 'Frappe', url: '/frappe.html' },
    { name: 'Vegan Shakes', url: '/veganshakes.html' },
    { name: 'Frootfraps', url: '/frootfraps.html' },
    { name: 'Life Juice', url: '/lifejuice.html' },
    { name: 'Frozen Fruits', url: '/frozenfruits.html' },
  ];

  // --- API Helper ---
  const apiHelper = async (options: {
    endpoint: string;
    method: string;
    token: string | null;
    navigate: NavigateFunction;
    body?: any;
    isFormData?: boolean;
    requiresAuth?: boolean;
  }) => {
    const { endpoint, method, token, navigate, body, isFormData = false, requiresAuth = true } = options;

    const headers: Record<string, string> = {};

    if (requiresAuth) {
      if (!token) {
        navigate('/login');
        throw new Error('Authentication required. Please login.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData && body) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401) {
        ['token', 'userToken', 'authToken', 'access_token'].forEach(key => localStorage.removeItem(key));
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }

      if (method === 'DELETE' && response.status === 204) {
        return { success: true };
      }

      const responseData = await response.json().catch(() => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}, and no JSON body.`);
        return {};
      });

      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }

      return responseData;
    } catch (err) {
      console.error(`API request to ${endpoint} failed:`, err);
      throw err;
    }
  };

  // --- Interface Definitions ---
  interface Category {
    _id: string;
    name: string;
  }

  interface Recipe {
    name: string;
    ingredients: string;
    instructions: string;
  }

  interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    category?: string | Category;
    categoryId?: string;
    categoryName?: string;
    stock: number;
    volume?: number;
    sku?: string;
    barcode?: string;
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    images: string[];
    isActive: boolean;
    tags?: string[];
    recipes?: Recipe[];
    createdAt?: string;
    updatedAt?: string;
    selectedPages?: string[];
  }

  interface ProductFormData {
    name: string;
    description: string;
    price: string;
    costPrice: string;
    category: string;
    stock: string;
    volume: string;
    sku: string;
    barcode: string;
    weight: string;
    dimensions: string;
    isActive: boolean;
    tags: string;
    images: string[];
    imageFiles?: File[];
    existingImages?: string[];
    recipes: Recipe[];
    selectedPages: string[];
  }

  // --- ProductImageDisplay Component ---
  const ProductImageDisplay = React.memo(
    ({ product, getImageUrlsForDisplay }: { product: Product; getImageUrlsForDisplay: (images: string[]) => string[] }) => {
      const displayImages = useMemo(
        () => getImageUrlsForDisplay(product.images),
        [product.images, getImageUrlsForDisplay]
      );

      if (displayImages.length === 0) {
        console.log(`No images for product ${product.name}`);
        return (
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-500">No Img</span>
          </div>
        );
      }

      return (
        <div className="relative w-10 h-10">
          <img
            src={displayImages[0]}
            alt={product.name}
            className="w-10 h-10 rounded-md object-cover"
            onError={(e) => {
              console.error(`Failed to load image for product ${product.name}: ${displayImages[0]}`);
              (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
            }}
          />
          {displayImages.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              +{displayImages.length - 1}
            </span>
          )}
        </div>
      );
    },
    (prevProps, nextProps) => {
      return (
        JSON.stringify(prevProps.product.images) === JSON.stringify(nextProps.product.images) &&
        prevProps.getImageUrlsForDisplay === nextProps.getImageUrlsForDisplay
      );
    }
  );

  // --- Main Component ---
  const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialFormData: ProductFormData = useMemo(() => ({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      category: '',
      stock: '',
      volume: '',
      sku: '',
      barcode: '',
      weight: '',
      dimensions: '',
      isActive: true,
      tags: '',
      images: [],
      imageFiles: [],
      existingImages: [],
      recipes: [{ name: '', ingredients: '', instructions: '' }],
      selectedPages: [],
    }), []);

    const [formData, setFormData] = useState<ProductFormData>(initialFormData);

    const getAuthToken = useCallback(() => {
      return localStorage.getItem('token') ||
            localStorage.getItem('userToken') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('access_token');
    }, []);

    const isAuthenticated = useMemo(() => {
      return !!getAuthToken();
    }, [getAuthToken]);

    const getProductId = useCallback((product: Product): string => {
      return product._id || '';
    }, []);

    useEffect(() => {
      if (!isAuthenticated) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        const token = getAuthToken();

        try {
          const [productsData, categoriesData] = await Promise.all([
            apiHelper({ endpoint: '/products', method: 'GET', token, navigate }),
            apiHelper({ endpoint: '/categories', method: 'GET', token, navigate })
          ]);

          let fetchedProducts: Product[] = [];
          if (Array.isArray(productsData.products)) { fetchedProducts = productsData.products; }
          else if (productsData?.products) { fetchedProducts = productsData.products; }
          else if (productsData?.data) { fetchedProducts = productsData.data; }
          else if (Array.isArray(productsData)) { fetchedProducts = productsData; }

          setProducts(fetchedProducts.map(p => ({ ...p, _id: p._id || (p as any).id })));

          let fetchedCategories: Category[] = [];
          if (Array.isArray(categoriesData)) { fetchedCategories = categoriesData; }
          else if (categoriesData?.categories) { fetchedCategories = categoriesData.categories; }
          else if (categoriesData?.data) { fetchedCategories = categoriesData.data; }

          setCategories(fetchedCategories.map(c => ({ ...c, _id: c._id || (c as any).id })));

        } catch (err: any) {
          setError(err.message || 'Failed to fetch initial data.');
          setProducts([]);
          setCategories([]);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }, [isAuthenticated, navigate, getAuthToken]);

    const getProductImageUrl = useCallback((imagePath?: string) => {
      if (!imagePath) {
        console.log('No image path provided, using placeholder');
        return '/images/placeholder-product.jpg';
      }
      if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
        console.log(`Image path is already a URL or data URI: ${imagePath}`);
        return imagePath;
      }
      const constructedUrl = `${API_BASE_URL}/uploads/${imagePath}`;
      console.log(`Constructed image URL: ${constructedUrl} from path: ${imagePath}`);
      return constructedUrl;
    }, []);

    const getImageUrlsForDisplay = useCallback((images: string[]) => images.map(getProductImageUrl), [getProductImageUrl]);

    const getCategoryName = useCallback((category: string | Category | undefined): string => {
      if (!category) return 'N/A';
      if (typeof category === 'string') {
        const foundCategory = categories.find(cat => cat._id === category);
        return foundCategory ? foundCategory.name : 'Uncategorized';
      }
      return category.name;
    }, [categories]);

    const getProductPageNames = useCallback((urls: string[] | undefined): string => {
      if (!urls || urls.length === 0) return 'None';
      const names = urls.map(url => {
        const page = PRODUCT_PAGES.find(p => p.url === url);
        return page ? page.name : url.split('/').pop()?.replace('.html', '').replace(/-/g, ' ') || url;
      });
      return names.join(', ');
    }, []);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      const maxImages = 5;
      const allowedNew = maxImages - imagePreviews.length;
      if (allowedNew <= 0) {
        setError(`You can upload a maximum of ${maxImages} images.`);
        return;
      }
      const selectedFiles = Array.from(files).slice(0, allowedNew);
      const newValidFiles: File[] = [];
      const newLocalPreviews: string[] = [];

      Promise.all(selectedFiles.map(file => new Promise<void>(resolve => {
        if (!file.type.startsWith('image/')) {
          setError('Please select valid image files.');
          return resolve();
        }
        if (file.size > 5 * 1024 * 1024) {
          setError(`Image "${file.name}" exceeds 5MB size limit.`);
          return resolve();
        }
        newValidFiles.push(file);
        const reader = new FileReader();
        reader.onload = e => {
          newLocalPreviews.push(e.target?.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      }))).then(() => {
        if (newValidFiles.length > 0) {
          setImagePreviews(prev => [...prev, ...newLocalPreviews]);
          setFormData(prevData => ({
            ...prevData,
            imageFiles: [...(prevData.imageFiles || []), ...newValidFiles],
            images: [...prevData.images, ...newLocalPreviews],
          }));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
        setError(null);
      });
    }, [imagePreviews.length]);

    const removeImage = useCallback((indexToRemove: number) => {
      const removedPreviewSrc = imagePreviews[indexToRemove];
      setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
      setFormData(prevFormData => {
        const newFormImages = prevFormData.images.filter((_, i) => i !== indexToRemove);
        const newFormImageFiles = prevFormData.imageFiles ? [...prevFormData.imageFiles] : [];
        let newExistingImages = prevFormData.existingImages ? [...prevFormData.existingImages] : [];
        
        if (removedPreviewSrc?.startsWith('data:image')) {
          let dataUrlCounter = 0;
          let fileIndexToRemove = -1;
          for (let i = 0; i < prevFormData.images.length; i++) {
            if (i === indexToRemove) {
              if (prevFormData.images[i].startsWith('data:image')) {
                fileIndexToRemove = dataUrlCounter;
              }
              break;
            }
            if (prevFormData.images[i].startsWith('data:image')) {
              dataUrlCounter++;
            }
          }
          if (fileIndexToRemove !== -1 && newFormImageFiles.length > fileIndexToRemove) {
            newFormImageFiles.splice(fileIndexToRemove, 1);
          }
        } else {
          newExistingImages = newExistingImages.filter(img => img !== removedPreviewSrc);
        }
        
        return {
          ...prevFormData,
          images: newFormImages,
          imageFiles: newFormImageFiles,
          existingImages: newExistingImages,
        };
      });
    }, [imagePreviews]);

    const handleSelectedPagesChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      console.log('Selected pages:', selectedOptions);
      setFormData(prev => ({ ...prev, selectedPages: selectedOptions }));
    }, []);

    const handleRecipeChange = useCallback((index: number, field: keyof Recipe, value: string) => {
      setFormData(prev => {
        const newRecipes = [...prev.recipes];
        newRecipes[index] = { ...newRecipes[index], [field]: value };
        return { ...prev, recipes: newRecipes };
      });
    }, []);

    const addRecipe = useCallback(() => {
      setFormData(prev => ({
        ...prev,
        recipes: [...prev.recipes, { name: '', ingredients: '', instructions: '' }]
      }));
    }, []);

    const removeRecipe = useCallback((index: number) => {
      setFormData(prev => ({
        ...prev,
        recipes: prev.recipes.filter((_, i) => i !== index)
      }));
    }, []);

    const openAddModal = useCallback(() => {
      if (!isAuthenticated) {
        setError("Please login to add products.");
        return;
      }
      setEditingProduct(null);
      setFormData(initialFormData);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setError(null);
      setModalOpen(true);
    }, [initialFormData, isAuthenticated]);

    const openViewModal = useCallback((product: Product) => {
      setViewingProduct(product);
      setViewModalOpen(true);
    }, []);

    const openEditModal = useCallback((product: Product) => {
      if (!isAuthenticated) {
        setError("Please login to edit products.");
        return;
      }
      setEditingProduct(product);
      const currentImageUrls = getImageUrlsForDisplay(product.images || []);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || '',
        category: product.categoryId || (typeof product.category === 'string' ? product.category : product.category?._id) || '',
        stock: product.stock.toString(),
        volume: product.volume?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions ? JSON.stringify(product.dimensions) : '',
        isActive: product.isActive,
        tags: product.tags?.join(',') || '',
        images: currentImageUrls,
        imageFiles: [],
        existingImages: product.images || [],
        recipes: product.recipes?.length ? product.recipes : [{ name: '', ingredients: '', instructions: '' }],
        selectedPages: product.selectedPages || [],
      });
      setImagePreviews(currentImageUrls);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setError(null);
      setModalOpen(true);
    }, [getImageUrlsForDisplay, isAuthenticated]);

    const openDeleteModal = useCallback((product: Product) => {
      if (!isAuthenticated) {
        setError("Please login to delete products.");
        return;
      }
      setProductToDelete(product);
      setError(null);
      setDeleteModalOpen(true);
    }, [isAuthenticated]);

    const columns = useMemo(() => [
      { header: 'Image', accessor: (p: Product) => <ProductImageDisplay product={p} getImageUrlsForDisplay={getImageUrlsForDisplay} /> },
      { header: 'Name', accessor: (p: Product) => p.name, sortable: true },
      { header: 'Price', accessor: (p: Product) => `$${p.price.toFixed(2)}`, sortable: true },
      { header: 'Stock', accessor: (p: Product) => p.stock, sortable: true },
      { header: 'Category', accessor: (p: Product) => p.categoryName || getCategoryName(p.category), sortable: true },
      {
        header: 'Product Pages',
        accessor: (p: Product) => getProductPageNames(p.selectedPages),
        sortable: true,
        sortFunction: (a: Product, b: Product) =>
          (a.selectedPages?.length || 0) - (b.selectedPages?.length || 0),
      },
      {
        header: 'Status',
        accessor: (p: Product) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {p.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        header: 'Actions',
        accessor: (p: Product) => (
          <div className="flex justify-end space-x-2">
            <button onClick={() => openViewModal(p)} className="p-1 text-gray-600 hover:text-gray-800" disabled={submitting} title="View">
              <Eye size={20} />
            </button>
            <button onClick={() => openEditModal(p)} className="p-1 text-blue-600 hover:text-blue-800" disabled={submitting || !isAuthenticated} title={!isAuthenticated ? "Login to edit" : "Edit"}>
              <Edit size={20} />
            </button>
            <button onClick={() => openDeleteModal(p)} className="p-1 text-red-600 hover:text-red-800" disabled={submitting || !isAuthenticated} title={!isAuthenticated ? "Login to delete" : "Delete"}>
              <Trash2 size={20} />
            </button>
          </div>
        ),
        disableSort: true
      },
    ], [getCategoryName, getImageUrlsForDisplay, getProductPageNames, isAuthenticated, submitting, openViewModal, openEditModal, openDeleteModal]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated) { setError("Authentication required. Please login."); return; }
      setSubmitting(true);
      setError(null);

      try {
        if (!formData.name.trim()) throw new Error('Product name is required.');
        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) throw new Error('Valid non-negative price is required.');
        const stock = parseInt(formData.stock);
        if (isNaN(stock) || stock < 0) throw new Error('Valid non-negative stock quantity is required.');
        if (!formData.category) throw new Error('Category is required.');
        if (formData.selectedPages.length === 0) throw new Error('At least one product page must be selected.');

        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('description', formData.description);
        payload.append('price', formData.price);
        payload.append('costPrice', formData.costPrice);
        payload.append('category', formData.category);
        payload.append('stock', formData.stock);
        payload.append('volume', formData.volume);
        payload.append('sku', formData.sku);
        payload.append('barcode', formData.barcode);
        payload.append('weight', formData.weight);
        payload.append('isActive', String(formData.isActive));
        payload.append('tags', formData.tags);
        payload.append('recipes', JSON.stringify(formData.recipes));
        if (formData.selectedPages && formData.selectedPages.length > 0) {
          payload.append('selectedPages', JSON.stringify(formData.selectedPages));
        }

        try {
          if (formData.dimensions.trim()) {
            JSON.parse(formData.dimensions);
            payload.append('dimensions', formData.dimensions);
          } else {
            payload.append('শs', '{}');
          }
        } catch (jsonError) {
          throw new Error('Dimensions must be a valid JSON string (e.g., {"length": 10}) or empty.');
        }

        if (formData.imageFiles && formData.imageFiles.length > 0) {
          formData.imageFiles.forEach(file => payload.append('images', file));
        }

        if (formData.existingImages && formData.existingImages.length > 0) {
          payload.append('existingImages', JSON.stringify(formData.existingImages));
        }

        const token = getAuthToken();
        const endpoint = editingProduct ? `/products/${getProductId(editingProduct)}` : '/products';
        const method = editingProduct ? 'PUT' : 'POST';

        const savedProduct = await apiHelper({
          endpoint,
          method,
          token,
          navigate,
          body: payload,
          isFormData: true
        });

        const actualProductData = savedProduct.product || savedProduct.data || savedProduct;
        if (editingProduct) {
          setProducts(prev => prev.map(p => p._id === getProductId(editingProduct) ? actualProductData : p));
        } else {
          setProducts(prev => [actualProductData, ...prev]);
        }
        setModalOpen(false);
        setImagePreviews(getImageUrlsForDisplay(actualProductData.images || []));

        window.dispatchEvent(new Event('productUpdated'));
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred during submission.');
      } finally {
        setSubmitting(false);
      }
    }, [editingProduct, formData, getProductId, isAuthenticated, navigate, getAuthToken, getImageUrlsForDisplay]);

    const handleDelete = useCallback(async () => {
      if (!productToDelete || !isAuthenticated) { setError("Authentication required or no product selected."); return; }
      setSubmitting(true);
      setError(null);

      try {
        const token = getAuthToken();
        await apiHelper({
          endpoint: `/products/${getProductId(productToDelete)}`,
          method: 'DELETE',
          token,
          navigate,
        });
        setProducts(prev => prev.filter(p => p._id !== getProductId(productToDelete)));
        setDeleteModalOpen(false);
        setProductToDelete(null);

        window.dispatchEvent(new Event('productUpdated'));
      } catch (err: any) {
        setError(err.message || 'Failed to delete product.');
      } finally {
        setSubmitting(false);
      }
    }, [getProductId, isAuthenticated, navigate, productToDelete, getAuthToken]);

    if (loading && !products.length && !categories.length) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-green-500" size={48} />
          <span className="ml-2">Loading products...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your product inventory</p>
          {!isAuthenticated && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                You're viewing in read-only mode. <button
                  onClick={() => navigate('/login')}
                  className="underline font-medium hover:text-yellow-900"
                >
                  Login
                </button> to manage products.
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
                <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{error}</p>
                <button onClick={() => setError(null)} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">Dismiss</button>
              </div>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={products}
          keyField="_id"
          title="Products List"
          onAddNew={isAuthenticated ? openAddModal : undefined}
          addNewLabel="Add New Product"
          searchPlaceholder="Search products by name, category..."
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => !submitting && setModalOpen(false)}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          footer={
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setModalOpen(false)} disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 transition-colors">
                Cancel
              </button>
              <button type="submit" form="product-form" disabled={submitting || !formData.name.trim() || !formData.category.trim() || formData.selectedPages.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center space-x-2">
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
              </button>
            </div>
          }
        >
          <form id="product-form" className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-3" onSubmit={handleSubmit}>
            <fieldset className="space-y-4 p-4 border rounded-md">
              <legend className="text-lg font-medium text-gray-900 px-1">Basic Information</legend>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required disabled={submitting}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="e.g., Organic Apple Juice" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} disabled={submitting}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" rows={3} placeholder="Product description..." />
              </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border rounded-md">
              <legend className="text-lg font-medium text-gray-900 px-1">Product Pages</legend>
              <div>
                <label htmlFor="selectedPages" className="block text-sm font-medium text-gray-700 mb-1">Assign to Product Pages *</label>
                <select
                  id="selectedPages"
                  name="selectedPages"
                  multiple
                  value={formData.selectedPages}
                  onChange={handleSelectedPagesChange}
                  disabled={submitting}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring acetic-500 disabled:opacity-50 sm:text-sm p-2 border h-32"
                >
                  {PRODUCT_PAGES.map(page => (
                    <option key={page.url} value={page.url}>
                      {page.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple pages. Select each page individually.
                </p>
              </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border rounded-md">
              <legend className="text-lg font-medium text-gray-900 px-1">Recipes</legend>
              {formData.recipes.map((recipe, index) => (
                <div key={index} className="space-y-3 p-3 border rounded-md relative">
                  <button
                    type="button"
                    onClick={() => removeRecipe(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    disabled={submitting || formData.recipes.length === 1}
                    title="Remove recipe"
                  >
                    <X size={16} />
                  </button>
                  <div>
                    <label htmlFor={`recipe-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
                    <input
                      type="text"
                      id={`recipe-name-${index}`}
                      value={recipe.name}
                      onChange={(e) => handleRecipeChange(index, 'name', e.target.value)}
                      disabled={submitting}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border"
                      placeholder="e.g., Classic Smoothie"
                    />
                  </div>
                  <div>
                    <label htmlFor={`recipe-ingredients-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                    <textarea
                      id={`recipe-ingredients-${index}`}
                      value={recipe.ingredients}
                      onChange={(e) => handleRecipeChange(index, 'ingredients', e.target.value)}
                      disabled={submitting}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border"
                      rows={3}
                      placeholder="e.g., 1 banana, 1 cup milk, 1 tbsp honey"
                    />
                  </div>
                  <div>
                    <label htmlFor={`recipe-instructions-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea
                      id={`recipe-instructions-${index}`}
                      value={recipe.instructions}
                      onChange={(e) => handleRecipeChange(index, 'instructions', e.target.value)}
                      disabled={submitting}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border"
                      rows={3}
                      placeholder="e.g., Blend all ingredients until smooth."
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addRecipe}
                disabled={submitting}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60"
              >
                Add Recipe
              </button>
            </fieldset>

            <fieldset className="space-y-4 p-4 border rounded-md">
              <legend className="text-lg font-medium text-gray-900 px-1">Product Images</legend>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={preview + '-' + index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded-md border border-gray-300" onError={(e) => {
                        console.error(`Failed to load preview image ${index + 1}: ${preview}`);
                        (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
                      }} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={submitting} title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imagePreviews.length < 5 && (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                        <span>Upload files</span>
                        <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileSelect} disabled={submitting || imagePreviews.length >= 5} ref={fileInputRef} multiple/>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB each. Max {5 - imagePreviews.length} more.</p>
                  </div>
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-4 p-4 border rounded-md">
              <legend className="text-lg font-medium text-gray-900 px-1">Pricing & Inventory</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <label htmlFor="price" className="flex items-center text-sm font-medium text-gray-700 mb-1"><DollarSign size={16} className="mr-1.5 text-gray-500" /> Selling Price *</label>
                  <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="0.00" />
                </div>
                <div>
                  <label htmlFor="costPrice" className="flex items-center text-sm font-medium text-gray-700 mb-1"><DollarSign size={16} className="mr-1.5 text-gray-500" /> Cost Price</label>
                  <input type="number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleInputChange} min="0" step="0.01" disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="0.00" />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" step="1" disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="0" />
                </div>
                <div>
                  <label htmlFor="volume" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Droplet size={16} className="mr-1.5 text-gray-500" /> Volume (Liters)</label>
                  <input type="number" id="volume" name="volume" value={formData.volume} onChange={handleInputChange} min="0" step="0.01" disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="e.g., 0.5" />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border rounded-md">
              <legend className="text-lg font-medium text-gray-900 px-1">Additional Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required disabled={submitting || categories.length === 0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border bg-white disabled:bg-gray-50">
                    <option value="">{categories.length === 0 ? "No categories available" : "Select a category"}</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select id="isActive" name="isActive" value={String(formData.isActive)} onChange={(e) => setFormData({...formData, isActive: e.target.value === "true"})} disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border bg-white">
                    <option value="true">Active (Available for sale)</option>
                    <option value="false">Inactive (Not available)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleInputChange} disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="SKU-12345" />
                </div>
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input type="text" id="barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="123456789012" />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleInputChange} min="0" step="0.01" disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="0.5" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2.5 border" placeholder="organic,juice,healthy (comma separated)" />
                </div>
              </div>
            </fieldset>
          </form>
        </Modal>

        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={viewingProduct?.name || "Product Details"}
          footer={
            <div className="flex justify-end">
              <button type="button" onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          }
        >
          {viewingProduct && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-3">
              {getImageUrlsForDisplay(viewingProduct.images).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getImageUrlsForDisplay(viewingProduct.images).map((image, index) => (
                    <div key={index} className="aspect-w-1 aspect-h-1">
                      <img src={image} alt={`${viewingProduct.name} ${index + 1}`} className="w-full h-full rounded-md object-cover border border-gray-200" onError={(e) => {
                        console.error(`Failed to load view modal image ${index + 1} for ${viewingProduct.name}: ${image}`);
                        (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
                      }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-45 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">No images available</div>
              )}
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingProduct.name}</h3>
                  <p className="text-sm text-gray-500">{getCategoryName(viewingProduct.category)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="font-medium text-gray-500">Price:</div><div>${viewingProduct.price.toFixed(2)}</div>
                  <div className="font-medium text-gray-500">Stock:</div><div>{viewingProduct.stock} units</div>
                  <div className="font-medium text-gray-500">Product Pages:</div><div>{getProductPageNames(viewingProduct.selectedPages)}</div>
                  {viewingProduct.costPrice != null && (<><div className="font-medium text-gray-500">Cost Price:</div><div>${viewingProduct.costPrice.toFixed(2)}</div></>)}
                  {viewingProduct.volume != null && (<><div className="font-medium text-gray-500">Volume:</div><div>{viewingProduct.volume} L</div></>)}
                  <div className="font-medium text-gray-500">Status:</div>
                  <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${viewingProduct.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {viewingProduct.isActive ? 'Active' : 'Inactive'}
                      </span>
                  </div>
                  {viewingProduct.sku && (<><div className="font-medium text-gray-500">SKU:</div><div>{viewingProduct.sku}</div></>)}
                  {viewingProduct.barcode && (<><div className="font-medium text-gray-500">Barcode:</div><div>{viewingProduct.barcode}</div></>)}
                  {viewingProduct.weight != null && (<><div className="font-medium text-gray-500">Weight:</div><div>{viewingProduct.weight} kg</div></>)}
                  {viewingProduct.dimensions && (Object.keys(viewingProduct.dimensions).length > 0) && (
                    <>
                      <div className="font-medium text-gray-500">Dimensions:</div>
                      <div>
                        {viewingProduct.dimensions.length || 'N/A'}L × {viewingProduct.dimensions.width || 'N/A'}W × {viewingProduct.dimensions.height || 'N/A'}H cm
                      </div>
                    </>
                  )}
                  {viewingProduct.createdAt && (<><div className="font-medium text-gray-500">Created:</div><div>{new Date(viewingProduct.createdAt).toLocaleDateString()}</div></>)}
                  {viewingProduct.updatedAt && (<><div className="font-medium text-gray-500">Last Updated:</div><div>{new Date(viewingProduct.updatedAt).toLocaleDateString()}</div></>)}
                </div>

                {viewingProduct.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description:</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{viewingProduct.description}</p>
                  </div>
                )}

                {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tags:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingProduct.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingProduct.recipes && viewingProduct.recipes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recipes:</p>
                    <div className="space-y-4 mt-1">
                      {viewingProduct.recipes.map((recipe, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <h4 className="text-sm font-semibold text-gray-900">{recipe.name || `Recipe ${index + 1}`}</h4>
                          <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Ingredients:</span> {recipe.ingredients || 'N/A'}</p>
                          <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Instructions:</span> {recipe.instructions || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => !submitting && setDeleteModalOpen(false)}
          title="Confirm Deletion"
          footer={
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center space-x-2">
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                <span>Delete Product</span>
              </button>
            </div>
          }
        >
          <div className="text-center sm:text-left">
            <div className="sm:flex sm-items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete "{productToDelete?.name}"?
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  export default ProductsPage;