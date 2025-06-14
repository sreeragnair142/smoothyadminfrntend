import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, EyeOff, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Banner } from '../types';

// Define API_URL with a fallback to localhost for development
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = import.meta.env.VITE_REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    image: '',
    isActive: true,
    bannerImages: [] as { id: string; file: File | null; url: string; type: 'home-slider' | 'inner-page' }[],
    ingredients: [] as { id: string; name: string; type: 'primary' | 'secondary' }[],
    imageFile: null as File | null,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [newBannerImageFile, setNewBannerImageFile] = useState<File | null>(null);
  const [newBannerImageType, setNewBannerImageType] = useState<'home-slider' | 'inner-page'>('home-slider');
  const [newIngredient, setNewIngredient] = useState({ name: '', type: 'primary' as 'primary' | 'secondary' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIngredientTab, setActiveIngredientTab] = useState<'primary' | 'secondary' | 'all'>('all');
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/banners/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      if (response.data && Array.isArray(response.data)) {
        setBanners(response.data);
      } else {
        setErrorMessage('Invalid banner data received.');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setErrorMessage('Failed to fetch banners. Please try again.');
    }
  };

  const columns = [
    {
      header: 'Banner',
      accessor: (banner: Banner) => (
        <div className="flex items-center">
          <img
            src={`${IMAGE_BASE_URL}${banner.image}`}
            alt={banner.title}
            className="h-10 w-16 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/64x40?text=Invalid+URL';
            }}
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">{banner.title}</div>
            <div className="text-xs text-gray-500 truncate max-w-xs">{banner.description}</div>
            <div className="text-xs text-blue-500 mt-1">
              {banner.bannerImages?.length || 0} additional images
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (banner: Banner) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {banner.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      id: '',
      title: '',
      description: '',
      image: '',
      isActive: true,
      bannerImages: [],
      ingredients: [],
      imageFile: null,
    });
    setNewIngredient({ name: '', type: 'primary' });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      id: banner.id,
      title: banner.title,
      description: banner.description || '',
      image: banner.image,
      isActive: banner.isActive,
      bannerImages: banner.bannerImages?.map((img) => ({
        id: Date.now().toString() + img.url,
        file: null,
        url: img.url,
        type: img.type,
      })) || [],
      ingredients: banner.ingredients?.map((ing, _) => ({
        id: Date.now().toString() + _,
        name: ing.name,
        type: ing.type as 'primary' | 'secondary',
      })) || [],
      imageFile: null,
    });
    setNewIngredient({ name: '', type: 'primary' });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openDeleteModal = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteModalOpen(true);
  };

  const openPreviewModal = (banner: Banner) => {
    setPreviewBanner(banner);
    setActiveIngredientTab('all');
    setCurrentIngredientIndex(0);
    setPreviewModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imageFile'
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds 5MB limit.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
      }
    }
    setErrorMessage(null);
    setFormData({
      ...formData,
      [field]: file,
      ...(field === 'imageFile' && file ? { image: URL.createObjectURL(file) } : {}),
    });
  };

  const handleBannerImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds 5MB limit.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
      }
      setNewBannerImageFile(file);
    }
  };

  const addBannerImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBannerImageFile) {
      setFormData({
        ...formData,
        bannerImages: [
          ...formData.bannerImages,
          {
            id: Date.now().toString(),
            file: newBannerImageFile,
            url: URL.createObjectURL(newBannerImageFile),
            type: newBannerImageType,
          },
        ],
      });
      setNewBannerImageFile(null);
      (document.getElementById('newBannerImageFile') as HTMLInputElement).value = '';
    }
  };

  const removeBannerImage = (id: string) => {
    setFormData({
      ...formData,
      bannerImages: formData.bannerImages.filter((img) => img.id !== id),
    });
  };

  const handleIngredientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: 'name' | 'type'
  ) => {
    setNewIngredient({
      ...newIngredient,
      [field]: e.target.value,
    });
  };

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.name.trim()) {
      setFormData({
        ...formData,
        ingredients: [
          ...formData.ingredients,
          {
            id: Date.now().toString(),
            name: newIngredient.name.trim(),
            type: newIngredient.type,
          },
        ],
      });
      setNewIngredient({ name: '', type: 'primary' });
      (document.getElementById('ingredientName') as HTMLInputElement).value = '';
    } else {
      setErrorMessage('Ingredient name cannot be empty.');
    }
  };

  const removeIngredient = (id: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((ing) => ing.id !== id),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('isActive', String(formData.isActive));
    formDataToSend.append('ingredients', JSON.stringify(formData.ingredients.map(ing => ({
      name: ing.name,
      type: ing.type,
    }))));

    if (formData.imageFile) {
      formDataToSend.append('image', formData.imageFile);
    }
    formData.bannerImages.forEach((img, _) => {
      if (img.file) {
        formDataToSend.append('bannerImages', img.file);
        formDataToSend.append('bannerImageTypes', img.type);
      }
    });

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingBanner) {
        const response = await axios.put(
          `${API_URL}/banners/${editingBanner.id}`,
          formDataToSend,
          config
        );
        setBanners(
          banners.map((banner) =>
            banner.id === editingBanner.id ? response.data : banner
          )
        );
      } else {
        const response = await axios.post(`${API_URL}/banners`, formDataToSend, config);
        setBanners([...banners, response.data]);
      }
      setModalOpen(false);
    } catch (error: any) {
      console.error('Error saving banner:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save banner. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (bannerToDelete) {
      try {
        await axios.delete(`${API_URL}/banners/${bannerToDelete.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        });
        setBanners(banners.filter((banner) => banner.id !== bannerToDelete.id));
        setDeleteModalOpen(false);
        setBannerToDelete(null);
      } catch (error) {
        console.error('Error deleting banner:', error);
        setErrorMessage('Failed to delete banner. Please try again.');
      }
    }
  };

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      const response = await axios.put(
        `${API_URL}/banners/${banner.id}`,
        { isActive: !banner.isActive },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        }
      );
      setBanners(
        banners.map((b) => (b.id === banner.id ? response.data : b))
      );
    } catch (error) {
      console.error('Error toggling banner status:', error);
      setErrorMessage('Failed to toggle banner status. Please try again.');
    }
  };

  const handleNextIngredient = () => {
    if (previewBanner && previewBanner.ingredients) {
      const filteredIngredients = previewBanner.ingredients.filter(
        (ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab
      );
      setCurrentIngredientIndex((prevIndex) =>
        prevIndex < filteredIngredients.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  const handlePrevIngredient = () => {
    if (previewBanner && previewBanner.ingredients) {
      const filteredIngredients = previewBanner.ingredients.filter(
        (ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab
      );
      setCurrentIngredientIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : filteredIngredients.length - 1
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
        <p className="text-gray-600">Manage promotional banners for your store</p>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={banners}
        keyField="id"
        title="Banners"
        onAddNew={openAddModal}
        addNewLabel="Add Banner"
        searchPlaceholder="Search banners..."
        actions={(banner) => (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => openPreviewModal(banner)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Preview"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleBannerStatus(banner)}
              className={`p-1 ${banner.isActive ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
              title={banner.isActive ? 'Deactivate' : 'Activate'}
            >
              {banner.isActive ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <button
              onClick={() => openEditModal(banner)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => openDeleteModal(banner)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Add New Banner'}
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {editingBanner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter banner title"
                />
              </div>
              <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="isActive"
                  name="isActive"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Describe your banner..."
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Main Banner Image
                </label>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => handleFileChange(e, 'imageFile')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.image && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <div className="relative h-40 rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={formData.image.startsWith('blob:') ? formData.image : `${IMAGE_BASE_URL}${formData.image}`}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Banner Images */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Additional Banner Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="newBannerImageFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Image
                  </label>
                  <input
                    type="file"
                    id="newBannerImageFile"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleBannerImageFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="newBannerImageType" className="block text-sm font-medium text-gray-700 mb-1">
                    Image Type
                  </label>
                  <select
                    id="newBannerImageType"
                    value={newBannerImageType}
                    onChange={(e) => setNewBannerImageType(e.target.value as 'home-slider' | 'inner-page')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="home-slider">Home Slider</option>
                    <option value="inner-page">Inner Page</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={addBannerImage}
                disabled={!newBannerImageFile}
                className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Image
              </button>

              {formData.bannerImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Images:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.bannerImages.map((image, _) => (
                      <div key={image.id} className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
                        <img
                          src={image.url}
                          alt={`Banner ${image.type}`}
                          className="h-12 w-16 object-cover rounded mr-3"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/64x40?text=Invalid+URL';
                          }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium capitalize">{image.type.replace('-', ' ')}</span>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{image.file?.name || image.url}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBannerImage(image.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove image"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="ingredientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  id="ingredientName"
                  value={newIngredient.name}
                  onChange={(e) => handleIngredientChange(e, 'name')}
                  placeholder="e.g., Blueberry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="ingredientType" className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient Type
                </label>
                <select
                  id="ingredientType"
                  value={newIngredient.type}
                  onChange={(e) => handleIngredientChange(e, 'type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={addIngredient}
              disabled={!newIngredient.name.trim()}
              className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Ingredient
            </button>

            {formData.ingredients.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Added Ingredients:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.ingredients.map((ingredient, _) => (
                    <div key={ingredient.id} className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <span className="text-sm font-medium capitalize">{ingredient.type}</span>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{ingredient.name}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove ingredient"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Banner"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the banner "{bannerToDelete?.title}"? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Banner Preview"
        size="xl"
      >
        {previewBanner && (
          <div className="space-y-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <img
                src={`${IMAGE_BASE_URL}${previewBanner.image}`}
                alt={previewBanner.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white">{previewBanner.title}</h3>
                <p className="text-white/90 mt-1">{previewBanner.description}</p>
              </div>
            </div>

            {previewBanner.bannerImages && previewBanner.bannerImages.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewBanner.bannerImages.map((image, _) => (
                    <div key={image.url} className="relative group">
                      <img
                        src={`${IMAGE_BASE_URL}${image.url}`}
                        alt={`Banner ${image.type}`}
                        className="h-32 w-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/128x128?text=Invalid+Image+URL';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm capitalize">{image.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewBanner.ingredients && previewBanner.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Ingredients</h3>
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    className={`px-4 py-2 text-sm font-medium ${activeIngredientTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveIngredientTab('all')}
                  >
                    All Ingredients
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${activeIngredientTab === 'primary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveIngredientTab('primary')}
                  >
                    Primary Ingredients
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${activeIngredientTab === 'secondary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveIngredientTab('secondary')}
                  >
                    Secondary Ingredients
                  </button>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevIngredient}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={previewBanner.ingredients.filter(
                        (ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab
                      ).length <= 1}
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex-1 mx-4">
                      {previewBanner.ingredients
                        .filter((ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab)
                        .map((ingredient, _) => (
                          <div
                            key={ingredient.name}
                            className={`transition-opacity duration-300 ${_ === currentIngredientIndex ? 'opacity-100' : 'opacity-0 hidden'}`}
                          >
                            <div className="p-4 bg-gray-50 rounded-lg shadow-sm text-center">
                              <span className="text-sm font-medium capitalize">{ingredient.type}</span>
                              <div className="text-lg font-semibold text-gray-900 mt-1">{ingredient.name}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={handleNextIngredient}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={previewBanner.ingredients.filter(
                        (ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab
                      ).length <= 1}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  {previewBanner.ingredients.filter(
                    (ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab
                  ).length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {previewBanner.ingredients
                        .filter((ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab)
                        .map((_, index) => (
                          <button
                            key={index}
                            className={`h-2 w-2 rounded-full ${index === currentIngredientIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                            onClick={() => setCurrentIngredientIndex(index)}
                          />
                        ))}
                    </div>
                  )}
                </div>
                {previewBanner.ingredients.filter(
                  (ingredient) => activeIngredientTab === 'all' || ingredient.type === activeIngredientTab
                ).length === 0 && (
                  <div className="text-sm text-gray-500 text-center">
                    No {activeIngredientTab === 'all' ? '' : activeIngredientTab} ingredients available.
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${previewBanner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {previewBanner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Banners;