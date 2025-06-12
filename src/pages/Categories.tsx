import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, AlertCircle, Loader, Upload, X } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

// Define available product pages with unique URLs
const PRODUCT_PAGES = [
  { name: 'Smoothies', url: '/smoothies.html' },
  { name: 'Milk Shake', url: '/milkshake.html' },
  { name: 'Frappe', url: '/frappe.html' },
  { name: 'Vegan Shakes', url: '/veganshakes.html' }, // Corrected URL
  { name: 'Frootfraps', url: '/frootfraps.html' },
  { name: 'Life Juice', url: '/lifejuice.html' },
  { name: 'Frozen Fruits', url: '/frozenfruits.html' }
];

interface Category {
  id: string;
  _id?: string;
  name: string;
  description: string;
  image?: string;
  isActive?: boolean;
  smoothieCount?: number;
  createdAt?: string;
  updatedAt?: string;
  selectedPages?: string[];
}

interface CategoryFormData {
  id: string;
  name: string;
  description: string;
  smoothieCount: number;
  image: string;
  isActive: boolean;
  imageFile?: File | null;
  selectedPages: string[];
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    id: '',
    name: '',
    description: '',
    smoothieCount: 0,
    image: '',
    isActive: true,
    imageFile: null,
    selectedPages: []
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get image URL
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('data:image') || imagePath.startsWith('http')) return imagePath;
    const normalizedPath = imagePath.replace(/\\/g, '/').replace(/^\/?uploads\//, '');
    return `${API_BASE_URL}/uploads/${normalizedPath}`;
  };

  // Helper to get product page names from URLs
  const getProductPageNames = (urls: string[] | undefined): string => {
    if (!urls || urls.length === 0) return 'None';
    const names = urls.map(url => {
      const page = PRODUCT_PAGES.find(p => p.url === url);
      return page ? page.name : url.split('/').pop()?.replace('.html', '').replace(/-/g, ' ') || url;
    });
    return names.join(', ');
  };

  const CategoryImage: React.FC<{ category: Category }> = ({ category }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageUrl = getImageUrl(category.image);

    return (
      <div className="relative w-10 h-10">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
          </div>
        )}
        <img
          src={imageError ? '/placeholder-image.jpg' : imageUrl}
          alt={category.name}
          className={`w-10 h-10 rounded-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('userToken') || 
           localStorage.getItem('authToken') ||
           localStorage.getItem('access_token');
  };

  const isAuthenticated = () => !!getAuthToken();

  const redirectToLogin = () => navigate('/login');

  const getCategoryId = (category: Category): string => category.id || category._id || '';

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
        localStorage.removeItem('token');
        localStorage.removeItem('userToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await makeApiRequest('/categories', 'GET', undefined, false, false);
      const normalizedCategories = data.map((category: any) => ({
        ...category,
        id: category.id || category._id,
      }));
      setCategories(normalizedCategories);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { imageFile?: File | null }) => {
    if (!isAuthenticated()) {
      redirectToLogin();
      throw new Error('Authentication required to create categories.');
    }
    const formData = new FormData();
    formData.append('name', categoryData.name.trim());
    formData.append('description', categoryData.description?.trim() || '');
    formData.append('isActive', String(categoryData.isActive !== false));
    if (categoryData.selectedPages && categoryData.selectedPages.length > 0) {
      formData.append('selectedPages', JSON.stringify(categoryData.selectedPages));
    }
    if (categoryData.imageFile) formData.append('image', categoryData.imageFile);
    return makeApiRequest('/categories', 'POST', formData, true, true);
  };

  const updateCategory = async (id: string, categoryData: Partial<Category> & { imageFile?: File | null }) => {
    if (!isAuthenticated()) {
      redirectToLogin();
      throw new Error('Authentication required to update categories.');
    }
    const formData = new FormData();
    if (categoryData.name) formData.append('name', categoryData.name.trim());
    if (categoryData.description !== undefined) formData.append('description', categoryData.description.trim());
    formData.append('isActive', String(categoryData.isActive !== false));
    if (categoryData.selectedPages !== undefined) {
      formData.append('selectedPages', JSON.stringify(categoryData.selectedPages));
    }
    if (categoryData.imageFile) formData.append('image', categoryData.imageFile);
    else if (categoryData.image === '') formData.append('removeImage', 'true');
    return makeApiRequest(`/categories/${id}`, 'PUT', formData, true, true);
  };

  const deleteCategoryAPI = async (id: string) => {
    if (!isAuthenticated()) {
      redirectToLogin();
      throw new Error('Authentication required to delete categories.');
    }
    return makeApiRequest(`/categories/${id}`, 'DELETE', undefined, false, true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }
    setFormData(prev => ({ ...prev, imageFile: file, image: '' }));
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, image: '' }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectedPagesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, selectedPages: selectedOptions }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns = [
    {
      header: 'Image',
      accessor: (category: Category) => <CategoryImage category={category} />,
    },
    { 
      header: 'Name', 
      accessor: (category: Category) => category.name, 
      sortable: true 
    },
    { 
      header: 'Description', 
      accessor: (category: Category) => category.description || '—',
      className: 'max-w-xs truncate'
    },
    {
      header: 'Product Pages',
      accessor: (category: Category) => getProductPageNames(category.selectedPages),
      sortable: true,
      sortFunction: (a: Category, b: Category) => 
        (a.selectedPages?.length || 0) - (b.selectedPages?.length || 0)
    },
    {
      header: 'Status',
      accessor: (category: Category) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          category.isActive !== false 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {category.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (category: Category) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => openEditModal(category)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            disabled={submitting || !isAuthenticated()}
            aria-label={`Edit ${category.name}`}
            title={!isAuthenticated() ? 'Login required' : ''}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => openDeleteModal(category)}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            disabled={submitting || !isAuthenticated()}
            aria-label={`Delete ${category.name}`}
            title={!isAuthenticated() ? 'Login required' : ''}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
      disableSort: true
    },
  ];

  const openAddModal = () => {
    if (!isAuthenticated()) {
      setError('Please login to add categories');
      return;
    }
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      smoothieCount: 0,
      image: '',
      isActive: true,
      imageFile: null,
      selectedPages: []
    });
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    if (!isAuthenticated()) {
      setError('Please login to edit categories');
      return;
    }
    setEditingCategory(category);
    setFormData({
      id: getCategoryId(category),
      name: category.name,
      description: category.description || '',
      smoothieCount: category.smoothieCount || 0,
      image: category.image || '',
      isActive: category.isActive !== false,
      imageFile: null,
      selectedPages: category.selectedPages || []
    });
    setImagePreview(category.image ? getImageUrl(category.image) : null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    if (!isAuthenticated()) {
      setError('Please login to delete categories');
      return;
    }
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;
    if (type === 'number') processedValue = parseInt(value) || 0;
    else if (type === 'checkbox') processedValue = (e.target as HTMLInputElement).checked;
    else if (name === 'isActive') processedValue = value === 'true';
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }
    if (formData.selectedPages.length === 0) {
      setError('At least one product page must be selected');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        const categoryId = getCategoryId(editingCategory);
        if (!categoryId) throw new Error('Category ID is missing');
        await updateCategory(categoryId, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          imageFile: formData.imageFile,
          image: formData.image,
          selectedPages: formData.selectedPages
        });
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          imageFile: formData.imageFile,
          selectedPages: formData.selectedPages
        });
      }
      await fetchCategories();
      setModalOpen(false);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) {
      setError('No category selected for deletion');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const categoryId = getCategoryId(categoryToDelete);
      if (!categoryId) throw new Error('Category ID is missing');
      await deleteCategoryAPI(categoryId);
      await fetchCategories();
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-600">Organize smoothies into categories and assign them to product pages</p>
        {!isAuthenticated() && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              You're viewing in read-only mode. <button 
                onClick={redirectToLogin}
                className="underline font-medium hover:text-yellow-900"
              >
                Login
              </button> to add, edit, or delete categories.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
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

      <DataTable
        columns={columns}
        data={categories}
        keyField="id"
        title="Categories"
        onAddNew={isAuthenticated() ? openAddModal : undefined}
        addNewLabel="Add Category"
        searchPlaceholder="Search categories..."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        footer={
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={submitting || !formData.name.trim() || formData.selectedPages.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {submitting && <Loader className="h-4 w-4 animate-spin" />}
              <span>{editingCategory ? 'Update' : 'Add'}</span>
            </button>
          </div>
        }
      >
        <form id="category-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-50 sm:text-sm p-2 border"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-50 sm:text-sm p-2 border"
              placeholder="Enter category description"
            />
          </div>

          <div>
            <label htmlFor="selectedPages" className="block text-sm font-medium text-gray-700 mb-1">
              Product Pages *
            </label>
            <select
              id="selectedPages"
              name="selectedPages"
              multiple
              value={formData.selectedPages}
              onChange={handleSelectedPagesChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-50 sm:text-sm p-2 border h-32"
            >
              {PRODUCT_PAGES.map(page => (
                <option key={page.url} value={page.url}>
                  {page.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple pages. Each page is distinct.
            </p>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Category Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (max. 5MB)</p>
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={submitting}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              </div>
              {imagePreview && (
                <div className="relative w-20 h-20">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={submitting}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={submitting}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !submitting && setDeleteModalOpen(false)}
        title="Delete Category"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {submitting && <Loader className="h-4 w-4 animate-spin" />}
              <span>Delete</span>
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the category <span className="font-semibold">{categoryToDelete?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Categories;