import React, { useState } from 'react';
import { Edit, Trash2, Eye, EyeOff, Calendar, Plus, Minus } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Banner } from '../types';
import { banners as initialBanners } from '../data/mockData';

interface BannerImage {
  id: string;
  url: string;
  type: 'home-slider' | 'inner-page';
}

interface Ingredient {
  id: string;
  name: string;
}

const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    startDate: '',
    endDate: '',
    bannerImages: [] as BannerImage[],
    ingredients: [] as Ingredient[],
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageType, setNewImageType] = useState<'home-slider' | 'inner-page'>('home-slider');
  const [newIngredientName, setNewIngredientName] = useState('');

  const columns = [
    { 
      header: 'Banner', 
      accessor: (banner: Banner) => (
        <div className="flex items-center">
          <img 
            src={banner.imageUrl} 
            alt={banner.title} 
            className="h-10 w-16 object-cover rounded"
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {banner.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { 
      header: 'Duration', 
      accessor: (banner: Banner) => (
        <div className="text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
  ];

  const openAddModal = () => {
    setEditingBanner(null);
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    setFormData({
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
      startDate: today.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      bannerImages: [],
      ingredients: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      isActive: banner.isActive,
      startDate: new Date(banner.startDate).toISOString().split('T')[0],
      endDate: new Date(banner.endDate).toISOString().split('T')[0],
      bannerImages: banner.bannerImages || [],
      ingredients: banner.ingredients || [],
    });
    setModalOpen(true);
  };

  const openDeleteModal = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteModalOpen(true);
  };

  const openPreviewModal = (banner: Banner) => {
    setPreviewBanner(banner);
    setPreviewModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const addBannerImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        bannerImages: [
          ...formData.bannerImages,
          {
            id: Date.now().toString(),
            url: newImageUrl,
            type: newImageType,
          },
        ],
      });
      setNewImageUrl('');
    }
  };

  const removeBannerImage = (id: string) => {
    setFormData({
      ...formData,
      bannerImages: formData.bannerImages.filter(img => img.id !== id),
    });
  };

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredientName.trim()) {
      setFormData({
        ...formData,
        ingredients: [
          ...formData.ingredients,
          {
            id: Date.now().toString(),
            name: newIngredientName,
          },
        ],
      });
      setNewIngredientName('');
    }
  };

  const removeIngredient = (id: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.id !== id),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      ...formData,
      isActive: formData.isActive,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      bannerImages: formData.bannerImages,
      ingredients: formData.ingredients,
    };
    
    if (editingBanner) {
      // Update existing banner
      setBanners(banners.map(banner => 
        banner.id === editingBanner.id ? { ...bannerData, id: banner.id } : banner
      ));
    } else {
      // Add new banner
      const newBanner: Banner = {
        ...bannerData,
        id: Date.now().toString(),
      };
      setBanners([...banners, newBanner]);
    }
    
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (bannerToDelete) {
      setBanners(banners.filter(banner => banner.id !== bannerToDelete.id));
      setDeleteModalOpen(false);
      setBannerToDelete(null);
    }
  };

  const toggleBannerStatus = (banner: Banner) => {
    setBanners(banners.map(b => 
      b.id === banner.id ? { ...b, isActive: !b.isActive } : b
    ));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
        <p className="text-gray-600">Manage promotional banners for your store</p>
      </div>
      
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
      
      {/* Add/Edit Banner Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Add New Banner'}
        size="xl"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              {editingBanner ? 'Update' : 'Add'}
            </button>
          </div>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Banner Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Main Banner Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              placeholder="https://example.com/image.jpg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Preview:</p>
                <div className="mt-1 relative h-32 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={formData.imageUrl} 
                    alt="Banner preview" 
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">
              Link URL
            </label>
            <input
              type="url"
              id="linkUrl"
              name="linkUrl"
              value={formData.linkUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/promo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          {/* Additional Banner Images Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Banner Images</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label htmlFor="newImageUrl" className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="newImageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="newImageType" className="block text-sm font-medium text-gray-700">
                    Image Type
                  </label>
                  <select
                    id="newImageType"
                    value={newImageType}
                    onChange={(e) => setNewImageType(e.target.value as 'home-slider' | 'inner-page')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="home-slider">Home Slider</option>
                    <option value="inner-page">Inner Page</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={addBannerImage}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Image
              </button>
              
              {formData.bannerImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Added Images:</h4>
                  <ul className="space-y-2">
                    {formData.bannerImages.map((image) => (
                      <li key={image.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <img 
                            src={image.url} 
                            alt={`Banner ${image.type}`} 
                            className="h-10 w-16 object-cover rounded mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x40?text=Invalid+URL';
                            }}
                          />
                          <div>
                            <span className="text-sm font-medium capitalize">{image.type.replace('-', ' ')}</span>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{image.url}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBannerImage(image.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove image"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Ingredients Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Ingredients</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="ingredientName" className="block text-sm font-medium text-gray-700">
                    Ingredient Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="ingredientName"
                      value={newIngredientName}
                      onChange={(e) => setNewIngredientName(e.target.value)}
                      placeholder="e.g., Flour"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="mt-1 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              {formData.ingredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Ingredients:</h4>
                  <ul className="divide-y divide-gray-200">
                    {formData.ingredients.map((ingredient) => (
                      <li key={ingredient.id} className="py-2 flex justify-between">
                        <span className="font-medium">{ingredient.name}</span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove ingredient"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
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
      
      {/* Preview Modal */}
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
                src={previewBanner.imageUrl} 
                alt={previewBanner.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white">{previewBanner.title}</h3>
                <p className="text-white/90 mt-1">{previewBanner.description}</p>
                {previewBanner.linkUrl && (
                  <div className="mt-4">
                    <a 
                      href={previewBanner.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Learn More
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Images Preview */}
            {previewBanner.bannerImages && previewBanner.bannerImages.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewBanner.bannerImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Banner ${image.type}`}
                        className="h-32 w-full object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm capitalize">{image.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Ingredients Preview */}
            {previewBanner.ingredients && previewBanner.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Ingredients</h3>
                <ul className="divide-y divide-gray-200">
                  {previewBanner.ingredients.map((ingredient, index) => (
                    <li key={index} className="py-2">
                      <span className="font-medium">{ingredient.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      previewBanner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {previewBanner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Link URL</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {previewBanner.linkUrl ? (
                      <a 
                        href={previewBanner.linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {previewBanner.linkUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">No link set</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(previewBanner.startDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(previewBanner.endDate).toLocaleDateString()}
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